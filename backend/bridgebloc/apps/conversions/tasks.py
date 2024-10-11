import logging

from eth_account import Account
from eth_utils.conversions import to_bytes
from huey import crontab
from huey.contrib.djhuey import db_periodic_task, lock_task
from web3.types import TxParams

from django.conf import settings
from django.db import transaction

from bridgebloc.apps.tokens.models import Token
from bridgebloc.evm.aggregator import EVMAggregator

from .enums import CCTPConversionStepType, TokenConversionStepStatus
from .models import TokenConversionStep
from .types import ConversionMethod
from .utils import get_attestation_client, get_cross_chain_bridge_deployment_address

logger = logging.getLogger(__name__)


@db_periodic_task(crontab(minute='*/2'))
@lock_task('check-for-cctp-attestation-confirmation-lock')
def check_for_cctp_attestation_confirmation() -> None:
    steps_waiting_for_attestation_confirmation = TokenConversionStep.objects.select_related('conversion').filter(
        status=TokenConversionStepStatus.PENDING,
        conversion__conversion_type=ConversionMethod.CCTP,
        step_type=CCTPConversionStepType.ATTESTATION_SERVICE_CONFIRMATION,
    )
    for step in steps_waiting_for_attestation_confirmation:
        try:
            with transaction.atomic():
                attestation_client = get_attestation_client(step.conversion.source_chain)
                result = attestation_client.get_attestation(step.metadata['message_hash'])
                if result['status'] != 'complete':
                    logger.info(
                        f'Attestation not found or still pending for hash: {step.metadata["message_hash"]}. Skipping...',  # noqa: E501
                    )
                    continue

                step.status = TokenConversionStepStatus.SUCCESSFUL
                step.save()

                TokenConversionStep.objects.create(
                    metadata={
                        'nonce': step.metadata['nonce'],
                        'attestation': result['attestation'],
                        'message_bytes': step.metadata['message_bytes'],
                    },
                    conversion=step.conversion,
                    status=TokenConversionStepStatus.PENDING,
                    step_type=CCTPConversionStepType.SEND_TO_RECIPIENT,
                )
        except Exception:
            logger.exception('An error occurred while retrieving attestation for CCTP bridging process')
            continue


@db_periodic_task(crontab(minute='*/3'))
@lock_task('cctp-send-token-to-recipient-lock')
def cctp_send_token_to_recipient() -> None:
    recipient_credit_steps = TokenConversionStep.objects.select_related('conversion__destination_token').filter(
        metadata__tx_hash__isnull=True,
        status=TokenConversionStepStatus.PENDING,
        conversion__conversion_type=ConversionMethod.CCTP,
        step_type=CCTPConversionStepType.SEND_TO_RECIPIENT,
    )
    usdc_token = Token.objects.filter(symbol='usdc').first()
    for step in recipient_credit_steps:
        try:
            with transaction.atomic():
                evm_client = EVMAggregator().get_client(step.conversion.destination_chain)
                contract = evm_client.get_contract(
                    name='CrossChainBridge',
                    address=get_cross_chain_bridge_deployment_address(step.conversion.destination_chain),
                )
                deployer = Account.from_key(settings.DEPLOYER_PRIVATE_KEY)  # pylint: disable=no-value-for-parameter
                send_to_recipient_fn_call = contract.functions.sendToRecipient(
                    to_bytes(hexstr=step.metadata['message_bytes']),
                    to_bytes(hexstr=step.metadata['attestation']),
                    step.metadata['nonce'],
                    int(usdc_token.convert_from_token_to_wei(step.conversion.actual_amount)),  # type: ignore[union-attr]  # noqa: E501
                    step.conversion.destination_token.address,
                    step.conversion.destination_address,
                )
                unsigned_tx = send_to_recipient_fn_call.build_transaction(
                    TxParams(
                        {
                            'from': deployer.address,
                            'chainId': step.conversion.destination_chain.value,
                        },
                    ),
                )
                tx_hash = evm_client.publish_transaction(tx_params=unsigned_tx, sender=deployer)
                step.status = TokenConversionStepStatus.SUCCESSFUL
                step.metadata['tx_hash'] = tx_hash.hex()
                step.save()
        except Exception:
            logger.exception('An error occured while sending token to the recipient of a CCTP bridging process.')
            continue

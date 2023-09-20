import logging
from datetime import datetime
from decimal import Decimal

from eth_account import Account
from eth_utils.conversions import to_bytes
from huey import crontab
from huey.contrib.djhuey import db_periodic_task, lock_task
from web3.types import TxParams

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from bridgebloc.apps.tokens.models import Token
from bridgebloc.evm.aggregator import EVMAggregator

from .enums import (
    CCTPConversionStepType,
    CircleAPIConversionStepType,
    LxLyConversionStepType,
    TokenConversionStepStatus,
)
from .models import TokenConversionStep
from .types import ConversionMethod
from .utils import (
    get_attestation_client,
    get_circle_api_client,
    get_cross_chain_bridge_deployment_address,
    get_merkle_proof_client,
    get_polygon_zkevm_bridge_deployment_address,
)

logger = logging.getLogger(__name__)


@db_periodic_task(crontab(minute='*/1'))
@lock_task('poll-circle-for-deposit-addresses-lock')
def poll_circle_for_deposit_addresses() -> None:
    logger.info('Starting Circle API deposit addresses polling...')

    steps_needing_deposit_addresses = TokenConversionStep.objects.select_related('conversion').filter(
        status=TokenConversionStepStatus.PENDING,
        conversion__conversion_type=ConversionMethod.CIRCLE_API,
        step_type=CircleAPIConversionStepType.CREATE_DEPOSIT_ADDRESS,
    )

    logger.info(f'Found {steps_needing_deposit_addresses.count()} steps requiring deposit addresses.')

    for step in steps_needing_deposit_addresses:
        logger.info(f'Polling for deposit address for Token Conversion: {step.conversion.uuid}')

        try:
            with transaction.atomic():
                circle_client = get_circle_api_client(step.conversion.source_chain)
                response = circle_client.get_payment_intent(step.metadata['id'])
                if response['data']['paymentMethods'][0].get('address') is None:
                    logger.info(f'No deposit address found for Token Conversion: {step.conversion.uuid}. Skipping...')
                    continue

                step.status = TokenConversionStepStatus.SUCCESSFUL
                step.metadata = response['data']
                step.save()

                TokenConversionStep.objects.create(
                    metadata={'deposit_tx_hash': None, **response['data']},
                    conversion=step.conversion,
                    status=TokenConversionStepStatus.PENDING,
                    step_type=CircleAPIConversionStepType.CONFIRM_DEPOSIT,
                )
                logger.info(f'Received deposit address for Token Conversion: {step.conversion.uuid}')
        except Exception:
            logger.exception('Error occurred while polling Circle API for deposit address')
            continue

        logger.info('Circle API deposit address polling completed.')


@db_periodic_task(crontab(minute='*/2'))
@lock_task('check-for-circle-api-deposit-confirmation')
def check_for_circle_api_deposit_confirmation() -> None:
    logger.info('Starting Circle API deposit confirmation checks...')

    steps_needing_deposit_addresses = TokenConversionStep.objects.select_related('conversion').filter(
        status=TokenConversionStepStatus.PENDING,
        step_type=CircleAPIConversionStepType.CONFIRM_DEPOSIT,
        conversion__conversion_type=ConversionMethod.CIRCLE_API,
    )

    logger.info(f'Found {steps_needing_deposit_addresses.count()} steps requiring deposit confirmation.')

    for step in steps_needing_deposit_addresses:
        logger.info(f'Checking deposit confirmation for step {step.uuid}...')

        try:
            with transaction.atomic():
                circle_client = get_circle_api_client(step.conversion.source_chain)
                response = circle_client.get_payment_intent(step.metadata['id'])

                if timezone.now() > datetime.fromisoformat(response['data']['expiresOn']):
                    step.metadata = {'deposit_tx_hash': step.metadata['deposit_tx_hash'], **response['data']}
                    step.status = TokenConversionStepStatus.FAILED
                    step.save()

                    logger.warning(f'Step {step.uuid} failed due to expiration of payment intent.')
                    continue

                if (
                    response['data']['timeline'][0]['status'] != 'complete'
                    or response['data']['timeline'][0]['context'] not in ('paid', 'overpaid')
                    or len(response['data']['paymentIds']) < 1
                    or Decimal(response['data']['amountPaid']['amount']) < step.conversion.amount
                ):
                    logger.info(f'Deposit confirmation for step {step.uuid} is not complete or accurate. Skipping...')
                    continue

                step.status = TokenConversionStepStatus.SUCCESSFUL
                step.metadata = {'deposit_tx_hash': step.metadata['deposit_tx_hash'], **response['data']}
                step.save()

                logger.info(f'Deposit confirmation for step {step.uuid} succeeded. Proceeding to next step...')

                TokenConversionStep.objects.create(
                    metadata={},
                    conversion=step.conversion,
                    status=TokenConversionStepStatus.PENDING,
                    step_type=CircleAPIConversionStepType.SEND_TO_RECIPIENT,
                )
        except Exception:
            logger.exception('Error occurred while checking for Circle API deposit confirmation')
            continue

    logger.info('Circle API deposit confirmation check completed.')


@db_periodic_task(crontab(minute='*/3'))
@lock_task('send-to-recipient-using-circle-api-lock')
def send_to_recipient_using_circle_api() -> None:
    logger.info('Starting Circle API withdrawal process for recipients...')

    steps_needing_withdrawal = TokenConversionStep.objects.select_related('conversion').filter(
        metadata__id__isnull=True,
        status=TokenConversionStepStatus.PENDING,
        step_type=CircleAPIConversionStepType.SEND_TO_RECIPIENT,
        conversion__conversion_type=ConversionMethod.CIRCLE_API,
    )

    logger.info(f'Found {steps_needing_withdrawal.count()} steps requiring withdrawal.')

    for step in steps_needing_withdrawal:
        logger.info(f'Processing step {step.uuid} for withdrawal to recipient...')

        try:
            with transaction.atomic():
                circle_client = get_circle_api_client(step.conversion.destination_chain)
                response = circle_client.make_withdrawal(
                    amount=step.conversion.actual_amount,
                    master_wallet_id=settings.CIRCLE_MASTER_WALLET_ID,
                    chain=step.conversion.destination_chain.to_circle(),
                    destination_address=step.conversion.destination_address,
                )
                step.metadata = response['data']
                step.save()

                logger.info(f'Withdrawal initiated for step {step.uuid}.')
        except Exception:
            logger.exception('Error occurred while checking for Circle API deposit confirmation')
            continue

        logger.info('Circle API withdrawal process completed successfully.')


@db_periodic_task(crontab(minute='*/2'))
@lock_task('wait-for-minimum-confirmation-for-circle-api-withdrawals-lock')
def wait_for_minimum_confirmation_for_circle_api_withdrawals() -> None:
    logger.info('Starting withdrawal confirmation check for Circle API withdrawals...')

    steps_needing_withdrawal = TokenConversionStep.objects.select_related('conversion').filter(
        metadata__id__isnull=False,
        status=TokenConversionStepStatus.PENDING,
        conversion__conversion_type=ConversionMethod.CIRCLE_API,
        step_type=CircleAPIConversionStepType.SEND_TO_RECIPIENT,
    )

    logger.info(f'Found {steps_needing_withdrawal.count()} steps needing withdrawal confirmation.')

    for step in steps_needing_withdrawal:
        logger.info(f'Checking withdrawal confirmation for step {step.uuid}...')

        try:
            with transaction.atomic():
                circle_client = get_circle_api_client(step.conversion.destination_chain)
                response = circle_client.get_withdrawal_info(step.metadata['id'])
                if (
                    response['data']['status'] in {'running', 'complete'}
                    and response['data']['transactionHash'] is not None
                ):
                    step.metadata = response['data']
                    step.status = TokenConversionStepStatus.SUCCESSFUL
                    step.save()

                    logger.info(f'Withdrawal for step {step.uuid} confirmed and marked as successful.')

                if response['data']['status'] == 'failed':
                    error_code = response['data']['errorCode']
                    step.metadata = response['data']
                    step.save()
                    logger.warning(f'Withdrawal for step {step.uuid} failed with error code {error_code}')
        except Exception:
            logger.exception('Error occurred while checking for Circle API deposit confirmation')
            continue

    logger.info('Withdrawals confirmation check completed.')


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


@db_periodic_task(crontab(minute='*/2'))
@lock_task('get-lxly-merkle-proofs-lock')
def get_lxly_merkle_proofs() -> None:
    steps_requiring_merkle_proofs = TokenConversionStep.objects.select_related('conversion__destination_token').filter(
        status=TokenConversionStepStatus.PENDING,
        conversion__conversion_type=ConversionMethod.LXLY,
        step_type=LxLyConversionStepType.GET_MERKLE_PROOF,
    )
    for step in steps_requiring_merkle_proofs:
        try:
            with transaction.atomic():
                merkle_proof_client = get_merkle_proof_client(step.conversion.source_chain)
                result = merkle_proof_client.get_merkle_proof(
                    deposit_count=step.metadata['deposit_count'],
                    origin_id=step.conversion.source_chain.to_lxly_domain(),
                )
                step.status = TokenConversionStepStatus.SUCCESSFUL
                step.save()

                TokenConversionStep.objects.create(
                    metadata={
                        'merkle_proof': result['proof']['merkle_proof'],
                        'main_exit_root': result['proof']['main_exit_root'],
                        'rollup_exit_root': result['proof']['rollup_exit_root'],
                        'bridged_amount': step.metadata['bridged_amount'],
                        'deposit_count': step.metadata['deposit_count'],
                        'origin_network': step.metadata['origin_network'],
                        'origin_address': step.metadata['origin_address'],
                        'destination_network': step.metadata['destination_network'],
                        'destination_address': step.metadata['destination_address'],
                    },
                    conversion=step.conversion,
                    status=TokenConversionStepStatus.PENDING,
                    step_type=LxLyConversionStepType.SEND_TO_RECIPIENT,
                )
        except Exception:
            logger.exception('An error occurred while retrieving merkle proof for LxLy bridging process')
            continue


@db_periodic_task(crontab(minute='*/3'))
@lock_task('claim-assets-at-destination-lxly-lock')
def claim_assets_at_destination_lxly() -> None:
    claim_assets_steps = TokenConversionStep.objects.select_related('conversion__destination_token').filter(
        status=TokenConversionStepStatus.PENDING,
        conversion__conversion_type=ConversionMethod.LXLY,
        step_type=LxLyConversionStepType.SEND_TO_RECIPIENT,
    )
    for step in claim_assets_steps:
        try:
            with transaction.atomic():
                evm_client = EVMAggregator().get_client(step.conversion.destination_chain)
                deployer = Account.from_key(settings.DEPLOYER_PRIVATE_KEY)  # pylint: disable=no-value-for-parameter
                contract = evm_client.get_contract(
                    name='PolygonZkEVMBridge',
                    address=get_polygon_zkevm_bridge_deployment_address(step.conversion.destination_chain),
                )

                is_claimed = contract.functions.isClaimed(step.metadata['deposit_count']).call()
                if is_claimed:
                    step.status = TokenConversionStepStatus.SUCCESSFUL
                    step.save()
                    continue

                send_to_recipient_fn_call = contract.functions.claimAsset(
                    [to_bytes(hexstr=i) for i in step.metadata['merkle_proof']],
                    step.metadata['deposit_count'],
                    to_bytes(hexstr=step.metadata['main_exit_root']),
                    to_bytes(hexstr=step.metadata['rollup_exit_root']),
                    step.metadata['origin_network'],
                    step.metadata['origin_address'],
                    step.metadata['destination_network'],
                    step.metadata['destination_address'],
                    step.metadata['bridged_amount'],
                    to_bytes(text=''),
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
            logger.exception('An error occurred while sending bridged asset to recipient for LxLy')
            continue

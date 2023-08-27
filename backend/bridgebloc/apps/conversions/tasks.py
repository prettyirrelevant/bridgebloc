import logging
from datetime import datetime

from eth_account import Account
from huey import crontab
from huey.contrib.djhuey import db_periodic_task, lock_task
from web3.types import TxParams

from django.conf import settings
from django.utils import timezone

from bridgebloc.evm.aggregator import EVMAggregator

from .enums import CCTPConversionStepType, CircleAPIConversionStepType, TokenConversionStepStatus
from .models import TokenConversionStep
from .utils import get_attestation_client, get_circle_api_client, get_cross_chain_bridge_deployment_address

logger = logging.getLogger(__name__)


@db_periodic_task(crontab(minute=1))
@lock_task('poll-circle-for-deposit-addresses-lock')
def poll_circle_for_deposit_addresses() -> None:
    logger.info('Starting Circle API deposit addresses polling...')

    try:
        steps_needing_deposit_addresses = TokenConversionStep.objects.select_related('conversion').filter(
            status=TokenConversionStepStatus.PENDING,
            step_type=CircleAPIConversionStepType.CREATE_DEPOSIT_ADDRESS,
        )
        logger.info(f'Found {steps_needing_deposit_addresses.count()} steps requiring deposit addresses.')

        for step in steps_needing_deposit_addresses:
            logger.info(f'Polling for deposit address for Token Conversion: {step.conversion.uuid}')

            circle_client = get_circle_api_client(step.conversion.source_chain)
            response = circle_client.get_payment_intent(step.metadata['id'])
            if not response['data']['paymentMethods'][0]['address']:
                logger.info(f'No deposit address found for Token Conversion: {step.conversion.uuid}. Skipping...')
                continue

            step.status = TokenConversionStepStatus.SUCCESSFUL
            step.metadata = response['data']
            step.save()

            TokenConversionStep.objects.create(
                metadata=response['data'],
                conversion=step.conversion,
                status=TokenConversionStepStatus.PENDING,
                step_type=CircleAPIConversionStepType.CONFIRM_DEPOSIT,
            )
            logger.info(f'Received deposit address for Token Conversion: {step.conversion.uuid}')

        logger.info('Circle API deposit address polling completed.')
    except Exception as e:
        logger.exception('Error occurred while polling Circle API for deposit addresses', exc_info=e)


@db_periodic_task(crontab(minute=3))
@lock_task('check-for-circle-api-deposit-confirmation')
def check_for_circle_api_deposit_confirmation() -> None:
    logger.info('Starting Circle API deposit confirmation checks...')

    try:
        steps_needing_deposit_addresses = TokenConversionStep.objects.select_related('conversion').filter(
            status=TokenConversionStepStatus.PENDING,
            step_type=CircleAPIConversionStepType.CONFIRM_DEPOSIT,
        )
        logger.info(f'Found {steps_needing_deposit_addresses.count()} steps requiring deposit confirmation.')

        for step in steps_needing_deposit_addresses:
            logger.info(f'Checking deposit confirmation for step {step.uuid}...')

            circle_client = get_circle_api_client(step.conversion.source_chain)
            response = circle_client.get_payment_intent(step.metadata['id'])

            if datetime.fromisoformat(response['data']['expiresOn']) > timezone.now():
                step.metadata = response['data']
                step.status = TokenConversionStepStatus.FAILED
                step.save()

                logger.warning(f'Step {step.uuid} failed due to expiration of payment intent.')
                continue

            if (
                response['data']['timeline'][0]['status'] != 'complete'
                or response['data']['timeline'][0]['context'] not in ('paid', 'overpaid')
                or len(response['data']['paymentIds']) < 1
                or response['data']['amountPaid']['amount'] < step.conversion.amount
            ):
                logger.info(f'Deposit confirmation for step {step.uuid} is not complete or accurate. Skipping...')
                continue

            step.status = TokenConversionStepStatus.SUCCESSFUL
            step.metadata = response['data']
            step.save()

            logger.info(f'Deposit confirmation for step {step.uuid} succeeded. Proceeding to next step...')

            TokenConversionStep.objects.create(
                metadata={},
                conversion=step.conversion,
                status=TokenConversionStepStatus.PENDING,
                step_type=CircleAPIConversionStepType.SEND_TO_RECIPIENT,
            )

        logger.info('Circle API deposit confirmation check completed.')
    except Exception as e:
        logger.exception('Error occurred while checking for Circle API deposit confirmation', exc_info=e)


@db_periodic_task(crontab(minute=1))
@lock_task('send-to-recipient-using-circle-api-lock')
def send_to_recipient_using_circle_api() -> None:
    logger.info('Starting Circle API withdrawal process for recipients...')

    try:
        steps_needing_withdrawal = TokenConversionStep.objects.select_related('conversion').filter(
            metadata__id__isnull=True,
            status=TokenConversionStepStatus.PENDING,
            step_type=CircleAPIConversionStepType.SEND_TO_RECIPIENT,
        )
        logger.info(f'Found {steps_needing_withdrawal.count()} steps requiring withdrawal.')

        for step in steps_needing_withdrawal:
            logger.info(f'Processing step {step.uuid} for withdrawal to recipient...')

            circle_client = get_circle_api_client(step.conversion.destination_chain)
            response = circle_client.make_withdrawal(
                amount=step.conversion.amount,
                master_wallet_id=settings.CIRCLE_MASTER_WALLET_ID,
                chain=step.conversion.destination_chain.to_circle(),
                destination_address=step.conversion.destination_address,
            )
            step.metadata = response['data']
            step.save()

            logger.info(f'Withdrawal initiated for step {step.uuid}.')

        logger.info('Circle API withdrawal process completed successfully.')
    except Exception as e:
        logger.exception('Error occurred while checking for Circle API deposit confirmation', exc_info=e)


@db_periodic_task(crontab(minute=3))
@lock_task('wait-for-minimum-confirmation-for-circle-api-withdrawals')
def wait_for_minimum_confirmation_for_circle_api_withdrawals() -> None:
    logger.info('Starting withdrawal confirmation check for Circle API withdrawals...')

    try:
        steps_needing_withdrawal = TokenConversionStep.objects.select_related('conversion').filter(
            metadata__id__isnull=False,
            status=TokenConversionStepStatus.PENDING,
            step_type=CircleAPIConversionStepType.SEND_TO_RECIPIENT,
        )
        logger.info(f'Found {steps_needing_withdrawal.count()} steps needing withdrawal confirmation.')

        for step in steps_needing_withdrawal:
            logger.info(f'Checking withdrawal confirmation for step {step.uuid}...')

            circle_client = get_circle_api_client(step.conversion.destination_chain)
            response = circle_client.get_withdrawal_info(step.metadata['id'])
            if response['data']['status'] == 'running' and response['data']['transactionHash'] is not None:
                step.metadata = response['data']
                step.status = TokenConversionStepStatus.SUCCESSFUL
                step.save()

                logger.info(f'Withdrawal for step {step.uuid} confirmed and marked as successful.')

            if response['data']['status'] == 'failed':
                error_code = response['data']['errorCode']
                step.metadata = {}
                step.save()

                logger.warning(f'Withdrawal for step {step.uuid} failed with error code {error_code}. Will retry...')

        logger.info('Withdrawals confirmation check completed.')
    except Exception as e:
        logger.exception('Error occurred while checking for Circle API deposit confirmation', exc_info=e)


@db_periodic_task(crontab(minute=2))
@lock_task('check-for-cctp-attestation-confirmation')
def check_for_cctp_attestation_confirmation() -> None:
    steps_waiting_for_attestation_confirmation = TokenConversionStep.objects.select_related('conversion').filter(
        status=TokenConversionStepStatus.PENDING,
        step_type=CCTPConversionStepType.ATTESTATION_SERVICE_CONFIRMATION,
    )
    for step in steps_waiting_for_attestation_confirmation:
        attestation_client = get_attestation_client(step.conversion.source_chain)
        result = attestation_client.get_attestation(step.metadata['message_hash'])
        if result['data']['status'] != 'complete':
            logger.info(
                f'Attestation not found or still pending for hash: {step.metadata["message_hash"]}. Skipping...',
            )
            continue

        step.status = TokenConversionStepStatus.SUCCESSFUL
        step.save()

        TokenConversionStep.objects.create(
            metadata={
                'nonce': step.metadata['nonce'],
                'attestation': result['data']['attestation'],
                'message_hash': step.metadata['message_hash'],
            },
            conversion=step.conversion,
            status=TokenConversionStepStatus.PENDING,
            step_type=CCTPConversionStepType.SEND_TO_RECIPIENT,
        )


@db_periodic_task(crontab(minute=5))
@lock_task('cctp-send-token-to-recipient')
def cctp_send_token_to_recipient() -> None:
    recipient_credit_steps = TokenConversionStep.objects.select_related('conversion__destination_token').filter(
        metadata__tx_hash__isnull=True,
        status=TokenConversionStepStatus.PENDING,
        step_type=CCTPConversionStepType.SEND_TO_RECIPIENT,
    )
    for step in recipient_credit_steps:
        evm_client = EVMAggregator().get_client(step.conversion.destination_chain)
        contract = evm_client.get_contract(
            name='CrossChainBridge',
            address=get_cross_chain_bridge_deployment_address(step.conversion.destination_chain),
        )
        deployer = Account.from_key(settings.DEPLOYER_PRIVATE_KEY)  # pylint: disable=no-value-for-parameter
        send_to_recipient_fn__call = contract.functions.sendToRecipient(
            step.metadata['message_hash'],
            step.metadata['attestation'],
            step.metadata['nonce'],
            step.conversion.destination_token.convert_from_token_to_wei(step.conversion.amount),
            step.conversion.destination_token.address,
            step.conversion.destination_address,
        )
        unsigned_tx = send_to_recipient_fn__call.build_transaction(
            TxParams(
                {
                    'type': 2,
                    'maxFeePerGas': '',
                    'maxPriorityFeePerGas': '',
                    'gas': 0,
                    'from': deployer.address,
                    'chainId': step.conversion.destination_chain.value,
                },
            ),
        )
        tx_hash = evm_client.publish_transaction(tx_params=unsigned_tx, sender=deployer)
        step.metadata['tx_hash'] = tx_hash.hex()
        step.save()

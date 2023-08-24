import logging
from datetime import datetime
from uuid import UUID

from huey import crontab
from huey.contrib.djhuey import db_periodic_task, db_task, lock_task

from django.conf import settings
from django.utils import timezone

from .models import (
    CircleAPIConversionStep,
    CircleAPIConversionStepStatus,
    CircleAPIConversionStepType,
    TokenConversion,
)
from .utils import get_circle_api_client

logger = logging.getLogger('huey')


@db_task()
def initiate_circle_api_payment_intent(token_conversion_id: UUID) -> None:
    logger.info(f'Initiating Circle API payment intent for Token Conversion: {token_conversion_id}')

    try:
        token_conversion = TokenConversion.objects.get(uuid=token_conversion_id)
        circle_client = get_circle_api_client(token_conversion.source_chain)
        result = circle_client.create_payment_intent(
            amount=token_conversion.amount,
            chain=token_conversion.source_chain.to_circle(),
        )
        CircleAPIConversionStep.objects.create(
            metadata=result['data'],
            conversion=token_conversion,
            status=CircleAPIConversionStepStatus.PENDING,
            step_type=CircleAPIConversionStepType.CREATE_DEPOSIT_ADDRESS,
        )
        logger.info(f'Initiated Circle API payment intent for Token Conversion: {token_conversion_id}')
    except Exception as e:
        logger.exception('Error occurred while initiating Circle API payment intent', exc_info=e)


@db_periodic_task(crontab(minute=1))
@lock_task('poll-circle-for-deposit-addresses-lock')
def poll_circle_for_deposit_addresses() -> None:
    logger.info('Starting Circle API deposit addresses polling...')

    try:
        steps_needing_deposit_addresses = CircleAPIConversionStep.objects.filter(
            status=CircleAPIConversionStepStatus.PENDING,
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

            step.status = CircleAPIConversionStepStatus.SUCCESSFUL
            step.metadata = response['data']
            step.save()

            CircleAPIConversionStep.objects.create(
                metadata=response['data'],
                conversion=step.conversion,
                status=CircleAPIConversionStepStatus.PENDING,
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
        steps_needing_deposit_addresses = CircleAPIConversionStep.objects.filter(
            status=CircleAPIConversionStepStatus.PENDING,
            step_type=CircleAPIConversionStepType.CONFIRM_DEPOSIT,
        )
        logger.info(f'Found {steps_needing_deposit_addresses.count()} steps requiring deposit confirmation.')

        for step in steps_needing_deposit_addresses:
            logger.info(f'Checking deposit confirmation for step {step.uuid}...')

            circle_client = get_circle_api_client(step.conversion.source_chain)
            response = circle_client.get_payment_intent(step.metadata['id'])

            if datetime.fromisoformat(response['data']['expiresOn']) > timezone.now():
                step.metadata = response['data']
                step.status = CircleAPIConversionStepStatus.FAILED
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

            step.status = CircleAPIConversionStepStatus.SUCCESSFUL
            step.metadata = response['data']
            step.save()

            logger.info(f'Deposit confirmation for step {step.uuid} succeeded. Proceeding to next step...')

            CircleAPIConversionStep.objects.create(
                metadata={},
                conversion=step.conversion,
                status=CircleAPIConversionStepStatus.PENDING,
                step_type=CircleAPIConversionStepType.SEND_TO_RECIPIENT,
            )

        logger.info('Circle API deposit confirmation check completed.')
    except Exception as e:
        logger.exception('Error occurred while checking for Circle API deposit confirmation', exc_info=e)


@db_periodic_task(crontab(minute=1))
def send_to_recipient_using_circle_api() -> None:
    logger.info('Starting Circle API withdrawal process for recipients...')

    try:
        steps_needing_withdrawal = CircleAPIConversionStep.objects.filter(
            metadata__id__isnull=True,
            status=CircleAPIConversionStepStatus.PENDING,
            step_type=CircleAPIConversionStepType.SEND_TO_RECIPIENT,
        )
        logger.info(f'Found {steps_needing_withdrawal.count()} steps requiring withdrawal.')

        for step in steps_needing_withdrawal:
            logger.info(f'Processing step {step.uuid} for withdrawal to recipient...')

            circle_client = get_circle_api_client(step.conversion.source_chain)
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


@db_periodic_task(crontab(minute=1))
def wait_for_minimum_confirmation_for_circle_api_withdrawals() -> None:
    logger.info('Starting withdrawal confirmation check for Circle API withdrawals...')

    try:
        steps_needing_withdrawal = CircleAPIConversionStep.objects.filter(
            metadata__id__isnull=False,
            status=CircleAPIConversionStepStatus.PENDING,
            step_type=CircleAPIConversionStepType.SEND_TO_RECIPIENT,
        )
        logger.info(f'Found {steps_needing_withdrawal.count()} steps needing withdrawal confirmation.')

        for step in steps_needing_withdrawal:
            logger.info(f'Checking withdrawal confirmation for step {step.uuid}...')
            circle_client = get_circle_api_client(step.conversion.source_chain)
            response = circle_client.get_withdrawal_info(step.metadata['id'])
            if response['data']['status'] == 'running' and response['data']['transactionHash'] is not None:
                step.metadata = response['data']
                step.status = CircleAPIConversionStepStatus.SUCCESSFUL
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

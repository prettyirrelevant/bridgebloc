from django.db import models

from bridgebloc.apps.conversions.types import ConversionMethod
from bridgebloc.common.fields import EVMAddressField, EVMChainIDField
from bridgebloc.common.models import TimestampedModel, UUIDModel


class CircleAPIConversionStepStatus(models.TextChoices):
    FAILED = 'failed'
    PENDING = 'pending'
    SUCCESSFUL = 'successful'


class CircleAPIConversionStepType(models.TextChoices):
    CONFIRM_DEPOSIT = 'confirm deposit'
    SEND_TO_RECIPIENT = 'send to recipient'
    CREATE_DEPOSIT_ADDRESS = 'create deposit address'


class TokenConversion(UUIDModel, TimestampedModel, models.Model):
    creator = models.ForeignKey(
        'accounts.Account',
        verbose_name='creator',
        related_name='conversions',
        blank=False,
        on_delete=models.CASCADE,
    )
    source_chain = EVMChainIDField('source chain', blank=False)
    destination_chain = EVMChainIDField('destination chain', blank=False)
    source_token = models.ForeignKey(
        'tokens.Token',
        verbose_name='source token',
        related_name='source_circle_api_conversions',
        on_delete=models.CASCADE,
        blank=False,
    )
    conversion_type = models.CharField(
        'conversion type',
        choices=[(choice.value, choice.name.replace('_', ' ').title()) for choice in ConversionMethod],
        max_length=150,
        blank=False,
    )
    destination_token = models.ForeignKey(
        'tokens.Token',
        verbose_name='destination token',
        related_name='destination_circle_api_conversions',
        on_delete=models.CASCADE,
        blank=False,
    )
    destination_address = EVMAddressField('destination address', blank=False)
    amount = models.DecimalField('amount', max_digits=14, decimal_places=2, blank=False)


class CircleAPIConversionStep(UUIDModel, TimestampedModel, models.Model):
    conversion = models.ForeignKey(
        TokenConversion,
        verbose_name='conversion',
        related_name='circle_api_conversion_steps',
        on_delete=models.CASCADE,
        blank=False,
    )
    step_type = models.CharField('step type', max_length=150, choices=CircleAPIConversionStepType.choices, blank=False)
    metadata = models.JSONField('metadata', blank=False)
    status = models.CharField('status', max_length=10, choices=CircleAPIConversionStepStatus.choices, blank=False)

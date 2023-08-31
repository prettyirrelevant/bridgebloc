from decimal import Decimal

from django.db import models

from bridgebloc.common.fields import EVMAddressField, EVMChainIDField
from bridgebloc.common.models import TimestampedModel, UUIDModel

from .enums import CCTPConversionStepType, CircleAPIConversionStepType, TokenConversionStepStatus
from .types import ConversionMethod


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
    """
    Represents the value to be transferred or exchanged based on the bridging method:

    1. For tokens bridged via Circle API:
       This indicates the quantity of USDC to be transferred.

    2. For tokens bridged via CCTP:
       This represents the equivalent value of the source_token in USDC.

    3. For tokens bridged via LxLy:
       This represents the equivalent value of the source_token in terms of the destination_token.
    """

    @property
    def actual_amount(self) -> Decimal:
        max_fee = Decimal(20)
        if self.conversion_type == ConversionMethod.CIRCLE_API:
            fee_charged = min(Decimal(0.04) * self.amount, max_fee)
            return self.amount - fee_charged

        fee_charged = min(Decimal(0.03) * self.amount, max_fee)
        return self.amount - fee_charged


class TokenConversionStep(UUIDModel, TimestampedModel, models.Model):
    conversion = models.ForeignKey(
        TokenConversion,
        verbose_name='conversion',
        related_name='conversion_steps',
        on_delete=models.CASCADE,
        blank=False,
    )
    step_type = models.CharField(
        'step type',
        max_length=150,
        choices=CircleAPIConversionStepType.choices + CCTPConversionStepType.choices,
        blank=False,
    )
    metadata = models.JSONField('metadata', blank=False)
    status = models.CharField('status', max_length=10, choices=TokenConversionStepStatus.choices, blank=False)

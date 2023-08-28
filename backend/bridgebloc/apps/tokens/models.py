from decimal import Decimal
from typing import ClassVar

from web3.types import Wei

from django.db import models

from bridgebloc.common.fields import EVMAddressField, EVMChainIDField
from bridgebloc.common.models import TimestampedModel, UUIDModel
from bridgebloc.evm.types import ChainID


class Token(UUIDModel, TimestampedModel, models.Model):
    name = models.CharField('name', max_length=200, blank=False)
    symbol = models.CharField('symbol', max_length=200, blank=False)
    chain_id = EVMChainIDField('chain id', blank=False)
    decimals = models.IntegerField('decimals', blank=False)
    coingecko_id = models.CharField('coingecko id', max_length=200, blank=False)
    address = EVMAddressField('address', blank=False, unique=True)

    def convert_from_wei_to_token(self, amount: int) -> Decimal:
        return Decimal(amount / 10**self.decimals)

    def convert_from_token_to_wei(self, amount: Decimal) -> Wei:
        return Wei(amount * 10**self.decimals)

    class Meta:
        constraints: ClassVar[list] = [
            models.UniqueConstraint(
                fields=['coingecko_id', 'chain_id'],
                name='coingecko_id_and_chain_id_unique',
            ),
            models.CheckConstraint(
                check=models.Q(chain_id__in=ChainID.values()),
                name='%(app_label)s_%(class)s_chain_id_valid',
            ),
        ]

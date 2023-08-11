from typing import ClassVar

from django.db import models

from bridgebloc.common.fields import EVMAddressField, EVMChainIDField
from bridgebloc.common.models import TimestampedModel, UUIDModel
from bridgebloc.common.types import EVMChainID


class Token(UUIDModel, TimestampedModel, models.Model):
    name = models.CharField('name', blank=False)
    symbol = models.CharField('symbol', blank=False)
    chain_id = EVMChainIDField('chain id', blank=False)
    decimals = models.IntegerField('decimals', blank=False)
    description = models.TextField('description', blank=False)
    coingecko_id = models.CharField('coingecko id', blank=False)
    address = EVMAddressField('address', blank=False, unique=True)

    class Meta:
        constraints: ClassVar[list] = [
            models.UniqueConstraint(
                fields=['coingecko_id', 'chain_id'],
                name='coingecko_id_and_chain_id_unique',
            ),
            models.CheckConstraint(
                check=models.Q(chain_id__in=EVMChainID.values),
                name='%(app_label)s_%(class)s_chain_id_valid',
            ),
        ]

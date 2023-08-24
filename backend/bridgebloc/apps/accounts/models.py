from django.db import models

from bridgebloc.common.fields import EVMAddressField
from bridgebloc.common.models import TimestampedModel, UUIDModel


class Account(UUIDModel, TimestampedModel, models.Model):
    address = EVMAddressField('address', unique=True, blank=False)

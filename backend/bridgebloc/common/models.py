from uuid import uuid4

from django.db import models


class UUIDModel(models.Model):
    uuid = models.UUIDField('uuid', primary_key=True, default=uuid4)

    class Meta:
        abstract = True


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    class Meta:
        abstract = True

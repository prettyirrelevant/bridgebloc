from django.db import models


class TokenConversionStepStatus(models.TextChoices):
    FAILED = 'failed'
    PENDING = 'pending'
    SUCCESSFUL = 'successful'


class CCTPConversionStepType(models.TextChoices):
    ATTESTATION_SERVICE_CONFIRMATION = 'attestation service confirmation'
    SEND_TO_RECIPIENT = 'send to recipient'

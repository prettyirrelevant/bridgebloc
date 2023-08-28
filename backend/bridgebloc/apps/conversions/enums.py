from django.db import models


class TokenConversionStepStatus(models.TextChoices):
    FAILED = 'failed'
    PENDING = 'pending'
    SUCCESSFUL = 'successful'


class CircleAPIConversionStepType(models.TextChoices):
    CONFIRM_DEPOSIT = 'confirm deposit'
    SEND_TO_RECIPIENT = 'send to recipient'
    CREATE_DEPOSIT_ADDRESS = 'create deposit address'


class CCTPConversionStepType(models.TextChoices):
    ATTESTATION_SERVICE_CONFIRMATION = 'attestation service confirmation'
    SEND_TO_RECIPIENT = 'send to recipient'


class LxLyConversionStepType(models.TextChoices):
    GET_MERKLE_PROOF = 'get merkle proof'
    SEND_TO_RECIPIENT = 'send to recipient'

from django.db import models


class TokenConversionStepStatus(models.TextChoices):
    FAILED = 'failed'
    PENDING = 'pending'
    SUCCESSFUL = 'successful'


class CircleAPIConversionStepType(models.TextChoices):
    CONFIRM_DEPOSIT = 'confirm deposit'
    SEND_TO_RECIPIENT = 'send to recipient'
    CREATE_DEPOSIT_ADDRESS = 'create deposit address'

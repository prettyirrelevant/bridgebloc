from enum import StrEnum, unique


@unique
class ConversionMethod(StrEnum):
    CCTP = 'cctp'
    CIRCLE_API = 'circle_api'

    def __str__(self) -> str:
        return str(self.value)

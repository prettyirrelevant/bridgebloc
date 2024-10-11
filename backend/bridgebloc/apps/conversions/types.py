from enum import StrEnum, unique


@unique
class ConversionMethod(StrEnum):
    CCTP = 'cctp'

    def __str__(self) -> str:
        return str(self.value)

from enum import IntEnum, unique


@unique
class ChainID(IntEnum):
    BASE = 8453
    ETHEREUM = 1
    OPTIMISM = 10
    POLYGON_POS = 137
    BASE_TESTNET = 84532
    ARBITRUM_ONE = 42161
    ETHEREUM_TESTNET = 5
    POLYGON_POS_TESTNET = 80001
    OPTIMISM_TESTNET = 11155420
    ARBITRUM_ONE_TESTNET = 421613

    @classmethod
    def values(cls) -> list[int]:
        return [value for value, _ in cls.choices()]

    @classmethod
    def choices(cls) -> list[tuple[int, str]]:
        return [(member.value, member.name.replace('_', ' ').title()) for member in cls]

    def is_mainnet(self) -> bool:
        return not self.name.endswith('TESTNET')

    def to_coingecko_id(self) -> str:
        if not self.is_mainnet():
            raise ValueError('Cannot convert testnet blockchain to CoinGecko ID')

        if self == ChainID.OPTIMISM:
            return 'optimistic-ethereum'

        return self.name.lower().replace('_', '-')

    @classmethod
    def from_name(cls, name: str) -> 'ChainID':
        chain_id = cls.__members__.get(name.upper())
        if chain_id is None:
            raise ValueError(f'"{name}" is not a valid ChainID')

        return chain_id

    def to_cctp_domain(self) -> int:
        if self in {ChainID.ETHEREUM, ChainID.ETHEREUM_TESTNET}:
            return 0

        if self in {ChainID.ARBITRUM_ONE, ChainID.ARBITRUM_ONE_TESTNET}:
            return 3

        if self in {ChainID.BASE, ChainID.BASE_TESTNET}:
            return 6

        if self in {ChainID.POLYGON_POS, ChainID.POLYGON_POS_TESTNET}:
            return 7

        if self in {ChainID.OPTIMISM, ChainID.OPTIMISM_TESTNET}:
            return 2

        raise ValueError(f'{self} is not supported by CCTP')

    def is_valid_cctp_chain(self) -> bool:
        try:
            self.to_cctp_domain()
        except ValueError:
            return False

        return True

    def __str__(self) -> str:
        return self.name.lower()

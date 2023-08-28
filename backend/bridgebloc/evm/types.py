from enum import IntEnum, unique


@unique
class ChainID(IntEnum):
    ETHEREUM = 1
    ARBITRUM_ONE = 42161
    AVALANCHE = 43114
    POLYGON_POS = 137
    POLYGON_ZKEVM = 1101
    ETHEREUM_TESTNET = 5
    ARBITRUM_ONE_TESTNET = 421613
    AVALANCHE_TESTNET = 43113
    POLYGON_POS_TESTNET = 80001
    POLYGON_ZKEVM_TESTNET = 1442

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

        if self in {ChainID.AVALANCHE, ChainID.AVALANCHE_TESTNET}:
            return 1

        if self in {ChainID.ARBITRUM_ONE, ChainID.ARBITRUM_ONE_TESTNET}:
            return 3

        raise ValueError(f'{self} is not supported by CCTP')

    def is_valid_cctp_chain(self) -> bool:
        try:
            self.to_cctp_domain()
        except ValueError:
            return False

        return True

    def to_lxly_domain(self) -> int:
        if self in {ChainID.ETHEREUM, ChainID.ETHEREUM_TESTNET}:
            return 0

        if self in {ChainID.POLYGON_ZKEVM, ChainID.POLYGON_ZKEVM_TESTNET}:
            return 1

        raise ValueError(f'{self} is not supported by LxLy')

    def is_valid_lxly_chain(self) -> bool:
        try:
            self.to_lxly_domain()
        except ValueError:
            return False

        return True

    def to_circle(self) -> str:
        if self.name.startswith('ETHEREUM'):
            return 'ETH'
        if self.name.startswith('AVALANCHE'):
            return 'AVAX'
        if self.name.startswith('POLYGON_POS'):
            return 'MATIC'

        raise ValueError(f'Circle API does not support {self.name}')

    def __str__(self) -> str:
        return self.name.lower()

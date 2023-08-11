from django.db import models


class EVMChainID(models.IntegerChoices):
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

    def is_mainnet(self) -> bool:
        return not self.name.endswith('TESTNET')

    def to_coingecko_id(self) -> str:
        if not self.is_mainnet():
            raise ValueError('Cannot convert testnet to CoinGecko ID')

        return self.name.lower().replace('_', '-')

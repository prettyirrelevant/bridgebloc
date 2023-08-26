import dataclasses
from typing import Any, ClassVar

from bridgebloc.evm.client import EVMClient
from bridgebloc.evm.types import ChainID


@dataclasses.dataclass(frozen=True, init=True, repr=True)
class EVMAggregatorConfig:
    ethereum_endpoints: list[str]
    ethereum_testnet_endpoints: list[str]
    avalanche_endpoints: list[str]
    avalanche_testnet_endpoints: list[str]
    arbitrum_one_endpoints: list[str]
    arbitrum_one_testnet_endpoints: list[str]
    polygon_pos_endpoints: list[str]
    polygon_pos_testnet_endpoints: list[str]
    polygon_zkevm_endpoints: list[str]
    polygon_zkevm_testnet_endpoints: list[str]


class SingletonMeta(type):
    _instances: ClassVar[dict] = {}

    def __call__(cls, *args: Any, **kwargs: Any) -> Any:
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)

        return cls._instances[cls]


class EVMAggregator(metaclass=SingletonMeta):
    def __init__(self, config: EVMAggregatorConfig) -> None:
        self.clients: dict[ChainID, EVMClient] = {}

        for chain in ChainID:
            endpoints = getattr(config, f'{chain.name.lower()}_endpoints')
            self.clients[chain] = EVMClient(chain=chain, rpc_endpoints=endpoints)

    def get_client(self, chain: ChainID) -> EVMClient:
        return self.clients[chain]

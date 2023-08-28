import dataclasses
from typing import ClassVar

from bridgebloc.evm.client import EVMClient
from bridgebloc.evm.types import ChainID


@dataclasses.dataclass(frozen=True, init=True, repr=True)
class EVMAggregatorConfig:  # pylint:disable=too-many-instance-attributes
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


class EVMAggregator:
    __clients: ClassVar[dict[ChainID, EVMClient]] = {}

    @classmethod
    def initialize(cls, config: EVMAggregatorConfig) -> None:
        if len(cls.__clients) == 0:
            for chain in ChainID:
                endpoints = getattr(config, f'{chain.name.lower()}_endpoints')
                cls.__clients[chain] = EVMClient(chain=chain, rpc_endpoints=endpoints)

    def get_client(self, chain: ChainID) -> EVMClient:
        assert len(self.__clients) == len(ChainID), 'EVMAggregator must be initialized first'  # noqa: S101
        return self.__clients[chain]

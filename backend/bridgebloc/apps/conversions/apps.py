from django.apps import AppConfig
from django.conf import settings

from bridgebloc.evm.aggregator import EVMAggregator, EVMAggregatorConfig


class ConversionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'bridgebloc.apps.conversions'

    def ready(self) -> None:
        EVMAggregator.initialize(
            config=EVMAggregatorConfig(
                base_endpoints=settings.BASE_RPC_NODES,
                ethereum_endpoints=settings.ETHEREUM_RPC_NODES,
                optimism_endpoints=settings.OPTIMISM_RPC_NODES,
                avalanche_endpoints=settings.AVALANCHE_RPC_NODES,
                polygon_pos_endpoints=settings.POLYGON_POS_RPC_NODES,
                arbitrum_one_endpoints=settings.ARBITRUM_ONE_RPC_NODES,
                base_testnet_endpoints=settings.BASE_TESTNET_RPC_NODES,
                optimism_testnet_endpoints=settings.OPTIMISM_TESTNET_RPC_NODES,
                ethereum_testnet_endpoints=settings.ETHEREUM_TESTNET_RPC_NODES,
                avalanche_testnet_endpoints=settings.AVALANCHE_TESTNET_RPC_NODES,
                polygon_pos_testnet_endpoints=settings.POLYGON_POS_TESTNET_RPC_NODES,
                arbitrum_one_testnet_endpoints=settings.ARBITRUM_ONE_TESTNET_RPC_NODES,
            ),
        )

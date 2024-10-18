import logging
from typing import Any

import requests

from django.core.management.base import BaseCommand

from bridgebloc.apps.tokens.models import Token
from bridgebloc.evm.types import ChainID

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    """Fetches and stores token information from Coingecko into the database."""

    help = 'Fetches and stores token information from Coingecko'  # noqa: A003
    SUPPORTED_COINGECKO_IDS = ('usd-coin', 'dai', 'tether', 'weth')
    IMAGE_BASE_URL = 'https://raw.githubusercontent.com/SmolDapp/tokenAssets/main/tokens/{}/{}/logo-128.png'

    def handle(self, *args: Any, **options: Any) -> None:  # noqa: ARG002
        try:
            self.fetch_and_store_mainnet_tokens()
        except Exception:
            logger.exception('Error in fetch_and_store_mainnet_tokens')

        try:
            self.populate_testnet_tokens()
        except Exception:
            logger.exception('Error in populate_testnet_tokens')

    def fetch_and_store_mainnet_tokens(self) -> None:
        """Fetches mainnet token data from Coingecko and stores it in the database."""
        tokens_to_create = []

        for coingecko_id in self.SUPPORTED_COINGECKO_IDS:
            try:
                url = f'https://api.coingecko.com/api/v3/coins/{coingecko_id}'
                response = requests.get(url, timeout=10)
                response.raise_for_status()
                token_data = response.json()

                for chain_id in ChainID:
                    if not chain_id.is_mainnet():
                        continue

                    platform_data = token_data['detail_platforms'][chain_id.to_coingecko_id()]
                    address = platform_data['contract_address']
                    image_url = self.IMAGE_BASE_URL.format(chain_id.value, address)

                    tokens_to_create.append(
                        Token(
                            chain_id=chain_id,
                            name=token_data['name'],
                            symbol=token_data['symbol'],
                            coingecko_id=token_data['id'],
                            decimals=platform_data['decimal_place'],
                            address=address,
                            image_url=image_url,
                        ),
                    )

            except Exception:
                logger.exception(f'Error fetching token information for {coingecko_id}')

        if tokens_to_create:
            logger.warning('No mainnet tokens were created.')

        Token.objects.bulk_create(tokens_to_create, ignore_conflicts=True)

    @staticmethod
    def populate_testnet_tokens() -> None:
        """Populates testnet token data based on mainnet tokens."""
        testnet_data = {
            ChainID.BASE_TESTNET: [('0x036CbD53842c5426634e7929541eC2318f3dCF7e', 'usd-coin')],
            ChainID.ETHEREUM_TESTNET: [('0x07865c6E87B9F70255377e024ace6630C1Eaa37F', 'usd-coin')],
            ChainID.OPTIMISM_TESTNET: [('0x5fd84259d66Cd46123540766Be93DFE6D43130D7', 'usd-coin')],
            ChainID.POLYGON_POS_TESTNET: [('0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582', 'usd-coin')],
            ChainID.ARBITRUM_ONE_TESTNET: [('0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', 'usd-coin')],
        }

        testnet_tokens = [
            Token(
                name=mainnet_token.name,
                symbol=mainnet_token.symbol,
                chain_id=testnet_chain_id,
                decimals=mainnet_token.decimals,
                coingecko_id=mainnet_token.coingecko_id,
                address=address,
                image_url=mainnet_token.image_url,
            )
            for testnet_chain_id, tokens in testnet_data.items()
            for address, coingecko_id in tokens
            if (mainnet_token := Token.objects.filter(coingecko_id=coingecko_id).first())
        ]

        if not testnet_tokens:
            logger.warning('No testnet tokens were created.')

        Token.objects.bulk_create(testnet_tokens, ignore_conflicts=True)

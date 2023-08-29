from pathlib import Path
from typing import Any

import requests

from django.contrib.staticfiles import finders
from django.core.management.base import BaseCommand, CommandError

from bridgebloc.apps.tokens.models import Token
from bridgebloc.evm.types import ChainID


class Command(BaseCommand):
    help = 'Fetches and stores token information from Coingecko into the database'  # noqa: A003

    SUPPORTED_COINGECKO_IDS = ('usd-coin', 'dai', 'tether', 'weth')

    def handle(self, *args: Any, **options: Any) -> None:  # noqa: ARG002
        tokens_to_create = []
        for coingecko_id in self.SUPPORTED_COINGECKO_IDS:
            try:
                token_data = self._fetch_mainnet_token_data(coingecko_id)
                tokens_to_create.extend(self._extract_tokens(token_data))
            except Exception as e:  # noqa: BLE001
                raise CommandError(f'Error fetching token information for {coingecko_id}: {e}') from e

        Token.objects.bulk_create(tokens_to_create, ignore_conflicts=True)

        self._populate_testnet_token_data()

    @staticmethod
    def _populate_testnet_token_data() -> None:
        token_addresses: dict[ChainID, list[tuple[str, str]]] = {
            ChainID.ETHEREUM_TESTNET: [
                ('0x07865c6E87B9F70255377e024ace6630C1Eaa37F', 'usd-coin'),
            ],
            ChainID.ARBITRUM_ONE_TESTNET: [
                ('0xfd064A18f3BF249cf1f87FC203E90D8f650f2d63', 'usd-coin'),
            ],
            ChainID.POLYGON_POS_TESTNET: [
                ('0x0FA8781a83E46826621b3BC094Ea2A0212e71B23', 'usd-coin'),
            ],
            ChainID.AVALANCHE_TESTNET: [
                ('0x5425890298aed601595a70AB815c96711a31Bc65', 'usd-coin'),
            ],
            ChainID.POLYGON_ZKEVM_TESTNET: [
                ('0xA40b0dA87577Cd224962e8A3420631E1C4bD9A9f', 'usd-coin'),
            ],
        }
        testnet_tokens = []
        for chain_id, tokens in token_addresses.items():
            for token in tokens:
                mainnet_token = Token.objects.filter(coingecko_id=token[1]).first()
                if mainnet_token:
                    testnet_tokens.append(
                        Token(
                            name=mainnet_token.name,
                            symbol=mainnet_token.symbol,
                            chain_id=chain_id,
                            decimals=mainnet_token.decimals,
                            coingecko_id=mainnet_token.coingecko_id,
                            address=token[0],
                        ),
                    )

        Token.objects.bulk_create(testnet_tokens, ignore_conflicts=True)

    @staticmethod
    def _fetch_mainnet_token_data(coingecko_id: str) -> dict[str, Any]:
        """Fetches token data from the Coingecko API."""
        url = f'https://api.coingecko.com/api/v3/coins/{coingecko_id}'
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()

    def _extract_tokens(self, token_data: dict[str, Any]) -> list[Token]:
        """Extracts tokens from token data."""
        tokens = []
        for chain_id in ChainID:
            if not chain_id.is_mainnet():
                continue

            if chain_id == ChainID.POLYGON_ZKEVM and token_data['id'] == 'weth':
                continue

            tokens.append(
                Token(
                    chain_id=chain_id,
                    name=token_data['name'],
                    symbol=token_data['symbol'],
                    coingecko_id=token_data['id'],
                    decimals=token_data['detail_platforms'][chain_id.to_coingecko_id()]['decimal_place'],
                    address=token_data['detail_platforms'][chain_id.to_coingecko_id()]['contract_address'],
                ),
            )

            self._save_token_image(token_data['id'], token_data['image']['large'])

        return tokens

    @staticmethod
    def _save_token_image(coingecko_id: str, url: str) -> None:
        """Save a token image to the ``tokens`` static directory."""
        result = finders.find(f'images/{coingecko_id}.png')
        if result:
            return

        image_path = Path(__file__).resolve().parent.parent.parent / 'static' / 'images' / f'{coingecko_id}.png'
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        with image_path.open('wb') as f:
            f.write(response.content)

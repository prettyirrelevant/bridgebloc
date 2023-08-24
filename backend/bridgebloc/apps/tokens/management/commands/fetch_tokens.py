from pathlib import Path
from typing import Any

import requests

from django.contrib.staticfiles import finders
from django.core.management.base import BaseCommand, CommandError

from bridgebloc.apps.tokens.models import Token
from bridgebloc.evm.types import ChainID


class Command(BaseCommand):
    help = 'Fetches and stores token information from Coingecko into the database'  # noqa: A003

    def handle(self, *args: Any, **options: Any) -> None:  # noqa: ARG002
        supported_coingecko_ids = ['usd-coin', 'dai', 'tether', 'weth']
        tokens_to_create = []
        for coingecko_id in supported_coingecko_ids:
            try:
                token_data = self._fetch_mainnet_token_data(coingecko_id)
                tokens_to_create.extend(self._extract_tokens(token_data))
            except Exception as e:  # noqa: BLE001
                raise CommandError(f'Error fetching token information for {coingecko_id}: {e}') from e

        Token.objects.bulk_create(tokens_to_create)

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
        chains_not_supporting_matic = {ChainID.ARBITRUM_ONE, ChainID.AVALANCHE, ChainID.POLYGON_ZKEVM}
        for chain_id in ChainID:
            if not chain_id.is_mainnet():
                continue

            if chain_id in chains_not_supporting_matic and token_data['id'] == 'matic-network':
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

import uuid
from decimal import Decimal
from typing import Any, Literal

import requests
from eth_utils.address import to_checksum_address


class CircleAPI:
    def __init__(self, api_key: str, base_url: str) -> None:
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()

    def _build_url(self, endpoint: str) -> str:
        return f'{self.base_url}/{endpoint}'

    def _request(
        self,
        method: Literal['GET', 'POST'],
        endpoint: str,
        params: dict[str, Any] | None = None,
        data: dict[str, Any] | None = None,
    ) -> requests.Response:
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
        }
        url = self._build_url(endpoint)
        response = self.session.request(method, url, params=params, json=data, headers=headers)
        response.raise_for_status()

        return response

    def ping(self) -> bool:
        response = self._request('GET', 'ping')
        return response.json().get('message') == 'pong'

    def create_payment_intent(self, amount: Decimal, chain: str) -> dict[str, Any]:
        response = self._request(
            method='POST',
            endpoint='v1/paymentIntents',
            data={
                'idempotencyKey': str(uuid.uuid4()),
                'amount': {'amount': str(amount), 'currency': 'USD'},
                'settlementCurrency': 'USD',
                'paymentMethods': [{'type': 'blockchain', 'chain': chain}],
            },
        )
        return response.json()

    def get_payment_intent(self, payment_intent_id: str) -> dict[str, Any]:
        response = self._request(
            method='GET',
            endpoint=f'v1/paymentIntents/{payment_intent_id}',
        )
        return response.json()

    def make_withdrawal(
        self,
        amount: Decimal,
        master_wallet_id: int,
        destination_address: str,
        chain: str,
    ) -> dict[str, Any]:
        response = self._request(
            method='POST',
            endpoint='v1/transfers',
            data={
                'idempotencyKey': str(uuid.uuid4()),
                'source': {
                    'type': 'wallet',
                    'id': str(master_wallet_id),
                },
                'destination': {
                    'type': 'blockchain',
                    'address': to_checksum_address(destination_address),
                    'chain': chain,
                },
                'amount': {'amount': f'{amount:.2f}', 'currency': 'USD'},
            },
        )
        return response.json()

    def get_withdrawal_info(self, withdrawal_id: str) -> dict[str, Any]:
        response = self._request(
            method='GET',
            endpoint=f'v1/transfers/{withdrawal_id}',
        )
        return response.json()

    def add_recipient(self, address: str, chain: str) -> dict[str, Any]:
        response = self._request(
            method='POST',
            endpoint='v1/addressBook/recipients',
            data={
                'chain': chain,
                'idempotencyKey': str(uuid.uuid4()),
                'address': to_checksum_address(address),
            },
        )
        return response.json()

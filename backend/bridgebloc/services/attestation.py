from typing import Any

import requests
from eth_typing import HexStr


class AttestationService:  # pylint: disable=too-few-public-methods
    def __init__(self, base_url: str) -> None:
        self.base_url = base_url
        self.session = requests.Session()

    def get_attestation(self, message_hash: HexStr) -> dict[str, Any]:
        url = f'{self.base_url}/v1/attestations/{message_hash}'
        response = self.session.get(url=url)
        response.raise_for_status()

        return response.json()

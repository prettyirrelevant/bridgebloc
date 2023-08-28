from typing import Any

import requests


class MerkleProofService:  # pylint: disable=too-few-public-methods
    def __init__(self, base_url: str) -> None:
        self.base_url = base_url
        self.session = requests.Session()

    def get_merkle_proof(self, deposit_count: int, origin_id: int) -> dict[str, Any]:
        response = self.session.get(
            url=f'{self.base_url}/merkle-proof',
            params={'deposit_cnt': deposit_count, 'net_id': origin_id},
        )
        response.raise_for_status()
        return response.json()

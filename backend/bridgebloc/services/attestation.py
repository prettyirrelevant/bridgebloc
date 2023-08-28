import time
from typing import Any

import requests
from eth_typing import HexStr


class AttestationService:
    def __init__(self, base_url: str) -> None:
        self.base_url = base_url
        self.last_request_time = 0
        self.requests_per_second = 10
        self.session = requests.Session()
        self.request_interval = 1.0 / self.requests_per_second

    def wait_for_rate_limit(self) -> None:
        elapsed_time = time.time() - self.last_request_time
        if elapsed_time < self.request_interval:
            time.sleep(self.request_interval - elapsed_time)

    def get_attestation(self, message_hash: HexStr) -> dict[str, Any]:
        self.wait_for_rate_limit()

        url = f'{self.base_url}/v1/attestations/{message_hash}'
        response = self.session.get(url=url)
        response.raise_for_status()

        self.last_request_time = int(time.time())
        return response.json()

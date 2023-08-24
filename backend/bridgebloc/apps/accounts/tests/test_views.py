import pytest
from eth_account.account import Account
from eth_utils.hexadecimal import is_hexstr

from django.core.cache import cache

from rest_framework.status import HTTP_200_OK
from rest_framework.test import APIClient


@pytest.mark.django_db()
def test_nonce_endpoint(api_client: APIClient) -> None:
    account = Account.create()
    response = api_client.get(f'/api/accounts/nonce/{account.address}')

    nonce_from_cache = cache.get(account.address)

    assert response.status_code == HTTP_200_OK
    assert is_hexstr(response.json()['data']['nonce'])
    assert response.json()['data']['nonce'] == nonce_from_cache
    assert response.json()['data']['checksum_address'] == account.address

from rest_framework.status import HTTP_200_OK
from rest_framework.test import APIClient


def test_ping_endpoint(api_client: APIClient) -> None:
    response = api_client.get('/api/ping')

    assert response.status_code == HTTP_200_OK
    assert not response.content

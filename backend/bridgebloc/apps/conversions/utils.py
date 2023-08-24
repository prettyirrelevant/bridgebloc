from django.conf import settings

from bridgebloc.evm.types import ChainID
from bridgebloc.services.circle import CircleAPI

from .constants import VALID_CONVERSION_ROUTES
from .types import ConversionMethod


def is_valid_route(source: ChainID, dest: ChainID, method: ConversionMethod) -> bool:
    return VALID_CONVERSION_ROUTES[source].get(dest) == method


def get_circle_api_client(chain: ChainID) -> CircleAPI:
    if chain.is_mainnet():
        return CircleAPI(api_key=settings.CIRCLE_LIVE_API_KEY, base_url=settings.CIRCLE_LIVE_BASE_URL)

    return CircleAPI(api_key=settings.CIRCLE_SANDBOX_API_KEY, base_url=settings.CIRCLE_SANDBOX_BASE_URL)

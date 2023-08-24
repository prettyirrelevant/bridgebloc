from secrets import token_hex
from typing import Any

from eth_typing import ChecksumAddress
from eth_utils.address import is_address, to_checksum_address

from django.core.cache import cache

from rest_framework.exceptions import ParseError
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from bridgebloc.common.helpers import success_response

from .models import Account


class NonceAPIView(APIView):
    def get(self, request: Request, *args: Any, **kwargs: Any) -> Response:  # noqa: ARG002
        address = self.validate_address(kwargs['address'])

        nonce = token_hex(16)
        cache.set(key=address, value=nonce)
        Account.objects.get_or_create(address=address, defaults={'address': address})
        return success_response({'nonce': nonce, 'checksum_address': address})

    @staticmethod
    def validate_address(address: str) -> ChecksumAddress:
        if not is_address(address):
            raise ParseError(detail='Address provided is not valid')

        return to_checksum_address(address)

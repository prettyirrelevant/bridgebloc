from typing import Any

from eth_account.messages import SignableMessage, encode_defunct
from eth_utils.address import is_checksum_address
from web3.auto import w3

from django.core.cache import cache

from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .models import Account


class Web3Authentication(TokenAuthentication):
    keyword = 'Signature'

    def authenticate_credentials(self, key: str) -> tuple[Any, Any]:
        address, signature = key.split(':')
        if not is_checksum_address(address):
            raise AuthenticationFailed(detail='Invalid address provided in signature. Make sure it is checksum')

        try:
            account = Account.objects.get(address=address)
        except Account.DoesNotExist as e:
            raise AuthenticationFailed(detail=f'Account with address {address} does not exist') from e

        nonce = cache.get(address, default=None)
        if nonce is None:
            raise AuthenticationFailed(detail='Nonce has been used or expired')

        msg = self.recreate_signed_message(nonce)
        retrieved_address = w3.eth.account.recover_message(
            signable_message=msg,
            signature=signature.encode(),
        )
        if address != retrieved_address:
            raise AuthenticationFailed('Signature provided is not valid for the address')

        cache.delete(address)
        return account, None

    @staticmethod
    def recreate_signed_message(nonce: str) -> SignableMessage:
        msg = f'Message: Welcome to BridgeBloc!\nNonce: {nonce}\nURI: https://bridgebloc.vercel.app'
        return encode_defunct(text=msg)

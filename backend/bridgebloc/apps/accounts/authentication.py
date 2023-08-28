from typing import Any

from eth_account.messages import SignableMessage, encode_defunct
from eth_utils.address import is_checksum_address
from web3.auto import w3

from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .models import Account


class Web3Authentication(TokenAuthentication):
    keyword = 'Signature'

    def authenticate_credentials(self, key: str) -> tuple[Any, Any]:
        address, signature = key.split(':')
        if not is_checksum_address(address):
            raise AuthenticationFailed(detail='Invalid address provided in signature. Make sure it is checksum')

        msg = self.recreate_signed_message()
        retrieved_address = w3.eth.account.recover_message(
            signable_message=msg,
            signature=signature,
        )
        if address != retrieved_address:
            raise AuthenticationFailed('Signature provided is not valid for the address')

        account, _ = Account.objects.get_or_create(address=address, defaults={'address': address})
        return account, None

    @staticmethod
    def recreate_signed_message() -> SignableMessage:
        msg = 'Message: Welcome to BridgeBloc!\nURI: https://bridgebloc.vercel.app'
        return encode_defunct(text=msg)

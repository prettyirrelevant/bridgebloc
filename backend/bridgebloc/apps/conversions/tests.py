from eth_account import Account as EthAccount
from eth_account.messages import encode_defunct

from django.test import Client, TestCase
from django.urls import reverse_lazy

from rest_framework import status

from bridgebloc.apps.accounts.models import Account
from bridgebloc.apps.tokens.models import Token
from bridgebloc.evm.types import ChainID

from .enums import CCTPConversionStepType, TokenConversionStepStatus
from .models import TokenConversion, TokenConversionStep
from .types import ConversionMethod


class ValidTokenConversionRoutesAPIViewTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = reverse_lazy('conversion-routes')

    def test_get_valid_routes(self):
        response = self.client.get(self.url)
        assert response.status_code == status.HTTP_200_OK

        data = response.json()['data']

        assert 'base' in data
        assert 'ethereum' in data
        assert 'ethereum' in data['base']

        assert 'ethereum_testnet' in data
        assert 'base_testnet' in data
        assert 'ethereum_testnet' in data['base_testnet']

        assert data['base']['polygon_pos'] == ConversionMethod.CCTP
        assert data['ethereum_testnet']['optimism_testnet'] == ConversionMethod.CCTP

        assert 'ethereum' not in data['ethereum']
        assert 'base_testnet' not in data['base_testnet']


class CCTPTokenConversionInitialisationAPIViewTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.eth_account = EthAccount.create()
        self.url = reverse_lazy('bridge-with-cctp')
        self.account = Account.objects.create(address=self.eth_account.address)

        message = encode_defunct(text='Message: Welcome to BridgeBloc!\nURI: https://bridgebloc.vercel.app')
        self.signed_message = self.eth_account.sign_message(message)
        self.auth_header = f'Signature {self.eth_account.address}:{self.signed_message.signature.hex()}'

        self.source_token = Token.objects.create(
            chain_id=ChainID.POLYGON_POS_TESTNET,
            address='0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582',
            symbol='usdc',
            decimals=6,
        )
        self.destination_token = Token.objects.create(
            chain_id=ChainID.BASE_TESTNET,
            address='0x036CbD53842c5426634e7929541eC2318f3dCF7e',
            symbol='usdc',
            decimals=6,
        )

    def test_initialise_token_conversion(self):
        data = {
            'tx_hash': '0x0af136c73c5510cbe432a139a4522835d2efafd000865970fb8d985e7c24f1d6',
            'source_chain': 'polygon_pos_testnet',
            'destination_chain': 'base_testnet',
        }

        response = self.client.post(path=self.url, data=data, format='json', HTTP_AUTHORIZATION=self.auth_header)

        assert response.status_code == status.HTTP_201_CREATED
        assert 'id' in response.json()['data']

        conversion = TokenConversion.objects.get(uuid=response.json()['data']['id'])
        # the address that initiated the bridging
        assert conversion.creator.address == '0xef464a3642CF261186393E5571200dD4142dE4fF'
        assert conversion.conversion_type == ConversionMethod.CCTP

        step = TokenConversionStep.objects.get(conversion=conversion)
        assert step.step_type == CCTPConversionStepType.ATTESTATION_SERVICE_CONFIRMATION
        assert step.status == TokenConversionStepStatus.PENDING

    def test_initialise_token_conversion_unauthorized(self):
        data = {
            'tx_hash': '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            'source_chain': 'ethereum',
            'destination_chain': 'polygon',
        }
        response = self.client.post(self.url, data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_initialise_token_conversion_invalid_data(self):
        data = {
            'tx_hash': '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            'source_chain': 'invalid_chain',
            'destination_chain': 'base_testnet',
        }
        response = self.client.post(self.url, data, format='json', HTTP_AUTHORIZATION=self.auth_header)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        data = {
            'tx_hash': '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            'source_chain': 'base',
            'destination_chain': 'base',
        }
        response = self.client.post(self.url, data, format='json', HTTP_AUTHORIZATION=self.auth_header)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

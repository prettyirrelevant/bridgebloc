from eth_typing import ChecksumAddress
from eth_utils.address import to_checksum_address

from django.conf import settings

from bridgebloc.evm.types import ChainID
from bridgebloc.services.attestation import AttestationService


def get_cross_chain_bridge_deployment_address(chain: ChainID) -> ChecksumAddress:
    if not chain.is_valid_cctp_chain():
        raise ValueError(f'{chain} is not a valid CCTP chain')

    address = getattr(settings, f'CROSS_CHAIN_BRIDGE_{chain.name}_DEPLOYED_ADDRESS', None)
    if not address:
        raise ValueError(f'CrossChainBridge not deployed on chain {chain}')

    return to_checksum_address(address)


def get_token_messenger_deployment_address(chain: ChainID) -> ChecksumAddress:
    if not chain.is_valid_cctp_chain():
        raise ValueError(f'{chain} is not a valid CCTP chain')

    address = getattr(settings, f'TOKEN_MESSENGER_{chain.name}_DEPLOYED_ADDRESS', None)
    if not address:
        raise ValueError(f'TokenMessenger not deployed on chain {chain}')

    return to_checksum_address(address)


def get_attestation_client(chain: ChainID) -> AttestationService:
    if not chain.is_valid_cctp_chain():
        raise ValueError(f'{chain} is not a valid CCTP chain')

    if chain.is_mainnet():
        return AttestationService(base_url=settings.CIRCLE_ATTESTATION_BASE_URL)

    return AttestationService(base_url=settings.CIRCLE_SANDBOX_ATTESTATION_BASE_URL)

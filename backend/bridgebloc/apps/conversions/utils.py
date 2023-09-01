from eth_typing import ChecksumAddress
from eth_utils.address import to_checksum_address

from django.conf import settings

from bridgebloc.evm.types import ChainID
from bridgebloc.services.attestation import AttestationService
from bridgebloc.services.circle import CircleAPI
from bridgebloc.services.lxly_merkle_proof import MerkleProofService

from .constants import VALID_CONVERSION_ROUTES
from .types import ConversionMethod


def is_valid_route(source: ChainID, dest: ChainID, method: ConversionMethod) -> bool:
    return VALID_CONVERSION_ROUTES[source].get(dest) == method


def get_circle_api_client(chain: ChainID) -> CircleAPI:
    if chain.is_mainnet():
        return CircleAPI(api_key=settings.CIRCLE_LIVE_API_KEY, base_url=settings.CIRCLE_LIVE_BASE_URL)

    return CircleAPI(api_key=settings.CIRCLE_SANDBOX_API_KEY, base_url=settings.CIRCLE_SANDBOX_BASE_URL)


def get_cross_chain_bridge_deployment_address(chain: ChainID) -> ChecksumAddress:
    if not chain.is_valid_cctp_chain():
        raise ValueError(f'{chain} is not a valid CCTP chain')

    if chain == ChainID.ETHEREUM:
        return to_checksum_address(settings.CROSS_CHAIN_BRIDGE_ETHEREUM_DEPLOYED_ADDRESS)
    if chain == ChainID.ETHEREUM_TESTNET:
        return to_checksum_address(settings.CROSS_CHAIN_BRIDGE_ETHEREUM_TESTNET_DEPLOYED_ADDRESS)
    if chain == ChainID.AVALANCHE:
        return to_checksum_address(settings.CROSS_CHAIN_BRIDGE_AVALANCHE_DEPLOYED_ADDRESS)
    if chain == ChainID.AVALANCHE_TESTNET:
        return to_checksum_address(settings.CROSS_CHAIN_BRIDGE_AVALANCHE_TESTNET_DEPLOYED_ADDRESS)
    if chain == ChainID.ARBITRUM_ONE:
        return to_checksum_address(settings.CROSS_CHAIN_BRIDGE_ARBITRUM_ONE_DEPLOYED_ADDRESS)
    if chain == ChainID.ARBITRUM_ONE_TESTNET:
        return to_checksum_address(settings.CROSS_CHAIN_BRIDGE_ARBITRUM_ONE_TESTNET_DEPLOYED_ADDRESS)

    raise ValueError(f'CrossChainBridge not deployed on chain {chain}')


def get_token_messenger_deployment_address(chain: ChainID) -> ChecksumAddress:
    if not chain.is_valid_cctp_chain():
        raise ValueError(f'{chain} is not a valid CCTP chain')

    if chain == ChainID.ETHEREUM:
        return to_checksum_address(settings.TOKEN_MESSENGER_ETHEREUM_DEPLOYED_ADDRESS)
    if chain == ChainID.ETHEREUM_TESTNET:
        return to_checksum_address(settings.TOKEN_MESSENGER_ETHEREUM_TESTNET_DEPLOYED_ADDRESS)
    if chain == ChainID.AVALANCHE:
        return to_checksum_address(settings.TOKEN_MESSENGER_AVALANCHE_DEPLOYED_ADDRESS)
    if chain == ChainID.AVALANCHE_TESTNET:
        return to_checksum_address(settings.TOKEN_MESSENGER_AVALANCHE_TESTNET_DEPLOYED_ADDRESS)
    if chain == ChainID.ARBITRUM_ONE:
        return to_checksum_address(settings.TOKEN_MESSENGER_ARBITRUM_ONE_DEPLOYED_ADDRESS)
    if chain == ChainID.ARBITRUM_ONE_TESTNET:
        return to_checksum_address(settings.TOKEN_MESSENGER_ARBITRUM_ONE_TESTNET_DEPLOYED_ADDRESS)

    raise ValueError(f'TokenMessenger not deployed on chain {chain}')


def get_polygon_zkevm_bridge_deployment_address(chain: ChainID) -> ChecksumAddress:
    if not chain.is_valid_lxly_chain():
        raise ValueError(f'{chain} is not a valid CCTP chain')

    if chain.is_mainnet():
        return to_checksum_address(settings.POLYGON_ZKEVM_BRIDGE_DEPLOYED_ADDRESS)

    return to_checksum_address(settings.POLYGON_ZKEVM_BRIDGE_TESTNET_DEPLOYED_ADDRESS)


def get_rollup_bridge_deployment_address(chain: ChainID) -> ChecksumAddress:
    if not chain.is_valid_lxly_chain():
        raise ValueError(f'{chain} is not a valid LxLy chain')

    if chain.is_mainnet():
        return to_checksum_address(settings.ROLLUP_BRIDGE_POLYGON_ZKEVM_DEPLOYED_ADDRESS)

    return to_checksum_address(settings.ROLLUP_BRIDGE_POLYGON_ZKEVM_TESTNET_DEPLOYED_ADDRESS)


def get_attestation_client(chain: ChainID) -> AttestationService:
    if not chain.is_valid_cctp_chain():
        raise ValueError(f'{chain} is not a valid CCTP chain')

    if chain.is_mainnet():
        return AttestationService(base_url=settings.CIRCLE_ATTESTATION_BASE_URL)

    return AttestationService(base_url=settings.CIRCLE_SANDBOX_ATTESTATION_BASE_URL)


def get_merkle_proof_client(chain: ChainID) -> MerkleProofService:
    if not chain.is_valid_lxly_chain():
        raise ValueError(f'{chain} is not a valid LxLy chain')

    if chain.is_mainnet():
        return MerkleProofService(base_url=settings.POLYGON_ZKEVM_MERKLE_PROOF_BASE_URL)

    return MerkleProofService(base_url=settings.POLYGON_ZKEVM_MERKLE_PROOF_TESTNET_BASE_URL)

import json
import logging
import secrets
from collections.abc import Callable
from functools import wraps
from pathlib import Path
from typing import Any, Literal
from urllib.parse import urlparse

from eth_account.signers.local import LocalAccount
from eth_typing import BlockNumber, ChecksumAddress, HexStr
from hexbytes import HexBytes
from requests import RequestException
from web3 import HTTPProvider, Web3
from web3._utils.filters import construct_event_filter_params
from web3.contract.contract import Contract
from web3.exceptions import TransactionNotFound, Web3Exception
from web3.middleware.cache import construct_simple_cache_middleware
from web3.middleware.geth_poa import geth_poa_middleware
from web3.types import ABIEvent, LogReceipt, TxData, TxParams, TxReceipt
from web3.utils.caching import SimpleCache

from bridgebloc.evm.constants import DEFAULT_RPC_TIMEOUT
from bridgebloc.evm.types import ChainID

logger = logging.getLogger(__name__)


def query_all_nodes() -> Callable:
    def wrapper(fn: Callable) -> Callable:
        @wraps(fn)
        def decorator(
            self: 'EVMClient',
            *args: tuple[Any],
            **kwargs: dict[str, Any],
        ) -> Any:
            for endpoint, w3 in self.connected_nodes.items():
                try:
                    response = fn(self, w3, *args, **kwargs)
                except (Web3Exception, RequestException, ValueError) as e:
                    if isinstance(e, TransactionNotFound):
                        raise

                    logger.exception(f'Failed to query {endpoint} for {fn.__name__!r} due to:')
                    continue

                return response

            raise RuntimeError(
                f'Unable to query {fn.__name__!r} with kwargs: {kwargs} after attempting {self.connected_nodes}',
            )

        return decorator

    return wrapper


class EVMClient:
    def __init__(self, chain: ChainID, rpc_endpoints: list[str], timeout: int = DEFAULT_RPC_TIMEOUT) -> None:
        self.chain = chain
        self.timeout = timeout
        self.abi_dir = Path(__file__).resolve().parent / 'abis'
        self.connected_nodes: dict[str, Web3] = {}
        self._connect_to_nodes(rpc_endpoints)

    def get_web3(self) -> Web3:
        return secrets.choice(list(self.connected_nodes.values()))

    @query_all_nodes()
    def get_latest_block(self, w3: Web3) -> BlockNumber:
        return w3.eth.block_number

    @query_all_nodes()
    def get_transaction_receipt(self, w3: Web3, tx_hash: HexStr) -> TxReceipt:
        return w3.eth.get_transaction_receipt(tx_hash)

    @query_all_nodes()
    def get_transaction(self, w3: Web3, tx_hash: HexStr) -> TxData:
        return w3.eth.get_transaction(tx_hash)

    @query_all_nodes()
    def publish_transaction(
        self,
        w3: Web3,
        tx_params: TxParams,
        sender: LocalAccount,
    ) -> HexBytes:
        tx_params['chainId'] = self.chain.value
        tx_params['nonce'] = w3.eth.get_transaction_count(sender.address)

        signed_txn = w3.eth.account.sign_transaction(tx_params, sender.key)
        return w3.eth.send_raw_transaction(signed_txn.rawTransaction)

    def get_contract(
        self,
        address: ChecksumAddress,
        name: Literal['CrossChainBridge', 'TokenMessenger', 'PolygonZkEVMBridge', 'RollupBridge'],
    ) -> Contract:
        if name in {'CrossChainBridge', 'TokenMessenger'} and not self.chain.is_valid_cctp_chain():
            raise ValueError(f'{name} contract is valid for {self.chain}')

        if name in {'PolygonZkEVMBridge', 'RollupBridge'} and not self.chain.is_valid_lxly_chain():
            raise ValueError(f'{name} contract is valid for {self.chain}')

        abi_path = self.abi_dir / f'{name}.abi'
        with abi_path.open('r') as abi_file:
            abi_content = json.load(abi_file)

        w3 = self.get_web3()
        return w3.eth.contract(address=address, abi=abi_content)

    @query_all_nodes()
    def get_events(
        self,
        w3: Web3,
        abi: ABIEvent,
        to_block: BlockNumber,
        from_block: BlockNumber,
        address: ChecksumAddress | None = None,
    ) -> list[LogReceipt]:
        _, filter_params = construct_event_filter_params(
            event_abi=abi,
            address=address,
            toBlock=to_block,
            abi_codec=w3.codec,
            fromBlock=from_block,
        )
        return w3.eth.get_logs(filter_params)

    def _connect_to_nodes(self, endpoints: list[str]) -> None:
        for endpoint in endpoints:
            if endpoint in self.connected_nodes:
                logger.debug(f'{endpoint} is already connected. Skipping...')
                continue

            try:
                self._validate_endpoint(endpoint)
            except Exception:
                logger.exception(f'Unable to connect to {endpoint}. Skipping...')
                continue

            web3 = Web3(HTTPProvider(endpoint, request_kwargs={'timeout': self.timeout}))
            web3.middleware_onion.remove('validation')  # makes an additional rpc call
            web3.middleware_onion.remove('name_to_address')  # ens is not needed
            web3.middleware_onion.inject(geth_poa_middleware, layer=0)

            simple_cache_middleware = construct_simple_cache_middleware(SimpleCache(1024))
            web3.middleware_onion.add(simple_cache_middleware)

            try:
                web3.is_connected()
            except RequestException:
                logger.warning(f'Failed to connect to rpc node with url {endpoint}. Skipping...')
                continue

            self.connected_nodes[endpoint] = web3

        if len(self.connected_nodes) == 0:
            raise ConnectionError(f'Unable to connect to any of the rpc nodes {endpoints}')

    @staticmethod
    def _validate_endpoint(endpoint: str) -> None:
        parsed_url = urlparse(endpoint)
        if parsed_url.scheme != 'https' or not parsed_url.netloc:
            raise ValueError('Provided URL is not secured or invalid')

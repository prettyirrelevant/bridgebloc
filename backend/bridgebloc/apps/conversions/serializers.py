import re
from typing import Any

from eth_utils.address import to_checksum_address
from web3 import Web3
from web3.logs import DISCARD
from web3.types import TxReceipt

from rest_framework import serializers

from bridgebloc.apps.accounts.serializers import AccountSerializer
from bridgebloc.apps.tokens.models import Token
from bridgebloc.apps.tokens.serializers import TokenSerializer
from bridgebloc.evm.aggregator import EVMAggregator
from bridgebloc.evm.client import EVMClient
from bridgebloc.evm.types import ChainID

from .models import TokenConversion, TokenConversionStep
from .types import ConversionMethod
from .utils import (
    get_cross_chain_bridge_deployment_address,
    get_polygon_zkevm_bridge_deployment_address,
    get_rollup_bridge_deployment_address,
    get_token_messenger_deployment_address,
    is_valid_route,
)


class CircleTokenConversionDepositTxHashUpdateSerializer(serializers.Serializer):
    tx_hash = serializers.CharField(required=True)

    def validate_tx_hash(self, value: str) -> str:
        is_valid_hash = re.fullmatch('^0x[a-fA-F0-9]{64}', value)
        if not bool(is_valid_hash):
            raise serializers.ValidationError('Invalid transaction hash provided')

        return value


class TokenConversionStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = TokenConversionStep
        fields = ('uuid', 'step_type', 'metadata', 'status', 'created_at', 'updated_at')


class TokenConversionSerializer(serializers.ModelSerializer):
    creator = AccountSerializer()
    source_token = TokenSerializer()
    destination_token = TokenSerializer()
    conversion_steps = TokenConversionStepSerializer(many=True)

    class Meta:
        model = TokenConversion
        fields = (
            'uuid',
            'amount',
            'creator',
            'source_chain',
            'source_token',
            'conversion_type',
            'conversion_steps',
            'destination_token',
            'destination_chain',
            'destination_address',
            'created_at',
            'updated_at',
        )


class CircleAPITokenConversionInitialisationSerializer(serializers.Serializer):
    source_chain = serializers.CharField(required=True)
    source_token = serializers.CharField(required=True)
    destination_chain = serializers.CharField(required=True)
    destination_token = serializers.CharField(required=True)
    destination_address = serializers.CharField(required=True)
    amount = serializers.DecimalField(required=True, max_digits=16, decimal_places=2, min_value=1)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        try:
            source_chain = ChainID.from_name(attrs['source_chain'])
            destination_chain = ChainID.from_name(attrs['destination_chain'])
        except ValueError as e:
            raise serializers.ValidationError(str(e)) from e

        # Only allow testnet for now since Circle Live API requires verification.
        if source_chain.is_mainnet() or destination_chain.is_mainnet():
            raise serializers.ValidationError('Only testnet network is supported via Circle API for now.')

        if source_chain == destination_chain:
            raise serializers.ValidationError('source_chain cannot be the same as destination_chain')

        if source_chain.is_mainnet() != destination_chain.is_mainnet():
            raise serializers.ValidationError(
                'Both source_chain and destination_chain must be on the same network (testnet or mainnet)',
            )

        if not is_valid_route(source_chain, destination_chain, ConversionMethod.CIRCLE_API):
            raise serializers.ValidationError('Circle API not supported for the source and destination chain')

        try:
            source_token = Token.objects.get(address=to_checksum_address(attrs['source_token']), chain_id=source_chain)
            if source_token.symbol != 'usdc':
                raise serializers.ValidationError('Only USDC bridging is allowed via Circle API')
        except Token.DoesNotExist as e:
            raise serializers.ValidationError('Token does not exist') from e

        try:
            destination_token = Token.objects.get(
                chain_id=destination_chain,
                address=to_checksum_address(attrs['destination_token']),
            )
            if destination_token.symbol != 'usdc':
                raise serializers.ValidationError('Only USDC bridging is allowed via Circle API')
        except Token.DoesNotExist as e:
            raise serializers.ValidationError('Token does not exist') from e

        return {
            'amount': attrs['amount'],
            'source_chain': source_chain,
            'source_token': source_token,
            'destination_chain': destination_chain,
            'destination_token': destination_token,
            'destination_address': to_checksum_address(attrs['destination_address']),
        }


class CCTPTokenConversionInitialisationSerializer(serializers.Serializer):
    tx_hash = serializers.CharField(required=True)
    source_chain = serializers.CharField(required=True)
    destination_chain = serializers.CharField(required=True)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        try:
            source_chain = ChainID.from_name(attrs['source_chain'])
            destination_chain = ChainID.from_name(attrs['destination_chain'])
        except ValueError as e:
            raise serializers.ValidationError(str(e)) from e

        if source_chain == destination_chain:
            raise serializers.ValidationError('source_chain cannot be the same as destination_chain')

        if source_chain.is_mainnet() != destination_chain.is_mainnet():
            raise serializers.ValidationError(
                'Both source_chain and destination_chain must be on the same network (testnet or mainnet)',
            )

        if not is_valid_route(source_chain, destination_chain, ConversionMethod.CCTP):
            raise serializers.ValidationError('CCTP not supported for the source and destination chain')

        evm_client = EVMAggregator().get_client(source_chain)  # pylint:disable=no-value-for-parameter
        tx_receipt = evm_client.get_transaction_receipt(attrs['tx_hash'])
        info = self._validate_tx_receipt(
            client=evm_client,
            receipt=tx_receipt,
            source_chain=source_chain,
            destination_chain=destination_chain,
        )
        attrs.update(info)
        return attrs

    def _validate_tx_receipt(  # pylint: disable=too-many-locals
        self,
        client: EVMClient,
        receipt: TxReceipt,
        source_chain: ChainID,
        destination_chain: ChainID,
    ) -> dict[str, Any]:
        cross_chain_bridge_address = get_cross_chain_bridge_deployment_address(source_chain)
        token_messenger_address = get_token_messenger_deployment_address(source_chain)
        cross_chain_bridge_contract = client.get_contract(
            name='CrossChainBridge',
            address=cross_chain_bridge_address,
        )
        token_messenger_contract = client.get_contract(
            name='TokenMessenger',
            address=token_messenger_address,
        )

        found_bridge_events = cross_chain_bridge_contract.events.BridgeDepositReceived().process_receipt(
            receipt,
            errors=DISCARD,
        )
        found_message_sent_events = token_messenger_contract.events.MessageSent().process_receipt(
            receipt,
            errors=DISCARD,
        )
        if len(found_bridge_events) != 1:
            raise serializers.ValidationError(
                f'Expected just one `BridgeDepositReceived` event, got {len(found_bridge_events)}',
            )

        if len(found_message_sent_events) != 1:
            raise serializers.ValidationError(
                f'Expected just one `MessageSent` event, got {len(found_message_sent_events)}',
            )

        bridge_deposit_received_event = found_bridge_events[0].args
        if bridge_deposit_received_event['sourceChain'] != source_chain.to_cctp_domain():
            raise serializers.ValidationError('cctp domain from event and serializer mismatch for source_chain')

        if bridge_deposit_received_event['destinationChain'] != destination_chain.to_cctp_domain():
            raise serializers.ValidationError('cctp domain from event and serializer mismatch for destination chain')

        if self.context['request'].user.address != to_checksum_address(bridge_deposit_received_event['from']):
            raise serializers.ValidationError(
                f'{bridge_deposit_received_event["from"]} does not match the authenticated user',
            )

        try:
            source_token = Token.objects.get(
                chain_id=source_chain,
                address=to_checksum_address(bridge_deposit_received_event['sourceToken']),
            )
            destination_token = Token.objects.get(
                chain_id=destination_chain,
                address=to_checksum_address(bridge_deposit_received_event['destinationToken']),
            )
        except Token.DoesNotExist as e:
            raise serializers.ValidationError('Token is not supported currently') from e

        usdc_token = Token.objects.filter(symbol='usdc').first()
        return {
            'source_token': source_token,
            'source_chain': source_chain,
            'destination_token': destination_token,
            'destination_chain': destination_chain,
            'nonce': bridge_deposit_received_event['nonce'],
            'message_bytes': found_message_sent_events[0].args.message.hex(),
            'message_hash': Web3.keccak(found_message_sent_events[0].args.message).hex(),
            'destination_address': to_checksum_address(bridge_deposit_received_event['recipient']),
            'amount': usdc_token.convert_from_wei_to_token(bridge_deposit_received_event['amount']),  # type: ignore[union-attr] # noqa: E501
        }


class LxLyTokenConversionInitialisationSerializer(serializers.Serializer):
    tx_hash = serializers.CharField(required=True)
    source_chain = serializers.CharField(required=True)
    destination_chain = serializers.CharField(required=True)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        try:
            source_chain = ChainID.from_name(attrs['source_chain'])
            destination_chain = ChainID.from_name(attrs['destination_chain'])
        except ValueError as e:
            raise serializers.ValidationError(str(e)) from e

        if source_chain == destination_chain:
            raise serializers.ValidationError('source_chain cannot be the same as destination_chain')

        if source_chain.is_mainnet() != destination_chain.is_mainnet():
            raise serializers.ValidationError(
                'Both source_chain and destination_chain must be on the same network (testnet or mainnet)',
            )

        if not is_valid_route(source_chain, destination_chain, ConversionMethod.LXLY):
            raise serializers.ValidationError('LxLy not supported for the source and destination chain')

        evm_client = EVMAggregator().get_client(source_chain)  # pylint:disable=no-value-for-parameter
        tx_receipt = evm_client.get_transaction_receipt(attrs['tx_hash'])
        validated_data = self._validate_tx_receipt(
            client=evm_client,
            receipt=tx_receipt,
            source_chain=source_chain,
            destination_chain=destination_chain,
        )
        attrs.update(validated_data)
        return attrs

    def _validate_tx_receipt(  # pylint: disable=too-many-locals
        self,
        client: EVMClient,
        receipt: TxReceipt,
        source_chain: ChainID,
        destination_chain: ChainID,
    ) -> dict[str, Any]:
        rollup_bridge_address = get_rollup_bridge_deployment_address(source_chain)
        rollup_bridge_contract = client.get_contract(name='RollupBridge', address=rollup_bridge_address)
        polygon_zkevm_bridge_address = get_polygon_zkevm_bridge_deployment_address(source_chain)
        polygon_zkevm_bridge_contract = client.get_contract(
            name='PolygonZkEVMBridge',
            address=polygon_zkevm_bridge_address,
        )

        found_rollup_bridge_events = rollup_bridge_contract.events.BridgeAsset().process_receipt(
            receipt,
            errors=DISCARD,
        )
        found_polygon_zkevm_bridge_events = polygon_zkevm_bridge_contract.events.BridgeEvent().process_receipt(
            receipt,
            errors=DISCARD,
        )
        if len(found_polygon_zkevm_bridge_events) != 1:
            raise serializers.ValidationError(
                f'Expected just one `BridgeEvent` event, got {len(found_polygon_zkevm_bridge_events)}',
            )
        if len(found_rollup_bridge_events) != 1:
            raise serializers.ValidationError(
                f'Expected just one `BridgeAsset` event, got {len(found_polygon_zkevm_bridge_events)}',
            )

        rollup_bridge_event = found_rollup_bridge_events[0].args
        polygon_zkevm_bridge_event = found_polygon_zkevm_bridge_events[0].args

        # Currently, we do not support ETH bridging via the API but keep in mind that the
        # `originNetwork` and `destinationNetwork` are always the same for such scenarios
        if polygon_zkevm_bridge_event['originNetwork'] != source_chain.to_lxly_domain():
            raise serializers.ValidationError('lxly domain from event and serializer mismatch for source_chain')

        if polygon_zkevm_bridge_event['destinationNetwork'] != destination_chain.to_lxly_domain():
            raise serializers.ValidationError('lxly domain from event and serializer mismatch for destination chain')

        try:
            source_token = Token.objects.get(
                chain_id=source_chain,
                address=to_checksum_address(rollup_bridge_event['sourceToken']),
            )
            destination_token = Token.objects.get(
                chain_id=destination_chain,
                address=to_checksum_address(rollup_bridge_event['destinationToken']),
            )
        except Token.DoesNotExist as e:
            raise serializers.ValidationError('Token is not supported currently') from e

        return {
            'source_token': source_token,
            'source_chain': source_chain,
            'destination_token': destination_token,
            'destination_chain': destination_chain,
            'leaf_type': polygon_zkevm_bridge_event['leafType'],
            'bridged_amount': polygon_zkevm_bridge_event['amount'],
            'deposit_count': polygon_zkevm_bridge_event['depositCount'],
            'origin_network': polygon_zkevm_bridge_event['originNetwork'],
            'origin_address': polygon_zkevm_bridge_event['originAddress'],
            'destination_network': polygon_zkevm_bridge_event['destinationNetwork'],
            'amount': destination_token.convert_from_wei_to_token(rollup_bridge_event['amount']),
            'destination_address': to_checksum_address(polygon_zkevm_bridge_event['destinationAddress']),
        }

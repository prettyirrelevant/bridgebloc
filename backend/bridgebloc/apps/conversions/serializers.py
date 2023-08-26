from typing import Any

from eth_utils.address import is_address, to_checksum_address
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
from .utils import is_valid_route


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

        if source_chain == destination_chain:
            raise serializers.ValidationError('source_chain cannot be the same as destination_chain')

        if not is_valid_route(source_chain, destination_chain, ConversionMethod.CIRCLE_API):
            raise serializers.ValidationError('Circle API not supported for the source and destination chain')

        if not is_address(attrs['destination_address']):
            raise serializers.ValidationError('destination_address is not valid address')

        if not is_address(attrs['source_token']) or not is_address(attrs['destination_token']):
            raise serializers.ValidationError('source_token and/or destination_token are not valid addresses')

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
    chain = serializers.CharField(required=True)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        try:
            chain = ChainID.from_name(attrs['chain'])
        except ValueError as e:
            raise serializers.ValidationError(str(e)) from e

        evm_client = EVMAggregator().get_client(chain)
        receipt = evm_client.get_transaction_receipt(attrs['tx_hash'])

        details = self._validate_transaction(evm_client, receipt)
        return attrs

    def _validate_transaction(self, client: EVMClient, receipt: TxReceipt, chain: ChainID) -> dict[str, Any]:
        cross_chain_bridge_contract = client.get_contract(
            name='CrossChainBridge',
            address='0x0a992d191DEeC32aFe36203Ad87D7d289a738F81',
        )
        token_messenger_contract = client.get_contract(
            name='TokenMessenger',
            address='0x0a992d191DEeC32aFe36203Ad87D7d289a738F81',
        )

        found_bridge_events = cross_chain_bridge_contract.events.BridgeDepositReceived().process_receipt(
            receipt, errors=DISCARD
        )
        if len(found_bridge_events) == 0 or len(found_bridge_events) > 1:
            raise serializers.ValidationError(
                f'Expected just one `BridgeDepositReceived` event, got {len(found_bridge_events)}'
            )

        bridge_event = found_bridge_events[0].args
        # check `from`
        # check `source chain`
        # check `source token`
        # check `destination chain`
        # check `destination token`
        if self.context['request'].user.address == to_checksum_address(bridge_event['from']):
            raise serializers.ValidationError(f'{bridge_event["from"]} does not match the authenticated user')

        try:
            source_token = Token.objects.get(address=to_checksum_address(bridge_event['sourceToken']), chain=chain)
            destination_token = Token.objects.get(address=to_checksum_address(bridge_event['destinationToken']), chain=chain)
        except Token.DoesNotExist:
            raise serializers.ValidationError('Token is not supported currently')

        found_message_sent_events = token_messenger_contract.events.MessageSent().process_receipt(
            receipt, errors=DISCARD
        )
        if len(found_message_sent_events) == 0 or len(found_message_sent_events) > 1:
            raise serializers.ValidationError(
                f'Expected just one `MessageSent` event, got {len(found_message_sent_events)}'
            )

        message_sent_event = found_message_sent_events[0].args
        return {}


class LxLyTokenConversionInitialisationSerializer(serializers.Serializer):
    tx_hash = serializers.CharField(required=True)
    chain = serializers.CharField(required=True)

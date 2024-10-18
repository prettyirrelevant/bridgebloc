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
from bridgebloc.evm.utils import bytes32_to_evm_address

from .models import TokenConversion, TokenConversionStep
from .utils import get_cross_chain_bridge_deployment_address, get_token_messenger_deployment_address


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
            print('source token:: ', bridge_deposit_received_event['sourceToken'])
            print('destination token:: ', bridge_deposit_received_event['destinationToken'])
            source_token = Token.objects.get(
                chain_id=source_chain,
                address=to_checksum_address(bridge_deposit_received_event['sourceToken']),
            )
            destination_token = Token.objects.get(
                chain_id=destination_chain,
                address=bytes32_to_evm_address(bridge_deposit_received_event['destinationToken']),
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
            'destination_address': bytes32_to_evm_address(bridge_deposit_received_event['recipient']),
            'amount': usdc_token.convert_from_wei_to_token(bridge_deposit_received_event['amount']),  # type: ignore[union-attr] # noqa: E501
        }

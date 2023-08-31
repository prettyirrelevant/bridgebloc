from collections import defaultdict
from typing import Any

from django.db import transaction
from django.db.models import QuerySet

from rest_framework import status
from rest_framework.generics import GenericAPIView, ListAPIView, RetrieveAPIView
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from bridgebloc.apps.accounts.permissions import IsAuthenticated
from bridgebloc.common.helpers import error_response, success_response
from bridgebloc.common.types import AuthenticatedRequest

from .constants import VALID_CONVERSION_ROUTES
from .enums import (
    CCTPConversionStepType,
    CircleAPIConversionStepType,
    LxLyConversionStepType,
    TokenConversionStepStatus,
)
from .models import TokenConversion, TokenConversionStep
from .permissions import IsOwner
from .serializers import (
    CCTPTokenConversionInitialisationSerializer,
    CircleAPITokenConversionInitialisationSerializer,
    CircleTokenConversionDepositTxHashUpdateSerializer,
    LxLyTokenConversionInitialisationSerializer,
    TokenConversionSerializer,
)
from .types import ConversionMethod
from .utils import get_circle_api_client


class ValidTokenConversionRoutesAPIView(APIView):
    def get(self, request: Request, *args: Any, **kwargs: Any) -> Response:  # noqa: ARG002
        data: dict[str, Any] = defaultdict(lambda: defaultdict())  # pylint:disable=unnecessary-lambda
        for key, val in VALID_CONVERSION_ROUTES.items():
            for k, v in val.items():
                data[key.name.lower()][k.name.lower()] = v

        return success_response(data=data)


class CircleTokenConversionDepositTxHashUpdateAPIView(GenericAPIView):
    queryset = TokenConversion.objects.select_related('creator').prefetch_related('conversion_steps')
    serializer_class = CircleTokenConversionDepositTxHashUpdateSerializer
    permission_classes = (IsAuthenticated, IsOwner)
    lookup_field = 'uuid'

    def patch(self, request: Request, *args: Any, **kwargs: Any) -> Response:  # noqa: ARG002
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        obj = self.get_object()
        step = obj.conversion_steps.filter(step_type=CircleAPIConversionStepType.CONFIRM_DEPOSIT).first()
        if step is None:
            return error_response(
                errors=None,
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                message='Token conversion is not of Circle API type or deposit address has not been created',
            )

        step.metadata['deposit_tx_hash'] = serializer.validated_data['tx_hash']
        step.save()
        return success_response(data=None)


class TokenConversionAPIView(RetrieveAPIView):
    queryset = TokenConversion.objects.select_related('creator').prefetch_related('conversion_steps')
    permission_classes = (IsAuthenticated, IsOwner)
    serializer_class = TokenConversionSerializer
    lookup_field = 'uuid'

    def retrieve(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        response = super().retrieve(request, *args, **kwargs)
        return success_response(data=response.data, status_code=response.status_code)


class TokenConversionsAPIView(ListAPIView):
    queryset = TokenConversion.objects.select_related('creator').prefetch_related('conversion_steps')
    serializer_class = TokenConversionSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self) -> QuerySet:
        qs = super().get_queryset()
        return qs.filter(creator=self.request.user).order_by('-created_at')

    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:  # noqa: A003
        response = super().list(request, *args, **kwargs)
        return success_response(data=response.data, status_code=response.status_code)


class CircleAPITokenConversionInitialisationAPIView(GenericAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = CircleAPITokenConversionInitialisationSerializer

    def post(self, request: AuthenticatedRequest, *args: Any, **kwargs: Any) -> Response:  # noqa: ARG002
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            conversion = TokenConversion.objects.create(
                creator=request.user,
                amount=serializer.validated_data['amount'],
                conversion_type=ConversionMethod.CIRCLE_API,
                source_chain=serializer.validated_data['source_chain'],
                source_token=serializer.validated_data['source_token'],
                destination_address=serializer.validated_data['destination_address'],
                destination_chain=serializer.validated_data['destination_chain'],
                destination_token=serializer.validated_data['destination_token'],
            )
            circle_client = get_circle_api_client(conversion.source_chain)
            result = circle_client.create_payment_intent(
                amount=conversion.amount,
                chain=conversion.source_chain.to_circle(),
            )
            TokenConversionStep.objects.create(
                metadata=result['data'],
                conversion=conversion,
                status=TokenConversionStepStatus.PENDING,
                step_type=CircleAPIConversionStepType.CREATE_DEPOSIT_ADDRESS,
            )
        return success_response(data={'id': conversion.uuid}, status_code=status.HTTP_201_CREATED)


class LxLyTokenConversionInitialisationAPIView(GenericAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = LxLyTokenConversionInitialisationSerializer

    def post(self, request: AuthenticatedRequest, *args: Any, **kwargs: Any) -> Response:  # noqa: ARG002
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            conversion = TokenConversion.objects.create(
                creator=request.user,
                amount=serializer.validated_data['amount'],
                conversion_type=ConversionMethod.LXLY,
                source_chain=serializer.validated_data['source_chain'],
                source_token=serializer.validated_data['source_token'],
                destination_token=serializer.validated_data['destination_token'],
                destination_chain=serializer.validated_data['destination_chain'],
                destination_address=serializer.validated_data['destination_address'],
            )
            TokenConversionStep.objects.create(
                conversion=conversion,
                step_type=LxLyConversionStepType.GET_MERKLE_PROOF,
                metadata={
                    'leaf_type': serializer.validated_data['leaf_type'],
                    'origin_network': serializer.validated_data['origin_network'],
                    'origin_address': serializer.validated_data['origin_address'],
                    'destination_network': serializer.validated_data['destination_network'],
                    'destination_address': serializer.validated_data['destination_address'],
                    'deposit_count': serializer.validated_data['deposit_count'],
                    'bridged_amount': serializer.validated_data['bridged_amount'],
                },
                status=TokenConversionStepStatus.PENDING,
            )

        return success_response(data={'id': conversion.uuid}, status_code=status.HTTP_201_CREATED)


class CCTPTokenConversionInitialisationAPIView(GenericAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = CCTPTokenConversionInitialisationSerializer

    def post(self, request: AuthenticatedRequest, *args: Any, **kwargs: Any) -> Response:  # noqa: ARG002
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            conversion = TokenConversion.objects.create(
                creator=request.user,
                amount=serializer.validated_data['amount'],
                conversion_type=ConversionMethod.CCTP,
                source_chain=serializer.validated_data['source_chain'],
                source_token=serializer.validated_data['source_token'],
                destination_address=serializer.validated_data['destination_address'],
                destination_chain=serializer.validated_data['destination_chain'],
                destination_token=serializer.validated_data['destination_token'],
            )
            TokenConversionStep.objects.create(
                conversion=conversion,
                step_type=CCTPConversionStepType.ATTESTATION_SERVICE_CONFIRMATION,
                metadata={
                    'nonce': serializer.validated_data['nonce'],
                    'source_tx_hash': serializer.validated_data['tx_hash'],
                    'message_hash': serializer.validated_data['message_hash'],
                    'message_bytes': serializer.validated_data['message_bytes'],
                },
                status=TokenConversionStepStatus.PENDING,
            )

        return success_response(data={'id': conversion.uuid}, status_code=status.HTTP_201_CREATED)

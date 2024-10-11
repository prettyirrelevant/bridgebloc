from typing import Any

from django.db import transaction
from django.db.models import QuerySet

from rest_framework import status
from rest_framework.generics import GenericAPIView, ListAPIView, RetrieveAPIView
from rest_framework.request import Request
from rest_framework.response import Response

from bridgebloc.apps.accounts.permissions import IsAuthenticated
from bridgebloc.common.helpers import success_response
from bridgebloc.common.types import AuthenticatedRequest

from .enums import CCTPConversionStepType, TokenConversionStepStatus
from .models import TokenConversion, TokenConversionStep
from .permissions import IsOwner
from .serializers import CCTPTokenConversionInitialisationSerializer, TokenConversionSerializer
from .types import ConversionMethod


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
                source_token=serializer.validated_data['source_token'],
                source_chain=serializer.validated_data['source_chain'],
                destination_chain=serializer.validated_data['destination_chain'],
                destination_token=serializer.validated_data['destination_token'],
                destination_address=serializer.validated_data['destination_address'],
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

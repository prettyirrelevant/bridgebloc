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
from bridgebloc.common.helpers import success_response
from bridgebloc.common.types import AuthenticatedRequest

from .constants import VALID_CONVERSION_ROUTES
from .enums import TokenConversionStepStatus, CircleAPIConversionStepType
from .models import TokenConversion, TokenConversionStep
from .permissions import IsOwner
from .serializers import (
    CCTPTokenConversionInitialisationSerializer,
    CircleAPITokenConversionInitialisationSerializer,
    LxLyTokenConversionInitialisationSerializer,
    TokenConversionSerializer,
)
from .tasks import initiate_circle_api_payment_intent
from .types import ConversionMethod
from .utils import get_circle_api_client


class ValidTokenConversionRoutesAPIView(APIView):
    def get(self, request: Request, *args: Any, **kwargs: Any) -> Response:  # noqa: ARG002
        data: dict[str, Any] = defaultdict(lambda: defaultdict())  # pylint:disable=unnecessary-lambda
        for key, val in VALID_CONVERSION_ROUTES.items():
            for k, v in val.items():
                data[key.name.lower()][k.name.lower()] = v

        return success_response(data=data)


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
        return qs.filter(creator=self.request.user)

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

    def post(self, request: Request, *args: Any, **kwargs: Any) -> Response:  # noqa: ARG002
        return success_response(data=None)


class CCTPTokenConversionInitialisationAPIView(GenericAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = CCTPTokenConversionInitialisationSerializer

    def post(self, request: Request, *args: Any, **kwargs: Any) -> Response:  # noqa: ARG002
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return success_response(data=None)

from collections import defaultdict
from typing import Any

from rest_framework.generics import GenericAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from bridgebloc.common.helpers import success_response

from .constants import VALID_CONVERSION_ROUTES
from .models import TokenConversion
from .permissions import IsOwner
from .serializers import (
    CCTPTokenConversionInitialisationSerializer,
    CircleAPITokenConversionInitialisationSerializer,
    LxLyTokenConversionInitialisationSerializer,
    TokenConversionSerializer,
)
from .tasks import initiate_circle_api_payment_intent
from .types import ConversionMethod


class ValidTokenConversionRoutesAPIView(APIView):
    def get(self, request: Request, *args: Any, **kwargs: Any) -> Response:  # noqa: ARG002
        data = defaultdict(lambda: defaultdict())
        for key, val in VALID_CONVERSION_ROUTES.items():
            for k, v in val.items():
                data[key.name.lower()][k.name.lower()] = v

        return success_response(data=data)


class TokenConversionAPIView(RetrieveAPIView):
    queryset = TokenConversion.objects.get_queryset()
    permission_classes = (IsAuthenticated, IsOwner)
    serializer_class = TokenConversionSerializer
    lookup_field = 'uuid'

    def retrieve(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        response = super().retrieve(request, *args, **kwargs)
        return success_response(data=response.data, status_code=response.status_code)


class CircleAPITokenConversionInitialisationAPIView(GenericAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = CircleAPITokenConversionInitialisationSerializer

    def post(self, request: Request, *args: Any, **kwargs: Any) -> Response:  # noqa: ARG002
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        conversion = TokenConversion.objects.create(
            creator=self.request.user,
            amount=serializer.data['amount'],
            conversion_type=ConversionMethod.CIRCLE_API,
            source_chain=serializer.data['source_chain'],
            source_token=serializer.data['source_token'],
            destination_address=serializer.data['destination_address'],
            destination_chain=serializer.data['destination_chain'],
            destination_token=serializer.data['destination_token'],
        )

        initiate_circle_api_payment_intent.schedule((conversion.uuid,), delay=2)
        return success_response(data={'id': conversion.uuid})


class LxLyTokenConversionInitialisationAPIView(GenericAPIView):
    serializer_class = LxLyTokenConversionInitialisationSerializer

    def post(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        ...


class CCTPTokenConversionInitialisationAPIView(GenericAPIView):
    serializer_class = CCTPTokenConversionInitialisationSerializer

    def post(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        ...

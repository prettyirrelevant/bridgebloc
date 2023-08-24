from typing import Any

from rest_framework.generics import ListAPIView
from rest_framework.request import Request
from rest_framework.response import Response

from bridgebloc.common.helpers import success_response

from .models import Token
from .serializers import TokenSerializer


class AllTokensView(ListAPIView):
    queryset = Token.objects.get_queryset()
    serializer_class = TokenSerializer

    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:  # noqa: A003
        response = super().list(request, args, kwargs)
        return success_response(data=response.data)

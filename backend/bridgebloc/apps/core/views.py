from drf_spectacular.utils import extend_schema

from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.request import Request
from rest_framework.response import Response


class PingEndpoint(GenericAPIView):
    @extend_schema(responses={'200': None})
    def get(self, request: Request) -> Response:  # noqa: ARG002
        return Response(status=status.HTTP_200_OK)

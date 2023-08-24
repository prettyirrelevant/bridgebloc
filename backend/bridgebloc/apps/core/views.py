from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView


class PingView(APIView):
    def get(self, request: Request) -> Response:  # noqa: ARG002
        return Response(status=status.HTTP_200_OK)

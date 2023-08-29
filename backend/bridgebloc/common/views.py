import logging
from typing import Any

from django.http import HttpRequest, JsonResponse

from rest_framework import serializers, status
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import exception_handler

from .helpers import error_response

logger = logging.getLogger(__name__)


def custom_exception_handler(exception: Exception, context: dict) -> Response | None:
    if not isinstance(exception, serializers.ValidationError):
        logger.exception(
            'An exception occurred while handling request %s %s',
            context['request'].method,
            context['request'].get_full_path(),
            exc_info=exception,
        )

    response = exception_handler(exception, context)
    if response is None:
        return None

    if isinstance(exception, APIException):
        return error_response(
            message=exception.__class__.__name__,
            errors=[exception.detail] if isinstance(exception.detail, str) else exception.detail,
            status_code=response.status_code,
        )

    return error_response(
        message=exception.__class__.__name__,
        errors=None,
        status_code=response.status_code,
    )


def handler_400(request: HttpRequest, exception: Exception, *args: Any, **kwargs: Any) -> JsonResponse:  # noqa: ARG001
    return JsonResponse(data={'message': 'Bad request', 'errors': None}, status=status.HTTP_400_BAD_REQUEST)


def handler_404(request: HttpRequest, exception: Exception) -> JsonResponse:  # noqa: ARG001
    return JsonResponse(data={'message': 'Not found', 'errors': None}, status=status.HTTP_404_NOT_FOUND)


def handler_500(request: HttpRequest) -> JsonResponse:  # noqa: ARG001
    return JsonResponse(
        data={
            'message': "We're sorry, but something went wrong on our end",
            'errors': None,
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )

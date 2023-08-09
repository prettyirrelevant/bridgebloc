from typing import Any

from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST


def success_response(data: dict[str, Any], status_code: int = HTTP_200_OK) -> Response:
    """Generate a success response with the provided data and status code.

    Args:
        data: A dictionary containing the data to be included in the response.
        status_code: HTTP status code for the response.
            Default to 200 (OK).

    Returns:
        An instance of the Django REST Framework Response class
            representing the success response.
    """
    return Response({'data': data}, status=status_code)


def error_response(
    message: str,
    errors: dict[str, Any],
    status_code: int = HTTP_400_BAD_REQUEST,
) -> Response:
    """Generate an error response with the provided message, errors, and status code.

    Args:
        message: A descriptive message explaining the error.
        errors: A dictionary containing detailed error information.
        status_code: HTTP status code for the response.
            Defaults to 400 (Bad Request).

    Returns:
            An instance of the Django REST Framework Response class
            representing the error response.
    """
    error_data = {'errors': errors, 'message': message}
    return Response(error_data, status=status_code)

from typing import TYPE_CHECKING

from rest_framework.request import Request

if TYPE_CHECKING:
    from bridgebloc.apps.accounts.models import Account


class AuthenticatedRequest(Request):
    user: 'Account'  # type: ignore[assignment]

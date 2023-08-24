from typing import TYPE_CHECKING

from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.views import APIView

if TYPE_CHECKING:
    from .models import TokenConversion


class IsOwner(BasePermission):
    def has_object_permission(self, request: Request, view: APIView, obj: 'TokenConversion') -> bool:  # noqa: ARG002
        return obj.creator == request.user

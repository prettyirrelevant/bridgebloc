from django.urls import path

from .views import NonceAPIView

urlpatterns = [
    path('accounts/nonce/<str:address>', NonceAPIView.as_view(), name='get-nonce'),
]

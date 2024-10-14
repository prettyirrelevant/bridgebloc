from django.urls import path

from .views import (
    CCTPTokenConversionInitialisationAPIView,
    TokenConversionAPIView,
    TokenConversionsAPIView,
)

urlpatterns = [
    path('conversions', TokenConversionsAPIView.as_view(), name='all-conversions-by-user'),
    path('conversions/cctp', CCTPTokenConversionInitialisationAPIView.as_view(), name='bridge-with-cctp'),
    path('conversions/<str:uuid>', TokenConversionAPIView.as_view(), name='get-conversion'),
]

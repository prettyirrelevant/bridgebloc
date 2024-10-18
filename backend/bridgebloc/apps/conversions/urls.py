from django.urls import path

from .views import (
    CCTPTokenConversionInitialisationAPIView,
    TokenConversionAPIView,
    TokenConversionsAPIView,
    ValidTokenConversionRoutesAPIView,
)

urlpatterns = [
    path('conversions', TokenConversionsAPIView.as_view(), name='all-conversions-by-user'),
    path('conversions/routes', ValidTokenConversionRoutesAPIView.as_view(), name='conversion-routes'),
    path('conversions/cctp', CCTPTokenConversionInitialisationAPIView.as_view(), name='bridge-with-cctp'),
    path('conversions/<str:uuid>', TokenConversionAPIView.as_view(), name='get-conversion'),
]

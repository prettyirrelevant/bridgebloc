from django.urls import path

from .views import (
    CCTPTokenConversionInitialisationAPIView,
    CircleAPITokenConversionInitialisationAPIView,
    CircleTokenConversionDepositTxHashUpdateAPIView,
    LxLyTokenConversionInitialisationAPIView,
    TokenConversionAPIView,
    TokenConversionsAPIView,
    ValidTokenConversionRoutesAPIView,
)

urlpatterns = [
    path('conversions', TokenConversionsAPIView.as_view(), name='all-conversions-by-user'),
    path(
        'conversions/circle-api',
        CircleAPITokenConversionInitialisationAPIView.as_view(),
        name='bridge-with-circle-api',
    ),
    path(
        'conversions/circle-api/<str:uuid>/add-deposit-hash',
        CircleTokenConversionDepositTxHashUpdateAPIView.as_view(),
        name='add-deposit-tx-hash',
    ),
    path('conversions/cctp', CCTPTokenConversionInitialisationAPIView.as_view(), name='bridge-with-cctp'),
    path('conversions/lxly', LxLyTokenConversionInitialisationAPIView.as_view(), name='bridge-with-lxly'),
    path('conversions/routes', ValidTokenConversionRoutesAPIView.as_view(), name='valid-routes'),
    path('conversions/<str:uuid>', TokenConversionAPIView.as_view(), name='get-conversion'),
]

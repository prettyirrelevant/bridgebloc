from django.urls import path

from .views import (
    CCTPTokenConversionInitialisationAPIView,
    CircleAPITokenConversionInitialisationAPIView,
    LxLyTokenConversionInitialisationAPIView,
    TokenConversionAPIView,
    TokenConversionsAPIView,
    ValidTokenConversionRoutesAPIView,
)

urlpatterns = [
    path('conversions', TokenConversionsAPIView.as_view(), name='all-conversions-by-user'),
    path(
        'conversions/circle_api',
        CircleAPITokenConversionInitialisationAPIView.as_view(),
        name='bridge-with-circle-api',
    ),
    path('conversions/cctp', CCTPTokenConversionInitialisationAPIView.as_view(), name='bridge-with-cctp'),
    path('conversions/lxly', LxLyTokenConversionInitialisationAPIView.as_view(), name='bridge-with-lxly'),
    path('conversions/routes', ValidTokenConversionRoutesAPIView.as_view(), name='valid-routes'),
    path('conversion/<str:uuid>', TokenConversionAPIView.as_view(), name='get-conversion'),
]

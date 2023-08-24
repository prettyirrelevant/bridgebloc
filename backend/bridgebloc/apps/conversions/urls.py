from django.urls import path

from .views import ValidTokenConversionRoutesAPIView

urlpatterns = [
    path('conversions/routes', ValidTokenConversionRoutesAPIView.as_view(), name='valid-routes'),
]

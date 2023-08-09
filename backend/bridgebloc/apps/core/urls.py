from django.urls import path

from .views import PingEndpoint

urlpatterns = [
    path('ping', PingEndpoint.as_view(), name='ping'),
]

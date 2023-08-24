from django.urls import path

from .views import AllTokensView

urlpatterns = [
    path('tokens', AllTokensView.as_view(), name='all-tokens'),
]

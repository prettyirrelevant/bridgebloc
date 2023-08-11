from django.urls import path

from .views import AllTokensView

urlpatterns = [
    path('', AllTokensView.as_view(), name='all-tokens'),
]

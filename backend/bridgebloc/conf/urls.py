"""
URL configuration for the bridgebloc project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import: from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import: from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from drf_yasg import openapi
from drf_yasg.views import get_schema_view

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from rest_framework.permissions import AllowAny

from bridgebloc.common.openapi import HttpAndHttpsOpenAPISchemaGenerator

docs_schema_view = get_schema_view(
    openapi.Info(
        title='BridgeBloc API',
        default_version='v1',
        description='BridgeBloc API',
        license=openapi.License(name='MIT License'),
    ),
    generator_class=HttpAndHttpsOpenAPISchemaGenerator,
    public=True,
    permission_classes=[AllowAny],
)

handler400 = 'bridgebloc.common.views.handler_400'
handler404 = 'bridgebloc.common.views.handler_404'
handler500 = 'bridgebloc.common.views.handler_500'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('bridgebloc.apps.core.urls')),
    path('api/', include('bridgebloc.apps.tokens.urls')),
    path('api/', include('bridgebloc.apps.conversions.urls')),
    path('api/docs', docs_schema_view.with_ui('swagger', cache_timeout=0), name='api-docs'),
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

from drf_yasg.generators import OpenAPISchemaGenerator
from drf_yasg.openapi import Swagger

from rest_framework.request import Request


class HttpAndHttpsOpenAPISchemaGenerator(OpenAPISchemaGenerator):
    def get_schema(self, request: Request | None = None, public: bool = False) -> Swagger:  # noqa: FBT002 FBT001
        schema = super().get_schema(request, public)
        schema.schemes = ['http', 'https']
        return schema

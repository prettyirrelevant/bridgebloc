from drf_yasg.generators import OpenAPISchemaGenerator
from drf_yasg.openapi import Swagger


class HttpAndHttpsOpenAPISchemaGenerator(OpenAPISchemaGenerator):
    def get_schema(self, request=None, public=False) -> Swagger:  # noqa: FBT002
        schema = super().get_schema(request, public)
        schema.schemes = ['http', 'https']
        return schema

from django.conf import settings

from rest_framework import serializers

from .models import Token


class TokenSerializer(serializers.ModelSerializer):
    chain = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    def get_image_url(self, obj: Token) -> str:
        request = self.context['request']
        token_img_url = f'{settings.STATIC_URL}images/{obj.coingecko_id}.png'

        return request.build_absolute_uri(token_img_url)

    def get_chain(self, obj: Token) -> str:
        return obj.chain_id.name.lower()

    class Meta:
        model = Token
        fields = (
            'name',
            'chain',
            'symbol',
            'address',
            'decimals',
            'image_url',
            'description',
        )

from django.conf import settings

from rest_framework import serializers

from .models import Token


class TokenSerializer(serializers.ModelSerializer):
    chain_id = serializers.SerializerMethodField()
    chain_name = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    def get_image_url(self, obj: Token) -> str:
        request = self.context['request']
        token_img_url = f'{settings.STATIC_URL}images/{obj.coingecko_id}.png'

        return request.build_absolute_uri(token_img_url)

    def get_chain_name(self, obj: Token) -> str:
        return obj.chain_id.name.lower()

    def get_chain_id(self, obj: Token) -> int:
        return obj.chain_id.value

    class Meta:
        model = Token
        fields = (
            'name',
            'symbol',
            'address',
            'decimals',
            'chain_id',
            'image_url',
            'chain_name',
        )

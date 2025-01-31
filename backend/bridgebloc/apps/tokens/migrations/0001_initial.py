# Generated by Django 4.2.4 on 2024-10-14 14:29

import bridgebloc.common.fields
import django.core.validators
from django.db import migrations, models
import uuid


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Token',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False, verbose_name='uuid')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=200, verbose_name='name')),
                ('symbol', models.CharField(max_length=200, verbose_name='symbol')),
                (
                    'chain_id',
                    bridgebloc.common.fields.EVMChainIDField(
                        choices=[
                            (8453, 'Base'),
                            (1, 'Ethereum'),
                            (10, 'Optimism'),
                            (137, 'Polygon Pos'),
                            (84532, 'Base Testnet'),
                            (42161, 'Arbitrum One'),
                            (5, 'Ethereum Testnet'),
                            (80001, 'Polygon Pos Testnet'),
                            (11155420, 'Optimism Testnet'),
                            (421613, 'Arbitrum One Testnet'),
                        ],
                        validators=[django.core.validators.MinValueValidator(1)],
                        verbose_name='chain id',
                    ),
                ),
                ('decimals', models.IntegerField(verbose_name='decimals')),
                ('image_url', models.URLField(verbose_name='image url')),
                ('coingecko_id', models.CharField(max_length=200, verbose_name='coingecko id')),
                (
                    'address',
                    bridgebloc.common.fields.EVMAddressField(max_length=42, unique=True, verbose_name='address'),
                ),
            ],
        ),
        migrations.AddConstraint(
            model_name='token',
            constraint=models.UniqueConstraint(
                fields=('coingecko_id', 'chain_id'), name='coingecko_id_and_chain_id_unique'
            ),
        ),
        migrations.AddConstraint(
            model_name='token',
            constraint=models.CheckConstraint(
                check=models.Q(('chain_id__in', [8453, 1, 10, 137, 84532, 42161, 5, 80001, 11155420, 421613])),
                name='tokens_token_chain_id_valid',
            ),
        ),
    ]

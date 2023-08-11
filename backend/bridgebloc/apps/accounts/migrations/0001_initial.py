# Generated by Django 4.2.4 on 2023-08-11 14:21

import bridgebloc.common.fields
from django.db import migrations, models
import uuid


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Account',
            fields=[
                ('uuid', models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False, verbose_name='uuid')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('address', bridgebloc.common.fields.EVMAddressField(max_length=42, verbose_name='address')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]

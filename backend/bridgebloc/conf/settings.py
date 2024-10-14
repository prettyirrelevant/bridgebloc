"""
Django's settings for the bridgebloc project.

Generated by 'django-admin startproject' using Django 4.2.4.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""
# isort: off
import django_stubs_ext

django_stubs_ext.monkeypatch()
# isort: on

from pathlib import Path
from typing import Any

from environ import Env
from huey import RedisHuey
from redis.connection import ConnectionPool

BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = Env(DEBUG=(bool, True))

# ==============================================================================
# CORE SETTINGS
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/
# ==============================================================================
DEBUG = env.bool('DEBUG')
if DEBUG:
    env.read_env(BASE_DIR / '.env.dev')

SECRET_KEY = env.str('SECRET_KEY')

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=[]) if DEBUG else env.list('ALLOWED_HOSTS')

DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]
if DEBUG:
    DJANGO_APPS.insert(5, 'whitenoise.runserver_nostatic')

THIRD_PARTY_APPS = [
    'drf_yasg',
    'extra_checks',
    'rest_framework',
    'huey.contrib.djhuey',
]

LOCAL_APPS: list[str] = [
    'bridgebloc.apps.core',
    'bridgebloc.apps.tokens',
    'bridgebloc.apps.accounts',
    'bridgebloc.apps.conversions',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

WSGI_APPLICATION = 'bridgebloc.conf.wsgi.application'

ROOT_URLCONF = 'bridgebloc.conf.urls'


# ==============================================================================
# MIDDLEWARE SETTINGS
# https://docs.djangoproject.com/en/4.2/topics/http/middleware/
# https://docs.djangoproject.com/en/4.2/ref/middleware/
# ==============================================================================
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
if DEBUG:
    MIDDLEWARE.append('pyinstrument.middleware.ProfilerMiddleware')


# ==============================================================================
# TEMPLATES SETTINGS
# ==============================================================================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# ==============================================================================
# STORAGES SETTINGS
# ==============================================================================
STORAGES = {
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}


# ==============================================================================
# DATABASES SETTINGS
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field
# ==============================================================================
DATABASES = {
    'default': env.db('DATABASE_URL'),
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ==============================================================================
# PASSWORD VALIDATION SETTINGS
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators
# ==============================================================================
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# ==============================================================================
# I18N AND L10N SETTINGS
# https://docs.djangoproject.com/en/4.2/topics/i18n/
# ==============================================================================
LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# ==============================================================================
# STATIC FILES SETTINGS
# https://docs.djangoproject.com/en/4.2/howto/static-files/
# ==============================================================================
STATIC_URL = 'static/'

STATIC_ROOT = BASE_DIR / 'staticfiles'


# ==============================================================================
# SECURITY
# ==============================================================================
SESSION_COOKIE_HTTPONLY = True

SESSION_COOKIE_SECURE = not DEBUG

CSRF_COOKIE_HTTPONLY = True

CSRF_COOKIE_SECURE = not DEBUG

SECURE_BROWSER_XSS_FILTER = True

X_FRAME_OPTIONS = 'DENY'


# ==============================================================================
# DJANGO REST FRAMEWORK SETTINGS
# ==============================================================================
REST_FRAMEWORK: dict[str, Any] = {
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticatedOrReadOnly'],
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer'],
    'DEFAULT_AUTHENTICATION_CLASSES': ['bridgebloc.apps.accounts.authentication.Web3Authentication'],
    'EXCEPTION_HANDLER': 'bridgebloc.common.views.custom_exception_handler',
}
if DEBUG:
    REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'].append('rest_framework.renderers.BrowsableAPIRenderer')


# ==============================================================================
# DJANGO CORS HEADERS SETTINGS
# ==============================================================================
CORS_ALLOW_ALL_ORIGINS = True


# ==============================================================================
# HUEY SETTINGS
# ==============================================================================
connection_pool = ConnectionPool.from_url(env.str('HUEY_REDIS_URL'))
connection_pool.max_connections = env.int('HUEY_STORAGE_MAX_CONNECTIONS', default=5)
HUEY = RedisHuey(
    name=__name__,
    immediate=env.bool('HUEY_IMMEDIATE'),
    connection_pool=connection_pool,
)


# ==============================================================================
# DJANGO EXTRA CHECKS SETTINGS
# ==============================================================================
EXTRA_CHECKS = {
    'checks': [
        'no-unique-together',
        'no-index-together',
        'field-default-null',
        'field-related-name',
        'field-foreign-key-db-index',
        'field-null',
        'field-text-null',
        'field-verbose-name',
        'field-file-upload-to',
        'drf-model-serializer-extra-kwargs',
        {
            'id': 'drf-model-serializer-meta-attribute',
            'attrs': ['fields'],
            'level': 'CRITICAL',
        },
    ],
}


# ==============================================================================
# PYINSTRUMENT SETTINGS
# ==============================================================================
PYINSTRUMENT_PROFILE_DIR = BASE_DIR / '.profiles'


# ==============================================================================
# DRF-YASG SETTINGS
# ==============================================================================
SWAGGER_SETTINGS = {
    'USE_SESSION_AUTH': False,
    'SECURITY_DEFINITIONS': {
        'wallet_signature': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization',
        },
    },
}


# ==============================================================================
# CCTP SETTINGS
# ==============================================================================
# Attestation Service
CIRCLE_ATTESTATION_BASE_URL = env.str('CIRCLE_ATTESTATION_BASE_URL')
CIRCLE_SANDBOX_ATTESTATION_BASE_URL = env.str('CIRCLE_SANDBOX_ATTESTATION_BASE_URL')

# Rpc
BASE_RPC_NODES = env.list('BASE_RPC_NODES')
BASE_TESTNET_RPC_NODES = env.list('BASE_TESTNET_RPC_NODES')

ETHEREUM_RPC_NODES = env.list('ETHEREUM_RPC_NODES')
ETHEREUM_TESTNET_RPC_NODES = env.list('ETHEREUM_TESTNET_RPC_NODES')

POLYGON_POS_RPC_NODES = env.list('POLYGON_POS_RPC_NODES')
POLYGON_POS_TESTNET_RPC_NODES = env.list('POLYGON_POS_TESTNET_RPC_NODES')

ARBITRUM_ONE_RPC_NODES = env.list('ARBITRUM_ONE_RPC_NODES')
ARBITRUM_ONE_TESTNET_RPC_NODES = env.list('ARBITRUM_ONE_TESTNET_RPC_NODES')

OPTIMISM_RPC_NODES = env.list('OPTIMISM_RPC_NODES')
OPTIMISM_TESTNET_RPC_NODES = env.list('OPTIMISM_TESTNET_RPC_NODES')

# Deployment addresses of `CrossChainBridge` contracts.
CROSS_CHAIN_BRIDGE_ETHEREUM_DEPLOYED_ADDRESS = env.str('CROSS_CHAIN_BRIDGE_ETHEREUM_DEPLOYED_ADDRESS')
CROSS_CHAIN_BRIDGE_ETHEREUM_TESTNET_DEPLOYED_ADDRESS = env.str('CROSS_CHAIN_BRIDGE_ETHEREUM_TESTNET_DEPLOYED_ADDRESS')

CROSS_CHAIN_BRIDGE_ARBITRUM_ONE_DEPLOYED_ADDRESS = env.str('CROSS_CHAIN_BRIDGE_ARBITRUM_ONE_DEPLOYED_ADDRESS')
CROSS_CHAIN_BRIDGE_ARBITRUM_ONE_TESTNET_DEPLOYED_ADDRESS = env.str(
    'CROSS_CHAIN_BRIDGE_ARBITRUM_ONE_TESTNET_DEPLOYED_ADDRESS',
)

CROSS_CHAIN_BRIDGE_OPTIMISM_DEPLOYED_ADDRESS = env.str('CROSS_CHAIN_BRIDGE_OPTIMISM_DEPLOYED_ADDRESS')
CROSS_CHAIN_BRIDGE_OPTIMISM_TESTNET_DEPLOYED_ADDRESS = env.str(
    'CROSS_CHAIN_BRIDGE_OPTIMISM_TESTNET_DEPLOYED_ADDRESS',
)

CROSS_CHAIN_BRIDGE_BASE_DEPLOYED_ADDRESS = env.str('CROSS_CHAIN_BRIDGE_BASE_DEPLOYED_ADDRESS')
CROSS_CHAIN_BRIDGE_BASE_TESTNET_DEPLOYED_ADDRESS = env.str(
    'CROSS_CHAIN_BRIDGE_BASE_TESTNET_DEPLOYED_ADDRESS',
)

CROSS_CHAIN_BRIDGE_POLYGON_POS_DEPLOYED_ADDRESS = env.str('CROSS_CHAIN_BRIDGE_POLYGON_POS_DEPLOYED_ADDRESS')
CROSS_CHAIN_BRIDGE_POLYGON_POS_TESTNET_DEPLOYED_ADDRESS = env.str(
    'CROSS_CHAIN_BRIDGE_POLYGON_POS_TESTNET_DEPLOYED_ADDRESS',
)

# `TokenMessenger` deployment addresses
TOKEN_MESSENGER_ETHEREUM_DEPLOYED_ADDRESS = env.str('TOKEN_MESSENGER_ETHEREUM_DEPLOYED_ADDRESS')
TOKEN_MESSENGER_ETHEREUM_TESTNET_DEPLOYED_ADDRESS = env.str('TOKEN_MESSENGER_ETHEREUM_TESTNET_DEPLOYED_ADDRESS')

TOKEN_MESSENGER_ARBITRUM_ONE_DEPLOYED_ADDRESS = env.str('TOKEN_MESSENGER_ARBITRUM_ONE_DEPLOYED_ADDRESS')
TOKEN_MESSENGER_ARBITRUM_ONE_TESTNET_DEPLOYED_ADDRESS = env.str(
    'TOKEN_MESSENGER_ARBITRUM_ONE_TESTNET_DEPLOYED_ADDRESS',
)

TOKEN_MESSENGER_BASE_DEPLOYED_ADDRESS = env.str('TOKEN_MESSENGER_BASE_DEPLOYED_ADDRESS')
TOKEN_MESSENGER_BASE_TESTNET_DEPLOYED_ADDRESS = env.str(
    'TOKEN_MESSENGER_BASE_TESTNET_DEPLOYED_ADDRESS',
)

TOKEN_MESSENGER_OPTIMISM_DEPLOYED_ADDRESS = env.str('TOKEN_MESSENGER_OPTIMISM_DEPLOYED_ADDRESS')
TOKEN_MESSENGER_OPTIMISM_TESTNET_DEPLOYED_ADDRESS = env.str(
    'TOKEN_MESSENGER_OPTIMISM_TESTNET_DEPLOYED_ADDRESS',
)

TOKEN_MESSENGER_POLYGON_POS_DEPLOYED_ADDRESS = env.str('TOKEN_MESSENGER_POLYGON_POS_DEPLOYED_ADDRESS')
TOKEN_MESSENGER_POLYGON_POS_TESTNET_DEPLOYED_ADDRESS = env.str(
    'TOKEN_MESSENGER_POLYGON_POS_TESTNET_DEPLOYED_ADDRESS',
)

# Account used to deploy all contracts.
DEPLOYER_PRIVATE_KEY = env.str('DEPLOYER_PRIVATE_KEY')


# ==============================================================================
# LOGGING SETTINGS
# ==============================================================================
if not DEBUG:
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'verbose': {
                'format': '[%(asctime)s] %(levelname)s:%(name)s:%(process)d:%(threadName)s: %(message)s',
            },
        },
        'handlers': {
            'console': {
                'level': 'DEBUG',
                'class': 'logging.StreamHandler',
                'formatter': 'verbose',
            },
        },
        'root': {'level': 'INFO', 'handlers': ['console']},
        'loggers': {
            'django.request': {
                'handlers': ['console'],
                'level': 'ERROR',
                'propagate': False,
            },
            'django.security.DisallowedHost': {
                'level': 'ERROR',
                'handlers': ['console'],
                'propagate': False,
            },
        },
    }

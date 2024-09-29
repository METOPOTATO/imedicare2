"""
Django settings for Coffee project.

Based on 'django-admin startproject' using Django 2.1.2.

For more information on this file, see
https://docs.djangoproject.com/en/2.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.1/ref/settings/
"""

import os
import posixpath

try:
    from django.utils.translation import gettext_lazy as _
except:
    from django.utils.translation import ugettext_lazy as _



# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '80c83142-b549-418a-8845-4192fbb4e0b2'

# SECURITY WARNING: don't run with debug turned on in production!
#DEBUG = True
DEBUG = True#bool( os.environ.get('DJANGO_DEBUG', True) )
ALLOWED_HOSTS = ['*']

# Application references
# https://docs.djangoproject.com/en/2.1/ref/settings/#std:setting-INSTALLED_APPS
INSTALLED_APPS = [
    'corsheaders',
    'rest_framework',
    'app',
    'Account',
    'Doctor',
    'Patient',
    'Receptionist',
    'Pharmacy',
    'Laboratory',
    'Radiation',
    'Nurse',
    'physical_therapist', 

    'Manage',

    'KBL',
    
    'bootstrap4',
    'django_summernote',
    # Add your apps here to enable them
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'storages', # azure storage
    'qr_code',

    #'crispy_forms',
    #'ckeditor',
    #'ckeditor_uploader',

    
]
CKEDITOR_UPLOAD_PATH = "uploads/"

SUMMERNOTE_THEME = 'bs3'

#azure storage
#DEFAULT_FILE_STORAGE = 'Coffee.azure_storage.AzureMediaStorage'


#MEDIA_LOCATION = "uploads"
#
##AZURE_ACCOUNT_NAME = "coffeehoanoistorage"
##AZURE_ACCOUNT_KEY = "TmSxf0c5vn0hJuNjVT+u/QiTBhBQmCUlXl9ODsUf5E6ss2TLNCkkvpxPo/jKlXfKphfOYX5swPKGPU9uvdog2Q=="
#AZURE_ACCOUNT_NAME = "sunmedicalstorage"
#AZURE_ACCOUNT_KEY = "AynTlYz476Q3QBN+k4CshOkiKKMT2erlXw6xvUie0TyuCs+5YCDl7unS3glczzC1VzeLG/ryghXL1VL7j42Tgg=="
#AZURE_CUSTOM_DOMAIN = f'{AZURE_ACCOUNT_NAME}.blob.core.windows.net'
#AZURE_LOCATION = '/uploads/'
#AZURE_CONTAINER = 'radiology'


#MEDIA_URL = f'https://{AZURE_CUSTOM_DOMAIN}/{MEDIA_LOCATION}/'


AUTH_USER_MODEL  = 'Account.User'
LOGIN_URL = '/login'
# Middleware framework
# https://docs.djangoproject.com/en/2.1/topics/http/middleware/
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    'middlewares.middlewares.RequestMiddleware',

    
]

CORS_ORIGIN_ALLOW_ALL = True
CORS_ORIGIN_WHITELIST = (
    "*",
)
ROOT_URLCONF = 'Coffee.urls'

# Template configuration
# https://docs.djangoproject.com/en/2.1/topics/templates/
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


WSGI_APPLICATION = 'Coffee.wsgi.application'
#Database
# https://docs.djangoproject.com/en/2.1/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

#LOGGING = {
#    'vsersion':1,
#    'disable_existing_loggers':False,
#    'handlers':{
#        'console':{
#            
#            'DEBUG',
#            }
#        }
#    }

#DATABASES = {
#        'default': {
#            'ENGINE': 'sql_server.pyodbc', 
#            'NAME': 'Coffee-Hanoi ',
#            'HOST': 'coffee-hanoi.database.windows.net',
#            'USER': 'cornex_admin',
#            'PASSWORD': 'Bolintele08',
#
#            'OPTIONS': {
#                'driver': 'SQL Server Native Client 11.0',
#            },
#           
#        }
#}

# Password validation
# https://docs.djangoproject.com/en/2.1/ref/settings/#auth-password-validators
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

# Internationalization
# https://docs.djangoproject.com/en/2.1/topics/i18n/

LANGUAGES = [
    ('ko', _('Korean')),
    ('vi',_('Vietnamese')),
    ('en',_('English'))
]
LOCALE_PATHS = (
    os.path.join(BASE_DIR, 'locale'),
)

PROXY_ALLOWED_PATHS = (
r'i18n/',
r'jsi18n/',
)



TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = False
TIME_ZONE = 'Asia/Ho_Chi_Minh'

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.1/howto/static-files/
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR + "/static",  # Đảm bảo đường dẫn đúng
]

STATIC_ROOT = BASE_DIR + "/staticfiles"
# STATICFILES_DIRS = os.path.join(BASE_DIR, 'static')
# media

#MEDIA_ROOT = os.path.join("D:",'uploads') #D드라이브
MEDIA_ROOT = os.path.join(BASE_DIR,'uploads')


MEDIA_URL ='/uploads/'



EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = "smtp.gmail.com"
# EMAIL_HOST_USER = 'hyungmo1004@gmail.com'
# EMAIL_HOST_PASSWORD = 'Gudah0827!'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
#DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

EMAIL_HOST_USER = 'clinic.imedi@gmail.com'  # Địa chỉ email của bạn
EMAIL_HOST_PASSWORD = 'pcpq jivy vsgt ofvd'  # Mật khẩu ứng dụng



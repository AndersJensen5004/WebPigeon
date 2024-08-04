# config.py

import os
from dotenv import load_dotenv
load_dotenv()


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    MONGODB_URI = os.environ.get('MONGODB_URI')


class DevelopmentConfig(Config):
    DEBUG = True
    CORS_ORIGINS = "*"
    SOCKETIO_CORS_ORIGINS = "*"


class ProductionConfig(Config):
    DEBUG = False
    CORS_ORIGINS = ["https://webpigeon.net", "https://www.webpigeon.net", "https://webpigeon.onrender.com", "https://www.webpigeon.onrender.com"]
    SOCKETIO_CORS_ORIGINS = ["https://webpigeon.net", "https://www.webpigeon.net", "https://webpigeon.onrender.com", "https://www.webpigeon.onrender.com"]
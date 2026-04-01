import os
from flask import Flask
from pymongo import MongoClient
from flask_cors import CORS
from package.config.security import SecurityConfig
from package.config.rate_limiter import limiter
from package.middleware import register_error_handlers
from package.config.index import initialize_all_indexes

app = Flask(__name__)

# Applying security configurations
app.config['JWT_SECRET_KEY'] = SecurityConfig.JWT_SECRET_KEY
app.config['JWT_REFRESH_SECRET_KEY'] = SecurityConfig.JWT_REFRESH_SECRET_KEY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = SecurityConfig.JWT_ACCESS_TOKEN_EXPIRES
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = SecurityConfig.JWT_REFRESH_TOKEN_EXPIRES

# Initialize Rate Limiter
limiter.init_app(app)

CORS(app,
     origins=os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "X-User-ID"],
     expose_headers=["Set-Cookie", "Authorization"],
     supports_credentials=True)
app.secret_key = SecurityConfig.JWT_SECRET_KEY

register_error_handlers(app)

# MongoDB Setup 
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://host.docker.internal:27017/mydatabase")
client = MongoClient(MONGO_URI)
db = client.get_database()

initialize_all_indexes(db)

from package import flask_CRUD
from flask import Flask
from pymongo import MongoClient
from flask_cors import CORS
from package.config.security import SecurityConfig
from package.config.rate_limiter import limiter


app = Flask(__name__)

# Applying security configurations
app.config['JWT_SECRET_KEY'] = SecurityConfig.JWT_SECRET_KEY
app.config['JWT_REFRESH_SECRET_KEY'] = SecurityConfig.JWT_REFRESH_SECRET_KEY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = SecurityConfig.JWT_ACCESS_TOKEN_EXPIRES
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = SecurityConfig.JWT_REFRESH_TOKEN_EXPIRES

# Initialize Rate Limiter
limiter.init_app(app)

# CORS Configuration
api_v1_cors_config = {
    "origins": ["http://localhost:3000"],  # Frontend's URL
    "methods": ["GET", "POST", "PUT", "DELETE","OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization", "X-User-ID"],
    "expose_headers": ["Set-Cookie", "Authorization"], 
    "allow_credentials": True,
    "supports_credentials": True
}


CORS(app, **api_v1_cors_config) # Apply CORS to all routes
app.secret_key = SecurityConfig.JWT_SECRET_KEY


# MongoDB Setup 
MONGO_URI = "mongodb://localhost:27017/mydatabase"
client = MongoClient(MONGO_URI)
db = client.get_database()

from package import flask_CRUD
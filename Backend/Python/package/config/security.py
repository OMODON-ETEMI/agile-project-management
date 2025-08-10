from datetime import timedelta
import secrets
import os 
from dotenv import load_dotenv

class SecurityConfig:
# TODO: Generate strong secret keys
#       - Use a two-way key pair: one public, one private
#       - Example: secrets.token_urlsafe(32) for random generation
# JWT_SECRET_KEY = "CHANGE_THIS_TO_PUBLIC_PRIVATE_PAIR"
# JWT_REFRESH_SECRET_KEY = "CHANGE_THIS_TO_PUBLIC_PRIVATE_PAIR"

    
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    JWT_REFRESH_SECRET_KEY = os.getenv('JWT_REFRESH_KEY')
    JWT_ALGORITHM = os.getenv('JWT_ALGORITHM')
    # Token configuration
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=30)  # Shorter lifetime for access tokens
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)     # Reduced from 30 days
    
    # Cookie security
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax' 
    
    # CSRF protection
    WTF_CSRF_ENABLED = True
    WTF_CSRF_SECRET_KEY = secrets.token_urlsafe(32)
    
    # Security headers
    SECURITY_HEADERS = {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'; script-src 'self'",
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
# ====================== UTILITY FUNCTION =================== #
from flask import request, jsonify, g
import jwt
from functools import wraps
from package.config.security import SecurityConfig


def get_ip_address():
    if request.headers.get('X-Forwarded-For'):
        ip = request.headers.get('X-Forwarded-For').split(',')[0]
        return ip
    else:
        ip = request.remote_addr
        return ip

def auth_reqired(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        print('Access Token header is: ',request.headers.get('access_token'))
        auth_header = request.cookies.get('access_token')
        if not auth_header:
            return {'error': 'Authorization is required'}, 401
        
        token = auth_header
        
        try:
            payload = jwt.decode(token, SecurityConfig.JWT_SECRET_KEY, SecurityConfig.JWT_ALGORITHM)
            g.user_id = payload.get('user_id')
            g.role = payload.get('role')
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated_function
from flask_limiter.errors import RateLimitExceeded
from flask import jsonify
import bcrypt
import traceback
import logging

def hash_password(password):
    encoded_password = password.encode('utf-8')
    hash_password = bcrypt.hashpw(encoded_password, bcrypt.gensalt())
    return hash_password

def check_password(password, hash_password):
    if bcrypt.checkpw(password.encode('utf-8'), hash_password):
        return True
    else:
        return False
    
def check_list(data):
    if any(value is None or value == "" for value in data ):
        return False
    else : 
        return True

def register_error_handlers(app):

    @app.errorhandler(RateLimitExceeded)
    def handle_rate_limit(e):
        return jsonify({
            "success": False,
            "error": "Rate limit exceeded",
            "message": "Too many requests. Please try again later."
        }), 429
    
    @app.errorhandler(Exception)
    def handle_exception(e):
        logging.error(traceback.format_exc())
        return jsonify({
            "success": False,
            "error": "Internal Server Error",
            "message": "Something went wrong",
            "status": 500
        }), 500
        
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({
            "success": False,
            "error": "Not Found",
            "message": "The requested resource does not exist",
            "status": 404
        }), 404
    
    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({
            "success": False,
            "error": "Method Not Allowed",
            "message": "Invalid request method",
            "status": 405
        }), 405
        
    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({
            "success": False,
            "error": "Unauthorized",
            "message": "Authentication required",
            "status": 401
        }), 401
        
    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({
            "success": False,
            "error": "Forbidden",
            "message": "You do not have permission",
            "status": 403
        }), 403
        
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({
            "success": False,
            "error": "Bad Request",
            "message": "Invalid input data",
            "status": 400
        }), 400
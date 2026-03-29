# ====================== UTILITY FUNCTION =================== #
from flask import request, jsonify, g
from bson import ObjectId
from datetime import datetime
import jwt
from functools import wraps
from package.config.security import SecurityConfig
from package.config.permission import PermissionService


def get_ip_address():
    if request.headers.get('X-Forwarded-For'):
        ip = request.headers.get('X-Forwarded-For').split(',')[0]
        return ip
    else:
        ip = request.remote_addr
        return ip
    
def serialize_document(document):
    """
    Convert MongoDB documents with ObjectId fields into JSON-serializable dictionaries.

    This function iterates over all key–value pairs in a dictionary and replaces
    any `bson.ObjectId` values with their string representation. This makes the
    document safe to return as JSON (e.g., in Flask responses).

    Args:
        document (dict, list): A MongoDB document (dictionary, list) that may contain ObjectId fields.

    Returns:
        dict: A (dictionary, list) with all ObjectId values converted to strings.
    """
    if isinstance(document, list):
        return [serialize_document(doc) for doc in document]
    if isinstance(document, dict):
        return {key: serialize_document(value) for key, value in document.items()}

    # 3. Handle ObjectIds (Convert to string)
    if isinstance(document, ObjectId):
        return str(document)
    
    # 4. Handle Datetimes (Convert to ISO string for JSON compatibility)
    if isinstance(document, datetime):
        return document.isoformat()
    return document

def auth_reqired(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return {'error': 'Authorization is required'}, 401
        
        token = auth_header.split(' ')[1]
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            payload = jwt.decode(token, SecurityConfig.JWT_SECRET_KEY, SecurityConfig.JWT_ALGORITHM)
            g.user_id = payload.get('user_id')
            g.role = payload.get('role')
            g.name = payload.get('username')
            g.avatar = payload.get('image')
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated_function

def require_organization_permission(permission):
    """
    Decorator to require organization-level permission
    Expects org_id in URL parameters
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            current_user_id = g.user_id
            org_id = kwargs.get('org_id') or request.get_json().get('org_id') or request.get_json().get('organisation_id')
            org_slug = kwargs.get('slug') or request.get_json().get('slug')
            
            if not org_id and not org_slug:
                return jsonify({'error': 'Organization ID or slug required'}), 400
            
            # Check permission
            has_perm = PermissionService.has_organization_permission(
                current_user_id,
                org_id,
                permission,
                org_slug
            )
            
            if not has_perm:
                return jsonify({
                    'error': 'Insufficient permissions',
                    'required_permission': permission,
                    'context': 'organization'
                }), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def require_workspace_permission(permission):
    """
    Decorator to require workspace-level permission
    Expects workspace_id in URL parameters
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            current_user_id = g.user_id
            workspace_id = kwargs.get('workspace_id') or request.get_json().get('workspace_id') 
            workspace_slug = kwargs.get('slug') or request.get_json().get('slug')
            if not workspace_id and not workspace_slug:
                return jsonify({'error': 'Workspace ID or slug required'}), 400
            
            # Check permission
            has_perm = PermissionService.has_workspace_permission(
                current_user_id,
                workspace_id,
                permission,
                workspace_slug
            )
            
            if not has_perm:
                return jsonify({
                    'error': 'Insufficient permissions',
                    'required_permission': permission,
                    'context': 'workspace'
                }), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def require_either_permission(org_perm: str, ws_perm: str):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            errors = []
            
            # Try Org Permission
            try:
                require_organization_permission(org_perm)(func)(*args, **kwargs)
                return func(*args, **kwargs)
            except Exception as e:
                errors.append(e)

            # Try Workspace Permission
            try:
                require_workspace_permission(ws_perm)(func)(*args, **kwargs)
                return func(*args, **kwargs)
            except Exception as e:
                errors.append(e)

            # If we reached here, both failed
            return jsonify({
                "error": f"Missing required permissions: {org_perm} or {ws_perm}",
                "status_code": 403
            }), 403
        return wrapper
    return decorator

def admin_only():
    """
    Decorator to require admin role in any organization
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            current_user_id = g.user_id
            data = request.get_json()
            
            # Get user permissions
            user_perms = PermissionService.get_user_permissions(current_user_id,organisation_id=data.get('organisation_id') or data.get('_id') or data.get('org_id') if data else None, workspace_id=data.get('workspace_id') if data else None)
            # Check if user is admin in any organization
            is_admin = user_perms and user_perms.lower() == 'admin'

            if not is_admin:
                return jsonify({'error': 'Admin access required'}), 403
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator
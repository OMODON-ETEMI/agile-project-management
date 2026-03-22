from package import app, db
from flask import request, jsonify, g, Response, make_response
from package.config.rate_limiter import limiter
from dateutil import parser
import json
import io
import base64
from bson import ObjectId
from bson.errors import BSONError , InvalidBSON, InvalidDocument, InvalidId, InvalidStringData
from package.models.user import User
from package.models.board import Board
from package.models.organisation import Organisation
from package.models.workspace import Workspace
from package.models.notification import invite_notification, role_update_notification, remove_user_notification, delete_organisation_notification, update_organisation_notification
from package.models.user_relationships import User_Workspace, User_Activity, User_Organisation
from package.config.security import SecurityConfig
from package.config.utility import get_ip_address, auth_reqired, require_organization_permission, require_workspace_permission, admin_only, require_either_permission
from package.config.permission import PermissionService
from package.config.import_issue import import_issue
from package.middleware import check_list
from package.config.redis import publish_event
import re
from datetime import datetime, timezone


# ------------------- USER_ACTIVITY_LOG------------------- #
@app.before_request
def before_request():
    """Runs before every request to log user activity."""
    g.request_data = {
        'method': request.method,
        'path': request.path,
        'args': dict(request.args),
        'json': request.get_json(silent=True) or {},
        'headers': dict(request.headers),
        'remote_addr': request.remote_addr
    }
    

@app.after_request
def after_request_logging(response):
    """Runs after every request to log user activity."""
    if 200 <= response.status_code < 300:
        request_data = g.request_data
        data = request_data.get('json')
        response_data = response.get_json() if response.is_json else {}
        
        # ------- Initializing the data ------- #
        user_id = getattr(g, 'user_id', None)
        organisation_id = None
        workspace_id = None
        action = None
        entity_type = None
        entity_id = None
        metadata = {
            "method": request_data['method'],
            "ip_address": request_data['remote_addr'],
            "device_info": request_data['headers'].get('User-Agent', 'Unknown'),
            "response_status": response.status_code,
            "user_agent": request_data['headers'].get('User-Agent'),
            "referrer": request_data['headers'].get('Referer'),
            "query_params": request_data['args'],
            "endpoint": request_data['path']
        }


        skip_paths = ['/add/user', '/login', '/logout', 'auth/refresh', '/all', '/recent', '/boards', '/users']
        for path in skip_paths:
            if path in request_data['path']:  
                return response
            
            
        # ----------------- Board ----------------- #
        if '/board' in request_data['path']:
            if(isinstance(response_data, list)):
                return response
            board_data = response_data.get('board', {}) 
            if '/add/board' in request_data['path']:
                action = "Create Board"
                entity_type = "Board"
                entity_id = board_data.get('_id')
                workspace_id = data.get('workspace_id')                
            
            elif '/update' in request_data['path']:
                action = "Update Board"
                entity_type = "Board"
                entity_id = data.get('board_id')
                update_fields = { key : value for key, value in data.items() if key not in ['user_id', 'board_id', 'workspace_id']}
                metadata['update_fields'] = update_fields
                
            elif '/ID' in request_data['path']:
                action = "View Boardd"
                entity_type = "Board"
                entity_id = data.get('board_id')

            elif '/delete' in request_data['path']:
                action = "Delete Board"
                entity_type = "Board"
                entity_id = data.get('board_id')
                
        
        # ----------------- Workspace ----------------- #
        elif '/workspace' in request_data['path']:
            if (isinstance(response_data, list)):
                return response  
            workspace_data = response_data.get('Workspace', {}) 
            if '/add/workspace' in request_data['path']:
                action = "Create workspace"
                entity_type = "Workspace"
                entity_id = workspace_data.get('_id')
                organisation_id = data.get('organisation_id')
                
            elif '/search' in request_data['path'] and data.get('workspace_id') or data.get('slug'):
                action = "View Workspace"
                entity_type = "Workspace"
                entity_id = data.get('workspace_id') or data.get('slug')

            elif '/update' in request_data['path']:
                action = "Update Workspace"
                entity_type = "Workspace"
                entity_id = data.get('workspace_id')
                update_fields = { key : value for key, value in data.items() if key not in ['user_id', 'workspace_id']}
                metadata['update_fields'] = update_fields

            elif '/delete' in request_data['path']:
                action = "Delete Workspace"
                entity_type = "Workspace"
                entity_id = data.get('workspace_id')
                
                
        # ----------------- Organisation ----------------- #
        elif '/organisation' in request_data['path']:
            organisation_data = response_data.get('organisation', {}) 
            if '/add/organisation' in request_data['path']:
                action = "Create organisation"
                entity_type = 'organisation'
                entity_id = organisation_data.get('_id')
               
            elif '/search' in request_data['path'] and data.get('organisation_id') or data.get('slug'):
                action = "View Organisation"
                entity_type = "organisation"
                entity_id = data.get('organisation_id') or data.get('slug') 

            elif '/update' in request_data['path']:
                action = "Update Organisation"
                entity_type = "organisation"
                entity_id = data.get('organisation_id')
                update_fields = { key : value for key, value in data.items() if key not in ['user_id', 'organisation_id']}
                metadata['update_fields'] = update_fields

            elif '/delete' in request_data['path']:
                action = "Delete Organisation"
                entity_type = "organisation"
                entity_id = data.get('organisation_id')
                
            if not entity_id or not action:
                app.logger.warning(f"Untracked action or missing entity: {request_data['path']}")

                
                
        
        # ----------------- Log User Action ----------------- #
        if user_id and action:
            activity = User_Activity(
                user_id=user_id,
                action=action,
                entity_type= entity_type,
                entity_id= entity_id,
                metadata=metadata,
                timestamp = datetime.now(timezone.utc),
                workspace_id = workspace_id,
                organisation_id = organisation_id
            )
            activity.Create_User_Activity_Log()
    return response

# ------------------- USER ------------------------------- #
@app.route('/add/user', methods=['POST'])
def create():
    data = request.json
    if not data: 
        return jsonify({'error': 'Invalid or Missing JSON in request'}), 404
    username = data.get('username')
    email = data.get('email')
    firstname = data.get('firstname')
    lastname = data.get('lastname')
    password = data.get('password')
    role = data.get('role')
    image = data.get('image')
    createdAt = datetime.now(timezone.utc)
    updatedAt = createdAt

    if not role and not image:
        role = 'defualt'

    info = [username, email, firstname, lastname, password]
    if check_list(info):
        if not  re.match(r'^[\w\.-]+@[\w\.-]+(\.[\w]+)+$', email):
            return jsonify({"message" : 'Please enter a valid email.'}), 400
        else:
            response = User.search(username)
            data = response
            result = User.search_email(email) | bool(data)
            if (result):
                return jsonify({
                    'message' : 'User already exist'
                }), 409
            else :
                user = User(username, email, password, firstname, lastname, role , image, createdAt, updatedAt)
                user_data, access_token, refresh_token = user.createUser()
                if not user_data:
                    return jsonify({'Error': 'Failed to create account'}), 500
                
                response = make_response(jsonify({
                        'response': f'Your Account has been created, {user_data["firstname"]}',
                        'token': access_token
                    }))
                response.set_cookie('refresh_token',
                                     refresh_token, 
                                     httponly=SecurityConfig.SESSION_COOKIE_HTTPONLY ,
                                     secure= SecurityConfig.SESSION_COOKIE_SECURE, 
                                     samesite= SecurityConfig.SESSION_COOKIE_SAMESITE, 
                                     max_age=60 * 60 * 24 * 7,  # 7 days
                                     path= '/', )
                response.status_code = 201
                return response
    else : 
        return jsonify({
            'message' : 'One or more fields are missing or empty'
        }), 404
    
@app.route('/user', methods=['GET'])
@limiter.limit("30 per minute")
@auth_reqired
@require_either_permission('view_user', 'view_organization')
def user():
    user = User
    users = user.user()
    return jsonify(users), 200

@app.route('/find', methods=['GET'])
def find():
    find = User
    id = request.args.get('_id')
    user = find.find_user(id)
    if user:
        return jsonify(user), 200
    return jsonify({'Error': 'User not found'}), 404

@app.route('/users/search', methods=['GET'])
def search():
    query = request.args.get('name')
    if check_list([query]):    
        users = User.search(query)
        return jsonify(users), 200
    else :
         return jsonify({
            'message' : 'Enter a name to search'
        }), 404


@app.route('/User/me', methods=['POST'])
@auth_reqired
def UserData():
    user_id = g.user_id
    response = User.User_Data(user_id)

    if response:
        return jsonify(response), 200
    else :
         return jsonify({
            'Error' : 'User data not found'
        }), 404
         
@app.route('/login', methods=['POST'])
@limiter.limit("30 per minute")
def login():
    user = User
    data = request.json
    if not data: 
        return jsonify({'error': 'Invalid or Missing JSON in request'}), 404
    username = data.get('username')
    password = data.get('password')
    ip_address = get_ip_address()

    if check_list([username, password]):
        result = user.login(username, password, ip_address)
        if not result.get('success'):
            return jsonify({'Error': result.get('error')}), result.get('status_code', 400)
        
        response = make_response(jsonify({
            'response': "Login successful",
            'data': result['data'],
            'token': result['access_token']
        }))
        response.set_cookie('refresh_token', 
                             result['refresh_token'], 
                             httponly=SecurityConfig.SESSION_COOKIE_HTTPONLY,
                             secure=SecurityConfig.SESSION_COOKIE_SECURE, 
                             samesite=SecurityConfig.SESSION_COOKIE_SAMESITE, 
                             max_age=60 * 60 * 24 * 7,  # 7 days
                             path='/')
        return response
    else :
         return jsonify({
            'Error' : 'Pleease enter the required fields'
        }), 404
    
@app.route('/logout', methods=['POST'])
@limiter.limit("30 per minute")
def logout():
    token = request.cookies.get('refresh_token')
    if not token:
         return jsonify({
            'Error' : 'No Token Provided'
        }), 404
    result = User.logout(token)
    if result.get('success'):
        response = make_response(jsonify({'message': 'Logged out successfully'}))
        response.delete_cookie('refresh_token', path='/')
        response.status_code = 200
        return response
    else:
        return jsonify({'Error': 'Logout failed'}), result.get('status_code', 400)
    
@app.route('/auth/refresh', methods=['POST'])
@limiter.limit("30 per minute")
def refresh():
    user = User
    token = request.cookies.get('refresh_token')
    if not token:
        return jsonify({'Error': 'token required'}), 401
    result = user.refresh(token)
    if not result.get('success'):
        response = make_response(jsonify({'Error': result.get('error')}))
        response.delete_cookie('refresh_token', path='/')
        response.status_code = result.get('status_code', 401)
        return response
    
    response = make_response(jsonify({'token': result['access_token']}))
    response.set_cookie('refresh_token',
                         result['refresh_token'], 
                         httponly=SecurityConfig.SESSION_COOKIE_HTTPONLY,
                         secure=SecurityConfig.SESSION_COOKIE_SECURE, 
                         samesite=SecurityConfig.SESSION_COOKIE_SAMESITE, 
                         max_age=604800, 
                         path='/')
    return response

@app.route('/auth/server/refresh', methods=['POST'])
@limiter.limit("30 per minute")
def server_refresh():
    user = User
    token = request.cookies.get('refresh_token')
    if not token:
        return jsonify({'Error': 'token required'}), 401
    result = user.server_Refresh(token)
    if not result.get('success'):
        response = make_response(jsonify({'Error': result.get('error')}))
        response.delete_cookie('refresh_token', path='/')
        response.status_code = result.get('status_code', 401)
        return response
    
    response = make_response(jsonify({'token': result['access_token']}))
    return response
    
# ------------------------- BOARD ---------------------------- #
    
@app.route('/add/board', methods=['POST'])
@auth_reqired
@limiter.limit("30 per minute")
def create_board(): 
    data = request.json
    if not data: 
        return jsonify({'error': 'Invalid or Missing JSON in request'}), 404
    title = data.get('title')
    user_id = g.user_id
    type = data.get('type')
    image = data.get('image')
    createdAt = datetime.now(timezone.utc)
    endDate = parser.isoparse(data.get('endDate')).astimezone(timezone.utc) if data.get('endDate') else None
    startDate = parser.isoparse(data.get('startDate')).astimezone(timezone.utc) if data.get('startDate') else None
    workspace_id = data.get('workspace_id')
    if type not in ['Board', 'Sprint']:
        return jsonify({
            'Error' : 'Invalid board type. Must be one of: Board, Sprint'
        }), 400
    info = [title, user_id, createdAt, workspace_id]
    if check_list(info):
        if type == 'Sprint' and (not startDate or not endDate or startDate >= endDate):
            return jsonify({'Error': 'Valid start and end dates are required for a sprint'}), 400
        board = Board(title, type, user_id, createdAt, workspace_id, image, startDate, endDate)
        new_board = board.create_board()
        if new_board:
            return jsonify({
                'message': f'Your {new_board["title"]} Board has been created',
                'board': new_board
            }), 201
        return jsonify({'message': 'failed to create board'}), 500
    else :
        return jsonify({
            'message' : "One or more fields are missing"
        }), 400
    
# search for a board by title or workspace_id 
@app.route('/board/search', methods=['GET', 'POST'])
@auth_reqired
# @require_workspace_permission('view_workspace')
def search_title():
    if request.method == 'GET' :
        result = Board.search(title=request.args.get('title'))
        if result is not None:
            return jsonify(result), 200
        return jsonify({'message': 'No boards found with the given title'}), 404
    elif request.method == 'POST':
        workspace_id = request.json.get('workspace')
        board_id = request.json.get('_id')
        result = None
        if board_id:
            result = Board.board_ID(ID=board_id)
        elif workspace_id:
            result = Board.board_in_workspace(workspace_identifier=workspace_id)
        elif not workspace_id and not board_id:
            return jsonify({"Error" : "Enter a Parameter to search"}), 400
        
        if result is not None:
            return jsonify(result), 200
        return jsonify({'message': 'Board not found'}), 404
    else : 
        return jsonify({
            "Error" : "Enter a Parameter to search"
        }), 400
    
# Update Board
@app.route('/board/update', methods=['PATCH'])
@auth_reqired
def update_board():    
    data = request.json
    if not data: 
        return jsonify({'error': 'Invalid or Missing JSON in request'}), 404
    # board_id = data.get('board_id')
    user_id = data.get('user_id')
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    title=data.get('title') 
    image=data.get('image')
    workspace_id = data.get('workspace_id')
    board_id=data.get('board_id')
    if check_list([board_id, user_id]):
        updated_board = Board.Update(board_id=board_id, workspace_id=workspace_id, user_id=user_id, start_date=start_date, end_date=end_date, title=title, image=image)
        if updated_board:
            return jsonify({
                'message': 'Board updated successfully',
                'data': updated_board,
            }), 200
        else:
            return jsonify({'error': 'Update failed or invalid data'}), 400
    else :
            return jsonify({
        'Error' : 'Pleease enter the required fields'
    }), 404

# Delete a Board 
@app.route('/board/delete', methods=['DELETE'])
@auth_reqired
def delete_board():
    data=request.json
    if data: 
        success = Board.delete(board_id=data.get('board_id'),user_id=data.get('user_id'))
        if success:
            return jsonify({'message' : 'Deleted Successfully'}), 200
        return jsonify({'message' : 'Failed to Delete'}), 400
    else :
        return jsonify({
            'Error' : "Error Deleting Board"
        }), 400
    


# ----------------------------- Organisation ------------------------- #
@app.route('/add/organisation', methods=['POST'])
@auth_reqired
def create_organisation(): 
    data = request.json
    if not data:
        return jsonify({  'error': 'Invalid Input' }), 404 
    title = data.get('title')
    image = data.get('image')
    description = data.get('description')
    color = data.get('color')
    created_By = g.user_id
    slug = data.get('slug') or Organisation.generate_Unique_slug(title)
    createdAt = datetime.now(timezone.utc)
    role = data.get('role') or 'Admin'
    updatedAt = createdAt
    info = [title, createdAt, created_By]
    if check_list(info):
        org_model = Organisation(title, createdAt, updatedAt, image, description, created_By, slug, color)
        new_organisation = org_model.create_organisation()
        if not new_organisation:
            return jsonify({'message' : 'failed to create organisation'}), 500

        user_organisation = User_Organisation( user_id= created_By, organisation_id=new_organisation['_id'], role = role ,  joined_at= createdAt) 
        user_organisation_response = user_organisation.create_User_Organisation()
        if not user_organisation_response.get('success'):
            print("Failed to add creator as a member.")
            Organisation.delete(organisation_id=new_organisation['_id'], user_id=created_By)
            return jsonify({
                'message': "Organisation created, but failed to add creator as a member."
            }), 500
        if (PermissionService.invite_user_to_organization( created_By, new_organisation['_id'], role)) != True:
            Organisation.delete(organisation_id=new_organisation['_id'], user_id=created_By)
            User_Organisation.revoke_User_Organisation(organisation_id=new_organisation['_id'], user_id=created_By)
            return jsonify({
                'message': "Organisation created, but failed to set permissions for creator."
            }), 500
        return jsonify({
            'message': f'Your {new_organisation["title"]} Organisation has been created',
            'organisation': new_organisation
        }), 201
    else :
        return jsonify({
            'message' : "One or more fields are missing"
        }), 404
        
        
@app.route('/organizations/invite', methods=['POST'])
@auth_reqired
@admin_only()
def invite_user_to_organization():
    data = request.get_json()
    user_id = data.get('user_id')
    org_id = data.get('org_id')
    role = data.get('role')
    
    if not org_id or not user_id:
        return jsonify({"error": "user_id and org_id required"}), 400
    if not role:
        return jsonify({'error': 'Role is required'}), 400

    resp = User_Organisation.Search_Users_in_Organisation(org_id, user_id=user_id)

    for res in resp.get('results', []):
        if not res.get('isMember', False):
            result = User_Organisation.create_User_Organisation(
                user_id=user_id, 
                organisation_id=org_id, 
                joined_at=datetime.now(timezone.utc)
            )
            if not result.get('success'):
                return jsonify(result), 400

    success = PermissionService.invite_user_to_organization(user_id, org_id, role)

    if success:
        organisation_name = Organisation.search(organisation_id=org_id).get('data', {}).get('title', '')
        notification = invite_notification(
                recipients=[user_id],
                actor_id=g.user_id,
                actor_name=g.name,
                actor_avatar=g.avatar,
                org_id=org_id,
                org_name=organisation_name
            )
        publish_event('organization_events', notification)
        return jsonify({'message': 'User invited to organization successfully'}), 200
    
    return jsonify({'error': 'Failed to invite user'}), 400

    
@app.route('/organizations/remove', methods=['POST'])
@auth_reqired
@admin_only()
def remove_user_from_organization():
    """Remove user from organization"""
    data = request.get_json()
    user_id = data.get('user_id')
    org_id = data.get('org_id')
    
    try:
        res = User_Organisation.revoke_User_Organisation(org_id, user_id=user_id)
        if res.get('success') != True:
            return jsonify(res), 400
        success = PermissionService.remove_user_from_organization(user_id, org_id)
        if success:
            organisation_name = Organisation.search(organisation_id=org_id).get('data', {}).get('title', '')
            notification = remove_user_notification(
                recipients=[user_id],
                actor_id=g.user_id,
                actor_name=g.name,
                actor_avatar=g.avatar,
                org_id=org_id,
                org_name=organisation_name,
            )
            publish_event('organization_events', notification)
            return jsonify({'message': 'User has been removed from the organization successfully'}), 200
        else:
            return jsonify({'error': 'Failed to invite user'}), 400
            
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    
@app.route('/organizations/role/update', methods=['POST'])
@auth_reqired
@admin_only()
def update_user_role_in_organization():
    """Update user role in organization"""
    data = request.get_json()
    user_id = data.get('user_id')
    org_id = data.get('org_id')
    new_role = data.get('role')
    
    try:
        success = PermissionService.update_user_role(user_id, org_id, new_role)
        
        if success:
            organisation_name = Organisation.search(organisation_id=org_id).get('data', {}).get('title', '')
            notification = role_update_notification(
                recipients=[user_id],
                actor_id=g.user_id,
                actor_name=g.name,
                actor_avatar=g.avatar,
                org_id=org_id,
                org_name=organisation_name,
                new_role=new_role
            )
            publish_event('organization_events', notification)
            return jsonify({'message': 'User role updated successfully'}), 200
        else:
            return jsonify({'error': 'Failed to invite user'}), 400
            
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

# search for Organisation by name or ID 
@app.route('/organisation/search', methods=['GET', 'POST'])
@auth_reqired
@require_organization_permission('view_organization')
def search_organisation():
    if request.method == 'GET' :
        result = Organisation.search(title=request.args.get('title'), user_id=g.user_id)
        return result
    elif request.json:
        data = request.json  
        if data.get('organisation_id'):
            result = Organisation.search(organisation_id=data.get('organisation_id'), user_id=g.user_id)
            if result:
                return jsonify(result), 200
            return jsonify({'message': 'Organisation not found'}), 404
        elif data.get('slug'):
            result = Organisation.search(slug=data.get('slug'), user_id=g.user_id)
            if result:
                return jsonify(result), 200
            return jsonify({'message': 'Organisation not found'}), 404
    else : 
        return jsonify({
            "Error" : "Error in your search"
        }), 400
    
# All Organisation
@app.route('/all/organisation', methods=['GET'])
@auth_reqired
def all_organisation():
    try:
        organisations = Organisation.organisation(user_id = g.user_id)
        return jsonify(organisations), 200
    except Exception as e:
         return jsonify({
            "Error" : str(e)
        }), 500
    
# Recent Organisation
@app.route('/recent/organisation', methods=['POST'])
@auth_reqired
def recent_organisation():
    try:
        response = User_Activity.get_last_accessed_entities(user_id= g.user_id, entity_type='organisation', limit=2)
        return response, 200
    except Exception as e:
         return jsonify({
            "Error" : str(e)
        }), 500
         
# get all user in a organisation
@app.route('/organisation/users', methods=['GET'])
@auth_reqired
def user_in_organisation():
    organisation_id = g.request_data["args"].get('organisation_id') 
    query = g.request_data["args"].get('query')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))

    if not organisation_id:
        return jsonify({'error': 'No Organisation Selected'}), 400

    if query:
        resp = User_Organisation.Search_Users_in_Organisation(organisation_id, query, page, limit)
        return jsonify(resp), 200
    
    resp = User_Organisation.Users_in_Organisation(organisation_id, user_id=g.user_id)
    return jsonify(resp), 200


# Update Organisation
@app.route('/organisation/update', methods=['PATCH'])
@auth_reqired
@admin_only()
def update_organisation():    
    data = request.json
    if not data: 
        return jsonify({'error': 'Invalid or Missing JSON in request'}), 404
    user_id = g.user_id
    slug=data.get('slug')
    description=data.get('description')
    color=data.get('color')
    title=data.get('title') 
    image=data.get('image')
    organisation_id = data.get('organisation_id') or data.get('_id')
    if check_list([organisation_id, user_id]):
        updated_org = Organisation.Update(organisation_id=organisation_id, user_id=user_id, title=title, image=image, slug=slug, description=description, color=color)
        if not updated_org:
            return jsonify({'error': 'Update failed or invalid data'}), 400
        
        response = jsonify({"message" : "organisation updated succesfully", 'data' : updated_org, }), 200

        userss = []
        users = User_Organisation.Users_in_Organisation(organisation_id).get('results', [])
        for usr in users:
            if usr.get('user_id') != g.user_id:
                userss.append(usr.get('user_id'))
        organisation_name = title or Organisation.search(organisation_id=organisation_id).get('data', {}).get('title', '')
        notification = update_organisation_notification(
            recipients=userss,
            actor_id=g.user_id,
            actor_name=g.name,
            actor_avatar=g.avatar,
            org_id=organisation_id,
            org_name= organisation_name,
            changed_fields={ key : value for key, value in data.items() if key not in ['user_id', 'organisation_id', '_id']}
        )
        publish_event('organization_events', notification)
        return response
    else :
            return jsonify({
        'Error' : 'Pleease enter the required fields'
    }), 404

# Delete a Organisation 
@app.route('/organisation/delete', methods=['DELETE'])
@auth_reqired
@admin_only()
def delete_organisation():
    data = request.json
    organisation_id = data.get('organisation_id')
    user_id = g.user_id
    if not data: 
        return jsonify({'error': 'Invalid or Missing JSON in request'}), 404   
    
    success = Organisation.delete(organisation_id, user_id)
    
    if success:
        response = jsonify({'message' : 'Deleted Successfully'}), 200

        userss = []
        users = User_Organisation.Users_in_Organisation(organisation_id).get('results', [])
        for usr in users:
            if usr.get('user_id') != g.user_id:
                userss.append(usr.get('user_id'))
        organisation_name = Organisation.search(organisation_id=organisation_id).get('data', {}).get('title', '')
        notification = delete_organisation_notification(
            recipients=userss,
            actor_id=g.user_id,
            actor_name=g.name,
            actor_avatar=g.avatar,
            org_id=organisation_id,
            org_name= organisation_name,
        )
        publish_event('organization_events', notification)
    else:
        response = jsonify({'message' : 'Failed to Delete'}), 400
    return response

    

# -------------------------- WORKSPACE --------------------------- #
@app.route('/add/workspace', methods=['POST'])
@auth_reqired
@require_organization_permission('manage_workspace')
def create_worskapce(): 
    """Create workspace in organization"""
    data = request.json
    if not data: 
        return jsonify({'error': 'Invalid or Missing JSON in request'}), 404
    title = data.get('title')
    image = data.get('image')
    description = data.get('description')
    created_By = data.get('user_id')
    role = data.get('role')
    createdAt = datetime.now(timezone.utc)
    organisation_id = data.get('organisation_id')
    info = [title, createdAt, organisation_id, created_By]
    if not check_list(info):
        return jsonify({
            'message' : "One or more fields are missing"
        }), 400
    workspace = Workspace(title, createdAt, image, description, organisation_id, created_By)
    new_workspace = workspace.create_Workspace()
    if not new_workspace:
        return jsonify({'message' : 'failed to create workspace'}), 500

    workspace_id = new_workspace['_id']
    if not check_list([workspace_id, role, created_By, createdAt, role]):
        return jsonify({
            'Error':'Please enter the required fields'
        }), 400
    access_workspace = User_Workspace(created_By,workspace_id,organisation_id,role,createdAt)
    success = access_workspace.create_User_Workspace()
    if not success:
        return jsonify({
            'message': "Workspace created, but failed to add creator as a member."
        }), 500
    
    # ------------ Create default backlog Board ----------------- #
    board = Board(title="Backlog", 
                  user_id= created_By, 
                  createdAt=createdAt, 
                  workspace_id=workspace_id, 
                  type= "Backlog",
                  startDate= None,
                  endDate=None,
                  image= {})
    board.create_board()
    publish_event('organization_events', {
        'event': 'workspace_created',
        'workspace_id': workspace_id,
        'organisation_id': organisation_id,
        'created_by': created_By
    })
    return jsonify({
        'message': f'Your {new_workspace["title"]} workspace has been created',
        'Workspace': new_workspace
    }), 201   
    
# search for workspace
@app.route('/workspace/search', methods=['GET', 'POST'])
@auth_reqired
@require_either_permission('view_workspaces', 'view_workspace')
def search_workspace():
    if request.method == 'GET':
        title = request.args.get('title')
        workspaces = Workspace.search(title=title, user_id=g.user_id)
        return jsonify(workspaces), 200

    if request.method == 'POST' and request.is_json:
        data = request.get_json()
        result = None

        if not data:
            return jsonify({'error': 'Missing or invalid JSON'}), 400

        if 'organisation_id' in data:
            result = Workspace.search(organisation_id=data['organisation_id'], user_id=g.user_id)
        elif 'workspace_id' in data:
            result = Workspace.search(workspace_id=data['workspace_id'], user_id=g.user_id)
        elif 'slug' in data:
            result = Workspace.search(slug=data['slug'], user_id=g.user_id)
        else:
            return jsonify({'error': 'Missing required search parameter'}), 400
        if result is not None:
            return jsonify(result), 200
        return jsonify({'error': 'Workspace not found'}), 404

    return jsonify({"error": "Invalid Request"}), 400
    
# Recent Workspace
@app.route('/recent/workspace', methods=['POST'])
@auth_reqired
def recent_workspace():
    try:
        response = User_Activity.get_last_accessed_entities(user_id= g.user_id, entity_type='Workspace', limit=2)
        return jsonify(response), 200
    except Exception as e:
         return jsonify({
            "Error" : str(e)
        }), 500


# Add user to a workspace
@app.route('/workspace/access', methods=['PATCH'])
@auth_reqired
@require_workspace_permission('invite_users_to_workspace')
def grant_access():
    """Invite user to workspace"""
    data = request.json
    if not data: 
        return jsonify({'error': 'Invalid or Missing JSON in request'}), 404
    workspace_id = data.get('workspace_id')
    user_id = data.get('user_id')
    role = data.get('role')
    joined_at = datetime.now(timezone.utc)
    try: 
        if check_list([workspace_id, user_id, role, joined_at]):
            workspace = Workspace.search(workspace_id=workspace_id)
            org_id = workspace['organisation_id']
            success, message = PermissionService.invite_user_to_workspace(
                user_id, org_id, workspace_id, role
            )
            if success:
                success_add = User_Workspace.create_User_Workspace(workspace_id, user_id, role, joined_at)
                if success_add:
                    return jsonify({'message': 'User invited to workspace successfully'}), 201
            else:
                return jsonify({'error': f'Failed to invite user: {message}'}), 400
        else :
            return jsonify({
                'Error' : 'Pleease enter the required fields'
            }), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 400  

# remove a user's access from a workspace
@app.route('/workspace/remove', methods=['PATCH'])
@auth_reqired
@require_workspace_permission('invite_users_to_workspace')
def remove_access():
    data = request.json
    if not data: 
        return jsonify({'error': 'Invalid or Missing JSON in request'}), 404
    workspace_id = data.get('workspace_id')
    user_id = data.get('user_id')
    if check_list([workspace_id, user_id]):
        workspace = Workspace.search(workspace_id=workspace_id)
        org_id = workspace['organisation_id']
        success = PermissionService.remove_user_from_workspace( user_id, org_id, workspace_id )
        if not success:
            return jsonify({'error': 'Failed to remove user'}), 400
        revoked = User_Workspace.revoke_User_Workspace(workspace_id, user_id)
        if revoked:
            return jsonify({'message' : 'User has been removed from this Workspace'}), 200
    else :
         return jsonify({
            'Error' : 'Pleease enter the required fields'
        }), 404

# get all user in a workspace
@app.route('/workspace/users', methods=['POST'])
@auth_reqired
@require_workspace_permission('view_workspace')
def user_in_workspace():
    data = request.json
    if not data: 
        return jsonify({'error': 'Invalid or Missing JSON in request'}), 404
    workspace_id = data.get('workspace_id')
    if check_list([workspace_id]):
        users = User_Workspace.Users_in_Workspace(workspace_id)
        return jsonify(users), 200
    else : 
        return jsonify({'error': 'No Workspace Selected'}), 400
    
# Update workspace
@app.route('/workspace/update', methods=['PATCH'])
@auth_reqired
@require_workspace_permission('manage_workspace')
def update_workspace():    
    data = request.json
    if not data: 
        return jsonify({'error': 'Invalid or Missing JSON in request'}), 404
    user_id = g.user_id
    title=data.get('title') 
    image=data.get('image')
    workspace_id = data.get('workspace_id')
    if check_list([workspace_id, user_id]):
        updated_workspace = Workspace.Update(workspace_id=workspace_id, user_id=user_id, title=title, image=image)
        if updated_workspace:
            return jsonify({"message" : "Workspace updated succesfully", 'data' : updated_workspace }), 200
        return jsonify({'error' : 'Update failed or invalid data'}), 400
    else :
            return jsonify({
        'Error' : 'Pleease enter the required fields'
    }), 404

# Delete a Workspace 
@app.route('/workspace/delete', methods=['DELETE'])
@auth_reqired
@require_workspace_permission('manage_workspace')
def delete_workspace():
    data=request.json
    if data: 
        success = Workspace.delete(Workspace_id= data.get('workspace_id'),user_id=g.user_id)
        if success:
            return jsonify({'message' : 'Deleted Successfully'}), 200
        return jsonify({'message' : 'Failed to Delete'}), 400
    else :
        return jsonify({
            'Error' : "Error Deleting Workspace"
        }), 400
    
#get all board in a workspace
@app.route('/workspace/boards', methods=['POST'])
@auth_reqired
@require_workspace_permission('view_workspace')
def workspace_board():
    data = request.json
    if not data: 
        return jsonify({'error': 'Invalid or Missing JSON in request'}), 404
    workspace_id = data.get('workspace_id')
    if check_list([workspace_id]):
        boards = Board.board_in_workspace(workspace_id, user_id=g.user_id)
        if boards is not None:
            return jsonify(boards), 200
        return jsonify({'message': 'No boards found in this workspace'}), 404
    else : 
        return jsonify({'error': 'No Workspace Selected'}), 400


@app.route('/issue/import', methods=['POST'])
@auth_reqired
def import_file_from_api():
    data = request.get_json()
    base64_file = data.get('file')
    column_mapping = data.get('mapping')
    if not base64_file or not column_mapping:
        return jsonify({'error': 'No file provided and Mapping provided'}), 400
    decoded_file = base64.b64decode(base64_file.encode('utf-8'))
    file = io.BytesIO(decoded_file)
    column_mapping_dict = json.loads(column_mapping) if isinstance(column_mapping, str) else column_mapping
    try:
        df = import_issue(file,column_mapping_dict)
        return jsonify(df), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred: ' + str(e)}), 500


# ------------------------------- SCRIPTS ----------------------------------#
@app.route('/backfill_organisation_admin', methods=['POST'])
@auth_reqired
def backfill_ID():
    try:
        Organisation = list(db.organisation.find())
        for org in Organisation:
            user = db.Users.find_one({"_id": ObjectId(g.user_id)})
            admin = {
                "user_id": str(user['_id']),
                "username": user['username'],
                "email": user['email'],
            }
            db.organisation.update_one(
                {'_id': org['_id']},
                {"$set": {"admin": admin}})
        return{'message':'Updating the User_Workspace document has been done succesfully'},200
    except Exception as e:
        return {'Error': str(e)},500

# -------------------------------------------------------------------------- #
@app.errorhandler(Exception)
def handle_exception(e):
    return jsonify({
        "error": str(e),
        "type": type(e).__name__
    }), 500
def Handle_bson_error(error):
    if isinstance(error, (BSONError, InvalidBSON, InvalidDocument, InvalidId, InvalidStringData)):
        message = {
            'Error' : str(error)
        }
        return jsonify(message), 404
    else :
        message = {
            'Error' : str(error)
        }
        return jsonify(message), 505

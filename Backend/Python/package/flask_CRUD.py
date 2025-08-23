from package import app, db
from flask import request, jsonify, g
from package.config.rate_limiter import limiter
from dateutil import parser
import json
import io
import base64
from bson.errors import BSONError , InvalidBSON, InvalidDocument, InvalidId, InvalidStringData
from package.models.user import User
from package.models.board import Board
from package.models.organisation import Organisation
from package.models.workspace import Workspace
from package.models.user_relationships import User_Workspace, User_Activity, User_Organisation
from package.config.utility import get_ip_address, auth_reqired
from package.config.import_issue import import_issue
from package.middleware import check_list
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


        skip_paths = ['/add/user', '/login', '/logout', 'auth/refresh', '/all', '/recent', '/boards']
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
            result = User.search_email(email)
            if (result):
                return jsonify({
                    'message' : 'User already exist'
                }), 409
            else :
                user = User(username, email, password, firstname, lastname, role , image, createdAt, updatedAt)
                response = user.createUser()
                return response
    else : 
        return jsonify({
            'message' : 'One or more fields are missing or empty'
        }), 404
    
@app.route('/user', methods=['GET'])
def user():
    user = User
    data = user.user()
    return data

@app.route('/find', methods=['GET'])
def find():
    find = User
    data = request.json
    if not data: 
        return jsonify({'error': 'Invalid or Missing JSON in request'}), 404
    id = data.get('_id')
    res = find.find_user(id)
    return res

@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('name')
    if check_list([query]):    
        resp = User.search(query)
        return resp
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
            'Error' : 'User not found'
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
        response = user.login(username, password, ip_address)
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
    return User.logout(token)
    
@app.route('/auth/refresh', methods=['POST'])
@limiter.limit("30 per minute")
def refresh():
    user = User
    token = request.cookies.get('refresh_token')
    if not token:
        return jsonify({'Error': 'token required'}), 401
    response = user.refresh(token)
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
    user_id = data.get('user_id')
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
        board = Board(title, type, user_id, createdAt, workspace_id, image, startDate, endDate)
        response = board.create_board()
        return response
    else :
        return jsonify({
            'message' : "One or more fields are missing"
        }), 400
    
# search for a board by title or workspace_id 
@app.route('/board/search', methods=['GET', 'POST'])
@auth_reqired
def search_title():
    if request.method == 'GET' :
        result = Board.search(title=request.args.get('title'))
        return result
    elif request.method == 'POST':
        result = Board.board_in_workspace(workspace_id = request.json.get('workspace_id'))
        return result
    else : 
        return jsonify({
            "Error" : "Enter a the Board title to search"
        }), 400
    
# search for a board by ID 
@app.route('/board/ID', methods=['GET'])
@auth_reqired
def search_ID():
    data = request.json
    if data : return Board.board_ID(ID=data.get('ID'))
    else :  return { "Error" : "Invalid search parameters"}

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
        response = Board.Update(board_id=board_id, workspace_id=workspace_id, user_id=user_id, start_date=start_date, end_date=end_date, title=title, image=image)
        return response
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
        response = Board.delete(board_id=data.get('board_id'),user_id=data.get('user_id'))
        return response
    else :
        return jsonify({
            'Error' : "Error Deleting Board"
        }), 400
    


# ----------------------------- Organisation ------------------------- #
@app.route('/add/organisation', methods=['POST'])
# @auth_reqired
def create_organisation(): 
    data = request.json
    if not data:
        return jsonify({  'error': 'Invalid Input' }), 404 
    title = data.get('title')
    image = data.get('image')
    description = data.get('description')
    created_By = data.get('user_id')
    slug = data.get('slug') or Organisation.generate_Unique_slug(title)
    createdAt = datetime.now(timezone.utc)
    role = data.get('role') or 'Admin'
    updatedAt = createdAt
    info = [title, createdAt, created_By]
    if check_list(info):
        organisation = Organisation(title, createdAt, updatedAt, image, description, created_By, slug)
        response = organisation.create_organisation()
        organisation = response.get_json()
        user_organisation = User_Organisation( user_id= created_By, organisation_id=organisation['organisation']['_id']['$oid'], role = role ,  joined_at= createdAt) 
        user_organisation_response = user_organisation.create_User_Organisation()
        if user_organisation_response[1] != 201:
            Organisation.delete(organisation_id=organisation['organisation']['_id']['$oid'], user_id=created_By)
            return jsonify({
                'message': "Organisation created, but failed to add creator as a member."
            }), 500
        return response
    else :
        return jsonify({
            'message' : "One or more fields are missing"
        }), 404

# search for Organisation by name or ID 
@app.route('/organisation/search', methods=['GET', 'POST'])
@auth_reqired
def search_organisation():
    if request.method == 'GET' :
        result = Organisation.search(title=request.args.get('title'))
        return result
    elif request.json:
        data = request.json  
        if data.get('organisation_id'):
            result = Organisation.search(organisation_id=data.get('organisation_id'))
            return result
        elif data.get('slug'):
            result = Organisation.search(slug=data.get('slug'))
            return result
    else : 
        return jsonify({
            "Error" : "Error in your search"
        }), 400
    
# All Organisation
@app.route('/all/organisation', methods=['GET'])
@auth_reqired
def all_organisation():
    try:
        response = Organisation.organisation()
        return response
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
        return response
    except Exception as e:
         return jsonify({
            "Error" : str(e)
        }), 500

# Update Organisation
@app.route('/organisation/update', methods=['PATCH'])
@auth_reqired
def update_organisation():    
    data = request.json
    if not data: 
        return jsonify({'error': 'Invalid or Missing JSON in request'}), 404
    user_id = data.get('user_id')
    title=data.get('title') 
    image=data.get('image')
    organisation_id = data.get('organisation_id')
    if check_list([organisation_id, user_id]):
        response = Organisation.Update(organisation_id=organisation_id, user_id=user_id, title=title, image=image)
        return response
    else :
            return jsonify({
        'Error' : 'Pleease enter the required fields'
    }), 404

# Delete a Organisation 
@app.route('/organisation/delete', methods=['DELETE'])
@auth_reqired
def delete_organisation():
    data=request.json
    if data: 
        response = Organisation.delete(organisation_id= data.get('organisation_id'),user_id=data.get('user_id'))
        return response
    else :
        return jsonify({
            'Error' : "Error Deleting Organisation"
        }), 400
    

# -------------------------- WORKSPACE --------------------------- #
@app.route('/add/workspace', methods=['POST'])
@auth_reqired
def create_worskapce(): 
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
    workspace_response = workspace.create_Workspace()
    if workspace_response.status_code != 201:
        return workspace_response
    response_data = workspace_response.get_json()
    workspace_id = response_data['Workspace']['_id']['$oid']
    if not check_list([workspace_id, role, created_By, createdAt, role]):
        return jsonify({
            'Error':'Please enter the required fields'
        }), 400
    access_workspace = User_Workspace(created_By,workspace_id,organisation_id,role,createdAt)
    access_response = access_workspace.create_User_Workspace()
    if access_response[1] != 201:
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
    return workspace_response            
    
# search for workspace
@app.route('/workspace/search', methods=['GET', 'POST'])
@auth_reqired
def search_workspace():
    if request.method == 'GET':
        title = request.args.get('title')
        result = Workspace.search(title=title)
        return jsonify(result), 200

    if request.method == 'POST' and request.is_json:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'Missing or invalid JSON'}), 400

        if 'organisation_id' in data:
            result = Workspace.search(organisation_id=data['organisation_id'])
        elif 'workspace_id' in data:
            result = Workspace.search(workspace_id=data['workspace_id'])
        elif 'slug' in data:
            result = Workspace.search(slug=data['slug'])
        else:
            return jsonify({'error': 'Missing required search parameter'}), 400

        return result

    return jsonify({"error": "Invalid Request"}), 400
    
# Recent Workspace
@app.route('/recent/workspace', methods=['POST'])
@auth_reqired
def recent_workspace():
    try:
        response = User_Activity.get_last_accessed_entities(user_id= g.user_id, entity_type='Workspace', limit=2)
        return response
    except Exception as e:
         return jsonify({
            "Error" : str(e)
        }), 500


# Add user to a workspace
@app.route('/workspace/access', methods=['PATCH'])
@auth_reqired
def grant_access():
    data = request.json
    if not data: 
        return jsonify({'error': 'Invalid or Missing JSON in request'}), 404
    workspace_id = data.get('workspace_id')
    user_id = data.get('user_id')
    role = data.get('role')
    joined_at = datetime.now(timezone.utc)
    if check_list([workspace_id, user_id, role, joined_at]):
        response = User_Workspace.create_User_Workspace(workspace_id, user_id, role, joined_at)
        return response
    else :
         return jsonify({
            'Error' : 'Pleease enter the required fields'
        }), 404

# remove a user's access from a workspace
@app.route('/workspace/remove', methods=['PATCH'])
@auth_reqired
def remove_access():
    data = request.json
    if not data: 
        return jsonify({'error': 'Invalid or Missing JSON in request'}), 404
    workspace_id = data.get('workspace_id')
    user_id = data.get('user_id')
    if check_list([workspace_id, user_id]):
        response = User_Workspace.revoke_User_Workspace(workspace_id, user_id)
        return response
    else :
         return jsonify({
            'Error' : 'Pleease enter the required fields'
        }), 404

# get all user in a workspace
@app.route('/workspace/users', methods=['POST'])
@auth_reqired
def board():
    data = request.json
    if not data: 
        return jsonify({'error': 'Invalid or Missing JSON in request'}), 404
    workspace_id = data.get('workspace_id')
    if check_list([workspace_id]):
        response = User_Workspace.Users_in_Workspace(workspace_id)
        return response
    else : 
        return jsonify({'error': 'No Workspace Selected'}), 400
    
# Update workspace
@app.route('/workspace/update', methods=['PATCH'])
@auth_reqired
def update_workspace():    
    data = request.json
    if not data: 
        return jsonify({'error': 'Invalid or Missing JSON in request'}), 404
    user_id = data.get('user_id')
    title=data.get('title') 
    image=data.get('image')
    workspace_id = data.get('workspace_id')
    if check_list([workspace_id, user_id]):
        response = Workspace.Update(workspace_id=workspace_id, user_id=user_id, title=title, image=image)
        return response
    else :
            return jsonify({
        'Error' : 'Pleease enter the required fields'
    }), 404

# Delete a Workspace 
@app.route('/workspace/delete', methods=['DELETE'])
@auth_reqired
def delete_workspace():
    data=request.json
    if data: 
        response = Workspace.delete(Workspace_id= data.get('workspace_id'),user_id=data.get('user_id'))
        return response
    else :
        return jsonify({
            'Error' : "Error Deleting Workspace"
        }), 400
    
#get all board in a workspace
@app.route('/workspace/boards', methods=['POST'])
@auth_reqired
def workspace_board():
    data = request.json
    if not data: 
        return jsonify({'error': 'Invalid or Missing JSON in request'}), 404
    workspace_id = data.get('workspace_id')
    if check_list([workspace_id]):
        response = Board.board_in_workspace(workspace_id)
        return response
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
@app.route('/backfill_organisation_id', methods=['POST'])
@auth_reqired
def backfill_ID():
    try:
        workspaces = list(db.Workspace.find())
        for workspace in workspaces:
            title = workspace.get('title') 
            slug = Workspace.generate_Unique_slug(title)
            db.Workspace.update_one(
                {"title": title},
                {"$set": {"slug": slug}})
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

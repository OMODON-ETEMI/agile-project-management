from flask import current_app
import json, uuid
from datetime import datetime, timezone
from dotenv import load_dotenv
from package.config.auth import AuthManager
from package.config.security import SecurityConfig
import os
from package.config.utility import serialize_document
import jwt
from bson import json_util, ObjectId
from package import db
from package.middleware import check_password, hash_password

load_dotenv()


ALGORITHM = os.getenv('JWT_ALGORITHM')


class User: 
    def __init__(self, username, email, password, firstname, lastname, role, image, createdAt, updatedAt):
        self.username = username
        self.email = email
        self.password = password
        self.firstname = firstname
        self.lastname = lastname
        self.role = role
        self.image =  image or {}
        self.createdAt = createdAt
        self.updatedAt = updatedAt

    def createUser(self):
        result = db.Users.insert_one({
            'username': self.username,
            'email': self.email,
            'password': hash_password(self.password),
            'firstname': self.firstname,
            'lastname': self.lastname,
            'createdAt': self.createdAt,
            'updatedAt': self.updatedAt,
            'role': self.role,
            'image': self.image 
        })
        
        new_user = db.Users.find_one({'_id': result.inserted_id})
        if new_user:
            user_data = serialize_document(new_user)
            access_token = self.create_access_token(user_data)
            refresh_token = self.create_refresh_token(user_data)
            return user_data, access_token, refresh_token
        else:
            return None, None, None
        
    @staticmethod
    def user():
        users = db.Users.find()
        return serialize_document(list(users))
    
    @staticmethod
    def find_user(id):
        user_id = ObjectId(id)
        user = db.Users.find_one({'_id': user_id})
        if user:
            return serialize_document(user)
        return None
        
    @staticmethod
    def find_multiple_users(user_data):
        users_list = []
        for user_info in user_data:
            user_id = user_info["user_id"]
            joined_at = user_info["joined_at"]
            user = db.Users.find_one({"_id": ObjectId(user_id)})
            if user:
                user_details = {
                    "user_id": user_id,
                    "first_name": user.get("firstname", ""),
                    "last_name": user.get("lastname", ""),
                    "image": user.get("image", {}),
                    "role": user.get("role", ""),
                    "joined_at": joined_at
                }
                users_list.append(user_details)
        return users_list
        
    @staticmethod
    def search(name):
        users = db.Users.find({'username': {'$regex': f'.*{name}*.', '$options': 'i'}})
        return serialize_document(list(users))
    
    @staticmethod
    def search_email(email):
        users = db.Users.find({'email': {'$regex': f'.*{email}*.', '$options': 'i'}})
        user_list = [{'email': user['email']} for user in users]
        return bool(user_list)
    
    @staticmethod
    def create_access_token(user_data):
        """Create access token with 30-minutes expiry"""
        payload = {
            'user_id': user_data['_id'],
            'username': user_data['username'],
            'email': user_data['email'],
            'image': user_data['image'],
            'firstname': user_data['firstname'],
            'lastname': user_data['lastname'],
            'organisations': user_data['organisations'],
            'workspaces': user_data['workspaces'],
            'token_type': 'access',
            'jti': str(uuid.uuid4()), 
            'exp': int((datetime.now(timezone.utc) + SecurityConfig.JWT_ACCESS_TOKEN_EXPIRES).timestamp()),
            'iat': int(datetime.now(timezone.utc).timestamp()),
        }
        return jwt.encode(payload, SecurityConfig.JWT_SECRET_KEY, ALGORITHM)
    
    @staticmethod
    def create_refresh_token(user_data):
        """Create refresh token with 7-days expiry"""
        return jwt.encode({
            'user_id': user_data['_id'],
            'token_type': 'refresh',
            'jti': str(uuid.uuid4()),
            'exp': int((datetime.now(timezone.utc) + SecurityConfig.JWT_REFRESH_TOKEN_EXPIRES).timestamp()),
            'iat': int(datetime.now(timezone.utc).timestamp()),
        }, SecurityConfig.JWT_REFRESH_SECRET_KEY, ALGORITHM)
        
    @staticmethod
    def User_Data(user_id):
        """Fetch user data by ID"""
        pipeline = [
            { '$match': {'_id': ObjectId(user_id)} },
            {
                '$lookup': {
                    'from': 'User_Organisation',
                    'localField': '_id',
                    'foreignField': 'user_id',
                    'as': 'user_orgs'
                }
            },
            {
                '$lookup': {
                    'from': 'User_Workspace',
                    'localField': '_id',
                    'foreignField': 'user_id',
                    'as': 'user_workspaces'
                }
            },
            {
                '$addFields': {
                    'organisations' : {
                        '$map' : {
                            'input' : '$user_orgs',
                            'as' : 'org',
                            'in' : {
                                'organisation_id' : '$$org.organisation_id',
                            }
                        }
                    },
                    'workspaces' : {
                        '$map' : {
                            'input' : '$user_workspaces',
                            'as' : 'ws',
                            'in' : {
                                'workspace_id' : '$$ws.workspace_id',
                                'role' : '$$ws.role'
                            }
                        }
                    }
                }
            },
            {
                '$project': {
                    'password': 0,
                    'createdAt': 0,
                    'updatedAt': 0,
                    'user_orgs': 0,
                    'user_workspaces': 0
                }
            }
        ]
        user_data = list(db.Users.aggregate(pipeline))
        if not user_data:
            return None
        return serialize_document(user_data[0])

    @staticmethod
    def login(username, password, ip_address):
            #check for brute force attempts
        if AuthManager.check_brute_force(username, ip_address):
            return {'success': False, 'error': 'Too many failed attempts. Try again later.', 'status_code': 429}
        try:
            user = db.Users.find_one({'username': username})
            if not user or not check_password(password, user['password']):
                AuthManager.record_failed_attempt(username, ip_address)
                return {'success': False, 'error': "Invalid credentials", 'status_code': 401}
            
            #clear failed attempts on successful login
            AuthManager.clear_failed_attempts(username)

            #Generating tokens
            try:
                user_data = serialize_document(user)
                Data = User.User_Data(user_data['_id'])
                access_token = User.create_access_token(Data)
                refresh_token = User.create_refresh_token(Data)
            except Exception as e:
                print('Token Generation Error:', str(e))
                return {'success': False, 'error': str(e), 'message': 'Failed to generate tokens', 'status_code': 500}

            return {
                'success': True,
                'data': Data,
                'access_token': access_token,
                'refresh_token': refresh_token
            }
        except Exception as e:
            current_app.logger.error(f"Login error: {str(e)}")
            return {'success': False, 'error': 'An error occurred during login', 'status_code': 500}
            

    @staticmethod
    def logout(refresh_token):
        """Logout function to invalidate the refresh token and clear cookies"""
        try:
            # Decode and verify the token
            payload = jwt.decode(refresh_token, SecurityConfig.JWT_REFRESH_SECRET_KEY, ALGORITHM)

            if payload['token_type'] != 'refresh':
                return {'success': False, 'error': 'Token type invalid', 'status_code': 401}

            # Check if the token is already blacklisted
            if AuthManager.BlockedToken.is_blocked(refresh_token):
                return {'success': False, 'error': 'Token already revoked', 'status_code': 401}

            # Blacklist the refresh token
            AuthManager.block_token(refresh_token)
            return {'success': True}
        except jwt.ExpiredSignatureError:
            return {'success': False, 'error': 'Token expired', 'status_code': 401}
            
        except jwt.InvalidTokenError:
            return {'success': False, 'error': 'Token invalid', 'status_code': 401}
        except Exception as e:
            current_app.logger.error(f"Logout error: {str(e)}")
            return {'success': False, 'error': 'An error occurred during logout', 'status_code': 500}

        
    @staticmethod
    def refresh(token):
        payload = jwt.decode(token, current_app.config['JWT_REFRESH_SECRET_KEY'], ALGORITHM)
        if payload['token_type'] != 'refresh':
            return {'success': False, 'error': 'Token type invalid', 'status_code': 401}
        try:
            #check if token is blacklisted
            if AuthManager.BlockedToken.is_blocked(token):
                return {'success': False, 'error': 'Token revoked', 'status_code': 401}

            user = db.Users.find_one({"_id": ObjectId(payload['user_id'])})
            if not user:
                return {'success': False, 'error': 'User not found', 'status_code': 404}
            
            AuthManager.block_token(token)

            #Generate new tokens
            user_data = serialize_document(user)
            Data = User.User_Data(user_data['_id'])
            access_token = User.create_access_token(Data)
            refresh_token = User.create_refresh_token(Data)
            return {'success': True, 'access_token': access_token, 'refresh_token': refresh_token}
        except jwt.ExpiredSignatureError:
            return {'success': False, 'error': 'Token expired', 'status_code': 401}
        except jwt.InvalidTokenError:
            return {'success': False, 'error': 'Invalid token', 'status_code': 401}
        except Exception as e:
            current_app.logger.error(f"Refresh error: {str(e)}")
            return{'success': False, 'error': 'An error occurred during refresh', 'status_code': 500}

    @staticmethod
    def server_Refresh(token):
        payload = jwt.decode(token, current_app.config['JWT_REFRESH_SECRET_KEY'], ALGORITHM)
        
        if payload['token_type'] != 'refresh':
            return {'success': False, 'error': 'Token type invalid', 'status_code': 401}
        try:
            #check if token is blacklisted
            if AuthManager.BlockedToken.is_blocked(token):
                return {'success': False, 'error': 'Token revoked', 'status_code': 401}

            user = db.Users.find_one({"_id": ObjectId(payload['user_id'])})
            if not user:
                return {'success': False, 'error': 'User not found', 'status_code': 404}
            

            #Generate new tokens
            user_data = serialize_document(user)
            Data = User.User_Data(user_data['_id'])
            access_token = User.create_access_token(Data)
            return {'success': True, 'access_token': access_token}
        except jwt.ExpiredSignatureError:
            return {'success': False, 'error': 'Token expired', 'status_code': 401}
        except jwt.InvalidTokenError:
            return {'success': False, 'error': 'Invalid token', 'status_code': 401}
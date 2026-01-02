from flask import Response, jsonify, make_response, current_app
import json, uuid
from datetime import datetime, timezone
from dotenv import load_dotenv
from package.config.auth import AuthManager
from package.config.security import SecurityConfig
import os
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
            user_data = json.loads(json_util.dumps(new_user))
            access_token = self.create_access_token(user_data)
            refresh_token = self.create_refresh_token(user_data)
            response = make_response(jsonify({
                    'response': f'Your Account has been created, {new_user["firstname"]}',
                    'token': access_token
                }))
            response.set_cookie('refresh_token',
                                 refresh_token, 
                                 httponly=SecurityConfig.SESSION_COOKIE_HTTPONLY ,
                                 secure= SecurityConfig.SESSION_COOKIE_SECURE, 
                                 samesite= SecurityConfig.SESSION_COOKIE_SAMESITE, 
                                 max_age=60 * 60 * 24 * 7,  # 7 days
                                 path= '/', )
            response.status_code = 200
            return response
        else:
            return Response(json.dumps({'Error': 'Failed to create account'}), mimetype='application/json'), 500
        
    @staticmethod
    def user():
        users = db.Users.find()
        users_list = [json.loads(json_util.dumps(user)) for user in users]
        return jsonify(users_list), 200
    
    @staticmethod
    def find_user(id):
        user_id = ObjectId(id)
        user = db.Users.find_one({'_id': user_id})
        if user:
            user['_id'] = str(user['_id']) 
            return jsonify(user), 200  
        else:
            return jsonify({'Error': 'User not found'}), 404 
        
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
        user_list = [{'username': user['username']} for user in users]
        return jsonify(user_list), 200
    
    @staticmethod
    def search_email(email):
        users = db.Users.find({'email': {'$regex': f'.*{email}*.', '$options': 'i'}})
        user_list = [{'email': user['email']} for user in users]
        return bool(user_list)
    
    @staticmethod
    def create_access_token(user_data):
        """Create access token with 30-minutes expiry"""
        payload = {
            'user_id': user_data['_id']['$oid'],
            'username': user_data['username'],
            'first_name': user_data['firstname'],
            'last_name': user_data['lastname'],
            'image': user_data['image'],
            'role': user_data['role'],
            'email': user_data['email'],
            'created': user_data['createdAt'],
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
            'user_id': user_data['_id']['$oid'],
            'token_type': 'refresh',
            'jti': str(uuid.uuid4()),
            'exp': int((datetime.now(timezone.utc) + SecurityConfig.JWT_REFRESH_TOKEN_EXPIRES).timestamp()),
            'iat': int(datetime.now(timezone.utc).timestamp()),
        }, SecurityConfig.JWT_REFRESH_SECRET_KEY, ALGORITHM)
        
    @staticmethod
    def User_Data(user_id):
        """Fetch user data by ID"""
        pipline = [
            {
                '$match' : {'_id': ObjectId(user_id)}
            },
            {
                '$lookup': {
                    'from': 'User_Organisation',
                    'localField': '_id',
                    'foreignField': 'user_id',
                    'as': 'user_Orgs'
                }
            }, 
            {
                '$unwind': '$user_Orgs'
            },
            {
                '$lookup': {
                    'from' : 'organisation',
                    'let' : {'org_id': '$user_Orgs.organisation_id'},
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$eq': ['$_id', '$$org_id']
                                }
                            }
                        },
                    ],
                    'as': 'organisation'
                }
            },
            {
                '$unwind': '$organisation'
            },
            {
                '$addFields': {
                    'organisation.role': '$user_Orgs.role',
                }
            },
            {
                '$project': {
                    'user_Orgs': 0,
                }
            }
        ]
        User_data = list(db.Users.aggregate(pipline))
        if not User_data:
            return "User not found", 404
        return User_data

    @staticmethod
    def login(username, password, ip_address):
            #check for brute force attempts
        if AuthManager.check_brute_force(username, ip_address):
            response = make_response(jsonify({'Error': 'Too many failed attempts. Try again later.'}))
            response.delete_cookie('refresh_token', path='/')
            response.status_code = 429
            return response
        try:
            user = db.Users.find_one({'username': username})
            if not user or not check_password(password, user['password']):
                AuthManager.record_failed_attempt(username, ip_address)
                return jsonify({'Error': "Invalid credentials"}), 401
            
            #clear failed attempts on successful login
            AuthManager.clear_failed_attempts(username)

            #Generating tokens
            try:
                user_data = json.loads(json_util.dumps(user))
                Data = json.loads(json_util.dumps(User.User_Data(user_data['_id']['$oid'])))
                access_token = User.create_access_token(user_data)
                refresh_token = User.create_refresh_token(user_data)
                
            except Exception as e:
                print('Token Generation Error:', str(e))
                return jsonify({'Message': 'Failed to generate tokens',
                                'Error': str(e)}), 500

            response = jsonify({
                            'response': "Login successful",
                            'data': Data,
                            'token': access_token,
                        })

            #set cookie
            response.set_cookie('refresh_token',
                                 refresh_token, 
                                 httponly=SecurityConfig.SESSION_COOKIE_HTTPONLY ,
                                 secure= SecurityConfig.SESSION_COOKIE_SECURE, 
                                 samesite= SecurityConfig.SESSION_COOKIE_SAMESITE, 
                                 max_age=60 * 60 * 24 * 7,  # 7 days
                                 path= '/', )
            response.status_code = 200
            return response
        except Exception as e:
            current_app.logger.error(f"Login error: {str(e)}")
            return jsonify({'Error': 'An error occurred during login'}), 500
            

    @staticmethod
    def logout(refresh_token):
        """Logout function to invalidate the refresh token and clear cookies"""
        try:
            # Decode and verify the token
            payload = jwt.decode(refresh_token, SecurityConfig.JWT_REFRESH_SECRET_KEY, ALGORITHM)

            if payload['token_type'] != 'refresh':
                response = make_response(jsonify({'Error': 'Token type invalid'}))
                response.delete_cookie('refresh_token', path='/')
                response.status_code = 401
                return response

            # Check if the token is already blacklisted
            if AuthManager.BlockedToken.is_blocked(refresh_token):
                response = make_response(jsonify({'Error': 'Token already revoked'}))
                response.delete_cookie('refresh_token', path='/')
                response.status_code = 401
                return response

            # Blacklist the refresh token
            AuthManager.block_token(refresh_token)
            response = make_response(jsonify({'response': 'Successfully logged out'}))
            response.delete_cookie('refresh_token', path='/')
            response.status_code = 401
            return response
        except jwt.ExpiredSignatureError:
            response = make_response(jsonify({'Error': 'Token expired'}))
            response.delete_cookie('refresh_token', path='/')
            response.status_code = 401
            return response
            
        except jwt.InvalidTokenError:
            response = make_response(jsonify({'Error': 'Token invalid'}))
            response.delete_cookie('refresh_token', path='/')
            response.status_code = 401
            return response
        except Exception as e:
            current_app.logger.error(f"Logout error: {str(e)}")
            return jsonify({'Error': 'An error occurred during logout'}), 500

        
    @staticmethod
    def refresh(token):
        payload = jwt.decode(token, current_app.config['JWT_REFRESH_SECRET_KEY'], ALGORITHM)
        if payload['token_type'] != 'refresh':
            response = make_response(jsonify({'Error': 'Token type invalid'}))
            response.delete_cookie('refresh_token', path='/')
            response.status_code = 401
            return response
        try:
            #check if token is blacklisted
            if AuthManager.BlockedToken.is_blocked(token):
                response = make_response(jsonify({'error': 'Token revoked'}))
                response.set_cookie('refresh_token', path='/')
                response.status_code = 401
                return response

            user = db.Users.find_one({"_id": ObjectId(payload['user_id'])})
            if not user:
                return jsonify({'Error': 'User not found'}), 404
            
            AuthManager.block_token(token)

            #Generate new tokens
            user_data = json.loads(json_util.dumps(user))
            access_token = User.create_access_token(user_data)
            refresh_token = User.create_refresh_token(user_data)
            print('Generated new tokens during refresh: ', refresh_token, access_token)
            response = make_response(jsonify({'token': access_token}))
            response.set_cookie('refresh_token',
                                 refresh_token, 
                                 httponly=SecurityConfig.SESSION_COOKIE_HTTPONLY ,
                                 secure= SecurityConfig.SESSION_COOKIE_SECURE, 
                                 samesite= SecurityConfig.SESSION_COOKIE_SAMESITE, 
                                 max_age=604800, 
                                 path= '/',)
            response.status_code = 200
            return response
        except jwt.ExpiredSignatureError:
            print('Token expired during refresh')
            response = make_response(jsonify({'error': 'Token expired'}))
            response.delete_cookie('refresh_token', path='/')
            response.status_code = 401
            return response
        except jwt.InvalidTokenError:
            print('Invalid token during refresh')
            response = make_response(jsonify({'Error': 'Invalid token'}))
            response.delete_cookie('refresh_token', path='/')
            response.status_code = 401
            return response
        
    @staticmethod
    def server_Refresh(token):
        payload = jwt.decode(token, current_app.config['JWT_REFRESH_SECRET_KEY'], ALGORITHM)
        if payload['token_type'] != 'refresh':
            response = make_response(jsonify({'Error': 'Token type invalid'}))
            response.delete_cookie('refresh_token', path='/')
            response.status_code = 401
            return response
        try:
            #check if token is blacklisted
            if AuthManager.BlockedToken.is_blocked(token):
                response = make_response(jsonify({'error': 'Token revoked'}))
                response.set_cookie('refresh_token', path='/')
                response.status_code = 401
                return response

            user = db.Users.find_one({"_id": ObjectId(payload['user_id'])})
            if not user:
                return jsonify({'Error': 'User not found'}), 404
            

            #Generate new tokens
            user_data = json.loads(json_util.dumps(user))
            access_token = User.create_access_token(user_data)
            print('Generated new tokens during server refresh: ', access_token)
            response = make_response(jsonify({'token': access_token}))
            response.status_code = 200
            return response
        except jwt.ExpiredSignatureError:
            print('Token expired during refresh')
            response = make_response(jsonify({'error': 'Token expired'}))
            response.delete_cookie('refresh_token', path='/')
            response.status_code = 401
            return response
        except jwt.InvalidTokenError:
            print('Invalid token during refresh')
            response = make_response(jsonify({'Error': 'Invalid token'}))
            response.delete_cookie('refresh_token', path='/')
            response.status_code = 401
            return response
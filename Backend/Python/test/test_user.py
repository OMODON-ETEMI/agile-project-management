import sys
import os
from unittest.mock import MagicMock, patch
import mongomock
import pytest
import jwt
from datetime import datetime, timezone, timedelta
from bson import ObjectId

# ==========================================================
# STEP 1: THE "SILENT KILLER" FIX (MOCK BEFORE IMPORT)
# ==========================================================
# We create a fake Limiter and Redis BEFORE importing the app
mock_limiter = MagicMock()
mock_limiter.limit = lambda x: (lambda f: f) # Decorator that does nothing

# Inject mocks into the system so the app uses them instead of real ones
sys.modules['package.config.rate_limiter'] = MagicMock(limiter=mock_limiter)
sys.modules['package.config.redis'] = MagicMock(publish_event=lambda *args, **kwargs: None)

# ==========================================================
# STEP 2: MOCK MONGO AT THE SOURCE
# ==========================================================
# This prevents the app from trying to connect to 'host.docker.internal'
with patch('pymongo.MongoClient') as mock_client:
    mock_db = mongomock.MongoClient().db
    mock_client.return_value.get_database.return_value = mock_db
    
    # NOW we can safely import the app
    from package import app, db
    from package.config.security import SecurityConfig

# Force a secret key so JWT doesn't crash
SecurityConfig.JWT_SECRET_KEY = "test_secret_key"
SecurityConfig.JWT_ALGORITHM = "HS256"

# ==========================================================
# STEP 3: FIXTURES & HELPERS
# ==========================================================

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['PROPAGATE_EXCEPTIONS'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def mock_database():
    # We return the mongomock db we created earlier
    return mock_db

def generate_test_token(user_id, username="testuser"):
    payload = {
        'user_id': str(user_id),
        'username': username,
        'exp': datetime.now(timezone.utc) + timedelta(minutes=30)
    }
    token = jwt.encode(payload, "test_secret_key", "HS256")
    return {'Authorization': f'Bearer {token}'}

# ==========================================================
# STEP 4: THE TESTS
# ==========================================================

class TestUserAPI:

    def test_create_user_success(self, client, mock_database):
            payload = {
                "username": "glory_dev",
                "email": "test@example.com",
                "firstname": "Oritsetemi",
                "lastname": "Omodon",
                "password": "securepassword123",
                "role": "admin"
            }

            # IMPORTANT: Patch where the route is (package.flask_CRUD) 
            # so it intercepts the specific instance the route is using.
            with patch('package.flask_CRUD.User.search') as mock_search, \
                patch('package.flask_CRUD.User.search_email') as mock_email, \
                patch('package.flask_CRUD.User.createUser') as mock_create:
                
                # 2. Setup the search mock to return that object + status 200
                mock_search.return_value = []
                
                # 3. Ensure email check returns False
                mock_email.return_value = False
                
                # 4. Setup successful creation return
                mock_create.return_value = (
                    {"firstname": "Oritsetemi"}, 
                    "access_token_123", 
                    "refresh_token_123"
                )

                response = client.post('/add/user', json=payload)

            # Log for your own sanity if it fails again
            if response.status_code != 201:
                print(f"DEBUG: Status {response.status_code}, Body: {response.get_json()}")

            assert response.status_code == 201
            assert "Your Account has been created" in response.get_json()['response']
            """Test successful registration with dummy headers to bypass middleware."""
            if response.status_code == 500:
                print(f"\nDEBUG: Server Response Data: {response.data.decode()}")

    def test_get_user_me_protected(self, client, mock_database):
        user_id = ObjectId()
        headers = generate_test_token(user_id, "glory_dev")

        # Mock the DB response that the route expects
        with patch('package.models.user.User.User_Data') as mock_data:
            mock_data.return_value = {"username": "glory_dev", "email": "test@example.com"}
            response = client.post('/User/me', headers=headers)

        assert response.status_code == 200
        
    @patch('package.flask_CRUD.User.find_user')
    def test_find_user_success(self, mock_find, client):
        # Mock the return of the user document
        mock_find.return_value = {"_id": "user_123", "username": "glory_dev"}
        
        response = client.get('/find', json={"_id": "user_123"})
        
        assert response.status_code == 200
        assert response.get_json()['username'] == "glory_dev"
        
    @patch('package.flask_CRUD.User.search')
    def test_search_users_success(self, mock_search, client):
        # Mock returning a list of users
        mock_search.return_value = [{"username": "glory_dev"}, {"username": "glory_admin"}]
        
        # Pass query parameter 'name' as your route expects request.args.get('name')
        response = client.get('/users/search?name=glory')
        
        assert response.status_code == 200
        assert len(response.get_json()) == 2
        
    @patch('package.flask_CRUD.get_ip_address')
    @patch('package.flask_CRUD.User.login')
    def test_login_success(self, mock_login, mock_ip, client):
        # Mock the IP helper function
        mock_ip.return_value = "127.0.0.1"
        
        # Mock a successful dictionary response from User.login
        mock_login.return_value = {
            "success": True,
            "data": {"username": "glory_dev", "role": "admin"},
            "access_token": "mock_access_token",
            "refresh_token": "mock_refresh_token"
        }

        payload = {"username": "glory_dev", "password": "securepassword123"}
        response = client.post('/login', json=payload)

        assert response.status_code == 200
        assert response.get_json()['response'] == "Login successful"
        
        # Verify the cookie was actually set in the headers
        cookies = response.headers.getlist('Set-Cookie')
        assert any('refresh_token=mock_refresh_token' in cookie for cookie in cookies)
        
    @patch('package.flask_CRUD.User.refresh')
    def test_refresh_success(self, mock_refresh, client):
        # Mock the success response
        mock_refresh.return_value = {
            "success": True,
            "access_token": "new_access_token",
            "refresh_token": "new_refresh_token"
        }

        # Simulate the browser sending the HTTPOnly cookie
        client.set_cookie('refresh_token', 'old_valid_token', domain='localhost')
        
        response = client.post('/auth/refresh')

        assert response.status_code == 200
        assert response.get_json()['token'] == "new_access_token"
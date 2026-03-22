
import pytest
import sys
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

class TestBoardAPI:

    # ----------------- 1. CREATE BOARD ----------------- #
    @patch('package.flask_CRUD.Board.create_board')
    def test_create_board_success(self, mock_create, client):
        user_id = "1234567890abcdef12345678"
        headers = generate_test_token(user_id, "glory_dev")
        workspace_id = str(ObjectId())
        payload = {
            "title": "Frontend Sprint 1",
            "type": "Board",
            "workspace_id": workspace_id
        }
        
        mock_create.return_value = {
            "_id": "board_789",
            "title": "Frontend Sprint 1",
            "type": "Board"
        }

        response = client.post('/add/board', json=payload, headers=headers)

        assert response.status_code == 201
        assert response.get_json()['board']['title'] == "Frontend Sprint 1"


    def test_create_sprint_missing_dates(self, client):
        user_id = ObjectId()
        headers = generate_test_token(user_id, "glory_dev")
        workspace_id = str(ObjectId())

        
        # Sprints strictly require dates in your logic
        payload = {
            "title": "Active Sprint",
            "type": "Sprint",
            "workspace_id": workspace_id
        }

        response = client.post('/add/board', json=payload, headers=headers)

        assert response.status_code == 400
        assert "Valid start and end dates are required" in response.get_json()['Error']

    # ----------------- 2. SEARCH BOARDS ----------------- #
    @patch('package.flask_CRUD.Board.search')
    def test_search_board_get_success(self, mock_search, client):
        user_id = ObjectId()
        headers = generate_test_token(user_id, "glory_dev")
        mock_search.return_value = [{"_id": "b1", "title": "Dev Board"}]
        
        response = client.get('/board/search?title=Dev', headers=headers)
        
        assert response.status_code == 200
        assert len(response.get_json()) == 1

    @patch('package.flask_CRUD.Board.board_in_workspace')
    def test_search_board_post_workspace(self, mock_workspace_search, client):
        user_id = ObjectId()
        headers = generate_test_token(user_id, "glory_dev")
        mock_workspace_search.return_value = [
            {"_id": "b1", "title": "Dev Board", "issues": []}
        ]
        
        payload = {"workspace": "workspace_456"}
        response = client.post('/board/search', json=payload, headers=headers)
        
        assert response.status_code == 200
        assert "issues" in response.get_json()[0]

    # ----------------- 3. UPDATE BOARD ----------------- #
    @patch('package.flask_CRUD.Board.Update')
    def test_update_board_success(self, mock_update, client):
        user_id = ObjectId()
        headers = generate_test_token(user_id, "glory_dev")
        payload = {
            "board_id": "board_789",
            "user_id": "user_123",
            "title": "Updated Board Name"
        }
        
        mock_update.return_value = {
            "_id": "board_789",
            "title": "Updated Board Name"
        }

        response = client.patch('/board/update', json=payload, headers=headers)
        
        assert response.status_code == 200
        assert response.get_json()['data']['title'] == "Updated Board Name"

    # ----------------- 4. DELETE BOARD ----------------- #
    @patch('package.flask_CRUD.Board.delete')
    def test_delete_board_success(self, mock_delete, client):
        user_id = ObjectId()
        headers = generate_test_token(user_id, "glory_dev")
        payload = {
            "board_id": "board_789",
            "user_id": "user_123"
        }
        
        # Delete method returns True on success
        mock_delete.return_value = True

        response = client.delete('/board/delete', json=payload, headers=headers)
        
        assert response.status_code == 200
        assert response.get_json()['message'] == "Deleted Successfully"
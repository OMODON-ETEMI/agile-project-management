import pytest
from unittest.mock import patch, MagicMock
import jwt
import sys
import mongomock
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
    from package import app 
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

def fake_object_id():
    return str(ObjectId())

def generate_test_token(user_id, username="testuser"):
    payload = {
        'user_id': str(user_id),
        'username': username,
        'exp': datetime.now(timezone.utc) + timedelta(minutes=30)
    }
    token = jwt.encode(payload, "test_secret_key", "HS256")
    return {'Authorization': f'Bearer {token}'}

@patch('package.flask_CRUD.PermissionService.invite_user_to_organization')
@patch('package.flask_CRUD.User_Organisation')
@patch('package.flask_CRUD.Organisation')
def test_create_organisation_success(mock_org, mock_user_org, mock_perm, client):

    # Mock Organisation instance
    mock_org_instance = MagicMock()
    mock_org_instance.create_organisation.return_value = {
        "_id": fake_object_id(),
        "title": "Test Org"
    }
    mock_org.return_value = mock_org_instance

    # Mock user org creation
    mock_user_org_instance = MagicMock()
    mock_user_org_instance.create_User_Organisation.return_value = {"success": True}
    mock_user_org.return_value = mock_user_org_instance

    # Mock permission
    mock_perm.return_value = True

    payload = {
        "title": "Test Org"
    }

    headers = generate_test_token(fake_object_id(), "tester")

    response = client.post('/add/organisation', json=payload, headers=headers)

    assert response.status_code == 201
    assert response.get_json()['organisation']['title'] == "Test Org"
    
# ======================== INVITE USER =================================
@patch('package.flask_CRUD.publish_event')
@patch('package.flask_CRUD.invite_notification')
@patch('package.flask_CRUD.Organisation.search')
@patch('package.flask_CRUD.PermissionService.invite_user_to_organization')
@patch('package.flask_CRUD.User_Organisation')
@patch('package.flask_CRUD.PermissionService.get_user_permissions')
def test_invite_user_success(mock_perm_check, mock_user_org, mock_perm, mock_search, mock_notify, mock_publish, client):

    mock_perm_check.return_value = "admin"

    mock_user_org.Search_Users_in_Organisation.return_value = {
        "results": [{"isMember": False}]
    }

    mock_user_org.create_User_Organisation.return_value = {"success": True}
    mock_perm.return_value = True

    mock_search.return_value = {"data": {"title": "Org"}}

    payload = {
        "user_id": fake_object_id(),
        "org_id": fake_object_id(),
        "role": "Member"
    }

    headers = generate_test_token(fake_object_id(), "admin")

    response = client.post('/organizations/invite', json=payload, headers=headers)

    assert response.status_code == 200
    
# ========================== REMOVE USER ================================@patch('package.flask_CRUD.publish_event')
@patch('package.flask_CRUD.publish_event')
@patch('package.flask_CRUD.remove_user_notification')
@patch('package.flask_CRUD.Organisation.search')
@patch('package.flask_CRUD.PermissionService.remove_user_from_organization')
@patch('package.flask_CRUD.User_Organisation')
@patch('package.flask_CRUD.PermissionService.get_user_permissions')
def test_remove_user_success( mock_perm_check, mock_user_org, mock_perm, mock_search, mock_notify, mock_publish, client ):
    mock_perm_check.return_value = "admin"

    mock_user_org.revoke_User_Organisation.return_value = {"success": True}
    mock_perm.return_value = True

    mock_search.return_value = {"data": {"title": "Org"}}

    payload = {
        "user_id": fake_object_id(),
        "org_id": fake_object_id()
    }

    headers = generate_test_token(fake_object_id(), "admin")

    response = client.post('/organizations/remove', json=payload, headers=headers)

    assert response.status_code == 200
    
#=================================== UPDATE ROLE =============================
@patch('package.flask_CRUD.publish_event')
@patch('package.flask_CRUD.role_update_notification')
@patch('package.flask_CRUD.Organisation.search')
@patch('package.flask_CRUD.PermissionService.update_user_role')
@patch('package.flask_CRUD.PermissionService.get_user_permissions')
def test_update_role_success(mock_perm_check, mock_update, mock_search, mock_notify, mock_publish, client):

    mock_perm_check.return_value = "admin"
    mock_update.return_value = True

    payload = {
        "user_id": fake_object_id(),
        "org_id": fake_object_id(),
        "role": "Admin"
    }

    headers = generate_test_token(fake_object_id(), "admin")

    response = client.post('/organizations/role/update', json=payload, headers=headers)

    assert response.status_code == 200
    
#================================== SEARCH ORGANISATION ======================
@patch('package.flask_CRUD.PermissionService.has_organization_permission')
@patch('package.flask_CRUD.Organisation.search')
def test_search_org_by_id(mock_search, mock_perm, client):

    mock_perm.return_value = True
    mock_search.return_value = {"data": {"title": "Org"}}

    payload = {"organisation_id": fake_object_id()}
    headers = generate_test_token(fake_object_id(), "user")

    response = client.post('/organisation/search', json=payload, headers=headers)

    assert response.status_code == 200
    
#=============================== ALL ORGANISATION =========================
@patch('package.flask_CRUD.Organisation.organisation')
def test_all_organisations(mock_orgs, client):

    mock_orgs.return_value = [{"title": "Org1"}]

    headers = generate_test_token(fake_object_id(), "user")

    response = client.get('/all/organisation', headers=headers)

    assert response.status_code == 200
    
# ================================== RECENT ORGANISATION ===================
@patch('package.flask_CRUD.User_Activity.get_last_accessed_entities')
def test_recent_org(mock_recent, client):

    mock_recent.return_value = {"results": []}

    headers = generate_test_token(fake_object_id(), "user")

    response = client.post('/recent/organisation', headers=headers)

    assert response.status_code == 200 
    
#============================ USER IN ORGANISATION ==========================
@patch('package.flask_CRUD.User_Organisation')
def test_users_in_org(mock_user_org, client):

    mock_user_org.Users_in_Organisation.return_value = {"results": []}

    headers = generate_test_token(fake_object_id(), "user")

    response = client.get('/organisation/users?organisation_id=' + fake_object_id(), headers=headers)

    assert response.status_code == 200
    
#================================ UPDATE OREGANISATION ======================
@patch('package.flask_CRUD.update_organisation_notification')
@patch('package.flask_CRUD.publish_event')
@patch('package.flask_CRUD.User_Organisation')
@patch('package.flask_CRUD.Organisation')
@patch('package.flask_CRUD.PermissionService.get_user_permissions')
def test_update_org(mock_perm, mock_org, mock_user_org, mock_publish, mock_notification, client):

    mock_perm.return_value = "admin"

    # IMPORTANT: mock instance behavior
    mock_org.Update.return_value = {
        "title": "Updated Org"
    }

    mock_user_org.Users_in_Organisation.return_value = {
        "results": []
    }
    
    mock_publish.return_value = True
    mock_notification.return_value = {}

    payload = {
        "organisation_id": fake_object_id(),
        "title": "Updated Org"
    }

    headers = generate_test_token(fake_object_id(), "admin")

    response = client.patch('/organisation/update', json=payload, headers=headers)

    assert response.status_code == 200
    
#================================ DELETE ORGANISATION ====================
@patch('package.flask_CRUD.publish_event')
@patch('package.flask_CRUD.User_Organisation')
@patch('package.flask_CRUD.Organisation')
@patch('package.flask_CRUD.PermissionService.get_user_permissions')
def test_delete_org(mock_perm, mock_org, mock_user_org, mock_publish, client):

    mock_perm.return_value = "admin"
    mock_org.delete.return_value = True
    mock_user_org.Users_in_Organisation.return_value = {"results": []}

    payload = {
        "organisation_id": fake_object_id()
    }

    headers = generate_test_token(fake_object_id(), "admin")

    response = client.delete('/organisation/delete', json=payload, headers=headers)

    assert response.status_code == 200
from package import db
from bson import ObjectId
from datetime import datetime
from enum import Enum

class Roles(Enum):
    ADMIN = 'Admin'
    DEVELOPER = 'Developer'
    VIEWER = 'Viewer'
    MEMBER = 'Member'  # For organization level

# Organization-level permissions
ORGANIZATION_PERMISSIONS = {
    'Admin': [
        'manage_organization',
        'manage_workspaces',
        'invite_users_to_org',
        'manage_billing',
        'delete_organization'
    ],
    'Member': [
        'view_organization',
        'view_workspaces'
    ]
}

# Workspace-level permissions
WORKSPACE_PERMISSIONS = {
    'Admin': [
        'manage_workspace',
        'invite_users_to_workspace',
        'create_projects',
        'delete_projects', 
        'create_tasks',
        'edit_all_tasks',
        'delete_tasks',
        'assign_tasks',
        'change_task_status',
        'view_tasks',
        'view_analytics',
        'create_comments',
        'delete_comments'
    ],
    'Developer': [
        'create_tasks',
        'edit_own_tasks',
        'assign_tasks',
        'change_task_status',
        'view_tasks',
        'create_comments',
        'edit_own_comments',
        'create_projects'
    ],
    'Viewer': [
        'view_tasks',
        'create_comments',
        'edit_own_comments'
    ]
}

# def can_UOD_org(user_id, organisation_id):
#     user_org = db.User_Organisation.find_one({'user_id': ObjectId(user_id), 'organisation_id': ObjectId(organisation_id)})
#     if user_org:
#         role = user_org.get('role', '')
#         if role in ['Owner', 'Admin']:
#             return True
#     return False

# permission_service.py - Simple version

class PermissionService:
    
    def invite_user_to_organization( user_id, org_id, role="Member"):
        """Add user to organization with specified role"""
        
        result = db.user_permissions.update_one(
        {"userId": ObjectId(user_id)},
        {
            "$addToSet": {
                "organizations": {
                    "organizationId": ObjectId(org_id),
                    "role": role,
                    "workspaces": [],
                    "joinedAt": datetime.now()
                }
            },
            "$set": {"updatedAt": datetime.now()}
        }
    )
        
        print('result: ', result.matched_count)
    
        # If user doesn't exist, create them
        if result.matched_count == 0:
            db.user_permissions.insert_one({
                "userId": ObjectId(user_id),
                "organizations": [
                    {
                        "organizationId": ObjectId(org_id),
                        "role": role,
                        "workspaces": [],
                        "joinedAt": datetime.now()
                    }
                ],
                "createdAt": datetime.now(),
                "updatedAt": datetime.now()
            })
            return True
        
        if result.modified_count > 0: return True
        

        
    
    def remove_user_from_organization(user_id, org_id):
        """Remove user from organization and all its workspaces"""
        result = db.user_permissions.update_one({
            "userId": ObjectId(user_id)},
            {"$pull": {"organizations": {"organizationId": ObjectId(org_id)}}}    )
        return result
    
    def invite_user_to_workspace(user_id, org_id, workspace_id, role="Viewer"):
        """Add user to specific workspace"""
        
                # Check if user is in organization first
        user_in_org = db.User_Organisation.find_one({
            "userId": ObjectId(user_id),
            "organizationId": ObjectId(org_id)
        })
        
        if not user_in_org:
            return ("User must be in organization first")
        
        user_in_workspace = db.User_Workspace.find_one({
            "userId": ObjectId(user_id),
            "workspaceId": ObjectId(workspace_id)
        })
        
        if user_in_workspace:
            return ("User already in this workspace")
        
        # Add workspace to user's organization
        db.user_permissions.update_one(
            {
                "userId": ObjectId(user_id),
                "organizations.organizationId": ObjectId(org_id)
            },
            {
                "$push": {
                    "organizations.$.workspaces": {
                        "workspaceId": ObjectId(workspace_id),
                        "role": role,
                        "joinedAt": datetime.now()
                    }
                },
                "$set": {"updatedAt": datetime.now()}
            }
        )
        
        return True
    
    def remove_user_from_workspace(user_id, org_id, workspace_id):
        """Remove user from specific workspace"""
        result = db.user_permissions.update_one(
            {
                "userId": ObjectId(user_id),
                "organizations.organizationId": ObjectId(org_id)
            },
            {
                "$pull": {
                    "organizations.$.workspaces": {
                        "workspaceId": ObjectId(workspace_id)
                    }
                },
                "$set": {"updatedAt": datetime.now()}
            }
        )
        return result.modified_count > 0
    

    def get_user_permissions(user_id, organisation_id=None, workspace_id=None):
        """
        Get user's role at organization or workspace level.
        Supports:
        - org-only
        - workspace-only
        - org + workspace
        """
        
        # Normalize IDs
        try:
            user_id = ObjectId(user_id)
            if organisation_id:
                organisation_id = ObjectId(organisation_id)
            if workspace_id:
                workspace_id = ObjectId(workspace_id)
        except Exception:
            return None

        query = {"userId": user_id}

        if organisation_id and workspace_id:
            # Explicit org + workspace
            query["organizations"] = {
                "$elemMatch": {
                    "organizationId": organisation_id,
                    "workspaces.workspaceId": workspace_id
                }
            }

        elif organisation_id:
            query["organizations.organizationId"] = organisation_id

        elif workspace_id:
            # Workspace-only search across orgs
            query["organizations.workspaces.workspaceId"] = workspace_id

        else:
            return None

        # Query user
        user_perms = db.user_permissions.find_one(query, {"organizations": 1})
        if not user_perms or "organizations" not in user_perms:
            return None
        
        # print('User permission', user_perms)

        # Look at all orgs in case multiple matched
        for org in user_perms.get("organizations", []):
            # Match org first
            if organisation_id and org["organizationId"] == organisation_id:
                return org.get("role")

            # Match by workspace only
            if workspace_id:
                for ws in org.get("workspaces", []):
                    if ws["workspaceId"] == workspace_id:
                        return {
                            "status": "workspace_role",
                            "role": ws.get("role"),
                            "organizationId": org["organizationId"],
                        }

    
    def has_organization_permission( user_id, org_id, permission):
        """Check if user has permission in organization"""
        user_perms = PermissionService.get_user_permissions(user_id, org_id)
        
        for org in user_perms.get("organizations", []):
            if str(org["organizationId"]) == org_id:
                user_role = org["role"]
                org_permissions = ORGANIZATION_PERMISSIONS.get(user_role, [])
                return permission in org_permissions
        
        return False
    
    def has_workspace_permission(user_id, workspace_id, permission):
        """Check if user has permission in workspace"""
        user_perms = db.get_user_permissions(user_id)
        
        for org in user_perms.get("organizations", []):
            for workspace in org.get("workspaces", []):
                if str(workspace["workspaceId"]) == workspace_id:
                    user_role = workspace["role"]
                    workspace_permissions = WORKSPACE_PERMISSIONS.get(user_role, [])
                    return permission in workspace_permissions
        
        return False
    
    def update_user_role( user_id, org_id=None, workspace_id=None, new_role=None):
        """Update user's role in organization or workspace"""
        if workspace_id:
            # Update workspace role
            result = db.user_permissions.update_one(
                {
                    "userId": ObjectId(user_id),
                    "organizations.organizationId": ObjectId(org_id),
                    "organizations.workspaces.workspaceId": ObjectId(workspace_id)
                },
                {
                    "$set": {
                        "organizations.$[org].workspaces.$[ws].role": new_role,
                        "updatedAt": datetime.now()
                    }
                },
                array_filters=[
                    {"org.organizationId": ObjectId(org_id)},
                    {"ws.workspaceId": ObjectId(workspace_id)}
                ]
            )
        else:
            # Update organization role
            result = db.user_permissions.update_one(
                {
                    "userId": ObjectId(user_id),
                    "organizations.organizationId": ObjectId(org_id)
                },
                {
                    "$set": {
                        "organizations.$.role": new_role,
                        "updatedAt": datetime.now()
                    }
                }
            )
        
        return result.modified_count > 0
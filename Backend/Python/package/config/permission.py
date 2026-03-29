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
    'admin': [
        'manage_organization',
        'manage_workspaces',
        'invite_users_to_org',
        'manage_billing',
        'delete_organization',
        'view_organization',
        'view_workspaces'
    ],
    'member': [
        'view_organization',
        'view_workspaces'
    ]
}

# Workspace-level permissions
WORKSPACE_PERMISSIONS = {
    'admin': [
        'manage_workspace',
        'invite_users_to_workspace',
        'create_projects',
        'delete_projects', 
        'create_tasks',
        'edit_tasks',
        'delete_tasks',
        'assign_tasks',
        'change_task_status',
        'view_workspace',
        'view_tasks',
        'view_analytics',
        'create_comments',
        'delete_comments'
    ],
    'developer': [
        'create_tasks',
        'edit_tasks',
        'assign_tasks',
        'delete_tasks',
        'view_workspace',
        'change_task_status',
        'view_tasks',
        'view_analytics',
        'create_comments',
        'edit_own_comments',
        'create_projects'
    ],
    'viewer': [
        'view_tasks',
        'view_workspace',
        'create_comments',
        'edit_own_comments'
    ]
}

class PermissionService:
    
    def invite_user_to_organization( user_id, org_id, role="member"):
        """
        Add user to organization with specified role, or update their role if they already exist.
        Returns True on success, False on failure.
        """
        user_obj_id = ObjectId(user_id)
        org_obj_id = ObjectId(org_id)
        
        # 1. Check if the user is already a member of the organization and what their current role is
        existing_permission_doc = db.user_permissions.find_one(
            {"userId": user_obj_id, "organizations.organizationId": org_obj_id},
            {"organizations.$": 1} # Project only the matching organization element
        )

        if existing_permission_doc:
            # User is already in the organization
            current_org_entry = existing_permission_doc['organizations'][0]
            current_role = current_org_entry['role']

            if current_role == role:
                # Role is already the same, no update needed
                return True
            else:
                # Role is different, update the role
                update_result = db.user_permissions.update_one(
                    {"userId": user_obj_id, "organizations.organizationId": org_obj_id},
                    {"$set": {"organizations.$.role": role, "updatedAt": datetime.now()}}
                )
                return update_result.modified_count > 0
        else:
            # User is not in the organization, add them
            # First, try to add the organization to an existing user_permissions document
            add_to_set_result = db.user_permissions.update_one(
                {"userId": user_obj_id},
                {
                    "$addToSet": {
                        "organizations": {
                            "organizationId": org_obj_id,
                            "role": role,
                            "workspaces": [],
                            "joinedAt": datetime.now()
                        }
                    },
                    "$set": {"updatedAt": datetime.now()}
                }
            )
            
            if add_to_set_result.modified_count > 0:
                return True
            
            # If $addToSet didn't modify anything, it means the user_permissions document
            # for this userId doesn't exist yet. So, insert a new one.
            insert_result = db.user_permissions.insert_one({
                "userId": user_obj_id,
                "organizations": [
                    {
                        "organizationId": org_obj_id,
                        "role": role,
                        "workspaces": [],
                        "joinedAt": datetime.now()
                    }
                ],
                "createdAt": datetime.now(),
                "updatedAt": datetime.now()
            })
            return insert_result.acknowledged
        

        
    
    def remove_user_from_organization(user_id, org_id):
        """Remove user from organization and all its workspaces"""
        result = db.user_permissions.update_one({
            "userId": ObjectId(user_id)},
            {"$pull": {"organizations": {"organizationId": ObjectId(org_id)}}}    )
        return result
    
    def invite_user_to_workspace(user_id, org_id, workspace_id, role="viewer"):
        """Add user to specific workspace"""
        user_obj_id = ObjectId(user_id)
        org_obj_id = ObjectId(org_id)
        ws_obj_id = ObjectId(workspace_id)
        
        user_in_org = db.User_Organisation.find_one({
            "user_id": user_obj_id,
            "organisation_id": org_obj_id
        })
        
        if not user_in_org:
            return False ,"User must be in organization"
        
        user_in_workspace = db.User_Workspace.find_one({
            "user_id": user_obj_id,
            "workspace_id": ws_obj_id
        })
        
        if not user_in_workspace:
            return False ,"User must be in this workspace"
        
        
        existing_permission_doc = db.user_permissions.find_one(
            {
                "userId": user_obj_id, 
                "organizations.organizationId": org_obj_id
            },
            {"organizations.$": 1}
        )

        if existing_permission_doc:
            org_entry = existing_permission_doc['organizations'][0]
            workspaces = org_entry.get('workspaces', [])
            
            # Look for this specific workspace in the array
            existing_ws = next((ws for ws in workspaces if ws['workspaceId'] == ws_obj_id), None)

            if existing_ws:
                if existing_ws['role'] == role:
                    # Role is identical, do nothing and return success
                    return True, "successfully added"
                else:
                    # Role is different, update the nested role using array_filters
                    result = db.user_permissions.update_one(
                        {
                            "userId": user_obj_id,
                            "organizations.organizationId": org_obj_id,
                            "organizations.workspaces.workspaceId": ws_obj_id
                        },
                        {
                            "$set": {
                                "organizations.$[org].workspaces.$[ws].role": role,
                                "updatedAt": datetime.now()
                            }
                        },
                        array_filters=[
                            {"org.organizationId": org_obj_id},
                            {"ws.workspaceId": ws_obj_id}
                        ]
                    )
                    return result.modified_count > 0, 'successfully added'
            else:
                # Workspace not in the list, push a new one
                db.user_permissions.update_one(
                    {
                        "userId": user_obj_id,
                        "organizations.organizationId": org_obj_id
                    },
                    {
                        "$push": {
                            "organizations.$.workspaces": {
                                "workspaceId": ws_obj_id,
                                "role": role,
                                "joinedAt": datetime.now()
                            }
                        },
                        "$set": {"updatedAt": datetime.now()}
                    }
                )
                return True, 'successfully added'
        
        return False, "User permissions document not found"
    
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
    

    def get_user_permissions(user_id, organisation_id=None, workspace_id=None, organisation_slug=None, workspace_slug=None):
        """
        Get user's role at organization or workspace level.
        Supports:
        - org-only (by ID or slug)
        - workspace-only (by ID or slug)
        - org + workspace (by IDs or slugs)
        """
        
        # Resolve slugs to IDs
        try:
            if organisation_slug and not organisation_id:
                org_doc = db.organisation.find_one({"slug": organisation_slug}, {"_id": 1})
                if org_doc:
                    organisation_id = org_doc["_id"]
                else:
                    return None
            
            if workspace_slug and not workspace_id:
                ws_doc = db.Workspace.find_one({"slug": workspace_slug}, {"_id": 1})
                if ws_doc:
                    workspace_id = ws_doc["_id"]
                else:
                    return None
        except Exception:
            return None
        
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

        # Look at all orgs in case multiple matched
        for org in user_perms.get("organizations", []):
            # Match org first
            if organisation_id and org["organizationId"] == ObjectId(organisation_id):
                return org.get("role")

            # Match by workspace only
            if workspace_id:
                for ws in org.get("workspaces", []):
                    if ws["workspaceId"] == ObjectId(workspace_id):
                        return {
                            "status": "workspace_role",
                            "role": ws.get("role"),
                            "organizationId": org["organizationId"],
                        }

    
    def has_organization_permission(user_id, org_id=None, permission=None, org_slug=None):
        """Check if user has permission in organization"""
        # print('Checking org permission for user_id:', user_id, 'org_id:', org_id, 'org_slug:', org_slug, 'permission:', permission)
        user_role = PermissionService.get_user_permissions(user_id, organisation_id=org_id, organisation_slug=org_slug)
        
        if not user_role:
            return False
        
        org_permissions = ORGANIZATION_PERMISSIONS.get(user_role, [])
        return permission in org_permissions
    
    def has_workspace_permission(user_id, workspace_id=None, permission=None, workspace_slug=None):
        """Check if user has permission in workspace"""
        user_perms = PermissionService.get_user_permissions(user_id, workspace_id=workspace_id, workspace_slug=workspace_slug)
        if not user_perms:
            return False
        
        # Handle dict response from get_user_permissions when workspace_id is matched
        if isinstance(user_perms, dict) and "role" in user_perms:
            user_role = user_perms.get("role")
        else:
            user_role = user_perms
        
        workspace_permissions = WORKSPACE_PERMISSIONS.get(user_role, [])
        return permission in workspace_permissions
    
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
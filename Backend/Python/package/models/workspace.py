from flask import Response,jsonify
import json
from typing import Optional, Dict
from bson import json_util, ObjectId
from package.config.slug import slugify
from package.config.utility import serialize_document
from package import db
from dotenv import load_dotenv
import os
from datetime import datetime , timezone

load_dotenv()

SECRET_KEY = os.getenv('JWT_SECRET_KEY')
ALGORITHM = os.getenv('JWT_ALGORITHM')

class Workspace: 
    def __init__(self, title, createdAt, image, description, organisation_id, created_By, slug):
        self.title = title
        self.image = image or {}
        self.slug = slug
        self.organisation_id = ObjectId(organisation_id)
        self.description = description
        self.created_By = ObjectId(created_By)
        self.createdAt = createdAt

    @staticmethod    
    def generate_Unique_slug(name):
        """
        Generate a unique slug by appending a number if the slug already exists.
        """
        base_slug = slugify(name)
        slug = base_slug
        counter = 1
        
        while db.Workspace.find_one({'slug': slug}):
            slug = f"{base_slug}-{counter}"
            counter += 1
            
        return slug
    def create_Workspace(self):
        if not self.slug:
            self.slug = Workspace.generate_Unique_slug(self.title)
        result = db.Workspace.insert_one({
            'title' : self.title,
            'createdAt' : self.createdAt,
            'image' : self.image,
            'slug' : self.slug,
            'created_By': self.created_By,
            'description': self.description,
            'organisation_id': self.organisation_id,
            'history': []
        })

        new_Workspace = db.Workspace.find_one({'_id' : result.inserted_id})
        if new_Workspace:
            return serialize_document(new_Workspace)
        else :
            return None
        
    @staticmethod    
    def search(title=None, organisation_id=None, workspace_id=None, slug=None, user_id=None):
        authorized_workspace_ids = []
        if user_id:
            user_workspaces = db.User_Workspace.find({'user_id': ObjectId(user_id)})
            authorized_workspace_ids = [w['workspace_id'] for w in user_workspaces]

        # CASE A: SEARCH BY WORKSPACE_ID (Specific Resource)
        if workspace_id:
            if not ObjectId.is_valid(workspace_id): return None
            ws_oid = ObjectId(workspace_id)
            workspace = db.Workspace.find_one({'_id': ws_oid})
            if workspace:
                return serialize_document(workspace)
            return None

        # CASE B: SEARCH BY SLUG (Specific Resource)
        elif slug:
            workspace = db.Workspace.find_one({"slug": slug})
            if workspace and (not user_id or workspace['_id'] in authorized_workspace_ids):
                return serialize_document(workspace)
            return None

        # CASE C: SEARCH BY TITLE (Discovery)
        elif title:
            query = {
                'title': {'$regex': f'.*{title}.*', '$options': 'i'},
            }
            if user_id:
                query['_id'] = {'$in': authorized_workspace_ids}
            workspaces = db.Workspace.find(query)
            return serialize_document(list(workspaces))

        # CASE D: SEARCH BY ORGANISATION (Discovery)
        elif organisation_id:
            match_query = { "organisation_id": ObjectId(organisation_id) }
            if user_id:
                match_query["_id"] = {"$in": authorized_workspace_ids}
            pipeline = [
                {"$match": match_query},
                {"$lookup": {
                    "from": "User_Workspace",
                    "localField": "_id",
                    "foreignField": "workspace_id",
                    "as": "members"
                }},
                {"$addFields": {"members_count": {"$size": "$members"}}},
                {"$project": {"members": 0}}
            ]
            workspaces = db.Workspace.aggregate(pipeline)
            return serialize_document(list(workspaces))

        return [] # Default fallback
    
    @staticmethod
    def Update(Workspace_id: str, user_id: str,title: Optional[str] = None, image : Optional[Dict] = None):
        # Do NOTE: That there is more we can do here such as updating the user_id we can even remove the add access user and revoke access and add it to this function
        try:
            update_fields = {}
            if not any([title, image]):
                data = db.Workspace.find_one({'_id' : ObjectId(Workspace_id)})
                return serialize_document(data)
            if title is not None:
                if isinstance(title, str) and title.strip():
                    update_fields['title'] = title.strip()
                else: 
                    return None
            if image is not None:
                if isinstance(image, dict):
                    update_fields['image'] = image
                else:
                    return None
            
            db.Workspace.update_one({'_id': ObjectId(Workspace_id)}, {
                "$set" : update_fields, 
                '$push': { 'history': {
                                'updated_at': datetime.now(timezone.utc),
                                'updated_by': ObjectId(user_id),
                                'changes': update_fields
                            }
                        }})
            data = db.Workspace.find_one({'_id' : ObjectId(Workspace_id)})
            return serialize_document(data)
        except Exception as e:
            return None
    @staticmethod
    def delete(Workspace_id,user_id):
        result = db.Workspace.delete_one({'_id': ObjectId(Workspace_id), 'created_By' : ObjectId(user_id)})
        if result.deleted_count == 1 :
            boardcollection = db.get_collection('Board')
            issuecollection = db.get_collection('Issues')
            boardcollection.delete_many({'workspace': ObjectId(Workspace_id)})
            issuecollection.delete_many({'workspace_id': ObjectId(Workspace_id)})
            return True
        return False
        
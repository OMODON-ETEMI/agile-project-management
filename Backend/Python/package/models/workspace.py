from flask import Response,jsonify
import json
from typing import Optional, Dict
from bson import json_util, ObjectId
from package.config.slug import slugify
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
            Workspace_data = json.loads(json_util.dumps(new_Workspace))
            response_data = {
                'message': f'Your {new_Workspace['title']} workspace has been created',
                'Workspace': Workspace_data,
                }
            response = jsonify(response_data)
            response.status_code = 201
            return response
        else :
            return Response(json.dumps({'message' : 'failed to create account'}), mimetype='application,json'), 500
        

    @staticmethod    
    def search(title = None, organisation_id = None, workspace_id = None, slug = None):
        if workspace_id:
            Workspace = db.Workspace.find_one({'_id' : ObjectId(workspace_id)})
            if Workspace:
                Workspace_data = json.loads(json_util.dumps(Workspace))
                return jsonify(Workspace_data), 200
            else:
                return jsonify({'error': 'Workspace not found'}), 404
        elif title:
            Workspaces = db.Workspace.find({'title' : {'$regex' : f'.*{title}*.', '$options' : 'i'}})
            if Workspaces is None:
                return jsonify({'error': 'No workspaces found with that title'}), 404
            Workspace_list = [json.loads(json_util.dumps(Workspace)) for Workspace in Workspaces]
            return jsonify(Workspace_list), 200
        elif organisation_id: 
            Workspaces = db.Workspace.aggregate([
                        {
                            "$match": { "organisation_id": ObjectId(organisation_id) }  # Filter workspaces by organisation_id
                        },
                        {
                            "$lookup": {
                                "from": "User_Workspace",  # Join with user_workspace collection
                                "localField": "_id",
                                "foreignField": "workspace_id",
                                "as": "members"
                            }
                        },
                        {
                            "$addFields": {
                                "members_count": { "$size": "$members" }  # Count the number of members
                            }
                        },
                        {
                            "$project": {
                                "members": 0  # Optional: Exclude the 'members' array
                            }
                        }
                    ])
            if not Workspaces:
                return jsonify({'error': 'No workspaces found for this organisation'}), 404
            Workspace_list = [{**json.loads(json_util.dumps(ws)), 
                               "_id": str(ws["_id"]),
                               "created_By": str(ws["created_By"]),
                               "organisation_id": str(ws["organisation_id"])} for ws in Workspaces]
            return jsonify(Workspace_list), 200
        elif slug:
            workspace = db.Workspace.find_one({ "slug": slug })
            if workspace:
                Workspace_data = {**json.loads(json_util.dumps(workspace)), 
                                  "_id": str(workspace["_id"]),
                                  "created_By": str(workspace["created_By"]),
                                  "organisation_id": str(workspace["organisation_id"])}
                return jsonify(Workspace_data), 200
            else:
                return jsonify({'error': 'Workspace not found'}), 404
    
    @staticmethod
    def Update(Workspace_id: str, user_id: str,title: Optional[str] = None, image : Optional[Dict] = None):
        # Do NOTE: That there is more we can do here such as updating the user_id we can even remove the add access user and revoke access and add it to this function
        try:
            update_fields = {}
            if title is not None:
                if isinstance(title, str) and title.strip():
                    update_fields['title'] = title.strip()
                else: 
                    return jsonify({'error' : 'Invalid title'}), 400
            if image is not None:
                if isinstance(image, dict):
                    update_fields['image'] = image
                else:
                    return jsonify({'error': 'invalid image Data'}), 400
            
            result = db.Workspace.update_one({'_id': ObjectId(Workspace_id)}, {
                "$set" : update_fields, 
                '$push': { 'history': {
                                'updated_at': datetime.now(timezone.utc),
                                'updated_by': ObjectId(user_id),
                                'changes': update_fields
                            }
                        }})
            if result.modified_count > 0:
                data = db.Workspace.find_one({'_id' : ObjectId(Workspace_id)})
                Workspace = json.loads(json_util.dumps(data))
                return jsonify(
                    {"message" : "Workspace updated succesfully",
                     'data' : Workspace, }), 200
            else: 
                return jsonify({"message" : " No changes were made to the Workspace"}), 200
        except Exception as e:
            return jsonify({'error' : str(e)}),500
    @staticmethod
    def delete(Workspace_id,user_id):
        result = db.Workspace.delete_one({'_id': ObjectId(Workspace_id), 'created_By' : ObjectId(user_id)})
        if result.deleted_count == 1 :
            message = {'message' : f'Deleted Successfully' }
            projectcollection = db.get_collection('proojects')
            taskcollection = db.get_collection('tasks')
            projectcollection.delete_many({'assigned_Workspace': ObjectId(Workspace_id)})
            taskcollection.delete_many({'assigned_Workspace': ObjectId(Workspace_id)})
            return message, 200
        else : 
            message = {'message' : f'Failed to Delete'}
            return message, 400
        
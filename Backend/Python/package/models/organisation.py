from flask import Response,jsonify
import json
from typing import Optional, Dict
from bson import json_util, ObjectId
from package import db
from dotenv import load_dotenv
from package.config.slug import slugify
from package.models.user_relationships import User_Activity
import os
from datetime import datetime , timezone
from package.config.utility import serialize_document
from package.config.permission import PermissionService

load_dotenv()

SECRET_KEY = os.getenv('JWT_SECRET_KEY')
ALGORITHM = os.getenv('JWT_ALGORITHM')

class Organisation: 
    def __init__(self, title, createdAt, updatedAt, image, description, created_By, slug, color):
        self.title = title
        self.image = image or {}
        self.slug = slug
        self.color = color
        self.description = description
        self.created_By = ObjectId(created_By)
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        
        
    @staticmethod    
    def generate_Unique_slug(name):
        """
        Generate a unique slug by appending a number if the slug already exists.
        """
        base_slug = slugify(name)
        slug = base_slug
        counter = 1
        
        while db.organisation.find_one({'slug': slug}):
            slug = f"{base_slug}-{counter}"
            counter += 1
            
        return slug

    def create_organisation(self):
        if not self.slug:
            self.slug = Organisation.generate_Unique_slug(self.title)
        result = db.organisation.insert_one({
            'title' : self.title,
            'createdAt' : self.createdAt,
            'created_By' : self.created_By,
            'image' : self.image,
            'color': self.color,
            'slug' : self.slug,
            'updatedAt' : self.updatedAt,
            'description': self.description,
            'history': []
        })

        new_organisation = db.organisation.find_one({'_id' : result.inserted_id})
        if new_organisation:
            organisation_data = serialize_document(new_organisation)
            response_data = {
                'message': f'Your {new_organisation['title']} Organisation has been created',
                'organisation': organisation_data,
                }
            response = jsonify(response_data)
            response.status_code = 200
            return response
        else :
            return Response(json.dumps({'message' : 'failed to create account'}), mimetype='application,json'), 500
        

    @staticmethod    
    def search(title: Optional[str] = None, organisation_id = None, slug: Optional[str] = None):
        if title:
            organisations = db.organisation.find({'title': {'$regex': f'.*{title}.*', '$options': 'i'}})
            organisation_list = [json.loads(json_util.dumps(organisation)) for organisation in organisations]
            return organisation_list
        elif organisation_id or slug:
            conditions = []
            if organisation_id:
                conditions.append({"_id": ObjectId(organisation_id)})
            if slug:
                conditions.append({"slug": slug})
            organisations = db.organisation.aggregate([
                {  # Match the specific organisation
                    "$match": {
                        "$or": conditions
                    }
                },
                {  # Lookup administrator details from the User collection
                    "$lookup": {
                        "from": "Users",
                        "localField": "created_By",
                        "foreignField": "_id",
                        "as": "administrator"
                    }
                },
                {
                    '$addFields':{
                       "admin": {
                            "firstname": {"$arrayElemAt": ["$administrator.firstname", 0]},
                            "lastname": {"$arrayElemAt": ["$administrator.lastname", 0]},
                            "email": {"$arrayElemAt": ["$administrator.email", 0]},
                            "username": {"$arrayElemAt": ["$administrator.username", 0]}
                        }
                    }                
                },
                {
                    "$project": {
                        "administrator": 0
                    }
                },
            ]) 

            organisation = next(organisations, None)  # Get the first document or None if empty
            if organisation:
                return {
                    "success": True,
                    "data" : {**json.loads(json_util.dumps(organisation)), "_id": str(organisation["_id"])}
                }
            else:
                return {
                    "success": False,
                    "message": "Organisation not found"
                }, 404

    @staticmethod
    def get_User_role(organisation_id):
        user_org = db.User_Organisation.find_one({'organisation_id': ObjectId(organisation_id)})
        if user_org:
            return user_org.get('role', '')
        return ''
    
    @staticmethod
    def get_last_Accessed(document, org_slug):
        if document:
            for doc in document:
                if doc.get('title') == org_slug:
                    return doc
        return 
    
    @staticmethod
    def organisation(user_id):
        user_org = db.User_Organisation.find({'user_id': ObjectId(user_id)})
        org_ids = [relation['organisation_id'] for relation in user_org]
        organisations = db.organisation.find({'_id': {'$in': org_ids}})
        last_accessed_document = User_Activity.get_last_accessed_entities(user_id=user_id, entity_type='organisation', limit= db.organisation.count_documents({}))
        organisations_list = []
        for organisation in organisations:
            organisation_id = organisation.get('_id')
            user_role = PermissionService.get_user_permissions(user_id, organisation_id) 
            workspace_count = db.Workspace.count_documents({'organisation_id': organisation_id})
            organisation['_id'] = str(organisation['_id'])
            recent_document = Organisation.get_last_Accessed(document=last_accessed_document, org_slug=organisation.get('slug'))
            organisation_data = json.loads(json_util.dumps(organisation))
            organisation_data['workspace_count'] = workspace_count
            organisation_data['User_role'] = user_role
            organisation_data['lastAccessed'] = recent_document
            organisations_list.append(organisation_data)
        response = jsonify(organisations_list) 
        response.status_code=200
        return  response
    
    @staticmethod
    def Update(organisation_id: str, user_id: str, title: Optional[str] = None, image : Optional[Dict] = None, description: Optional[str] = None, slug: Optional[str] = None, color: Optional[str] = None):
        # Do NOTE: That there is more we can do here such as updating the user_id we can even remove the add access user and revoke access and add it to this function
        try:
            update_fields = {}
            if slug is not None:
                if isinstance(slug, str) and slug.strip():
                    if db.organisation.find_one({'slug': slug.strip(), '_id': {'$ne': ObjectId(organisation_id)}}):
                        return jsonify({'error': 'Slug already in use'}), 400
                    update_fields['slug'] = slug.strip()
                else:
                    return jsonify({'error': 'Invalid slug'}), 400
            if color is not None:
                if isinstance(color, str) and color.strip():
                    update_fields['color'] = color.strip()
                else:
                    return jsonify({'error': 'Invalid color'}), 400
            if description is not None:
                if isinstance(description, str):
                    update_fields['description'] = description
                else:
                    return jsonify({'error': 'Invalid description'}), 400
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
            
            result = db.organisation.update_one({'_id': ObjectId(organisation_id)}, {
                "$set" : update_fields,
                '$push': { 'history': {
                                'updated_at': datetime.now(timezone.utc),
                                'updated_by': ObjectId(user_id),
                                'changes': update_fields
                            }
                        }})
            if result.modified_count > 0:
                data = db.organisation.find_one({'_id' : ObjectId(organisation_id)})
                organisation = json.loads(json_util.dumps(data))
                return jsonify(
                    {"message" : "organisation updated succesfully",
                     'data' : organisation, }), 200
            else: 
                return jsonify({"message" : " No changes were made to the organisation"}), 200
        except Exception as e:
            return jsonify({'error' : str(e)}),500
    @staticmethod
    def delete(organisation_id,user_id):
        print('trying to delete organisation')
        workspaces = db.Workspace.find({'organisation_id': ObjectId(organisation_id)}, {'_id': 1})
        workspace_ids = [workspace['_id'] for workspace in workspaces]
        
        if workspace_ids:
            issues_result = db.Issues.delete_many({'workspace_id': {'$in': workspace_ids}})
            comments_result = db.Comments.delete_many({'workspace_id': {'$in': workspace_ids}})
            if issues_result.acknowledged is False:
                return {'message' : 'Failed to Delete'}, 400
            
            board_result = db.Boards.delete_many({'workspace_id': {'$in': workspace_ids}})
            if board_result.acknowledged is False:
                return {'message' : 'Failed to Delete'}, 400
            
            workspaces_result = db.Workspace.delete_many({'organisation_id': ObjectId(organisation_id)})
            if workspaces_result.acknowledged is False:
                return {'message' : 'Failed to Delete'}, 400
  
        organisation_result = db.organisation.delete_one({'_id': ObjectId(organisation_id), 'created_By' : ObjectId(user_id)})
        if organisation_result.deleted_count == 1 :   
            PermissionService.remove_user_from_organization(user_id, organisation_id)
            message = {'message' : f'Deleted Successfully' }
            return message, 200
        else : 
            print("Failed to delete organisation.")
            message = {'message' : f'Failed to Delete'}
            return message, 400
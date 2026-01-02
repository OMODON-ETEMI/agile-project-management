from flask import Response,jsonify
import json
from bson import json_util, ObjectId
from package import db
from package.config.utility import serialize_document
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv('JWT_SECRET_KEY')
ALGORITHM = os.getenv('JWT_ALGORITHM')

def log_recent_view(collection, user_id, ref_field, ref_id, max_entries=5):
    now = datetime.utcnow()
    filter_ = {'user_id': ObjectId(user_id), ref_field: ObjectId(ref_id)}
    
    db[collection].update_one(filter_, {'$set': {'viewed_at': now}}, upsert=True)
    
    count = db[collection].count_documents({'user_id': ObjectId(user_id)})

    if count > max_entries:
        excess = list(db[collection].find({'user_id': ObjectId(user_id)})
                      .sort('viewed_at', 1)
                      .skip(max_entries))
        for view in excess:
            db[collection].delete_one({'_id': view['_id']})

def log_org_view(user_id, organisation_id, viewed_at):
    db.Org_View.update_one(
        {'user_id': ObjectId(user_id), 'organisation_id': ObjectId(organisation_id)},
        {'$set': {'viewed_at': viewed_at}},
        upsert=True 
    )
    log_recent_view('User_Organisation', user_id, 'organisation_id', organisation_id)

def log_workspace_view(user_id, workspace_id, viewed_at):
    db.Worpsace_View.update_one(
        {'user_id': ObjectId(user_id), 'organisation_id': ObjectId(workspace_id)},
        {'$set': {'viewed_at': viewed_at}},
        upsert=True
    )
    log_recent_view('User_Organisation', user_id, 'organisation_id', workspace_id)


class User_Workspace: 
    def __init__(self, user_id, workspace_id, organisation_id, role, joined_at):
        self.user_id = ObjectId(user_id)
        self.workspace_id = ObjectId(workspace_id)
        self.organisation_id = ObjectId(organisation_id)
        self.role = role
        self.joined_at = joined_at


    def create_User_Workspace(self):
        workspace = db.Workspace.find_one({"_id": self.workspace_id})
        if not workspace:
            return Response(json.dumps({'message' : f"Workspace with ID {self.workspace_id} not found."}), mimetype='application/json',status=404)
        organisation_id = workspace['organisation_id']
        if not organisation_id:
            return Response(json.dumps({'message' : "Missing 'organisation_id' in workspace data."}), mimetype='application/json',status=404)
        result = db.User_Workspace.insert_one({
            'user_id' : self.user_id,
            'workspace_id' : self.workspace_id,
            'organisation_id': self.organisation_id,
            'role' : self.role,
            'joined_at': self.joined_at
        })

        if result.acknowledged:
            return Response(json.dumps({'message': 'User invited to workspace successfully'}), mimetype='application/json'), 201
        else :
            return Response(json.dumps({'message' : 'failed to invite User'}), mimetype='application,json'), 500


    def revoke_User_Workspace(self):
        result = db.User_Workspace.find_one_and_delete({'workspace_id': self.workspace_id, 'user_id': self.user_id})
        if result:
            return Response(json.dumps({'message' : 'User has been removed from this Workspace'}), mimetype='application/json'), 200
        else :
            return Response(json.dumps({'message' : 'failed to remove user from this Workspace'}), mimetype='application/json'), 500
        


    def Users_in_Workspace(workspace_id):
        user_ids = [user['user_id'] for user in db.User_Workspace.find({'workspace_id': ObjectId(workspace_id)}, {'user_id': 1, '_id': 0  })]
        users = db.Users.find({'_id': {'$in' : user_ids}})
        user_data = [{**json.loads(json_util.dumps(users)), "_id" : str(users['_id'])} for users in users]
        return Response(json.dumps(user_data), mimetype='application,json'), 200
    
    
class User_Organisation: 
    def __init__(self, user_id, organisation_id, joined_at):
        self.user_id = ObjectId(user_id)
        self.organisation_id = ObjectId(organisation_id)
        self.joined_at = joined_at


    def create_User_Organisation(user_id, organisation_id, joined_at, session=None):
        organisation = db.organisation.find_one({"_id": ObjectId(organisation_id)})
        if not organisation:
            return {
                "success": False,
                "error": f"Organisation not found."
            }

        result = db.User_Organisation.insert_one(
            {
                'user_id': ObjectId(user_id),
                'organisation_id': ObjectId(organisation_id),
                'joined_at': joined_at
            },
            session=session
        )

        if result.inserted_id:
            return {"success": True}
        
        return {
            "success": False,
            "error": "Failed to add user to this Organisation"
        }



    def revoke_User_Organisation(organisation_id, user_id):
        result = db.User_Organisation.find_one_and_delete({'organisation_id': ObjectId(organisation_id), 'user_id':ObjectId(user_id)})
        if result:
            return {"success": True}
        else :
            return {"success": False, 
                    "error": "Failed to remove user from this Organisation"}
        


    def Users_in_Organisation(Organisation_id):
        users = db.User_Organisation.aggregate([
            {
                '$match' : {'organisation_id':ObjectId( Organisation_id)}},
            {
                "$lookup": {
                    'from': 'Users',
                    'localField': 'user_id',
                    'foreignField': '_id',
                    'as': 'user_details'
                }}, 
            { 
                "$lookup": {
                    'from': 'user_permissions',
                    'let': {'uId': '$user_id', 'orgId': '$organisation_id'},
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$eq': ['$$uId', '$userId']
                                }
                            }
                        },
                        {
                            '$unwind': '$organizations'
                        },
                        {
                            '$match': {
                                '$expr': {
                                    '$eq': ['$$orgId', '$organizations.organizationId']
                                }
                            }
                        },
                        {
                            '$project': {
                                'role': '$organizations.role',
                                '_id': 0
                            }
                        }
                    ],
                    'as': 'role'
                }},
            { "$addFields": {
                    "role": { "$arrayElemAt": ["$role.role", 0] }
                }},
            {
                '$project': {
                    '_id': 0,
                    'user_id': 1,
                    'role': 1,
                    'firstname': {'$arrayElemAt': [ '$user_details.firstname', 0 ]},
                    'lastname': {'$arrayElemAt': [ '$user_details.lastname', 0 ]},
                    'email': {'$arrayElemAt': [ '$user_details.email', 0 ]},
                    'username': {'$arrayElemAt': [ '$user_details.username', 0 ]},
                    'image': {'$arrayElemAt': [ '$user_details.image', 0 ]}
                }}
        ])
        if users:
            user_data = [{**json.loads(json_util.dumps(user)), "user_id" : str(user['user_id'])} for user in users]
            total = len(user_data)
            return {
                "total": total,
                "results": user_data
            }
    
    
    def Search_Users_in_Organisation(organisation_id, query=None, page=1, limit=10, user_id=None):

        match_conditions = []

        if query and query.strip():
            search_regex = {'$regex': query.strip(), '$options': 'i'}
            match_conditions.extend([
                {'username': search_regex},
                {'email': search_regex}
            ])


        if user_id:
            try:
                match_conditions.append({'_id': ObjectId(user_id)})
            except Exception:
                return {"total": 0, "results": []}
            
        # CRITICAL: If no conditions, return empty early
        if not match_conditions:
            return {"total": 0, "results": []}

       # Now safely build $or only if >1 condition, otherwise use single condition
        if len(match_conditions) > 1:
            match_stage = {'$match': {'$or': match_conditions}}
        else:
            match_stage = {'$match': match_conditions[0]}

        pipeline = [
            match_stage,
            {
                '$lookup': {
                    'from': 'User_Organisation',
                    'let': {'userId': '$_id'},
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$and': [
                                        {'$eq': ['$user_id', '$$userId']},
                                        {'$eq': ['$organisation_id', ObjectId(organisation_id)]}
                                    ]
                                }
                            }
                        }
                    ],
                    'as': 'memberships'
                }
            },
            {
                "$lookup": {
                    'from': 'user_permissions',
                    'let': {'uId': '$_id', 'orgId': ObjectId(organisation_id)},
                    'pipeline': [
                        {'$match': {'$expr': {'$eq': ['$$uId', '$userId']}}},
                        {'$unwind': '$organizations'},
                        {'$match': {'$expr': {'$eq': ['$$orgId', '$organizations.organizationId']}}},
                        {'$project': {'role': '$organizations.role', '_id': 0}}
                    ],
                    'as': 'role'
                }
            },
            {
                "$addFields": {
                    "user_id": "$_id",
                    "isMember": {"$gt": [{"$size": "$memberships"}, 0]},
                    "role": {"$arrayElemAt": ["$role.role", 0]}
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "password": 0,
                    "memberships": 0,
                    "createdAt": 0,
                    "updatedAt": 0
                }
            }
        ]

        try:
                users = list(db.Users.aggregate(pipeline))
        except Exception as e:
                print("Aggregation error:", e)
                return {"total": 0, "results": []}
            
        results = [{**u, "user_id": str(u["user_id"])} for u in users]
        return {
            "total": len(results),
            "page": page,
            "limit": limit,
            "results": results
        }

        
class User_Activity:
        def __init__(self, user_id, action, entity_type, entity_id, timestamp=None, metadata=None, workspace_id=None, organisation_id=None, actor_type=None):
            self.user_id = ObjectId(user_id)
            self.action = action
            self.entity_type = entity_type
            self.entity_id = ObjectId(entity_id) if entity_id and ObjectId.is_valid(str(entity_id)) else entity_id
            self.timestamp = timestamp or datetime.now(timezone.utc)
            self.metadata = metadata
            self.workspace_id = ObjectId(workspace_id) if workspace_id and ObjectId.is_valid(str(workspace_id)) else workspace_id
            self.organisation_id = ObjectId(organisation_id) if organisation_id and ObjectId.is_valid(str(organisation_id)) else organisation_id
        
        def Create_User_Activity_Log(self):
            query = {
                'user_id': self.user_id,
                'entity_type': self.entity_type,
                'entity_id': self.entity_id,
                'action': self.action
            }

            if self.action.lower().startswith('view'):
                db.User_Activity.update_one(
                    query,
                    {
                        '$inc': {'view_count': 1},
                        '$set': {
                            'timestamp': self.timestamp,
                            'metadata': self.metadata,
                            'workspace_id': self.workspace_id,
                            'organisation_id': self.organisation_id
                        }
                    },
                    upsert=True
                )
            elif 'delete' in self.action.lower() or 'create' in self.action.lower():
                db.User_Activity.insert_one({
                    **query,
                    'timestamp': self.timestamp,
                    'metadata': self.metadata,
                    'workspace_id': self.workspace_id,
                    'organisation_id': self.organisation_id
                })
            else:
                db.User_Activity.update_one(
                    query,
                    {
                        '$set': {
                            'timestamp': self.timestamp,
                            'metadata': self.metadata,
                            'workspace_id': self.workspace_id,
                            'organisation_id': self.organisation_id
                        }
                    },
                    upsert=True
                )

            # Keep last 20 logs for this exact (user + entity + action)
            count = db.User_Activity.count_documents(query)
            if count > 20:
                oldest = db.User_Activity.find(query).sort("timestamp", 1).skip(20)
                for doc in oldest:
                    db.User_Activity.delete_one({'_id': doc['_id']})


        def get_logs_by_user(self, user_id):
            """Filters logs by user ID."""
            return list(self.collection.find({"user_id": user_id}))

        def get_logs_by_action(self, action):
            """Filters logs by action type."""
            return list(self.collection.find({"action": action}))

        def get_logs_by_entity(self, entity_type, entity_id):
            """Filters logs by entity type and ID."""
            return list(self.collection.find({"entity_type": entity_type, "entity_id": entity_id}))

        def get_logs_by_workspace(self, workspace_id):
            """Filters logs by workspace ID."""
            return list(self.collection.find({"workspace_id": workspace_id}))

        def get_logs_by_organisation(self, organisation_id):
            """Filters logs by organisation ID."""
            return list(self.collection.find({"organisation_id": organisation_id}))

        def get_recent_logs(self, user_id, limit=10):
            """Fetches the most recent logs for a user."""
            return list(self.collection.find({"user_id": user_id}).sort("timestamp", -1).limit(limit))

        def get_frequently_accessed_entities(self, user_id, entity_type, limit=5):
            """Fetches the most frequently accessed entities by the user."""
            pipeline = [
                {"$match": {"user_id": user_id, "entity_type": entity_type}},
                {"$group": {"_id": "$entity_id", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
                {"$limit": limit}
            ]
            return list(self.collection.aggregate(pipeline))

        def get_last_accessed_entities(user_id, entity_type, limit):
            """Fetches the last accessed entities by the user."""
            pipeline = [
                {"$match": {"user_id": ObjectId(user_id), "entity_type": entity_type}},
                {"$sort": {"timestamp": -1}},
                {"$group": {  
                    "_id": "$entity_id",
                    "timestamp": {"$first" : "$timestamp"}
                }},
                {"$project": {
                    "title": "$_id",
                    "timestamp": "$timestamp",
                    "_id": 0
                }},
                {"$limit": limit},
            ]
            data = list(db.User_Activity.aggregate(pipeline))
            return serialize_document(data)

        def clear_old_logs(self, days = 7):
            """Deletes logs older than the specified number of days."""
            cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
            self.collection.delete_many({"timestamp": {"$lt": cutoff_date}})

        def clear_logs_by_limit(self, limit):
            """Deletes the oldest logs to keep the collection within a specified size."""
            total_logs = self.collection.count_documents({})
            if total_logs > limit:
                excess_logs = total_logs - limit
                oldest_logs = self.collection.find({}).sort("timestamp", 1).limit(excess_logs)
                oldest_ids = [log["_id"] for log in oldest_logs]
                self.collection.delete_many({"_id": {"$in": oldest_ids}})
        


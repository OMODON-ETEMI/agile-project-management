from flask import Response,jsonify
import json
from datetime import datetime , timezone
from bson import json_util, ObjectId
from package import db
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv('JWT_SECRET_KEY')
ALGORITHM = os.getenv('JWT_ALGORITHM')

class Board: 
    def __init__(self, title, type, user_id, createdAt, workspace_id, image = None, startDate = None, endDate = None):
        self.title = title
        self.type = type
        self.user_id = user_id
        self.completed = 'uncompleted'
        self.image = image or {} 
        self.createdAt = createdAt
        self.endDate = endDate
        self.startDate = startDate
        self.workspace_id = ObjectId(workspace_id)

    def create_board(self):
        if self.type == 'sprint':
            if not self.startDate or not self.endDate:
                return Response(json.dumps({'message': 'Start date and end date are required for sprint boards'}), mimetype='application/json'), 400
            if self.startDate >= self.endDate:
                return Response(json.dumps({'message': 'Start date must be before end date'}), mimetype='application/json'), 400
        result = db.Board.insert_one({
            'title' : self.title,
            'type' : self.type,
            'user_id': self.user_id,
            'createdAt' : self.createdAt,
            'completed': self.completed,
            'end_date': self.endDate,
            'start_date': self.startDate,
            'image' : self.image,
            'workspace': self.workspace_id,
            'history': []
        })

        new_board = db.Board.find_one({'_id' : result.inserted_id})
        if new_board:
            board_data = json.loads(json_util.dumps(new_board))
            response_data = {
                'message': f'Your {new_board['title']} Board has been created',
                'board': board_data,
                }
            response = jsonify(response_data)
            response.status_code = 200
            return response
        else :
            return Response(json.dumps({'message' : 'failed to create account'}), mimetype='application,json'), 500
        
    @staticmethod    
    def grant_access_to_board(board_id, user_id):
        result = db.Board.update_one(
            {"_id": board_id},
            {"$addToSet": {"access_users": {"user_id": user_id, "joined_at" : datetime.now(timezone.utc)}}}
        )
        if result.modified_count > 0 :
             message = {'Message' : f'Added Successfully'}
             return message, 200
        else : 
             message = { 'Message' : f'Failed to add user' }
             return message, 400
    
    @staticmethod
    def revoke_access_from_board(board_id, user_id):
        # Update the board document to remove the user_id from the access_users array
        result = db.Board.update_one(
            {"_id": board_id},
            {"$pull": {"access_users": {"user_id": user_id}}}
        )
        if result.modified_count > 0 :
             message = { 'Message' : f'Removed Successfully' }
             return message, 200
        else : 
             message = {'Message' : f'Failed to remove user'}
             return message, 400

    @staticmethod    
    def search(title):
        boards = db.Board.find({'title' : {'$regex' : f'.*{title}*.', '$options' : 'i'}})
        data = [json.loads(json_util.dumps(board)) for board in boards]
        return jsonify(data), 200
    
    @staticmethod
    def board_ID(ID):
        boards = db.Board.find_one({"_id": ObjectId(ID)})
        if not boards:
            return {"error": "Board not found"}
        else :
            access_users = boards.get('access_users', [])
            user_ids = []
            for user in access_users:
                user_ids.append({
                    "user_id": user["user_id"],
                    "joined_at": user["joined_at"]
                })
            return user_ids
        
    @staticmethod
    def board():
        boards = db.Board.find()
        boards_list = [json.loads(json_util.dumps(board)) for board in boards]
        return jsonify(boards_list), 200
    
    @staticmethod
    def board_in_workspace(workspace_id):
        boards = db.Board.find({'workspace': ObjectId(workspace_id)})
        board_data = [{**json.loads(json_util.dumps(board)), 
                       "issues": json.loads(json_util.dumps(db.issues.find({"board_id": board["_id"]}))),
                       "_id": str(board["_id"])} for board in boards]
        return jsonify(board_data), 200
    
    @staticmethod
    def Update(
            board_id: str,
            user_id: str,
            title: str,
            image: dict,
            start_date: str,
            end_date: str,
            workspace_id: str,
            # is_backlog: Optional[bool] = None,
        ):
        try:
            # First check if board exists
            existing_board = db.Board.find_one({'_id': ObjectId(board_id)})
            if not existing_board:
                return jsonify({'error': 'Board not found'}), 404

            update_fields = {}
            validation_errors = []

            # Title validation with length constraints
            if title is not None:
                if isinstance(title, str) and title.strip():
                    if len(title.strip()) <= 100:  # Max length
                        update_fields['title'] = title.strip()
                    else:
                        validation_errors.append('Title must be 100 characters or less')
                else:
                    validation_errors.append('Invalid title')

            # Image validation with size and format checks
            if image is not None:
                if isinstance(image, dict):
                    required_fields = ['imageUrl', 'imageFullUrl']
                    if all(field in image for field in required_fields):
                        # Add size validation if needed
                        update_fields['image'] = image
                    else:
                        validation_errors.append('Image must contain imageUrl and imageFullUrl')
                else:
                    validation_errors.append('Invalid image data')

            # Date validations with business rules
            if start_date is not None or end_date is not None:
                try:
                    if start_date:
                        start = datetime.strptime(start_date, '%Y-%m-%d')
                        # Ensure start date is not in the past
                        if start.date() < datetime.now().date():
                            validation_errors.append('Start date cannot be in the past')
                        update_fields['start_date'] = start

                    if end_date:
                        end = datetime.strptime(end_date, '%Y-%m-%d')
                        update_fields['end_date'] = end

                    # Validate date range if both dates are provided
                    if start_date and end_date:
                        start = datetime.strptime(start_date, '%Y-%m-%d')
                        end = datetime.strptime(end_date, '%Y-%m-%d')
                        if start > end:
                            validation_errors.append('Start date must be before end date')
                        
                        # Validate sprint duration
                        duration = (end - start).days
                        if duration > 30:  # Max sprint duration
                            validation_errors.append('Sprint duration cannot exceed 30 days')

                except ValueError:
                    validation_errors.append('Invalid date format. Use YYYY-MM-DD')

            # Workspace validation with permissions check
            if workspace_id is not None:
                if ObjectId.is_valid(workspace_id):
                    workspace = db.Workspace.find_one({'_id': ObjectId(workspace_id)})
                    if workspace:
                        # Check if user has permission to move board to this workspace
                        # Add your permission check logic here
                        update_fields['workspace_id'] = ObjectId(workspace_id)
                    else:
                        validation_errors.append('Workspace not found')
                else:
                    validation_errors.append('Invalid workspace ID')

            # Check for validation errors
            if validation_errors:
                return jsonify({
                    'error': 'Validation failed',
                    'validation_errors': validation_errors
                }), 400

            # Perform update if there are fields to update
            if update_fields:
                result = db.Board.update_one(
                    {'_id': ObjectId(board_id)},
                    {
                        '$set': update_fields,
                        '$push': {
                            'history': {
                                'updated_at': datetime.now(timezone.utc),
                                'updated_by': ObjectId(user_id),
                                'changes': update_fields
                            }
                        }
                    }
                )

                if result.modified_count > 0:
                    # Fetch updated board
                    data = db.Board.find_one({'_id': ObjectId(board_id)})
                    board = json.loads(json_util.dumps(data))                    
                    return jsonify({
                        'message': 'Board updated successfully',
                        'data': board,
                    }), 200
                else:
                    return jsonify({'message': 'No changes were made to the Board'}), 200
            else:
                return jsonify({'message': 'No valid fields provided for update'}), 400

        except Exception as e:
            return jsonify({'error': f'Error updating board {board_id}: {str(e)}'}), 500
        

    @staticmethod
    def delete(board_id,user_id):
        print("this is board ID", board_id, "this is user_id", user_id)  
        result = db.Board.delete_one({'_id': ObjectId(board_id), 'user_id' : ObjectId(user_id)})
        if result.deleted_count == 1 :
            message = {'message' : f'Deleted Successfully' }
            projectcollection = db.get_collection('proojects')
            taskcollection = db.get_collection('tasks')
            projectcollection.delete_many({'assigned_board': ObjectId(board_id)})
            taskcollection.delete_many({'assigned_board': ObjectId(board_id)})
            return message, 200
        else : 
            message = {'message' : f'Failed to Delete'}
            return message, 400
const mongoose = require('mongoose');
const generateId = require('../Model/issue')

function validateObjectId(requiredIds) {
  return (req, res, next) => {
    const inputSource = { ...req.body, ...req.params, ...req.query };
    
    for (const idField of requiredIds) {
      const id = inputSource[idField];
      
      if (!id) {
        return res.status(400).json({ 
          message: `Missing required ID: ${idField}` 
        });
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ 
          message: `Invalid ObjectId: ${idField}` 
        });
      }
    }

    next()
  };
}

async function validateInsertIds (ids) {
  try {
        const User = mongoose.connection.db.collection('Users');
        const Board = mongoose.connection.db.collection('Board');
        const Project = mongoose.connection.db.collection('projects');
        const Issue = mongoose.connection.db.collection('Issue');
  
        // Check if creator exists
        const creatorExists = await User.findOne({ _id: new mongoose.Types.ObjectId(String(ids.creator)) });
        if (!creatorExists)  throw new Error('Invalid creator: User does not exist.');

  
        // Check if board exists
        if (ids.issuetype !== "Epic" && ids.board_id) {
          const boardExists = await Board.findOne({ _id: new mongoose.Types.ObjectId(String(ids.board_id)) });
          if (!boardExists) throw new Error('Invalid board_id: Board does not exist.');
        }
  
        // Check if project exists (if provided)
        if (ids.project) {
            const projectExists = await Project.findOne({ _id: new mongoose.Types.ObjectId(String(ids.project))});
            if (!projectExists) throw new Error('Invalid project: Project does not exist.');
        }
  
        // Check if parent exists only if issuetype is "Sub-task"
        if (ids.issuetype === "Sub-task" && ids.parent) {
            const parentExists = await Issue.findOne({ _id: new mongoose.Types.ObjectId(String(ids.parent))});
            if (!parentExists) throw new Error('Invalid parent: Parent issue does not exist.');
        }
  
        return {valid: true}; // All validations passed
    } catch (error) {
        return {valid: false, error: error.message};
    }
}


module.exports = { validateObjectId,validateInsertIds };
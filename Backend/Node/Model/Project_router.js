const { default: mongoose } = require('mongoose');
const {Project, SearchProject} = require('../Model/project')
const express = require('express')
const router = new express.Router()

let io;

const setupProjectSocket = (socketServer) => {
    io = socketServer;
    console.log("Socket.IO initialized");
};

// Create a new Project
router.post('/project/create', async (req, res) => {
    try {
        const { name, board_id, user_id } = req.body;

        if (!name || !mongoose.Types.ObjectId.isValid(board_id) || !mongoose.Types.ObjectId.isValid(user_id)) return res.status(400).json({ error: 'Required fields Missing' });

        const project = new Project(req.body);
        const savedProject = await project.save();
        res.status(200).send(savedProject)
    } catch (e){
        console.error('Error in creating Project', e)
        res.status(400).send(e.message)
    }
})

// get a project
router.get('/project/search' , async (req, res) => {
    const queryParams = {
        name: req.body.name || req.query.name,
        category: req.body.category || req.query.category,
        projectID: req.body.projectID || req.query.projectID,
        board_id: req.body.board_id || req.query.board_id,
        ID: req.body.ID || req.query.ID
    };
    for (const key in queryParams) {
        if (!queryParams[key]) delete queryParams[key];
      }
    
      if (Object.keys(queryParams).length === 0) {
        return res.status(400).send("Missing Search Parameter");
      }
    try{
        const response = await SearchProject(queryParams)
        if (response.length > 0 ) return res.status(200).send(response)
        return  res.status(400).send("No Task Found")
    } 
    catch (error){
        console.error('Error searching projects:', error);
        res.status(400).send(error)
    }
})

// get a project in a Board
router.get('/project/<boardid>/search' , async (req, res) => {
    const queryparams = {board_id : req.body.board_id}
    try{
        const response = await SearchProject(queryparams)
        if (response.length !== 0){
            res.status(200).send(response)
        }
        else {
            res.status(400).send("Error : couldn't get any result")
        }
    } 
    catch (error){
        console.error('Error searching projects:', error);
        res.status(400).send(error)
    }
})

// get projects by category
router.get('/project/search/category', async (req, res) => {
    const {board_id, ID} = req.body
    
    if (!mongoose.Types.ObjectId.isValid(board_id) || !mongoose.Types.ObjectId.isValid(ID)) return res.status(404).json({Error : "Missing ID"})
    try {
        const project = await Project.find({"_id" : ID, "board_id": board_id}).toArray()
        if(!project) return res.status(404).json({ Error: 'Project not found' });
       const ProjectByCategory = projects.reduce((acc, project) => {
        const category = project.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(project);
        return acc;
      }, {});
        return res.status(200).send({
            ProjectByCategory,
        })
    } catch (error) {
        console.error('Error filtering project:', error);
        res.status(500).send({error});
    }
})

// Update a project
router.patch('/project/update', async (req, res) => {
    const {board_id, ID, user_id} = req.body
    if (!mongoose.Types.ObjectId.isValid(board_id) || 
        !mongoose.Types.ObjectId.isValid(ID) || 
        !mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(404).json({Error : "Missing ID"})
        }
    const allowedUpdates = ['name', 'description', 'category', 'assigned_tasks', 'assigned_user', 'priority', 'status', 'user_id']
    const updates = Object.keys(req.body)
        .filter(update => allowedUpdates.includes(update))
        .reduce((acc, key) => {
            acc[key] = req.body[key]
            return acc
        }, {})
    if(updates.length === 0 ) return res.status(400).json({ message: 'No valid update parameters provided' });
    try {
        const project = await Project.findOneAndUpdate(
            { "_id": ID, "board_id": board_id },
            { ...updates, 'updated_At': { user_id, createdAt: Date.now() } },
            { new: true }
        );
        if (io) {
            io.emit('ProjectUpdated', project);
        } else {
            console.warn('Socket.io not initialized');
        }
        return res.status(200).send({
            project,
            Message : "Project Successfully Updated"
        })
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).send({error});
    }
})

// delete a project 
router.delete('/project/delete', async (req, res) => {
    const {_id, board_id} = req.body 
    if (!mongoose.Types.ObjectId.isValid(board_id) || !mongoose.Types.ObjectId.isValid(_id)) return res.status(404).json({Error : "Missing ID"})
    try{
        const deletedproject = await Project.findOneAndDelete({_id, board_id})

        if (deletedproject){
            res.status(200).json({message : "Project has been successfully deleted", deletedproject})
        }
        else{
            res.status(404).json({error : 'Project not found '})
        }
    }
    catch (error) {
        console.error("Error :", error)
        return res.status(500).send({'Internal Server Error: ': error})
    }
})

module.exports = { router, setupProjectSocket}
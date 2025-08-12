const { Project } = require('../Model/project');
const { emitSocketEvent } = require('../utility/socket');

async function createProject(projectData) {
  try {
    const project = new Project(projectData);
    await project.save();
    emitSocketEvent('ProjectCreated', project);
    return project;
  } catch (error) {
    throw new Error(`Project creation failed: ${error.message}`);
  }
}

async function searchProjects(queryParams) {
  try {
    // Clean up query parameters
    Object.keys(queryParams).forEach(key => 
      queryParams[key] === undefined && delete queryParams[key]
    );
    
    console.log(queryParams)
    const projects = await Project.find(queryParams);
    return projects;
  } catch (error) {
    throw new Error(`Project search failed: ${error.message}`);
  }
}

async function getProjectsByCategory(board_id, ID) {
  try {
    const projects = await Project.find({ 
      board_id, 
      _id: ID 
    });

    if (projects.length === 0) return {};

    return projects.reduce((acc, project) => {
      const category = project.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(project);
      return acc;
    }, {});
  } catch (error) {
    throw new Error(`Project categorization failed: ${error.message}`);
  }
}

async function updateProject(updateData) {
  const { ID, user_id = creator } = updateData;
  
  const allowedUpdates = [
    'name', 'description', 'category', 
    'estimate', 'team', 'creator', 'board_id', 
    'priority', 'status', 'color'
  ];

  const updates = Object.keys(updateData)
    .filter(update => allowedUpdates.includes(update))
    .reduce((acc, key) => {
      acc[key] = updateData[key];
      return acc;
    }, {});

  if (Object.keys(updates).length === 0) {
    throw new Error('No valid update parameters');
  }

  const oldproject = await Project.findById(ID)
  if(!oldproject){
    throw new Error('No project')
  }

  const hasChanges = Object.keys(updates).some(
    key => JSON.stringify(oldproject[key]) !== JSON.stringify(updates[key]) )


  if(hasChanges){
    try {
      const historyEntries = Object.keys(updates).filter(key => JSON.stringify(oldproject[key]) !== JSON.stringify(updates[key])).map(field => ({
        field,
        oldValue: oldproject[field],
        newValue: updates[field],
        updatedBy: user_id,
        updatedAt: new Date()
      }));
      const project = await Project.findOneAndUpdate(
        { _id: ID},
        { 
          ...updates, 
          $push: {updateHistory: { $each: historyEntries, $slice: -5 }}
        },
        { new: true }
      );
  
      if (!project) return null;
  
      emitSocketEvent('ProjectUpdated', project);
      return project;
    } catch (error) {
      throw new Error(`Project update failed: ${error.message}`);
    }
  } else {
    throw new Error('No new changes Detected')
  }
}

async function deleteProject({ _id, board_id }) {
  try {
    const deletedProject = await Project.findOneAndDelete({ 
      _id, 
      board_id 
    });
    
    if (deletedProject) {
      emitSocketEvent('ProjectDeleted', deletedProject);
    }
    
    return deletedProject;
  } catch (error) {
    throw new Error(`Project deletion failed: ${error.message}`);
  }
}

module.exports = {
  createProject,
  searchProjects,
  getProjectsByCategory,
  updateProject,
  deleteProject
};
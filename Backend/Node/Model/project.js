const mongoose = require('mongoose')

const colors = ['#FFC107', '#FF5722', '#4CAF50', '#9C27B0', '#03A9F4', '#F44336', '#CDDC39'];

Generate_id = (name) => {
    const words = name.split(' ')
    const initials = words.map(word => word.replace('&', '').charAt(0).toUpperCase()).join('');
    const random = Math.floor(Math.random() * 1000);
    const customID = `PRJ-${initials}-${random}`
    return customID
}

const ProjectSchema = new mongoose.Schema({
    name: { 
      type: String, 
      required: true, 
      unique: true 
    },
    description: String,
    projectID: {
        type: String,
        unique: true,
    },
    board_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Board', 
      required: true,
    },
    category: {
      type: String,
      enum: ['project'],
      default: 'project'
    },
    creator: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    color: {
      type: String,
      enum: colors,
  },
    team: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    priority: { 
      type: String, 
      enum: ['High', 'Medium', 'Low'], 
      default: 'Medium' 
    },
    status: { 
      type: String, 
      enum: ['Planning', 'Active', 'On Hold', 'Completed'], 
      default: 'Planning' 
    },
    estimate : {
      estimate: {
        type: Number,
        default: null,
        validate: {
          validator: function(v) {
            return v === null || v >= 0 
          },
          message: props => `${props.value} is not a valid estimate! it should be a postive number.`
        },
      },
      unit: {
        type: String,
        enum: ['minutes','hours','days'],
        default: 'hours',
        required: true
      }
    },
    createdAt: { type: Date, default: Date.now },
    updateHistory : [
      {
        field: { type: String, required: true }, // Name of the field being updated (e.g., 'status', 'priority')
        oldValue: mongoose.Schema.Types.Mixed, // The old value before the update
        newValue: mongoose.Schema.Types.Mixed, // The new value after the update
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User who made the change
        updatedAt: { type: Date, default: Date.now } // Timestamp of the update
      }
    ]
  });

ProjectSchema.pre('save', async function (next) {
    if (!this.projectID) {
        const id = Generate_id(this.name);
        this.projectID = id;
    }
    if (!this.color) {
      this.color = colors[Math.floor(Math.random() * colors.length)];
  }
    next();
});

const Project = mongoose.model('Project', ProjectSchema);


async function SearchProject(queryParam){
    try {
        let query = {}

        if (queryParam.name){
            query.name = { $regex : queryParam.name, $options : 'i'}
        }
        if (queryParam.projectID){
            query.projectID = queryParam.projectID
        }
        if (queryParam.ID){
            query._id = queryParam.ID;
        }

        const project = await Project.find(query)
        return project
    }
    catch (error) {
        console.error('Error searching project' , error)
        throw error
    }
}

module.exports = {Project, SearchProject, colors}
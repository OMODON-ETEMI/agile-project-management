/**
 * Module: Issue
 * Description: Defines the schema for issues and provides functions for issue management.
 */

const mongoose = require('mongoose');

/**
 * Function to generate a custom issue ID based on category initials and a random number.
 * @param {string} issuetype - The category of the issue.
 * @returns {string} - The generated issue ID.
 */
const generateId = (issuetype, title) => {
  const type = issuetype.slice(0, 4).toUpperCase(); // e.g. TASK, BUG
  const titleChar = (title || 'X').replace(/[^a-zA-Z]/g, '').charAt(0).toUpperCase() || 'X';
  
  const timeSegment = String(Date.now()).slice(-5); // last 5 digits of time
  const randomSegment = String(Math.floor(Math.random() * 100)).padStart(2, '0');
    
    // Concatenate initials and random number to create the issue ID
  return `${type}-${titleChar}-${timeSegment}-${randomSegment}`;
};

const allowedTypes = ["Task", "Story"];
const dissallowedTypes = ["Task", "Story"];

// Define the schema for the Issue model
const IssueSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, description: "Title is required" },
  description: { type: String, trim: true },
  issuetype: { 
    type: String, 
    enum: [
      "Epic", "Story", "Task", "Bug", "Sub-task",
      "Incident", "Service Request", "Improvement", "Spike"
    ],
    required: true,
    description: "Must be a valid Issue Type",
    index: true
  },
  issueID: {
    type: String,
    unique: true,
    index: true,
  },
  storyPoints: {
    type: Number,
    default: 0
  },
  board_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Board', 
    index: true,
    required: function() { return this.issuetype !== "Epic"; },
    validate: [
      {
        validator: function(value) {
          // If issuetype is Epic, board_id must be undefined or null
          if (this.issuetype === "Epic") {
            return value === undefined || value === null;
          }
          // Otherwise, board_id must be present
          return true;
        },
        message: 'Epics should not have a board_id.'
      }
    ]
  },
  workspace_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'projects', 
    required: true,
    index: true,
  },
  parent: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Issue', 
    default: null,
    index: true,
    validate : {
      validator: function(value){
        if (dissallowedTypes.includes(this.issuetype)) {
          return !value; // If issuetype is Task or Story, epic must be null
        }
        return this.issuetype === "Sub-task" ? !!value : true
      },
      message: props => {
        if (dissallowedTypes.includes(props.instance.issuetype)) {
          return `${props.instance.issuetype} cannot have a parent.`;
        }
        return "Sub-Tasks must have a parent";
      }
    } 
  },
  epic: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Issue', 
    default: null,
    indeex: true,
    validate : {
      validator: function(value){
        if (!allowedTypes.includes(this.issuetype)) {
          return !value; 
        }
        return true;
      },
      message: props => {
        return `${props.instance.issuetype} cannot have an epic.`;
      }
    } 
  },
  dependencies: {
    issues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Issue' }],
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }]
  },
  linkedIssues: [{
    issue: {type: mongoose.Schema.Types.ObjectId, ref: 'Issue' , required: true},
    type: { 
      type: String, 
      enum: [
        "Relates", "Blocks", "Is Blocked By", "Duplicate", 
        "Is Duplicated By", "Clones",  
        "Causes", "Depends On", "Is Depended On By"
      ], 
      required: true 
    } 
 
  }],
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Users', 
    required: true ,
    index: true,
  },
  assignees: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    index: true,
    ref: 'Users' 
  }],
  priority: { 
    type: String, 
    enum: ['High', 'Medium', 'Low'], 
    default: 'Medium' 
  },
  status: { 
    type: String, 
    enum: ['Backlog', 'To Do', 'In Progress', 'Done', 'Cancelled', 'On Hold', 'Review'], 
    default: 'Backlog' ,
    index: true,
  },
  createdAt: { 
    type: Date, 
    default: Date.now ,
    index: true
  },
  updatedAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  endDate: { 
    type: Date, 
    default: null 
  },
  color: {
    type: String, 
    default: null 
  },
  resolutionId: { 
    type: Number, 
    default: null 
  },
  resolutionDate: { 
    type: Date, 
    default: null 
  },
  votes: { 
    type: Number, 
    default: 0 
  },
  watchers: { 
    type: Number, 
    default: 0 
  },
  updateHistory : [
    {
      field: { type: String, required: true }, // Name of the field being updated (e.g., 'status', 'priority')
      oldValue: mongoose.Schema.Types.Mixed, // The old value before the update
      newValue: mongoose.Schema.Types.Mixed, // The new value after the update
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }, // User who made the change
      updatedAt: { type: Date, default: Date.now } // Timestamp of the update
    }
  ],
    // Time Tracking (Essential for cycle time calculations)
  timeTracking: {
    estimatedHours: { type: Number, default: 0 }, // Original estimate
    actualHours: { type: Number, default: 0 }, // Time logged
    blockedHours: { type: Number, default: 0 } // Time spent blocked
  },

  // Board Movement History (Track when issues move between boards/sprints)
  boardHistory: [{
    board_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    action: { type: String, enum: ['added', 'removed'], required: true },
    timestamp: { type: Date, default: Date.now },
    reason: { type: String, default: null }, // scope change, completion, etc.
    movedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' }
  }],

  // Status Flow History (Track time in each status)
  statusHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' }
  }],

  // Impediments (Track blockers)
  impediments: [{
    description: { type: String, required: true },
    reportedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date, default: null },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    impactHours: { type: Number, default: 0 }
  }],

  // Quality Metrics (Track rework and defects)
  qualityMetrics: {
    defectCount: { type: Number, default: 0 },
    reworkRequired: { type: Boolean, default: false },
    reviewCycles: { type: Number, default: 0 },
    firstTimeRight: { type: Boolean, default: true }
  },

  // Work Logs (Track daily effort)
  workLogs: [{
    date: { type: Date, required: true },
    hours: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    description: { type: String, default: null }
  }],
});

/**
 * Middleware function to generate a custom issue ID before saving to the database.
 */
IssueSchema.pre('save', async function (next) {
    try {
      const User = mongoose.connection.db.collection('Users');
      const Board = mongoose.connection.db.collection('Board');
      const Project = mongoose.connection.db.collection('projects');
      const Issue = mongoose.connection.db.collection('Issue');

      // Check if creator exists
      const creatorExists = await User.findOne({ _id: new mongoose.Types.ObjectId(this.creator) });
      if (!creatorExists) {
          return next(new Error('Invalid creator: User does not exist.'));
      }

      // Check if board exists
      if (this.issuetype !== "Epic" && this.board_id) {
        const boardExists = await Board.findOne({ _id: new mongoose.Types.ObjectId(this.board_id) });
        if (!boardExists) {
            return next(new Error('Invalid board_id: Board does not exist.'));
        }
      }

      if (this.isNew && this.status) {
        this.statusHistory = [{
          status: this.status,
          timestamp: this.createdAt || new Date(),
          changedBy: this.creator
        }]
      }

      // Check if project exists (if provided)
      if (this.project) {
          const projectExists = await Project.findOne({ _id: new mongoose.Types.ObjectId(this.project) });
          if (!projectExists) {
              return next(new Error('Invalid project: Project does not exist.'));
          }
      }

      // Check if parent exists only if issuetype is "Sub-task"
      if (this.issuetype === "Sub-task" && this.parent) {
          const parentExists = await Issue.findOne({ _id: new mongoose.Types.ObjectId(this.parent) });
          if (!parentExists) {
              return next(new Error('Invalid parent: Parent issue does not exist.'));
          }
      }

      //check if issue is 'Task' or 'Story' and has a parent it must belong to a Epic
      if (this.issuetype === "Task" || this.issuetype === "Story" && this.parent) {
        const parentIssue = await Issue.findOne({ _id: new mongoose.Types.ObjectId(this.parent) });
        if (!parentIssue || parentIssue.issuetype !== "Epic") {
            return next(new Error('Invalid parent: Parent issue must be an Epic for Task or Story.'));
        }
      }

      if (!this.issueID) {
        const id = generateId(this.issuetype, this.title);
        this.issueID = id;
      }

      next(); // Proceed with saving if everything is valid
  } catch (error) {
      next(error);
  }
});

// Create the Issue model from the schema
const Issue = mongoose.model('Issue', IssueSchema, 'Issues');

/**
 * Function to search for issues based on specified parameters.
 * @param {Object} queryParam - The parameters for searching issues.
 * @returns {Array} - Array of issues matching the search criteria.
 */
async function searchIssue(queryParam){
    try {
        let query = {};

        if (queryParam.name){
            query.name = { $regex : queryParam.name, $options : 'i'};
        }

        if (queryParam.category){
            query.category = queryParam.category;
        }

        if (queryParam.issueID){
            query.issueID = queryParam.issueID;
        }

        if (queryParam.ID){
            query._id = queryParam.ID;
        }

        const issues = await Issue.find(query);
        return issues;
    } catch (error) {
        console.error('Error searching issues:', error);
        throw error;
    }
}

module.exports = { Issue, searchIssue, generateId };

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
    default: 0,
    validate: {
      validator: function(value) {
        if (this.issuetype === "Epic") {
          return value === 0 || value === null || value === undefined;
        }
        return true;
      },
      message: 'Epics cannot have story points.'
    }
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
    ref: 'Workspace', 
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
        if (["Epic", "Task", "Story"].includes(this.issuetype) && this.issuetype !== "Sub-task") {
          return !value; 
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
  color: {
    type: String, 
    default: null,
    validate: {
      validator: function(value) {
        if (this.issuetype !== "Epic" && value){
          return false
        }
        return true;
      },
      message: 'Non-epic issues cannot have a custom color.'
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
  reporter: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Users', 
    required: true ,
    index: true,
  },
  assignees: { 
    type: mongoose.Schema.Types.ObjectId, 
    index: true,
    ref: 'Users',
    validate: {
      validator: function(value) {
        // Epics should not have assignees
        if (this.issuetype === "Epic") {
          return value === null || value === undefined;
        }
        return true;
      },
      message: 'Epics cannot have assignees.'
    }
 },
  priority: { 
    type: String, 
    enum: ['High', 'Medium', 'Low'], 
    default: 'Medium',
    validate: {
      validator: function(value) {
        // Epics use default priority and shouldn't be customized in creation
        if (this.issuetype === "Epic") {
          return value === 'Medium' || value === null || value === undefined;
        }
        return true;
      },
      message: 'Epics cannot have a custom priority.'
    }
  },
  status: { 
    type: String, 
    enum: ['Backlog', 'To Do', 'In Progress', 'Done', 'Cancelled', 'On Hold', 'Review'], 
    default: 'Backlog',
    index: true,
    validate: {
      validator: function(value) {
        // Epics status is forced to Backlog during creation
        if (this.issuetype === "Epic") {
          return value === 'Backlog' || value === null || value === undefined;
        }
        return true;
      },
      message: 'Epics status cannot be changed during creation.'
    }
  },
  position: {
    type: Number,
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
  labels: [{
  type: String,
  trim: true,
  index: true
}],

dueDate: {
  type: Date,
  default: null
},

comments: [{
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true
  },
  body: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}],
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
      const Issues = mongoose.connection.db.collection('Issues');

      if (this.isNew) {
      if (!this.reporter) return next(new Error('Reporter is required for new issues.'));
      
      const creatorExists = await User.findOne({ _id: new mongoose.Types.ObjectId(this.reporter) });
      if (!creatorExists) {
        return next(new Error('Invalid Reporter: User does not exist.'));
      }

      if (!this.issueID) {
        this.issueID = generateId(this.issuetype, this.title);
      }
      
      // Setup status history for new issues
      if (this.status) {
        this.statusHistory = [{
          status: this.status,
          timestamp: new Date(),
          changedBy: this.reporter
        }];
      }
    }

          // Check if board exists
      if (this.issuetype !== "Epic" && this.board_id) {
        const boardExists = await Board.findOne({ _id: new mongoose.Types.ObjectId(this.board_id) });
        if (!boardExists) {
            return next(new Error('Invalid board_id: Board does not exist.'));
        }
      }

      // Sub-tasks must be linked to a Story or Task
      if (this.issuetype === "Sub-task") {
        if (!this.parent) {
          return next(new Error('Sub-tasks must have a parent issue.'));
        }
          const parentExists = await Issues.findOne({ _id: new mongoose.Types.ObjectId(this.parent) });
          if (!parentExists || !['Story', 'Task'].includes(parentExists.issuetype)) {
              return next(new Error('Invalid parent: Sub-tasks must be linked to a Story or Task.'));
          }
      }

      //check if issue is 'Task' or 'Story' and has a parent it must belong to a Epic
      if ((this.issuetype === "Task" || this.issuetype === "Story") && this.parent) {
        const parentIssue = await Issue.findOne({ _id: new mongoose.Types.ObjectId(this.parent) });
        if (!parentIssue || parentIssue.issuetype !== "Epic") {
            return next(new Error('Invalid parent: Parent issue must be an Epic for Task or Story.'));
        }
      }

      next(); // Proceed with saving if everything is valid
  } catch (error) {
      next(error);
  }
});

IssueSchema.index({
  title: "text",
  description: "text",
});

// Create the Issue model from the schema
const Issue = mongoose.model('Issue', IssueSchema, 'Issues');

module.exports = { Issue, generateId };

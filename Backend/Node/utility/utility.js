const TimeTrackingSchema = new Schema({
    _id: Schema.Types.ObjectId,
    issue_id: { type: Schema.Types.ObjectId, ref: 'Issue', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    time_spent: { type: Number, required: true }, // Time in minutes
    created_at: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('TimeTracking', TimeTrackingSchema);
  

  const AuditLogSchema = new Schema({
    _id: Schema.Types.ObjectId,
    action: { type: String, required: true },
    entity_type: { type: String, enum: ['Project', 'Issue', 'Comment'], required: true },
    entity_id: { type: Schema.Types.ObjectId, required: true },
    performed_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('AuditLog', AuditLogSchema);
  

  const CommentSchema = new Schema({
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reference: {
      type: { type: String, enum: ['Project', 'Issue'], required: true },
      id: { type: Schema.Types.ObjectId, required: true }
    },
    parent: { type: Schema.Types.ObjectId, ref: 'Comment', default: null }, // For threaded comments
    status: { type: String, enum: ['active', 'edited', 'deleted'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model('Comment', CommentSchema);
  
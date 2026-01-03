const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    recipientId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
        ref: "User",
      },
    ], // receiver

    type: {
      type: String,
      enum: [
        "mention",
        "comment",
        "task_assigned",
        "workspace_events",
        "organisation_events",
        "deadline",
        "status_change",
        "approval_request",
        "file_shared",
        "like",
        "follow",
      ],
      required: true,
      index: true,
    },

    title: { type: String, required: true },
    message: { type: String, required: true },

    actor: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: String,
      avatar: mongoose.Schema.Types.Mixed,
    },

    context: {
      entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
      entityType: {
        type: String,
        enum: ["issue", "comment", "workspace", "organisation", "file", "user"],
        required: true,
      },
      entityTitle: String,
      workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
      organisationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organisation",
      },
    },

    actionUrl: { type: String },

    // Delivery control
    deliveryMediums: [
      {
        type: String,
        enum: ["in_app", "email", "push"],
        default: "in_app",
      },
    ],

    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },

    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    readAt: { type: Date },
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    groupKey: { type: String, index: true },

    deliveryStatus: {
      type: String,
      enum: ["pending", "delivered", "failed"],
      default: "delivered",
    },
  },
  { timestamps: true }
);

// Index for fast notification feed scroll
NotificationSchema.index({ recipientId: 1, createdAt: -1 });
NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ recipientId: 1, type: 1, createdAt: -1 });
NotificationSchema.index({ recipientId: 1, isDeleted: 1, isRead: 1 });
NotificationSchema.index({ groupKey: 1, recipientId: 1 });

function toObjectId(value) {
  if (!value) return value;
  if (value instanceof mongoose.Types.ObjectId) return value;
  if (mongoose.Types.ObjectId.isValid(value)) return new mongoose.Types.ObjectId(value);
  throw new Error(`Invalid ObjectId: ${value}`);
}

NotificationSchema.pre("validate", function (next) {
  try {
    // recipientId (array)
    if (Array.isArray(this.recipientId)) {
      this.recipientId = this.recipientId.map(toObjectId);
    }

    // actor.userId
    if (this.actor?.userId) {
      this.actor.userId = toObjectId(this.actor.userId);
    }

    // context IDs
    if (this.context?.entityId) {
      this.context.entityId = toObjectId(this.context.entityId);
    }

    if (this.context?.workspaceId) {
      this.context.workspaceId = toObjectId(this.context.workspaceId);
    }

    if (this.context?.organisationId) {
      this.context.organisationId = toObjectId(this.context.organisationId);
    }

    // readBy / deletedBy
    if (Array.isArray(this.readBy)) {
      this.readBy = this.readBy.map(toObjectId);
    }

    if (Array.isArray(this.deletedBy)) {
      this.deletedBy = this.deletedBy.map(toObjectId);
    }

    console.log("Pre-validation completed for notification:", this.actor.userId, this.recipientId, this.message);
    next();
  } catch (err) {
    next(err);
  }
});



NotificationSchema.pre("save", async function (next) {
  try {
    const User = mongoose.connection.db.collection("Users");

    // Check if creator exists
    const actorExists = await User.findOne({
      _id: this.actor.userId,
    });
    const receiverExists = await User.findOne({
      _id: { $in: this.recipientId },
    });
    if (!actorExists || !receiverExists) {
      return next(new Error("Invalid creator: User does not exist."));
    }

    next(); // Proceed with saving if everything is valid
  } catch (error) {
    next(error);
  }
});
// Create the Issue model from the schema
const Notification = mongoose.model(
  "Notification",
  NotificationSchema,
  "Notifications"
);

module.exports = { Notification };

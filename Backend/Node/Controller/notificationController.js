const { Notification } = require("../Model/notification");
const { emitSocketEvent } = require("../utility/socket");
const { dispatchNotification } = require("../utility/dispatchNotification");
const eventBus = require("../utility/eventBus");
const mongoose = require("mongoose");

eventBus.on("notification:create", async (notificationData) => {
   await createNotification(notificationData);
})

async function createNotification(notificationData) {
  try {
    const notification = new Notification(notificationData);
    const savedNotification = await notification.save()
    dispatchNotification(savedNotification).catch((err) => {
      console.error("Error dispatching notification:", err);
    });
    return true;
  } catch (error) {
    console.error("❌ Mongoose Save Error:", error.message);
    return false;
  }
}

async function getNotifications(recipientId, params) {
  try {
    const { limit = 20, offset = 0, unreadOnly = false } = params;
    if (!recipientId) {
      return Error("Invalid parameters: recipientId is required.");
    }
    const isUnreadOnly = String(unreadOnly) === 'true';
    const query = { recipientId: new mongoose.Types.ObjectId(recipientId), deletedBy: { $ne: new mongoose.Types.ObjectId(recipientId) } };
    if (isUnreadOnly) {
      query.readBy = { $ne: new mongoose.Types.ObjectId(recipientId) };
    }
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));
    const unreadCount = await Notification.countDocuments({
      recipientId: query.recipientId,
      readBy: { $ne: query.recipientId },
    });
    const total = await Notification.countDocuments(query);
    return {
      notifications: notifications,
      unreadCount: unreadCount,
      total: total,
      hasMore: offset + notifications.length < total,
    };
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    return Error(`Notification retrieval failed: ${error.message}`);
  }
}

async function unreadCountOnly(recipientId) {
  try {
    if (!recipientId) {
      throw new Error("Invalid search parameters: recipientId is required.");
    }
    const unreadCount = await Notification.countDocuments({
      recipientId: new mongoose.Types.ObjectId(recipientId),
      readBy: { $ne: new mongoose.Types.ObjectId(recipientId) },
    });
    return unreadCount;
  } catch (error) {
    return Error(
      `Unread notification count retrieval failed: ${error.message}`
    );
  }
}

async function markNotificationsAsRead(recipientId, notificationIds) {
  try {
    if (!recipientId) {
      emitSocketEvent("Notification Update Failed", {
        error: "Invalid search parameters: recipientId is required.",
        success: false,
      });
      return Error("Notification update failed: no Notification selected.");
    }
    let query = { recipientId: new mongoose.Types.ObjectId(recipientId)};

    if (Array.isArray(notificationIds) && notificationIds.length > 0) {
      query._id = { $in: notificationIds.map(id => new mongoose.Types.ObjectId(id)) };
    }
    const result = await Notification.updateMany(
      query, 
      { $addToSet: { readBy: recipientId } }
    );
    return {
      modifiedCount: result.modifiedCount,
      success: true,
    };
  } catch (error) {
    return Error(`Notification update failed: ${error.message}`);
  }
}

async function softDeleteNotification(recipientId, notificationIds) {
  let query = { recipientId: new mongoose.Types.ObjectId(recipientId)};

  if (Array.isArray(notificationIds) && notificationIds.length > 0) {
    query._id = { $in: notificationIds.map(id => new mongoose.Types.ObjectId(id)) };
  }
  await Notification.updateMany(
    query,
    { $addToSet: { deletedBy: new mongoose.Types.ObjectId(recipientId) } }
  );

  const fullyDeletedNotifications = await Notification.find({
    _id: query._id,
    $expr: { $eq: [ { $size: "$deletedBy" }, { $size: "$recipientId" } ] }
  });
  if (fullyDeletedNotifications.length > 0) {
    const idsToDelete = fullyDeletedNotifications.map(n => n._id);
    await Notification.deleteMany({ _id: { $in: idsToDelete } });
    console.log(`[Janitor] Hard deleted ${idsToDelete.length} expired group notifications.`);
  }
}

module.exports = {
  createNotification,
  getNotifications,
  unreadCountOnly,
  markNotificationsAsRead,
  softDeleteNotification,
};

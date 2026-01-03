const { Notification } = require("../Model/notification");
const { emitsocketEvent } = require("../utility/socket");
const { dispatchNotification } = require("../utility/dispatchNotification");
const eventBus = require("../utility/eventBus");
const mongoose = require("mongoose");

eventBus.on("notification:create", async (notificationData) => {
  const result = await createNotification(notificationData);  
  console.log("Notification creation event processed:", result);
})

async function createNotification(notificationData) {
  try {
    const notification = new Notification(notificationData);
    const result = await notification.save();
    console.log("Notification created with ID:", result._id);
    dispatchNotification(notification).catch((err) => {
      console.error("Error dispatching notification:", err);
    });
    return true;
  } catch (error) {
    return Error(`Notification creation failed: ${error.message}`);
  }
}

async function getNotifications(params) {
  try {
    console.log("Params received for notification retrieval:", params);
    const { recipientId, limit = 20, offset = 0, unreadOnly } = params;
    if (!recipientId) {
      return Error("Invalid parameters: recipientId is required.");
    }
    const query = { recipientId: new mongoose.Types.ObjectId(recipientId), deletedBy: { $ne: recipientId } };
    if (unreadOnly) {
      query.readBy = { $ne: recipientId };
    }
    console.log("Querying notifications with params:", query, { limit, offset });
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
    console.log("Params received for unread count:", recipientId);
    if (!recipientId) {
      console.log("Invalid search parameters: recipientId is required.");
      throw new Error("Invalid search parameters: recipientId is required.");
    }
    const unreadCount = await Notification.countDocuments({
      recipientId: params.recipientId,
      readBy: { $ne: params.recipientId },
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
      emitsocketEvent("Notification Update Failed", {
        error: "Invalid search parameters: recipientId is required.",
        success: false,
      });
      return Error("Notification update failed: no Notification selected.");
    }
    if (!notificationIds || notificationIds.length === 0) {
      const result = await Notification.updateMany(
        { _id: { $in: recipientId } },
        { $addToSet: { readBy: recipientId } }
      );
      return {
        modifiedCount: result.modifiedCount,
        success: true,
      };
    }
    const result = await Notification.updateMany(
      { _id: { $in: notificationIds } },
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
  await Notification.updateMany(
    { _id: { $in: notificationIds } },
    { $addToSet: { deletedBy: userId } }
  );
}

async function deleteNotifications(notificationIds) {
  try {
    if (!notificationIds) {
      emitsocketEvent("Notification Delete Failed", {
        error: "Invalid Delete parameters: notificationIds is required.",
        success: false,
      });
      throw new Error("Notification Delete failed: no Notification selected.");
    }
    const result = await Notification.deleteMany({
      _id: { $in: params.notificationIds },
    });
    emitsocketEvent("Notifications Deleted", {
      deletedCount: result.deletedCount,
      success: true,
    });
    return {
      deletedCount: result.deletedCount,
      success: true,
    };
  } catch (error) {
    emitsocketEvent("Notification Delete Failed", {
      error: error.message,
      success: false,
    });
    return Error(`Notification delete failed: ${error.message}`);
  }
}

module.exports = {
  createNotification,
  getNotifications,
  unreadCountOnly,
  markNotificationsAsRead,
  softDeleteNotification,
  deleteNotifications,
};

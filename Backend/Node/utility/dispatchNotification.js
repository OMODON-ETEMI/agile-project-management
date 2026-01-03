// utils/dispatchNotification.js
const { emitSocketEvent } = require("../utility/socket");
// const { sendEmailNotification } = require("./emailSender"); // a separate util

/**
 * Dispatch notification through appropriate channels.
 * 
 * @param {Object} notificationDoc - The saved notification Mongoose document.
 * @returns {Promise<void>}
 */
async function dispatchNotification(notificationDoc) {
  if (!notificationDoc) {
    throw new Error("dispatchNotification: notification document is required.");
  }

  const {
    recipientId,
    type,
    title,
    message,
    actor,
    context,
    actionUrl,
    deliveryMediums = ["push", "inApp"], // default if not explicitly set
  } = notificationDoc;

  if (!Array.isArray(recipientId) || recipientId.length === 0) {
    console.warn("No recipients specified for notification dispatch.");
    return;
  }

  // Parallel processing of all recipients
  const dispatchPromises = recipientId.map(async (userId) => {
    for (const medium of deliveryMediums) {
      switch (medium) {
        case "push":
        case "inApp": {
          // Both use socket
          emitSocketEvent("notification:new", {
            userId,
            notification: {
              id: notificationDoc._id,
              type,
              title,
              message,
              actor,
              context,
              actionUrl,
              createdAt: notificationDoc.createdAt,
            },
            medium,
          });
          break;
        }

        case "email": {
          // await sendEmailNotification({
          //   toUserId: userId,
          //   subject: title || "New Notification",
          //   messageBody: message,
          //   actor,
          //   entity,
          //   type,
          //   actionUrl,
          // });
          // break;
        }

        default:
          console.warn(`Unknown delivery medium: ${medium}`);
      }
    }
  });

  await Promise.allSettled(dispatchPromises);
}

module.exports = { dispatchNotification };

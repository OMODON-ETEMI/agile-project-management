// utils/dispatchNotification.js
const { default: mongoose } = require("mongoose");
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
    readBy,
    deletedBy,
    deliveryMediums = ["in_app"],
  } = notificationDoc;

  if (!Array.isArray(recipientId) || recipientId.length === 0) {
    console.warn("No recipients specified for notification dispatch.");
    return;
  }

  // Parallel processing of all recipients
  const dispatchPromises = recipientId.map(async (userId) => {
    for (const medium of deliveryMediums) {
      switch (medium) {
        case "push": {
          // Both use socket
          console.log(
            `push medium detected for ${userId}, but sending is disabled.`,
          );
          break;
        }
        case "in_app": {
          // Both use socket
          emitSocketEvent(
            "notification:new",
            {
              id: notificationDoc._id,
              type,
              title,
              message,
              actor,
              context,
              actionUrl,
              readBy,
              deletedBy,
              createdAt: notificationDoc.createdAt,
            },
            userId,
          );
          break;
        }

        case "email": {
          console.log(
            `Email medium detected for ${userId}, but sending is disabled.`,
          );
          break;
        }

        default:
          console.warn(`Unknown delivery medium: ${medium}`);
      }
    }
  });

  await Promise.allSettled(dispatchPromises);
}

async function getNotificationRecipientsAndActor(issue, actorId) {
  const User = mongoose.connection.db.collection("Users");
  const uniqueRecipients = new Set();
  if (issue.reporter) uniqueRecipients.add(issue.reporter.toString());
  if (issue.assignees) uniqueRecipients.add(issue.assignees.toString());
  if (actorId) uniqueRecipients.add(actorId.toString());

  const validRecipientIds = Array.from(uniqueRecipients).filter((id) =>
    mongoose.Types.ObjectId.isValid(id),
  );

  const actor = await User.findOne(
    { _id: new mongoose.Types.ObjectId(actorId) },
    { projection: { firstname: 1, lastname: 1, image: 1 } },
  );
  const actorName = actor
    ? `${actor.firstname} ${actor.lastname}`
    : "Unknown User";

  return {
    recipientIds: validRecipientIds,
    actor: {
      userId: actorId,
      name: actorName,
      avatar: actor.image || null,
    },
  };
}

module.exports = { dispatchNotification, getNotificationRecipientsAndActor };

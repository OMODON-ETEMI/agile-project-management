
const mongoose = require("mongoose");
const { validateObjectId, validateInsertIds } = require("../utility/validation");
const upload = require("../utility/multer");
const { Issue } = require("../Model/issue");
const {
  createIssue,
  searchIssues,
  addComment,
  getEpics,
  updateIssueMetadata,
  transitionIssueStatus,
  moveIssue,
  reorderColumn,
  importIssue,
  deleteIssue,
} = require("../Controller/issueController");

const {
  createNotification,
  getNotifications,
  unreadCountOnly,
  markNotificationsAsRead,
  softDeleteNotification,
} = require("../Controller/notificationController");


const { BurndownData, cummulativeFlow } = require("../Controller/metrics");

const issueRouter = require("express").Router();
const notificationRouter = require("express").Router();



// Issue Routes
issueRouter.post("/issue/create", async (req, res) => {
  try {
    const issue = await createIssue(req.body);
    res.status(201).json({
      message: "Issue created successfully",
      data: issue,
    });
  } catch (error) {
    res.status(400).json({
      message: "Issue creation failed",
      error: error.message,
    });
  }
});

issueRouter.post("/issue/search", async (req, res) => {
  try {
    const queryParams = {
      ...req.query,
      ...req.body,
    };

    if (!queryParams) {
      return res.status(400).json({
        message: "search data is required",
      });
    }

    // OPTIONAL: enforce user access to workspace here
    // await validateWorkspaceAccess(req.user.user_id, queryParams.workspace_id)

    const result = await searchIssues(queryParams);

    return res.status(200).json({
      message: "Issues retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error searching issues",
      error: error.message,
    });
  }
});
issueRouter.post("/issue/:issueId/comment", async (req, res) => {
  try {
    const { issueId } = req.params;
    const { body } = req.body;

    const userId = req.user?.id; // depends on your auth middleware

    if (!issueId) {
      return res.status(400).json({
        message: "issueId is required",
      });
    }

    if (!body || body.trim() === "") {
      return res.status(400).json({
        message: "Comment body is required",
      });
    }

    const comment = await addComment(issueId, userId, body);

    return res.status(201).json({
      message: "Comment added successfully",
      data: comment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error adding comment",
      error: error.message,
    });
  }
});

issueRouter.get("/issue/:issueId/comments", async (req, res) => {
  try {
    const { issueId } = req.params;

    const issue = await Issue.findById(new mongoose.Types.ObjectId(issueId))

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    return res.status(200).json({
      message: "Comments retrieved successfully",
      count: issue.comments.length,
      data: issue.comments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving comments",
      error: error.message,
    });
  }
});

issueRouter.get("/issue/epics/:workspace_id", async (req, res) => {
  try {
    const { workspace_id } = req.params;

    if (!workspace_id) {
      return res.status(400).json({
        message: "workspace_id is required",
      });
    }

    const epics = await getEpics(workspace_id);

    return res.status(200).json({
      message: "Epics retrieved successfully",
      count: epics.length,
      data: epics,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving epics",
      error: error.message,
    });
  }
});

issueRouter.get("/issue/backlog/:workspace_id/:board_id", async (req, res) => {
  try {
    const { workspace_id, board_id } = req.params;

    const result = await searchIssues({
      workspace_id,
      board_id,
      includeEpics: false,
      status: ["Backlog"],
    });

    return res.status(200).json({
      message: "Backlog issues retrieved",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving backlog",
      error: error.message,
    });
  }
});

issueRouter.get("/issue/board/:workspace_id/:board_id", async (req, res) => {
  try {
    const { workspace_id, board_id } = req.params;

    const result = await searchIssues({
      workspace_id,
      board_id,
      unresolvedOnly: true,
    });

    return res.status(200).json({
      message: "Board issues retrieved",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error retrieving board issues",
      error: error.message,
    });
  }
});

issueRouter.patch("/issue/update-metadata", async (req, res) => {
  try {
    const issue = await updateIssueMetadata(
      { issueId: req.body.issueId, updates: req.body.updates },
      req.user.user_id
    );

    res.status(200).json({ message: "Issue updated", data: issue });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

issueRouter.post("/issue/transition", async (req, res) => {
  try {
    const issue = await transitionIssueStatus(
      { issueId: req.body.issueId, status: req.body.status },
      req.user.user_id
    );

    res.status(200).json({ message: "Status updated", data: issue });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

issueRouter.post("/issue/move", async (req, res) => {
  try {
    const issue = await moveIssue(req.body, req.user.user_id);
    res.status(200).json({ message: "Issue moved", data: issue });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

issueRouter.post("/issue/reorder", async (req, res) => {
  try {
    const result = await reorderColumn(req.body, req.user.user_id);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});                                                                                                                                                                                                     

issueRouter.get("/issue/burndown", validateObjectId(['sprintID']), async (req, res) => {
    try {
      const burndownData = await BurndownData(new mongoose.Types.ObjectId(req.query.sprintID));
      res.status(200).json({
        message: "Burndown data retrieved successfully",
        data: burndownData,
      })
    } catch (error) {
      res.status(500).json({
        message: "Error retrieving burndown data",
        error: error.message,
      });
    }
  }
);

issueRouter.get("/issue/cummulativeFlow", validateObjectId(['sprintID']), async (req, res) => {
    try {
      const cummulativeData = await cummulativeFlow(new mongoose.Types.ObjectId(req.query.sprintID));
      res.status(200).json({
        message: "Burndown data retrieved successfully",
        data: cummulativeData,
      })
    } catch (error) {
      res.status(500).json({
        message: "Error retrieving burndown data",
        error: error.message,
      });
    }
  }
);

issueRouter.post(
  "/issue/import",
  upload.single("file"),
  validateObjectId(["board_id", "creator", "workspace_id"]),
  async (req, res) => {
    const bufferFile = req.file.buffer;
    const { board_id, creator, workspace_id, mapping } = req.body;
    if(!validateInsertIds({board_id, creator, workspace_id})) throw new Error("Invalid IDs provided");
    try {
      // forward to python
      const response = await fetch("http://localhost:5000/issue/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file: bufferFile.toString("base64"),
          mapping,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text(); 
        return res.status(response.status).json({
          message: `Python service returned ${response.status}`,
          error: errorBody,
        });
      }

      const cleanedData = await response.json().then((data) => {
        if (!data) {
          return res.status(404).json({
            message: "No issues to import",
          });
        }
        return data;
      });
      const result = await importIssue(cleanedData, {
        board_id,
        creator,
        workspace_id,
      });
      return res.status(200).json({
        message: result.message,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error updating issue",
        error: error.message,
      });
    }
  }
);

issueRouter.delete(
  "/issue/delete",
  validateObjectId(["_id"]),
  async (req, res) => {
    try {
      const deletedIssue = await deleteIssue(req.body);

      if (!deletedIssue) {
        return res.status(404).json({
          message: "Issue not found",
        });
      }

      res.status(200).json({
        message: "Issue deleted successfully",
        data: deletedIssue,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error deleting issue",
        error: error.message,
      });
    }
  }
);


// Notification Routes
notificationRouter.post("/notification/create", async (req, res) => {
  await createNotification(req.body);
  res.status(201).json({ message: "Notification creation initiated" });
});

notificationRouter.get('/notification', async (req, res) => {
  const notifications = await getNotifications(req.user.user_id, req.query);
  console.log("Notifications retrieved:", notifications);
  res.status(200).json({ message: "Notification retrieval initiated", data: notifications });
});

notificationRouter.get('/notification/unreadCount', async (req, res) => {
  const count = await unreadCountOnly(req.query);
  res.status(200).json({ message: "Unread count retrieval initiated", data: count });
});

notificationRouter.patch('/notification/:notificationId/read', async (req, res) => {
  const notificationId = req.params.notificationId;
  await markNotificationsAsRead(req.user.user_id, [notificationId]);
  res.status(200).json({ message: "Mark as read initiated" });
}); 

notificationRouter.patch('/notification/markAsRead', async (req, res) => {
  const userId = req.user.user_id;
  console.log("User ID for marking all as read:", userId);
  await markNotificationsAsRead(userId, req.body);
  res.status(200).json({ message: "Mark as read initiated" });
});

notificationRouter.delete('/notification/clearRead', async (req, res) => {
  const { ids } = req.body;
  await softDeleteNotification(req.user.user_id, ids);
  res.status(200).json({ message: "Notification deletion initiated" });
});

notificationRouter.delete('/notification/clearAll', async (req, res) => {
  await softDeleteNotification(req.user.user_id, []);
  res.status(200).json({ message: "All notifications deletion initiated" });
});

module.exports = {
  issueRouter,
  notificationRouter
};

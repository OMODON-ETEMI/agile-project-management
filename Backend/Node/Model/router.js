
const mongoose = require("mongoose");
const { validateObjectId, validateInsertIds } = require("../utility/validation");
const upload = require("../utility/multer");
const {
  createIssue,
  searchIssues,
  updateIssue,
  importIssue,
  deleteIssue,
} = require("../Controller/issueController");
const {
  createProject,
  searchProjects,
  updateProject,
  deleteProject,
  getProjectsByCategory,
} = require("../Controller/projectController");

const {
  createNotification,
  getNotifications,
  unreadCountOnly,
  markNotificationsAsRead,
  deleteNotifications,
} = require("../Controller/notificationController");


const { BurndownData, VelocityTracking } = require("../Controller/metrics");

const issueRouter = require("express").Router();
const projectRouter = require("express").Router();
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
      ...req.body,
      ...req.query,
    };

    if (Object.keys(queryParams).length === 0) {
      return res.status(400).json({
        message: "Missing search parameters",
      });
    }

    if (!Object.keys(queryParams).includes("workspace_id")) {
      return res.status(400).json({
        message: "Invalid search parameters",
      });
    }

    const issues = await searchIssues(queryParams);

    if (issues.length === 0) {
      return res.status(404).json({
        message: "No issues found",
      });
    }

    res.status(200).json({
      message: "Issues retrieved successfully",
      count: issues.length,
      data: issues,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error searching issues",
      error: error.message,
    });
  }
});

issueRouter.patch(
  "/issue/update",
  validateObjectId(["_id", "creator"]),
  async (req, res) => {
    try {
      const updatedIssue = await updateIssue(req.body);

      if (!updatedIssue) {
        return res.status(404).json({
          message: "Issue not found or no updates applied",
        });
      }

      emitSocketEvent("Project Updated", updatedIssue);
      res.status(200).json({
        message: "Issue updated successfully",
        data: updatedIssue,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error updating issue",
        error: error.message,
      });
    }
  }
);

issueRouter.get("/issue/burndown", validateObjectId(['sprintID']), async (req, res) => {
    try {
      const burndownData = await BurndownData(new mongoose.Types.ObjectId(req.body.sprintID));
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

// Project Routes
projectRouter.post("/project/create", async (req, res) => {
  try {
    const { name, creator } = req.body;

    if (!name || !creator) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const project = await createProject(req.body);

    res.status(201).json({
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    res.status(400).json({
      message: "Project creation failed",
      error: error.message,
    });
  }
});

projectRouter.get("/project/search", async (req, res) => {
  try {
    const queryParams = {
      ...req.body,
      ...req.query,
    };

    if (Object.keys(queryParams).length === 0) {
      return res.status(400).json({
        message: "Missing search parameters",
      });
    }

    const projects = await searchProjects(queryParams);

    if (projects.length === 0) {
      return res.status(404).json({
        message: "No projects found",
      });
    }

    res.status(200).json({
      message: "Projects retrieved successfully",
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error searching projects",
      error: error.message,
    });
  }
});

projectRouter.get("/board/:boardId/search", async (req, res) => {
  try {
    const { boardId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({
        message: "Invalid board ID",
      });
    }

    const projects = await searchProjects({ board_id: boardId });

    if (projects.length === 0) {
      return res.status(404).json({
        message: "No projects found for this board",
      });
    }

    res.status(200).json({
      message: "Projects retrieved successfully",
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error searching projects",
      error: error.message,
    });
  }
});

projectRouter.get(
  "/project/search/category",
  validateObjectId(["board_id", "ID"]),
  async (req, res) => {
    try {
      const { board_id, ID } = req.body;

      const categorizedProjects = await getProjectsByCategory(board_id, ID);

      if (Object.keys(categorizedProjects).length === 0) {
        return res.status(404).json({
          message: "No projects found",
        });
      }

      res.status(200).json({
        message: "Projects categorized successfully",
        data: categorizedProjects,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error categorizing projects",
        error: error.message,
      });
    }
  }
);

projectRouter.patch(
  "/project/update",
  validateObjectId(["ID", "creator"]),
  async (req, res) => {
    try {
      const updatedProject = await updateProject(req.body);

      if (!updatedProject) {
        return res.status(404).json({
          message: "Project not found or no updates applied",
        });
      }

      res.status(200).json({
        message: "Project updated successfully",
        data: updatedProject,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error updating project",
        error: error.message,
      });
    }
  }
);

projectRouter.delete(
  "/project/delete",
  validateObjectId(["_id", "board_id"]),
  async (req, res) => {
    try {
      const deletedProject = await deleteProject(req.body);

      if (!deletedProject) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      res.status(200).json({
        message: "Project deleted successfully",
        data: deletedProject,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error deleting project",
        error: error.message,
      });
    }
  }
);

// Notification Routes
notificationRouter.post("/notification/create", async (req, res) => {
  const result = await createNotification(req.body);
  res.status(201).json({ message: "Notification creation initiated" });
});

notificationRouter.get('/notification', async (req, res) => {
  const notifications = await getNotifications(req.query);
  console.log("Notifications retrieved:", notifications);
  res.status(200).json({ message: "Notification retrieval initiated", data: notifications });
});

notificationRouter.get('/notification/unreadCount', async (req, res) => {
  const count = await unreadCountOnly(req.query);
  res.status(200).json({ message: "Unread count retrieval initiated", data: count });
});

notificationRouter.patch('/notification/:notificationId/read', async (req, res) => {
  const notificationId = req.params.notificationId;
  await markNotificationsAsRead(req.body);
  res.status(200).json({ message: "Mark as read initiated" });
}); 

notificationRouter.patch('/notification/markAsRead', async (req, res) => {
  await markNotificationsAsRead(req.body);
  res.status(200).json({ message: "Mark as read initiated" });
});

notificationRouter.delete('/notification/:id', async (req, res) => {
  await deleteNotifications(req.body);
  res.status(200).json({ message: "Notification deletion initiated" });
});

notificationRouter.delete('/notification/clearAll', async (req, res) => {
  await deleteNotifications({ notificationIds: 'all', recipientId: req.body.recipientId });
  res.status(200).json({ message: "All notifications deletion initiated" });
});

module.exports = {
  issueRouter,
  projectRouter,
  notificationRouter
};

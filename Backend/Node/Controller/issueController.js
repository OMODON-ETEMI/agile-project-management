const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const { default: mongoose } = require('mongoose');
const { Issue,generateId } = require('../Model/issue');
const { emitSocketEvent } = require('../utility/socket');

dayjs.extend(customParseFormat);

async function createIssue(issueData) {
  try {
    // EPIC CREATION LOGIC
    if (issueData.issuetype === "Epic") {
      issueData.board_id = null;
      issueData.position = 0; // Epics are not board-positioned
    } else {
      // NON-EPIC (Board Item)
      const position = await Issue.countDocuments({
        board_id: issueData.board_id,
        issuetype: { $ne: "Epic" } // never count epics
      });

      issueData.position = position + 1;
    }

    const issue = new Issue(issueData);
    await issue.save();

    emitSocketEvent("IssueCreated", issue);

    return issue;
  } catch (error) {
    throw new Error(`Issue creation failed: ${error.message}`);
  }
}

async function searchIssues(queryParams) {
  try {
    const mongoQuery = {};
    const {
      workspace_id,
      board_id,
      creator,
      epicId,
      assignee,
      issueType,
      status,
      priority,
      search,
      includeEpics,
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = queryParams;

    // ------------------------------------------------
    // Mandatory Scope (Workspace Required)
    // ------------------------------------------------
    if (!workspace_id) {
      throw new Error("workspace_id is required");
    }

    mongoQuery.workspace_id = new mongoose.Types.ObjectId(workspace_id);

    // ------------------------------------------------
    // Board Scope
    // ------------------------------------------------
    if (board_id) {
      mongoQuery.board_id = new mongoose.Types.ObjectId(board_id);
    }

    // ------------------------------------------------
    // Creator Filter
    // ------------------------------------------------
    if (creator) {
      mongoQuery.creator = new mongoose.Types.ObjectId(creator);
    }

    // ------------------------------------------------
    // Assignee Filter (multi support)
    // ------------------------------------------------
    if (assignee) {
      mongoQuery.assignees = {
        $in: Array.isArray(assignee)
          ? assignee.map(id => new mongoose.Types.ObjectId(id))
          : [new mongoose.Types.ObjectId(assignee)],
      };
    }

    // ------------------------------------------------
    // Status Filter (multi support)
    // ------------------------------------------------
    if (status) {
      mongoQuery.status = {
        $in: Array.isArray(status) ? status : [status],
      };
    }

    // ------------------------------------------------
    // Priority Filter (multi support)
    // ------------------------------------------------
    if (priority) {
      mongoQuery.priority = {
        $in: Array.isArray(priority) ? priority : [priority],
      };
    }

    // ------------------------------------------------
    // Issue Type Logic (Epic handling)
    // ------------------------------------------------
    if (issueType) {
      mongoQuery.issuetype = issueType;
    } else {
      // EXCLUDE Epics by default (Jira behavior)
      if (!includeEpics) {
        mongoQuery.issuetype = { $ne: "Epic" };
      }
    }

    // ------------------------------------------------
    // Text Search (Title + Description)
    // ------------------------------------------------
    if (search) {
    mongoQuery.$text = { $search: search };
    }

  if (epicId) {
  mongoQuery.parentEpic = new mongoose.Types.ObjectId(epicId);
  }

  if (queryParams.updatedAfter) {
  mongoQuery.updatedAt = { $gte: new Date(queryParams.updatedAfter) };
}

if (queryParams.unresolvedOnly) {
  mongoQuery.status = { $nin: ["Done", "Cancelled"] };
}

    // ------------------------------------------------
    // Sorting
    // ------------------------------------------------
    const sortOptions = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    // ------------------------------------------------
    // Pagination
    // ------------------------------------------------
    const skip = (Number(page) - 1) * Number(limit);

    const [issues, total] = await Promise.all([
      Issue.find(mongoQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      Issue.countDocuments(mongoQuery),
    ]);

    return {
      data: issues,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Issue search failed: ${error.message}`);
  }
}

async function getEpics(workspace_id) {
  if (!workspace_id) {
    throw new Error("workspace_id is required");
  }

  return Issue.find({
    workspace_id: new mongoose.Types.ObjectId(workspace_id),
    issuetype: "Epic",
  }).sort({ createdAt: -1 });
}

async function updateIssueMetadata({ issueId, updates }, user_id) {
  const allowedUpdates = new Set([
    "title",
    "description",
    "storyPoints",
    "status",
    "board_id",
    "assignees",
    "priority",
    "parent",
    "epic",
    "endDate",
    "color",
    "resolutionId"
  ]);

  const sanitizedUpdates = Object.fromEntries(
    Object.entries(updates).filter(([key]) => allowedUpdates.has(key))
  );

  if (Object.keys(sanitizedUpdates).length === 0) {
    throw new Error("No valid update fields provided");
  }

  const issue = await Issue.findById(new mongoose.Types.ObjectId(issueId));
  if (!issue) throw new Error("Issue not found");

  const historyEntries = [];

  for (const key of Object.keys(sanitizedUpdates)) {
    if (JSON.stringify(issue[key]) !== JSON.stringify(sanitizedUpdates[key])) {
      historyEntries.push({
        field: key,
        oldValue: issue[key],
        newValue: sanitizedUpdates[key],
        updatedBy: user_id,
        updatedAt: new Date()
      });

      issue[key] = sanitizedUpdates[key];
    }
  }

  if (historyEntries.length === 0) {
    throw new Error("No changes detected");
  }

  issue.updateHistory.push(...historyEntries);
  issue.updatedAt = new Date();

  await issue.save();

  emitSocketEvent("IssueUpdated", issue);
  return issue;
}

async function transitionIssueStatus({ issueId, status }, user_id) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const issue = await Issue.findById(issueId).session(session);
    if (!issue) throw new Error("Issue not found");

    if (issue.status === status) {
      throw new Error("Status already set");
    }

    issue.status = status;
    issue.statusHistory.push({
      status,
      timestamp: new Date(),
      changedBy: user_id
    });

    issue.updateHistory.push({
      field: "status",
      oldValue: issue.status,
      newValue: status,
      updatedBy: user_id,
      updatedAt: new Date()
    });

    issue.updatedAt = new Date();

    await issue.save({ session });

    await session.commitTransaction();
    session.endSession();

    emitSocketEvent("IssueStatusChanged", issue);
    return issue;

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

async function moveIssue({ issueId, board_id, status, position }, user_id) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const issue = await Issue.findById(issueId).session(session);
    if (!issue) throw new Error("Issue not found");

    const oldBoard = issue.board_id;
    const oldStatus = issue.status;

    // Shift issues in target column
    await Issue.updateMany(
      {
        board_id,
        status,
        position: { $gte: position }
      },
      { $inc: { position: 1 } },
      { session }
    );

    issue.board_id = board_id;
    issue.status = status;
    issue.position = position;

    if (!oldBoard.equals(board_id)) {
      issue.boardHistory.push({
        board_id,
        action: "added",
        timestamp: new Date(),
        movedBy: user_id
      });
    }

    if (oldStatus !== status) {
      issue.statusHistory.push({
        status,
        timestamp: new Date(),
        changedBy: user_id
      });
    }

    issue.updatedAt = new Date();

    await issue.save({ session });

    await session.commitTransaction();
    session.endSession();

    emitSocketEvent("IssueMoved", issue);
    return issue;

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

async function reorderColumn({ board_id, status, orderedIssueIds }, user_id) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (let i = 0; i < orderedIssueIds.length; i++) {
      await Issue.updateOne(
        { _id: orderedIssueIds[i], board_id, status },
        { position: i + 1 },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return { success: true };

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}


async function importIssue(issueData, addedData ) {
  if(!Array.isArray(issueData) || issueData.length === 0){
    throw new Error('Invalid issue data format');
  }

  const parseDate = (dateString, format = 'YYYY-MM-DD') => {
    if(!dateString) return false;
    const parsed = dayjs(dateString, format, true);
    return parsed.isValid() ? parsed.toDate() : false;
  }
  try {
    const enrichedIssues = issueData.map((issue) => ({
      ...issue,
      createdAt: parseDate(issue.createdAt) || Date.now(),
      endDate: parseDate(issue.endDate) || null,
      workspace_id: new mongoose.Types.ObjectId(addedData.workspace_id),
      creator: new mongoose.Types.ObjectId(addedData.creator),
      board_id: issue.issuetype !== "Epic" ? new mongoose.Types.ObjectId(addedData.board_id) : null,
      storyPoints: issue.storyPoints == null ? Math.floor(Math.random() * 10) : issue.storyPoints,
      issueID: generateId(issue.issuetype || 'Task', issue.title),
      statusHistory: issue.status ? [{
        status: issue.status,
        timestamp: parseDate(issue.createdAt) || Date.now(),
        changedBy: addedData.creator
      }] : [],
    }))
    const result = await Issue.insertMany(enrichedIssues, { ordered: false });
    return {
      success: true,
      message: `${result.length} issues imported successfully`,
      data: result.length,
      failed: []
    };
  } catch (error) {
    const failedIndex = error.writeErrors?.map(err => err.index) || [];
    const failedIssues = failedIndex.map(index => ({
      ...issueData[index],
      error: error.message
    }))
    const insertedCount = error.result?.insertedCount
    return {
      success: false,
      message: `${insertedCount} inserted, ${failedIssues.length} failed due to duplicate issueIDs.`,
      inserted: insertedCount,
      failed: failedIssues,
      error: error.message,
    };
  }
}

async function deleteIssue({ _id }) {
  try {
    const deletedIssue = await Issue.findOneAndDelete({ _id});

    if (deletedIssue) {
      emitSocketEvent('IssueDeleted', deletedIssue);
    }

    return deletedIssue;
  } catch (error) {
    throw new Error(`Issue deletion failed: ${error.message}`);
  }
}

module.exports = {
  createIssue,
  searchIssues,
  getEpics,
  updateIssueMetadata,
  transitionIssueStatus,
  moveIssue,
  reorderColumn,
  importIssue,
  deleteIssue
};

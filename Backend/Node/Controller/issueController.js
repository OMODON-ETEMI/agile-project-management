const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const { default: mongoose } = require('mongoose');
const { Issue,generateId } = require('../Model/issue');
const { emitSocketEvent } = require('../utility/socket');

dayjs.extend(customParseFormat);

async function createIssue(issueData) {
  try {
    const issue = new Issue(issueData);
    await issue.save();
    emitSocketEvent('IssueCreated', issue);
    return issue;
  } catch (error) {
    throw new Error(`Issue creation failed: ${error.message}`);
  }
}

async function searchIssues(queryParams) {
  try {

    const mongoQuery = {}
    // Clean up query parameters
    Object.keys(queryParams).forEach(key =>
      queryParams[key] === undefined || "" && delete queryParams[key]
    );
    if (Object.keys(queryParams).includes('workspace_id')) {
      mongoQuery.workspace_id = new mongoose.Types.ObjectId(queryParams.workspace_id);
    }

    if (queryParams.title) {
      mongoQuery.title = { $regex: queryParams.title, $options: 'i' };
    }

    // Add other query parameters to mongoQuery as needed
    for (const key in queryParams) {
      if (!['workspace_id', 'title'].includes(key)){
        mongoQuery[key] = queryParams[key];
      }
    }

    const issues = await Issue.find(mongoQuery);
    return issues;
  } catch (error) {
    throw new Error(`Issue search failed: ${error.message}`);
  }
}

async function updateIssue(updateData) {
  const { ID, user_id = creator } = updateData;

  const allowedUpdates = [
    'name', 'description', 'category',
    'project', 'parent', 'assigned_users',
    'priority', 'status', 'estimate', 'board_id'
  ];

  const updates = Object.keys(updateData)
    .filter(update => allowedUpdates.includes(update))
    .reduce((acc, key) => {
      acc[key] = updateData[key];
      return acc;
    }, {});

  if (Object.keys(updates).length === 0) {
    throw new Error('No valid update parameters');
  }

  const oldIssue = await Issue.findById(ID)
  if(!oldIssue){
    throw new Error("No Issue Found")
  }

  const hasChanges = Object.keys(updates).some(
    key => JSON.stringify(oldIssue[key] !== JSON.stringify(updates[key]))
  )

  if(!hasChanges){
    throw new Error('No changes Detected')
  }
  try {
    if (updateData.issues || updateData.projects){
      if (!updateData.issues.every(id => mongoose.Types.ObjectId.isValid(id)) || !updateData.projects.every(id => mongoose.Types.ObjectId.isValid(id)) ) {
        throw new Error('Invalid ObjectId in dependency array');
      }
      updates.$addToSet = {
        'dependencies.issues': { $each : updateData.issues},
        'dependencies.projects': {$each : updateData.projects}
      }
    }
    const historyEntries = Object.key(updates).filter(key => JSON.stringify(oldproject[key]) !== JSON.stringify(updates[key])).map(field => ({
      field,
      oldVlaue: oldIssue[field],
      newVlaue: updates[field],
      updatedBy: user_id,
      updateAt: new Date()
    }))

    if (updates.status && oldIssue.status !== updates.status){
      updates.statusHistory = [
        ...oldIssue.statusHistory,
        {
          status: updates.status,
          timestamp: new Date(),
          changedBy: user_id
        }
      ];
    }
    const issue = await Issue.findOneAndUpdate(
      { _id },
      {
        ...updates,
        $push : { updateHistory : { $each : historyEntries, $slice: -5}}
      },
      { new: true }
    );

    if (!issue) return null;

    emitSocketEvent('IssueUpdated', issue);
    return issue;
  } catch (error) {
    throw new Error(`Issue update failed: ${error.message}`);
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
  updateIssue,
  importIssue,
  deleteIssue
};

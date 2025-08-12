const mongoose = require('mongoose');

let Board, Issue

function initModels() {
  if(mongoose.connection.readyState == 1 && (!Board || !Issue)) {
      Board = mongoose.connection.db.collection('Board');
      Issue = mongoose.connection.db.collection('Issues');   
  }
   if (!Board || !Issue) {
    throw new Error('Database collections not available. Ensure MongoDB is connected.');
  }
    return { Board, Issue };
}

const getSprint = async (sprintID) => {
  const { Board } = initModels();
  const sprint = await Board.findOne({ _id: sprintID });
  if (!sprint) throw new Error('Sprint not found');
  return sprint;
};

const getIssues = async (sprint) => {
  const { Issue } = initModels();
  return Issue.find({
    board_id: sprint._id,
    status: { $ne: 'Cancelled' }
  }).toArray();
};

const getTotalStoryPoints = async (sprint) => {
  const result = await Issue.aggregate([
    { $match: { board_id: sprint._id, status: { $ne: 'Cancelled' } } },
    { $group: { _id: null, total: { $sum: "$storyPoints" } } }
  ]).toArray();
  return result[0]?.total ?? 0;
};

const getCompletedStoryPoints = async (sprint) => {
  const { Issue } = initModels();
  const result = await Issue.aggregate([
    { $match: { board_id: sprint._id, status: 'Done' } },
    { $group: { _id: null, total: { $sum: "$storyPoints" } } }
  ]).toArray();
  return result[0]?.total ?? 0;
};

const getAddedPoints = async (sprint) => {
  const { Issue } = initModels();
  const result = await Issue.aggregate([
    { $unwind: "$boardHistory" },
    {
      $match: {
        "boardHistory.board_id": sprint._id,
        "boardHistory.action": "added",
        "boardHistory.timestamp": { $gte: sprint.startDate }
      }
    },
    { $group: { _id: null, total: { $sum: "$storyPoints" } } }
  ]).toArray();
  return result[0]?.total ?? 0;
};

const getRemovedPoints = async (sprint) => {
  const { Issue } = initModels();
  const result = await Issue.aggregate([
    { $unwind: "$boardHistory" },
    {
      $match: {
        "boardHistory.board_id": sprint._id,
        "boardHistory.action": "removed",
        "boardHistory.timestamp": { $gte: sprint.startDate }
      }
    },
    { $group: { _id: null, total: { $sum: "$storyPoints" } } }
  ]).toArray();
  return result[0]?.total ?? 0;
};
const computeDailyBurndown = async (sprint, issues, totalPoints) => {
  const dailyData = [];

  let currentDate = new Date(sprint.start_date);
  const endDate = new Date(sprint.end_date);

  while (currentDate <= endDate) {
    let donePoints = 0;
    for (const issue of issues) {
      const doneEntry = issue.statusHistory.find(entry =>
        entry.status === 'Done' && new Date(entry.timestamp) <= currentDate
      );
      if (doneEntry) donePoints += issue.storyPoints;
    }

    dailyData.push({
      date: new Date(currentDate),
      remainingStoryPoints: totalPoints - donePoints
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dailyData;
};

async function BurndownData(sprintID) {
  const sprint = await getSprint(sprintID);
  const issues = await getIssues(sprint);
  const totalPoints = await getTotalStoryPoints(sprint);
  const completedPoints = await getCompletedStoryPoints(sprint);
  const addedPoints = await getAddedPoints(sprint);
  const removedPoints = await getRemovedPoints(sprint);
  const burndown = await computeDailyBurndown(sprint, issues, totalPoints);

  return {
    sprintID: sprint._id,
    totalPoints,
    completedPoints,
    remainingPoints: totalPoints - completedPoints,
    netScopeChange: addedPoints - removedPoints,
    burndown
  };

}

async function VelocityTracking(sprint){

    return {
        sprintID: sprint.ID,
        completedStoryPoints
    };
}

module.exports = {
    BurndownData,
    VelocityTracking
}
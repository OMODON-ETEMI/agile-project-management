export const IssueStatus = {
    SELECTED: 'selected',
    TODO: 'todo',
    INPROGRESS: 'inprogress',
    INREVIEW: 'inreview',
    TESTING: 'testing',
    DONE: 'done',
    CANCELED: 'canceled',
    ONHOLD: 'onhold',
    REOPENED: 'reopened',
  };
  
  export const IssueStatusCopy = {
    [IssueStatus.SELECTED]: 'Selected for Development',
    [IssueStatus.TODO]: 'To Do',
    [IssueStatus.INPROGRESS]: 'In Progress',
    [IssueStatus.INREVIEW]: 'In Review',
    [IssueStatus.TESTING]: 'Testing',
    [IssueStatus.DONE]: 'Done',
    [IssueStatus.CANCELED]: 'Canceled',
    [IssueStatus.ONHOLD]: 'On Hold',
    [IssueStatus.REOPENED]: 'Reopened',
  };
  
  // Default statuses to display on the board
  export const DefaultBoardStatuses = [
    IssueStatus.TODO,
    IssueStatus.INPROGRESS,
    IssueStatus.INREVIEW,
    IssueStatus.DONE,
  ];

  export const ISSUEPRIORITY = {
    High: 'High',
    Medium: 'Medium',
    Low: 'Low',
  }

  export const ProjectStatus = {
    PLANNING: 'Planning',
    ACTIVE: 'Active',
    ONHOLD: 'On Hold',
    COMPLETED: 'Completed'
  }
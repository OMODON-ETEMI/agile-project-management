import { IconType } from "./icon";

export interface User {
  user_id: string;
  _id?: string;
  username: string;
  firstname: string;
  lastname: string;
  image: Image;
  role: string;
  email: string;
  created: string;
  isMember?: boolean;
}
export interface Administrator {
  email?: string;
  firstname?: string;
  lastname?: string;
  username?: string;
}
export interface Board {
  _id: string;
  title: string;
  slug: string;
  type: string;
  description: string;
  user_id: string;
  image: Image;
  startDate: string;
  endDate: string;
  workspace: string;
  createdAt: string;
  issues: Issue[];
  history: {};
}

export interface Organisation {
  _id: string;
  title: string;
  created_by: string;
  manager?: string;
  slug: string;
  description: string;
  createdAt: string;
  image?: Image;
  color: string;
  workspace_count: string;
  lastAccessed: {
    timestamp: Date;
    title: string;
  };
  admin: Partial<Administrator>;
  User_role?: string;
  type: string;
}

export interface Workspace {
  _id: string;
  title: string;
  description: string;
  slug: string;
  image: Image;
  user_id: string;
  role: string;
  members_count: string;
  workspace_id: string;
  createdAt: {
    $date: string;
  };
  created_By: string;
  organisation_id: string;
}

export interface Image {
  urls?: {
    full: string;
    raw: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user?: {
    name: string;
    username: string;
  };
  image?: {
    Id: string;
  };
  imageThumbUrl?: string;
  imageFullUrl?: string;
  imageUserName?: string;
}

export interface UserResponse {
  user: User[];
}

export const ROLES = [
  "Admin", // Full workspace/org management
  "Developer", // Create, edit, manage tasks/issues
  "Viewer", // Read-only access
];

export const Category: IconType[] = [
  "task",
  "epic",
  "Bug",
  "story",
  "spike",
  "subtask",
  "incident",
  "servicerequest",
  "improvment",
];

export const status: Status[] = [
  "Backlog", 
  "To Do", 
  "In Progress", 
  "Review", 
  "Done",
  "Cancelled",
  "On Hold"
];
export const linkedIssues = [
  "Relates",
  "Blocks",
  "Is Blocked By",
  "Duplicate",
  "Is Duplicated By",
  "Clones",
  "Causes",
  "Depends On",
  "Is Depended On By",
];

export const ISSUE_TYPES = [
  "Epic",
  "Story",
  "Task",
  "Bug",
  "Sub-task",
  "Incident",
  "Service Request",
  "Improvement",
  "Spike",
] as const; 

export type IssueType = (typeof ISSUE_TYPES)[number];


export type Priority = "High" | "Medium" | "Low" | "Critical";

export const priorityList: Priority[] = ["High", "Medium", "Low", "Critical"];

export type Status =
  | "Backlog"
  | "To Do"
  | "In Progress"
  | "Done"
  | "Cancelled"
  | "On Hold"
  | "Review";

export type LinkedIssueType =
  | "Relates"
  | "Blocks"
  | "Is Blocked By"
  | "Duplicate"
  | "Is Duplicated By"
  | "Clones"
  | "Causes"
  | "Depends On"
  | "Is Depended On By";

export type BoardAction = "added" | "removed";

// Sub-interfaces for nested objects
export interface LinkedIssue {
  issue: string; // ObjectId as string
  type: LinkedIssueType;
}

export interface Dependencies {
  issues: string[]; // ObjectId[] as string[]
  projects: string[]; // ObjectId[] as string[]
}

export interface UpdateHistoryEntry {
  field: string;
  oldValue: any; // mongoose.Schema.Types.Mixed
  newValue: any; // mongoose.Schema.Types.Mixed
  updatedBy: string; // ObjectId as string
  updatedAt: Date;
}

export interface TimeTracking {
  estimatedHours: number;
  actualHours: number;
  blockedHours: number;
}

export interface BoardHistoryEntry {
  board_id: string; // ObjectId as string
  action: BoardAction;
  timestamp: Date;
  reason?: string | null;
  movedBy?: string; // ObjectId as string
}

export interface StatusHistoryEntry {
  status: string;
  timestamp: Date;
  changedBy?: string; // ObjectId as string
}

export interface Impediment {
  description: string;
  reportedAt: Date;
  resolvedAt?: Date | null;
  reportedBy: string; // ObjectId as string
  impactHours: number;
}

export interface QualityMetrics {
  defectCount: number;
  reworkRequired: boolean;
  reviewCycles: number;
  firstTimeRight: boolean;
}

export interface WorkLog {
  date: Date;
  hours: number;
  user: string; // ObjectId as string
  description?: string | null;
}

export interface IssueComment {
  author: string
  body: string
  createdAt: Date
}

// Main Issue interface
export interface Issue {
  _id?: string; // MongoDB ObjectId as string (optional for new issues)
  title: string;
  description?: string;
  issuetype: IssueType;
  issueID: string;
  storyPoints?: number;
  position: number;
  // References (ObjectIds as strings)
  board_id?: string; // Required for non-Epic types
  workspace_id: string;
  parent?: string | null; // Required for Sub-tasks only
  epic?: string | null;
  reporter: string;
  assignees: string | null;
  comments: IssueComment[];
  labels: string[];


  // Nested objects
  dependencies: Dependencies;
  linkedIssues: LinkedIssue[];

  // Enums with defaults
  priority: Priority;
  status: Status;

  // Dates
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date | null;
  resolutionDate?: Date | null;

  // Optional fields
  color?: string ;
  resolutionId?: number | null;
  votes: number;
  watchers: number;

  // Analytics and tracking arrays
  updateHistory: UpdateHistoryEntry[];
  timeTracking: TimeTracking;
  boardHistory: BoardHistoryEntry[];
  statusHistory: StatusHistoryEntry[];
  impediments: Impediment[];
  qualityMetrics: QualityMetrics;
  workLogs: WorkLog[];
}

// Utility types for different use cases
export type CreateIssueInput = Omit<
  Issue,
  | "_id"
  | "createdAt"
  | "updatedAt"
  | "issueID"
  | "votes"
  | "watchers"
  | "updateHistory"
  | "boardHistory"
  | "statusHistory"
  | "impediments"
  | "workLogs"
> & {
  // Make some fields optional for creation
  storyPoints?: number;
  priority?: Priority;
  status?: Status;
  dependencies?: Partial<Dependencies>;
  linkedIssues?: LinkedIssue[];
  timeTracking?: Partial<TimeTracking>;
  qualityMetrics?: Partial<QualityMetrics>;
};

export type UpdateIssueInput = Partial<
  Omit<Issue, "_id" | "issueID" | "createdAt">
>;

// For populated references (when you populate the ObjectId references)
export interface PopulatedIssue
  extends Omit<
    Issue,
    "creator" | "assignees" | "board_id" | "workspace_id" | "parent" | "epic"
  > {
  creator: {
    _id: string;
    name: string;
    email: string;
  };
  assignees: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  board_id?: {
    _id: string;
    name: string;
  } | null;
  workspace_id: {
    _id: string;
    name: string;
  };
  parent?: PopulatedIssue | null;
  epic?: PopulatedIssue | null;
}

export interface Credential {
  username: string;
  firstname: string;
  lastname: string;
  password: string;
  image: Image;
  email: string;
  title: string;
}

export interface LoginData {
  email: string; // User's email address
  password: string; // User's password
}

export type FilterState = {
  searchTerm: string;
  userIds: string[];
  myOnly: boolean;
  recent: boolean;
  // Add more filter properties as needed
};

export type BoardWithIssues = Board & {
  issues: (Issue)[];
};

// types/organization.ts
export interface Member {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Member" | "Viewer";
  avatarColor?: string;
}

export interface OrganizationSettingsProps {
  organizationName: string;
  members: Member[];
}

export type TimeUnit = "minutes" | "hours" | "days";

// app/lib/types.ts
export type priority = "high" | "medium" | "low";

export interface AssigneeData {
  name: string;
  color: string;
}

export interface TaskData {
  id: string;
  title: string;
  project: string;
  storyPoints: number;
  priority: priority;
  status: Status;
  assignee: AssigneeData;
}

export const StatusData = [
  "Backlog",
  "To Do",
  "In Progress",
  "In Review",
  "Done",
];

// ==========================================
// NOTIFICATION
// ==========================================

export type NotificationType =
  | "mention"
  | "comment"
  | "task_assigned"
  | "workspace_events"
  | "organisation_events"
  | "deadline"
  | "status_change"
  | "approval_request"
  | "file_shared"
  | "like"
  | "follow";

export interface Notification {
  _id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  actor: {
    userId: string;
    name: string;
    avatar?: string;
  };
  context: {
    entityId: string;
    entityType:
      | "issue"
      | "comment"
      | "workspace"
      | "organisation"
      | "file"
      | "user";
    entityTitle?: string;
    workspaceId?: string;
    organisationId?: string;
  };
  actionUrl: string;
  readBy: [string];
  readAt?: string;
  deletededBy: [string];
  priority: "low" | "normal" | "high" | "urgent";
  groupKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    unreadCount: number;
    total: number;
    hasMore: boolean;
    nextOffset: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

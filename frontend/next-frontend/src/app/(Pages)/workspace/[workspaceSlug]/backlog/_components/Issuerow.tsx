"use client";
import Icon, { priorityColors } from "@/src/helpers/icon";
import { Issue, priority, status, StatusData, User } from "@/src/helpers/type";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface epicDataProps {
  title?: string,
  color?: string,
}

export interface IssueRowProps {
  issue: Issue;
  epicData: epicDataProps;
  assignee: User | undefined;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onClick: () => void;
  isDragging: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------


const STATUS_COLORS: Record<string, string> = {
  "To Do": "bg-muted text-muted-foreground",
  "In Progress": "bg-primary/20 text-primary",
  "Review": "bg-accent text-accent-foreground",
  "Done": "bg-success/20 text-success-foreground",
  "Backlog": "bg-secondary text-secondary-foreground",
  "Cancelled": "bg-destructive/20 text-destructive",
  "On Hold": "bg-orange-500/20 text-orange-600",
};


// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function IssueRow({
  issue,
  epicData,
  onDragStart,
  onClick,
  assignee,
  isDragging,
}: IssueRowProps) {
  // Match casing with StatusData enum for lookup
  const statusColor = STATUS_COLORS[issue.status] || "bg-secondary text-secondary-foreground";
  const statusLabel =  issue.status;
  const priorityIcon = <Icon type={issue.priority} isPriority={true} size="sm" />;
//   const avatarInitials = issue.assignees?.substring(0, 2).toUpperCase() ?? null;

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      if (e.target !== e.currentTarget) return; // Don't trigger if interacting with child elements
      e.preventDefault();
      onClick();
    }
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Issue ${issue._id}: ${issue.title}. Status: ${statusLabel}. Priority: ${issue.priority}.`}
      className={[
        "flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors group focus:outline-none focus:ring-2 focus:ring-primary",
        isDragging ? "opacity-50 scale-95" : "",
      ].join(" ")}
    >
      {/* Issue Type Icon */}
      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-green-600">
        <Icon type={issue.issuetype.toLocaleLowerCase()} isIssueType size="sm" />
      </div>

      {/* Issue Key & Summary */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
            {issue.issueID}
          </span>
          <span className="text-sm text-foreground truncate">
            {issue.title}
          </span>
        </div>
      </div>

      {/* Epic Label Badge */}
      {(issue.issuetype === "Epic" || (issue.epic && epicData)) && (
        <span
          className="px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0 whitespace-nowrap text-white"
          style={{ 
            backgroundColor: issue.issuetype === "Epic" ? (issue.color || "#7A869A") : epicData?.color 
          }}
        >
          {issue.issuetype === "Epic" ? "EPIC" : epicData?.title?.toUpperCase()}
        </span>
      )}

      {/* Status Dropdown */}
      <select
        className="px-3 py-1 rounded text-xs font-medium bg-muted/50 text-foreground border border-transparent hover:border-border focus:outline-none focus:ring-2 focus:ring-primary flex-shrink-0"
        onClick={(e) => e.stopPropagation()} // Prevent opening detail panel
        defaultValue={issue.status}
        aria-label={`Status for ${issue.issueID}`}
      >
        {StatusData.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

       {/* Story Points */}
      {issue.storyPoints && (
        <div className="text-xs font-semibold text-foreground flex-shrink-0 w-8 text-center">
          {issue.storyPoints}
        </div>
      )}

            {/* Priority Icon */}
      <span
        className={`w-5 h-5 flex items-center justify-center flex-shrink-0 text-lg font-bold ${priorityColors[issue.priority.toLocaleLowerCase() as priority] || 'text-muted-foreground'}`}
        title={issue.priority}      >
        {priorityIcon}
      </span>

      {/* Assignee Avatar */}
      <div
        className="w-7 h-7 rounded-full bg-accent/30 text-accent text-xs font-semibold flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={(e) => e.stopPropagation()} // Prevent opening detail panel
        title={assignee?.username || 'Unassigned'}
      >
        {assignee ? assignee.username.charAt(0).toUpperCase() : '?'}
      </div>

    </div>
  );
}
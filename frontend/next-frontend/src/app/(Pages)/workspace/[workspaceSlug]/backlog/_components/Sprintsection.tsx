"use client";

import { useState } from "react";
import IssueRow from "./Issuerow";
import { BoardWithIssues, Issue, User } from "@/src/helpers/type";
import { formatMongoDate } from "@/src/helpers/date";
import JiraCreateIssueModal from "@/src/constants/createIssue";
import useIssues from "@/src/hooks/useIssues";
import { color } from "framer-motion";


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SprintSectionProps {
  sprint: BoardWithIssues; // Renamed from Sprint
  onDragStart: (e: React.DragEvent<HTMLDivElement>, issue: Issue, sourceSprintId: string) => void;
  onIssueSelect: (issue: Issue) => void;
  epics: Issue[];
  users: User[]
  draggedItem: { issue: Issue; source: string } | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SprintSection({
  sprint,
  users,
  epics,
  onDragStart,
  onIssueSelect,
  draggedItem,
}: SprintSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  // Expand active sprints by default
  const [isExpanded, setIsExpanded] = useState(
    new Date(sprint.startDate) >= new Date() ? true : false
  );
  const{ createIssue } = useIssues()

  const isActive =
    new Date(sprint.startDate) <= new Date() && new Date(sprint.endDate) >= new Date();
  const issueCount = sprint.issues?.length || 0;
  const inProgressCount = sprint.issues?.filter(i => i.status !== 'Done').length || 0;
  const completedCount = sprint.issues.filter((i) => i.status === "Done").length || 0;

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      {/* Sprint Header */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label={`${sprint.title}, ${issueCount} issues`}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors focus:outline-none group cursor-pointer"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <svg
            className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>

          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground">{sprint.title}</h3>
            {sprint.startDate && (
              <span className="text-xs text-muted-foreground">
                {formatMongoDate(sprint.startDate)}
                {sprint.endDate && ` - ${formatMongoDate(sprint.endDate)}`}
              </span>
            )}
            <span className="text-xs text-muted-foreground">({issueCount} issues)</span>
          </div>
        </div>

        {/* Status Badges and Actions */}
        <div className="flex items-center gap-4">
          {/* Status Indicators */}
          <div className="flex items-center rounded-full overflow-hidden border border-border text-xs font-semibold">
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600">{issueCount - completedCount - inProgressCount}</span>
            <span className="px-2 py-0.5 bg-blue-500/15 text-blue-600">{inProgressCount}</span>
            <span className="px-2 py-0.5 bg-green-500/15 text-green-600">{completedCount}</span>
          </div>

          {/* Action Buttons */}
          {isActive && (
            <button
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-foreground 
              border border-border hover:bg-muted/50 transition-colors"
            >
              Complete sprint
            </button>
          )}

          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="More options"
          >
            <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.5 1.5H9.5V3.5H10.5V1.5ZM10.5 8.5H9.5V10.5H10.5V8.5ZM10.5 15.5H9.5V17.5H10.5V15.5Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Issues List */}
      {isExpanded && (
        <div className="divide-y divide-border">
          {sprint.issues && sprint.issues.length > 0 ? (
            sprint.issues.map((issue) => (
              <li key={issue._id}>
                <IssueRow
                  issue={issue}
                  epicData={({
                     title: epics.find(e => (e._id === issue.epic))?.title,
                     color: epics.find(e => (e._id === issue.epic))?.color
                  })}
                  assignee = {users.find( u => u._id === issue.assignees)}
                  onDragStart={(e) => onDragStart(e, issue, sprint._id)}
                  onClick={() => onIssueSelect(issue)}
                  isDragging={draggedItem?.issue._id === issue._id}
                />
              </li>
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No issues in this sprint</p>
            </div>
          )}
        </div>
      )}
      <JiraCreateIssueModal epics={epics} users={users} onSubmit={(data) => createIssue({...data, workspace_id: sprint.workspace, board_id: sprint._id})} onClose={() => setIsOpen(false)}/>
    </div>
  );
}
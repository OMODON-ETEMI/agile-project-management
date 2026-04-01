"use client";

import { Issue, Priority, Status, StatusData, User } from "@/src/helpers/type";
import { useCallback, useEffect, useState } from "react";
import { Calendar, MoreVertical, X } from "lucide-react";
import AssigneeSelector from "@/src/features/board/Assignee";
import useIssues from "@/src/hooks/useIssues";
import DeleteModal from "@/src/constants/delete";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IssueDetailPanelProps {
  issue: Issue;
  users: User[];
  onClose: () => void;
}
// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function IssueDetailPanel({
  issue,
  users,
  onClose,
}: IssueDetailPanelProps) {
  const [localIssue, setLocalIssue] = useState(issue);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { updateIssue, deleteIssue } = useIssues()


  // When the parent passes a new issue, update our local state.
  useEffect(() => {
    setLocalIssue(issue);
    setIsEditingDescription(false);
  }, [issue]);

  const handleSave = useCallback((update: Partial<Issue>) => {
    updateIssue({issueId: issue._id as string, updates: update})
  }, [issue._id, updateIssue]);

  const handleDelete = useCallback(() => {
    deleteIssue({_id: issue._id as string})
    console.log("[handleDelete]", issue._id);
  }, [issue, deleteIssue]);

  const handleAssigneeChange = useCallback((userId: string | null) => {
    updateIssue({issueId: issue._id as string, updates: { assignees: userId }})
    setLocalIssue((prev) => ({ ...prev, assignees: userId }));
  }, [issue._id, updateIssue]);

  return (
    <aside className="w-[480px] h-full min-h-0 bg-background border-l border-border flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-border flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Issue Type + Key */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground uppercase">
              {localIssue.issuetype}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {localIssue._id?.slice(-8)}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-foreground break-words">
            {localIssue.title}
          </h2>
        </div>

        {/* Actions */}
        <div className="flex items-center">
          <button
            type="button"
            aria-label="More actions"
            className="p-2 rounded hover:bg-muted transition-colors"
          >
            <MoreVertical size={18} className="text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="p-2 rounded hover:bg-muted transition-colors"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="px-6 py-6 space-y-6">
          {/* Description */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">Description</h3>
              {!isEditingDescription && (
                <button
                  type="button"
                  onClick={() => setIsEditingDescription(true)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditingDescription ? (
              <div className="space-y-2">
                <textarea
                  value={localIssue.description || ""}
                  onChange={(e) =>
                    setLocalIssue((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={6}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add a description..."
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleSave({description: localIssue.description});
                      setIsEditingDescription(false);
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded hover:opacity-90"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLocalIssue(issue);
                      setIsEditingDescription(false);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="text-sm text-foreground whitespace-pre-wrap min-h-[60px] px-3 py-2 rounded hover:bg-muted/50 cursor-pointer"
                onClick={() => setIsEditingDescription(true)}
              >
                {localIssue.description || (
                  <span className="text-muted-foreground italic">
                    Add a description...
                  </span>
                )}
              </div>
            )}
          </section>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Details Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Details</h3>

            {/* Assignee */}
            <AssigneeSelector
              assignedUserId={localIssue.assignees || null}
              users={users}
              onAssigneeChange={(user_id) => handleAssigneeChange(user_id)}
              label="Assignee"
            />

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                Status
              </label>
              <select
                value={localIssue.status}
                onChange={(e) =>{
                  handleSave({status: e.target.value as Status})
                  setLocalIssue((prev) => ({ ...prev, status: e.target.value as Status}))
                }
                }
                className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {StatusData.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                Priority
              </label>
              <select
                value={localIssue.priority}
                onChange={(e) =>
                  handleSave({priority: e.target.value as Priority})
                }
                className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary capitalize"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Reporter */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                Reporter
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center">
                  {users
                    .find((u) => u.user_id === localIssue.reporter)
                    ?.username.substring(0, 2)
                    .toUpperCase() || "??"}
                </div>
                <span className="text-sm text-foreground">
                  {users.find((u) => u.user_id === localIssue.reporter)
                    ?.username || "Unknown"}
                </span>
              </div>
            </div>

            {/* Created Date */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                Created
              </label>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={14} />
                <span>
                  {new Date(localIssue.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Updated Date */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                Updated
              </label>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={14} />
                <span>
                  {new Date(localIssue.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Activity Section */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-4">Activity</h3>
            <div className="text-sm text-muted-foreground text-center py-8">
              No activity yet
            </div>
          </section>
        </div>
      </div>

      {/* Footer Actions */}
      <footer className="flex-shrink-0 px-6 py-4 border-t border-border flex gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
        >
          Delete
        </button>
      </footer>
      <DeleteModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
      />
    </aside>
  );
}
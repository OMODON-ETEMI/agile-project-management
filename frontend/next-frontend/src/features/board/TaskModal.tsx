"use client";

import {
  useEffect,
  useRef,
  useCallback,
  useId,
  type KeyboardEvent,
} from "react";
import type { Priority, IssueType } from "./BoardCard";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskDetail {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  issueType: IssueType;
  status: string;
  assignee?: string;
  /** ISO 8601 date string. */
  dueDate?: string;
  labels?: string[];
  children?: Subtask[];
}

export interface TaskModalProps {
  isOpen: boolean;
  task?: TaskDetail;
  isLoading?: boolean;
  onClose: () => void;
  onEditTask: (taskId: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TaskModal({
  isOpen,
  task,
  isLoading = false,
  onClose,
  onEditTask,
}: TaskModalProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // -------------------------------------------------------------------------
  // Focus management
  //
  // On open: move focus to the close button (first logical interactive element).
  // On close: focus returns to the trigger automatically via the browser's
  // built-in focus restoration when the element is removed from the DOM.
  //
  // Focus trap: Tab / Shift+Tab cycle is constrained to focusable descendants
  // of the modal container. Implemented without a library using a querySelectorAll
  // over known focusable selectors.
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (isOpen) {
      // Defer one frame so the element is painted before receiving focus.
      const id = requestAnimationFrame(() => closeButtonRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key !== "Tab") return;

      const container = containerRef.current;
      if (!container) return;

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled"));

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose]
  );

  // -------------------------------------------------------------------------
  // Backdrop click — only close when the backdrop itself is the target,
  // not when a click bubbles up from inside the panel.
  // -------------------------------------------------------------------------

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  // -------------------------------------------------------------------------
  // Guard: both rendering patterns (intercepting route + conditional mount)
  // must be handled by the caller. When used as a conditional mount, the
  // caller gates rendering on isOpen. When used in an intercepting route,
  // isOpen should always be true and onClose triggers router.back().
  // This guard handles the conditional-mount pattern.
  // -------------------------------------------------------------------------

  if (!isOpen) return null;

  const formattedDate = task?.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const avatarInitial = task?.assignee?.charAt(0).toUpperCase() ?? null;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
      // Backdrop is not interactive for AT — the dialog panel is the target.
      aria-hidden="false"
    >
      {/* Dialog panel */}
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={isLoading}
        onKeyDown={handleKeyDown}
        className="bg-background border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col"
      >
        {/* -------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* -------------------------------------------------------------- */}
        <div className="flex items-start justify-between p-6 border-b border-border sticky top-0 bg-background rounded-t-lg z-10">
          <div className="flex-1 min-w-0">
            <h2
              id={titleId}
              className="text-lg font-semibold text-foreground break-words"
            >
              {task?.title ?? "Task Details"}
            </h2>
            {task?.id && (
              <p className="text-xs text-muted-foreground mt-1">
                <span className="sr-only">Task ID: </span>
                {task.id}
              </p>
            )}
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close task details"
            className={[
              "p-2 rounded-lg ml-2 transition-colors",
              "hover:bg-muted",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            ].join(" ")}
          >
            <CloseIcon />
          </button>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Content                                                          */}
        {/* -------------------------------------------------------------- */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {isLoading ? (
            <TaskSkeleton />
          ) : (
            <>
              {/* Description */}
              <section aria-label="Description">
                <FieldLabel>Description</FieldLabel>
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {task?.description ?? "No description provided"}
                </p>
              </section>

              {/* Meta grid */}
              <section
                aria-label="Task metadata"
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <FieldLabel>Priority</FieldLabel>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize bg-primary/10 text-primary">
                    {task?.priority ?? "Unknown"}
                  </span>
                </div>

                <div>
                  <FieldLabel>Type</FieldLabel>
                  <p className="text-sm text-foreground capitalize">
                    {task?.issueType ?? "Task"}
                  </p>
                </div>

                <div>
                  <FieldLabel>Status</FieldLabel>
                  <p className="text-sm text-foreground">
                    {task?.status ?? "To Do"}
                  </p>
                </div>

                <div>
                  <FieldLabel>Due Date</FieldLabel>
                  {formattedDate && task?.dueDate ? (
                    <time
                      className="text-sm text-foreground"
                      dateTime={task.dueDate}
                    >
                      {formattedDate}
                    </time>
                  ) : (
                    <p className="text-sm text-muted-foreground">No due date</p>
                  )}
                </div>
              </section>

              {/* Assignee */}
              <section aria-label="Assignee">
                <FieldLabel>Assignee</FieldLabel>
                {task?.assignee && avatarInitial ? (
                  <div className="flex items-center gap-2">
                    <div
                      aria-hidden="true"
                      className="w-8 h-8 shrink-0 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold"
                    >
                      {avatarInitial}
                    </div>
                    <span className="text-sm text-foreground">
                      {task.assignee}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Unassigned</p>
                )}
              </section>

              {/* Labels */}
              {task?.labels && task.labels.length > 0 && (
                <section aria-label="Labels">
                  <FieldLabel>Labels</FieldLabel>
                  <ul
                    role="list"
                    className="flex flex-wrap gap-2"
                    aria-label="Task labels"
                  >
                    {task.labels.map((label) => (
                      <li key={label}>
                        <span className="px-2 py-1 bg-muted text-foreground text-xs rounded">
                          {label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Subtasks */}
              {task?.children && task.children.length > 0 && (
                <section aria-label="Subtasks">
                  <FieldLabel>
                    Subtasks ({task.children.length})
                  </FieldLabel>
                  <ul role="list" className="space-y-2">
                    {task.children.map((child) => (
                      <li
                        key={child.id}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <input
                          type="checkbox"
                          id={`subtask-${child.id}`}
                          // TODO: wire onSubtaskToggle callback when subtask
                          // completion becomes editable.
                          defaultChecked={child.completed}
                          aria-label={child.title}
                          className="mt-0.5 accent-primary"
                          readOnly
                        />
                        <label
                          htmlFor={`subtask-${child.id}`}
                          className={
                            child.completed
                              ? "line-through text-muted-foreground"
                              : ""
                          }
                        >
                          {child.title}
                        </label>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>

        {/* -------------------------------------------------------------- */}
        {/* Footer                                                           */}
        {/* -------------------------------------------------------------- */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/20 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className={[
              "px-4 py-2 text-sm font-medium text-foreground rounded-lg transition-colors",
              "hover:bg-muted",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            ].join(" ")}
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => task?.id && onEditTask(task.id)}
            disabled={!task?.id || isLoading}
            aria-disabled={!task?.id || isLoading}
            className={[
              "px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg transition-all",
              "hover:opacity-90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            ].join(" ")}
          >
            Edit Task
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
      {children}
    </p>
  );
}

function TaskSkeleton() {
  return (
    <div role="status" aria-label="Loading task details" className="space-y-4 animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-full" />
      <div className="h-4 bg-muted rounded w-2/3" />
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      className="w-5 h-5 text-foreground"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
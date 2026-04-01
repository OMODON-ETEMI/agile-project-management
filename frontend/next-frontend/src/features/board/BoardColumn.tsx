"use client";

import { useDroppable } from "@dnd-kit/core";
import BoardCard from "./BoardCard";
import { Issue } from "@/src/helpers/type";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------


export interface BoardColumnProps {
  id: string;
  title: string;
  cards: Issue[];
  /** Used to construct per-card hrefs: /org/[orgId]/board/[boardId]/task/[cardId] */
  orgId: string;
  boardId: string;
  onAddTask: (columnId: string) => void;
  onColumnOptions: (columnId: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BoardColumn({
  id,
  title,
  cards,
  onAddTask,
  onColumnOptions,
}: BoardColumnProps) {
  // Register column as a drop target — @dnd-kit/core
  const { setNodeRef, isOver } = useDroppable({ id });

  const cardCount = cards.length;

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  function handleAddTask() {
    onAddTask(id);
  }

  function handleColumnOptions() {
    onColumnOptions(id);
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <section
      aria-label={`${title} column, ${cardCount} ${cardCount === 1 ? "task" : "tasks"}`}
      className="bg-muted/30 rounded-lg p-4 min-h-96 max-h-[calc(100vh-180px)] flex-shrink-0 w-full md:w-80 flex flex-col"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Column header                                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          {title}
          <span
            aria-hidden="true"
            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium text-muted-foreground"
          >
            {cardCount}
          </span>
        </h3>

        <button
          type="button"
          onClick={handleColumnOptions}
          aria-label={`More options for ${title}`}
          className={[
            "p-1 rounded transition-colors",
            "hover:bg-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          ].join(" ")}
        >
          <MoreIcon />
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Cards drop zone                                                      */}
      {/* ------------------------------------------------------------------ */}
      <div
        ref={setNodeRef}
        role="list"
        aria-label={`Tasks in ${title}`}
        className={[
          "flex-1 overflow-y-auto space-y-3 rounded-md transition-colors",
          isOver ? "bg-primary/5 ring-2 ring-primary/30 ring-inset" : "",
        ].join(" ")}
      >
        {cardCount > 0 ? (
          cards.map((card) => (
            <div key={card._id} role="listitem">
              <BoardCard
                card={card}
                cardState="normal"
                href={`/issue/${card._id}`}
              />
            </div>
          ))
        ) : (
          <EmptyColumn onAddTask={handleAddTask} />
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Add task footer                                                      */}
      {/* ------------------------------------------------------------------ */}
      <button
        type="button"
        onClick={handleAddTask}
        aria-label={`Add new task to ${title}`}
        className={[
          "w-full mt-4 px-3 py-2 rounded-lg text-sm transition-colors",
          "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        ].join(" ")}
      >
        + Add Task
      </button>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EmptyColumn({ onAddTask }: { onAddTask: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <p className="text-sm text-muted-foreground mb-2">
        No tasks in this column
      </p>
      <button
        type="button"
        onClick={onAddTask}
        className={[
          "text-xs text-primary rounded px-2 py-1",
          "hover:underline",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        ].join(" ")}
      >
        Add Task
      </button>
    </div>
  );
}

function MoreIcon() {
  return (
    <svg
      className="w-4 h-4 text-muted-foreground"
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="6" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="18" cy="12" r="2" />
    </svg>
  );
}
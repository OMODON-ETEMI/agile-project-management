"use client";

import React, { useCallback, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import BoardColumn  from "../board/BoardColumn";
import BoardCard from "../board/BoardCard";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ColumnData {
  id: string;
  title: string;
  cards: Issue[];
}

import type { Issue } from "@/src/helpers/type";

export interface BoardViewProps {
  /**
   * Called after an optimistic reorder has already been applied locally.
   * Responsible for persisting the move server-side.
   * If it throws, the caller is expected to revert or invalidate.
   */
  onCardMove: (args: {
    cardId: string;
    toColumnId: string;
    toBoardId: string;
    newPosition: number;
  }) => Promise<void>;
  onAddTask: (columnId: string) => void;
  onColumnOptions: (columnId: string) => void;
  orgId?: string;
  boardId?: string;
  issues: Issue[];
  setIssues: React.Dispatch<React.SetStateAction<Issue[]>>;
  columns: ColumnData[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Locate which column a card currently lives in. */
function findColumnByCardId(
  columns: ColumnData[],
  cardId: string
): ColumnData | undefined {
  return columns.find((col) => col.cards.some((c) => c._id === cardId));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function IssueView({
  onCardMove,
  onAddTask,
  onColumnOptions,
  orgId,
  boardId,
  issues,
  setIssues,
  columns,
}: BoardViewProps) {

  // Track which card is mid-drag so DragOverlay can render a ghost.
  const [activeCard, setActiveCard] = useState<Issue | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  // Sensors: pointer (mouse/touch) + keyboard for a11y.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require 8px movement before drag starts — prevents misfire on click.
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // -------------------------------------------------------------------------
  // Drag handlers
  // -------------------------------------------------------------------------

  // `columns` are now supplied by the parent (BoardShell)

  const handleDragStart = useCallback(
    ({ active }: DragStartEvent) => {
      const sourceColumn = findColumnByCardId(columns, String(active.id));
      const card = sourceColumn?.cards.find((c) => c._id === active.id);
      setActiveCard(card ?? null);
      setActiveColumnId(sourceColumn?.id ?? null);
    },
    [columns]
  );

 const handleDragEnd = useCallback(
    async ({ active, over }: DragEndEvent) => {
      setActiveCard(null);
      setActiveColumnId(null);

      if (!over) return;

      const cardId = String(active.id);
      const overId = String(over.id);

      if (cardId === overId) return; // Dropped on itself

      const fromColumn = findColumnByCardId(columns, cardId);
      
      // ✅ 1. dnd-kit might drop on a COLUMN or on another CARD. We must handle both.
      let toColumn = columns.find((col) => col.id === overId); 
      if (!toColumn) {
        toColumn = findColumnByCardId(columns, overId); // Dropped on a card inside a column
      }

      if (!fromColumn || !toColumn) return;

      // ✅ 2. Find original issue to get its board_id
      const originalIssue = issues.find(i => String(i._id) === cardId);
      if (!originalIssue) return;

      // ✅ 3. Calculate new position
      let newIndex = toColumn.cards.length; // Default to bottom (Append)
      if (toColumn.id !== overId) {
        // We dropped directly on another card, get that card's exact index
        const hoverIndex = toColumn.cards.findIndex((c) => c._id === overId);
        if (hoverIndex !== -1) newIndex = hoverIndex;
      }

      // ✅ 4. Optimistic UI Update (Update local state immediately so UI feels snappy)
      const prevIssues = [...issues];
      setIssues((prev) => {
        const updated = [...prev];
        const issueIndex = updated.findIndex((it) => String(it._id) === cardId);
        if (issueIndex > -1) {
          // Temporarily update status and position locally
          updated[issueIndex] = { 
              ...updated[issueIndex], 
              status: toColumn.id as any,
              position: newIndex 
          };
        }
        return updated;
      });

      try {
        await onCardMove({
          cardId,
          toColumnId: toColumn.id,
          toBoardId: String((originalIssue as any).board_id) || boardId || "", // Fixed syntax error
          newPosition: newIndex,
        });
      } catch (err) {
        console.error("Optimistic update failed, reverting...", err);
        setIssues(prevIssues);
      }
    },
    [columns, onCardMove, issues, setIssues, boardId]
  );

  // -------------------------------------------------------------------------
  // Empty board state
  // -------------------------------------------------------------------------

  if (columns.length === 0) {
    return (
      <main className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center" role="status">
          <EmptyBoardIcon />
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No Board Data
          </h3>
          <p className="text-sm text-muted-foreground">
            Create a new board or select an existing one to get started
          </p>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <main
        aria-label="Board view"
        className="flex-1 overflow-x-auto bg-background"
      >
        <div className="flex gap-4 p-4 min-w-min">
          {columns.map((column) => (
            <BoardColumn
              key={column.id}
              id={column.id}
              title={column.title}
              cards={column.cards}
              orgId={orgId ?? ""}
              boardId={boardId ?? ""}
              onAddTask={onAddTask}
              onColumnOptions={onColumnOptions}
            />
          ))}
        </div>
      </main>

      {/*
       * DragOverlay renders the card ghost at the cursor during a drag.
       * It is portalled to document.body by dnd-kit, so z-index and
       * pointer-events are handled automatically.
       */}
      <DragOverlay>
        {activeCard && activeColumnId ? (
          <BoardCard
            card={activeCard}
            cardState="selected"
            href={`/org/${orgId ?? ""}/board/${boardId ?? ""}/task/${activeCard._id}`}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EmptyBoardIcon() {
  return (
    <svg
      className="mx-auto h-12 w-12 text-muted-foreground mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  );
}
"use client";

import React, { useState, useMemo, useEffect } from "react";
import BoardView, { type ColumnData } from "../issue/IssueView";
import type { Issue, IssueType, User } from "@/src/helpers/type";
import { status as STATUS_ORDER } from "@/src/helpers/type";
import TaskModal, { type TaskDetail } from "./TaskModal";
import useIssues from "@/src/hooks/useIssues";
import GlobalLoading from "@/src/app/loading";
import { useWorkspaceExtras } from "@/src/hooks/useWorkspace";

export interface BoardShellProps {
  workspaceId: string;
  initialIssues: Issue[]
  boardId: string;
}

export default function BoardShell({ workspaceId, initialIssues, boardId }: BoardShellProps) {
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [activeModal, setActiveModal] = useState<{ task: TaskDetail } | null>(null);
  const { users } = useWorkspaceExtras(workspaceId, { users: true, boards: false })
  const issueConfig = useMemo(() => ({ board_id: boardId }), [boardId]);

  // ✅ 1. Moved hook INSIDE the component
  const {
    moveIssue,
    issues: fetchedIssues,
    isLoading: isLoadingIssues,
    error: errorIssues
  } = useIssues(issueConfig);

  if (isLoadingIssues) return <GlobalLoading />

  const stableFetchedIssues = useMemo(() => JSON.stringify(fetchedIssues || []), [fetchedIssues]);

  useEffect(() => {
    setIssues(JSON.parse(stableFetchedIssues));
  }, [stableFetchedIssues]);

  const moveCardAction = async (args: {
    cardId: string;
    toColumnId: string;
    toBoardId: string;
    newPosition: number;
  }): Promise<void> => {
    moveIssue({
      issueId: args.cardId,
      board_id: args.toBoardId,
      position: args.newPosition,
      status: args.toColumnId,
    });
  };

  const derivedColumns = useMemo(() => {
    const groups: Record<string, ColumnData["cards"]> = {};
    issues.forEach((it) => {
      const key = String(it.status || "");
      const card = {
        _id: it._id,
        title: it.title,
        description: it.description,
        priority: it.priority || "Medium",
        issuetype: (it.issuetype || "Task") as IssueType,
        assignees: users.find((u: any) => u._id === it.assignees),
        epic: it.epic,
        issueID: it.issueID,
        color: it.color,
        dueDate: it.dueDate ? String(it.dueDate) : undefined,
        boardId: it.board_id, // Ensure boardId is captured
      };
      (groups[key] = groups[key] || []).push({ ...card, position: (it as any).position ?? 0 } as any);
    });

    const order = (STATUS_ORDER as unknown as string[])?.length
      ? (STATUS_ORDER as unknown as string[])
      : Object.keys(groups);

    return order.map((s) => {
      const cards = (groups[s] || []) as any[];
      cards.sort((a, b) => (a.position || 0) - (b.position || 0));
      return { id: s, title: s, cards } as ColumnData;
    });
  }, [issues, users]);

  if (errorIssues) {
    return (
      <div className="p-4 text-sm text-destructive">
        Error loading issues: {errorIssues.message}
      </div>
    );
  }


  return (
    <>
      <BoardView
        columns={derivedColumns}
        issues={issues}
        setIssues={setIssues}
        onCardMove={moveCardAction}
        onAddTask={console.log}
        onColumnOptions={console.log}
      />
      <TaskModal
        isOpen={activeModal !== null}
        task={activeModal?.task}
        isLoading={false}
        onClose={() => setActiveModal(null)}
        onEditTask={console.log}
      />
    </>
  );
}
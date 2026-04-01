"use client";

import { useState, useCallback, useMemo } from "react";
import { Board, BoardWithIssues, Issue, User } from "@/src/helpers/type";
import { useIssues } from "@/src/hooks/useIssues";
import BacklogView from "./BacklogView";
import {useWorkspace, useWorkspaceExtras} from "@/src/hooks/useWorkspace";
import useBoards from "@/src/hooks/useBoards";
import GlobalLoading from "@/src/app/loading";


export interface BacklogShellProps {
  workspaceId: string;
  initialBoards: BoardWithIssues[];
}

export default function BacklogShell({
  workspaceId,
  initialBoards,
}: BacklogShellProps) {

  const flattenedIssues = useMemo(() => {
        return initialBoards.flatMap(board => board.issues);
    }, [initialBoards]);

  const { workspaces, isLoading, workspaceError } = useWorkspace({searchParams: { slug: workspaceId }, enable: !!workspaceId})
  const workspace = workspaces?.find(w => w.slug === workspaceId);
  const workspaceIdfromHook = workspace?._id;
  const { users } = useWorkspaceExtras(workspaceIdfromHook, { users: true , boards: false})
  const { createBoard } = useBoards()

  const { moveIssue, issues: allIssues, epicData, epicLoading, epicError, error } = useIssues({
    workspaceId: workspaceIdfromHook,
    initialData: { data: flattenedIssues },
  });

  if (workspaceError || error || epicError) {
    <div>Error loading workspace: {workspaceError?.message || error?.message}</div>;
  }

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const handlecreate = (data: any) => {
    createBoard({
      title: data.title,
      type: 'Sprint',
      startDate: data.startDate,
      endDate: data.endDate,
      image: data.image,
      workspace: workspaceIdfromHook
    })
  }
  const boardsWithUpdatedIssues = useMemo(() => {
    const issuesByBoard = allIssues.reduce((acc, issue) => {
      const bId = issue.board_id || "backlog"; 
      if (!acc[bId]) acc[bId] = [];
      acc[bId].push(issue);
      return acc;
    }, {} as Record<string, Issue[]>);

    return initialBoards.map(board => ({
      ...board,
      issues: issuesByBoard[board._id] || []
    }));
  }, [allIssues, initialBoards]);

  const handleDragEnd = useCallback(
    async (args: { issue: Issue; targetBoard: string }) => {
      const { issue, targetBoard } = args;
      moveIssue({
        issueId: issue._id as string,
        board_id: targetBoard,
        status: issue.status, 
        position: issue.position, 
      })
    },
    [moveIssue]
  );

  if (isLoading || epicLoading) return <GlobalLoading />;

  return (
    <div className="flex flex-1 h-full overflow-hidden bg-background">
      <BacklogView
        sprints={boardsWithUpdatedIssues}
        users={users}
        epics={epicData}
        selectedIssue={selectedIssue}
        onDragEnd={handleDragEnd}
        onIssueSelect={setSelectedIssue}
        onCloseIssue={() => setSelectedIssue(null)}
        onCreateSprint={(data:Partial<Board>) => handlecreate(data)}
      />
    </div>
  );
}
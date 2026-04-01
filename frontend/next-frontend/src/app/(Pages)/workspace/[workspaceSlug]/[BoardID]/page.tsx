"use client"

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrgStore } from '@/src/hooks/store';
import { useBoards } from '@/src/hooks/useBoards';
import BoardShell from '@/src/features/board/BoardShell';
import Loading from '../loading';
import GlobalLoading from '@/src/app/loading';
import useIssues from '@/src/hooks/useIssues';


const BoardId: React.FC = () => {
  const params = useParams();

const boardID = Array.isArray(params.BoardID) 
  ? params.BoardID[0] 
  : params.BoardID;

  const {currentWorkspaceId} = useOrgStore();
  const { boards, isLoading } = useBoards({ searchParams: { _id: boardID } });
  const { issues, isLoading: issuesLoading} = useIssues( {board_id: boardID}  )
  
  if( isLoading || issuesLoading) {
    return <GlobalLoading />;
  }

  return (
    <div className="overflow-hidden pb-4">
      <BoardShell 
        workspaceId={currentWorkspaceId || ""}
        initialIssues={issues}
        boardId={boards._id}
      />
    </div>
  );
};

export default BoardId;
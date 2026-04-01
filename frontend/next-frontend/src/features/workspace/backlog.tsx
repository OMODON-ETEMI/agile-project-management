"use client";

import React, { useState } from 'react';
import { Board, BoardWithIssues, Issue, Workspace, } from "@/src/helpers/type";
import Breadcrumb from '@/src/components/ui/breadcrumb';
import { BacklogHeader } from '@/src/components/ui/backlog';
import { BreadcrumbCollapsed } from '@/src/hooks/beadcrumb';
import BoardHeader from '@/src/app/(Pages)/board/[BoardID]/_component/ListBoardHeader';
import IssueContent from '@/src/app/(Pages)/board/[BoardID]/_component/BoardContent';
import { isCompleted, isInProgress, isNotStarted } from '@/src/helpers/issueFilter';

interface BacklogProps {
  Boards: BoardWithIssues[]
  workspace: Workspace
}

export const Backlog = ({ Boards, workspace }: BacklogProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  return (
    <>
      <div className="bg-white min-h-screen">
        <BreadcrumbCollapsed label={workspace.title} />

        {/* Page Header */}
        <BacklogHeader />

        {/* Issue Section */}
        {Boards.map((board, index) => {
          const issueNo = board.issues.length
          const notStarted = board.issues
            .filter(issue => isNotStarted(issue.status))
            .reduce((accumulator, issue) => {
              return accumulator + issue.storyPoints
            }, 0)
          const incomplete = board.issues
            .filter(issue => isInProgress(issue.status))
            .reduce((accumulator, issue) => {
              return accumulator + issue.storyPoints
            }, 0)

          const completed = board.issues
            .filter(issue => isCompleted(issue.status))
            .reduce((accumulator, issue) => {
              return accumulator + issue.storyPoints
            }, 0)

          return (
            <div className="border-b border-gray-200" key={index}>
              <BoardHeader board={board}
                setExpandedSections={setExpandedSections}
                expandedSections={expandedSections}
                issueNo={issueNo}
                notStarted={notStarted}
                inComplete={incomplete}
                completed={completed} />
              <IssueContent issue={Boards} expanded={expandedSections[board._id]} />
            </div>
          )
        })}
      </div>
    </>
  )
}
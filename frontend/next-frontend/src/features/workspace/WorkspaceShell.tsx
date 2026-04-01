"use client";

import { useState, useCallback, ReactNode, useEffect } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import Sidebar from "./Siderbar";
import { type View } from "./Topbar";
import { Board, Workspace } from "@/src/helpers/type";
import { useWorkspace } from "@/src/hooks/useWorkspace";
import { useOrgStore } from "@/src/hooks/store";
import GlobalLoading from "@/src/app/loading";
import AppSettingsPage from "@/src/app/(Pages)/workspace/[workspaceSlug]/_components/appSettings";
import HelpPage from "@/src/app/(Pages)/workspace/[workspaceSlug]/_components/help";
import useBoards from "@/src/hooks/useBoards";
import { CreateSprintModal } from "@/src/app/(Pages)/workspace/[workspaceSlug]/backlog/_components/Createsprint";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WorkspaceShellProps {
  currentWorkspace: Workspace;
  boards: Board[];
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WorkspaceShell({
  currentWorkspace,
  boards,
  children,
}: WorkspaceShellProps) {

  const { BoardID } = useParams();
  const [view, setView] = useState<View>("board");
  const activeBoard = boards.find((board) => board._id === BoardID)?._id || "Backlog";
  const setWorkspaceID = useOrgStore((state) => state.setCurrentWorkspace);
  const existingWorkspaceID = useOrgStore((state) => state.currentWorkspaceId);

  useEffect(() => {
    if (currentWorkspace && currentWorkspace._id !== existingWorkspaceID) {
      setWorkspaceID(currentWorkspace._id);
    }
  }, [currentWorkspace]);

  const { workspaces, isLoading: workspacesLoading, workspaceError: workspacesError } = useWorkspace({ organisationId: currentWorkspace.organisation_id, enable: !!currentWorkspace.organisation_id });
  if (workspacesError) {
    return <div className="p-4 text-red-500">Error loading workspace: {workspacesError.message}</div>;
  }

  // -------------------------------------------------------------------------
  // Sidebar callbacks
  // -------------------------------------------------------------------------
  const handleSettings = () => {
    <AppSettingsPage />
  }

  const handleHelp = () => {
    <HelpPage />
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="flex h-full bg-background text-foreground">
      {workspacesLoading ? <GlobalLoading /> :
        <>
          <Sidebar
            workspaces={workspaces}
            boards={boards}
            activeBoardId={activeBoard}
            onSettings={handleSettings}
            onHelp={handleHelp}
          />

          <div className="flex-1 flex flex-col overflow-hidden">
            <div
              role="tabpanel"
              id={`panel-${view}`}
              aria-label={view === "board" ? "Board view" : "Backlog view"}
              className="flex-1 overflow-hidden"
            >
              {children}
            </div>
          </div>
        </>
      }
    </div>
  );
}
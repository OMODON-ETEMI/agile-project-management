"use client";

// =============================================================================
// context/WorkspaceContext.tsx
// Holds the currently active workspace chosen by the user.
// Completely separate from JiraDataContext — single responsibility.
// =============================================================================
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { JiraDataProvider } from "./metacontext";
import { Workspace } from "../helpers/type";
import {useWorkspace} from "../hooks/useWorkspace";


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------


interface WorkspaceContextValue {
  activeWorkspace:    Workspace | null;
  workspaces:         Workspace[];
  workspacesLoading:  boolean;
  setActiveWorkspace: (workspace: Workspace) => void;
  organisationId: string;
  setOrganisationId: (organisationId: string) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const WorkspaceContext = createContext<WorkspaceContextValue>({
  activeWorkspace:    null,
  workspaces:         [],
  workspacesLoading:  true,
  setActiveWorkspace: () => {},
  organisationId: "",
  setOrganisationId: () => {},
});

export function useWorkspaceContext() {
  return useContext(WorkspaceContext);
}

// ---------------------------------------------------------------------------
// Provider
// Fetches the list of workspaces the user has access to,
// then keeps track of which one is active.
// ---------------------------------------------------------------------------
export function WorkspaceProvider({ children }: { children: any}) {
  const [activeWorkspace,   setActiveWorkspaceRaw] = useState<Workspace | null>(null);
  const [organisationId, setOrganisationId] = useState<string>("");
  const { workspaces, workspaceError, isLoading: workspaceLoading} = useWorkspace({organisationId})
  // Fetch the list of workspaces once on mount
  // 3. Hydrate the active workspace ONLY ONCE when data arrives
  useEffect(() => {
    if (workspaces.length > 0 && !activeWorkspace) {
      const lastId = localStorage.getItem("active_workspace");
      const last = workspaces.find(w => w._id === lastId) ?? workspaces[0];
      setActiveWorkspaceRaw(last);
    }
  }, [workspaces, activeWorkspace]);

  // When user picks a workspace — persists across page refreshes
  const setActiveWorkspace = useCallback((workspace: Workspace) => {
    setActiveWorkspaceRaw(workspace);
    localStorage.setItem("active_workspace", workspace._id);
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{ activeWorkspace, workspaces, workspacesLoading: workspaceLoading , setActiveWorkspace, organisationId, setOrganisationId}}
    >
      {/*
        Key on activeWorkspace.id is the critical part:
        When the workspace changes, React unmounts + remounts JiraDataProvider,
        which wipes all old state and triggers a fresh fetch for the new workspace.
        No stale data from the previous workspace leaks through.
      */}
      {activeWorkspace ? (
        <JiraDataProvider
          key={activeWorkspace._id}
          config={{
            workspaceId: activeWorkspace._id,
            metaTtl:     60 * 60 * 1000,  // 1 hour
            sprintsTtl:   5 * 60 * 1000,  // 5 minutes
          }}
        >
          {children}
        </JiraDataProvider>
      ) : (
        <>{children}</>
      )}
    </WorkspaceContext.Provider>
  );
}

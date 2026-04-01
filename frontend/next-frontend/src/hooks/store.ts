import { create } from "zustand";

type OrgState = {
  currentOrgId: string | null;
  currentWorkspaceId: string | null;

  setCurrentOrg: (orgId: string) => void;
  setCurrentWorkspace: (workspaceId: string) => void;

  reset: () => void;
};

export const useOrgStore = create<OrgState>((set) => ({
  currentOrgId: null,
  currentWorkspaceId: null,

  setCurrentOrg: (orgId) =>
    set(() => ({
      currentOrgId: orgId,
      currentWorkspaceId: null, // reset workspace when org changes
    })),

  setCurrentWorkspace: (workspaceId) =>
    set(() => ({
      currentWorkspaceId: workspaceId,
    })),

  reset: () =>
    set(() => ({
      currentOrgId: null,
      currentWorkspaceId: null,
    })),
}));

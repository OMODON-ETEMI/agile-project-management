/**
 * ============================================================================
 * 🧠 WORKSPACE QUERY SYSTEM (PRODUCTION GRADE)
 * ----------------------------------------------------------------------------
 * - Stable query keys (NO object references)
 * - Separated concerns (no overloaded hooks)
 * - Safe enabled conditions
 * - Backward compatible with your existing usage
 * ============================================================================
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createWorkspace,
  searchWorkspace,
  recentWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addUserToWorkspace,
  removeUserFromWorkspace,
  UsersInWorkspace,
  BoardsInWorkspace,
} from "@/src/lib/api/workspace";
import type { Workspace } from "@/src/helpers/type";

/**
 * ============================================================================
 * 🔑 QUERY KEYS (STRICT + SERIALIZABLE)
 * ============================================================================
 */
const workspaceKeys = {
  all: ["workspaces"] as const,
  byId: (id?: string) => ["workspaces", "detail", id] as const,
  byOrg: (orgId?: string) => ["workspaces", "org", orgId] as const,
  search: (slug?: string) => ["workspaces", "search", slug] as const,
  recent: () => ["workspaces", "recent"] as const,
  users: (workspaceId?: string) => ["workspaces", "users", workspaceId] as const,
  boards: (workspaceId?: string) => ["workspaces", "boards", workspaceId] as const,
};

/**
 * ============================================================================
 * 📦 NORMALIZER (keeps your original response handling)
 * ============================================================================
 */
const normalizeList = (resp: any): Workspace[] => {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp;
  if (resp.data && Array.isArray(resp.data)) return resp.data;
  if (resp.workspace && Array.isArray(resp.workspace)) return resp.workspace;
  if (resp.workspaces && Array.isArray(resp.workspaces)) return resp.workspaces;
  return [resp];
};

/**
 * ============================================================================
 * 🔍 QUERIES
 * ============================================================================
 */

// Get workspace by ID
export function useWorkspaceById(workspaceId?: string) {
  return useQuery({
    queryKey: workspaceKeys.byId(workspaceId),
    queryFn: () => searchWorkspace({ _id: workspaceId }),
    enabled: !!workspaceId,
  });
}

// Get workspaces by organisation
export function useWorkspaceByOrg(organisationId?: string) {
  return useQuery({
    queryKey: workspaceKeys.byOrg(organisationId),
    queryFn: () => searchWorkspace({ organisation_id: organisationId }),
    enabled: !!organisationId,
  });
}

// Search workspace (slug, filters, etc.)
export function useWorkspaceSearch(slug?: string) {
  return useQuery({
    queryKey: workspaceKeys.search(slug),
    queryFn: () => searchWorkspace({ slug }),
    enabled: !!slug,
  });
}

// Recent workspaces
export function useRecentWorkspaces(enable = false) {
  return useQuery({
    queryKey: workspaceKeys.recent(),
    queryFn: recentWorkspace,
    enabled: enable,
    staleTime: 60_000,
  });
}

// Users + Boards (extras)
export function useWorkspaceExtras(workspaceId?: string, options = { users: false, boards: false }) {
  const usersQuery = useQuery({
    queryKey: workspaceKeys.users(workspaceId),
    queryFn: () => UsersInWorkspace(workspaceId || ""),
    enabled: !!workspaceId && options.users,
  });

  const boardsQuery = useQuery({
    queryKey: workspaceKeys.boards(workspaceId),
    queryFn: () => BoardsInWorkspace(workspaceId || ""),
    enabled: !!workspaceId && options.boards,
  });

  return {
    users: usersQuery.data || [],
    boards: boardsQuery.data?.data || [],
    usersLoading: usersQuery.isLoading,
    boardsLoading: boardsQuery.isLoading,
  };
}

/**
 * ============================================================================
 * ⚡ MUTATIONS
 * ============================================================================
 */
export function useWorkspaceMutations() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
  };

  const createMutation = useMutation({
    mutationFn: createWorkspace,
    onSettled: invalidateAll,
  });

  const updateMutation = useMutation({
    mutationFn: updateWorkspace,
    onSettled: invalidateAll,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWorkspace,
    onSettled: invalidateAll,
  });

  const addUserMutation = useMutation({
    mutationFn: addUserToWorkspace,
    onSettled: invalidateAll,
  });

  const removeUserMutation = useMutation({
    mutationFn: removeUserFromWorkspace,
    onSettled: invalidateAll,
  });

  return {
    createWorkspace: createMutation.mutate,
    updateWorkspace: updateMutation.mutate,
    deleteWorkspace: deleteMutation.mutate,
    addUser: addUserMutation,
    removeUser: removeUserMutation,
  };
}

/**
 * ============================================================================
 * 🧩 BACKWARD-COMPAT WRAPPER (YOUR ORIGINAL API)
 * ----------------------------------------------------------------------------
 * This keeps your existing calls working:
 * useWorkspace({ organisationId })
 * useWorkspace({ searchParams: { slug } })
 * ============================================================================
 */
interface UseWorkspaceOptions {
  workspaceId?: string;
  organisationId?: string;
  searchParams?: Partial<Workspace>;
  enable?: boolean;
}

export function useWorkspace(options: UseWorkspaceOptions = {}) {
  const { workspaceId, organisationId, searchParams, enable = true } = options;

  const byId = useWorkspaceById(enable ? workspaceId : undefined);
  const byOrg = useWorkspaceByOrg(enable ? organisationId : undefined);
  const bySearch = useWorkspaceSearch(enable ? searchParams?.slug : undefined);

  let data: any;

  if (searchParams?.slug) data = bySearch.data;
  else if (workspaceId) data = byId.data;
  else if (organisationId) data = byOrg.data;

  return {
    workspaces: normalizeList(data),
    isLoading: byId.isLoading || byOrg.isLoading || bySearch.isLoading,
    workspaceError: byId.error || byOrg.error || bySearch.error,
  };
}
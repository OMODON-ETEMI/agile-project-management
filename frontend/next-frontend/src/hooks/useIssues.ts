import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createIssue,
  searchIssue,
  updateIssueMetadata,
  transitionIssueStatus,
  moveIssue,
  reorderColumn,
  deleteIssue,
  getEpics,
  addComment,
  getIssueComments,
} from "@/src/lib/api/issue";
import { type Issue, type Status } from "@/src/helpers/type";

interface UseIssuesOptions {
  _id?: string
  board_id?: string;
  workspaceId?: string;
  status?: Status;
  enable?: boolean;
  initialData?: { data : Issue[]};
}

interface UpdateIssueArgs {
  issueId: string;
  updates: Partial<Issue>;
}

interface TransitionIssueArgs {
  issueId: string;
  status: string;
}

interface MoveIssueArgs {
  issueId: string;
  board_id: string;
  status: string;
  position: number;
}

interface ReorderColumnArgs {
  board_id: string;
  status: string;
  orderedIssueIds: string[];
}

interface AddCommentArgs {
  issueId: string;
  body: string;
}


export function useIssues(options: UseIssuesOptions = {}) {
  const { board_id, _id, workspaceId, status, enable = true, initialData } = options;
  const queryClient = useQueryClient();
  const ISSUES_QUERY_KEY = ["issues", { board_id, workspaceId, status }];
  const EPIC_QUERY_KEY = ["epic", {workspaceId}]

  // ---------------------------------------------------------------------------
  // QUERIES
  // ---------------------------------------------------------------------------

  // Search / Fetch Issues
  const { data: issuesData, isLoading, error, refetch, } = useQuery({
    queryKey: ISSUES_QUERY_KEY,
    queryFn: () =>
      searchIssue({
        _id: _id,
        board_id: board_id,
        workspace_id: workspaceId,
        status,
      }),
    enabled: enable && (!!workspaceId || !!board_id || !!_id),
    staleTime: 30_000, // 30 seconds for issues (more volatile than boards/workspaces)
    initialData,
  });

  // Search / Fetch Issues
  const { 
    data: epicData, 
    isLoading: epicLoading,
    error: epicError } = useQuery({
    queryKey: EPIC_QUERY_KEY,
    queryFn: () =>
      getEpics(workspaceId as string),
    enabled: !!workspaceId,
    staleTime: 5*60*1000,
  });

  // ---------------------------------------------------------------------------
  // HELPER: Optimistic Update
  // ---------------------------------------------------------------------------

  const updateCacheOptimistic = (
    updater: (old: any) => any
  ) => {
    queryClient.cancelQueries({ queryKey: ISSUES_QUERY_KEY });
    const previous = queryClient.getQueryData(ISSUES_QUERY_KEY);
    queryClient.setQueryData(ISSUES_QUERY_KEY, updater);
    return { previous };
  };

  const onErrorRollback = (context: any) => {
    if (context?.previous) {
      queryClient.setQueryData(ISSUES_QUERY_KEY, context.previous);
    }
  };

  // ---------------------------------------------------------------------------
  // MUTATIONS
  // ---------------------------------------------------------------------------

  // Create Issue
  const createMutation = useMutation({
    mutationFn: createIssue,
    onMutate: async (newIssue: Partial<Issue>) => {
      const ctx = updateCacheOptimistic((old: any) => {
        const list = old?.data || [];
        const boardIssues = list.filter((i: Issue) => i.board_id === newIssue.board_id);

        const nextPosition = boardIssues.length > 0 
        ? Math.max(...boardIssues.map((i: Issue) => i.position || 0)) + 1 
        : 0;

        const issueWithPos = { ...newIssue, position: nextPosition };
        return { ...old, data: [issueWithPos, ...list] };
      });
      return ctx;
    },
    onError: (_err, _vars, context: any) => {
      onErrorRollback(context);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["issues"] });
      await queryClient.invalidateQueries({ queryKey: ["epic"] });
    },
  });

  // Add Comment
  const addCommentMutation = useMutation({
  mutationFn: ({ issueId, body }: AddCommentArgs) =>
    addComment(issueId, body),

  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ISSUES_QUERY_KEY });
  },
});

  // Update Issue
  const updateMutation = useMutation({
    mutationFn: ({ issueId, updates }: UpdateIssueArgs) => updateIssueMetadata(issueId, updates),
    onMutate: async (args: UpdateIssueArgs) => {
      const ctx = updateCacheOptimistic((old: any) => {
        const list = old?.data || [];
        return {
          ...old,
          data: list.map((issue: Issue) =>
            issue._id === args.issueId
              ? { ...issue, ...args.updates }
              : issue
          ),
        };
      });
      return ctx;
    },
    onError: (_err, _vars, context: any) => {
      onErrorRollback(context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ISSUES_QUERY_KEY });
    },
  });

    // Update Issue
  const transitionIssueMutation = useMutation({
    mutationFn: ({ issueId, status }: TransitionIssueArgs) => transitionIssueStatus(issueId, status),
    onMutate: async (args: TransitionIssueArgs) => {
      const ctx = updateCacheOptimistic((old: any) => {
        const list = old?.data || [];
        return {
          ...old,
          data: list.map((issue: Issue) =>
            issue._id === args.issueId
              ? { ...issue, status: args.status }
              : issue
          ),
        };
      });
      return ctx;
    },
    onError: (_err, _vars, context: any) => {
      onErrorRollback(context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ISSUES_QUERY_KEY });
    },
  });

    // Update Issue
  const moveIssueMutation = useMutation({
    mutationFn: ({ issueId, board_id, status, position}: MoveIssueArgs) => moveIssue({ issueId, board_id, status, position }),
    onMutate: async (args: MoveIssueArgs) => {
      const ctx = updateCacheOptimistic((old: any) => {
        const list = old?.data || [];
        return {
          ...old,
          data: list.map((issue: Issue) =>
            issue._id === args.issueId
              ? { ...issue, ...args }
              : issue
          ),
        };
      });
      return ctx;
    },
    onError: (_err, _vars, context: any) => {
      onErrorRollback(context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ISSUES_QUERY_KEY });
    },
  });

    // Update Issue
  const reorderColumnMutation = useMutation({
    mutationFn: ({ board_id, status, orderedIssueIds }: ReorderColumnArgs) => reorderColumn({ board_id, status, orderedIssueIds }),
    onMutate: async ({board_id, status, orderedIssueIds}: ReorderColumnArgs) => {
      const ctx = updateCacheOptimistic((old: any) => {
        const list = old?.data || [];
        return {
          ...old,
          data: list.map((issue: Issue) =>
            orderedIssueIds.includes(issue._id as string) && issue.board_id === board_id && issue.status === status
              ? { ...issue, position: orderedIssueIds.indexOf(issue._id as string) }
              : issue
          ),
        };
      });
      return ctx;
    },
    onError: (_err, _vars, context: any) => {
      onErrorRollback(context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ISSUES_QUERY_KEY });
    },
  });

  // Delete Issue
  const deleteMutation = useMutation({
    mutationFn: deleteIssue,
    onMutate: async (issueToDelete: {_id: string}) => {
      const ctx = updateCacheOptimistic((old: any) => {
        const list = old?.data || [];
        return {
          ...old,
          data: list.filter((issue: Issue) => issue._id !== issueToDelete._id),
        };
      });
      return ctx;
    },
    onError: (_err, _vars, context: any) => {
      onErrorRollback(context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ISSUES_QUERY_KEY });
    },
  });

  // ---------------------------------------------------------------------------
  // DATA PREPARATION
  // ---------------------------------------------------------------------------

  const issues: Issue[] = issuesData?.data || [];

  // ---------------------------------------------------------------------------
  // RETURN
  // ---------------------------------------------------------------------------

  return {
    // Data
    issues,
    epicData,

    // Loading & Error states
    isLoading,
    isAddingComment: addCommentMutation.isPending,
    epicLoading,
    error,
    epicError,

    // Refetch
    refetch,

    // Mutations
    createIssue: createMutation.mutate,
    createIssueAsync: createMutation.mutateAsync,
    addComment: addCommentMutation.mutate,
    updateIssue: updateMutation.mutate,
    deleteIssue: deleteMutation.mutate,
    transitionIssue: transitionIssueMutation.mutate,
    moveIssue: moveIssueMutation.mutate,
    reorderColumn: reorderColumnMutation.mutate,
    // batchUpdateIssues: batchUpdateMutation.mutate, // For bulk moves/reorders

    // Mutation states (for loading indicators)
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTransitioning: transitionIssueMutation.isPending,
    isMoving: moveIssueMutation.isPending,
    isReordering: reorderColumnMutation.isPending,
    // isBatchUpdating: batchUpdateMutation.isPending,

    searchIssue: (criteria: Partial<Issue>) => searchIssue(criteria), // Expose search for ad-hoc queries
  };
}


export default useIssues;

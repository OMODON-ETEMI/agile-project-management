import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBoard, searchBoard, updateBoard, deleteBoard } from "@/src/lib/api/board";
import type { Board, BoardWithIssues } from "@/src/helpers/type";

interface UseBoardsOptions {
  searchParams: Partial<Board>;
  enable?: boolean;
}

export function useBoards({ searchParams = {}, enable = true }: UseBoardsOptions = { searchParams: {}, enable: true }) {
  const queryClient = useQueryClient();
  const QUERY_KEY = ["boards", { searchParams }];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => searchBoard(searchParams),
    enabled: enable && Object.keys(searchParams).length > 0,
    staleTime: 60_000,
  });

  // const boards: Board[] = data?.data || [];

  // Helper to snapshot and update cache optimistically
  const updateCacheOptimistic = (updater: (old: any) => any) => {
    queryClient.cancelQueries({ queryKey: QUERY_KEY });
    const previous = queryClient.getQueryData(QUERY_KEY);
    queryClient.setQueryData(QUERY_KEY, updater);
    return { previous };
  };

  // Create
  const createMutation = useMutation({
    mutationFn: createBoard,
    onMutate: async (newBoard: Partial<Board>) => {
      const ctx = updateCacheOptimistic((old: any) => {
        const list = old?.data || [];
        return { ...old, data: [newBoard, ...list] };
      });
      return ctx;
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) queryClient.setQueryData(QUERY_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: updateBoard,
    onMutate: async (updatedBoard: Board) => {
      const ctx = updateCacheOptimistic((old: any) => {
        const list = old?.data || [];
        return {
          ...old,
          data: list.map((b: Board) => (b._id === updatedBoard._id ? { ...b, ...updatedBoard } : b)),
        };
      });
      return ctx;
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) queryClient.setQueryData(QUERY_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: deleteBoard,
    onMutate: async (boardToDelete: Board) => {
      const ctx = updateCacheOptimistic((old: any) => {
        const list = old?.data || [];
        return { ...old, data: list.filter((b: Board) => b._id !== boardToDelete._id) };
      });
      return ctx;
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) queryClient.setQueryData(QUERY_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  // Search by title (ad-hoc)
  async function searchByTitle(title: string) {
    return searchBoard({ title });
  }

  const boards: BoardWithIssues = data || []

  return {
    boards,
    isLoading,
    error,
    refetch,
    createBoard: createMutation.mutate,
    updateBoard: updateMutation.mutate,
    deleteBoard: deleteMutation.mutate,
    searchByTitle,
  };
}

export default useBoards;

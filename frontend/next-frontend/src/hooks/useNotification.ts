import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/src/lib/api/notification";
import { Notification } from "../helpers/type";
import { useWebSocket } from "../helpers/websocket-context";
import { useClientApi } from "../lib/api/csrAPi";

interface UseNotificationsOptions {
  recipientId?: string;
  limit?: number;
  unreadOnly?: boolean;
  types?: string[];
  enable?: boolean;
  enableRealtime?: boolean; // New option to control real-time subscription
}

/**
 * Custom hook to manage notification fetching, caching, and real-time updates.
 * @param options - Configuration for filtering and pagination.
 */
export function useNotifications(options: UseNotificationsOptions) {
  const { recipientId, limit = 20, unreadOnly = false, types, enable = true, enableRealtime = true } = options;

  const api = useClientApi();
  // 1. Access the global socket and the toast setter from Context
  // We don't need 'realtimeNotification' state here, only the setter to trigger the Toast.
  const { socket, setRealtimeNotification } = useWebSocket();
  const queryClient = useQueryClient();

  // Define the Query Key centrally so all mutations/fetchers use the exact same cache entry
  const QUERY_KEY = ["notifications", { limit, unreadOnly, types, recipientId }];

  // ---------------------------------------------------------------------------
  // 2. DATA FETCHING (Initial Load)
  // ---------------------------------------------------------------------------
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () =>
      notificationApi.getNotifications(api, { recipientId, limit, offset: 0, unreadOnly, types }),
    staleTime: 60000, // Keep data fresh for 60 seconds
    enabled: !!recipientId && enable,  // Only fetch if we have a user ID and enable is true
  });

  // ---------------------------------------------------------------------------
  // 3. OPTIMISTIC MUTATIONS (Instant UI Updates)
  // ---------------------------------------------------------------------------

  // Helper: Common cache update logic to avoid code duplication
  const updateCache = (updateFn: (old: any) => any) => {
    // Cancel any outgoing refetches so they don't overwrite our optimistic update
    queryClient.cancelQueries({ queryKey: QUERY_KEY });
    
    // Snapshot the previous value
    const previousData = queryClient.getQueryData(QUERY_KEY);

    // Optimistically update to the new value
    queryClient.setQueryData(QUERY_KEY, updateFn);

    // Return a context object with the snapshot
    return { previousData };
  };

  // Helper: Common error handling
  const onError = (_err: any, _vars: any, context: any) => {
    // If the mutation fails, use the context returned from onMutate to roll back
    if (context?.previousData) {
      queryClient.setQueryData(QUERY_KEY, context.previousData);
    }
  };

  // Helper: Common success handling
  const onSuccess = () => {
    // Always refetch after error or success to ensure cache is in sync with server
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
  };

  // Mutation: Mark Single as Read
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(api, id),
    onMutate: async (notificationId) => {
      return updateCache((old: any) => {
        if (!old?.data?.notifications) return old;

        let currentUserId = recipientId; // Ensure we have the correct user ID in scope for the update logic

        // 1. Find the specific notification first to check its current state
        const target = old.data.notifications.find((n: any) => n._id === notificationId);
        
        // 2. If it's already read, don't change anything (prevents negative unreadCount)
        const isAlreadyRead = target?.readBy.includes(currentUserId);

        return {
          ...old,
          data: {
            ...old.data,
            notifications: old.data.notifications.map((n: Notification) =>
              n._id === notificationId
                ? { 
                    ...n, 
                    readBy: isAlreadyRead ? n.readBy : [...n.readBy, currentUserId], 
                    readAt: new Date().toISOString() 
                  }
                : n
            ),
            // Only decrement the count if it wasn't already read
            unreadCount: !isAlreadyRead 
              ? Math.max(0, (old.data.unreadCount || 0) - 1) 
              : old.data.unreadCount,
          },
        };
      });
    },
    onError,
    onSuccess,
  });

  // Mutation: Mark All as Read
  const markAllAsReadMutation = useMutation<any, Error, void>({
    mutationFn: () => notificationApi.markAllAsRead(api),
    onMutate: async () => {
      return updateCache((old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            notifications: old.data.notifications.map((n: Notification) => ({
              ...n,
              readBy: [...n.readBy, n.recipientId],
              readAt: new Date().toISOString(),
            })),
            unreadCount: 0,
          },
        };
      });
    },
    onError,
    onSuccess,
  });

  // Mutation: Delete Notification
  const deleteNotificationMutation = useMutation({
    mutationFn: (id: string) => notificationApi.deleteNotification(api, id),
    onMutate: async (notificationId) => {
      return updateCache((old: any) => {
        if (!old?.data) return old;
        const target = old.data.notifications.find((n: Notification) => n._id === notificationId);
        return {
          ...old,
          data: {
            ...old.data,
            notifications: old.data.notifications.filter((n: Notification) => n._id !== notificationId),
            total: (old.data.total || 0) - 1,
            // Only decrease unread count if the deleted item was actually unread
            unreadCount: target?.isRead
              ? old.data.unreadCount
              : Math.max(0, (old.data.unreadCount || 0) - 1),
          },
        };
      });
    },
    onError,
    onSuccess,
  });

  // Mutation: Clear Read
  const clearReadMutation = useMutation({
    mutationFn: (ids: string | string[]) => notificationApi.clearRead(api, ids),
    onSuccess, // No optimistic update needed here, just refetch
  });

  // ---------------------------------------------------------------------------
  // 4. REAL-TIME SUBSCRIPTION
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Safety check: ensure socket and recipient exist before listening
    if (!socket || !recipientId || !enableRealtime) return;

    const handleNewNotification = (notification: Notification) => {
      // A. Push to Global Toast (via Context)
      setRealtimeNotification(notification);

      // B. Update the Query Cache manually so the list updates without a refetch
      queryClient.setQueryData(QUERY_KEY, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            // Add new notification to the top of the list
            notifications: [notification, ...old.data.notifications],
            total: (old.data.total || 0) + 1,
            unreadCount: (old.data.unreadCount || 0) + 1,
          },
        };
      });

      // C. Ensure unread count in other components (like Navbar badges) is updated
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    };

    // Attach listener
    socket.on("notification:new", handleNewNotification);

    // Cleanup listener on unmount or dependency change
    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [socket, recipientId, enableRealtime, queryClient, setRealtimeNotification, QUERY_KEY]); 
  // Note: QUERY_KEY is an array, but React Query handles deep comparison for deps usually. 
  // If linter complains, you can JSON.stringify it or memoize it, but this is usually safe in modern React Query.

  // ---------------------------------------------------------------------------
  // 5. DATA PREPARATION
  // ---------------------------------------------------------------------------
  const notifications = notificationsData?.data.notifications || [];
  // Use the count from the main list query to ensure sync
  const unreadCount = notificationsData?.data.unreadCount || 0; 

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    clearRead: clearReadMutation.mutate,
  };
}
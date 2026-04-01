
import { useQuery, useMutation, useQueryClient, QueryClient, useQueries } from "@tanstack/react-query"
import { workspaceListKey } from "@/src/lib/queryKeys"
import { allOrganisation, createOrganisation, deleteOrganisation, OrganisationMembers, SearchOrgansationMembers, updateOrganisation, updateUserOrganisation, updateUserRoleOrganisation } from "./organisation"
import { Notification, NotificationsResponse, Organisation, User, Workspace } from "@/src/helpers/type"
import { notificationApi } from "./notification";
import { searchWorkspace } from "./workspace";
import { UserData } from "@/src/Authentication/user";
import { getAccessToken } from "../auth-util";
import { AArrowUp } from "lucide-react";



// --- React Query Hooks ---

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry:1,
      refetchOnWindowFocus: false,
    },
  },
});


// Queries

// User
export const useUserQuery = () => 
  useQuery<User>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const token = await getAccessToken()
      if (!token) return null
      return await UserData(token)
    },
    staleTime: Infinity
  })

// ORGANISATIONS
export const useOrganisations = () =>
  useQuery<Organisation[]>({
    queryKey: ["allOrganisations"],
    queryFn: () => allOrganisation(),
    staleTime: 5 * 60 * 1000,
  })

export const useOrganisationMembers = (orgId?: string) =>
  useQuery<User[]>({
    queryKey: ["organizationMembers", orgId],
    queryFn: () => OrganisationMembers(orgId || ""),
    enabled: !!orgId, // only runs when orgId is defined
    staleTime: 5 * 60 * 1000,
  })

export const userSearch = (orgId: string, query: string) => 
  useQuery<User[]>({
    queryKey: ["SearchOrganizationMembers", orgId, query],
    queryFn: () => SearchOrgansationMembers(orgId, query),
    enabled: !!orgId && !!query, // only runs when orgId nd query is defined
  })

// Mutations
export const useCreateOrganisation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: Partial<Organisation>) => createOrganisation(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOrganisations"] })
    },
  })
}

export const useDeleteOrganisation = (onDeleted?: () => void) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orgId: string) => deleteOrganisation(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOrganisations"] })
      if (onDeleted) onDeleted()
    },
  })
}

export const useUpdateOrganisation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: Partial<Organisation>) => updateOrganisation(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOrganisations"] })
    },
  })
}

export const useUserRoleUpdateOrganisation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: Record<string, string>) => updateUserRoleOrganisation(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizationMembers"] })
    },
  })
}

export const useUserUpdateOrganisation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ formData, type }: { formData: Record<string, string>; type: string }) => updateUserOrganisation(formData, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizationMembers"] })
    },
  })
}

// WORKSPACE
export const useWorkspaceQueries = (organisation: Organisation[]) =>
    useQueries({
    queries: organisation.map(org => ({
      queryKey: workspaceListKey(org._id),
      queryFn: async () => {
        return await searchWorkspace({ organisation_id: org._id });
      },
      enabled: !!org._id, // only run if id is available
      staleTime: 5 * 60 * 1000,
    })),
  });

export const useSearchWorkspaces = (query: Partial<Workspace>) =>
  useQuery<Workspace[]>({
    queryKey: ["searchWorkspaces", query],
    queryFn: () => searchWorkspace(query),
    enabled: !!query,
  })

// Mutations
export const useCreateWorkspace = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: Partial<Workspace>) => createOrganisation(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["searchWorkspaces"] })
    },
  })
}


// // NOTIFICATIONS
//   // Fetch notifications
//  export const useNotificationsn = (limit?: number, unreadOnly?: boolean, types?: string[]) => useQuery<NotificationsResponse>({
//     queryKey: ["notifications", { limit, unreadOnly, types }],
//     queryFn: () => notificationApi.getNotifications({ limit, offset: 0, unreadOnly, types }),
//     staleTime: 30000, // 30 seconds
//   });

//   // Fetch unread count
//   export const useUnread_notification = () =>  useQuery({
//     queryKey: ["notifications", "unread-count"],
//     queryFn: () => notificationApi.getUnreadCount(),
//     refetchInterval: 60000, // Refetch every minute
//   });

//   // Mark as read mutation
//   export const markAsReadMutation = useMutation({
//     mutationFn: notificationApi.markAsRead,
//     onMutate: async (notificationId) => {
//       // Optimistic update
//       await queryClient.cancelQueries({ queryKey: ["notifications"] });
//       const previousData = queryClient.getQueryData(["notifications"]);

//       queryClient.setQueryData(["notifications"], (old: any) => {
//         if (!old) return old;
//         return {
//           ...old,
//           data: {
//             ...old.data,
//             notifications: old.data.notifications.map((n: Notification) =>
//               n._id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
//             ),
//             unreadCount: Math.max(0, old.data.unreadCount - 1),
//           },
//         };
//       });

//       return { previousData };
//     },
//     onError: (err, notificationId, context) => {
//       queryClient.setQueryData(["notifications"], context?.previousData);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
//     },
//   });

//   // Mark all as read mutation
//   export const markAllAsReadMutation = useMutation({
//     mutationFn: notificationApi.markAllAsRead,
//     onMutate: async () => {
//       await queryClient.cancelQueries({ queryKey: ["notifications"] });
//       const previousData = queryClient.getQueryData(["notifications"]);

//       queryClient.setQueryData(["notifications"], (old: any) => {
//         if (!old) return old;
//         return {
//           ...old,
//           data: {
//             ...old.data,
//             notifications: old.data.notifications.map((n: Notification) => ({
//               ...n,
//               isRead: true,
//               readAt: new Date().toISOString(),
//             })),
//             unreadCount: 0,
//           },
//         };
//       });

//       return { previousData };
//     },
//     onError: (err, variables, context) => {
//       queryClient.setQueryData(["notifications"], context?.previousData);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["notifications"] });
//     },
//   });

//   // Delete notification mutation
//   export const deleteNotificationMutation = useMutation({
//     mutationFn: notificationApi.deleteNotification,
//     onMutate: async (notificationId) => {
//       await queryClient.cancelQueries({ queryKey: ["notifications"] });
//       const previousData = queryClient.getQueryData(["notifications"]);

//       queryClient.setQueryData(["notifications"], (old: any) => {
//         if (!old) return old;
//         const notification = old.data.notifications.find((n: Notification) => n._id === notificationId);
//         return {
//           ...old,
//           data: {
//             ...old.data,
//             notifications: old.data.notifications.filter((n: Notification) => n._id !== notificationId),
//             total: old.data.total - 1,
//             unreadCount: notification?.isRead ? old.data.unreadCount : Math.max(0, old.data.unreadCount - 1),
//           },
//         };
//       });

//       return { previousData };
//     },
//     onError: (err, notificationId, context) => {
//       queryClient.setQueryData(["notifications"], context?.previousData);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
//     },
//   });

//   // Clear read notifications
//   export const clearReadMutation = useMutation({
//     mutationFn: notificationApi.clearRead,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["notifications"] });
//     },
//   });
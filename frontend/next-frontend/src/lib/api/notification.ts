import api from "./csrAPi";
import { NotificationsResponse, UnreadCountResponse } from "@/src/helpers/type";



export const notificationApi = {
  // Get notifications
  getNotifications: async (params: {
    recipientId: string;
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
    types?: string[];
    priority?: string;
  }): Promise<NotificationsResponse> => {
    const response = await api.get("node/notification", { params });
    return response.data;
  },

  // Get unread count
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await api.get("node/notification/unreadCount");
    return response.data;
  },

  // Mark single as read
  markAsRead: async (notificationId: string): Promise<{ success: boolean }> => {
    const response = await api.patch(`node/notification/${notificationId}/read`);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async (): Promise<{ success: boolean; data: { count: number } }> => {
    const response = await api.patch("node/notification/markAsRead");
    return response.data;
  },

  // Bulk mark as read
  bulkMarkAsRead: async (notificationIds: string[]): Promise<{ success: boolean; data: { count: number } }> => {
    const response = await api.patch("node/notification/bulk-read", { notificationIds });
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`node/notification/${notificationId}`);
    return response.data;
  },

  // Clear read notifications
  clearRead: async (ids: string | string[]): Promise<{ success: boolean; data: { count: number } }> => {
    const response = await api.delete(`node/notification/clearRead`, { data: { ids } });
    return response.data;
  },

  // Clear all notifications
  clearAll: async (): Promise<{ success: boolean; data: { count: number } }> => {
    const response = await api.delete("node/notification/clearAll");
    return response.data;
  },
};
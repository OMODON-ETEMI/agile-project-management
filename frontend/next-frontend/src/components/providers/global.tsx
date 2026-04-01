"use client"

import { useAuth } from "@/src/Authentication/authcontext";
import { useNotifications } from "@/src/hooks/useNotification";

export function GlobalNotificationListner() {
    const { currentUser } = useAuth();
    useNotifications({ recipientId: currentUser?.user_id || "", enableRealtime: true });
    return null;
}
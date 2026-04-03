"use client"

import { useAuth } from "@/src/Authentication/authcontext";
import { useNotifications } from "@/src/hooks/useNotification";

export function GlobalNotificationListner() {
    const { currentUser } = useAuth();
    useNotifications(currentUser ? { recipientId: currentUser.user_id, enableRealtime: true } : { enableRealtime: false } );
    return null;
}
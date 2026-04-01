"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotificationItem } from "./notification-item"
import { EmptyState } from "./empty-state"
import { useNotifications } from "@/src/hooks/useNotification"
import Link from "next/link"
import { useAuth } from "@/src/Authentication/authcontext"



export function NotificationBell() {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return null; 
  }
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications({ recipientId: currentUser?.user_id , limit: 5, enableRealtime: true });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0 overflow-hidden border-border shadow-xl rounded-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 backdrop-blur-sm">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              onClick={() => markAllAsRead()}
            >
              Mark all as read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <NotificationItem 
                  key={notification._id} 
                  notification={notification} 
                  currentUserId={currentUser.user_id}
                  compact 
                  onRead={markAsRead} 
                />
              ))}
            </div>
          ) : (
            <EmptyState type="no-notifications" />
          )}
        </ScrollArea>

        <div className="p-2 border-t bg-muted/30 backdrop-blur-sm">
          <Button variant="ghost" className="w-full text-sm h-9" asChild>
            <Link href="/notifications">View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
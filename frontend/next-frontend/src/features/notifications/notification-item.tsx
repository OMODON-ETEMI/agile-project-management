"use client"

import { motion } from "framer-motion"
import { MoreHorizontal, Trash2, CheckCircle, MailOpen } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getNotificationIcon, getNotificationColor } from "./notification-icon"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { Notification } from "@/src/helpers/type"


interface NotificationItemProps {
  notification: Notification
  currentUserId: string
  compact?: boolean
  onRead?: (id: string) => void
  onDelete?: (id: string) => void
}

export function NotificationItem({ notification, currentUserId, compact = false, onRead, onDelete }: NotificationItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        "group relative flex items-start gap-4 p-4 transition-all hover:bg-muted/50 cursor-pointer border-b last:border-0",
        !notification.readBy.includes(currentUserId) && "bg-blue-50/50 dark:bg-blue-900/10",
        compact && "p-3 gap-3",
      )}
    >
      <div className="relative shrink-0">
        <Avatar className={cn("h-10 w-10 border-2 border-background", compact && "h-8 w-8")}>
          <AvatarImage src={notification.actor.avatar || "/placeholder.svg"} alt={notification.actor.name} />
          <AvatarFallback>{notification.actor.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div
          className={cn(
            "absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background shadow-sm",
            getNotificationColor(notification.type),
            compact && "h-4 w-4 -bottom-0.5 -right-0.5",
          )}
        >
          {getNotificationIcon(notification.type)}
        </div>
      </div>

      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm font-medium leading-none text-foreground", compact && "text-xs")}>
            <span className="font-bold">{notification.actor.name}</span>{" "}
            <span className="font-normal text-muted-foreground">{notification.title}</span>
          </p>
          <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </span>
        </div>

        <p className={cn("text-sm text-muted-foreground line-clamp-2", compact && "text-xs line-clamp-1")}>
          {notification.message}
        </p>

        {!compact && notification.context.entityTitle && (
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
              {notification.context.entityTitle}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!notification.readBy.includes(currentUserId) && <div className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-sm animate-pulse" />}

        <div className={cn("opacity-0 transition-opacity group-hover:opacity-100", compact && "hidden")}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onRead?.(notification._id)
                }}
              >
                {notification.readBy.includes(notification.recipientId) ? (
                  <>
                    <MailOpen className="mr-2 h-4 w-4" /> Mark as unread
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" /> Mark as read
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete?.(notification._id)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  )
}

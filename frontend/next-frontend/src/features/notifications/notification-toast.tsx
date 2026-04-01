"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Notification } from "@/src/helpers/type"
import { getNotificationIcon, getNotificationColor } from "./notification-icon"
import { cn } from "@/lib/utils"


interface NotificationToastProps {
  notification: Notification | null
  onDismiss: () => void
}

export function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
    useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-20 right-4 z-40 w-full max-w-sm pointer-events-auto"
        >
          <div className="relative flex items-start gap-4 p-4 rounded-xl bg-background/95 backdrop-blur-md border shadow-lg overflow-hidden">
            {/* Accent bar */}
            <div className={cn("absolute left-0 top-0 bottom-0 w-1", getNotificationColor(notification.type))} />

            <div className="relative shrink-0 ml-1">
              <Avatar className="h-10 w-10">
                <AvatarImage src={notification?.actor?.avatar || "/placeholder.svg"} alt={notification?.actor?.name} />
                <AvatarFallback>{notification?.actor?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background shadow-sm",
                  getNotificationColor(notification.type),
                )}
              >
                {getNotificationIcon(notification.type)}
              </div>
            </div>

            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-semibold leading-none mb-1">
                {notification.actor.name}{" "}
                <span className="font-normal text-muted-foreground">{notification.title}</span>
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">{notification.message}</p>
            </div>

            <button
              onClick={onDismiss}
              className="shrink-0 rounded-full p-1 opacity-60 hover:opacity-100 hover:bg-muted transition-all"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

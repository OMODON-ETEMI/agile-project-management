"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCheck, Trash2, Filter, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"

import { EmptyState } from "@/src/features/notifications/empty-state"
import { useNotifications } from "@/src/hooks/useNotification"
import { NotificationItem } from "@/src/features/notifications/notification-item"
import { useAuth } from "@/src/Authentication/authcontext"
import { NotificationFilters } from "@/src/features/notifications/notification-filters"

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const { currentUser } = useAuth();
  const { notifications, unreadCount, isLoading, markAsRead, deleteNotification,
    markAllAsRead, clearRead } = useNotifications({ 
      recipientId: currentUser?.user_id as string, 
      unreadOnly: activeTab === "unread",
      types: selectedTypes.length > 0 ? selectedTypes : undefined,
      enable: !!currentUser?.user_id,
  });

    if (!currentUser) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4 min-h-screen">
        <div className="flex items-center justify-center py-12">
          <p className="text-lg text-muted-foreground">Please log in to view your notifications.</p>
        </div>
      </div>
    );
  }

  const filteredNotifications = notifications.filter((n) => {
    const matchesTab = activeTab === "all" ? true : activeTab === "unread" ? !n.readBy.includes(currentUser?.user_id) : n.readBy.includes(currentUser?.user_id);
    const matchesSearch =
      n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.actor.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleToggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 min-h-screen">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => clearRead(notifications.filter(n => n.readBy.includes(currentUser?.user_id)).map(n => n._id))}>
              <Trash2 className="mr-2 h-4 w-4" /> Clear read
            </Button>
            <Button size="sm" onClick={() => markAllAsRead()}>
              <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur-lg py-4 border-b">
          <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveTab}>
            <TabsList className="grid w-full sm:w-[400px] grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread" className="relative">
                Unread
                {unreadCount > 0 && <span className="ml-2 h-2 w-2 rounded-full bg-blue-500" />}
              </TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
              <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <NotificationFilters selectedTypes={selectedTypes} onToggleType={handleToggleType} />
          </div>
        </div>

        <div className="space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <AnimatePresence initial={false} mode="popLayout">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    currentUserId={currentUser?.user_id || ""}
                    onRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="py-12"
                >
                  <EmptyState
                    type={
                      activeTab === "unread" ? "no-unread" : activeTab === "read" ? "no-notifications" : "all-caught-up"
                    }
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}
import { BellOff, CheckCircle2 } from "lucide-react"

interface EmptyStateProps {
  type: "all-caught-up" | "no-notifications" | "no-unread"
}

export function EmptyState({ type }: EmptyStateProps) {
  const content = {
    "all-caught-up": {
      icon: CheckCircle2,
      title: "You're all caught up!",
      description: "No new notifications to attend to right now.",
    },
    "no-notifications": {
      icon: BellOff,
      title: "No notifications yet",
      description: "When you get notifications, they'll show up here.",
    },
    "no-unread": {
      icon: CheckCircle2,
      title: "No unread notifications",
      description: "You've read all your notifications.",
    },
  }[type]

  const Icon = content.icon

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{content.title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">{content.description}</p>
    </div>
  )
}

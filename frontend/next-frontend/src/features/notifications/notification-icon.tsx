import { NotificationType } from "@/src/helpers/type"
import { AtSign, MessageSquare, CheckSquare, Clock, RefreshCcw, Paperclip, Building2, Heart } from "lucide-react"


export const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case "workspace_events":
        case "organisation_events":
            return <Building2 className="h-3 w-3 text-white" />
        case "approval_request":
            return <CheckSquare className="h-3 w-3 text-white" />
        case "follow":
            return <Heart className="h-3 w-3 text-white" />
        case "mention":
            return <AtSign className="h-3 w-3 text-white" />
        case "comment":
            return <MessageSquare className="h-3 w-3 text-white" />
        case "task_assigned":
            return <CheckSquare className="h-3 w-3 text-white" />
        case "deadline":
            return <Clock className="h-3 w-3 text-white" />
        case "status_change":
            return <RefreshCcw className="h-3 w-3 text-white" />
        case "file_shared":
            return <Paperclip className="h-3 w-3 text-white" />
        case "like":
            return <Heart className="h-3 w-3 text-white" />
        default:
            return <AtSign className="h-3 w-3 text-white" />
    }
}

export const getNotificationColor = (type: NotificationType) => {
    switch (type) {
        case "mention":
            return "bg-blue-500"
        case "comment":
            return "bg-green-500"
        case "task_assigned":
            return "bg-orange-500"
        case "deadline":
            return "bg-red-500"
        case "status_change":
            return "bg-purple-500"
        case "file_shared":
            return "bg-pink-500"
        case "organisation_events":
            return "bg-indigo-500"
        case "like":
            return "bg-rose-500"
        default:
            return "bg-blue-500"
    }
}

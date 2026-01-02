from dataclasses import dataclass, field, asdict
from typing import List, Optional, Literal
from datetime import datetime


# Allowed enums
NotificationType = Literal[
    "mention",
    "comment",
    "task_assigned",
    "workspace_events",
    "organisation_events",
    "deadline",
    "status_change",
    "approval_request",
    "file_shared",
    "like",
]

EntityType = Literal[
    "issue", "comment", "workspace", "organisation", "file", "user"
]

DeliveryMedium = Literal["in_app", "email", "push"]

PriorityLevel = Literal["low", "normal", "high"]



@dataclass
class ActorInfo:
    userId: str
    name: Optional[str] = None
    avatar: Optional[str] = None


@dataclass
class ContextInfo:
    entityId: str
    entityType: EntityType
    entityTitle: Optional[str] = None
    workspaceId: Optional[str] = None
    organisationId: Optional[str] = None


@dataclass
class NotificationPayload:
    recipientId: List[str]  # list of user IDs as strings
    type: NotificationType
    title: str
    message: str
    actor: ActorInfo
    context: ContextInfo

    actionUrl: Optional[str] = None
    deliveryMediums: List[DeliveryMedium] = field(default_factory=lambda: ["in_app"])
    priority: PriorityLevel = "normal"
    
    
# -----------------------------
# Organisation update
# -----------------------------
def update_organisation_notification(
    recipients: List[str],
    actor_id: str,
    actor_name: str,
    actor_avatar: Optional[str],
    org_id: str,
    org_name: str,
    changed_fields: Optional[List[str]] = None,
    summary: Optional[str] = None
) -> NotificationPayload:
    """
    Notification when an organisation's details are updated.

    - changed_fields: optional list like ["name", "color", "description"]
    - summary: optional human-friendly short summary (overrides auto-message)
    """
    actor = ActorInfo(actor_id, actor_name, actor_avatar)
    context = ContextInfo(entityId=org_id, entityType="organisation", entityTitle=org_name, organisationId=org_id)

    if summary:
        message = summary
    else:
        if changed_fields and len(changed_fields) > 0:
            if len(changed_fields) == 1:
                message = f"The {changed_fields[0]} for '{org_name}' was updated."
            else:
                # e.g. "name, description and color"
                if len(changed_fields) == 2:
                    field_list = " and ".join(changed_fields)
                else:
                    field_list = ", ".join(changed_fields[:-1]) + f", and {changed_fields[-1]}"
                message = f"The {field_list} for '{org_name}' were updated."
        else:
            message = f"The organisation '{org_name}' was updated."

    return asdict(NotificationPayload(
        recipientId=recipients,
        type="organisation_events",
        title="Organisation Updated",
        message=message,
        actor=actor,
        context=context,
        actionUrl=f"/organisation/{org_id}/settings",
        deliveryMediums=["in_app", "email"],
        priority="normal",
    ))

# -----------------------------
# Delete organisation
# -----------------------------
def delete_organisation_notification(
    recipients: List[str],
    actor_id: str,
    actor_name: str,
    actor_avatar: Optional[str],
    org_id: str,
    org_name: str
) -> NotificationPayload:
    actor = ActorInfo(actor_id, actor_name, actor_avatar)
    context = ContextInfo(org_id, "organisation", org_name, organisationId=org_id)
    return asdict(NotificationPayload(
        recipientId=recipients,
        type="organisation_events",
        title="Organisation Deleted",
        message=f"This Organisation '{org_name}' has been deleted.",
        actor=actor,
        context=context,
        deliveryMediums=["in_app", "email", "push"]
    ))

# -----------------------------
# Task assigned
# -----------------------------
def task_assigned_notification(
    recipients: List[str],
    actor_id: str,
    actor_name: str,
    actor_avatar: Optional[str],
    task_id: str,
    task_title: str,
    workspace_id: str,
    org_id: str,
) -> NotificationPayload:
    actor = ActorInfo(actor_id, actor_name, actor_avatar)
    context = ContextInfo(task_id, "issue", task_title, workspace_id, org_id)
    return asdict(NotificationPayload(
        recipientId=recipients,
        type="task_assigned",
        title="New Task Assigned",
        message=f"You have been assigned to task '{task_title}'",
        actor=actor,
        context=context,
        actionUrl=f"/workspace/{workspace_id}/tasks/{task_id}",
        deliveryMediums=["in_app", "email"],
        priority="high"
    ))

# -----------------------------
# Invite to organisation
# -----------------------------
def invite_notification(
    recipients: List[str],
    actor_id: str,
    actor_name: str,
    actor_avatar: Optional[str],
    org_id: str,
    org_name: str
) -> NotificationPayload:
    actor = ActorInfo(actor_id, actor_name, actor_avatar)
    context = ContextInfo(org_id, "organisation", org_name, organisationId=org_id)
    return asdict(NotificationPayload(
        recipientId=recipients,
        type="organisation_events",
        title="You're invited!",
        message=f"You have been invited to join the organisation '{org_name}'",
        actor=actor,
        context=context,
        actionUrl=f"/organisation/{org_id}",
        deliveryMediums=["in_app", "email", "push"]
    ))

# -----------------------------
# Role update
# -----------------------------
def role_update_notification(
    recipients: List[str],
    actor_id: str,
    actor_name: str,
    actor_avatar: Optional[str],
    org_id: str,
    org_name: str,
    new_role: str
) -> NotificationPayload:
    actor = ActorInfo(actor_id, actor_name, actor_avatar)
    context = ContextInfo(org_id, "organisation", org_name, organisationId=org_id)
    return asdict(NotificationPayload(
        recipientId=recipients,
        type="status_change",
        title="Role Updated",
        message=f"Your role in '{org_name}' has been changed to '{new_role}'",
        actor=actor,
        context=context,
        actionUrl=f"/organisation/{org_id}/members",
        deliveryMediums=["in_app", "email"]
    ))

# -----------------------------
# Remove user
# -----------------------------
def remove_user_notification(
    recipients: List[str],
    actor_id: str,
    actor_name: str,
    actor_avatar: Optional[str],
    org_id: str,
    org_name: str
) -> NotificationPayload:
    actor = ActorInfo(actor_id, actor_name, actor_avatar)
    context = ContextInfo(org_id, "organisation", org_name, organisationId=org_id)
    return asdict(NotificationPayload(
        recipientId=recipients,
        type="organisation_events",
        title="Removed from Organisation",
        message=f"You have been removed from organisation '{org_name}'",
        actor=actor,
        context=context,
        actionUrl=f"/organisation/{org_id}",
        deliveryMediums=["in_app", "email"]
    ))

# -----------------------------
# Generic comment
# -----------------------------
def comment_notification(
    recipients: List[str],
    actor_id: str,
    actor_name: str,
    actor_avatar: Optional[str],
    comment_id: str,
    comment_preview: str,
    task_id: str,
    task_title: str,
    workspace_id: str,
    org_id: str
) -> NotificationPayload:
    actor = ActorInfo(actor_id, actor_name, actor_avatar)
    context = ContextInfo(task_id, "comment", task_title, workspace_id, org_id)
    return asdict(NotificationPayload(
        recipientId=recipients,
        type="comment",
        title=f"New comment on '{task_title}'",
        message=f"{actor_name} commented: '{comment_preview[:100]}'",
        actor=actor,
        context=context,
        actionUrl=f"/workspace/{workspace_id}/tasks/{task_id}#comment-{comment_id}",
        deliveryMediums=["in_app", "email", "push"]
    ))

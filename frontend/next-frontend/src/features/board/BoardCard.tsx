"use client";

import { useRouter } from "next/navigation";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Issue, IssueType, Priority } from "@/src/helpers/type";
import Icon from "@/src/helpers/icon";
import { any } from "zod";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// export type Priority = "low" | "medium" | "high" | "critical";
export type CardState = "normal" | "selected" | "loading";

export interface BoardCardProps {
  card: Issue
  cardState: CardState;
  href: string;
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function BoardCardSkeleton() {
  return (
    <div role="status" aria-label="Loading card" aria-busy="true"
      className="bg-card border border-border rounded-md p-3 animate-pulse cursor-wait space-y-2">
      <div className="h-3 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-full" />
      <div className="h-3 bg-muted rounded w-1/2" />
      <div className="flex justify-between pt-2">
        <div className="h-3 w-16 bg-muted rounded" />
        <div className="h-5 w-5 bg-muted rounded-full" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function BoardCard({
  card,
  cardState = "normal",
  href,
}: BoardCardProps) {
  const router = useRouter();

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: card._id ? card._id : "" });

  const dragStyle = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  if (cardState === "loading") return <BoardCardSkeleton />;

  const isSelected = cardState === "selected";
  const avatarInitial = (card.assignees as any)?.username.charAt(0).toUpperCase() ?? null;

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      {...listeners}
      {...attributes}
      role="button"
      tabIndex={0}
      aria-label={`${card.issuetype}: ${card.title}${isSelected ? ", selected" : ""}`}
      aria-pressed={isSelected}
      onClick={() => router.push(href)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(href);
        }
      }}
      className={[
        // Jira cards: white, subtle border, light shadow, rounded-md (not lg)
        "bg-white dark:bg-card rounded-md p-3 transition-all select-none group",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052CC]",
        isDragging
          ? "opacity-40 shadow-2xl cursor-grabbing rotate-1 scale-105"
          : "cursor-pointer hover:shadow-md",
        isSelected
          ? "border border-[#0052CC] ring-1 ring-[#0052CC]"
          : "border border-border hover:border-[#0052CC]/40",
      ].join(" ")}
    >
      {/* ── Title ─────────────────────────────────────────────────── */}
      <p className="text-sm text-foreground font-normal leading-snug line-clamp-3 mb-2">
        {card.title}
      </p>

      {/* ── Epic / Label tag (Jira colored pill) ──────────────────── */}
      {card.epic && (
        <div className="mb-3">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide text-white uppercase ${card.color}`}>
            {card.epic}
          </span>
        </div>
      )}

      {/* ── Bottom meta row ───────────────────────────────────────── */}
      {/* Left: type icon + issue ID + priority icon  |  Right: avatar */}
      <div className="flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-1.5">
          {/* Issue type icon */}
          <span className="flex-shrink-0">
            {/* {Icon[card.issuetype]} */}
            <Icon type={String(card.issuetype).toLocaleLowerCase()} isIssueType />
          </span>

          {/* Issue ID */}
          {card.issueID && (
            <span className="font-mono text-[10px] text-muted-foreground">
              {card.issueID}
            </span>
          )}

          {/* Priority icon */}
          <span className="flex-shrink-0 ml-0.5">
            {/* {PRIORITY_ICON[card.priority]} */}
            <Icon type={card.priority} isPriority />
          </span>
        </div>

        {/* Assignee avatar */}
        {card.assignees && avatarInitial && (
          <div
            aria-label={`Assignee: ${card.assignees}`}
            title={card.assignees}
            className="w-6 h-6 rounded-full bg-[#0052CC] text-white flex items-center
              justify-center text-[10px] font-bold flex-shrink-0 ring-2 ring-white dark:ring-card"
          >
            {avatarInitial}
          </div>
        )}
      </div>
    </div>
  );
}
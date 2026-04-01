"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, Link2, MoreHorizontal, Paperclip,
  ThumbsUp, Share2, Flag, Trash2, GitBranch, Clock, ChevronRight,
  AlignLeft, MessageSquare, Activity,
  User, Calendar, ArrowUp,
  BarChart2, Zap
} from "lucide-react";
import { Issue, IssueComment, IssueType, Priority, Status } from "@/src/helpers/type";
import Icon from "@/src/helpers/icon";
import { useParams } from "next/navigation";
import useIssues from "@/src/hooks/useIssues";
import GlobalLoading from "@/src/app/loading";
import { useWorkspaceExtras } from "@/src/hooks/useWorkspace";
import useBoards from "@/src/hooks/useBoards";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IssueDetailProps {
  issue: Issue
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; icon: React.ReactNode }> = {
  Critical: { label: "Highest", color: "text-red-500", icon: <ArrowUp className="w-3.5 h-3.5 text-red-500 rotate-0" /> },
  High: { label: "High", color: "text-orange-500", icon: <ArrowUp className="w-3.5 h-3.5 text-orange-500" /> },
  Medium: { label: "Medium", color: "text-yellow-500", icon: <BarChart2 className="w-3.5 h-3.5 text-yellow-500" /> },
  Low: { label: "Lowest", color: "text-blue-300", icon: <ArrowUp className="w-3.5 h-3.5 text-blue-300 rotate-180" /> },
};

const STATUS_CONFIG: Record<Status, { color: string; bg: string; border: string }> = {
  "Backlog": { color: "text-gray-600", bg: "bg-gray-100", border: "border-gray-200" },
  "To Do": { color: "text-gray-600", bg: "bg-gray-100", border: "border-gray-200" },
  "In Progress": { color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  "Cancelled": { color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  "On Hold": { color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200" },
  "Review": { color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
  "Done": { color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name, initials, color = "bg-[#0052CC]", size = "md" }: {
  name?: string; initials?: string; color?: string; size?: "sm" | "md" | "lg";
}) {
  const s = { sm: "w-6 h-6 text-[10px]", md: "w-8 h-8 text-xs", lg: "w-9 h-9 text-sm" }[size];
  const init = initials ?? name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";
  return (
    <div className={`${s} ${color} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
      {init}
    </div>
  );
}

function TypeBadge({ type }: { type: IssueType }) {
  return (
    <Icon type={String(type).toLocaleLowerCase()} isIssueType className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0`} />
  );
}

function StatusDropdown({ status, onChange }: { status: Status; onChange: (s: Status) => void }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[status];
  const all: Status[] = ["To Do", "In Progress", "Review", "Done"];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold
          border ${cfg.bg} ${cfg.color} ${cfg.border} hover:brightness-95 transition-all`}
      >
        {status}
        <ChevronDown className="w-3 h-3" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200
              rounded-xl shadow-xl shadow-gray-200/80 overflow-hidden py-1 min-w-[140px]"
          >
            {all.map(s => {
              const c = STATUS_CONFIG[s];
              return (
                <button key={s} onClick={() => { onChange(s); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-gray-50
                    flex items-center gap-2 ${s === status ? c.color : "text-gray-700"}`}
                >
                  <span className={`w-2 h-2 rounded-full ${c.bg.replace("bg-", "bg-").replace("-50", "-400").replace("bg-gray-100", "bg-gray-400")}`} />
                  {s}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-start gap-2 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 font-medium pt-0.5">{label}</span>
      <div>{children}</div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <div className="flex items-center gap-1.5">
      {cfg.icon}
      <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
    </div>
  );
}

function Label({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium
      bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 transition-colors cursor-default">
      {text}
    </span>
  );
}

// ─── Activity Tab ─────────────────────────────────────────────────────────────

function ActivityTab({ comments }: { comments: IssueComment[] }) {
  const [newComment, setNewComment] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-6">
      {/* Comment input */}
      <div className="flex gap-3">
        <Avatar name="You" size="md" />
        <div className="flex-1">
          <div className={`border rounded-xl transition-all duration-200 overflow-hidden
            ${focused ? "border-[#0052CC] shadow-sm shadow-[#0052CC]/10" : "border-gray-200"}`}>
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => !newComment && setFocused(false)}
              placeholder="Add a comment..."
              rows={focused ? 4 : 2}
              className="w-full px-4 py-3 text-sm text-gray-800 placeholder-gray-400
                focus:outline-none resize-none bg-white"
            />
            <AnimatePresence>
              {focused && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-100"
                >
                  <div className="flex items-center gap-1">
                    {[Paperclip, Link2, AlignLeft].map((Icon, i) => (
                      <button key={i} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setNewComment(""); setFocused(false); }}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                      Cancel
                    </button>
                    <button
                      disabled={!newComment.trim()}
                      className="px-3 py-1.5 text-xs font-semibold bg-[#0052CC] text-white
                        rounded-lg hover:bg-[#0065FF] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Save
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-5">
        {comments.map((c, i) => (
          <motion.div
            key={c.author}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex gap-3 group"
          >
            <Avatar initials={c.author.charAt(0).toUpperCase()} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-900">{c.author}</span>
                <span className="text-xs text-gray-400 font-mono">{c.createdAt.toISOString()}</span>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
                {c.body}
              </div>
              <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {["Edit", "Delete", "React"].map(a => (
                  <button key={a} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">{a}</button>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function IssueDetailPage({ issue: issueProp }: IssueDetailProps) {
  const params = useParams();
  const issueID = typeof params.ID === 'string' ? params.ID : params.ID?.[0];
  const { issues: issueData, deleteIssue, addComment, isLoading } = useIssues({ _id: issueID })
  const { epicData } = useIssues({ workspaceId: issueData?.[0]?.workspace_id })
  const issue = issueData?.[0];
  useEffect(() => {
    if (issue?.status) {
      setStatus(issue.status)
    }
  }, [issue])
  const { users } = useWorkspaceExtras(issue?.workspace_id, { users: true, boards: false })
  const { boards, isLoading: boardLoading, error } = useBoards({ searchParams: {_id: issue?.board_id}})
  const [status, setStatus] = useState<Status | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"comments" | "history">("comments");
  const [pinned, setPinned] = useState(false);
  const typeCfg = <Icon type={String((issue?.status)).toLocaleLowerCase()} isIssueType />;
  const issueEpic: Issue = epicData?.find((e: Issue) => e._id === issue?.epic)
  const issueAssigne = users?.find((u:any) => u._id === issue?.assignees)
  const issueReporter = users?.find((u:any) => u._id === issue?.reporter)
  if (isLoading || boardLoading) return <GlobalLoading />;
  if (!issue) return <div>Issue not found</div>;


  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">

      {/* ── Breadcrumb bar ── */}
      <div className="flex-shrink-0 flex items-center gap-1.5 px-6 py-3 border-b border-border text-xs text-muted-foreground">
        <span className="hover:text-foreground cursor-pointer transition-colors">Projects</span>
        <ChevronRight className="w-3 h-3" />
        <span className="hover:text-foreground cursor-pointer transition-colors">Taskify Board</span>
        <ChevronRight className="w-3 h-3" />
        <span className="flex items-center gap-1.5 text-foreground font-medium">
          <TypeBadge type={issue.issuetype} />
          {issue.issueID}
        </span>
      </div>

      {/* ── Main content: 2-col layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: Main content ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">

            {/* Issue type tag */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md bg-opacity-15`}>
                <TypeBadge type={issue.issuetype} />
                <span className={`text-xs font-semibold uppercase tracking-wide`}>
                  {typeCfg.type}
                </span>
              </div>
              <span className="font-mono text-xs text-muted-foreground">{issue.issueID}</span>
            </div>

            {/* ── Title ── */}
            <h1 className="text-xl font-bold text-foreground leading-snug">
              {issue.title}
            </h1>

            {/* ── Action row ── */}
            <div className="flex flex-wrap items-center gap-2">
              <StatusDropdown status={status ?? "Backlog"} onChange={setStatus} />

              <div className="h-4 w-px bg-border mx-1" />

              {[
                { icon: ThumbsUp, label: "Like" },
                { icon: Share2, label: "Share" },
                { icon: Link2, label: "Copy link" },
                { icon: Flag, label: "Flag" },
              ].map(({ icon: Icon, label }) => (
                <button key={label}
                  title={label}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground
                    hover:bg-muted hover:text-foreground transition-colors border border-transparent hover:border-border">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}

              <button className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* ── Description ── */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-muted-foreground" />
                Description
              </h3>
              <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed
                rounded-xl border border-border p-4 hover:border-[#0052CC]/30 transition-colors
                bg-muted/30 cursor-text min-h-[80px]">
                {issue.description?.split("\n").map((line, i) => {
                  if (line.startsWith("## ")) return <p key={i} className="font-semibold text-foreground mb-2">{line.replace("## ", "")}</p>;
                  if (line.startsWith("- ")) return <p key={i} className="pl-4 before:content-['•'] before:mr-2 before:text-[#0052CC]">{line.replace("- ", "")}</p>;
                  if (line === "") return <br key={i} />;
                  return <p key={i}>{line}</p>;
                })}
              </div>
            </div>

            {/* ── Activity ── */}
            <div>
              <div className="flex items-center gap-4 mb-4 border-b border-border pb-2">
                <h3 className="text-sm font-semibold text-foreground">Activity</h3>
                <div className="flex items-center gap-1 ml-auto">
                  {(["comments", "history"] as const).map(t => (
                    <button key={t} onClick={() => setActiveTab(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors
                        ${activeTab === t
                          ? "bg-[#0052CC]/10 text-[#0052CC]"
                          : "text-muted-foreground hover:bg-muted"}`}
                    >
                      {t === "comments"
                        ? <span className="flex items-center gap-1.5"><MessageSquare className="w-3 h-3" />Comments</span>
                        : <span className="flex items-center gap-1.5"><Activity className="w-3 h-3" />History</span>
                      }
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "comments" ? (
                  <motion.div key="comments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <ActivityTab comments={issue.comments ?? []} />
                  </motion.div>
                ) : (
                  <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="space-y-3">
                    {[
                      { user: "AJ", color: "bg-[#0052CC]", action: "changed status from", from: "To Do", to: "In Progress", time: "Mar 10, 2026" },
                      { user: "MC", color: "bg-purple-500", action: "set story points to", from: "", to: "8", time: "Mar 9, 2026" },
                      { user: "AJ", color: "bg-[#0052CC]", action: "created this issue", from: "", to: "", time: "Feb 28, 2026" },
                    ].map((h, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs text-muted-foreground py-2">
                        <Avatar initials={h.user} color={h.color} size="sm" />
                        <p className="leading-relaxed pt-0.5">
                          <span className="font-medium text-foreground">{h.user === "AJ" ? "Alex Johnson" : "Maria Chen"}</span>
                          {" "}{h.action}{" "}
                          {h.from && <span className="line-through text-muted-foreground/60">{h.from}</span>}
                          {h.from && " → "}
                          {h.to && <span className="font-medium text-foreground">{h.to}</span>}
                          <span className="ml-2 font-mono text-[10px] text-muted-foreground/60">{h.time}</span>
                        </p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Details sidebar ── */}
        <div className="w-72 flex-shrink-0 border-l border-border overflow-y-auto bg-muted/20">
          <div className="p-5 space-y-1">

            {/* Sidebar header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Details</h3>
              <button className="p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            <SidebarField label="Assignee">
              {issue.assignees ? (
                <div className="flex items-center gap-2 cursor-pointer hover:bg-muted rounded-lg px-2 py-1 -mx-2 transition-colors group">
                  <Avatar name={issueAssigne?.username} size="sm" />
                  <span className="text-xs text-foreground group-hover:text-[#0052CC] transition-colors">{issueReporter?.username}</span>
                </div>
              ) : (
                <button className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <User className="w-3 h-3" />
                  </div>
                  Unassigned
                </button>
              )}
            </SidebarField>

            <SidebarField label="Reporter">
              <div className="flex items-center gap-2 cursor-pointer hover:bg-muted rounded-lg px-2 py-1 -mx-2 transition-colors">
                <Avatar name={issueReporter?.username} color="bg-purple-500" size="sm" />
                <span className="text-xs text-foreground">{issueReporter?.username}</span>
              </div>
            </SidebarField>

            <SidebarField label="Priority">
              <button className="flex items-center gap-1.5 hover:bg-muted rounded-lg px-2 py-1 -mx-2 transition-colors">
                <PriorityBadge priority={issue.priority} />
              </button>
            </SidebarField>

            <SidebarField label="Story Points">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#0052CC]/10 border border-[#0052CC]/20
                  text-[#0052CC] text-xs font-bold flex items-center justify-center">
                  {issue.storyPoints ?? "—"}
                </span>
                <span className="text-xs text-muted-foreground">points</span>
              </div>
            </SidebarField>

            <SidebarField label="Sprint">
              <div className="flex items-center gap-1.5 text-xs text-foreground">
                <GitBranch className="w-3.5 h-3.5 text-[#0052CC]" />
                {boards.title ?? "No sprint"}
              </div>
            </SidebarField>

            <SidebarField label="Epic">
              {issueEpic ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-purple-200 text-xs font-medium"
                  style={{
                    backgroundColor: issue.issuetype === "Epic" ? (issue.color || "#7A869A") : issueEpic.color
                  }}>

                  <Zap className="w-3 h-3" />
                  {issueEpic.title}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">None</span>
              )}
            </SidebarField>

            <SidebarField label="Labels">
              <div className="flex flex-wrap gap-1">
                {issue.labels && issue.labels.length > 0
                  ? issue.labels.map(l => <Label key={l} text={l} />)
                  : <span className="text-xs text-muted-foreground">None</span>
                }
              </div>
            </SidebarField>

            <SidebarField label="Due date">
              <div className="flex items-center gap-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-foreground">
                  {issue.dueDate
                    ? new Date(issue.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "None"}
                </span>
              </div>
            </SidebarField>

            {/* Timestamps */}
            <div className="pt-4 border-t border-border space-y-2">
              {[
                { label: "Created", value: issue.createdAt },
                { label: "Updated", value: issue.updatedAt },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span>{label}:</span>
                  <span className="font-mono">
                    {value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </span>
                </div>
              ))}
            </div>

            {/* Danger zone */}
            <div className="pt-4 border-t border-border">
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs
                text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group border border-transparent hover:border-red-100"
                onClick={() => deleteIssue({_id: issue?._id as string})}>
                <Trash2 className="w-3.5 h-3.5" />
                Delete issue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
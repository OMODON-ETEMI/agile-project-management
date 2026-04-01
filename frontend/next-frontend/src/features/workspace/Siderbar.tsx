"use client";
import { Board, Workspace } from "@/src/helpers/type";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams, notFound } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select"
import { LayoutGrid, ListTodo, BarChart2, AlertCircle } from "lucide-react";
import { useOrgStore } from "@/src/hooks/store";
import { InsightNavButtons } from "../board/Insight";
import { CreateSprintModal } from "@/src/app/(Pages)/workspace/[workspaceSlug]/backlog/_components/Createsprint";
import useBoards from "@/src/hooks/useBoards";


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------


export interface SidebarProps {
  /** Display name of all workspaces. */
  workspaces: Workspace[];
  /** Ordered list of boards belonging to the current workspace. */
  boards: Board[];
  /** ID of the currently active board, used for aria-current. */
  activeBoardId?: string;
  /** Called when the user clicks "Settings". */
  onSettings: () => void;
  /** Called when the user clicks "Help". */
  onHelp: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Sidebar({
  workspaces,
  boards,
  activeBoardId,
  onSettings,
  onHelp,
}: SidebarProps) {

  const params = useParams();
  const router = useRouter();
  const workspaceSlug = Array.isArray(params.workspaceSlug)
    ? params.workspaceSlug[0]
    : params.workspaceSlug;

  if (!workspaces) return notFound();
  const { setCurrentWorkspace } = useOrgStore()
  const currentWorkspace = workspaces.find(w => w.slug === workspaceSlug) || workspaces[0];
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | undefined>(currentWorkspace?._id);
  useEffect(() => {
    if (currentWorkspace) {
      setCurrentWorkspace(currentWorkspace._id);
      setSelectedWorkspaceId(currentWorkspace._id);
    }
  }, [currentWorkspace, setCurrentWorkspace]);
  const { createBoard } = useBoards()
  const [open, setOpen] = useState(false);


  const handleBoardSelect = useCallback((selectedBoardId: string) => {
    router.push(`/workspace/${workspaceSlug}/${selectedBoardId}`);
  },
    [router, workspaceSlug]
  );

  const handleNewBoard = (data: Partial<Board>) => {
    createBoard({
      title: data.title,
      type: 'Sprint',
      startDate: data.startDate,
      endDate: data.endDate,
      image: data.image,
      workspace: currentWorkspace?._id,
    })
  }

  const handleSelect = useCallback((value: string) => {
    setSelectedWorkspaceId(value);
    const selectedWorkspace = workspaces.find(w => w._id === value);

    if (selectedWorkspace) {
      const workspacePath = selectedWorkspace.slug || selectedWorkspace._id;
      router.push(`/workspace/${workspacePath}`);
    }
  }, [workspaces, boards, router]);

  const boardIconMap: Record<string, React.ReactNode> = {
    Board: <LayoutGrid className="w-4 h-4 flex-shrink-0" />,
    Backlog: <ListTodo className="w-4 h-4 flex-shrink-0" />,
    Reports: <BarChart2 className="w-4 h-4 flex-shrink-0" />,
    default: <AlertCircle className="w-4 h-4 flex-shrink-0" />,
  };

  return (
    <aside
      aria-label="Workspace navigation"
      className="w-64 bg-background border-r border-border h-full flex flex-col overflow-hidden"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="px-4 py-5 border-b border-border">
        {/* Project identity — mirrors Jira's name + type block */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-md bg-[#0052CC] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {currentWorkspace?.title?.charAt(0).toUpperCase() ?? "W"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate leading-tight">
              {currentWorkspace?.title ?? "Workspace"}
            </p>
            <p className="text-xs text-muted-foreground">Software project</p>
          </div>
        </div>
        <Select onValueChange={handleSelect} value={selectedWorkspaceId}>
          <SelectTrigger className="mt-3 w-full px-3 py-2 rounded-lg bg-accent/10 border border-accent/20">
            <span className="block truncate text-sm font-medium text-left w-full max-w-[160px]">
              {currentWorkspace?.title || "Select workspace"}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Workspaces</SelectLabel>
              {workspaces.map((workspace) => (
                <SelectItem key={workspace._id} value={workspace._id} title={workspace.title}>
                  <span className="block truncate" title={workspace.title}>{workspace.title}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Navigation                                                           */}
      {/* ------------------------------------------------------------------ */}
      <nav
        aria-label="Boards"
        className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
      >
        <div className="px-3 py-2 mb-4">
          <p id="boards-label" className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-1">
            Boards
          </p>
        </div>

        <ul role="list" aria-labelledby="boards-label" className="space-y-1">
          {boards.map((board) => {
            const isActive = board._id === activeBoardId;
            if (board.type === "Backlog") return null
            return (
              <li key={board._id}>
                <button
                  type="button"
                  onClick={handleBoardSelect.bind(null, board._id)}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`Board: ${board.title}`}
                  className={[
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    isActive
                      ? "bg-[#0052CC]/10 text-[#0052CC] border-l-2 border-[#0052CC] pl-[10px]"
                      : "text-foreground hover:bg-muted/50 border-l-2 border-transparent pl-[10px]",
                  ].join(" ")}
                >
                  {boardIconMap[board.type] ?? boardIconMap.default}
                  <span className="line-clamp-1">{board.title}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Create new board"
          className={[
            "w-full text-left px-3 py-2 rounded-lg text-sm font-medium mt-4 transition-colors",
            "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          ].join(" ")}
        >
          + New Board
        </button>

        {boards
          .filter(b => b.type === "Backlog")
          .map((board) => (
            <button
              type="button"
              onClick={handleBoardSelect.bind(null, 'backlog')}
              aria-current={(board.type.toLocaleLowerCase() === activeBoardId) ? "page" : undefined}
              aria-label={`Board: ${board.title}`}
              className={[
                "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                (board.type.toLocaleLowerCase() === activeBoardId)
                  ? "bg-accent/20 text-foreground"
                  : "text-foreground hover:bg-muted/50",
              ].join(" ")}
            >
              <span className="line-clamp-1">{board.title}</span>
            </button>
          ))}
        <InsightNavButtons sprintId={activeBoardId} workspaceSlug={workspaceSlug} />
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div
        role="group"
        aria-label="Workspace utilities"
        className="px-3 py-4 border-t border-border space-y-2"
      >
        <button
          type="button"
          onClick={onSettings}
          aria-label="Open settings"
          className={[
            "w-full text-left px-3 py-2 rounded-lg text-sm text-foreground transition-colors",
            "hover:bg-muted/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          ].join(" ")}
        >
          Settings
        </button>
        <button
          type="button"
          onClick={onHelp}
          aria-label="Open help"
          className={[
            "w-full text-left px-3 py-2 rounded-lg text-sm text-foreground transition-colors",
            "hover:bg-muted/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          ].join(" ")}
        >
          Help
        </button>
      </div>
      <CreateSprintModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(data) => handleNewBoard(data)}
      />
    </aside>
  );
}
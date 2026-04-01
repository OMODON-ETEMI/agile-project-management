"use client";

import React, { useState } from "react";
import { BarChart2, ChevronDown, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import SprintSection from "./Sprintsection";
import { Board, BoardWithIssues, Issue, ISSUE_TYPES, User } from "@/src/helpers/type";
import AvatarComponent from "@/src/components/ui/avatar";
import IssueDetailPanel from "./Issuedetailpanel";
import { CreateSprintModal } from "./Createsprint";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BacklogViewProps {
  sprints: BoardWithIssues[];
  users: User[];
  epics: Issue[];
  selectedIssue: Issue | null;
  onDragEnd: (args: { issue: Issue; targetBoard: string }) => void;
  onIssueSelect: (issue: Issue) => void;
  onCloseIssue: () => void;
  onCreateSprint: (data: Partial<Board>) => void;
}

interface Filters {
  epic: string;
  type: string;
}

interface DraggedItem {
  issue: Issue;
  source: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BacklogView({
  sprints,
  users,
  epics,
  selectedIssue,
  onDragEnd,
  onIssueSelect,
  onCloseIssue,
  onCreateSprint,
}: BacklogViewProps) {
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    epic: "all",
    type: "all",
  });
  const [epicOpen, setEpicOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);

  // Get all assignees for avatar display
  const allAssignees = React.useMemo(() => {
    if (!sprints || !users) return [];
    const userMap = new Map(users.map((u) => [u.user_id, u]));

    const assigneesSet = new Set<string>();
    sprints.forEach((sprint) => {
      sprint.issues.forEach((issue) => {
        issue.assignees && assigneesSet.add(issue.assignees);
      });
    });

    return Array.from(assigneesSet)
      .map((assigneeId) => userMap.get(assigneeId))
      .filter((user): user is User => !!user);
  }, [sprints, users]);

  // ---------------------------------------------------------------------------
  // Filter logic
  // ---------------------------------------------------------------------------

  const filteredSprints = sprints.map((sprint) => ({
    ...sprint,
    issues: sprint.issues.filter((issue) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          issue.title.toLowerCase().includes(query) ||
          issue.description?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Epic filter
      if (filters.epic !== "all" && issue.epic !== filters.epic) {
        return false;
      }

      // Type filter
      if (filters.type !== "all" && issue.issuetype !== filters.type) {
        return false;
      }

      return true;
    }),
  }));

  // ---------------------------------------------------------------------------
  // Drag handlers
  // ---------------------------------------------------------------------------

  function handleDragStart(
    e: React.DragEvent<HTMLDivElement>,
    issue: Issue,
    sourceSprintId: string
  ) {
    setDraggedItem({ issue, source: sourceSprintId });
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(
    e: React.DragEvent<HTMLDivElement>,
    targetSprintId: string
  ) {
    e.preventDefault();
    if (draggedItem) {
      onDragEnd({
        issue: draggedItem.issue,
        targetBoard: targetSprintId,
      });
      setDraggedItem(null);
    }
  }

  // ---------------------------------------------------------------------------
  // Filter handlers
  // ---------------------------------------------------------------------------

  function handleEpicChange(epicId: string) {
    setFilters((prev) => ({ ...prev, epic: epicId }));
    setEpicOpen(false);
  }

  function handleTypeChange(type: string) {
    setFilters((prev) => ({ ...prev, type }));
    setTypeOpen(false);
  }

  function handleClearFilters() {
    setFilters({ epic: "all", type: "all" });
    setSearchQuery("");
  }

  const hasActiveFilters =
    filters.epic !== "all" || filters.type !== "all" || searchQuery !== "";

  const selectedEpic = epics?.find((e) => e._id === filters.epic);

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-background">
      <div className="flex-shrink-0 px-6 py-6 border-b border-border">
        {/* Header */}
        <h1 className="text-2xl font-semibold text-foreground mb-4">Backlog</h1>

        {/* Search and Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Input — tighter, Jira-width */}
          <div className="relative w-36">
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pr-10 rounded-lg bg-muted border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            ) : (
              <svg
                className="absolute right-3 top-2.5 w-5 h-5 text-muted-foreground pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </div>

          {/* Team Avatars */}
          <div className="flex items-center gap-2">
            <AvatarComponent user={allAssignees} maxShown={4} />
          </div>

          {/* Epic Filter - Jira-style dropdown */}
          {epics && epics.length > 0 && (
            <Popover open={epicOpen} onOpenChange={setEpicOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  role="combobox"
                  aria-expanded={epicOpen}
                  aria-label="Filter by epic"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground hover:bg-muted/80 transition-colors"
                >
                  {filters.epic === "all" ? (
                    "Epic"
                  ) : (
                    <span className="max-w-[120px] truncate">
                      {selectedEpic?.title || "Epic"}
                    </span>
                  )}
                  <ChevronDown size={16} className="text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[250px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search epics..." />
                  <CommandList>
                    <CommandEmpty>No epic found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="all"
                        onSelect={() => handleEpicChange("all")}
                      >
                        <span className="flex-1">All Epics</span>
                        {filters.epic === "all" && (
                          <CheckIcon className="ml-2" />
                        )}
                      </CommandItem>
                      {epics.map((epic) => (
                        <CommandItem
                          key={epic._id}
                          value={epic._id}
                          onSelect={() => epic._id && handleEpicChange(epic._id)}
                        >
                          <span className="flex-1">{epic.title}</span>
                          {filters.epic === epic._id && (
                            <CheckIcon className="ml-2" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}

          {/* Type Filter - Jira-style dropdown */}
          <Popover open={typeOpen} onOpenChange={setTypeOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                role="combobox"
                aria-expanded={typeOpen}
                aria-label="Filter by type"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground hover:bg-muted/80 transition-colors"
              >
                {filters.type === "all" ? "Type" : filters.type}
                <ChevronDown size={16} className="text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      onSelect={() => handleTypeChange("all")}
                    >
                      <span className="flex-1">All Types</span>
                      {filters.type === "all" && (
                        <CheckIcon className="ml-2" />
                      )}
                    </CommandItem>
                    {ISSUE_TYPES.map((type) => (
                      <CommandItem
                        key={type}
                        value={type}
                        onSelect={() => handleTypeChange(type)}
                      >
                        <span className="flex-1 capitalize">{type}</span>
                        {filters.type === type && (
                          <CheckIcon className="ml-2" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              aria-label="Clear all filters"
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}

          {/* Insights Button */}
         <button
          type="button"
          aria-label="View sprint insights"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
            text-foreground hover:bg-muted/60 transition-colors border border-border"
        >
          <BarChart2 className="w-4 h-4" />
          Insights
        </button>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-3 py-2 rounded-lg text-sm font-medium
            bg-[#0052CC] text-white hover:bg-[#0052CC]/90 transition-colors"
        >
          + Create Sprint
        </button>
        </div>

        {/* Active Filters Indicator */}
        {hasActiveFilters && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Active filters:</span>
            {searchQuery && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                Search: "{searchQuery}"
              </span>
            )}
            {filters.epic !== "all" && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                Epic: {selectedEpic?.title}
              </span>
            )}
            {filters.type !== "all" && (
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs capitalize">
                Type: {filters.type}
              </span>
            )}
          </div>
        )}
      </div>

          {/* Content Row - Backlog + Panel side by side */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Scrollable Sprint Sections */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {filteredSprints.map((sprint) => (
              <div
                key={sprint._id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, sprint._id)}
                className="mb-8"
              >
                <SprintSection
                  sprint={sprint}
                  users={users}
                  epics={epics}
                  onDragStart={handleDragStart}
                  onIssueSelect={onIssueSelect}
                  draggedItem={draggedItem}
                />
              </div>
            ))}
          </div>
        </div>
        <CreateSprintModal 
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={(data) => onCreateSprint(data)}
        />

        {/* Issue Detail Panel - Slides in from right, beside content */}
        {selectedIssue && (
          <IssueDetailPanel
            issue={selectedIssue}
            users={users}
            onClose={onCloseIssue}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`w-4 h-4 text-primary ${className || ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
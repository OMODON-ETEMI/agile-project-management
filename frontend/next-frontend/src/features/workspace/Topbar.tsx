"use client";

import { useId, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type View = "board" | "backlog";

export interface TopbarProps {
  /** Page / board title rendered on the left. */
  title: string;
  /** Currently active view tab. */
  view: View;
  /** Called when the user switches view tabs. */
  onViewChange: (view: View) => void;
  /** Called when the user clicks the filter icon button. */
  onFilterClick: () => void;
  /** Called when the user clicks "+ Create". */
  onCreateTask: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VIEWS: { value: View; label: string }[] = [
  { value: "board", label: "Board" },
  { value: "backlog", label: "Backlog" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Topbar({
  title,
  view,
  onViewChange,
  onFilterClick,
  onCreateTask,
}: TopbarProps) {
  const [search, setSearch] = useState("");
  const searchId = useId();
  const tablistId = useId();

  return (
    <header
      className="bg-background border-b border-border sticky top-0 z-40"
      role="banner"
    >
      <div className="flex items-center justify-between px-6 py-4 gap-4">

        {/* ---------------------------------------------------------------- */}
        {/* Left: Title + View Selector                                       */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-foreground truncate">
            {title}
          </h1>

          {/* Tab-list pattern: buttons share a group role so AT announces context */}
          <div
            role="tablist"
            aria-label="View selector"
            id={tablistId}
            className="flex items-center bg-muted rounded-lg p-1 gap-1"
          >
            {VIEWS.map(({ value, label }) => {
              const isSelected = view === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`panel-${value}`}
                  onClick={() => onViewChange(value)}
                  className={[
                    "px-3 py-1 rounded text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isSelected
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Right: Search, Filter, Create                                     */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex items-center gap-2">

          {/* Search — uncontrolled, local state only */}
          <label htmlFor={searchId} className="sr-only">
            Search tasks
          </label>
          <input
            id={searchId}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            autoComplete="off"
            className={[
              "hidden md:block px-3 py-2 rounded-lg bg-muted border border-border",
              "text-sm text-foreground placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent",
              "w-48 transition-colors",
            ].join(" ")}
          />

          {/* Create */}
          <button
            type="button"
            onClick={onCreateTask}
            aria-label="Create new task"
            className={[
              "px-4 py-2 rounded-lg bg-primary text-primary-foreground",
              "text-sm font-medium transition-opacity",
              "hover:opacity-90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            ].join(" ")}
          >
            + Create
          </button>

          {/* Filter */}
          <button
            type="button"
            onClick={onFilterClick}
            aria-label="Filter tasks"
            aria-haspopup="true"
            className={[
              "p-2 rounded-lg transition-colors",
              "hover:bg-muted",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            ].join(" ")}
          >
            <FilterIcon />
          </button>
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FilterIcon() {
  return (
    <svg
      className="w-5 h-5 text-foreground"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  );
}
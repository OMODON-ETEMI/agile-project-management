"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
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
import { User } from "@/src/helpers/type";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------



export interface AssigneeSelectorProps {
  /** User ID of current assignee (single user), or null if unassigned */
  assignedUserId: string | null;
  /** Full list of available users */
  users: User[];
  /** Called when assignee is selected or cleared */
  onAssigneeChange: (userId: string | null) => void;
  /** Optional label text (default: "Assignee") */
  label?: string;
  /** Optional placeholder for search input (default: "Search users...") */
  searchPlaceholder?: string;
  /** Optional empty state text (default: "Unassigned") */
  emptyText?: string;
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AssigneeSelector({
  assignedUserId,
  users,
  onAssigneeChange,
  label = "Assignee",
  searchPlaceholder = "Search users...",
  emptyText = "Unassigned",
}: AssigneeSelectorProps) {
    const [open, setOpen] = useState(false);
  const assignedUser = assignedUserId
    ? users.find((u) => u._id === assignedUserId)
    : null;

  function handleSelect(currentValue: string) {
    setOpen(false);
    if (currentValue === "unassigned") {
      onAssigneeChange(null);
      return;
    }
    const user = users.find(u => u.username === currentValue);
    if (user) {
      onAssigneeChange(user._id as string);
    }
  }
  return (
    <section>
      {/* Label */}
      {label && (
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          {label}
        </label>
      )}
            <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg bg-muted border border-border text-left hover:bg-muted/80"
          >
            <div className="flex items-center gap-2 min-w-0">
              {assignedUser ? (
                <>
                  {assignedUser?.image?.imageFullUrl ? (
                    <img
                      src={assignedUser.image.imageFullUrl}
                      alt={assignedUser.username}
                      className="w-6 h-6 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                      {getUserInitials(assignedUser.username)}
                    </div>
                  )}
                  <span className="text-sm text-foreground truncate">
                    {assignedUser.username}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <UserIcon />
                  </div>
                  <span className="text-muted-foreground">{emptyText}</span>
                </>
              )}
            </div>
            {assignedUser && (
              <div
                role="button"
                aria-label={`Unassign ${assignedUser.username}`}
                className="p-1 rounded-full hover:bg-destructive/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onAssigneeChange(null);
                }}
              >
                <X size={14} className="text-destructive" />
              </div>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup>
                <CommandItem value="unassigned" onSelect={handleSelect}>
                  Unassigned
                </CommandItem>
                {users.map((user) => (
                  <CommandItem
                    key={user.user_id}
                    value={user.username}
                    onSelect={handleSelect}
                  >
                    <div className="flex items-center gap-2">
                      {user?.image?.imageFullUrl ? (
                        <img src={user.image.imageFullUrl} alt={user.username} className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center">
                          {getUserInitials(user.username)}
                        </div>
                      )}
                      <span>{user.username}</span>
                    </div>
                    {assignedUserId === user.user_id && (
                      <Check size={16} className="ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function UserIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

// function CheckIcon() {
//   // This component is no longer used with the popover implementation
//   return <Check className="w-4 h-4 text-primary" />;
// }

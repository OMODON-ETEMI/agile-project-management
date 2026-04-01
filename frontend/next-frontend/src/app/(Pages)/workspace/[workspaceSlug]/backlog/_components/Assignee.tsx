"use client";

import { useState, useMemo } from "react";
import { User } from "@/src/helpers/type";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { X, Check } from "lucide-react";

interface AssigneeSelectorProps {
  assignedUserId: string | null;
  users: User[];
  onAssigneeChange: (userId: string | null) => void;
  label: string;
}

const UserAvatar = ({ user }: { user: User }) => (
    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center">
        {user.username.substring(0, 2).toUpperCase()}
    </div>
);

export default function AssigneeSelector({
  assignedUserId,
  users,
  onAssigneeChange,
  label,
}: AssigneeSelectorProps) {
  const [open, setOpen] = useState(false);

  const assignedUser = useMemo(
    () => users.find((u) => u.user_id === assignedUserId),
    [users, assignedUserId]
  );

  const handleSelect = (userId: string | null) => {
    onAssigneeChange(userId);
    setOpen(false);
  };

  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-2">
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg bg-muted border border-border text-foreground hover:bg-muted/80"
          >
            {assignedUser ? (
              <div className="flex items-center gap-2">
                <UserAvatar user={assignedUser} />
                <span className="text-sm text-foreground">{assignedUser.username}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">Unassigned</span>
            )}
            {assignedUser && (
              <div
                role="button"
                aria-label="Unassign user"
                className="p-1 rounded-full hover:bg-destructive/20"
                onClick={(e) => {
                  e.stopPropagation(); // prevent popover from opening
                  handleSelect(null);
                }}
              >
                <X size={14} className="text-destructive" />
              </div>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search users..." />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup>
                <CommandItem value="unassigned" onSelect={() => handleSelect(null)}>Unassigned</CommandItem>
                {users.map((user) => (
                  <CommandItem key={user.user_id} value={user.username} onSelect={() => handleSelect(user.user_id)}>
                    <div className="flex items-center gap-2"><UserAvatar user={user} /><span>{user.username}</span></div>
                    {assignedUserId === user.user_id && (<Check size={16} className="ml-auto" />)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
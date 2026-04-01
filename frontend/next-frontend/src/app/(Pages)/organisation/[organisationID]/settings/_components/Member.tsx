import { useState } from "react";
import AddMemberRow, { Role, RoleBadge } from "./addMember";
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction
} from '@/components/ui/alert-dialog';
import { UserMinus } from "lucide-react";
import { User, Workspace } from "@/src/helpers/type";
import { useWorkspaceExtras, useWorkspaceMutations } from "@/src/hooks/useWorkspace";
import { formatDate } from "@/src/helpers/formatDate";
import { useOrganisationMembers } from "@/src/lib/api/reactQuery";


interface WorkspaceMember {
  user_id: string;
  username: string;
  email: string;
  role: Role;
  joined_at?: string;
}

export default function WorkspaceMembersSection({ workspace }: { workspace: Workspace }) {

  const { users: members, usersLoading } = useWorkspaceExtras(workspace._id, { users: true, boards: false}) as {
    users: WorkspaceMember[];
    usersLoading: boolean;
  }

  const { data: users, isPending } = useOrganisationMembers(workspace.organisation_id) as {
    data: User[],
    isPending: Boolean,
  }

  const { removeUser } = useWorkspaceMutations()
  const [removeId, setRemoveId] = useState<string | null>(null);
  if (usersLoading || isPending) return null;
  function initials(name: string) {
    return name.split('.').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  return (
    <div className="space-y-3">
      {/* Add member */}
      <AddMemberRow workspaceId={workspace._id} orgUsers={users} onAdded={() => {}} />

      {/* Member list */}
      {members.length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_100px_80px_40px] gap-3 px-4 py-2.5
            bg-muted/40 border-b border-border">
            {['Member', 'Role', 'Joined', ''].map(h => (
              <p key={h} className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{h}</p>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {members.map((m, i) => (
              <motion.div
                key={m.user_id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="grid grid-cols-[1fr_100px_80px_40px] gap-3 px-4 py-3
                  items-center hover:bg-muted/30 transition-colors group"
              >
                {/* Member info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="w-7 h-7 flex-shrink-0">
                    <AvatarFallback className="bg-[#0052CC]/10 text-[#0052CC] text-[10px] font-bold">
                      {initials(m.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{m.username}</p>
                    <p className="text-[10px] font-mono text-muted-foreground truncate">{m.email}</p>
                  </div>
                </div>

                {/* Role */}
                <RoleBadge role={m.role} />

                {/* Joined */}
                <p className="text-[10px] font-mono text-muted-foreground">{formatDate(m.joined_at) ?? '—'}</p>

                {/* Remove */}
                <AlertDialog
                  open={removeId === m.user_id}
                  onOpenChange={open => setRemoveId(open ? m.user_id : null)}
                >
                  <AlertDialogTrigger asChild>
                    <button
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500
                        hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove member"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-sm">Remove {m.username}?</AlertDialogTitle>
                      <AlertDialogDescription className="text-xs">
                        They will lose access to <span className="font-semibold">{workspace.title}</span> immediately.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 hover:bg-red-600 text-white text-xs"
                        onClick={() => {
                            removeUser.mutate({
                                workspace_id: workspace._id,
                                user_id: (m as WorkspaceMember & { _id: string })._id
                            });
                            setRemoveId(null);
                        }}
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
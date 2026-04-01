
import { useState } from "react";
import { Input } from '@/components/ui/input';
import { Check, ChevronDown, Search, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { User } from "@/src/helpers/type";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { addUserToWorkspace } from "@/src/lib/api/workspace";
import { useWorkspaceMutations } from "@/src/hooks/useWorkspace";

const ROLE_CONFIG: Record<Role, { label: string; color: string; bg: string; border: string }> = {
    admin: { label: 'Admin', color: 'text-[#0052CC]', bg: 'bg-[#0052CC]/8', border: 'border-[#0052CC]/20' },
    developer: { label: 'Developer', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
    viewer: { label: 'Viewer', color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200' },
};

export type Role = 'admin' | 'developer' | 'viewer';

export function RoleBadge({ role }: { role: Role }) {
    const cfg = ROLE_CONFIG[role.toLocaleLowerCase() as Role];
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold
      border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            {cfg.label}
        </span>
    );
}

function RoleSelector({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
    const [open, setOpen] = useState(false);
    const cfg = ROLE_CONFIG[value];

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold
          transition-all ${cfg.bg} ${cfg.color} ${cfg.border} hover:brightness-95`}
            >
                {cfg.label}
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
              rounded-xl shadow-xl overflow-hidden py-1 min-w-[110px]"
                    >
                        {(Object.keys(ROLE_CONFIG) as Role[]).map(r => (
                            <button
                                key={r}
                                onClick={() => { onChange(r); setOpen(false); }}
                                className="w-full flex items-center justify-between px-3 py-2 text-xs
                  hover:bg-gray-50 transition-colors"
                            >
                                <RoleBadge role={r} />
                                {r === value && <Check className="w-3 h-3 text-[#0052CC]" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function AddMemberRow({ workspaceId, onAdded, orgUsers }: {
    workspaceId: string;
    orgUsers: User[];
    onAdded: () => void;
}) {
    const [userId, setUserId] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [role, setRole] = useState<Role>('developer');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const { addUser } = useWorkspaceMutations()
    const filteredUsers = orgUsers?.filter(u =>
    (u.username.toLowerCase().includes(userId.toLowerCase()) ||
        u.email.toLowerCase().includes(userId.toLowerCase()))
    ).slice(0, 5) || [];

    function initials(name: string) {
        return name.split('.').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    async function handleAdd() {
        const targetId = selectedUser ? selectedUser.user_id : userId.trim();
        if (!targetId) { setError('User ID or email is required'); return; }
        setError('');
        try {
            setLoading(true);
            await addUser.mutateAsync({ workspace_id: workspaceId, user_id: targetId, role })
            setUserId('');
            setSelectedUser(null);
            onAdded();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="rounded-xl border border-dashed border-[#0052CC]/30 bg-[#0052CC]/3 p-4">
            <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-[#0052CC]" />
                Invite a member
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1" onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    <Input
                        value={userId}
                        onChange={e => {
                            setUserId(e.target.value);
                            setSelectedUser(null);
                            setError('');
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Search by name or email..."
                        className="pl-9 h-9 text-sm border-gray-200 focus:border-[#0052CC] focus:ring-[#0052CC]/20"
                    />
                    <AnimatePresence>
                        {showSuggestions && userId && filteredUsers.length > 0 && !selectedUser && (
                            <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200
                                rounded-xl shadow-lg z-50 overflow-hidden max-h-[200px] overflow-y-auto"
                            >
                                {filteredUsers.map(user => (
                                    <button
                                        key={user.user_id}
                                        onClick={() => { setUserId(user.username ?? ''); setSelectedUser(user); setShowSuggestions(false); }}
                                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 text-left transition-colors"
                                    >
                                        <Avatar className="w-6 h-6 flex-shrink-0">
                                            <AvatarFallback className="bg-[#0052CC]/10 text-[#0052CC] text-[10px] font-bold">
                                                {initials(user.username)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-foreground truncate">{user.username}</p>
                                            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <RoleSelector value={role} onChange={setRole} />
                <button
                    onClick={handleAdd}
                    disabled={loading}
                    className="h-9 px-4 rounded-lg text-xs font-semibold bg-[#0052CC] text-white
            hover:bg-[#0065FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-1.5 flex-shrink-0"
                >
                    {loading ? (
                        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    ) : <UserPlus className="w-3.5 h-3.5" />}
                    Invite
                </button>
            </div>
            <AnimatePresence>
                {error && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-xs text-red-500 mt-2 font-medium">
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
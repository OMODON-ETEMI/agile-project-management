'use client'
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction
} from '@/components/ui/alert-dialog';

import { Workspace } from '@/src/helpers/type';
import WorkspaceMembersSection from './Member';

export default function WorkspaceRow({ workspace, onDelete }: {
  workspace: Workspace;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-background hover:bg-muted/30 transition-colors">
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-3 flex-1 min-w-0 text-left"
        >
          <div className="w-7 h-7 rounded-lg bg-[#0052CC] flex items-center justify-center
            text-white text-[11px] font-bold flex-shrink-0">
            {workspace.title.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate">{workspace.title}</p>
            <p className="text-[10px] font-mono text-muted-foreground">
              {workspace.members_count ?? 0} member{Number(workspace.members_count) !== 1 ? 's' : ''}
            </p>
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </button>

        {/* Delete */}
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogTrigger asChild>
            <button
              className="p-1.5 rounded-lg text-gray-300 hover:text-red-500
                hover:bg-red-50 transition-colors flex-shrink-0"
              title="Delete workspace"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-sm">Delete "{workspace.title}"?</AlertDialogTitle>
              <AlertDialogDescription className="text-xs">
                This will permanently delete the workspace and all its boards and issues. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600 text-white text-xs"
                onClick={() => { onDelete(workspace._id); setDeleteOpen(false); }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Expanded members section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border"
          >
            <div className="p-4">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                Members
              </p>
              <WorkspaceMembersSection workspace={workspace} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
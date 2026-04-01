// components/WorkspacesSection.tsx

"use client"
import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Layers, Plus, Clock, Users, FolderOpen } from "lucide-react";
import { Organisation } from "@/src/helpers/type";
import { CreateWorkspaceModal } from "@/src/features/workspace/createWorkspace";
import { useWorkspaceContext } from "@/src/Authentication/workspacecontext";
import Loading from "@/src/app/(Api)/loading";
import { formatDate } from "@/src/helpers/formatDate";

interface WorkspacesSectionProps {
  organisation: Organisation
}

const statusMap = {
  active: { dot: "bg-green-500", ring: "bg-green-400", label: "Active" },
  draft:  { dot: "bg-yellow-500", ring: "bg-yellow-400", label: "Draft" },
  archived: { dot: "bg-gray-400", ring: "bg-gray-300", label: "Archived" },
};

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ organisation }: { organisation: Organisation }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-[#0052CC]/8 border border-[#0052CC]/15
        flex items-center justify-center mb-5">
        <FolderOpen className="w-7 h-7 text-[#0052CC]/60" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">No workspaces yet</h3>
      <p className="text-sm font-mono text-gray-400 mb-6 max-w-xs">
        Create your first workspace to start organizing projects and collaborating.
      </p>
      <CreateWorkspaceModal organisation={organisation} />
    </motion.div>
  );
}


// ── Workspace Card ────────────────────────────────────────────────────────────
function WorkspaceCard({
  wrk,
  index,
  onSelect,
}: {
  wrk: any;
  index: number;
  onSelect: () => void;
}) {
  const status = statusMap.active; // swap to statusMap[wrk.status] when available

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/workspace/${wrk.slug}`} onClick={onSelect}>
        <div
          className="group relative bg-white/80 backdrop-blur-xl border border-white/60
            rounded-2xl shadow-md shadow-gray-200/50 overflow-hidden h-full
            hover:shadow-xl hover:shadow-[#0052CC]/8 hover:-translate-y-0.5
            transition-all duration-200 cursor-pointer"
        >
          {/* Top accent */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0052CC]/20 to-transparent" />

          {/* Blue left edge on hover */}
          <div className="absolute inset-y-0 left-0 w-0.5 bg-[#0052CC] scale-y-0 group-hover:scale-y-100
            transition-transform duration-200 origin-center rounded-full" />

          <div className="p-5 flex flex-col h-full">
            {/* Status + title row */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2 flex-1">
                {wrk.title}
              </h3>
              {/* Pulsing status dot */}
              <span className="relative flex h-2.5 w-2.5 mt-1 flex-shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${status.ring} opacity-60`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${status.dot}`} />
              </span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
              <span className="flex items-center gap-1">
                <FolderOpen className="w-3 h-3" />
                <span>{wrk.members_count ?? 0} projects</span>
              </span>
              <span className="text-gray-200">•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{wrk.members_count ?? 0} members</span>
              </span>
            </div>

             <div className="mt-auto">
                {/* Divider */}
              <div className="h-px bg-gradient-to-r from-[#0052CC]/8 via-gray-100 to-transparent mb-3" />

              {/* Last updated */}
              <p className="flex items-center gap-1.5 font-mono text-[11px] text-gray-400">
                <Clock className="w-3 h-3 flex-shrink-0" />
                {formatDate(wrk?.createdAt) ?? "—"}
              </p>
             </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}


// ── Workspaces Section ────────────────────────────────────────────────────────

export const WorkspacesSection = ({ organisation }: WorkspacesSectionProps) => {
  const { workspaces, workspacesLoading, setActiveWorkspace, setOrganisationId } =
    useWorkspaceContext();

  useEffect(() => {
    if (organisation) setOrganisationId(organisation._id);
  }, [organisation]);

  if (workspacesLoading) return <Loading />;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#0052CC]" />
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
            Workspaces
          </h2>
          {workspaces.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#0052CC]/8 border border-[#0052CC]/15
              text-[10px] font-mono font-semibold text-[#0052CC]">
              {workspaces.length}
            </span>
          )}
        </div>
        <CreateWorkspaceModal organisation={organisation} />
      </div>

      {/* Empty state */}
      {workspaces.length === 0 ? (
        <div className="relative bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl
          shadow-md shadow-gray-200/50 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0052CC]/20 to-transparent" />
          <EmptyState organisation={organisation} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((wrk, index) => (
            <WorkspaceCard
              key={wrk._id ?? index}
              wrk={wrk}
              index={index}
              onSelect={() => {
                const ws = workspaces.find((w) => w._id === wrk._id);
                if (ws) setActiveWorkspace(ws);
              }}
            />
          ))}
        </div>
      )}
    </motion.section>
  );
};
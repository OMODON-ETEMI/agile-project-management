"use client"

import { motion } from "framer-motion";
import { Activity, AlertCircle } from "lucide-react";
import { Workspace } from "@/src/helpers/type";
import {useRecentWorkspaces, useWorkspace} from "@/src/hooks/useWorkspace";
import Loading from "@/src/app/(Api)/loading";
import { formatDate } from "@/src/helpers/formatDate";

export const RecentActivitySection = () => {
  // const { recentWorkspaces, recentLoading, recentError } = useWorkspace({ enableRecent: true });

  const { data: recentWorkspaces, isPending, error } = useRecentWorkspaces(true)
  if (isPending) return <Loading />;

  if (error) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-50 border border-red-100 text-red-500">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <p className="text-xs font-mono">Failed to load recent activity. Try refreshing.</p>
      </div>
    );
  }

  const recentList: Workspace[] = recentWorkspaces || [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {/* Section label */}
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-[#0052CC]" />
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
          Recent Activity
        </h2>
      </div>

      {/* Card */}
      <div className="relative bg-white/80 backdrop-blur-xl border border-white/60
        rounded-2xl shadow-md shadow-gray-200/50 overflow-hidden">
        {/* Top accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0052CC]/20 to-transparent" />

        {recentList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#0052CC]/8 border border-[#0052CC]/15
              flex items-center justify-center mb-4">
              <Activity className="w-5 h-5 text-[#0052CC]/50" />
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">No recent activity</p>
            <p className="text-xs font-mono text-gray-400">Workspace updates will appear here.</p>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            {/* Timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-[#0052CC]/30 via-gray-200 to-transparent" />

              <div className="space-y-1">
                {recentList.map((activity, index) => (
                  <motion.div
                    key={activity._id || index}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="relative pl-7 py-3 rounded-xl hover:bg-gray-50/80 transition-colors duration-150 group"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-4 flex items-center justify-center">
                      <span className="relative flex h-3.5 w-3.5">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-[#0052CC]/20
                          group-hover:bg-[#0052CC]/30 transition-colors" />
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#0052CC]
                          scale-[0.55] ring-2 ring-white" />
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex items-start justify-between gap-4 min-w-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 leading-snug">
                          {activity.title}
                        </p>
                        {activity.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                            {activity.description}
                          </p>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-gray-400 flex-shrink-0 mt-0.5">
                        {activity.createdAt
                          ? formatDate(activity.createdAt) : "—"}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
};
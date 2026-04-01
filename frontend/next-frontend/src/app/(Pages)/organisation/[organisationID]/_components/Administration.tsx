// components/AdministratorsSection.tsx
"use client"
import { motion } from "framer-motion";
import { Mail, ShieldCheck } from "lucide-react";
import { Administrator } from "@/src/helpers/type";

interface AdministratorsSectionProps {
  administrators: Administrator;
}

export const AdministratorsSection = ({ administrators }: AdministratorsSectionProps) => {
  const initials =
    `${administrators.firstname?.charAt(0) ?? ""}${administrators.lastname?.charAt(0) ?? ""}`.toUpperCase();

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {/* Section label */}
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-4 h-4 text-[#0052CC]" />
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
          Administrators
        </h2>
      </div>

      {/* Card */}
      <div
        className="relative bg-white/80 backdrop-blur-xl border border-white/60
          rounded-2xl shadow-lg shadow-gray-200/50 overflow-hidden
          transition-shadow duration-200 hover:shadow-xl hover:shadow-gray-200/60"
      >
        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0052CC]/25 to-transparent" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4">

          {/* Left — Avatar + Info */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-11 h-11 rounded-xl bg-[#0052CC] flex items-center justify-center
                  shadow-md shadow-[#0052CC]/25 text-white font-bold text-sm"
              >
                {initials}
              </div>
              {/* Active pulse */}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white" />
              </span>
            </div>

            {/* Name + email */}
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm sm:text-base leading-tight truncate">
                {administrators.firstname} {administrators.lastname}
              </p>
              <p className="flex items-center gap-1 text-xs font-mono text-gray-400 mt-0.5 truncate">
                <Mail className="w-3 h-3 flex-shrink-0" />
                {administrators.email}
              </p>
            </div>
          </div>

          {/* Right — Status badge */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl
              bg-green-50 border border-green-200/70 self-start sm:self-auto"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="text-xs font-semibold text-green-700 font-mono uppercase tracking-wide">
              Active
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
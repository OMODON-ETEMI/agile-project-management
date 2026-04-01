"use client"

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { Organisation } from "@/src/helpers/type";
import { formatDate } from "@/src/helpers/formatDate";

function OrgAvatar({
  title,
  size = "md",
}: {
  title: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-11 h-11 text-base",
    lg: "w-14 h-14 text-xl",
  };
  return (
    <div
      className={`${sizes[size]} rounded-xl bg-[#0052CC]/10 border border-[#0052CC]/20 
        flex items-center justify-center font-bold text-[#0052CC] flex-shrink-0`}
    >
      {title.charAt(0).toUpperCase()}
    </div>
  );
}

// ─── Org Switcher Dropdown ────────────────────────────────────────────────────

export default function OrgSwitcher({
  current,
  all,
  onSwitch,
}: {
  current: Organisation;
  all: Organisation[];
  onSwitch?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen((o) => !o)}
        className="group flex items-center gap-2 px-3 py-2 rounded-xl 
          bg-white border border-gray-200 shadow-sm
          hover:border-[#0052CC]/40 hover:shadow-md
          transition-all duration-200 cursor-pointer z-[999]"
      >
        <OrgAvatar title={current.title} size="sm" />
        <span className="font-semibold text-gray-800 text-sm max-w-[140px] truncate sm:max-w-[200px]">
          {current.title}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0052CC] transition-colors" />
        </motion.div>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 z-50 min-w-[220px] w-max
              bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-200/80
              overflow-hidden py-1.5"
          >
            <p className="px-3 pt-1 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              Your Organisations
            </p>
            {all.map((org) => {
              const isActive = org._id === current._id;
              return (
                <button
                  key={org._id}
                  onClick={() => {
                    onSwitch?.(org.slug);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left
                    transition-colors duration-150 group
                    ${isActive ? "bg-[#0052CC]/5" : "hover:bg-gray-50"}`}
                >
                  <OrgAvatar title={org.title} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isActive ? "text-[#0052CC]" : "text-gray-700"}`}>
                      {org.title}
                    </p>
                    {org.createdAt && (
                      <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                        Since {formatDate(org.createdAt as string)}
                      </p>
                    )}
                  </div>
                  {isActive && (
                    <Check className="w-3.5 h-3.5 text-[#0052CC] flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

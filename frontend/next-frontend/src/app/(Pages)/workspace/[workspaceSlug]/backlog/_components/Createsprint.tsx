"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, ChevronDown, LayoutGrid, ListTodo, Zap, Upload, ImageIcon, CheckCircle2 } from "lucide-react";
import { Board } from "@/src/helpers/type";

// ─── Types ────────────────────────────────────────────────────────────────────

type BoardType = "Board" | "Backlog" | "Epic";

// interface CreateSprintPayload {
//   title: string;
//   type: BoardType;
//   startDate: string | null;
//   endDate: string | null;
//   image: { url?: string; name?: string } | null;
// }

interface CreateSprintModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Board>) => Promise<void> | void;
  workspaceTitle?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_OPTIONS: { value: BoardType; label: string; description: string; icon: React.ReactNode; color: string; bg: string }[] = [
  {
    value: "Board",
    label: "Board",
    description: "Kanban-style columns for tracking issue progress",
    icon: <LayoutGrid className="w-4 h-4" />,
    color: "text-[#0052CC]",
    bg: "bg-[#0052CC]",
  },
  {
    value: "Backlog",
    label: "Backlog",
    description: "Sprint-based list for planning and prioritisation",
    icon: <ListTodo className="w-4 h-4" />,
    color: "text-green-600",
    bg: "bg-green-500",
  },
  {
    value: "Epic",
    label: "Epic",
    description: "High-level grouping for a body of related work",
    icon: <Zap className="w-4 h-4" />,
    color: "text-purple-600",
    bg: "bg-purple-500",
  },
];

// ─── Date Input ───────────────────────────────────────────────────────────────

function DateInput({ label, value, onChange, min }: {
  label: string; value: string; onChange: (v: string) => void; min?: string;
}) {
  return (
    <div className="flex-1 min-w-0">
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="date"
          value={value}
          min={min}
          onChange={e => onChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm
            text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20
            focus:border-[#0052CC] transition-all hover:border-gray-300
            [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute
            [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full
            [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        />
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function CreateSprintModal({ open, onClose, onSubmit, workspaceTitle }: CreateSprintModalProps) {
  const [title, setTitle]           = useState("");
  const [startDate, setStartDate]   = useState("");
  const [endDate, setEndDate]       = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [titleError, setTitleError] = useState("");
  const [dragOver, setDragOver]     = useState(false)

  async function handleSubmit() {
    if (!title.trim()) { setTitleError("Sprint name is required"); return; }
    setTitleError("");
    setSubmitting(true);

    await onSubmit({
      title: title.trim(),
      startDate: startDate || undefined,
      endDate:   endDate   || undefined,
      image: imageUrl ? { imageFullUrl: imageUrl } : undefined,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSubmitting(false);
      handleClose();
    }, 900);
  }

  function handleClose() {
    setTitle(""); setStartDate(""); setEndDate("");
    setImageUrl(""); setSubmitting(false); setSubmitted(false);
    setTitleError("");
    onClose();
  }

  const canSubmit = title.trim().length > 0 && !submitting;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 w-full max-w-lg
              border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">

              {/* ── Header ── */}
              <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Create sprint</h2>
                  {workspaceTitle && (
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{workspaceTitle}</p>
                  )}
                </div>
                <button onClick={handleClose}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ── Body ── */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

                {/* Sprint name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Sprint name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => { setTitle(e.target.value); if (e.target.value) setTitleError(""); }}
                    placeholder="e.g. Sprint 4 — Authentication"
                    autoFocus
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800
                      placeholder-gray-400 focus:outline-none transition-all
                      ${titleError
                        ? "border-red-300 focus:ring-2 focus:ring-red-100 bg-red-50/30"
                        : "border-gray-200 focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC] hover:border-gray-300"
                      }`}
                  />
                  <AnimatePresence>
                    {titleError && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-xs text-red-500 mt-1.5 font-medium">
                        {titleError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Date range — only for Board & Backlog */}
                <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        Sprint dates <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <DateInput label="Start date" value={startDate} onChange={setStartDate} />
                        <div className="mt-5 text-gray-300 font-medium text-sm flex-shrink-0">→</div>
                        <DateInput label="End date" value={endDate} onChange={e => setEndDate(e)} min={startDate} />
                      </div>
                      {/* Duration pill */}
                      <AnimatePresence>
                        {startDate && endDate && (
                          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                              bg-[#0052CC]/8 border border-[#0052CC]/15 text-[11px] font-mono text-[#0052CC]">
                            <Calendar className="w-3 h-3" />
                            {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                </AnimatePresence>

                {/* Cover image */}
                <div>
  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
    Cover image URL <span className="text-gray-400 font-normal">(optional)</span>
  </label>
  <input
    type="url"
    value={imageUrl}
    onChange={e => setImageUrl(e.target.value)}
    placeholder="https://dribbble.com/shots/..."
    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
      text-gray-800 placeholder-gray-400 focus:outline-none transition-all
      hover:border-gray-300 focus:ring-2 focus:ring-[#0052CC]/20 focus:border-[#0052CC]"
  />
  <AnimatePresence>
    {imageUrl && (
      <motion.div
        initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
        className="mt-2 rounded-xl overflow-hidden border border-gray-200 h-28 relative group"
      >
        <img
          src={imageUrl}
          alt="Cover preview"
          className="w-full h-full object-cover"
          onError={e => (e.currentTarget.style.display = "none")}
        />
        <button
          onClick={() => setImageUrl("")}
          className="absolute top-2 right-2 p-1 bg-black/50 rounded-lg text-white
            opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-3 h-3" />
        </button>
      </motion.div>
    )}
  </AnimatePresence>
</div>
              </div>

              {/* ── Footer ── */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/60">
                <p className="text-[11px] text-gray-400 font-mono">
                  Fields marked <span className="text-red-400">*</span> are required
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600
                      hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className={`relative px-5 py-2 rounded-xl text-sm font-semibold text-white
                      transition-all duration-200 overflow-hidden min-w-[100px]
                      ${canSubmit
                        ? "bg-[#0052CC] hover:bg-[#0065FF] shadow-md shadow-[#0052CC]/25 active:scale-[0.98]"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                  >
                    <AnimatePresence mode="wait">
                      {submitted ? (
                        <motion.span key="done"
                          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-1.5 justify-center">
                          <CheckCircle2 className="w-4 h-4" /> Created!
                        </motion.span>
                      ) : submitting ? (
                        <motion.span key="loading"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="flex items-center gap-1.5 justify-center">
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Creating...
                        </motion.span>
                      ) : (
                        <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          Create sprint
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
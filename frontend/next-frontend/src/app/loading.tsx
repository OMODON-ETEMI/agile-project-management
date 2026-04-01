"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Assembling your workspace...",
  "Loading your boards...",
  "Syncing team activity...",
  "Fetching your sprints...",
  "Almost there...",
];

export default function GlobalLoading() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, 300);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background overflow-hidden relative">

      {/* ── Ambient background orbs ── */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#0052CC]/5 blur-3xl -top-32 -left-32 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-[#0052CC]/4 blur-3xl bottom-0 right-0 pointer-events-none" />

      {/* ── Main content ── */}
      <div className="relative flex flex-col items-center gap-8 select-none">

        {/* Logo mark */}
        <div className="relative">
          {/* Outer pulse ring */}
          <span className="absolute inset-0 rounded-2xl bg-[#0052CC]/10 animate-ping" style={{ animationDuration: "2s" }} />
          {/* Card */}
          <div className="relative w-16 h-16 rounded-2xl bg-[#0052CC] flex items-center justify-center shadow-xl shadow-[#0052CC]/30">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              {/* Simplified Jira-style bolt / T shape */}
              <rect x="5" y="5" width="8" height="8" rx="1.5" fill="white" opacity="0.9"/>
              <rect x="15" y="5" width="8" height="8" rx="1.5" fill="white" opacity="0.5"/>
              <rect x="5" y="15" width="8" height="8" rx="1.5" fill="white" opacity="0.5"/>
              <rect x="15" y="15" width="8" height="8" rx="1.5" fill="white" opacity="0.9"/>
            </svg>
          </div>
        </div>

        {/* Taskify wordmark */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-lg font-bold text-foreground tracking-tight">Taskify</p>
          {/* Rotating message */}
          <p
            className="text-xs font-mono text-muted-foreground transition-all duration-300"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(4px)" }}
          >
            {MESSAGES[msgIndex]}
          </p>
        </div>

        {/* ── Segmented progress bar ── */}
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-1 rounded-full bg-[#0052CC] animate-pulse"
              style={{
                width: i === 2 ? "24px" : "8px",
                animationDelay: `${i * 0.15}s`,
                animationDuration: "1.2s",
                opacity: 0.3 + i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
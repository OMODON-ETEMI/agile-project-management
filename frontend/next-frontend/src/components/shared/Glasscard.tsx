"use client"

export default function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative bg-white/80 backdrop-blur-xl border border-white/60
        rounded-2xl shadow-xl shadow-gray-200/60 overflow-visible ${className}`}
    >
      {/* Subtle top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0052CC]/20 to-transparent" />
      {children}
    </div>
  );
}
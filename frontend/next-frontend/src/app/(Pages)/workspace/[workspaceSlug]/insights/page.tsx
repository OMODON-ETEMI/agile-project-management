"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingDown, Layers3, Target, CheckCircle2,
  AlertTriangle, ArrowUpRight, ArrowDownRight, Minus,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { burndownApi, cummulativeApi } from "@/src/lib/api/board";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BurndownPoint {
  date: string;
  ideal: number;
  actual: number;
  scope?: number;
}

interface BurndownData {
  sprintID: string;
  totalPoints: number;
  completedPoints: number;
  remainingPoints: number;
  netScopeChange: number;
  burndown: BurndownPoint[];
}

interface FlowPoint {
  date: string;
  Backlog: number;
  "To Do": number;
  "In Progress": number;
  Done: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pct(part: number, total: number) {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

function formatDate(raw: string) {
  return new Date(raw).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function healthLabel(remaining: number, ideal: number) {
  const ratio = remaining / (ideal || 1);
  if (ratio <= 0.85) return { label: "On Track",  variant: "default" as const,     Icon: ArrowDownRight };
  if (ratio <= 1.1)  return { label: "At Risk",   variant: "secondary" as const,   Icon: Minus };
  return               { label: "Behind",    variant: "destructive" as const, Icon: ArrowUpRight };
}

// ─── Recharts Legend (theme-aware) ───────────────────────────────────────────

function ChartLegend({ payload }: any) {
  if (!payload?.length) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 mt-3">
      {payload.map((entry: any) => (
        <span key={entry.value} className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
          <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: entry.color, opacity: 0.85 }} />
          {entry.value}
        </span>
      ))}
    </div>
  );
}

// ─── Custom Tooltips (theme-aware) ────────────────────────────────────────────

function BurndownTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-xl px-4 py-3 shadow-2xl">
      <p className="font-mono text-xs text-muted-foreground mb-2">{label}</p>
      {payload.map((p: any) =>
        p.value !== null && (
          <div key={p.name} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
            <span className="text-foreground/70 capitalize">{p.name}</span>
            <span className="ml-auto font-mono text-foreground font-semibold">{p.value} pts</span>
          </div>
        )
      )}
    </div>
  );
}

function FlowTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-xl px-4 py-3 shadow-2xl">
      <p className="font-mono text-xs text-muted-foreground mb-2">{label}</p>
      {[...payload].reverse().map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.fill }} />
          <span className="text-foreground/70">{p.name}</span>
          <span className="ml-auto font-mono text-foreground font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, accent = false, delay = 0,
}: {
  label: string; value: string | number; sub?: string; accent?: boolean; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`relative rounded-2xl p-5 border overflow-hidden ${
        accent
          ? "bg-[#0052CC] border-[#0052CC]/50 shadow-lg shadow-[#0052CC]/20"
          : "bg-card border-border"
      }`}
    >
      {accent && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      )}
      <p className={`font-mono text-[11px] uppercase tracking-widest mb-2 ${
        accent ? "text-white/60" : "text-muted-foreground"
      }`}>
        {label}
      </p>
      <p className={`text-3xl font-bold tabular-nums ${accent ? "text-white" : "text-foreground"}`}>
        {value}
      </p>
      {sub && (
        <p className={`font-mono text-xs mt-1 ${accent ? "text-white/60" : "text-muted-foreground"}`}>
          {sub}
        </p>
      )}
    </motion.div>
  );
}

// ─── Tab type ─────────────────────────────────────────────────────────────────

type Tab = "burndown" | "flow";

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SprintInsightsPage() {
  const searchParams = useSearchParams();
  const sprintId     = searchParams.get("sprint") ?? "";
  const defaultTab   = (searchParams.get("tab") as Tab) ?? "burndown";

  const [tab, setTab]           = useState<Tab>(defaultTab);
  const [burndown, setBurndown] = useState<BurndownData | null>(null);
  const [flow, setFlow]         = useState<FlowPoint[]>([]);
  const [loading, setLoading]   = useState(true);

  const loadData = useCallback(async (isMounted = true) => {
    if (!sprintId) return;
    setLoading(true);
    try {
      const [burndownData, cumulativeData] = await Promise.all([
        burndownApi(sprintId),
        cummulativeApi(sprintId),
      ]);
      if (isMounted) {
        setBurndown(burndownData);
        setFlow(cumulativeData);
      }
    } catch (err) {
      console.error("Failed to fetch sprint insights:", err);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [sprintId]);

  useEffect(() => {
    let isMounted = true;
    loadData(isMounted);
    return () => { isMounted = false; };
  }, [loadData]);

  const formatted     = burndown?.burndown.map((pt) => ({ ...pt, date: formatDate(pt.date) }));
  const formattedFlow = flow.map((pt) => ({ ...pt, date: formatDate(pt.date) }));

  if (!burndown) return null;

  const lastActual    = burndown.burndown.filter((d) => d.actual !== null).at(-1);
  const lastIdeal     = burndown.burndown.find((d) => d.date === lastActual?.date)?.ideal ?? 1;
  const health        = healthLabel(lastActual?.actual ?? 0, lastIdeal);
  const HealthIcon    = health.Icon;
  const completionPct = pct(burndown.completedPoints, burndown.totalPoints);

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Subtle accent orbs — visible on both light and dark */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-[#0052CC]/4 blur-[120px] -top-48 -right-48" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[#0052CC]/3 blur-[100px] bottom-0 left-0" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest">
                Sprint Insights
              </span>
              <Badge variant="outline" className="font-mono text-[10px] text-[#0052CC] border-[#0052CC]/30 bg-[#0052CC]/8">
                {sprintId}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Sprint Analytics
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={health.variant} className="flex items-center gap-1.5 px-3 py-1.5 text-sm">
              <HealthIcon className="w-3.5 h-3.5" />
              {health.label}
            </Badge>
            <button
              onClick={() => loadData()}
              className="p-2 rounded-xl border border-border text-muted-foreground
                hover:text-foreground hover:border-foreground/20 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </motion.div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Points" value={burndown.totalPoints}     sub="sprint scope"             accent delay={0}    />
          <StatCard label="Completed"    value={burndown.completedPoints} sub={`${completionPct}% done`}        delay={0.05} />
          <StatCard label="Remaining"    value={burndown.remainingPoints} sub="points left"                     delay={0.1}  />
          <StatCard
            label="Scope Δ"
            value={burndown.netScopeChange > 0 ? `+${burndown.netScopeChange}` : burndown.netScopeChange}
            sub="net change"
            delay={0.15}
          />
        </div>

        {/* ── Progress bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-card border border-border p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Sprint Completion</p>
            <p className="font-mono text-sm font-semibold text-foreground">{completionPct}%</p>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-[#0052CC] to-[#2684FF]"
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="font-mono text-[10px] text-muted-foreground">0 pts</span>
            <span className="font-mono text-[10px] text-muted-foreground">{burndown.totalPoints} pts</span>
          </div>
        </motion.div>

        {/* ── Tab switcher ── */}
        <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-2xl w-fit">
          {([
            { id: "burndown", label: "Burndown",        Icon: TrendingDown },
            { id: "flow",     label: "Cumulative Flow", Icon: Layers3      },
          ] as { id: Tab; label: string; Icon: any }[]).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                tab === id
                  ? "bg-[#0052CC] text-white shadow-lg shadow-[#0052CC]/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Charts ── */}
        <AnimatePresence mode="wait">

          {tab === "burndown" && (
            <motion.div
              key="burndown"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl bg-card border border-border p-6"
            >
              <div className="mb-6">
                <h2 className="text-base font-bold text-foreground">Burndown Chart</h2>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">
                  Ideal vs actual story point completion
                </p>
              </div>

              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={formatted} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid stroke="currentColor" strokeOpacity={0.06} strokeDasharray="4 4" />
                  <XAxis
                    dataKey="date"
                    interval="preserveStartEnd"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<BurndownTooltip />} />
                  <Legend content={<ChartLegend />} />
                  <Line type="monotone" dataKey="ideal"  stroke="hsl(var(--muted-foreground))" strokeWidth={2}   strokeDasharray="6 4" dot={false} name="Ideal"  />
                  <Line type="monotone" dataKey="actual" stroke="#2684FF"                       strokeWidth={2.5}
                    dot={{ fill: "#2684FF", r: 4, strokeWidth: 2, stroke: "hsl(var(--card))" }}
                    activeDot={{ r: 6, fill: "#2684FF", stroke: "hsl(var(--card))", strokeWidth: 2 }}
                    connectNulls={false} name="Actual"
                  />
                  <Line type="monotone" dataKey="scope"  stroke="#ef4444" strokeOpacity={0.5}  strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="Scope"  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {tab === "flow" && (
            <motion.div
              key="flow"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl bg-card border border-border p-6"
            >
              <div className="mb-6">
                <h2 className="text-base font-bold text-foreground">Cumulative Flow</h2>
                <p className="font-mono text-xs text-muted-foreground mt-0.5">
                  Issue distribution across statuses over time
                </p>
              </div>

              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={formattedFlow} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="gradDone"       x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="gradInProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#2684FF" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#2684FF" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="gradTodo"       x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#a78bfa" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="gradBacklog"    x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#64748b" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="currentColor" strokeOpacity={0.06} strokeDasharray="4 4" />
                  <XAxis
                    dataKey="date"
                    interval="preserveStartEnd"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<FlowTooltip />} />
                  <Legend content={<ChartLegend />} />
                  <Area type="monotone" dataKey="Backlog"     stackId="1" stroke="#64748b" fill="url(#gradBacklog)"    strokeWidth={1.5} name="Backlog"     />
                  <Area type="monotone" dataKey="To Do"       stackId="1" stroke="#a78bfa" fill="url(#gradTodo)"       strokeWidth={1.5} name="To Do"       />
                  <Area type="monotone" dataKey="In Progress" stackId="1" stroke="#2684FF" fill="url(#gradInProgress)" strokeWidth={1.5} name="In Progress" />
                  <Area type="monotone" dataKey="Done"        stackId="1" stroke="#22c55e" fill="url(#gradDone)"       strokeWidth={1.5} name="Done"        />
                </AreaChart>
              </ResponsiveContainer>

              {/* Status summary badges */}
              <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-border">
                {([
                  { label: "Backlog",     color: "#64748b", value: formattedFlow.at(-1)?.Backlog },
                  { label: "To Do",       color: "#a78bfa", value: formattedFlow.at(-1)?.["To Do"] },
                  { label: "In Progress", color: "#2684FF", value: formattedFlow.at(-1)?.["In Progress"] },
                  { label: "Done",        color: "#22c55e", value: formattedFlow.at(-1)?.Done },
                ]).map(({ label, color, value }) => (
                  <Badge key={label} variant="outline" className="gap-1.5 font-mono text-xs text-foreground border-border">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    {label}
                    <span className="font-bold ml-1">{value ?? 0}</span>
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Insight callouts ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid sm:grid-cols-3 gap-3 pb-8"
        >
          {([
            {
              Icon: Target,
              variant: "outline" as const,
              title: "Velocity",
              body: `${burndown.completedPoints} pts completed — tracking at ${pct(burndown.completedPoints, burndown.totalPoints)}% of target.`,
            },
            {
              Icon: AlertTriangle,
              variant: burndown.netScopeChange > 0 ? "secondary" as const : "outline" as const,
              title: "Scope Change",
              body: burndown.netScopeChange > 0
                ? `+${burndown.netScopeChange} pts added mid-sprint. Watch for scope creep.`
                : "No net scope creep. Sprint boundaries held.",
            },
            {
              Icon: CheckCircle2,
              variant: health.variant,
              title: "Health",
              body: health.label === "On Track"
                ? "Actual burn is ahead of ideal. Team is delivering efficiently."
                : "Actual burn is lagging behind ideal. Consider re-scoping.",
            },
          ]).map(({ Icon, variant, title, body }) => (
            <div key={title} className="rounded-2xl bg-card border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={variant} className="gap-1.5">
                  <Icon className="w-3 h-3" />
                  {title}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-mono">{body}</p>
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
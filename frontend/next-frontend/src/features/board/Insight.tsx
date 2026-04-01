"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingDown, Layers3 } from "lucide-react";

interface InsightNavButtonsProps {
    sprintId?: string;
    workspaceSlug: string;
}

export function InsightNavButtons({ sprintId, workspaceSlug }: InsightNavButtonsProps) {
    const pathname = usePathname();

    const links = [
        {
            href: `/workspace/${workspaceSlug}/insights?tab=burndown&sprint=${sprintId}`,
            icon: TrendingDown,
            label: "Burndown",
            sublabel: "Sprint progress",
        },
        {
            href: `/workspace/${workspaceSlug}/insights?tab=flow&sprint=${sprintId}`,
            icon: Layers3,
            label: "Cumulative Flow",
            sublabel: "Status over time",
        },
    ];

    return (
        <div className="space-y-1 px-2">
            {sprintId && links.map(({ href, icon: Icon, label, sublabel }) => {
                const currentTab = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("tab");
                const isActive = currentTab === (href.includes("burndown") ? "burndown" : "flow");
                return (
                    <Link key={href} href={href}>
                        <div
                            className={[
                                "group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                                "border-l-2 focus-visible:outline-none",
                                isActive
                                    ? "bg-[#0052CC]/10 text-[#0052CC] border-[#0052CC]"
                                    : "text-foreground hover:bg-muted/50 border-transparent hover:border-[#0052CC]/30",
                            ].join(" ")}
                        >
                            <Icon
                                className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? "text-[#0052CC]" : "text-muted-foreground group-hover:text-foreground"
                                    }`}
                            />
                            <div className="min-w-0">
                                <p className="truncate leading-tight">{label}</p>
                                <p className="text-[10px] font-mono text-muted-foreground truncate">{sublabel}</p>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color?: "emerald" | "rose" | "amber" | "blue" | "slate" | "purple" | "indigo";
    description?: string;
    trend?: {
        value: string;
        isUp: boolean;
    };
    className?: string;
}

export function DashboardStatCard({ 
    title, 
    value, 
    icon: Icon, 
    color = "emerald", 
    description,
    trend,
    className 
}: DashboardStatCardProps) {
    const colors: Record<string, string> = {
        emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50 shadow-emerald-500/10",
        rose: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/50 shadow-rose-500/10",
        amber: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50 shadow-amber-500/10",
        blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50 shadow-blue-500/10",
        slate: "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 shadow-slate-500/5",
        purple: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/50 shadow-purple-500/10",
        indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50 shadow-indigo-500/10",
    };

    return (
        <div className={cn(
            "glass futuristic-card p-4 sm:p-5 rounded-2xl border-none shadow-xl flex items-center justify-between group hover:scale-[1.02] transition-all duration-300 cursor-default hover:shadow-2xl gap-3 min-w-0",
            className
        )}>
            <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0 flex-1">
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5 sm:mb-1 truncate">{title}</p>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter truncate">{value}</p>
                {trend && (
                    <p className={cn(
                        "text-[8px] sm:text-[9px] font-black uppercase tracking-widest mt-0.5 sm:mt-1 truncate",
                        trend.isUp ? "text-emerald-500" : "text-rose-500"
                    )}>
                        {trend.isUp ? "↑" : "↓"} {trend.value}
                    </p>
                )}
                {description && <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase mt-0.5 sm:mt-1 truncate">{description}</p>}
            </div>
            <div className={cn(
                "p-2.5 sm:p-3.5 rounded-xl border-2 transition-all group-hover:rotate-6 group-hover:shadow-lg shrink-0", 
                colors[color]
            )}>
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
        </div>
    );
}

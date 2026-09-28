
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface UnifiedPageHeaderProps {
    title: string;
    subtitle?: string;
    icon: LucideIcon;
    color?: "emerald" | "blue" | "rose" | "amber" | "purple" | "indigo";
    actions?: ReactNode;
    className?: string;
}

export function UnifiedPageHeader({
    title,
    subtitle,
    icon: Icon,
    color = "emerald",
    actions,
    className
}: UnifiedPageHeaderProps) {
    const iconColors: Record<string, string> = {
        emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30 shadow-emerald-500/5",
        blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 dark:border-blue-500/30 shadow-blue-500/5",
        rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 dark:border-rose-500/30 shadow-rose-500/5",
        amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/30 shadow-amber-500/5",
        purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 dark:border-purple-500/30 shadow-purple-500/5",
        indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 dark:border-indigo-500/30 shadow-indigo-500/5",
    };

    return (
        <div className={cn(
            "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 animate-in slide-in-from-top-4 duration-700",
            className
        )}>
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full md:w-auto">
                <div className={cn(
                    "p-2.5 sm:p-3 rounded-xl border shadow-sm shrink-0",
                    iconColors[color]
                )}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 truncate">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5 sm:mt-1 truncate">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {actions && (
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
                    {actions}
                </div>
            )}
        </div>
    );
}

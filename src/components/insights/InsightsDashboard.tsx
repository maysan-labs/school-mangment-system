"use client";

import { useState } from "react";
import {
    BrainCircuit,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    AlertCircle,
    CheckCircle,
    Users,
    BookOpen,
    IndianRupee,
    Award,
    Activity,
    BarChart3,
    RefreshCw,
    Search,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Clock,
    Target,
    FileText,
    GraduationCap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { toast } from "sonner";

interface InsightsDashboardProps {
    systemMetrics: any;
    atRiskStudents?: any[];
}

export default function InsightsDashboard({ systemMetrics, atRiskStudents = [] }: InsightsDashboardProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    const metrics = systemMetrics?.metrics || [];
    const studentCount = systemMetrics?.studentCount || 0;
    const teacherCount = systemMetrics?.teacherCount || 0;
    const totalRevenue = systemMetrics?.totalRevenue || 0;

    const handleRefresh = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast.success("Insights data refreshed");
        }, 800);
    };

    const handleExport = () => {
        try {
            const dataToExport = {
                timestamp: new Date().toISOString(),
                summary: {
                    students: studentCount,
                    teachers: teacherCount,
                    totalRevenue,
                    atRiskStudents: atRiskStudents.length,
                },
                forecasts,
                anomalies,
            };
            const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `insights-report-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success("Insights report exported successfully");
        } catch {
            toast.error("Failed to export report");
        }
    };

    const forecasts = [
        { id: 1, title: "Enrollment", desc: "15% increase expected next month", icon: Users, color: "blue", trend: "up" },
        { id: 2, title: "Attendance", desc: "Class 9-B may drop below 75%", icon: Activity, color: "amber", trend: "down" },
        { id: 3, title: "Revenue", desc: "₹12.5L expected next week", icon: IndianRupee, color: "emerald", trend: "up" },
        { id: 4, title: "Academic", desc: "3 students at risk of failing", icon: Award, color: "rose", trend: "down" }
    ];

    const anomalies = [
        { id: 1, title: "Payment Pattern", desc: "Student #1042 has irregular history", time: "2 hours", severity: "high" },
        { id: 2, title: "Attendance Spike", desc: "Class 10-A shows 95% absence on Friday", time: "1 day", severity: "medium" },
        { id: 3, title: "Grade Discrepancy", desc: "Math marks deviation >20%", time: "3 days", severity: "low" }
    ];

    const actions = [
        { id: 1, title: "Send Reminders", count: 23, icon: Activity, color: "blue" },
        { id: 2, title: "Schedule Tutoring", count: 15, icon: BookOpen, color: "emerald" },
        { id: 3, title: "Review Attendance", count: 2, icon: AlertCircle, color: "amber" }
    ];

    const colorMap: Record<string, { bg: string; text: string }> = {
        blue: { bg: "bg-blue-50", text: "text-blue-600" },
        emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
        amber: { bg: "bg-amber-50", text: "text-amber-600" },
        rose: { bg: "bg-rose-50", text: "text-rose-600" }
    };

    const severityMap: Record<string, { bg: string; text: string }> = {
        high: { bg: "bg-rose-50", text: "text-rose-600" },
        medium: { bg: "bg-amber-50", text: "text-amber-600" },
        low: { bg: "bg-slate-50", text: "text-slate-600" }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <UnifiedPageHeader
                title="Insights"
                subtitle="Analytics and predictive intelligence"
                icon={BrainCircuit}
                color="emerald"
                actions={
                    <div className="flex gap-2">
                        <button
                            onClick={handleExport}
                            className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all bg-white dark:bg-slate-900 flex items-center gap-2 cursor-pointer"
                        >
                            <Download className="h-3 w-3" />
                            Export
                        </button>
                        <button
                            onClick={handleRefresh}
                            className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                        >
                            {isLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                            Refresh
                        </button>
                    </div>
                }
            />

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                <button onClick={() => setActiveTab("overview")} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2", activeTab === "overview" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500")}>
                    <BarChart3 className="w-4 h-4" /> Overview
                </button>
                <button onClick={() => setActiveTab("forecasts")} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2", activeTab === "forecasts" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500")}>
                    <BrainCircuit className="w-4 h-4" /> Forecasts
                </button>
                <button onClick={() => setActiveTab("alerts")} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2", activeTab === "alerts" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500")}>
                    <AlertTriangle className="w-4 h-4" /> Alerts
                </button>
            </div>

            {activeTab === "overview" && (
                <div className="space-y-6 animate-in fade-in duration-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <DashboardStatCard title="Students" value={studentCount} icon={GraduationCap} color="blue" trend={{ value: "+12 this month", isUp: true }} />
                        <DashboardStatCard title="Revenue" value={`₹${(totalRevenue / 100000).toFixed(1)}L`} icon={IndianRupee} color="emerald" trend={{ value: "+8% this month", isUp: true }} />
                        <DashboardStatCard title="Teachers" value={teacherCount} icon={Users} color="purple" description="1:15 ratio" />
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                                    <AlertTriangle className="h-4 w-4" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">At Risk</span>
                            </div>
                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{atRiskStudents.length}</p>
                            <span className={cn("mt-2 inline-block px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", atRiskStudents.length > 5 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600")}>
                                {atRiskStudents.length > 5 ? "High" : "Normal"}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    <span className="w-1 h-4 bg-emerald-500 rounded-full" />
                                    Class Performance
                                </h3>
                                <button className="h-8 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[9px] uppercase tracking-widest px-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">View All</button>
                            </div>
                            <div className="h-[200px] flex items-end gap-3">
                                {["65", "72", "88", "45", "76", "54", "95", "62"].map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full h-full flex items-end">
                                            <div
                                                className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all hover:from-emerald-400"
                                                style={{ height: `${h}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Class {i + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Students</span>
                                        <span className="text-xs font-black text-slate-900 dark:text-white">{studentCount}</span>
                                    </div>
                                    <div className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Teachers</span>
                                        <span className="text-xs font-black text-slate-900 dark:text-white">{teacherCount}</span>
                                    </div>
                                    <div className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Revenue</span>
                                        <span className="text-xs font-black text-slate-900 dark:text-white">₹{(totalRevenue / 100000).toFixed(1)}L</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "forecasts" && (
                <div className="space-y-6 animate-in fade-in duration-700">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Forecasts</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                {forecasts.map((f) => {
                                    const colors = colorMap[f.color];
                                    return (
                                        <div key={f.id} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950">
                                            <div className={cn("p-2.5 rounded-xl shrink-0", colors.bg)}>
                                                <f.icon className={cn("h-4 w-4", colors.text)} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-sm font-black text-slate-900 dark:text-white">{f.title}</p>
                                                    <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                                                        {f.trend === "up" ? <TrendingUp className="h-3 w-3 text-emerald-600" /> : <TrendingDown className="h-3 w-3 text-rose-600" />}
                                                        <span className={f.trend === "up" ? "text-emerald-600" : "text-rose-600"}>{f.trend}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{f.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Actions</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                {actions.map((a) => {
                                    const colors = colorMap[a.color];
                                    return (
                                        <div key={a.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <a.icon className={cn("h-5 w-5", colors.text)} />
                                                    <span className="text-sm font-black text-slate-900 dark:text-white">{a.title}</span>
                                                </div>
                                                <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{a.count}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "alerts" && (
                <div className="space-y-6 animate-in fade-in duration-700">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Issues</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                {anomalies.map((a) => {
                                    const colors = severityMap[a.severity];
                                    return (
                                        <div key={a.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                            <div className="flex items-start gap-3">
                                                <div className={cn("p-2 rounded-xl shrink-0", colors.bg)}>
                                                    <AlertTriangle className={cn("h-4 w-4", colors.text)} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <p className="text-sm font-black text-slate-900 dark:text-white">{a.title}</p>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />{a.time}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{a.desc}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">At Risk Students</h3>
                                    <div className="relative w-40">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                                        <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search" className="pl-8 h-8 text-xs rounded-xl border-slate-200 dark:border-slate-800" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 max-h-[350px] overflow-y-auto space-y-3">
                                {atRiskStudents.length === 0 ? (
                                    <div className="text-center py-8">
                                        <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">All students doing well</p>
                                    </div>
                                ) : (
                                    atRiskStudents.map((s: any) => (
                                        <div key={s.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black flex items-center justify-center text-sm">
                                                    {s.name?.[0] || "?"}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <p className="text-sm font-black text-slate-900 dark:text-white">{s.name}</p>
                                                        <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest", s.riskScore > 60 ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600")}>
                                                            {s.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{s.className} • Roll: {s.rollNumber}</p>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                                                    <div className={cn("h-full rounded-full", s.riskScore > 60 ? "bg-rose-500" : "bg-amber-500")} style={{ width: `${s.riskScore}%` }} />
                                                </div>
                                                <span className="text-xs font-black text-slate-700 dark:text-slate-300">{s.riskScore}%</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
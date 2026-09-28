"use client";

import { useState, useMemo } from "react";
import {
    FileText, Plus, ClipboardCheck, Calendar, Award, BookOpen, Users, BarChart3, Pencil, Trash2,
    Search, Hash, CheckCircle2, Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Calendar as BigCalendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/calendar-overrides.css"; 
import { createExam, updateExam, deleteExam, saveMarks, getMarksByExam } from "@/app/actions/exams";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";

interface ExamsDashboardProps {
    exams: any[];
    classes: any[];
    subjects: any[];
    academicYears: any[];
    students: any[];
    marksSummary?: any[];
    userRole: string;
}

const COLORS = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6"];

const locales = {
    "en-US": enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export function ExamsDashboard({ 
    exams, 
    classes, 
    subjects, 
    academicYears, 
    students, 
    marksSummary = [], 
    userRole 
}: ExamsDashboardProps) {
    const router = useRouter();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingExamId, setEditingExamId] = useState<string | null>(null);
    const [isMarksOpen, setIsMarksOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedExam, setSelectedExam] = useState<any>(null);
    const [marks, setMarks] = useState<Record<string, string>>({});
    const [existingMarks, setExistingMarks] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
    const [calendarView, setCalendarView] = useState<View>("month");

    // --- Filter State ---
    const [searchTerm, setSearchTerm] = useState("");
    const [filterClass, setFilterClass] = useState("all");
    const [filterSubject, setFilterSubject] = useState("all");

    // --- Analytics Logic ---
    const passFailData = useMemo(() => {
        if (!marksSummary || marksSummary.length === 0) return [];
        let pass = 0;
        let fail = 0;
        marksSummary.forEach(m => {
            const passMarks = m.exam?.passing_marks || 35;
            if (m.marks_obtained >= passMarks) pass++;
            else fail++;
        });
        return [
            { name: "Pass", value: pass, color: "#10b981" },
            { name: "Fail", value: fail, color: "#ef4444" }
        ];
    }, [marksSummary]);

    const subjectPerformance = useMemo(() => {
        if (!marksSummary || marksSummary.length === 0) return [];
        const subMap: Record<string, { total: number, count: number }> = {};
        marksSummary.forEach(m => {
            const subName = m.exam?.subject?.name || "Unknown";
            if (!subMap[subName]) subMap[subName] = { total: 0, count: 0 };
            subMap[subName].total += m.marks_obtained;
            subMap[subName].count++;
        });
        return Object.entries(subMap).map(([name, data]) => ({
            name,
            avg: Math.round(data.total / data.count)
        })).sort((a, b) => b.avg - a.avg).slice(0, 5);
    }, [marksSummary]);

    const currentAY = academicYears.find((ay: any) => ay.is_current) || academicYears[0];

    const [examForm, setExamForm] = useState({
        name: "", subject_id: "", class_id: "", date: "", max_marks: "100", passing_marks: "35",
        academic_year_id: currentAY?.id || "",
    });

    const [editExamForm, setEditExamForm] = useState({
        name: "", subject_id: "", class_id: "", date: "", max_marks: "100", passing_marks: "35",
        academic_year_id: currentAY?.id || "",
    });

    const handleCreateExam = async () => {
        setLoading(true);
        const result = await createExam({
            ...examForm,
            max_marks: parseInt(examForm.max_marks) || 100,
            passing_marks: parseInt(examForm.passing_marks) || 35,
        });
        setLoading(false);
        if (result.success) {
            setIsCreateOpen(false);
            setExamForm({ name: "", subject_id: "", class_id: "", date: "", max_marks: "100", passing_marks: "35", academic_year_id: currentAY?.id || "" });
            router.refresh();
        }
    };

    const handleOpenEdit = (exam: any) => {
        setEditingExamId(exam.id);
        setEditExamForm({
            name: exam.name || "",
            subject_id: exam.subject_id || "",
            class_id: exam.class_id || "",
            date: exam.date || "",
            max_marks: String(exam.max_marks || 100),
            passing_marks: String(exam.passing_marks || 35),
            academic_year_id: exam.academic_year_id || currentAY?.id || "",
        });
        setIsEditOpen(true);
    };

    const handleUpdateExam = async () => {
        if (!editingExamId) return;
        setLoading(true);
        const result = await updateExam(editingExamId, {
            ...editExamForm,
            max_marks: parseInt(editExamForm.max_marks) || 100,
            passing_marks: parseInt(editExamForm.passing_marks) || 35,
        });
        setLoading(false);
        if (result.success) {
            setIsEditOpen(false);
            setEditingExamId(null);
            router.refresh();
        }
    };

    const handleDeleteExam = async (id: string) => {
        setLoading(true);
        await deleteExam(id);
        setLoading(false);
        router.refresh();
    };

    const handleOpenMarks = async (exam: any) => {
        setSelectedExam(exam);
        setLoading(true);
        const result = await getMarksByExam(exam.id);
        if (result.success && result.data) {
            setExistingMarks(result.data);
            const marksObj: Record<string, string> = {};
            result.data.forEach((m: any) => { marksObj[m.student_id] = String(m.marks_obtained); });
            setMarks(marksObj);
        }
        setLoading(false);
        setIsMarksOpen(true);
    };

    const handleSaveMarks = async () => {
        if (!selectedExam) return;
        setLoading(true);
        const marksArr = Object.entries(marks)
            .filter(([_, v]) => v !== "")
            .map(([studentId, obtained]) => ({
                exam_id: selectedExam.id,
                student_id: studentId,
                subject_id: selectedExam.subject_id,
                marks_obtained: parseInt(obtained) || 0,
            }));
        await saveMarks(marksArr);
        setLoading(false);
        setIsMarksOpen(false);
        router.refresh();
    };

    const examStudents = selectedExam
        ? students.filter((s: any) => s.class_id === selectedExam.class_id)
        : [];

    const filteredExams = exams.filter(e => {
        const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              e.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = filterClass === "all" || e.class_id === filterClass;
        const matchesSubject = filterSubject === "all" || e.subject_id === filterSubject;
        return matchesSearch && matchesClass && matchesSubject;
    });

    const calendarEvents = filteredExams.map(e => {
        // Assume exams default to a standard time if we only have dates
        const dateStr = e.date;
        const start = new Date(dateStr);
        start.setHours(9, 0, 0); // Default to 9 AM
        const end = new Date(dateStr);
        end.setHours(12, 0, 0); // Default 3 hours

        return {
            id: e.id,
            title: `${e.name} (${e.class?.name || "N/A"})`,
            start,
            end,
            resource: e,
        };
    });

    return (
        <div className="space-y-8 reveal-1">
            <UnifiedPageHeader 
                title="Exams & Assessments"
                subtitle="Track student assessments, calendar schedules, and evaluation metrics"
                icon={FileText}
                color="rose"
                actions={
                    (userRole === "admin" || userRole === "teacher") && (
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50"
                        >
                            <span className="flex items-center gap-x-2">
                                <Plus className="h-4 w-4" />
                                Create Exam
                            </span>
                        </button>
                    )
                }
            />

            <div className="flex w-full mb-8">
                <div className="inline-flex p-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
                    <button
                        onClick={() => setViewMode("list")}
                        className={cn(
                            "rounded-xl px-5 py-2 font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-x-2",
                            viewMode === "list"
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <ClipboardCheck className="h-4 w-4" />
                        <span>Exam List</span>
                    </button>
                    <button
                        onClick={() => setViewMode("calendar")}
                        className={cn(
                            "rounded-xl px-5 py-2 font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-x-2",
                            viewMode === "calendar"
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <Calendar className="h-4 w-4" />
                        <span>Exam Calendar</span>
                    </button>
                </div>
            </div>

            <div className="mt-0 space-y-12">
                    {/* --- Analytics Layer: Institutional Intelligence --- */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 reveal-2">
                        <div className="md:col-span-8 glass p-6 md:p-8 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                                <BarChart3 className="h-48 w-48 text-rose-500" />
                            </div>
                            <div className="relative z-10 h-full flex flex-col">
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                        Performance Overview
                                    </h3>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
                                        Subject-wise average performance
                                    </p>
                                </div>
                                <div className="flex-1 h-[280px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={subjectPerformance}>
                                            <defs>
                                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="rgb(244, 63, 94)" stopOpacity={0.8} />
                                                    <stop offset="100%" stopColor="rgb(244, 63, 94)" stopOpacity={0.1} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                            <XAxis 
                                                dataKey="name" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: "bold" }}
                                            />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                                            <Tooltip 
                                                cursor={{ fill: "rgba(244, 63, 94, 0.05)" }} 
                                                contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px" }}
                                                labelStyle={{ color: "var(--foreground)" }}
                                                itemStyle={{ color: "var(--foreground)" }}
                                            />
                                            <Bar dataKey="avg" fill="url(#barGradient)" radius={[8, 8, 0, 0]} barSize={36} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-4 glass p-6 md:p-8 rounded-[2rem] border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
                            <div className="mb-8 relative z-10 text-center">
                                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    Pass/Fail Ratio
                                </h3>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 text-center">Current exam series</p>
                            </div>
                            <div className="h-[280px] relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <defs>
                                            <linearGradient id="passGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                                                <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                                            </linearGradient>
                                            <linearGradient id="failGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                                                <stop offset="100%" stopColor="#e11d48" stopOpacity={0.6} />
                                            </linearGradient>
                                        </defs>
                                        <Pie
                                            data={passFailData}
                                            innerRadius={65}
                                            outerRadius={85}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {passFailData.map((entry: any, index: number) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={entry.name === "Pass" ? "url(#passGradient)" : "url(#failGradient)"} 
                                                    strokeWidth={0} 
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px" }}
                                            labelStyle={{ color: "var(--foreground)" }}
                                            itemStyle={{ color: "var(--foreground)" }}
                                        />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* --- Control Layer --- */}
                    <div className="glass p-4 rounded-[1.5rem] border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex flex-col md:flex-row items-center gap-4 shadow-lg">
                        <div className="relative flex-1 w-full group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Search exams or subjects..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-11 w-full bg-white/50 dark:bg-slate-950/50 border-slate-200/60 dark:border-slate-800/60 rounded-xl focus:border-rose-500/50 focus:ring-rose-500/20"
                            />
                        </div>

                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
                            <select
                                value={filterClass}
                                onChange={(e) => setFilterClass(e.target.value)}
                                className="w-full sm:w-[180px] flex-1 sm:flex-initial h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-950/50 border-slate-200/60 dark:border-slate-800/60 focus:border-blue-300 outline-none"
                            >
                                <option value="all" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">All Classes</option>
                                {classes.map(c => <option key={c.id} value={c.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">{c.name}</option>)}
                            </select>

                            <select
                                value={filterSubject}
                                onChange={(e) => setFilterSubject(e.target.value)}
                                className="w-full sm:w-[180px] flex-1 sm:flex-initial h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-950/50 border-slate-200/60 dark:border-slate-800/60 focus:border-blue-300 outline-none"
                            >
                                <option value="all" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">All Subjects</option>
                                {subjects.map(s => <option key={s.id} value={s.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                        {[
                            { label: "Total Exams", value: exams.length, icon: FileText, width: "78%" },
                            { label: "Active Participants", value: students.length, icon: Users, width: "92%" },
                            { label: "Subject Coverage", value: new Set(exams.map(e => e.subject_id)).size, icon: BookOpen, width: "64%" },
                            { label: "Evaluation Rate", value: `${Math.round((exams.filter(e => e.marks?.[0]?.count > 0).length / (exams.length || 1)) * 100)}%`, icon: Calendar, width: "100%" },
                        ].map((stat, i) => {
                            const iconColors = [
                                "text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-rose-500/5",
                                "text-indigo-500 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/5",
                                "text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-500/5",
                                "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5",
                            ];
                            return (
                                <div key={i} className="glass p-5 sm:p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg flex flex-col justify-between group hover:scale-[1.03] transition-all duration-300 hover:shadow-xl">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                                                <h3 className="text-4xl font-black text-slate-950 dark:text-white tracking-tight mt-2">{stat.value}</h3>
                                            </div>
                                            <div className={cn("p-3 rounded-xl border transition-all group-hover:rotate-6 group-hover:shadow-lg", iconColors[i])}>
                                                <stat.icon className="h-5 w-5" />
                                            </div>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-4">
                                            <div 
                                                className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-1000 ease-out" 
                                                style={{ width: stat.width }} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="glass border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[1.5rem] overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 dark:bg-slate-800/30">
                                <tr>
                                    <th className="h-14 px-6 text-left align-middle font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/40">Exam Name / Subject</th>
                                    <th className="h-14 px-6 text-left align-middle font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/40">Class</th>
                                    <th className="h-14 px-6 text-center align-middle font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/40">Marks / Passing</th>
                                    <th className="h-14 px-6 text-left align-middle font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/40">Date</th>
                                    <th className="h-14 px-6 text-center align-middle font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/40">Status</th>
                                    <th className="h-14 px-6 text-right align-middle font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/40">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                                {filteredExams.map((exam) => (
                                    <tr key={exam.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-all duration-300">
                                        <td className="px-6 py-5">
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white uppercase tracking-tight text-md group-hover:text-rose-500 transition-colors leading-none mb-2">
                                                    {exam.name}
                                                </p>
                                                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                                                    <BookOpen className="h-3.5 w-3.5" />
                                                    <p className="text-[10px] font-mono font-bold uppercase tracking-widest">{exam.subject?.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                             <div className="py-1 px-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 rounded-full inline-block min-w-[90px] text-center font-mono font-bold text-xs uppercase tracking-wider">
                                                {exam.class?.name}
                                             </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-x-3">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xl font-black italic text-slate-900 dark:text-white tracking-tighter leading-none">{exam.max_marks}</span>
                                                    <span className="text-[8px] font-mono font-black uppercase tracking-widest text-slate-400">MAX_VAL</span>
                                                </div>
                                                <div className="h-7 w-px bg-slate-200 dark:bg-slate-800" />
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-mono font-black uppercase tracking-widest text-rose-500 italic leading-none">{exam.passing_marks}</span>
                                                    <span className="text-[8px] font-mono font-black uppercase tracking-widest text-rose-500/40">PASS_LVL</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 font-mono font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                            {format(new Date(exam.date), "dd-MM-yyyy")}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            {exam.marks?.[0]?.count > 0 ? (
                                                <span className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/15 py-1 px-4 rounded-full font-mono font-black text-[9px] uppercase tracking-widest italic flex items-center gap-2 justify-center w-fit mx-auto shadow-sm shadow-emerald-500/5">
                                                    <CheckCircle2 className="h-3 w-3" /> Evaluated
                                                </span>
                                            ) : (
                                                <span className="text-amber-500/80 bg-amber-500/5 border-amber-500/20 py-1 px-4 rounded-full font-mono font-black text-[9px] uppercase tracking-widest italic flex items-center gap-2 justify-center w-fit mx-auto shadow-sm shadow-amber-500/5">
                                                    <Clock className="h-3 w-3 animate-pulse" /> Scheduled
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-x-3">
                                                {(userRole === "admin" || userRole === "teacher") && (
                                                    <button
                                                        onClick={() => handleOpenMarks(exam)}
                                                        className="h-9 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black uppercase tracking-wider text-[10px] shadow-md shadow-rose-500/10 hover:scale-102 transition-all duration-300 px-4"
                                                    >
                                                        <span className="flex items-center gap-x-2">
                                                            <Plus className="h-3 w-3" /> Enter Results
                                                        </span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleOpenEdit(exam)}
                                                    className="h-9 w-9 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl border border-slate-200/40 dark:border-slate-800/40 hover:border-rose-500/20 transition-all duration-300 flex items-center justify-center cursor-pointer"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                {(userRole === "admin" || userRole === "teacher") && (
                                                    <button
                                                        onClick={() => handleDeleteExam(exam.id)}
                                                        className="h-9 w-9 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl border border-slate-200/40 dark:border-slate-800/40 hover:border-rose-500/20 transition-all duration-300 flex items-center justify-center"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>

                {viewMode === "calendar" && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm overflow-hidden">
                        <div className="h-[700px]">
                            <BigCalendar
                                localizer={localizer}
                                events={calendarEvents}
                                startAccessor="start"
                                endAccessor="end"
                                views={["month", "week", "agenda"]}
                                view={calendarView}
                                onView={(v) => setCalendarView(v)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Create Exam Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
                    <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[90vh] max-w-2xl w-full mx-4 rounded-2xl shadow-2xl">
                        <div className="p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                                Schedule New Exam
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Setup and publish a new examination or assessment
                            </p>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Exam Name</label>
                                    <Input 
                                        placeholder="e.g. First Term Finals" 
                                        className="h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500/50"
                                        value={examForm.name} 
                                        onChange={(e) => setExamForm({ ...examForm, name: e.target.value })} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Exam Date</label>
                                    <Input 
                                        type="date" 
                                        className="h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500/50"
                                        value={examForm.date} 
                                        onChange={(e) => setExamForm({ ...examForm, date: e.target.value })} 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Class</label>
                                    <select
                                        className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                                        value={examForm.class_id}
                                        onChange={(e) => setExamForm({ ...examForm, class_id: e.target.value })}
                                    >
                                        <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select Class</option>
                                        {classes.map(c => <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Subject</label>
                                    <select
                                        className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                                        value={examForm.subject_id}
                                        onChange={(e) => setExamForm({ ...examForm, subject_id: e.target.value })}
                                    >
                                        <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select Subject</option>
                                        {subjects.map(s => <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{s.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Maximum Marks</label>
                                    <Input 
                                        type="number" 
                                        className="h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500/50"
                                        value={examForm.max_marks} 
                                        onChange={(e) => setExamForm({ ...examForm, max_marks: e.target.value })} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Passing Marks</label>
                                    <Input 
                                        type="number" 
                                        className="h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500/50"
                                        value={examForm.passing_marks} 
                                        onChange={(e) => setExamForm({ ...examForm, passing_marks: e.target.value })} 
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-x-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={() => setIsCreateOpen(false)}
                                    className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateExam}
                                    disabled={loading}
                                    className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50"
                                >
                                    {loading ? "Publishing..." : "Publish Exam"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Exam Modal */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsEditOpen(false)} />
                    <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[90vh] max-w-2xl w-full mx-4 rounded-2xl shadow-2xl">
                        <div className="p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                                Edit Assessment Configuration
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Update exam parameters, dates, and grading targets
                            </p>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Exam Name</label>
                                    <Input 
                                        placeholder="e.g. First Term Finals" 
                                        className="h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500/50"
                                        value={editExamForm.name} 
                                        onChange={(e) => setEditExamForm({ ...editExamForm, name: e.target.value })} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Exam Date</label>
                                    <Input 
                                        type="date" 
                                        className="h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500/50"
                                        value={editExamForm.date} 
                                        onChange={(e) => setEditExamForm({ ...editExamForm, date: e.target.value })} 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Class</label>
                                    <select
                                        className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                                        value={editExamForm.class_id}
                                        onChange={(e) => setEditExamForm({ ...editExamForm, class_id: e.target.value })}
                                    >
                                        <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select Class</option>
                                        {classes.map(c => <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Subject</label>
                                    <select
                                        className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                                        value={editExamForm.subject_id}
                                        onChange={(e) => setEditExamForm({ ...editExamForm, subject_id: e.target.value })}
                                    >
                                        <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select Subject</option>
                                        {subjects.map(s => <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{s.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Maximum Marks</label>
                                    <Input 
                                        type="number" 
                                        className="h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500/50"
                                        value={editExamForm.max_marks} 
                                        onChange={(e) => setEditExamForm({ ...editExamForm, max_marks: e.target.value })} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Passing Marks</label>
                                    <Input 
                                        type="number" 
                                        className="h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-emerald-500/50"
                                        value={editExamForm.passing_marks} 
                                        onChange={(e) => setEditExamForm({ ...editExamForm, passing_marks: e.target.value })} 
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-x-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={() => setIsEditOpen(false)}
                                    className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateExam}
                                    disabled={loading}
                                    className="h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50"
                                >
                                    {loading ? "Saving Changes..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Marks Assessment Dialog */}
            {isMarksOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/60 dark:border-slate-800/60 overflow-hidden max-w-5xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl w-full mx-4">
                        <div className="p-6 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/40 relative overflow-hidden flex-shrink-0">
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    Exam Results Entry
                                </h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-6 mt-2">
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-rose-500" /> Exam: {selectedExam?.name}
                                </p>
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-6">
                                    <Award className="h-4 w-4 text-rose-500" /> Max Marks: {selectedExam?.max_marks} Points
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <div className="border border-slate-200/60 dark:border-slate-800/60 rounded-xl mb-10 overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50 dark:bg-slate-850">
                                        <tr>
                                            <th className="h-12 px-6 text-left align-middle font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/40">Student Name</th>
                                            <th className="h-12 px-6 text-right align-middle font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/40">Marks Obtained</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                                        {examStudents.length === 0 ? (
                                            <tr><td colSpan={2} className="py-16 text-center text-slate-400/40 font-black uppercase tracking-widest text-xs italic">No student records found</td></tr>
                                        ) : (
                                            examStudents.map((student: any) => (
                                                <tr key={student.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-all duration-300">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-x-4">
                                                            <div className="h-9 w-9 flex items-center justify-center bg-slate-100 dark:bg-slate-800 font-mono font-bold text-[10px] text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 rounded-lg group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
                                                                {student.id.slice(0, 3).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 dark:text-white uppercase tracking-tight text-sm group-hover:text-rose-500 transition-colors leading-none mb-1.5">
                                                                    {student.profile?.first_name} {student.profile?.last_name}
                                                                </p>
                                                                <p className="text-[9px] font-mono font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Roll No: {student.admission_number || student.id.slice(0, 12)}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="relative inline-block">
                                                            <Input
                                                                type="number"
                                                                placeholder="0"
                                                                className="w-32 h-10 bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 rounded-xl font-mono font-black text-lg text-right text-rose-500 placeholder:text-rose-500/10 focus:border-rose-500/50 focus:ring-rose-500/20"
                                                                value={marks[student.id] || ""}
                                                                onChange={(e) => setMarks({ ...marks, [student.id]: e.target.value })}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                                </div>
                            </div>
                        </div>
    
                        <div className="p-6 border-t border-slate-150 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex flex-col md:flex-row items-center justify-between gap-6 flex-shrink-0 relative">
                            <div className="flex-1 w-full max-w-md">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                            Evaluation Progress: <span className="font-black text-rose-500">{Object.values(marks).filter(v => v !== "").length}</span> / {examStudents.length}
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-mono font-black text-rose-500">
                                        {Math.round((Object.values(marks).filter(v => v !== "").length / (examStudents.length || 1)) * 100)}%
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-700 ease-out"
                                        style={{ width: `${(Object.values(marks).filter(v => v !== "").length / (examStudents.length || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-x-4">
                                <button
                                    onClick={() => setIsMarksOpen(false)}
                                    className="h-11 px-5 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={handleSaveMarks}
                                    disabled={loading}
                                    className="h-11 px-6 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg shadow-rose-500/25 hover:scale-102 hover:shadow-xl transition-all duration-300"
                                >
                                    {loading ? "Saving..." : "Save Marks"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


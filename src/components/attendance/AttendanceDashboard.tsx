"use client";

import { useEffect, useState, useMemo } from "react";
import {
    Check, X, Clock, Search, Users, ClipboardCheck, Calendar, BarChart3,
    UserCheck, UserX, AlertTriangle, TrendingUp, Filter, Download, ShieldCheck,
    Activity, Zap
} from "lucide-react";
import { 
    BarChart, Bar, 
    PieChart, Pie, Cell, 
    ResponsiveContainer, Tooltip, Legend, 
    XAxis, YAxis, CartesianGrid 
} from "recharts";
import { markAttendance, getAttendanceByClassAndDate } from "@/app/actions/attendance";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";

interface AttendanceDashboardProps {
    classes: any[];
    students: any[];
    todayAttendance: any[];
    weekAttendance: any[];
    currentUserId: string;
    userRole?: string | null;
    isStudent?: boolean;
}

type AttendanceStatus = "present" | "absent" | "late" | "excused";

export function AttendanceDashboard({
    classes, students, todayAttendance, weekAttendance, currentUserId, userRole, isStudent = false
}: AttendanceDashboardProps) {
    const isAdminOrTeacher = userRole === "admin" || userRole === "teacher";
    const router = useRouter();
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [studentRecords, setStudentRecords] = useState<Record<string, AttendanceStatus>>({});
    const [studentsLoaded, setStudentsLoaded] = useState(false);

    const [historyClass, setHistoryClass] = useState(isStudent && classes.length > 0 ? classes[0].id : "");
    const [historyDate, setHistoryDate] = useState(new Date().toISOString().split("T")[0]);
    const [historyRecords, setHistoryRecords] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const [activeTab, setActiveTab] = useState(isStudent ? "history" : "mark");

    useEffect(() => {
        if (!isStudent || classes.length === 0) return;

        let active = true;

        const loadStudentHistory = async () => {
            setHistoryLoading(true);
            const result = await getAttendanceByClassAndDate(classes[0].id, historyDate);

            if (!active) return;

            if (result.success && result.data) {
                const studentId = students[0]?.id;
                setHistoryRecords(result.data.filter((record: any) => record.student_id === studentId));
            } else {
                setHistoryRecords([]);
            }

            setHistoryLoading(false);
        };

        void loadStudentHistory();

        return () => {
            active = false;
        };
    }, [classes, historyDate, isStudent, students]);

    const weekTotal = weekAttendance.length;
    const weekPresent = weekAttendance.filter(a => a.status === "present").length;
    const weekAbsent = weekAttendance.filter(a => a.status === "absent").length;
    const weekLate = weekAttendance.filter(a => a.status === "late").length;
    const weekExcused = weekAttendance.filter(a => a.status === "excused").length;
    const weekRate = weekTotal > 0 ? Math.round((weekPresent / weekTotal) * 100) : 0;

    const todayPresent = todayAttendance.filter(a => a.status === "present").length;
    const todayAbsent = todayAttendance.filter(a => a.status === "absent").length;
    const todayLate = todayAttendance.filter(a => a.status === "late").length;
    const todayExcused = todayAttendance.filter(a => a.status === "excused").length;
    const todayTotal = todayAttendance.length;

    const presenceMatrix = useMemo(() => {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const baseline = days.reduce<Record<string, { name: string; Present: number; Absent: number; Late: number; Excused: number }>>((acc, day) => {
            acc[day] = { name: day, Present: 0, Absent: 0, Late: 0, Excused: 0 };
            return acc;
        }, {});

        weekAttendance.forEach((entry: any) => {
            const sourceDate = entry.date || entry.created_at;
            if (!sourceDate) return;

            const dayLabel = new Date(sourceDate).toLocaleDateString("en-US", { weekday: "short" });
            const bucket = baseline[dayLabel];

            if (!bucket) return;

            if (entry.status === "present") bucket.Present += 1;
            if (entry.status === "absent") bucket.Absent += 1;
            if (entry.status === "late") bucket.Late += 1;
            if (entry.status === "excused") bucket.Excused += 1;
        });

        return days.map((day) => baseline[day]);
    }, [weekAttendance]);

    const institutionalDensity = useMemo(() => {
        return [
            { name: "Present", value: todayPresent, color: "#10b981" },
            { name: "Absent", value: todayAbsent, color: "#ef4444" },
            { name: "Late", value: todayLate, color: "#f59e0b" },
            { name: "Excused", value: todayExcused, color: "#3b82f6" }
        ];
    }, [todayPresent, todayAbsent, todayLate, todayExcused]);

    const classStudents = useMemo(() => {
        if (!selectedClass) return [];
        return students.filter(s => s.class_id === selectedClass);
    }, [selectedClass, students]);

    const filteredStudents = useMemo(() => {
        if (!searchQuery) return classStudents;
        const q = searchQuery.toLowerCase();
        return classStudents.filter(s =>
            (s.profile?.full_name || "").toLowerCase().includes(q) ||
            (s.admission_number || "").toLowerCase().includes(q)
        );
    }, [classStudents, searchQuery]);

    const handleClassChange = (classId: string) => {
        setSelectedClass(classId);
        setStudentsLoaded(false);
        loadExistingAttendance(classId, selectedDate);
    };

    const loadExistingAttendance = async (classId: string, date: string) => {
        setLoading(true);
        const result = await getAttendanceByClassAndDate(classId, date);
        const records: Record<string, AttendanceStatus> = {};
        if (result.success && result.data) {
            result.data.forEach((r: any) => {
                records[r.student_id] = r.status as AttendanceStatus;
            });
        }
        students.filter(s => s.class_id === classId).forEach(s => {
            if (!records[s.id]) records[s.id] = "present";
        });
        setStudentRecords(records);
        setStudentsLoaded(true);
        setLoading(false);
    };

    const handleDateChange = (date: string) => {
        setSelectedDate(date);
        if (selectedClass) {
            loadExistingAttendance(selectedClass, date);
        }
    };

    const setStatus = (studentId: string, status: AttendanceStatus) => {
        setStudentRecords(prev => ({ ...prev, [studentId]: status }));
    };

    const markAllPresent = () => {
        const updated: Record<string, AttendanceStatus> = { ...studentRecords };
        classStudents.forEach(s => { updated[s.id] = "present"; });
        setStudentRecords(updated);
    };

    const markAllAbsent = () => {
        const updated: Record<string, AttendanceStatus> = { ...studentRecords };
        classStudents.forEach(s => { updated[s.id] = "absent"; });
        setStudentRecords(updated);
    };

    const handleSave = async () => {
        if (!selectedClass) return;
        setLoading(true);
        
        const currentClassStudentIds = new Set(classStudents.map(s => s.id));
        const records = Object.entries(studentRecords)
            .filter(([studentId]) => currentClassStudentIds.has(studentId))
            .map(([studentId, status]) => ({
                student_id: studentId,
                status,
            }));

        const result = await markAttendance({
            class_id: selectedClass,
            date: selectedDate,
            records,
            marked_by: currentUserId,
        });
        setLoading(false);
        if (result.success) {
            toast.success(`Attendance saved for ${records.length} students!`);
            router.refresh();
        } else {
            toast.error(result.error || "Failed to save attendance");
        }
    };

    const fetchHistory = async () => {
        if (!historyClass || !historyDate) return;
        setHistoryLoading(true);
        const result = await getAttendanceByClassAndDate(historyClass, historyDate);
        if (result.success) {
            setHistoryRecords(result.data || []);
        }
        setHistoryLoading(false);
    };

    const handleExportCSV = () => {
        if (historyRecords.length === 0) return;
        const rows = [
            ["Student", "Roll No", "Status", "Date"],
            ...historyRecords.map(r => [
                r.student?.profile?.full_name || "N/A",
                r.student?.admission_number || "N/A",
                r.status,
                historyDate,
            ]),
        ];
        const csv = rows.map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `attendance-${historyDate}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const presentCount = Object.values(studentRecords).filter(s => s === "present").length;
    const absentCount = Object.values(studentRecords).filter(s => s === "absent").length;
    const lateCount = Object.values(studentRecords).filter(s => s === "late").length;
    const excusedCount = Object.values(studentRecords).filter(s => s === "excused").length;

    const statusButton = (studentId: string, status: AttendanceStatus, icon: React.ReactNode, label: string, activeClass: string) => (
        <button
            onClick={() => setStatus(studentId, status)}
            className={cn(
                "px-2.5 sm:px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-x-2",
                studentRecords[studentId] === status
                    ? `${activeClass} text-white shadow-md`
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800"
            )}
        >
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 relative">

            <UnifiedPageHeader
                title="Attendance"
                subtitle={isStudent ? "Your Attendance Record" : "Student Attendance Board"}
                icon={Users}
                color="emerald"
                actions={isAdminOrTeacher && (
                    <button onClick={handleExportCSV} className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all bg-white dark:bg-slate-900">
                        <Download className="w-4 h-4 mr-2" /> Export
                    </button>
                )}
            />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <DashboardStatCard title="Weekly Rate" value={`${weekRate}%`} icon={TrendingUp} color="emerald" />
                <DashboardStatCard title="Present" value={todayPresent} icon={UserCheck} color="emerald" description="Today" />
                <DashboardStatCard title="Absent" value={todayAbsent} icon={UserX} color="rose" description="Today" />
                <DashboardStatCard title="Late" value={weekLate} icon={Clock} color="amber" description="This week" />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-fit overflow-x-auto scrollbar-none">
                {!isStudent && (
                    <button onClick={() => setActiveTab("mark")} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0", activeTab === "mark" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500")}>
                        <ClipboardCheck className="w-4 h-4" /> Mark
                    </button>
                )}
                <button onClick={() => setActiveTab("history")} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0", activeTab === "history" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500")}>
                    <Calendar className="w-4 h-4" /> History
                </button>
                <button onClick={() => setActiveTab("stats")} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0", activeTab === "stats" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500")}>
                    <BarChart3 className="w-4 h-4" /> Charts
                </button>
            </div>

            {activeTab === "stats" && (
                <div className="space-y-8 animate-in fade-in duration-700">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
                        <div className="md:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Weekly Attendance</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 text-left">Daily breakdown of attendance statuses</p>
                                </div>
                                <Activity className="h-5 w-5 text-slate-400" />
                            </div>
                            <div className="p-5 h-[340px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={presenceMatrix}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                        <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                                        />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                                        <Tooltip 
                                            cursor={{ fill: "rgba(0,0,0,0.05)" }}
                                            contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px" }}
                                            labelStyle={{ color: "var(--foreground)" }}
                                            itemStyle={{ color: "var(--foreground)" }}
                                        />
                                        <Legend verticalAlign="top" height={36} formatter={(value) => <span className="text-xs font-bold text-slate-500 dark:text-slate-400 capitalize">{value}</span>}/>
                                        <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                                        <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 text-center">
                                <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Today's Status</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Distribution of active records</p>
                            </div>
                            <div className="p-5 h-[340px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={institutionalDensity}
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {institutionalDensity.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "12px" }}
                                            labelStyle={{ color: "var(--foreground)" }}
                                            itemStyle={{ color: "var(--foreground)" }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs font-bold text-slate-500 dark:text-slate-400 capitalize">{value}</span>}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "mark" && (
                <div className="space-y-6 animate-in fade-in duration-700">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Class</label>
                                <select value={selectedClass} onChange={(e) => handleClassChange(e.target.value)} className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none">
                                    <option value="" disabled className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Select class</option>
                                    {classes.map(c => <option key={c.id} value={c.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Date</label>
                                    <div className="relative">
                                        <input type="date" value={selectedDate} onChange={(e) => handleDateChange(e.target.value)} className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 pl-10 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-300 outline-none" />
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search students..." className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 pl-10 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-300 outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {studentsLoaded && classStudents.length > 0 && (
                        <div className="space-y-5">
                            <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                                    <button onClick={markAllPresent} className="h-10 flex-1 sm:flex-initial rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-4 sm:px-6 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all inline-flex items-center justify-center gap-2">
                                        <Check className="w-4 h-4" /> All Present
                                    </button>
                                    <button onClick={markAllAbsent} className="h-10 flex-1 sm:flex-initial rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-4 sm:px-6 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all inline-flex items-center justify-center gap-2">
                                        <X className="w-4 h-4" /> All Absent
                                    </button>
                                </div>
                                <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto justify-around sm:justify-start">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Present</span>
                                        <span className="text-xl font-black text-slate-900 dark:text-white mt-1 leading-none">{presentCount}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Absent</span>
                                        <span className="text-xl font-black text-slate-900 dark:text-white mt-1 leading-none">{absentCount}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Late</span>
                                        <span className="text-xl font-black text-slate-900 dark:text-white mt-1 leading-none">{lateCount}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Student</th>
                                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Adm No</th>
                                                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStudents.map((student) => (
                                                <tr key={student.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 flex items-center justify-center font-black text-white text-xs rounded-xl bg-emerald-600">
                                                                {student.profile?.full_name?.[0] || "?"}
                                                            </div>
                                                            <div className="font-bold text-sm text-slate-700 dark:text-slate-300">
                                                                {student.profile?.full_name}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 font-mono text-sm text-slate-500 dark:text-slate-400 font-bold">
                                                        {student.admission_number || "N/A"}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            {statusButton(student.id, "present", <Check className="w-4 h-4" />, "Present", "bg-emerald-600")}
                                                            {statusButton(student.id, "absent", <X className="w-4 h-4" />, "Absent", "bg-red-600")}
                                                            {statusButton(student.id, "late", <Clock className="w-4 h-4" />, "Late", "bg-amber-500")}
                                                            {statusButton(student.id, "excused", <ShieldCheck className="w-4 h-4" />, "Excused", "bg-blue-600")}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {isAdminOrTeacher && (
                                <div className="flex justify-end pt-3">
                                    <button 
                                        onClick={handleSave} 
                                        disabled={loading} 
                                        className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50"
                                    >
                                        <div className="flex items-center gap-2">
                                            {loading ? <Activity className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                            {loading ? "Saving..." : `Save (${Object.keys(studentRecords).length})`}
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {studentsLoaded && classStudents.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24">
                            <Search className="h-10 w-10 mb-4 text-slate-300" />
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No students found for this class.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "history" && (
                <div className="space-y-6 animate-in fade-in duration-700">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            {!isStudent && (
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Class</label>
                                    <select value={historyClass} onChange={(e) => setHistoryClass(e.target.value)} className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none">
                                        <option value="" disabled className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Select class</option>
                                        {classes.map(c => <option key={c.id} value={c.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">{c.name}</option>)}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Date</label>
                                <div className="relative">
                                    <input type="date" value={historyDate} onChange={(e) => setHistoryDate(e.target.value)} className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 pl-10 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-300 outline-none" />
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                            <button onClick={fetchHistory} disabled={(!isStudent && !historyClass) || historyLoading} className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
                                {historyLoading ? <Activity className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
                                {historyLoading ? "Loading..." : "View"}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
                                        <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">ID</th>
                                        <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Student Name</th>
                                        <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Admission No</th>
                                        <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Status</th>
                                        <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyLoading ? (
                                        <tr>
                                            <td colSpan={5} className="py-24 text-center">
                                                <div className="flex flex-col items-center justify-center gap-4">
                                                    <div className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                                                    <div className="h-4 w-48 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                                                </div>
                                            </td>
                                        </tr>
                                    ) : historyRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-24 text-center">
                                                <div className="flex flex-col items-center">
                                                    <Search className="h-10 w-10 mb-4 text-slate-300" />
                                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                                        No attendance records found for this date.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        historyRecords.map((record, idx) => (
                                            <tr key={record.id} className="border-b border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="py-4 px-4 font-mono text-sm text-slate-500 dark:text-slate-400 font-bold">
                                                    {String(idx + 1).padStart(3, '0')}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "h-8 w-8 flex items-center justify-center font-black text-xs text-white rounded-xl",
                                                            record.status === "present" ? "bg-emerald-600" :
                                                                record.status === "absent" ? "bg-red-600" :
                                                                    record.status === "late" ? "bg-amber-500" : "bg-blue-600"
                                                        )}>
                                                            {record.student?.profile?.full_name?.[0] || "?"}
                                                        </div>
                                                        <span className="font-bold text-sm text-slate-700 dark:text-slate-300">
                                                            {record.student?.profile?.full_name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 font-mono text-sm text-slate-500 dark:text-slate-400 font-bold">
                                                    {record.student?.admission_number || "N/A"}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={cn(
                                                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                                        record.status === "present" ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400" :
                                                            record.status === "absent" ? "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400" :
                                                                record.status === "late" ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400" : "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400"
                                                    )}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400 font-bold">
                                                    {record.remarks || "-"}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
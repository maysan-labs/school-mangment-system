"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Calendar,
    Clock,
    MapPin,
    Plus,
    CheckCircle2,
    Zap,
    AlertCircle,
    AlertTriangle,
    User,
    Activity,
    BookMarked,
    LayoutGrid,
    Trash2,
    Edit,
    Printer,
    ArrowRightCircle,
    Loader2,
    Settings,
    MoreVertical,
    Copy,
    UserCircle,
    BookOpenCheck,
    Users,
    GraduationCap,
} from "lucide-react";
import { 
    BarChart, Bar, 
    PieChart, Pie, Cell, 
    ResponsiveContainer, Tooltip as RechartsTooltip, Legend, 
    XAxis, YAxis, CartesianGrid 
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { createTimetableSlot, deleteTimetableSlot, updateTimetableSlot } from "@/app/actions/timetable";
import { generateOptimizedSchedule, getTeacherLoad, checkScheduleConflicts, getTodayProxies, markStaffAttendance } from "@/app/actions/timetable-autonomous";
import { bulkGenerateSchedule, getClassTimetableOverview, clearTimetableForClass, copyTimetableToDay } from "@/app/actions/timetable-enterprise";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ERPCard } from "@/components/ui/erp-card";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_SLOTS = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
const COLORS = ["blue", "purple", "indigo", "emerald", "amber", "rose"];

const SUBJECT_PALETTE = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16", "#e11d48", "#0ea5e9"];

function getSubjectColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); }
  return SUBJECT_PALETTE[Math.abs(hash) % SUBJECT_PALETTE.length];
}

interface TimetableDashboardProps {
    timetables: any[];
    classes: any[];
    subjects: any[];
    teachers: any[];
    classSubjects: any[];
    academicYears: any[];
    userRole: string;
}

export function TimetableDashboard({ timetables, classes, subjects, teachers, classSubjects, academicYears, userRole }: TimetableDashboardProps) {
    const router = useRouter();
    const today = useMemo(() => {
        const detectedDay = new Date().toLocaleDateString("en-US", { weekday: "long" });
        return WEEKDAYS.includes(detectedDay) ? detectedDay : "Monday";
    }, []);
    const [selectedDay, setSelectedDay] = useState(today);
    const [selectedClass, setSelectedClass] = useState(() => {
        if (typeof window === "undefined") return "";
        return localStorage.getItem("timetable_selected_class") || "";
    });
    
    // Persistence for selected class
    useEffect(() => {
        if (selectedClass && !localStorage.getItem("timetable_selected_class")) {
            localStorage.setItem("timetable_selected_class", selectedClass);
        }
    }, [selectedClass]);

    const handleClassChange = (val: string) => {
        setSelectedClass(val);
        localStorage.setItem("timetable_selected_class", val);
    };
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [viewMode, setViewMode] = useState<"class" | "teacher">("class");
    
    const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
    const [isEditSlotOpen, setIsEditSlotOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [generatingSchedule, setGeneratingSchedule] = useState(false);
    const [teacherLoadData, setTeacherLoadData] = useState<any[]>([]);
    const [hasConflicts, setHasConflicts] = useState(false);
    const [conflictCount, setConflictCount] = useState(0);
    const [todayProxies, setTodayProxies] = useState<any[]>([]);
    const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
    const [bulkGenerating, setBulkGenerating] = useState(false);
    const [classOverview, setClassOverview] = useState<any[]>([]);

    const isAdminOrTeacher = userRole === "admin" || userRole === "teacher";
    const selectedTeacherId = selectedTeacher || teachers[0]?.id || "";

    // --- Analytics Logic ---
    const subjectDistribution = useMemo(() => {
        const subMap: Record<string, number> = {};
        timetables.filter(t => t.class_id === selectedClass).forEach(t => {
            t.slots?.forEach((s: any) => {
                const name = s.subject?.name || "Unknown";
                subMap[name] = (subMap[name] || 0) + 1;
            });
        });
        return Object.entries(subMap).map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value).slice(0, 5);
    }, [timetables, selectedClass]);

    const teacherLoadPieData = useMemo(() => {
        const teaMap: Record<string, number> = {};
        timetables.forEach(t => {
            t.slots?.forEach((s: any) => {
                const name = s.teacher?.profile?.full_name || "Unknown";
                teaMap[name] = (teaMap[name] || 0) + 1;
            });
        });
        return Object.entries(teaMap).map(([name, value], idx) => ({
            name,
            value,
            color: COLORS[idx % COLORS.length]
        })).sort((a, b) => b.value - a.value).slice(0, 5);
    }, [timetables]);

    const currentAY = academicYears.find((ay: any) => ay.is_current) || academicYears[0];
    const currentAcademicYearId = currentAY?.id || "";

    const [slotForm, setSlotForm] = useState({
        subject_id: "",
        teacher_id: "",
        start_time: "",
        end_time: "",
        room_number: "",
    });

    const allRooms = useMemo(() => {
        const rooms = new Set<string>();
        classes.forEach(c => {
            if (c.room_number) rooms.add(c.room_number);
        });
        return Array.from(rooms).sort();
    }, [classes]);

    const occupiedRooms = useMemo(() => {
        if (!slotForm.start_time || !slotForm.end_time) return new Set<string>();
        
        const occupied = new Set<string>();
        timetables.forEach(t => {
            if (t.day_of_week === selectedDay) {
                t.slots?.forEach((s: any) => {
                    // Simple overlap check: (StartA < EndB) and (EndA > StartB)
                    if (s.room_number && 
                        slotForm.start_time < s.end_time && 
                        slotForm.end_time > s.start_time) {
                        occupied.add(s.room_number);
                    }
                });
            }
        });
        return occupied;
    }, [timetables, selectedDay, slotForm.start_time, slotForm.end_time]);

    const assignedSubjectIds = useMemo(() => {
        return classSubjects
            .filter((item: any) => item.class_id === selectedClass && (!currentAcademicYearId || !item.academic_year_id || item.academic_year_id === currentAcademicYearId))
            .map((item: any) => item.subject_id);
    }, [classSubjects, currentAcademicYearId, selectedClass]);

    const availableSubjects = useMemo(() => {
        if (assignedSubjectIds.length === 0) return subjects;
        const allowed = new Set(assignedSubjectIds);
        return subjects.filter((subject: any) => allowed.has(subject.id));
    }, [assignedSubjectIds, subjects]);

    const validationIssues = useMemo(() => {
        const issues: string[] = [];
        const dayBuckets = timetables.filter((t: any) => t.academic_year_id === currentAcademicYearId);

        dayBuckets.forEach((timetable: any) => {
            const slots = [...(timetable.slots || [])].sort((a: any, b: any) => (a.start_time || "").localeCompare(b.start_time || ""));
            slots.forEach((slot: any, index: number) => {
                if (!slot.start_time || !slot.end_time || slot.start_time >= slot.end_time) {
                    issues.push(`Invalid time range for ${slot.subject?.name || "slot"}`);
                }

                slots.slice(index + 1).forEach((nextSlot: any) => {
                    const overlaps = slot.start_time < nextSlot.end_time && slot.end_time > nextSlot.start_time;
                    if (overlaps) {
                        issues.push(`Class overlap on ${timetable.day_of_week}`);
                    }
                });
            });
        });

        const teacherSlots = dayBuckets.flatMap((timetable: any) =>
            (timetable.slots || []).map((slot: any) => ({
                ...slot,
                day_of_week: timetable.day_of_week,
            })),
        );

        teacherSlots.forEach((slot: any, index: number) => {
            teacherSlots.slice(index + 1).forEach((nextSlot: any) => {
                const sameTeacher = slot.teacher_id && slot.teacher_id === nextSlot.teacher_id;
                const sameDay = slot.day_of_week === nextSlot.day_of_week;
                const overlaps = slot.start_time < nextSlot.end_time && slot.end_time > nextSlot.start_time;

                if (sameTeacher && sameDay && overlaps) {
                    issues.push(`Teacher conflict on ${slot.day_of_week}`);
                }
            });
        });

        return Array.from(new Set(issues));
    }, [currentAcademicYearId, timetables]);

    const handleCreateSlot = async () => {
        if (!selectedClass) {
            toast.error("Please select a class first.");
            return;
        }
        if (!currentAY) {
            toast.error("No active academic year found in settings.");
            return;
        }
        if (availableSubjects.length === 0) {
            toast.error("No subjects are assigned to this class yet.");
            return;
        }
        if (!slotForm.subject_id || !slotForm.teacher_id || !slotForm.start_time || !slotForm.end_time) {
            toast.error("Please fill in all required fields (Subject, Teacher, Start/End Time).");
            return;
        }
        setLoading(true);
        const result = await createTimetableSlot({
            class_id: selectedClass,
            academic_year_id: currentAY.id,
            day_of_week: selectedDay,
            ...slotForm,
        });
        setLoading(false);
        if (result.success) {
            setIsAddSlotOpen(false);
            setSlotForm({ subject_id: "", teacher_id: "", start_time: "", end_time: "", room_number: "" });
            router.refresh();
            
            // Force a brief delay to ensure revalidation completes
            setTimeout(() => {
                router.refresh();
            }, 100);
            
            toast.success("Schedule slot added successfully");
        } else {
            toast.error(result.error || "Failed to add slot");
        }
    };

    const handleDeleteSlot = async (slotId: string) => {
        if (!confirm("Are you sure you want to delete this schedule slot?")) return;
        setLoading(true);
        const result = await deleteTimetableSlot(slotId);
        setLoading(false);
        if (result.success) {
            router.refresh();
            setTimeout(() => {
                router.refresh();
            }, 100);
            toast.success("Schedule slot deleted successfully");
        } else {
            toast.error(result.error || "Failed to delete slot");
        }
    };

    const handleUpdateSlot = async () => {
        if (!currentAY || !editingSlot) return;
        if (!slotForm.subject_id || !slotForm.teacher_id || !slotForm.start_time || !slotForm.end_time) {
            toast.error("Please fill in all required fields.");
            return;
        }
        setLoading(true);
        const result = await updateTimetableSlot(editingSlot.id, {
            academic_year_id: currentAY.id,
            day_of_week: selectedDay,
            ...slotForm,
        });
        setLoading(false);
        if (result.success) {
            setIsEditSlotOpen(false);
            setEditingSlot(null);
            setSlotForm({ subject_id: "", teacher_id: "", start_time: "", end_time: "", room_number: "" });
            router.refresh();
            toast.success("Schedule slot updated successfully");
        } else {
            toast.error(result.error || "Failed to update schedule slot");
        }
    };

    const handleEditClick = (s: any) => {
        setEditingSlot(s);
        setSlotForm({
            subject_id: s.subject_id,
            teacher_id: s.teacher_id,
            start_time: s.start_time?.slice(0, 5) || "",
            end_time: s.end_time?.slice(0, 5) || "",
            room_number: s.room_number || ""
        });
        setIsEditSlotOpen(true);
    };

    const handlePrint = () => {
        window.print();
    };

    // Debug: Log data to console (runs once on mount)
    useEffect(() => {
        console.log("Timetable Debug:", {
            selectedClass,
            selectedDay,
            viewMode
        });
    }, []);

    // Fetch Teacher Load, Conflicts, and Proxies
    useEffect(() => {
        const academicYearId = currentAY?.id;
        if (!academicYearId || !isAdminOrTeacher) return;

        let active = true;
        
        async function fetchAutonomousData() {
            const [loadResult, conflictResult, proxyResult] = await Promise.all([
                getTeacherLoad(academicYearId),
                checkScheduleConflicts(academicYearId),
                getTodayProxies()
            ]);

            if (!active) return;

            if (loadResult.success) {
                setTeacherLoadData(loadResult.data || []);
            }
            
            if (conflictResult.success) {
                setHasConflicts(conflictResult.hasConflicts || false);
                setConflictCount(conflictResult.data?.length || 0);
            }
            
            if (proxyResult.success) {
                setTodayProxies(proxyResult.data || []);
            }
        }
        
        fetchAutonomousData();

        return () => {
            active = false;
        };
    }, [currentAY?.id, isAdminOrTeacher]);

    const handleGenerateOptimizedSchedule = async () => {
        if (!currentAY?.id) {
            toast.error("No active academic year");
            return;
        }
        
        setGeneratingSchedule(true);
        const result = await generateOptimizedSchedule(currentAY.id, selectedClass || undefined);
        setGeneratingSchedule(false);
        
        if (result.success) {
            const filledCount = result.data?.filter((d: any) => d.was_filled).length || 0;
            toast.success(`Optimized schedule generated! ${filledCount} slots filled.`);
            router.refresh();
        } else {
            toast.error(result.error || "Failed to generate schedule");
        }
    };

    const handleBulkGenerate = async () => {
        if (!currentAY?.id) {
            toast.error("No active academic year");
            return;
        }
        
        setBulkGenerating(true);
        const result = await bulkGenerateSchedule(currentAY.id);
        setBulkGenerating(false);
        
        if (result.success) {
            const successCount = result.data?.filter((d: any) => d.success)?.length || 0;
            toast.success(`Generated schedules for ${successCount} classes!`);
            router.refresh();
        } else {
            toast.error(result.error || "Failed to bulk generate");
        }
    };

    // Filter timetable slots based on view mode (Class vs Teacher)
    const activeSlots = useMemo(() => {
        // Aggregate all slots across all timetables for this criteria on this day
        const filteredSlots: any[] = [];
        const matchingTimetables = timetables.filter(
            (t: any) => t.day_of_week === selectedDay && t.academic_year_id === currentAcademicYearId
        );

        if (viewMode === "class") {
            matchingTimetables
                .filter((t: any) => t.class_id === selectedClass)
                .forEach((t: any) => {
                    t.slots?.forEach((s: any) => {
                        filteredSlots.push(s);
                    });
                });
        } else {
            matchingTimetables.forEach((t: any) => {
                    t.slots?.forEach((s: any) => {
                        if (s.teacher_id === selectedTeacherId) {
                            filteredSlots.push({ ...s, class_name: t.class?.name });
                        }
                    });
                });
        }
        return filteredSlots;
    }, [currentAcademicYearId, selectedClass, selectedDay, selectedTeacherId, timetables, viewMode]);

    // Slots that don't fit into the 07:00-20:00 hourly buckets
    const unmappedSlots = useMemo(() => {
        const hoursInGrid = new Set(TIME_SLOTS.map(t => t.split(':')[0].padStart(2, '0')));
        return activeSlots.filter((s: any) => {
            const h = s.start_time?.split(':')[0]?.padStart(2, '0');
            return !hoursInGrid.has(h);
        });
    }, [activeSlots]);

    // Count total slots across all days for analytics
    const totalSlots = useMemo(() => {
        if (viewMode === "class") {
            return timetables
                .filter((t: any) => t.class_id === selectedClass && t.academic_year_id === currentAcademicYearId)
                .reduce((sum: number, t: any) => sum + (t.slots?.length || 0), 0);
        } else {
            return timetables
                .filter((t: any) => t.academic_year_id === currentAcademicYearId)
                .reduce((sum: number, t: any) => sum + (t.slots?.filter((s: any) => s.teacher_id === selectedTeacherId).length || 0), 0);
        }
    }, [currentAcademicYearId, selectedClass, selectedTeacherId, timetables, viewMode]);

    const weekOverview = useMemo(() => {
        return WEEKDAYS.map((day) => {
            const dayTTs = timetables.filter((t: any) => t.day_of_week === day && t.academic_year_id === currentAcademicYearId);
            let slots: any[] = [];
            if (viewMode === "class") {
                slots = dayTTs.filter((t: any) => t.class_id === selectedClass).flatMap((t: any) => t.slots || []);
            } else {
                slots = dayTTs.flatMap((t: any) => (t.slots || []).filter((s: any) => s.teacher_id === selectedTeacherId));
            }
            const subjects = new Set(slots.map((s: any) => s.subject?.name).filter(Boolean));
            const teachers = new Set(slots.map((s: any) => s.teacher?.profile?.full_name).filter(Boolean));
            return { day, slotCount: slots.length, subjects: subjects.size, teachers: teachers.size, isActive: day === selectedDay, isToday: day === today };
        });
    }, [timetables, currentAcademicYearId, selectedClass, selectedTeacherId, viewMode, selectedDay, today]);

    const totalPossibleSlots = TIME_SLOTS.length * 6;
    const filledSlotCount = weekOverview.reduce((sum, d) => sum + d.slotCount, 0);

    const printableSlotsByDay = useMemo(() => {
        return WEEKDAYS.reduce<Record<string, any[]>>((acc, day) => {
            const matchingTimetables = timetables.filter(
                (t: any) => t.day_of_week === day && t.academic_year_id === currentAcademicYearId,
            );

            if (viewMode === "class") {
                acc[day] = matchingTimetables
                    .filter((t: any) => t.class_id === selectedClass)
                    .flatMap((t: any) => (t.slots || []).map((slot: any) => ({ ...slot, class_name: t.class?.name })))
                    .sort((a: any, b: any) => (a.start_time || "").localeCompare(b.start_time || ""));
            } else {
                acc[day] = matchingTimetables
                    .flatMap((t: any) =>
                        (t.slots || [])
                            .filter((slot: any) => slot.teacher_id === selectedTeacherId)
                            .map((slot: any) => ({ ...slot, class_name: t.class?.name })),
                    )
                    .sort((a: any, b: any) => (a.start_time || "").localeCompare(b.start_time || ""));
            }

            return acc;
        }, {});
    }, [currentAcademicYearId, selectedClass, selectedTeacherId, timetables, viewMode]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 mt-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <DashboardStatCard title="Total Slots" value={totalSlots} icon={Calendar} color="blue" description="All scheduled slots" />
                <DashboardStatCard title="Teachers" value={teachers.length} icon={Users} color="purple" description="Available staff" />
                <DashboardStatCard title="Classes" value={classes.length} icon={GraduationCap} color="emerald" description="All classes" />
                <DashboardStatCard title="Conflicts" value={conflictCount} icon={AlertTriangle} color={conflictCount > 0 ? "rose" : "amber"} description={conflictCount > 0 ? "Resolve required" : "No conflicts"} />
            </div>

            {/* Header / Command Row */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                {viewMode === "class" ? "Class Schedule" : "Teacher Schedule"}
                            </h2>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                                {selectedDay} {viewMode === "class" && selectedClass && `• ${classes.find((c: any) => c.id === selectedClass)?.name || ""}`}
                            </p>
                        </div>
                    </div>
                    {viewMode === "class" && selectedClass && (
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Class Teacher:</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                                {classes.find((c: any) => c.id === selectedClass)?.teacher?.profile?.full_name || "Not Assigned"}
                            </span>
                            {hasConflicts && (
                                <Badge className="bg-rose-500 text-white text-[8px] px-1.5 py-0.5 font-black uppercase tracking-widest border-none animate-pulse">
                                    <AlertTriangle className="h-3 w-3 mr-1" /> {conflictCount} Conflicts
                                </Badge>
                            )}
                            {todayProxies.length > 0 && (
                                <Badge className="bg-amber-500 text-white text-[8px] px-1.5 py-0.5 font-black uppercase tracking-widest border-none">
                                    <Zap className="h-3 w-3 mr-1" /> {todayProxies.length} Proxies
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {/* View Mode Toggle */}
                    {isAdminOrTeacher && (
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl">
                            <button onClick={() => setViewMode("class")}
                                className={cn("h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", viewMode === "class" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                                <LayoutGrid className="h-3.5 w-3.5 inline mr-1.5" /> Class
                            </button>
                            <button onClick={() => setViewMode("teacher")}
                                className={cn("h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", viewMode === "teacher" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                                <User className="h-3.5 w-3.5 inline mr-1.5" /> Teacher
                            </button>
                        </div>
                    )}

                    {viewMode === "class" ? (
                        <select value={selectedClass} onChange={(e) => handleClassChange(e.target.value)}
                            className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none w-full sm:w-auto sm:min-w-[200px] flex-1 sm:flex-initial">
                            <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select Class...</option>
                            {classes.map((c: any) => (<option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{c.name}</option>))}
                        </select>
                    ) : (
                        <select value={selectedTeacherId} onChange={(e) => setSelectedTeacher(e.target.value)}
                            className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none w-full sm:w-auto sm:min-w-[200px] flex-1 sm:flex-initial">
                            <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select Teacher...</option>
                            {teachers.map((t: any) => (<option key={t.id} value={t.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t.profile?.full_name}</option>))}
                        </select>
                    )}

                    <button onClick={handlePrint}
                        className="h-11 w-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-all no-print">
                        <Printer className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    </button>

                    {isAdminOrTeacher && viewMode === "class" && (
                        <>
                            <button onClick={handleBulkGenerate} disabled={bulkGenerating}
                                className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all disabled:opacity-50 flex items-center gap-2">
                                {bulkGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LayoutGrid className="h-4 w-4" />}
                                Bulk Generate
                            </button>
                            <button onClick={handleGenerateOptimizedSchedule} disabled={generatingSchedule}
                                className="h-11 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
                                {generatingSchedule ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                                Generate
                            </button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="h-11 w-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-all no-print">
                                        <MoreVertical className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border-slate-200 dark:border-slate-800">
                                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 px-2 py-1.5">Manage Timetable</DropdownMenuLabel>
                                    <DropdownMenuItem className="rounded-lg gap-2 text-sm py-2 cursor-pointer"
                                        onClick={() => {
                                            if (confirm("Are you sure you want to clear all slots for this class?")) {
                                                clearTimetableForClass(selectedClass, currentAY.id).then(() => { toast.success("Timetable cleared"); router.refresh(); });
                                            }
                                        }}>
                                        <Trash2 className="h-4 w-4 text-rose-500" />
                                        <span className="text-rose-600 font-bold">Clear All Slots</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-lg gap-2 text-sm py-2 cursor-pointer"
                                        onClick={() => {
                                            const targetDays = WEEKDAYS.filter(d => d !== selectedDay);
                                            copyTimetableToDay(selectedDay, targetDays).then(() => { toast.success("Schedule copied"); router.refresh(); });
                                        }}>
                                        <Copy className="h-4 w-4" />
                                        <span>Copy Day to Rest of Week</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <button onClick={() => setIsAddSlotOpen(true)}
                                className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg transition-all active:scale-95 flex items-center">
                                <Plus className="h-4 w-4" /> Add Slot
                            </button>
                            <Dialog open={isAddSlotOpen} onOpenChange={setIsAddSlotOpen}>
                            <DialogContent className="sm:max-w-[500px] rounded-2xl">
                                <DialogHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
                                    <DialogTitle className="text-lg font-black tracking-tight">Add Schedule Slot</DialogTitle>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Configure the class schedule for {selectedDay}</p>
                                </DialogHeader>
                                <div className="p-6 space-y-5">
                                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex items-start gap-4">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Target</p>
                                            <p className="font-bold text-lg text-slate-900 dark:text-white">
                                                {selectedDay} <span className="text-slate-300 mx-1">/</span> {classes.find((c: any) => c.id === selectedClass)?.name || "—"}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {(availableSubjects.length === 0 || teachers.length === 0) && (
                                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-900/30 flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                            <p>
                                                {availableSubjects.length === 0 && teachers.length === 0 
                                                    ? "No class subjects or teachers found. Please complete both before creating a schedule."
                                                    : availableSubjects.length === 0 
                                                        ? "No subjects are assigned to this class yet. Use class subject management first."
                                                        : "No active teachers found. Please add teachers before creating a schedule."}
                                            </p>
                                        </div>
                                    )}

                                    {assignedSubjectIds.length > 0 && (
                                        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                                            Subject options are limited to the subjects assigned to this class for the active academic year.
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Subject</label>
                                            <select value={slotForm.subject_id} onChange={(e) => setSlotForm({ ...slotForm, subject_id: e.target.value })}
                                                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none">
                                                <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select Subject...</option>
                                                {availableSubjects.map((s: any) => (<option key={s.id} value={s.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{s.name}</option>))}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Teacher</label>
                                            <select value={slotForm.teacher_id} onChange={(e) => setSlotForm({ ...slotForm, teacher_id: e.target.value })}
                                                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none">
                                                <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select Teacher...</option>
                                                {teachers.map((t: any) => {
                                                    const subject = subjects.find(sub => sub.id === slotForm.subject_id);
                                                    const isExpert = subject?.expertise?.required_tags?.some((tag: string) => t.expertise_tags?.includes(tag));
                                                    const teacherLoad = teacherLoadData.find(ld => ld.teacher_id === t.id);
                                                    const isOverloaded = teacherLoad?.is_overloaded;
                                                    return (
                                                        <option key={t.id} value={t.id} className={cn("bg-white dark:bg-slate-900 text-slate-900 dark:text-white", isOverloaded && "text-rose-600 dark:text-rose-400", isExpert && "text-emerald-600 dark:text-emerald-400 font-bold")}>
                                                            {t.profile?.full_name}{isExpert ? " (Expert)" : ""}{isOverloaded ? " (Overloaded)" : ""} — {teacherLoad?.daily_hours || 0}/{t.max_daily_hours || 6}h
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Start Time</label>
                                            <Input type="time" className="h-11 rounded-xl border-slate-200 dark:border-slate-800" value={slotForm.start_time} onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block">End Time</label>
                                            <Input type="time" className="h-11 rounded-xl border-slate-200 dark:border-slate-800" value={slotForm.end_time} onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Room Number</label>
                                        <select value={slotForm.room_number} onChange={(e) => setSlotForm({ ...slotForm, room_number: e.target.value })}
                                            className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none">
                                            <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select Room...</option>
                                            {allRooms.map((room) => {
                                                const isOccupied = occupiedRooms.has(room);
                                                return (
                                                    <option key={room} value={room} disabled={isOccupied} className={cn("bg-white dark:bg-slate-900 text-slate-900 dark:text-white", isOccupied && "text-rose-500 dark:text-rose-400")}>
                                                        {room}{isOccupied ? " (Occupied)" : ""}
                                                    </option>
                                                );
                                            })}
                                            {allRooms.length === 0 && <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-500">No rooms defined in classes</option>}
                                        </select>
                                    </div>

                                    <button onClick={handleCreateSlot} disabled={loading}
                                        className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg transition-all disabled:opacity-50">
                                        {loading ? "Saving..." : "Save Schedule Slot"}
                                    </button>
                                </div>
                            </DialogContent>
                        </Dialog>
                        </>
                    )}
                </div>
            </div>

            {/* Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <ERPCard title="Subject Distribution" description="Hours per subject" color="blue" icon={<BookMarked className="h-5 w-5" />}
                        className="border-none shadow-xl rounded-2xl overflow-hidden">
                        <div className="p-6">
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={subjectDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: "600" }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                                        <RechartsTooltip cursor={{ fill: "#ffffff03" }}
                                            contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px" }}
                                            labelStyle={{ color: "var(--foreground)" }}
                                            itemStyle={{ color: "var(--foreground)" }}
                                        />
                                        <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </ERPCard>
                </div>

                <div>
                    <ERPCard title="Teacher Load" description="Workload distribution" color="purple" icon={<Activity className="h-5 w-5" />}
                        className="border-none shadow-xl rounded-2xl overflow-hidden">
                        <div className="p-6">
                            <div className="h-[200px] overflow-y-auto space-y-3">
                                {teacherLoadData.length > 0 ? (
                                    teacherLoadData.slice(0, 6).map((t: any) => (
                                        <div key={t.teacher_id} className="space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-bold truncate max-w-[120px] text-slate-700 dark:text-slate-300">{t.teacher_name}</span>
                                                <span className={cn("text-[9px] font-black", t.is_overloaded ? "text-rose-500" : "text-slate-400")}>
                                                    {t.daily_hours}/{t.max_daily_hours}h
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className={cn("h-full rounded-full transition-all duration-700", t.is_overloaded ? "bg-rose-500" : t.utilization_pct > 80 ? "bg-amber-500" : "bg-blue-500")}
                                                    style={{ width: `${Math.min(100, t.utilization_pct)}%` }} />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <Loader2 className="h-8 w-8 text-slate-200 animate-spin mb-2" />
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Loading...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ERPCard>
                </div>
            </div>

            {/* Main Scheduling Grid */}
            <div className="grid gap-6 lg:gap-8 lg:grid-cols-4">
                {/* Day Selector */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center gap-x-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">Weekdays</h3>
                    </div>
                    <div className="p-2 flex lg:flex-col gap-1.5 overflow-x-auto scrollbar-none border border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl">
                        {WEEKDAYS.map((day) => (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`shrink-0 lg:w-full group relative flex items-center justify-between p-3 rounded-xl transition-all duration-200 font-medium text-sm min-w-[100px] lg:min-w-0 ${
                                    selectedDay === day 
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }`}
                            >
                                <div className="flex items-center gap-x-2 relative z-10">
                                    <span className={cn("text-xs", selectedDay === day && "font-semibold")}>{day.slice(0, 3)}</span>
                                    {today === day && (
                                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight ${
                                            selectedDay === day ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                                        }`}>Today</span>
                                    )}
                                </div>
                                {selectedDay === day ? (
                                    <CheckCircle2 className="w-4 h-4 relative z-10 hidden sm:block" />
                                ) : (
                                    <div className="w-2 h-2 rounded-full bg-border group-hover:bg-primary transition-colors hidden sm:block" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Schedule Grid Content */}
                <div className="lg:col-span-3 space-y-8">
                        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 scrollbar-thin -mx-2 px-2">
                            {TIME_SLOTS.map((time) => {
                            const hour = time.split(':')[0].padStart(2, '0');
                            const matchingSlots = activeSlots
                                .filter((s: any) => {
                                    const sHour = s.start_time?.split(':')[0]?.padStart(2, '0');
                                    return sHour === hour;
                                })
                                .sort((a: any, b: any) => (a.start_time || "").localeCompare(b.start_time || ""));
                                
                            return (
                                <div key={time} className="flex-1 min-w-[180px] md:min-w-[200px] space-y-6 no-print animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${parseInt(time) * 30}ms` }}>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-x-3">
                                            <p className="text-sm font-bold text-primary">{time}</p>
                                            <div className="h-px flex-1 bg-border/50" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {matchingSlots.map((s: any) => (
                                            <div key={s.id}
                                                className={cn("group relative p-4 rounded-2xl border transition-all duration-300 overflow-hidden",
                                                    "hover:shadow-xl hover:-translate-y-1.5 hover:border-primary/40",
                                                    s.is_proxy ? "bg-gradient-to-br from-amber-50 to-amber-100/30 border-amber-200/50 shadow-md" : "bg-gradient-to-br from-white to-slate-50/30 border-slate-200/50 shadow-md hover:shadow-primary/10")}>
                                                <div className={cn("absolute left-0 top-2 bottom-2 w-1 rounded-r-full", s.is_proxy ? "bg-amber-400" : "bg-blue-500")}
                                                    style={!s.is_proxy && s.subject?.name ? { backgroundColor: getSubjectColor(s.subject.name) } : {}} />
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm", s.is_proxy ? "bg-amber-200/50" : "bg-blue-100")}
                                                            style={!s.is_proxy && s.subject?.name ? { backgroundColor: `${getSubjectColor(s.subject.name)}20`, color: getSubjectColor(s.subject.name) } : {}}>
                                                            <BookOpenCheck className={cn("w-4 h-4", s.is_proxy ? "text-amber-600" : "text-blue-600")}
                                                                style={!s.is_proxy && s.subject?.name ? { color: getSubjectColor(s.subject.name) } : {}} />
                                                        </div>
                                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{s.subject?.name || "No Subject"}</h4>
                                                    </div>
                                                    {isAdminOrTeacher && viewMode === "class" && (
                                                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all duration-200 shrink-0">
                                                            <button onClick={() => handleEditClick(s)}
                                                                className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 flex items-center justify-center transition-colors">
                                                                <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                                            </button>
                                                            <button onClick={() => handleDeleteSlot(s.id)}
                                                                className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-100 flex items-center justify-center transition-colors">
                                                                <Trash2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 hover:text-red-500" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-2.5">
                                                    <div className="flex items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg w-fit">
                                                        <Clock className="w-3 h-3 mr-1.5 text-slate-400" />
                                                        {s.start_time?.substring(0, 5)} - {s.end_time?.substring(0, 5)}
                                                    </div>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                                                            {s.teacher?.profile?.avatar_url ? (<img src={s.teacher.profile.avatar_url} alt="" className="h-full w-full object-cover" />) : (<UserCircle className="w-4 h-4 text-slate-400" />)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                                                                {viewMode === "class" ? (s.teacher?.profile?.full_name || "Unassigned") : s.class_name}
                                                            </p>
                                                            {s.is_proxy && <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center"><Zap className="w-2.5 h-2.5 mr-1 animate-pulse" /> Proxy</p>}
                                                        </div>
                                                    </div>
                                                    {s.room_number && (
                                                        <div className="text-[9px] font-bold text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 mt-2 flex items-center gap-1.5">
                                                            <MapPin className="w-3 h-3" /> Room {s.room_number}
                                                        </div>
                                                    )}
                                                </div>
                                                {s.auto_assigned && (
                                                    <div className="absolute -top-1 -right-1">
                                                        <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg ring-2 ring-white">
                                                            <Zap className="w-3 h-3" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {isAdminOrTeacher && viewMode === "class" && matchingSlots.length === 0 && (
                                            <button 
                                                onClick={() => { 
                                                    setSlotForm({ 
                                                        ...slotForm, 
                                                        start_time: time, 
                                                        end_time: `${String(parseInt(time) + 1).padStart(2, "0")}:00` 
                                                    }); 
                                                    setIsAddSlotOpen(true); 
                                                }}
                                                className="h-28 w-full rounded-2xl border-2 border-dashed border-border/50 bg-muted/20 flex flex-col items-center justify-center group hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                                            >
                                                <div className="p-2 rounded-xl bg-muted/50 group-hover:bg-primary/10 transition-colors">
                                                    <Plus className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                                </div>
                                                <span className="mt-2 text-[10px] font-semibold text-muted-foreground/60 group-hover:text-primary transition-colors">Add Slot</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Unmapped / Other Slots */}
                        {unmappedSlots.length > 0 && (
                            <div className="flex-1 min-w-[220px] space-y-8 no-print animate-in slide-in-from-right-10 duration-1000">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-x-4">
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-rose-500 italic">Others</p>
                                        <div className="h-px flex-1 bg-rose-500/20" />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    {unmappedSlots.map((s: any) => (
                                        <div 
                                            key={s.id} 
                                            className="group relative bg-rose-500/5 border border-rose-500/20 p-5 rounded-xl space-y-4 shadow-sm hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-x-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-rose-500">{s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}</span>
                                                </div>
                                                {isAdminOrTeacher && (
                                                    <div className="flex items-center gap-x-1">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-7 w-7 text-muted-foreground hover:text-rose-500 transition-colors"
                                                            onClick={() => handleEditClick(s)}
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-7 w-7 text-muted-foreground hover:text-destructive transition-colors"
                                                            onClick={() => handleDeleteSlot(s.id)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-foreground text-sm uppercase tracking-tight group-hover:text-rose-500 transition-colors leading-tight">
                                                    {s.subject?.name || "No Subject"}
                                                </h4>
                                                <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-x-2 uppercase">
                                                    {viewMode === "class" ? s.teacher?.profile?.full_name : s.class_name}
                                                </p>
                                                {s.room_number && (
                                                    <p className="text-[9px] text-rose-500/70 font-bold uppercase tracking-widest border-t border-rose-500/10 pt-1 mt-1 flex items-center gap-x-1">
                                                        <MapPin className="h-2.5 w-2.5 text-rose-500/60" /> Room {s.room_number}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Week Overview */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Week Overview</span>
                            <span className="text-[9px] font-bold text-slate-400 ml-auto">{filledSlotCount} slots filled across {WEEKDAYS.length} days</span>
                        </div>
                        <div className="grid grid-cols-6 gap-3">
                            {weekOverview.map((d) => (
                                <button key={d.day} onClick={() => setSelectedDay(d.day)}
                                    className={cn("p-3 rounded-xl border transition-all text-left",
                                        d.isActive ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20 border-blue-500" : "bg-white border-slate-200 hover:border-blue-200 hover:shadow-sm")}>
                                    <p className={cn("text-[9px] font-black uppercase tracking-widest mb-2", d.isActive ? "text-blue-200" : "text-slate-400")}>
                                        {d.day.slice(0, 3)}{d.isToday ? <span className={cn("ml-1 text-[7px] px-1 py-0.5 rounded", d.isActive ? "bg-white/20 text-white" : "bg-blue-100 text-blue-600")}>Today</span> : ""}
                                    </p>
                                    <p className={cn("text-2xl font-black", d.isActive ? "text-white" : "text-slate-900")}>{d.slotCount}</p>
                                    <p className={cn("text-[8px] font-bold mt-1", d.isActive ? "text-blue-200" : "text-slate-400")}>
                                        {d.subjects} subj · {d.teachers} teachers
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status Bar */}
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl border",
                            !hasConflicts && validationIssues.length === 0 ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200")}>
                            {!hasConflicts && validationIssues.length === 0 ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                                <AlertTriangle className="h-4 w-4 text-rose-500" />
                            )}
                            <span className={cn("text-[10px] font-black uppercase tracking-widest",
                                !hasConflicts && validationIssues.length === 0 ? "text-emerald-700" : "text-rose-700")}>
                                {!hasConflicts && validationIssues.length === 0 ? "No Conflicts" : `${conflictCount + validationIssues.length} Conflict(s)`}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <Activity className="h-4 w-4 text-slate-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{totalSlots} Total Slots</span>
                        </div>
                        <div className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl border",
                            todayProxies.length > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200")}>
                            <ArrowRightCircle className={cn("h-4 w-4", todayProxies.length > 0 ? "text-amber-500" : "text-slate-400")} />
                            <span className={cn("text-[10px] font-black uppercase tracking-widest", todayProxies.length > 0 ? "text-amber-700" : "text-slate-600")}>
                                {todayProxies.length} Prox{todayProxies.length === 1 ? "y" : "ies"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Print Content */}
            <div className="print-only hidden p-10 bg-white dark:bg-slate-900 text-black min-h-screen">
                <div className="flex justify-between items-end mb-10 border-b-2 border-black pb-6">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter">Academic Timetable</h1>
                        <p className="text-sm font-bold uppercase tracking-widest text-gray-600 mt-2">
                            {viewMode === "class" 
                                ? `Class: ${classes.find(c => c.id === selectedClass)?.name || "N/A"}` 
                                : `Teacher: ${teachers.find(t => t.id === selectedTeacher)?.profile?.full_name || "N/A"}`}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Academic Year</p>
                        <p className="text-lg font-black uppercase tracking-tight">{currentAY?.name || "N/A"}</p>
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    {WEEKDAYS.map(day => (
                        <div key={day} className="space-y-4">
                            <h3 className="text-xl font-bold uppercase tracking-widest text-black border-l-4 border-black pl-4">{day}</h3>
                            <div className="grid grid-cols-4 gap-4">
                                {printableSlotsByDay[day]?.map((s: any) => (
                                    <div key={s.id} className="border border-gray-300 p-4 rounded-none bg-gray-50">
                                        <p className="text-[10px] font-bold uppercase mb-1">{s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}</p>
                                        <h4 className="text-sm font-black uppercase tracking-tight mb-1">{s.subject?.name}</h4>
                                        <p className="text-[10px] text-gray-600 font-bold uppercase">
                                            {viewMode === "class" ? s.teacher?.profile?.full_name : s.class_name} | {s.room_number}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit Slot Dialog */}
            <Dialog open={isEditSlotOpen} onOpenChange={setIsEditSlotOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-2xl">
                    <DialogHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <DialogTitle className="text-lg font-black tracking-tight">Edit Schedule Slot</DialogTitle>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Modify entry for {selectedDay}</p>
                    </DialogHeader>
                    <div className="p-6 space-y-5">
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-4">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Edit className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Editing</p>
                                <p className="font-bold text-lg text-slate-900 dark:text-white">
                                    {selectedDay} <span className="text-slate-300 mx-1">/</span> {editingSlot?.subject?.name || "—"}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Subject</label>
                                <select value={slotForm.subject_id} onChange={(e) => setSlotForm({ ...slotForm, subject_id: e.target.value })}
                                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none">
                                    <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select Subject...</option>
                                    {availableSubjects.map((sub: any) => (<option key={sub.id} value={sub.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{sub.name}</option>))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Teacher</label>
                                <select value={slotForm.teacher_id} onChange={(e) => setSlotForm({ ...slotForm, teacher_id: e.target.value })}
                                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none">
                                    <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select Teacher...</option>
                                    {teachers.map((t: any) => (<option key={t.id} value={t.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t.profile?.full_name}</option>))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Start Time</label>
                                <Input type="time" className="h-11 rounded-xl border-slate-200 dark:border-slate-800" value={slotForm.start_time} onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block">End Time</label>
                                <Input type="time" className="h-11 rounded-xl border-slate-200 dark:border-slate-800" value={slotForm.end_time} onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Room Number</label>
                            <select value={slotForm.room_number} onChange={(e) => setSlotForm({ ...slotForm, room_number: e.target.value })}
                                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none">
                                <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select Room...</option>
                                {allRooms.map((room) => {
                                    const isOccupied = occupiedRooms.has(room);
                                    return (<option key={room} value={room} disabled={isOccupied} className={cn("bg-white dark:bg-slate-900 text-slate-900 dark:text-white", isOccupied && "text-rose-500 dark:text-rose-400")}>{room}{isOccupied ? " (Occupied)" : ""}</option>);
                                })}
                            </select>
                        </div>

                        <button onClick={handleUpdateSlot} disabled={loading}
                            className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg transition-all disabled:opacity-50">
                            {loading ? "Updating..." : "Update Schedule Slot"}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    body { background: white !important; }
                    @page { margin: 1cm; }
                }
            `}</style>
        </div>
    );
}

"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    Eye,
    Plus,
    UserPlus,
    FileUp,
    Users,
    Search,
    CheckCircle2,
    TrendingUp,
    Activity,
    Filter,
    ArrowUpRight,
    GraduationCap,
    ChevronLeft,
    ChevronRight,
    Mail,
    Phone,
    LayoutGrid,
    List as ListIcon,
    Download,
    Printer,
    MapPin,
    Calendar,
    Contact2,
    X
} from "lucide-react";
import { Student } from "@/types/database";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ParentForm } from "../parents/ParentForm";
import { StudentForm } from "./StudentForm";
import { StudentAvatar } from "./StudentAvatar";
import { bulkAssignStudentsToClass, deleteStudent, getClassCapacity } from "@/app/actions/students";
import { toast } from "sonner";
import { BulkImportModal } from "./BulkImportModal";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { UnifiedPagination } from "@/components/shared/UnifiedPagination";

interface StudentListProps {
    initialData: Student[];
    classes: any[];
    userRole?: string | null;
    currentAcademicYearId?: string;
}

export function StudentList({ initialData, classes, userRole, currentAcademicYearId }: StudentListProps) {
    const router = useRouter();
    const isAdmin = userRole === "admin";
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [isParentOpen, setIsParentOpen] = useState(false);
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
    const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
    const [linkingStudentId, setLinkingStudentId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [classFilter, setClassFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    const [isDetailed, setIsDetailed] = useState(false);
    const [capacityInfo, setCapacityInfo] = useState<{ capacity?: number | null; currentCount?: number; available?: number | null } | null>(null);

    const filteredData = initialData.filter(student => {
        const matchesSearch = 
            student.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.admission_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = classFilter === "all" || student.class_id === classFilter;
        const matchesStatus = statusFilter === "all" || 
            (statusFilter === "enrolled" && student.admission_number) ||
            (statusFilter === "pending" && !student.admission_number);
        return matchesSearch && matchesClass && matchesStatus;
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const onAdd = () => {
        setEditingStudent(null);
        setIsOpen(true);
    };

    const onEdit = (student: Student) => {
        setEditingStudent(student);
        setIsOpen(true);
    };

    const onLinkParent = (studentId: string) => {
        setLinkingStudentId(studentId);
        setIsParentOpen(true);
    };

    const handleDeleteStudent = async (id: string) => {
        if (!confirm("Are you sure you want to remove this student record? This action cannot be undone.")) return;
        const res = await deleteStudent(id);
        if (res.success) {
            toast.success("Student record removed");
            router.refresh();
        } else {
            toast.error(res.error || "Failed to remove student");
        }
    };

    const toggleSelection = (studentId: string) => {
        setSelectedStudentIds((current) => current.includes(studentId) ? current.filter((id) => id !== studentId) : [...current, studentId]);
    };

    const handleClassSelection = async (classId: string) => {
        setSelectedClassId(classId);
        if (!classId) {
            setCapacityInfo(null);
            return;
        }

        const result = await getClassCapacity(classId);
        if (result.success) {
            setCapacityInfo({
                capacity: result.capacity,
                currentCount: result.currentCount,
                available: result.available,
            });
        }
    };

    const handleBulkAssign = async () => {
        if (!selectedClassId || selectedStudentIds.length === 0) {
            toast.error("Select at least one student and a class.");
            return;
        }

        const result = await bulkAssignStudentsToClass(selectedStudentIds, selectedClassId, currentAcademicYearId);
        if (!result.success) {
            toast.error(result.error || "Failed to assign students");
            return;
        }

        toast.success(`${result.assignedCount || selectedStudentIds.length} students assigned successfully`);
        setSelectedStudentIds([]);
        setSelectedClassId("");
        setIsBulkAssignOpen(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <DashboardStatCard 
                    title="Total Enrollment" 
                    value={initialData.length} 
                    icon={Users} 
                    color="emerald" 
                    description="Verified Students" 
                />
                <DashboardStatCard 
                    title="Verified" 
                    value={initialData.filter(s => s.admission_number).length} 
                    icon={CheckCircle2} 
                    color="blue" 
                    description="With ID Number" 
                />
                <DashboardStatCard 
                    title="Classes" 
                    value={classes.length} 
                    icon={Filter} 
                    color="purple" 
                    description="Active Sections" 
                />
                <DashboardStatCard 
                    title="Unassigned" 
                    value={initialData.filter(s => !s.class_id).length} 
                    icon={GraduationCap} 
                    color="amber" 
                    description="Awaiting Placement" 
                />
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex flex-1 flex-col sm:flex-row flex-wrap lg:flex-nowrap gap-4 w-full">
                        <div className="relative flex-1 min-w-[200px] w-full lg:max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search students..."
                                className="h-11 pl-11 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto">
                            <select
                                className="h-11 flex-1 sm:flex-initial sm:w-[160px] rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                                value={classFilter}
                                onChange={(e) => setClassFilter(e.target.value)}
                            >
                                <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Classes</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{cls.name}</option>
                                ))}
                            </select>
                            <select
                                className="h-11 flex-1 sm:flex-initial sm:w-[140px] rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Status</option>
                                <option value="enrolled" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Enrolled</option>
                                <option value="pending" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Pending</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        {isAdmin && (
                             <>
                                <button
                                    onClick={() => setIsBulkImportOpen(true)}
                                    className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                                >
                                    <FileUp className="h-4 w-4 mr-2 inline-block" /> Import
                                </button>
                                <div className="flex border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                                    <button
                                        className={cn(
                                            "h-11 w-11 transition-all",
                                            viewMode === "table" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-900"
                                        )}
                                        onClick={() => setViewMode("table")}
                                    >
                                        <ListIcon className="h-4 w-4 mx-auto mt-3.5" />
                                    </button>
                                    <button
                                        className={cn(
                                            "h-11 w-11 transition-all",
                                            viewMode === "grid" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-900"
                                        )}
                                        onClick={() => setViewMode("grid")}
                                    >
                                        <LayoutGrid className="h-4 w-4 mx-auto mt-3.5" />
                                    </button>
                                </div>
                                <div className="relative">
                                    <button
                                        className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                                        onClick={() => {}}
                                    >
                                        <Download className="h-4 w-4 mr-2 inline-block" /> Export
                                    </button>
                                </div>
                                <button
                                    onClick={() => setIsBulkAssignOpen(true)}
                                    className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all disabled:opacity-50"
                                    disabled={selectedStudentIds.length === 0}
                                >
                                    <Users className="h-4 w-4 mr-2 inline-block" /> Assign ({selectedStudentIds.length})
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                {viewMode === "table" ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800">
                                    {isAdmin && <th className="w-12 px-6 py-4 text-left"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Select</span></th>}
                                    <th className="px-6 py-4 text-left"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Student</span></th>
                                    <th className="px-6 py-4 text-left"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Class</span></th>
                                    <th className="px-6 py-4 text-left"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Contacts</span></th>
                                    <th className="px-6 py-4 text-center"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Status</span></th>
                                    <th className="px-6 py-4 text-right"><span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdmin ? 6 : 5} className="py-24 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-full mb-4">
                                                    <GraduationCap className="h-12 w-12 text-slate-200" />
                                                </div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No students found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((student) => (
                                        <tr key={student.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all group">
                                            {isAdmin && (
                                                <td className="px-6 py-5">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-slate-900 cursor-pointer transition-all"
                                                        checked={selectedStudentIds.includes(student.id)}
                                                        onChange={() => toggleSelection(student.id)}
                                                    />
                                                </td>
                                            )}
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <StudentAvatar 
                                                        name={student.profile?.full_name || undefined} 
                                                        classId={student.class_id || ""} 
                                                        className="h-11 w-11 rounded-xl ring-2 ring-white shadow-md border-2 border-slate-50"
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">
                                                            {student.profile?.full_name}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                                                            {student.admission_number || "Pending"} &bull; Roll: {student.roll_number || "\u2014"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200/50">
                                                    {student.class?.name || "Unassigned"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail className="h-3 w-3 text-slate-400" />
                                                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{student.profile?.email || "No email"}</span>
                                                    </div>
                                                    {(student.profile?.phone || (student as any).guardian_students?.[0]?.guardian?.phone) && (
                                                        <div className="flex items-center gap-1.5">
                                                            <Phone className="h-3 w-3 text-slate-400" />
                                                            <div className="flex flex-col">
                                                                {student.profile?.phone && (
                                                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{student.profile.phone}</span>
                                                                )}
                                                                {(student as any).guardian_students?.[0]?.guardian?.phone && (
                                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">G: {(student as any).guardian_students[0].guardian.phone}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                                    student.admission_number
                                                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                                                        : "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                                                )}>
                                                    {student.admission_number ? "Enrolled" : "Pending"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="h-9 w-9 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl inline-flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-200 dark:border-slate-800 shadow-xl p-1 bg-white dark:bg-slate-900">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/students/${student.id}`} className="flex items-center gap-2.5 p-2.5 text-xs font-bold cursor-pointer rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                                <Eye className="h-4 w-4 text-slate-400" /> View Profile
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onEdit(student)} className="flex items-center gap-2.5 p-2.5 text-xs font-bold cursor-pointer rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                            <Pencil className="h-4 w-4 text-slate-400" /> Edit Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onLinkParent(student.id)} className="flex items-center gap-2.5 p-2.5 text-xs font-bold cursor-pointer rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                            <UserPlus className="h-4 w-4 text-slate-400" /> Link Guardian
                                                        </DropdownMenuItem>
                                                        {isAdmin && (
                                                            <>
                                                                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />
                                                                <DropdownMenuItem onClick={() => handleDeleteStudent(student.id)} className="flex items-center gap-2.5 p-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer rounded-lg">
                                                                    <Trash2 className="h-4 w-4" /> Delete Student
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-4 sm:p-6 lg:p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                            {paginatedData.map(student => (
                                <div 
                                    key={student.id} 
                                    className={cn(
                                        "group relative p-6 rounded-xl border-2 text-left transition-all duration-500 bg-white dark:bg-slate-900/50",
                                        selectedStudentIds.includes(student.id) 
                                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 shadow-lg" 
                                            : "border-slate-200 dark:border-slate-800 hover:border-emerald-500/30"
                                    )}
                                >
                                    <div className="absolute top-4 right-4 z-10">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedStudentIds.includes(student.id)} 
                                            onChange={() => toggleSelection(student.id)} 
                                            className="h-5 w-5 rounded-md border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                        />
                                    </div>

                                    <div className="flex flex-col items-center text-center">
                                        <div className="relative">
                                            <div className="h-20 w-20 rounded-xl bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
                                                <StudentAvatar 
                                                    name={student.profile?.full_name || undefined} 
                                                    className="w-full h-full rounded-lg" 
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 w-full">
                                            <h4 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                                                {student.profile?.full_name}
                                            </h4>
                                            <p className="text-[10px] font-black text-slate-400 font-mono tracking-widest mt-1 uppercase">
                                                {student.admission_number || "PENDING"}
                                            </p>

                                            <div className="mt-6 flex flex-wrap justify-center gap-2">
                                                <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-900 text-white">
                                                    {student.class?.name || "N/A"}
                                                </span>
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                                    student.admission_number ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                                )}>
                                                    {student.admission_number ? "ENROLLED" : "PENDING"}
                                                </span>
                                            </div>

                                            <div className="mt-4 flex gap-2">
                                                <Link
                                                    href={`/students/${student.id}`}
                                                    className="flex-1 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 transition-all inline-flex items-center justify-center"
                                                >
                                                    Profile
                                                </Link>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="h-10 w-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl inline-flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-200 dark:border-slate-800 shadow-xl p-1 bg-white dark:bg-slate-900">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/students/${student.id}`} className="flex items-center gap-2.5 p-2.5 text-xs font-bold cursor-pointer rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                                <Eye className="h-4 w-4 text-slate-400" /> View Profile
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onEdit(student)} className="flex items-center gap-2.5 p-2.5 text-xs font-bold cursor-pointer rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                            <Pencil className="h-4 w-4 text-slate-400" /> Edit Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onLinkParent(student.id)} className="flex items-center gap-2.5 p-2.5 text-xs font-bold cursor-pointer rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                            <UserPlus className="h-4 w-4 text-slate-400" /> Link Guardian
                                                        </DropdownMenuItem>
                                                        {isAdmin && (
                                                            <>
                                                                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />
                                                                <DropdownMenuItem onClick={() => handleDeleteStudent(student.id)} className="flex items-center gap-2.5 p-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer rounded-lg">
                                                                    <Trash2 className="h-4 w-4" /> Delete Student
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="p-5 border-t border-slate-100 dark:border-slate-800">
                    <UnifiedPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredData.length}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={(size) => {
                            setItemsPerPage(size);
                            setCurrentPage(1);
                        }}
                        itemName="students"
                    />
                </div>
            </div>

            {/* Add/Edit Student Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-xl mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90dvh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                                    {editingStudent ? "Edit Student" : "Add Student"}
                                </h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                                    Manage student profile and enrollment
                                </p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 inline-flex items-center justify-center">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-6">
                            <StudentForm
                                initialData={editingStudent}
                                classes={classes}
                                onSuccess={() => setIsOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Link Parent Modal */}
            {isParentOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-lg mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90dvh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Link Guardian</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 flex items-center gap-2">
                                    <Activity className="h-4 w-4" /> Family connectivity framework
                                </p>
                            </div>
                            <button onClick={() => setIsParentOpen(false)} className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 inline-flex items-center justify-center">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-6">
                            {linkingStudentId && (
                                <ParentForm
                                    studentId={linkingStudentId}
                                    onSuccess={() => setIsParentOpen(false)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Import Modal */}
            {isBulkImportOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-[700px] mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90dvh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileUp className="h-6 w-6 text-emerald-600" />
                                <div>
                                    <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Batch Import</h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Upload institutional data in bulk format</p>
                                </div>
                            </div>
                            <button onClick={() => setIsBulkImportOpen(false)} className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 inline-flex items-center justify-center">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-6">
                            <BulkImportModal
                                onSuccess={() => setIsBulkImportOpen(false)}
                                onCancel={() => setIsBulkImportOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Assign Modal */}
            {isBulkAssignOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-[520px] mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90dvh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Bulk Assignment</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Global class allocation framework</p>
                            </div>
                            <button onClick={() => setIsBulkAssignOpen(false)} className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 inline-flex items-center justify-center">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Target Class</label>
                                <select
                                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-xs font-bold text-slate-700 dark:text-slate-300 focus:border-blue-300 outline-none"
                                    value={selectedClassId}
                                    onChange={(e) => { void handleClassSelection(e.target.value); }}
                                >
                                    <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select allocation target</option>
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{cls.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-5 border border-slate-100 dark:border-slate-800 space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Selection</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedStudentIds.length} members selected</p>
                            </div>

                            <button
                                onClick={handleBulkAssign}
                                className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50 w-full"
                            >
                                Execute Assignment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
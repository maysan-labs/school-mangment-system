"use client";

import { useState, useEffect, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ClipboardCheck, 
  ArrowLeft, 
  Calendar, 
  Users, 
  Save, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Loader2
} from "lucide-react";
import { 
  getClassStudentsForAttendance, 
  saveClassAttendance 
} from "@/app/actions/teacher-portal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function TeacherClassAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;

  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [classData, setClassData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await getClassStudentsForAttendance(classId, date);
      if (res.success && res.data) {
        setClassData(res.data.classData);
        setStudents(res.data.students);
      } else {
        toast.error(res.error || "Failed to load classroom roster.");
      }
      setLoading(false);
    }
    if (classId) {
      loadData();
    }
  }, [classId, date]);

  const handleStatusChange = (studentId: string, status: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status } : s))
    );
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, remarks } : s))
    );
  };

  const handleBulkMark = (status: "present" | "absent") => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
    toast.success(`Marked all students as ${status.toUpperCase()}`);
  };

  const handleSave = () => {
    startTransition(async () => {
      const records = students.map((s) => ({
        student_id: s.id,
        status: s.status,
        remarks: s.remarks,
      }));

      const res = await saveClassAttendance({
        class_id: classId,
        date,
        records,
      });

      if (res.success) {
        toast.success(`Attendance saved successfully for ${date}!`);
      } else {
        toast.error(res.error || "Failed to save attendance.");
      }
    });
  };

  const presentCount = students.filter((s) => s.status.toLowerCase() === "present").length;
  const absentCount = students.filter((s) => s.status.toLowerCase() === "absent").length;
  const lateCount = students.filter((s) => s.status.toLowerCase() === "late").length;

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href="/teacher/classes" 
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Classrooms
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            {classData?.name || "Class"} Attendance Roll-Call
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Section {classData?.section || "A"} • Room {classData?.room_number || "Hall 1"} • {students.length} Enrolled Students
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />

          <button
            onClick={handleSave}
            disabled={isPending || loading}
            className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Attendance
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary & Bulk Controls */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Present: <strong className="text-emerald-600 dark:text-emerald-400">{presentCount}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Absent: <strong className="text-rose-600 dark:text-rose-400">{absentCount}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Late: <strong className="text-amber-600 dark:text-amber-400">{lateCount}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => handleBulkMark("present")}
            className="px-3.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider hover:bg-emerald-100 transition-all"
          >
            Mark All Present
          </button>
          <button
            onClick={() => handleBulkMark("absent")}
            className="px-3.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs font-bold uppercase tracking-wider hover:bg-rose-100 transition-all"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            <span>Loading student roster...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs italic">
            No students found enrolled in this classroom section.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/70 dark:bg-slate-850">
                <tr>
                  <th className="h-12 px-6 text-left align-middle font-black text-[10px] uppercase tracking-widest text-slate-400">
                    Student Details
                  </th>
                  <th className="h-12 px-6 text-center align-middle font-black text-[10px] uppercase tracking-widest text-slate-400">
                    Status
                  </th>
                  <th className="h-12 px-6 text-left align-middle font-black text-[10px] uppercase tracking-widest text-slate-400">
                    Remarks / Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((student) => {
                  const currentStatus = (student.status || "present").toLowerCase();
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                            {student.roll_number !== "—" ? student.roll_number : student.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900 dark:text-white">
                              {student.full_name}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400">
                              {student.admission_number}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, "present")}
                            className={cn(
                              "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                              currentStatus === "present"
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                            )}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, "absent")}
                            className={cn(
                              "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                              currentStatus === "absent"
                                ? "bg-rose-600 text-white shadow-sm"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                            )}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, "late")}
                            className={cn(
                              "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                              currentStatus === "late"
                                ? "bg-amber-600 text-white shadow-sm"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                            )}
                          >
                            Late
                          </button>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={student.remarks || ""}
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          placeholder="Optional remark..."
                          className="w-full max-w-xs h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

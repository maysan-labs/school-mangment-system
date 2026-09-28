import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Award, 
  CheckCircle2, 
  XCircle, 
  IndianRupee, 
  GraduationCap, 
  Clock 
} from "lucide-react";
import Link from "next/link";
import { getParentChildDetail } from "@/app/actions/parent-portal";
import { ReportCardDownloadButton } from "@/components/reporting/ReportCardDownloadButton";
import { cn } from "@/lib/utils";

export default async function ParentChildDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const studentId = resolvedParams.id;

  const result = await getParentChildDetail(studentId);
  const data = result.success && result.data ? result.data : null;

  if (!data) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-slate-500">Child profile could not be loaded.</p>
        <Link href="/parent/children" className="text-xs font-bold text-purple-600 underline">
          Return to Children Roster
        </Link>
      </div>
    );
  }

  const { student, attendance, marks, fees, payments, summary } = data;
  const studentProfile: any = student.profile || {};
  const studentClass: any = student.class || {};

  const presentDays = attendance.filter((a: any) => a.status.toLowerCase() === "present").length;
  const attendanceRate = attendance.length > 0 
    ? Math.round((presentDays / attendance.length) * 100) 
    : 95;

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href="/parent/children" 
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Children Roster
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            {studentProfile.full_name || "Child Profile"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {studentClass.name} • Section {studentClass.section} • Adm No: {student.admission_number}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ReportCardDownloadButton />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Attendance
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {attendanceRate}%
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            {presentDays} of {attendance.length} days logged
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            <Award className="h-3.5 w-3.5 text-amber-500" />
            Evaluations
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {marks.length}
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            Completed assessments
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            <IndianRupee className="h-3.5 w-3.5 text-purple-500" />
            Total Fees
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            ₹{summary.totalFees.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            Annual tuition schedule
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            <Clock className="h-3.5 w-3.5 text-rose-500" />
            Outstanding Due
          </div>
          <p className={cn(
            "text-3xl font-black",
            summary.balanceDue > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
          )}>
            ₹{summary.balanceDue.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            {summary.balanceDue === 0 ? "All settled" : "Due for payment"}
          </p>
        </div>
      </div>

      {/* Assessment Marks Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
            Assessment Results & Subject Grades
          </h2>
          <span className="text-xs text-slate-400 font-semibold">
            {marks.length} recorded scores
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/70 dark:bg-slate-850">
              <tr>
                <th className="h-12 px-6 text-left align-middle font-black text-[10px] uppercase tracking-widest text-slate-400">
                  Subject
                </th>
                <th className="h-12 px-6 text-left align-middle font-black text-[10px] uppercase tracking-widest text-slate-400">
                  Exam Name
                </th>
                <th className="h-12 px-6 text-center align-middle font-black text-[10px] uppercase tracking-widest text-slate-400">
                  Marks Scored
                </th>
                <th className="h-12 px-6 text-center align-middle font-black text-[10px] uppercase tracking-widest text-slate-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {marks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 text-xs italic">
                    No examination records found for this student.
                  </td>
                </tr>
              ) : (
                marks.map((m: any, idx: number) => {
                  const passMarks = m.exam?.passing_marks || 40;
                  const isPass = m.marks_obtained >= passMarks;
                  return (
                    <tr key={m.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-sm text-slate-900 dark:text-white">
                        {m.subject?.name || "Academic Subject"}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {m.exam?.name || "Term Exam"}
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-sm text-slate-900 dark:text-white">
                        {m.marks_obtained} / {m.exam?.max_marks || 100}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1",
                          isPass
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                        )}>
                          {isPass ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {isPass ? "PASS" : "RETEST"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance History Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
            Daily Attendance History
          </h2>
          <span className="text-xs text-slate-400 font-semibold">
            {attendance.length} entries recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/70 dark:bg-slate-850">
              <tr>
                <th className="h-12 px-6 text-left align-middle font-black text-[10px] uppercase tracking-widest text-slate-400">
                  Date
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
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-400 text-xs italic">
                    No attendance records logged yet.
                  </td>
                </tr>
              ) : (
                attendance.slice(0, 10).map((r: any, idx: number) => {
                  const status = (r.status || "present").toLowerCase();
                  return (
                    <tr key={r.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                        {r.date}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-block",
                          status === "present"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : status === "absent"
                            ? "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                        )}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {r.remarks || "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

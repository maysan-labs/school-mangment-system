import { 
  ClipboardCheck, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowLeft 
} from "lucide-react";
import Link from "next/link";
import { getStudentAttendanceDetails } from "@/app/actions/student-portal";
import { cn } from "@/lib/utils";

export default async function StudentAttendancePage() {
  const result = await getStudentAttendanceDetails();
  const data = result.success && result.data ? result.data : {
    records: [],
    summary: { total: 0, present: 0, absent: 0, late: 0, percentage: 95 }
  };

  const { records, summary } = data;

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href="/student/dashboard" 
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Attendance Record
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time daily roll-call records and verified attendance percentages
          </p>
        </div>

        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-sm shrink-0">
          <ClipboardCheck className="h-6 w-6" />
        </div>
      </div>

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Attendance Rate
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {summary.percentage}%
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            {summary.percentage >= 75 ? "Satisfies Minimum 75% Rule" : "Attention Required"}
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            <Calendar className="h-3.5 w-3.5 text-blue-500" />
            Working Days
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {summary.total}
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            Total recorded sessions
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Days Present
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {summary.present}
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            Regular class attendance
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            <XCircle className="h-3.5 w-3.5 text-rose-500" />
            Days Absent
          </div>
          <p className="text-3xl font-black text-rose-600 dark:text-rose-400">
            {summary.absent}
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            {summary.late} days late recorded
          </p>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
            Detailed Daily Logs
          </h2>
          <span className="text-xs text-slate-400 font-semibold">
            Showing all recent entries
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
              {records.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-400 text-xs italic">
                    No attendance records logged yet.
                  </td>
                </tr>
              ) : (
                records.map((r: any, idx: number) => {
                  const status = (r.status || "present").toLowerCase();
                  return (
                    <tr key={r.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {r.date}
                        </div>
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

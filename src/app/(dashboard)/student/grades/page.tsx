import { 
  GraduationCap, 
  Award, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft,
  Download
} from "lucide-react";
import Link from "next/link";
import { getStudentGradesReport } from "@/app/actions/student-portal";
import { ReportCardDownloadButton } from "@/components/reporting/ReportCardDownloadButton";
import { cn } from "@/lib/utils";

export default async function StudentGradesPage() {
  const result = await getStudentGradesReport();
  const grades = result.success && result.data ? result.data : [];

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
            Academic Grades & Scores
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Official term evaluations, subject breakdown, and progress tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ReportCardDownloadButton />
        </div>
      </div>

      {/* Grade Results Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
            Official Assessment Records
          </h2>
          <span className="text-xs text-slate-400 font-semibold">
            {grades.length} recorded entries
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
                  Exam / Assessment
                </th>
                <th className="h-12 px-6 text-center align-middle font-black text-[10px] uppercase tracking-widest text-slate-400">
                  Marks Scored
                </th>
                <th className="h-12 px-6 text-center align-middle font-black text-[10px] uppercase tracking-widest text-slate-400">
                  Percentage
                </th>
                <th className="h-12 px-6 text-center align-middle font-black text-[10px] uppercase tracking-widest text-slate-400">
                  Grade
                </th>
                <th className="h-12 px-6 text-center align-middle font-black text-[10px] uppercase tracking-widest text-slate-400">
                  Result
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {grades.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 text-xs italic">
                    <Award className="h-8 w-8 mx-auto mb-2 opacity-30 text-slate-400" />
                    No grade entries recorded yet for this session.
                  </td>
                </tr>
              ) : (
                grades.map((row: any) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-sm text-slate-900 dark:text-white">
                      <div>
                        <p>{row.subject}</p>
                        <p className="text-[10px] text-slate-400 font-mono uppercase">{row.code}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{row.exam_name}</p>
                        <p className="text-[10px] text-slate-400">{row.date}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                      {row.marks}
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-sm text-slate-600 dark:text-slate-400">
                      {row.percentage}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-block",
                        row.grade.startsWith("A")
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                          : row.grade.startsWith("B")
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                      )}>
                        {row.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1",
                        row.passed 
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                      )}>
                        {row.passed ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" /> PASS
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" /> RETEST
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  ArrowLeft,
  GraduationCap,
  IndianRupee,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { getParentChildrenList } from "@/app/actions/parent-portal";

export default async function ParentChildrenPage() {
  const result = await getParentChildrenList();
  const children = result.success && result.data ? result.data : [];

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href="/parent/dashboard" 
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            My Children Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Overview and academic performance metrics for all enrolled wards
          </p>
        </div>

        <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shadow-sm shrink-0">
          <Users className="h-6 w-6" />
        </div>
      </div>

      {/* Children Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {children.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs italic bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
            No children currently associated with this guardian profile.
          </div>
        ) : (
          children.map((child) => (
            <div 
              key={child.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-xl border border-purple-200 dark:border-purple-900/40 shrink-0 group-hover:scale-105 transition-transform">
                    {child.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {child.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {child.class_name} • Sec {child.section}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                      Adm ID: {child.admission_number}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      <TrendingUp className="h-3 w-3 text-amber-500" />
                      GPA Index
                    </div>
                    <p className="text-xl font-black text-slate-900 dark:text-white">
                      {child.gpa}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      Attendance
                    </div>
                    <p className="text-xl font-black text-slate-900 dark:text-white">
                      {child.attendance_rate}%
                    </p>
                  </div>
                </div>
              </div>

              <Link 
                href={`/parent/children/${child.id}`} 
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 group-hover:shadow-lg"
              >
                <span>View Full Profile</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

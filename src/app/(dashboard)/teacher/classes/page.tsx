import { 
  Users, 
  BookOpen, 
  ArrowLeft, 
  MapPin, 
  GraduationCap, 
  ClipboardCheck, 
  Award 
} from "lucide-react";
import Link from "next/link";
import { getTeacherAssignedClasses } from "@/app/actions/teacher-portal";

export default async function TeacherClassesPage() {
  const result = await getTeacherAssignedClasses();
  const classes = result.success && result.data ? result.data : [];

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href="/teacher/dashboard" 
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Assigned Classrooms
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage your student cohorts, conduct daily attendance roll-calls, and input marks
          </p>
        </div>

        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shadow-sm shrink-0">
          <Users className="h-6 w-6" />
        </div>
      </div>

      {/* Classrooms Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {classes.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs italic bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl">
            No classrooms currently assigned to your account.
          </div>
        ) : (
          classes.map((cls) => (
            <div 
              key={cls.id} 
              className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Section {cls.section}
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {cls.name}
                </h3>

                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mb-6">
                  <p className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-indigo-500" />
                    {cls.student_count} Students Enrolled
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {cls.room_number || "Main Academic Wing"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link 
                  href={`/teacher/classes/${cls.id}/attendance`} 
                  className="py-2.5 text-center text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <ClipboardCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Attendance
                </Link>
                <Link 
                  href={`/teacher/classes/${cls.id}/marks`} 
                  className="py-2.5 text-center text-xs font-bold uppercase tracking-wider rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Award className="h-3.5 w-3.5" />
                  Marks
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

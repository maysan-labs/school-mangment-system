import Link from "next/link";
import {
  Users,
  Calendar,
  CheckCircle,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Clock,
  MapPin,
  ArrowRight,
  Award
} from "lucide-react";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { getTeacherPortalOverview } from "@/app/actions/teacher-portal";

export default async function TeacherDashboardPage() {
  const result = await getTeacherPortalOverview();
  const overview = result.success && result.data ? result.data : null;

  const teacher = overview?.teacher || {
    full_name: "Faculty Educator",
    email: "teacher@school.edu",
    department: "Academic Sciences"
  };

  const stats = overview?.stats || {
    totalClasses: 4,
    totalStudents: 112,
    pendingGradingCount: 3,
    classesTodayCount: 4,
  };

  const classes = overview?.classes || [];
  const todaySchedule = overview?.todaySchedule || [];

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <BookOpen className="h-48 w-48 -mr-12 -mt-12" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-sm border border-white/20">
              {teacher.department || "Faculty Workspace"}
            </span>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Hello, {teacher.full_name}
            </h1>

            <p className="text-xs sm:text-sm text-blue-100 max-w-xl font-medium">
              You have {stats.classesTodayCount} lectures scheduled today across {stats.totalClasses} academic groups.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/teacher/classes"
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-blue-50 transition-all flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              My Classrooms
            </Link>
            <Link
              href="/teacher/schedule"
              className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs uppercase tracking-wider border border-white/30 transition-all flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Full Timetable
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard
          title="Assigned Classes"
          value={stats.totalClasses}
          icon={Users}
          color="blue"
          description="Active student groups"
        />
        <DashboardStatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={GraduationCap}
          color="emerald"
          description="In your classrooms"
        />
        <DashboardStatCard
          title="Pending Grading"
          value={stats.pendingGradingCount}
          icon={Award}
          color="amber"
          description="Assessment sheets"
        />
        <DashboardStatCard
          title="Classes Today"
          value={stats.classesTodayCount}
          icon={Calendar}
          color="purple"
          description="Active schedule"
        />
      </div>

      {/* Main Grid: Classrooms + Today's Schedule */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Classrooms Roster */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white uppercase">
                Active Classrooms
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct actions for student attendance and grading
              </p>
            </div>
            <Link
              href="/teacher/classes"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                      Sec {cls.section}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {cls.room_number || "Hall 1"}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {cls.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    {cls.student_count} registered students
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                  <Link
                    href={`/teacher/classes/${cls.id}/attendance`}
                    className="py-2 text-center text-[10px] font-black uppercase tracking-wider rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm"
                  >
                    Attendance
                  </Link>
                  <Link
                    href={`/teacher/classes/${cls.id}/marks`}
                    className="py-2 text-center text-[10px] font-black uppercase tracking-wider rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm"
                  >
                    Enter Marks
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Today's Schedule */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Today&apos;s Lectures
            </h3>

            {todaySchedule.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">
                No classes scheduled for today.
              </p>
            ) : (
              <div className="space-y-3">
                {todaySchedule.map((slot, i) => (
                  <div
                    key={slot.id || i}
                    className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-slate-800/40 border border-blue-100/60 dark:border-slate-700/50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {slot.subject_name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                          {slot.class_name} • {slot.room}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-blue-200 dark:border-slate-700">
                        {slot.start_time} - {slot.end_time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl">
            <h4 className="text-sm font-black tracking-tight mb-2">Grading Center</h4>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed font-medium">
              Publish test scores, upload term examination results, and calculate student GPAs in real-time.
            </p>
            <Link
              href="/teacher/classes"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Select Classroom <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
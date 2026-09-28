import Link from "next/link";
import { 
  GraduationCap, 
  Star, 
  Book, 
  Clock, 
  TrendingUp, 
  ClipboardCheck, 
  Calendar, 
  IndianRupee, 
  FileText, 
  Award,
  ChevronRight,
  ArrowUpRight
} from "lucide-react";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { getStudentPortalOverview } from "@/app/actions/student-portal";
import { cn } from "@/lib/utils";

export default async function StudentDashboardPage() {
  const result = await getStudentPortalOverview();
  const overview = result.success && result.data ? result.data : null;

  const student = overview?.student || {
    full_name: "Student Portal User",
    admission_number: "ADM-2026-001",
    roll_number: "12",
    class_name: "Class 10",
    section: "A",
    room_number: "Room 101",
    academic_year: "Academic Journey 2024-25",
    email: "student@school.edu"
  };

  const stats = overview?.stats || {
    gpa: "3.85",
    attendanceRate: 94,
    totalDays: 142,
    daysPresent: 134,
    daysAbsent: 5,
    daysLate: 3,
    pendingFeeAmount: 0,
    activeCoursesCount: 6,
  };

  const upcomingExams = overview?.upcomingExams || [];
  const recentGrades = overview?.recentGrades || [];

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <GraduationCap className="h-48 w-48 -mr-12 -mt-12" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-sm border border-white/20">
                {student.academic_year}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-sm border border-white/20">
                {student.class_name} • Sec {student.section}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Welcome back, {student.full_name}!
            </h1>
            
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl font-medium">
              Roll No: {student.roll_number || "N/A"} • Admission ID: {student.admission_number} • {student.room_number || "Campus Classroom"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link 
              href="/student/grades" 
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-700 font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-emerald-50 transition-all flex items-center gap-2"
            >
              <Award className="h-4 w-4" />
              View Report Card
            </Link>
            <Link 
              href="/student/timetable" 
              className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs uppercase tracking-wider border border-white/30 transition-all flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              My Schedule
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <DashboardStatCard 
          title="GPA Index" 
          value={stats.gpa} 
          icon={Star} 
          color="amber" 
          description="Cumulative score"
        />
        <DashboardStatCard 
          title="Attendance" 
          value={`${stats.attendanceRate}%`} 
          icon={ClipboardCheck} 
          color="emerald" 
          description={`${stats.daysPresent}/${stats.totalDays} sessions`}
        />
        <DashboardStatCard 
          title="Active Courses" 
          value={`${stats.activeCoursesCount} Units`} 
          icon={Book} 
          color="blue" 
          description="Enrolled subjects"
        />
        <DashboardStatCard 
          title="Days Absent" 
          value={stats.daysAbsent} 
          icon={Clock} 
          color="rose" 
          description="Excused & unexcused"
        />
        <DashboardStatCard 
          title="Fee Status" 
          value={stats.pendingFeeAmount > 0 ? `₹${stats.pendingFeeAmount.toLocaleString()}` : "Cleared"} 
          icon={IndianRupee} 
          color={stats.pendingFeeAmount > 0 ? "amber" : "emerald"} 
          description={stats.pendingFeeAmount > 0 ? "Pending dues" : "All dues settled"}
        />
      </div>

      {/* Main Content Grid: Upcoming Milestones + Recent Grades */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Performance Marks List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white uppercase">
                Recent Assessments & Marks
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified test scores released by your educators
              </p>
            </div>
            <Link 
              href="/student/grades" 
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              See all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentGrades.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Award className="h-8 w-8 mx-auto mb-2 opacity-40 text-slate-400" />
              No assessment marks logged yet for the current term.
            </div>
          ) : (
            <div className="space-y-3">
              {recentGrades.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-300">
                      {g.subject.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {g.subject}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        {g.exam} • {g.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {g.marks_obtained}
                      </span>
                      <span className="text-xs text-slate-400"> / {g.max_marks}</span>
                    </div>

                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                      g.grade.startsWith("A") 
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                        : g.grade.startsWith("B")
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
                        : "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                    )}>
                      {g.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Upcoming Exams & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-500" />
              Upcoming Exams
            </h3>

            {upcomingExams.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No scheduled upcoming assessments right now.</p>
            ) : (
              <div className="space-y-3">
                {upcomingExams.map((exam) => (
                  <div key={exam.id} className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{exam.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{exam.subject}</p>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                        {exam.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Access Card links */}
          <div className="grid grid-cols-2 gap-3">
            <Link 
              href="/student/attendance" 
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 hover:shadow-md transition-all group"
            >
              <ClipboardCheck className="h-5 w-5 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-900 dark:text-white">Attendance</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Detailed records</p>
            </Link>

            <Link 
              href="/student/timetable" 
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 hover:shadow-md transition-all group"
            >
              <Clock className="h-5 w-5 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-900 dark:text-white">Timetable</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Class schedule</p>
            </Link>

            <Link 
              href="/student/grades" 
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/40 hover:shadow-md transition-all group"
            >
              <Award className="h-5 w-5 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-900 dark:text-white">Grades</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Report cards</p>
            </Link>

            <Link 
              href="/student/fees" 
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/40 hover:shadow-md transition-all group"
            >
              <IndianRupee className="h-5 w-5 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-slate-900 dark:text-white">Fees & Dues</p>
              <p className="text-[9px] text-slate-400 mt-0.5">Payment history</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
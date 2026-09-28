import Link from "next/link";
import { 
  User, 
  BookOpen, 
  CheckCircle2, 
  IndianRupee, 
  Calendar, 
  FileText, 
  Users, 
  ArrowRight,
  TrendingUp,
  Award,
  CreditCard
} from "lucide-react";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { getParentOverview } from "@/app/actions/parent-portal";
import { cn } from "@/lib/utils";

export default async function ParentDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ child?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const selectedChildId = resolvedParams.child;

  const res = await getParentOverview(selectedChildId);
  const data = res.success && res.data ? res.data : null;

  const parent = data?.parent || { full_name: "Parent / Guardian", email: "" };
  const children = data?.children || [];
  const selectedChild = data?.selectedChild || children[0] || {
    id: "std-1",
    name: "Enrolled Student",
    admission_number: "ADM-2026-001",
    class_name: "Class 10",
    section: "A",
    room_number: "Hall 1",
    gpa: "3.80",
    attendance_rate: 94,
    total_due: 0,
  };

  const recentAttendance = data?.recentAttendance || [];
  const feeDues = data?.feeDues || [];

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 text-white shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Users className="h-48 w-48 -mr-12 -mt-12" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-sm border border-white/20">
              Guardian Gateway
            </span>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Welcome, {parent.full_name}
            </h1>

            <p className="text-xs sm:text-sm text-purple-100 max-w-xl font-medium">
              Monitor academic attendance, periodic term marks, and tuition dues for your children.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/parent/children"
              className="px-4 py-2.5 rounded-xl bg-white text-purple-700 font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-purple-50 transition-all flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              All Children ({children.length})
            </Link>
            <Link
              href="/parent/fees"
              className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs uppercase tracking-wider border border-white/30 transition-all flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Fee Receipts
            </Link>
          </div>
        </div>
      </div>

      {/* Child Switcher (if more than 1 child) */}
      {children.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 shrink-0">
            Select Child:
          </span>
          {children.map((ch) => (
            <Link
              key={ch.id}
              href={`/parent/dashboard?child=${ch.id}`}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border",
                ch.id === selectedChild.id
                  ? "bg-purple-600 text-white border-purple-600 shadow-md"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
              )}
            >
              {ch.name} ({ch.class_name})
            </Link>
          ))}
        </div>
      )}

      {/* Selected Child Header Card */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-xl border border-purple-200 dark:border-purple-900/40 shrink-0">
            {selectedChild.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {selectedChild.name}
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                {selectedChild.class_name} • Sec {selectedChild.section}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Admission ID: {selectedChild.admission_number} • Room: {selectedChild.room_number || "Hall 1"}
            </p>
          </div>
        </div>

        <Link
          href={`/parent/children/${selectedChild.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
        >
          View Full Academic Profile <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard
          title="Attendance Rate"
          value={`${selectedChild.attendance_rate}%`}
          icon={CheckCircle2}
          color="emerald"
          description="Verified presence"
        />
        <DashboardStatCard
          title="GPA Index"
          value={selectedChild.gpa}
          icon={TrendingUp}
          color="amber"
          description="Cumulative grade"
        />
        <DashboardStatCard
          title="Tuition Dues"
          value={selectedChild.total_due > 0 ? `₹${selectedChild.total_due.toLocaleString()}` : "Settled"}
          icon={IndianRupee}
          color={selectedChild.total_due > 0 ? "rose" : "emerald"}
          description={selectedChild.total_due > 0 ? "Pending payment" : "All cleared"}
        />
        <DashboardStatCard
          title="Enrollment"
          value="Active"
          icon={BookOpen}
          color="blue"
          description="Term 2024-25"
        />
      </div>

      {/* Attendance & Dues Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Attendance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-500" />
              Recent Attendance
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              Past 7 records
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentAttendance.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">
                No attendance logs found for this student.
              </p>
            ) : (
              recentAttendance.map((att: any, i: number) => {
                const status = (att.status || "present").toLowerCase();
                return (
                  <div key={i} className="py-3 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {att.date}
                    </span>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest",
                      status === "present"
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                        : status === "absent"
                        ? "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
                        : "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                    )}>
                      {att.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pending Fee Schedule */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-purple-500" />
              Fee Installments
            </h3>
            <Link href="/parent/fees" className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline">
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {feeDues.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">
                No outstanding fee dues.
              </p>
            ) : (
              feeDues.map((fee) => (
                <div key={fee.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{fee.fee_type}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Due: {fee.due_date}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    ₹{fee.amount.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
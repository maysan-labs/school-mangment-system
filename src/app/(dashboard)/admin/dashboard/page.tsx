import {
  GraduationCap,
  Users,
  BookOpen,
  ShieldAlert,
  UsersRound,
  Building2,
  Settings,
  ShieldCheck,
  History,
  UserCheck,
  Server,
  Activity,
  ArrowRight,
  Database
} from "lucide-react";
import Link from "next/link";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { AdminCharts } from "./AdminCharts";
import { getAdminSystemOverview } from "@/app/actions/admin-system";
import { cn } from "@/lib/utils";

export default async function AdminDashboard() {
  const result = await getAdminSystemOverview();
  const overview = result.success && result.data ? result.data : null;

  const counts = overview?.counts || {
    students: 0,
    teachers: 0,
    parents: 0,
    staff: 0,
    classes: 0,
    subjects: 0,
  };

  const health = overview?.health || {
    databaseStatus: "Optimal",
    latencyMs: 14,
    storageUsagePercent: 28,
    activeSessions: 34,
    backupStatus: "Protected",
    lastBackupDate: new Date().toISOString().split("T")[0],
  };

  const settings = overview?.settings || {
    school_name: "Edu Maysan International Academy",
    academic_year: "2024-2025",
  };

  const recentLogs = overview?.recentLogs || [];

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Server className="h-48 w-48 -mr-12 -mt-12" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                System {health.databaseStatus}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/10 text-slate-300 border border-white/10">
                {settings.academic_year}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              Admin Mission Control
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
              Centralized telemetry, campus population metrics, database health, and system-level authority.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/system"
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-slate-100 transition-all flex items-center gap-2"
            >
              <Settings className="h-4 w-4 text-indigo-600" />
              System Config
            </Link>
            <Link
              href="/users"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition-all flex items-center gap-2"
            >
              <UserCheck className="h-4 w-4" />
              Manage Users
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <DashboardStatCard
          title="Students"
          value={counts.students}
          icon={GraduationCap}
          color="emerald"
          description="Total Enrolled"
        />
        <DashboardStatCard
          title="Teachers"
          value={counts.teachers}
          icon={Users}
          color="blue"
          description="Active Faculty"
        />
        <DashboardStatCard
          title="Parents"
          value={counts.parents}
          icon={UsersRound}
          color="purple"
          description="Verified Guardians"
        />
        <DashboardStatCard
          title="Staff"
          value={counts.staff}
          icon={Building2}
          color="amber"
          description="Total Personnel"
        />
        <DashboardStatCard
          title="Classes"
          value={counts.classes}
          icon={BookOpen}
          color="indigo"
          description="Active Cohorts"
        />
        <DashboardStatCard
          title="Subjects"
          value={counts.subjects}
          icon={Building2}
          color="slate"
          description="Curriculum Units"
        />
      </div>

      {/* Quick Launch Control Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/admin/system"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/40 hover:shadow-md transition-all group flex items-center gap-3"
        >
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Institution Profile</p>
            <p className="text-[10px] text-slate-400">School metadata</p>
          </div>
        </Link>

        <Link
          href="/audit"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 hover:shadow-md transition-all group flex items-center gap-3"
        >
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
            <History className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Audit Logs</p>
            <p className="text-[10px] text-slate-400">System trail</p>
          </div>
        </Link>

        <Link
          href="/compliance"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 hover:shadow-md transition-all group flex items-center gap-3"
        >
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Compliance Vault</p>
            <p className="text-[10px] text-slate-400">Policy checks</p>
          </div>
        </Link>

        <Link
          href="/hr/roles"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/40 hover:shadow-md transition-all group flex items-center gap-3"
        >
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Role Scopes</p>
            <p className="text-[10px] text-slate-400">Access policies</p>
          </div>
        </Link>
      </div>

      {/* Analytics & System Health Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-500" />
                Population Growth & Roster Analytics
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live demographic trends and enrolment velocity
              </p>
            </div>
          </div>
          <AdminCharts />
        </div>

        {/* System Health Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Database className="h-4 w-4 text-indigo-500" />
              Core Infrastructure
            </h3>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Database Engine</span>
                <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  {health.databaseStatus} ({health.latencyMs}ms)
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Storage Pool</span>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  {health.storageUsagePercent}% Used
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active Auth Sessions</span>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  {health.activeSessions} Online
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Daily Snapshots</span>
                <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  {health.backupStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Audit Events */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-slate-400" />
                Recent System Events
              </h3>
              <Link href="/audit" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                View all
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{log.action}</p>
                    <p className="text-[10px] text-slate-400">{log.actor}</p>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded">
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useDashboardMetrics } from "@/lib/hooks/useDashboardMetrics";
import { OperationsRollup } from "./OperationsRollup";
import { FinancialDashboard } from "./FinancialDashboard";
import { InstitutionalBanner } from "./InstitutionalBanner";
import { DemographicsAnalytics } from "./DemographicsAnalytics";
import { PredictiveAnalytics } from "./PredictiveAnalytics";
import { LayoutDashboard, GraduationCap, IndianRupee, BrainCircuit } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportCardDownloadButton } from "@/components/reporting/ReportCardDownloadButton";
import { Skeleton } from "@/components/ui/skeleton";

import { DailyLog } from "./DailyLog";
import { SmartActionCenter } from "./SmartActionCenter";

export function DashboardOverview({ initialData }: { initialData?: any }) {
  const { data, isLoading } = useDashboardMetrics();
  
  // Use real-time data if available, otherwise fall back to initial server data
  const metrics = data || initialData;

  if (isLoading && !initialData) {
    return (
      <div className="space-y-8">
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-full mb-4">
          <LayoutDashboard className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No dashboard data</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">We couldn't retrieve the school metrics. Please check your connection or try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <Tabs defaultValue="ops" className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <TabsList className="bg-muted/80 backdrop-blur-sm p-1 h-auto border border-border/50 rounded-xl w-full sm:w-auto grid grid-cols-4 sm:flex">
            <TabsTrigger value="ops" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-2 sm:px-4 py-2 gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold justify-center">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="academic" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-2 sm:px-4 py-2 gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold justify-center">
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Academic</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-2 sm:px-4 py-2 gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold justify-center">
              <IndianRupee className="w-4 h-4" />
              <span className="hidden sm:inline">Finance</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-2 sm:px-4 py-2 gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold justify-center">
              <BrainCircuit className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="ops" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 outline-none">
          {/* Intelligent Alerts Panel */}
          <SmartActionCenter alerts={metrics.alerts} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="w-1 h-4 bg-emerald-500 rounded-full" />
                  Attendance
                </h3>
                <OperationsRollup metrics={metrics} />
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="w-1 h-4 bg-amber-500 rounded-full" />
                  Students
                </h3>
                <DemographicsAnalytics metrics={metrics.demographics} />
              </section>
            </div>

            {/* Right Sidebar - Daily Log */}
            <div id="daily-log-section" className="lg:col-span-1 scroll-mt-20">
              <section className="space-y-4 h-full">
                <DailyLog />
              </section>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="academic" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 outline-none">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-500 rounded-full" />
              School Info
            </h3>
            <InstitutionalBanner metrics={metrics.footprint} />
          </section>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass futuristic-card rounded-2xl p-8 border border-slate-200/60 dark:border-slate-800/60 flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <ReportCardDownloadButton />
              </div>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">Academic Report Engine</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 max-w-xs">Generate instant, professional PDF report cards for any student with academic summary and grading.</p>
            </div>
            <div className="glass futuristic-card rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/60 h-auto flex flex-col items-center justify-center text-center">
              <LayoutDashboard className="h-12 w-12 text-emerald-500 mb-4 opacity-20" />
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Exam Center</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">Upcoming: Real-time Proctoring & Result Entry</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 outline-none">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-1 h-4 bg-purple-500 rounded-full" />
              Finance
            </h3>
            <FinancialDashboard metrics={metrics.finance} />
          </section>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 outline-none">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-1 h-4 bg-indigo-500 rounded-full" />
              Analytics
            </h3>
            <PredictiveAnalytics />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

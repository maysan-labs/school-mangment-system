"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  FileText,
  BarChart3,
  Loader2,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { calculateStudentRisk } from "@/lib/services/insights";


export function PerformancePredictor({ studentId }: { studentId?: string }) {
  const [analyzing, setAnalyzing] = useState(true);
  const [prediction, setPrediction] = useState<{
    score: number;
    trend: number;
    risk: string;
    attendanceRate?: number;
    avgMarks?: number;
  } | null>(null);

  useEffect(() => {
    async function fetchPrediction() {
      if (!studentId) {
        // Fallback for demo or global view
        setAnalyzing(false);
        return;
      }
      const result = await calculateStudentRisk(studentId);
      if (result.success && result.data) {
        setPrediction(result.data);
      }
      setAnalyzing(false);
    }
    fetchPrediction();
  }, [studentId]);

  if (analyzing) {
    return (
      <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 min-h-[400px] flex items-center justify-center rounded-[2rem]">
        <div className="flex flex-col items-center gap-y-4">
          <Sparkles className="h-10 w-10 text-blue-500 animate-pulse" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] animate-pulse">
            Generating Insights...
          </p>
        </div>
      </Card>
    );
  }

  if (!prediction) {
    return (
      <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 rounded-[2rem] p-8">
        <p className="text-xs text-slate-500 font-medium">Select a student to view predictive analytics.</p>
      </Card>
    );
  }

  const { score, trend, risk } = prediction;
  const riskColor = risk === "High" ? "text-rose-600 dark:text-rose-400" : risk === "Medium" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400";

  return (
    <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-foreground overflow-hidden group rounded-[2rem] soft-shadow-lg relative">
      <CardHeader className="relative z-10 pb-8 px-8 pt-10">
        <div className="flex items-center gap-x-3 mb-4">
          <div className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30 text-[10px] font-bold uppercase tracking-widest">
            Academic Insight
          </div>
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse shadow-sm" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Performance Analytics
        </CardTitle>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
          Predictive projections for the current academic term
        </p>
      </CardHeader>
      <CardContent className="space-y-8 relative z-10 px-8 pb-10">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Predicted Aggregate Score
              </span>
              <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                A- ({score}%)
              </span>
            </div>
            <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-1000 rounded-full shadow-sm"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 transition-all duration-300">
              <div className="flex items-center gap-x-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-3 tracking-widest">
                <TrendingUp className="h-3.5 w-3.5" />
                Growth Trend
              </div>
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">+{trend}%</p>
              <p className="text-[10px] font-bold uppercase tracking-tight text-slate-400 mt-1">vs Previous Period</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 transition-all duration-300">
              <div className="flex items-center gap-x-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-3 tracking-widest">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Risk Level
              </div>
              <div className="flex items-center gap-x-2">
                <p className={`text-2xl font-bold tracking-tight uppercase ${riskColor}`}>{risk}</p>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-black uppercase tracking-tighter">{risk} Risk</Badge>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-tight text-slate-400 mt-1">Consistency Rating: High</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/30 relative overflow-hidden">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-x-2 mb-4 text-blue-600 dark:text-blue-400">
            <Sparkles className="h-3.5 w-3.5" />
            Strategic Recommendations
          </h4>
          <ul className="space-y-3">
            <li className="flex items-start gap-x-3 text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-400">
              <div className="mt-1.5 h-1 w-1 rounded-full bg-blue-500 shrink-0" />
              Attendance is exceptional (Top 5%). Maintain this level for consistent results.
            </li>
            <li className="flex items-start gap-x-3 text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-400">
              <div className="mt-1.5 h-1 w-1 rounded-full bg-blue-500 shrink-0" />
              Science performance shows a positive trend. Recommend focus on advanced modules.
            </li>
          </ul>
        </div>

        <button className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs uppercase tracking-[0.2em] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-x-3 shadow-md">
          Export Academic Report
          <FileText className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  );
}

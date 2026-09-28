import { 
  Calendar, 
  Clock, 
  MapPin, 
  BookOpen, 
  ArrowLeft,
  Users
} from "lucide-react";
import Link from "next/link";
import { getTeacherWeeklySchedule } from "@/app/actions/teacher-portal";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function TeacherSchedulePage() {
  const result = await getTeacherWeeklySchedule();
  const slots = result.success && result.data ? result.data : [];

  const slotsByDay: Record<string, any[]> = {};
  DAYS_OF_WEEK.forEach(d => { slotsByDay[d] = []; });

  slots.forEach((slot: any) => {
    const day = slot.day_of_week || "Monday";
    if (!slotsByDay[day]) slotsByDay[day] = [];
    slotsByDay[day].push(slot);
  });

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
            Weekly Teaching Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Assigned lecture slots, classroom halls, and period timings across all weekdays
          </p>
        </div>

        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shadow-sm shrink-0">
          <Calendar className="h-6 w-6" />
        </div>
      </div>

      {/* Week Schedule */}
      <div className="space-y-6">
        {DAYS_OF_WEEK.map((day) => {
          const daySlots = slotsByDay[day] || [];
          return (
            <div 
              key={day} 
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm"
            >
              <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    {day}
                  </h2>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {daySlots.length} Lecture Sessions
                </span>
              </div>

              {daySlots.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs italic">
                  No teaching slots assigned for {day}.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {daySlots.map((slot: any, idx: number) => (
                    <div 
                      key={slot.id || idx} 
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center font-black text-xs text-amber-600 dark:text-amber-400 shrink-0">
                          P{slot.period_number || idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {slot.subject?.name || "Subject Lecture"}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400 font-medium">
                            <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                              <Users className="h-3 w-3 text-amber-500" />
                              {slot.class?.name || "Classroom"} {slot.class?.section ? `(${slot.class.section})` : ""}
                            </span>
                            {slot.room && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {slot.room}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl self-start sm:self-center">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        <span>{slot.start_time?.substring(0, 5) || "09:00"} - {slot.end_time?.substring(0, 5) || "10:00"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

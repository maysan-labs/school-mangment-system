"use client";

import { useState } from "react";
import { Plus, X, IndianRupee, UserPlus, GraduationCap, BookOpen, Calendar, ClipboardCheck, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const quickActions = [
  { label: "Add Student", icon: GraduationCap, href: "/students/enroll", color: "bg-emerald-500" },
  { label: "Collect Fee", icon: IndianRupee, href: "/fees", color: "bg-blue-500" },
  { label: "Add Staff", icon: UserPlus, href: "/hr/add-staff", color: "bg-purple-500" },
  { label: "Mark Attendance", icon: ClipboardCheck, href: "/students/attendance", color: "bg-amber-500" },
  { label: "Schedule Exam", icon: BookOpen, href: "/exams", color: "bg-cyan-500" },
  { label: "Send Message", icon: Users, href: "/messages", color: "bg-pink-500" },
];

export function QuickActionsFab() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleAction = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      {isOpen && (
        <div className="absolute bottom-14 right-0 flex flex-col-reverse gap-2.5 sm:gap-3 items-end">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleAction(action.href)}
              className="flex items-center gap-2 sm:gap-3 group cursor-pointer"
            >
              <span className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-md text-xs sm:text-sm font-medium opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-200/50 dark:border-slate-800">
                {action.label}
              </span>
              <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full ${action.color} flex items-center justify-center shadow-lg hover:scale-110 transition-transform`}>
                <action.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            </button>
          ))}
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center shadow-lg hover:scale-105 transition-all cursor-pointer ${isOpen ? "rotate-45" : ""}`}
        aria-label="Quick actions"
      >
        {isOpen ? (
          <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        ) : (
          <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        )}
      </button>
    </div>
  );
}
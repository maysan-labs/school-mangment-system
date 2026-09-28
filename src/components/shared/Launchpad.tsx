"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  UserSquare2,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  FileText,
  Settings,
  MessageSquare,
  Bus,
  Library,
  Package,
  Calendar,
  Award,
  ShieldCheck,
  Heart,
  Stethoscope,
  Trophy,
  Globe,
  BarChart3,
  FileBarChart,
  UserCheck,
  History,
  IndianRupee,
  BookMarked,
  ArrowRight,
  Sparkles,
  Search,
  Wallet,
  Bell,
  UserCircle2
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles?: string[];
  description?: string;
  isNew?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
  roles?: string[];
}

const navigation: NavGroup[] = [
  {
    group: "Workspace",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard, description: "Institutional overview, metrics, and central stats" },
      { name: "Insights", href: "/insights", icon: Sparkles, roles: ["admin", "teacher", "student"], description: "Real-time trends, roster metrics, and performance analytics" },
      { name: "Inbox", href: "/notifications", icon: Bell, description: "System alerts and unread incoming notifications" },
      { name: "Messages", href: "/messages", icon: MessageSquare, description: "Announcements, chats, and general communications" },
    ],
  },
  {
    group: "Student Portal",
    roles: ["student"],
    items: [
      { name: "Student Dashboard", href: "/student/dashboard", icon: LayoutDashboard, description: "Academic milestones, GPA, and course overviews" },
      { name: "My Attendance", href: "/student/attendance", icon: ClipboardCheck, description: "Daily roll-call records and verified presence rates" },
      { name: "My Grades", href: "/student/grades", icon: Award, description: "Official term evaluations, subject breakdown, and report cards" },
      { name: "My Timetable", href: "/student/timetable", icon: Calendar, description: "Class subject schedule, period timings, and assigned room" },
      { name: "Fee Invoices", href: "/student/fees", icon: IndianRupee, description: "Tuition installment schedules and payment receipts" },
    ],
  },
  {
    group: "Parent Portal",
    roles: ["parent"],
    items: [
      { name: "Parent Dashboard", href: "/parent/dashboard", icon: LayoutDashboard, description: "Progress monitoring for your enrolled children" },
      { name: "My Children", href: "/parent/children", icon: Users, description: "Detailed academic records, GPAs, and reports for each ward" },
      { name: "Fee Receipts", href: "/parent/fees", icon: IndianRupee, description: "Tuition invoices, fee balances, and payment vouchers" },
    ],
  },
  {
    group: "Students",
    roles: ["admin", "teacher"],
    items: [
      { name: "Student List", href: "/students/list", icon: GraduationCap, description: "View and manage active student index records" },
      { name: "Enroll", href: "/students/enroll", icon: UserSquare2, description: "Register new students to classes" },
      { name: "Guardians", href: "/students/guardians", icon: Users, description: "Manage parent associations and directory records" },
      { name: "Documents", href: "/students/documents", icon: FileText, description: "Manage student certificates, proofs, and archives" },
      { name: "Attendance", href: "/students/attendance", icon: ClipboardCheck, description: "Track daily roll calls and telemetry stats" },
      { name: "Conduct", href: "/students/conduct", icon: UserCheck, description: "Track conduct points, actions, and discipline logs" },
      { name: "Health", href: "/students/health", icon: Stethoscope, description: "Manage campus clinical logs and medical details" },
    ],
  },
  {
    group: "Staff",
    roles: ["admin", "teacher"],
    items: [
      { name: "Staff List", href: "/hr/directory", icon: UserSquare2, roles: ["admin"], description: "Directory of all admin and academic staff" },
      { name: "Add Staff", href: "/hr/add-staff", icon: UserSquare2, roles: ["admin"], description: "Register and onboard new staff members" },
      { name: "Permissions", href: "/hr/roles", icon: ShieldCheck, roles: ["admin"], description: "Manage system access scopes and permissions" },
      { name: "Attendance", href: "/hr/attendance", icon: ClipboardCheck, roles: ["admin"], description: "Track active staff daily presence logs" },
      { name: "Teacher Dashboard", href: "/teacher/dashboard", icon: Users, roles: ["teacher"], description: "Teacher portal to manage classes and grade sheets" },
      { name: "My Classrooms", href: "/teacher/classes", icon: BookOpen, roles: ["teacher"], description: "Assigned student cohorts, roll-call attendance, and marks entry" },
      { name: "Teaching Schedule", href: "/teacher/schedule", icon: Calendar, roles: ["teacher"], description: "Weekly lecture sessions, classroom halls, and timings" },
    ],
  },
  {
    group: "Academics",
    roles: ["admin", "teacher", "student"],
    items: [
      { name: "Classes", href: "/academics/classes", icon: Users, roles: ["admin", "teacher"], description: "Configure class sections, limits, and levels" },
      { name: "Subjects", href: "/academics/subjects", icon: BookOpen, roles: ["admin", "teacher"], description: "Define school subjects and syllabus guidelines" },
      { name: "Timetable", href: "/academics/timetable", icon: Calendar, description: "General school timetable and period schedules" },
      { name: "Exams", href: "/academics/exams", icon: FileText, roles: ["admin", "teacher"], description: "Exams dashboard, assessments, and score listings" },
      { name: "Online Exams", href: "/academics/exams/online", icon: Globe, roles: ["admin", "teacher"], description: "Setup online computer-based tests and keys" },
      { name: "Gradebook", href: "/academics/gradebook", icon: ClipboardCheck, description: "View student term marks, progress cards, and metrics" },
      { name: "Activities", href: "/academics/activities", icon: Trophy, description: "Co-curricular activities list and logs" },
      { name: "Certificates", href: "/academics/certificates", icon: Award, description: "Generate templates and print student award sheets" },
    ],
  },
  {
    group: "Finance",
    items: [
      { name: "Fees Dashboard", href: "/finance/dashboard", icon: IndianRupee, description: "Overview of fees, daily logs, and balance sheets" },
      { name: "Collect Fees", href: "/finance/collect-fees", icon: IndianRupee, description: "Process payment checkouts and fee dues" },
      { name: "Fee Setup", href: "/finance/structure", icon: Settings, description: "Define school fees structures, accounts, and types" },
      { name: "Payment Gateways", href: "/finance/gateways", icon: Wallet, description: "Manage online payment credentials and processing APIs" },
      { name: "Print Slips", href: "/finance/slips", icon: FileText, description: "View, generate, and print student payment sheets" },
      { name: "Daily Log", href: "/finance/daily", icon: BarChart3, description: "Summary of payments received today" },
      { name: "Day Book", href: "/finance/day-book", icon: BookMarked, roles: ["admin"], description: "Comprehensive daily ledger ledger reports" },
      { name: "Payroll Dashboard", href: "/finance/payroll", icon: IndianRupee, roles: ["admin"], description: "Staff payroll, monthly salaries, and leave requests dashboard" },
      { name: "Process Salary", href: "/finance/process-salary", icon: Settings, roles: ["admin"], description: "Generate monthly pay structures based on attendances" },
    ],
  },
  {
    group: "Services",
    items: [
      { name: "Library", href: "/services/library", icon: Library, description: "Track library catalog, book issues, and returns" },
      { name: "Transport", href: "/services/transport", icon: Bus, description: "Manage bus route tracking, drivers, and fleets" },
      { name: "Inventory", href: "/services/inventory", icon: Package, roles: ["admin"], description: "Asset directory and inventory levels" },
      { name: "Alumni", href: "/services/alumni", icon: Award, description: "Graduates logs, outstanding achievements, and memories" },
    ],
  },
  {
    group: "System",
    roles: ["admin"],
    items: [
      { name: "Mission Control", href: "/admin/dashboard", icon: LayoutDashboard, description: "Centralized system telemetry, health, and campus metrics" },
      { name: "System Config", href: "/admin/system", icon: Settings, description: "Global institution settings, metadata, and defaults" },
      { name: "Settings", href: "/settings", icon: Settings, description: "Configure school metadata, terms, and templates" },
      { name: "Audit Logs", href: "/audit", icon: History, description: "Track system access details and logs" },
      { name: "Compliance", href: "/compliance", icon: ShieldCheck, description: "Manage school compliance audits and document vaults" },
      { name: "Users", href: "/users", icon: UserCheck, description: "Configure system roles, logins, and passwords" },
      { name: "Enterprise", href: "/settings/enterprise", icon: Trophy, description: "Premium integrations, scaling tiers, and support" },
      { name: "My Profile", href: "/profile", icon: UserCircle2, roles: ["admin", "teacher", "student"], description: "Manage personal account profile settings" },
    ],
  },
];

export function Launchpad({ 
  userRole = "admin", 
  searchQuery = "" 
}: { 
  userRole?: string, 
  searchQuery?: string 
}) {
  const filteredNavigation = navigation
    .filter((group) => !group.roles || group.roles.includes(userRole))
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => 
          (!item.roles || item.roles.includes(userRole)) &&
          ((item.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
           (item.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()))
      ),
    }))
    .filter((group) => group.items.length > 0);

  if (filteredNavigation.length === 0 && searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in duration-500">
        <div className="h-20 w-20 bg-slate-100 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 mb-8 flex items-center justify-center shadow-sm">
          <Search className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">No Results Found</h3>
        <p className="text-base text-slate-500 dark:text-slate-400 max-w-sm font-medium">We couldn't find anything matching your search. Please try different keywords.</p>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      {filteredNavigation.map((group, groupIdx) => (
        <div 
          key={group.group} 
          className="space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-1000 fill-mode-both"
          style={{ animationDelay: `${groupIdx * 150}ms` }}
        >
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
                <h3 className="text-[10px] font-black tracking-[0.25em] text-slate-400 dark:text-slate-500 uppercase leading-none mb-2">
                    Category
                </h3>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                    {group.group}
                </h2>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {group.items.map((item, itemIdx) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-col p-6 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem] hover:border-emerald-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/5 overflow-hidden"
              >
                {/* Background Sparkle Effect */}
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-20 transition-opacity">
                    <Sparkles className="h-20 w-20 text-emerald-500 -mr-10 -mt-10 rotate-12" />
                </div>

                <div className="flex flex-col gap-6 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 group-hover:ring-emerald-500">
                        <item.icon className="h-7 w-7 stroke-[1.5]" />
                    </div>
                    {item.isNew && (
                        <Badge className="bg-emerald-500 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border-none shadow-lg shadow-emerald-500/20 animate-bounce">
                            New
                        </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {item.name}
                        </h3>
                        <ArrowRight className="h-3 w-3 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-500" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-bold tracking-tight opacity-80 group-hover:opacity-100 transition-opacity">
                      {item.description}
                    </p>
                  </div>
                </div>
                
                {/* Decorative Bottom Bar */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-emerald-500 group-hover:w-full transition-all duration-700 delay-100" />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserSquare2,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  FileText,
  Settings,
  Bus,
  Library,
  Calendar,
  IndianRupee,
  Award,
  Stethoscope,
  BarChart3,
  FileBarChart,
  UserCheck,
  History,
  ChevronDown,
  Shield,
  Wallet,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  Trophy,
  Sparkles,
  MessageSquare,
  Package,
  UserCircle2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserService } from "@/lib/services/user";
import { createClient } from "@/lib/supabase/client";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles?: string[];
  subItems?: { name: string; href: string }[];
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
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Insights", href: "/insights", icon: Sparkles, roles: ["admin", "teacher", "student"] },
      { name: "Notification", href: "/notifications", icon: Bell },
      { name: "Messages", href: "/messages", icon: MessageSquare },
    ],
  },
  {
    group: "Student Portal",
    roles: ["student"],
    items: [
      { name: "My Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
      { name: "My Attendance", href: "/student/attendance", icon: ClipboardCheck },
      { name: "My Grades", href: "/student/grades", icon: Award },
      { name: "My Timetable", href: "/student/timetable", icon: Calendar },
      { name: "Fee Invoices", href: "/student/fees", icon: IndianRupee },
    ],
  },
  {
    group: "Parent Portal",
    roles: ["parent"],
    items: [
      { name: "Parent Dashboard", href: "/parent/dashboard", icon: LayoutDashboard },
      { name: "My Children", href: "/parent/children", icon: Users },
      { name: "Fee Receipts", href: "/parent/fees", icon: IndianRupee },
    ],
  },
  {
    group: "Students",
    roles: ["admin", "teacher"],
    items: [
      {
        name: "Students",
        href: "/students/list",
        icon: GraduationCap,
        subItems: [
          { name: "Student List", href: "/students/list" },
          { name: "Enroll", href: "/students/enroll" },
          { name: "Guardians", href: "/students/guardians" },
          { name: "Documents", href: "/students/documents" },
        ]
      },
      { name: "Attendance", href: "/students/attendance", icon: ClipboardCheck },
      { name: "Conduct", href: "/students/conduct", icon: UserCheck },
      { name: "Health", href: "/students/health", icon: Stethoscope },
    ],
  },
  {
    group: "Staff",
    roles: ["admin", "teacher"],
    items: [
      {
        name: "Staff",
        href: "/hr/directory",
        icon: UserSquare2,
        subItems: [
          { name: "Staff List", href: "/hr/directory" },
          { name: "Add Staff", href: "/hr/add-staff" },
          { name: "Permissions", href: "/hr/roles" },
          { name: "Attendance", href: "/hr/attendance" },
        ]
      },
      { name: "Teacher Dashboard", href: "/teacher/dashboard", icon: Users, roles: ["teacher"] },
      { name: "My Classrooms", href: "/teacher/classes", icon: BookOpen, roles: ["teacher"] },
      { name: "Teaching Schedule", href: "/teacher/schedule", icon: Calendar, roles: ["teacher"] },
    ],
  },
  {
    group: "Academics",
    roles: ["admin", "teacher", "student"],
    items: [
      { name: "Classes", href: "/academics/classes", icon: Users, roles: ["admin", "teacher"] },
      { name: "Subjects", href: "/academics/subjects", icon: BookOpen, roles: ["admin", "teacher"] },
      { name: "Timetable", href: "/academics/timetable", icon: Calendar },
      {
        name: "Exams",
        href: "/academics/exams",
        icon: FileText,
        roles: ["admin", "teacher"],
        subItems: [
          { name: "Exam List", href: "/academics/exams" },
          { name: "Online Exams", href: "/academics/exams/online" },
          { name: "Gradebook", href: "/academics/gradebook" },
        ]
      },
      { name: "Activities", href: "/academics/activities", icon: Trophy },
      { name: "Certificates", href: "/academics/certificates", icon: Award },
    ],
  },
  {
    group: "Finance",
    items: [
      {
        name: "Fees",
        href: "/finance/dashboard",
        icon: IndianRupee,
        subItems: [
          { name: "Fees Dashboard", href: "/finance/dashboard" },
          { name: "Collect Fees", href: "/finance/collect-fees" },
          { name: "Fee Setup", href: "/finance/structure" },
          { name: "Payment Gateways", href: "/finance/gateways" },
          { name: "Daily Log", href: "/finance/daily" },
          { name: "Print Slips", href: "/finance/slips" },
        ]
      },
      {
        name: "Payroll",
        href: "/finance/payroll",
        icon: Wallet,
        roles: ["admin"],
        subItems: [
          { name: "Payroll Dashboard", href: "/finance/payroll" },
          { name: "Process Salary", href: "/finance/process-salary" },
          { name: "Day Book", href: "/finance/day-book" },
          { name: "Salary Settings", href: "/finance/salary-settings" },
        ]
      },
    ],
  },
  {
    group: "Services",
    items: [
      { name: "Library", href: "/services/library", icon: Library },
      { name: "Transport", href: "/services/transport", icon: Bus },
      { name: "Inventory", href: "/services/inventory", icon: Package, roles: ["admin"] },
      { name: "Alumni", href: "/services/alumni", icon: Award },
    ],
  },
  {
    group: "System",
    roles: ["admin"],
    items: [
      { name: "Mission Control", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "System Config", href: "/admin/system", icon: Settings },
      { name: "Settings", href: "/settings", icon: Settings },
      { name: "Audit Logs", href: "/audit", icon: History },
      { name: "Compliance", href: "/compliance", icon: ShieldCheck },
      { name: "Users", href: "/users", icon: UserCheck },
      { name: "Enterprise", href: "/settings/enterprise", icon: Trophy },
      { name: "My Profile", href: "/profile", icon: UserCircle2, roles: ["admin", "teacher", "student"] },
    ],
  },
];

export function Sidebar({ 
  initialProfile, 
  userRole,
  isMobile = false,
  onClose,
}: { 
  initialProfile: any; 
  userRole: string | null;
  isMobile?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { isCollapsed, toggle: toggleSidebar, width, setWidth } = useSidebarStore();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [profile, setProfile] = useState(initialProfile);
  const [isResizing, setIsResizing] = useState(false);

  const effectiveCollapsed = !isMobile && isCollapsed;

  useEffect(() => {
    if (isResizing && !isMobile) {
      const handleMouseMove = (e: MouseEvent) => {
        let newWidth = e.clientX;
        if (newWidth < 200) newWidth = 200;
        if (newWidth > 450) newWidth = 450;
        setWidth(newWidth);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.body.style.cursor = "default";
        document.body.style.userSelect = "auto";
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, isMobile, setWidth]);

  useEffect(() => {
    // Determine which groups should be expanded based on current path
    const groupsToExpand = navigation
      .filter((group) => 
        group.items.some((item) => 
          pathname.startsWith(item.href) || 
          item.subItems?.some(sub => pathname.startsWith(sub.href))
        )
      )
      .map(g => g.group);
    
    const handle = requestAnimationFrame(() => {
      setExpandedGroups(prev => [...new Set([...prev, ...groupsToExpand])]);
    });
    return () => cancelAnimationFrame(handle);
  }, [pathname]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const isItemActive = (item: NavItem) => {
    if (item.href === "/" && pathname !== "/") return false;
    return pathname.startsWith(item.href);
  };

  const canSeeItem = (item: NavItem) => {
    if (!item.roles) return true;
    return userRole && item.roles.includes(userRole);
  };

  const canSeeGroup = (group: NavGroup) => {
    if (!group.roles) return true;
    return userRole && group.roles.includes(userRole);
  };

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <div 
      className={cn(
        "flex flex-col h-full bg-slate-950 border-r border-slate-800 relative group/sidebar select-none",
        isResizing ? "transition-none border-r-emerald-500/50 shadow-2xl shadow-emerald-500/5" : "transition-all duration-300",
        isMobile ? "w-full" : (effectiveCollapsed ? "w-20" : "w-64")
      )}
      style={isMobile ? undefined : { width: effectiveCollapsed ? 80 : width }}
    >
      {/* Resize Handle - desktop only */}
      {!isMobile && !effectiveCollapsed && (
        <div 
          onMouseDown={() => setIsResizing(true)}
          className={cn(
            "absolute right-0 top-0 bottom-0 w-1 cursor-col-resize transition-all duration-300 z-[60] group/handle",
            isResizing ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] w-1.5" : "hover:bg-emerald-500/30 hover:w-1.5"
          )}
        >
          <div className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-12 rounded-full bg-slate-800 border border-slate-700 flex flex-col items-center justify-center gap-1 transition-all duration-300 opacity-0 group-hover/handle:opacity-100",
            isResizing && "opacity-100 bg-emerald-500 border-emerald-400"
          )}>
            <div className="w-0.5 h-4 bg-slate-600/50 rounded-full" />
          </div>
        </div>
      )}

      {/* Brand Logo & Close button for mobile */}
      <div className="p-4 sm:p-5 pb-2 flex items-center justify-between min-h-[48px]">
        <div className="flex items-center gap-3">
          {effectiveCollapsed ? (
            <div className="h-10 w-10 rounded-xl overflow-hidden shrink-0 shadow-lg shadow-emerald-500/20 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <Image 
                src="/icon-rounded-v2.png" 
                alt="Edu Maysan" 
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
          ) : (
            <div className="h-10 w-auto rounded-xl overflow-hidden shrink-0 flex items-center">
              <Image 
                src="/logo-rounded-v2.png" 
                alt="Edu Maysan" 
                width={140}
                height={40}
                className="object-contain h-full w-auto"
                priority
              />
            </div>
          )}
          {!effectiveCollapsed && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-500">
              <p className="text-[10px] text-emerald-400/70 font-medium tracking-wider uppercase">Edu Maysan</p>
            </div>
          )}
        </div>

        {isMobile && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Collapse Toggle - desktop only */}
      {!isMobile && (
        <button 
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 bg-slate-800 text-slate-400 p-1 rounded-full border border-slate-700 hover:text-white transition-colors z-50 cursor-pointer"
          aria-label={effectiveCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {effectiveCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      )}

      {/* Navigation Links */}
      <ScrollArea className="flex-1 px-4 py-6" hideScrollbar>
        <div className="space-y-8">
          {navigation.filter(canSeeGroup).map((group) => (
            <div key={group.group} className="space-y-2">
              {!effectiveCollapsed && (
                <h2 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 animate-in fade-in duration-700">
                  {group.group}
                </h2>
              )}
              
              <div className="space-y-1">
                {group.items.filter(canSeeItem).map((item) => {
                  const active = isItemActive(item);
                  const hasSubItems = item.subItems && item.subItems.length > 0;
                  const isExpanded = expandedGroups.includes(item.name);

                  return (
                    <div key={item.name} className="space-y-1">
                      {effectiveCollapsed ? (
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link 
                                href={item.href}
                                onClick={handleLinkClick}
                                className={cn(
                                  "flex items-center justify-center h-12 w-12 mx-auto rounded-xl transition-all duration-200",
                                  active 
                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
                                )}
                              >
                                <item.icon className="h-5 w-5" />
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-slate-900 border-slate-800 text-white font-bold text-xs px-3 py-1.5">
                              {item.name}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <>
                          {hasSubItems ? (
                            <button
                              onClick={() => toggleGroup(item.name)}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                                active ? "text-white" : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50"
                              )}
                            >
                              <item.icon className={cn("h-5 w-5 transition-colors", active ? "text-emerald-400" : "group-hover:text-slate-200")} />
                              <span className="text-sm font-bold flex-1 text-left">{item.name}</span>
                              <ChevronDown className={cn("h-4 w-4 transition-transform duration-200 opacity-50", isExpanded && "rotate-180")} />
                            </button>
                          ) : (
                            <Link 
                              href={item.href}
                              onClick={handleLinkClick}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                                active ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50"
                              )}
                            >
                              <item.icon className={cn("h-5 w-5 transition-colors", active ? "text-white" : "group-hover:text-slate-200")} />
                              <span className="text-sm font-bold">{item.name}</span>
                              {active && <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                            </Link>
                          )}

                          {/* Sub Items */}
                          {!effectiveCollapsed && hasSubItems && isExpanded && (
                            <div className="ml-9 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-300">
                              {item.subItems?.map((sub) => {
                                const subActive = pathname === sub.href;
                                return (
                                  <Link
                                    key={sub.name}
                                    href={sub.href}
                                    onClick={handleLinkClick}
                                    className={cn(
                                      "block px-3 py-2 text-xs font-bold transition-all rounded-lg relative",
                                      subActive 
                                        ? "text-emerald-400" 
                                        : "text-slate-500 hover:text-slate-300"
                                    )}
                                  >
                                    {subActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3 bg-emerald-500 rounded-full" />}
                                    {sub.name}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* User Profile Mini */}
      {!effectiveCollapsed && (
        <div className="p-4 mt-auto border-t border-slate-900 bg-slate-950/50 backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-1000">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-white text-xs shadow-lg shadow-emerald-500/10">
              {profile?.full_name?.[0] || userRole?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black text-white truncate">{profile?.full_name || "School User"}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{userRole?.replace('_', ' ') || "Admin"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

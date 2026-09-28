"use client";

import { Suspense, lazy } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, LogOut, User as UserIcon, GraduationCap, ShieldCheck, IndianRupee, BookOpen, ClipboardCheck, Calendar, MessageSquare, Users, Library, Bus, Heart, Clock, BookMarked, Monitor, Wallet, LayoutDashboard, Settings, ChevronRight, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { UserService } from "@/lib/services/user";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/providers/ThemeProvider";

const Launchpad = lazy(() => import("@/components/shared/Launchpad").then(m => ({ default: m.Launchpad })));

interface UserProfile {
  id: string;
  role: "admin" | "teacher" | "student" | "parent" | "accountant";
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
  last_login?: string;
}

const quickLinks = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" },
  { label: "Students", href: "/students", icon: GraduationCap, color: "text-blue-600 dark:text-blue-400 bg-blue-500/10" },
  { label: "Attendance", href: "/students/attendance", icon: ClipboardCheck, color: "text-amber-600 dark:text-amber-400 bg-amber-500/10" },
  { label: "Fees", href: "/finance/dashboard", icon: IndianRupee, color: "text-purple-600 dark:text-purple-400 bg-purple-500/10" },
  { label: "Timetable", href: "/academics/timetable", icon: Calendar, color: "text-rose-600 dark:text-rose-400 bg-rose-500/10" },
  { label: "Messages", href: "/messages", icon: MessageSquare, color: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10" },
  { label: "Library", href: "/services/library", icon: Library, color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10" },
  { label: "Transport", href: "/services/transport", icon: Bus, color: "text-orange-600 dark:text-orange-400 bg-orange-500/10" },
];

const roleHref: Record<string, string> = {
  admin: "/",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
  parent: "/parent/dashboard",
  accountant: "/finance/dashboard",
};

export default function PortalPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    const fetchProfile = async () => {
      try {
        const profile = await UserService.getCurrentProfile(supabase);
        if (cancelled) return;
        if (profile && !("error" in profile)) {
          setUserProfile(profile);
          setIsLoading(false);
          return;
        }

        // Retry once after 600ms if session cookie is propagating
        await new Promise((resolve) => setTimeout(resolve, 600));
        if (cancelled) return;
        const retryProfile = await UserService.getCurrentProfile(supabase);
        if (cancelled) return;

        if (retryProfile && !("error" in retryProfile)) {
          setUserProfile(retryProfile);
        } else {
          router.push("/login");
        }
      } catch {
        if (!cancelled) router.push("/login");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        window.location.href = "/login";
      }
    });

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearInterval(timer);
    };
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-pulse h-8 w-48 rounded-full bg-slate-200 dark:bg-white/5" />
          <div className="animate-pulse h-12 w-72 rounded-xl bg-slate-200 dark:bg-white/5" />
        </div>
      </div>
    );
  }

  const userRole = userProfile?.role || "student";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white font-sans transition-colors duration-300">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] right-[-5%] w-[50%] h-[50%] bg-emerald-500/5 dark:bg-emerald-500/8 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-[-15%] left-[-5%] w-[50%] h-[50%] bg-blue-500/5 dark:bg-blue-500/8 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: "12s" }} />
      </div>

      {/* Header */}
      <header className="relative z-50 flex items-center justify-between px-4 sm:px-6 lg:px-12 py-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <Image src="/logo-rounded-v2.png" alt="Edu Maysan" width={140} height={40} className="object-contain h-8 w-auto" priority />

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-slate-200/50 dark:bg-white/5 px-4 py-1.5 rounded-xl border border-slate-200 dark:border-white/10">
            <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-slate-700 dark:text-white">{currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
            <span className="text-[10px] text-slate-500 dark:text-white/40">{currentTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
          </div>

          <button
            onClick={toggleTheme}
            className="h-9 w-9 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white flex items-center justify-center hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all shadow-sm dark:shadow-none cursor-pointer"
            title="Toggle Theme"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                <div className="relative">
                  {userProfile?.avatar_url ? (
                    <Avatar className="h-9 w-9 rounded-xl ring-2 ring-emerald-500/20">
                      <AvatarImage src={userProfile.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-xs">
                        {userProfile?.full_name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-emerald-500/20">
                      {userProfile?.full_name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-slate-50 dark:border-slate-900" />
                </div>
                <span className="hidden md:block text-sm font-bold text-slate-800 dark:text-white">{userProfile?.full_name || "User"}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-2xl p-2 border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl text-slate-900 dark:text-white" align="end" sideOffset={8}>
              <DropdownMenuLabel className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl mb-2">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{userProfile?.full_name || "User"}</p>
                <p className="text-xs text-slate-500 dark:text-white/50 truncate">{userProfile?.email || ""}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10" />
              <DropdownMenuItem className="rounded-xl p-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/80" onClick={() => router.push("/profile")}>
                <UserIcon className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" /> <span className="text-sm font-semibold">My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl p-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white/80" onClick={() => router.push("/settings")}>
                <Settings className="h-4 w-4 mr-2 text-slate-500 dark:text-white/50" /> <span className="text-sm font-semibold">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10" />
              <DropdownMenuItem className="rounded-xl p-2.5 cursor-pointer hover:bg-rose-500/10 text-rose-600 dark:text-rose-400" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" /> <span className="text-sm font-semibold">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-36">
        {/* Hero + Search row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-6 sm:pt-8 pb-8 sm:pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              {getGreeting()},{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-200">
                {userProfile?.full_name?.split(" ")[0] || "User"}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-white/50 mt-2 max-w-lg">
              Your role: <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[10px] tracking-widest">{userRole}</span>
              {roleHref[userRole] && (
                <Link href={roleHref[userRole]} className="inline-flex items-center gap-1 ml-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-600 dark:text-white/30 dark:hover:text-emerald-400 transition-colors">
                  Go to Dashboard <ChevronRight className="h-3 w-3" />
                </Link>
              )}
            </p>
          </div>

          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search modules..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 shadow-sm dark:shadow-none"
            />
          </div>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8 sm:mb-12">
          {quickLinks.map((link, i) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className="group flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.06] hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all duration-300 shadow-sm dark:shadow-none animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                style={{ animationDelay: `${200 + i * 60}ms` }}
              >
                <div className={cn("p-2.5 rounded-xl shrink-0", link.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-white/80 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Launchpad Modules */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <div key={i} className="animate-pulse h-32 rounded-2xl bg-white/5" />)}
            </div>
          }>
            <Launchpad userRole={userRole} searchQuery={searchQuery} />
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-6">
          <div className="bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl px-4 sm:px-6 py-4 shadow-sm dark:shadow-none">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <Image src="/logo-rounded-v2.png" alt="Edu Maysan" width={80} height={24} className="object-contain h-4 w-auto opacity-40 dark:opacity-40" />
                <div className="h-3 w-px bg-slate-200 dark:bg-white/10" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-white/25">Edu Maysan</span>
              </div>
              <div className="flex items-center gap-3 text-[9px] font-bold text-slate-500 dark:text-white/20 tracking-[0.15em]">
                <Heart className="h-3 w-3 text-emerald-600 dark:text-emerald-400/50" />
                <span>Built with care</span>
                <span className="text-slate-300 dark:text-white/10">|</span>
                <span>&copy; {currentTime.getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
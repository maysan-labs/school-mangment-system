"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { cn } from "@/lib/utils";

import { User } from "@supabase/supabase-js";
import { 
  Grid3X3, Sun, Moon, Settings, LogOut, 
  Search, Home, Bell, MoonIcon, Menu, UserCircle
} from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useTheme } from "@/lib/providers/ThemeProvider";
import { LiveCollectionPill } from "@/components/finance/LiveCollectionPill";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavbarProps {
  user: User | null;
  userRole?: string | null;
}

export function Navbar({ user, userRole }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const role = userRole || "student";
  const { theme, toggleTheme } = useTheme();
  const { isCollapsed, width, toggleMobile } = useSidebarStore();
  
  const handleSignOut = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const labelMapping: Record<string, string> = {
    "hr": "HR",
    "students": "Students",
    "list": "Student List",
    "directory": "Staff Directory",
    "enroll": "Enrollment",
    "attendance": "Attendance",
    "conduct": "Behavior",
    "finance": "Finance",
    "portal": "Portal",
    "academics": "Academics",
    "services": "Services"
  };

  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = labelMapping[segment.toLowerCase()] || 
                  (segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "));
    return { label, href: index < pathSegments.length - 1 ? href : undefined };
  });

  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setMounted(true);
      setIsDesktop(window.innerWidth >= 768);
    });
    const mql = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => {
      cancelAnimationFrame(handle);
      mql.removeEventListener("change", handler);
    };
  }, []);

  useEffect(() => {
    const closeDropdown = (e: MouseEvent) => {
      if (showDropdown) setShowDropdown(false);
    };
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, [showDropdown]);

  const sidebarLeft = !mounted ? 0 : (!isDesktop ? 0 : (isCollapsed ? 80 : width));

  return (
    <header 
      className={cn(
        "h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl flex items-center justify-between px-3 sm:px-4 fixed top-0 right-0 z-40 shadow-sm",
        "transition-all duration-300"
      )}
      style={{ left: sidebarLeft }}
    >
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-all md:hidden cursor-pointer"
          onClick={toggleMobile}
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="flex items-center gap-2 md:hidden">
          <div className="h-8 w-auto rounded-lg overflow-hidden">
            <Image 
              src="/logo-rounded-v2.png" 
              alt="Edu Maysan" 
              width={110}
              height={32}
              className="object-contain h-full w-auto"
            />
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1.5 text-sm">
          <Link href="/" className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="text-slate-300 dark:text-slate-700">/</span>
              {crumb.href ? (
                <Link href={crumb.href} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-bold px-1.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-800 dark:text-slate-200 font-bold px-1.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden xl:flex items-center">
          <LiveCollectionPill />
        </div>

        <div className="h-5 w-px bg-slate-200 hidden md:block" />

        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push("/portal")}
            className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          
          <button
            onClick={toggleTheme}
            className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
          >
            {theme === "light" ? <MoonIcon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <div className="hidden sm:block">
            <NotificationBell />
          </div>
        </div>

        <div className="h-5 w-px bg-slate-200 hidden md:block" />

        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <div className="relative">
              <Avatar className="h-8 w-8 rounded-xl">
                <AvatarImage src={user?.user_metadata?.avatar_url || ""} alt={user?.email || "User"} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-bold">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950" />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"}
              </p>
              <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 inline-block mt-0.5">{role}</span>
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl shadow-slate-200/20 dark:shadow-none p-2 z-50" onClick={(e) => e.stopPropagation()}>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl mb-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 rounded-xl">
                    <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {user?.user_metadata?.full_name || "User"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="h-px bg-slate-100 dark:bg-slate-800" />
              
              <button className="w-full flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors" onClick={() => { router.push("/profile"); setShowDropdown(false); }}>
                <div className="p-1.5 rounded-xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  <UserCircle className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">My Profile</span>
              </button>
              
              <button className="w-full flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors" onClick={() => { router.push("/settings"); setShowDropdown(false); }}>
                <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <Settings className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Settings</span>
              </button>
              
              <div className="h-px bg-slate-100 dark:bg-slate-800" />
              
              <button className="w-full flex items-center gap-2 p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors text-rose-600 dark:text-rose-400" onClick={handleSignOut}>
                <div className="p-1.5 rounded-xl bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
                  <LogOut className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-bold">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
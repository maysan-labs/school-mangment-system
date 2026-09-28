"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { Sidebar } from "@/components/shared/Sidebar";
import { cn } from "@/lib/utils";

interface MobileSidebarProps {
  initialProfile: any;
  userRole: string | null;
}

export function MobileSidebar({ initialProfile, userRole }: MobileSidebarProps) {
  const pathname = usePathname();
  const { isMobileOpen, closeMobile } = useSidebarStore();

  // Close mobile sidebar on route change
  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  // Prevent background scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  if (!isMobileOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in cursor-pointer"
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div 
        className={cn(
          "relative z-10 w-72 max-w-[85vw] h-full shadow-2xl transition-transform duration-300 ease-out",
          "animate-in slide-in-from-left duration-300"
        )}
      >
        <Sidebar 
          initialProfile={initialProfile} 
          userRole={userRole} 
          isMobile={true}
          onClose={closeMobile}
        />
      </div>
    </div>
  );
}

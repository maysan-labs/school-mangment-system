"use client";

import { useSidebarStore } from "@/lib/store/sidebar-store";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const { isCollapsed, width } = useSidebarStore();
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

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
    if (!isDesktop) return;

    const handleMouseDown = (e: MouseEvent) => {
      // Check if clicking near the sidebar edge
      if (e.clientX >= width - 10 && e.clientX <= width + 10) {
        setIsResizing(true);
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [width, isDesktop]);

  const paddingLeft = !mounted ? 0 : (!isDesktop ? 0 : (isCollapsed ? 80 : width));

  return (
    <div 
      className={cn(
        "flex-1 flex flex-col min-h-screen w-full bg-slate-50 dark:bg-background overflow-x-hidden",
        isResizing ? "transition-none" : "transition-all duration-300"
      )}
      style={{ 
        paddingLeft 
      }}
    >
      {children}
    </div>
  );
}

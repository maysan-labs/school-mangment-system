import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth-context";
import { Sidebar } from "@/components/shared/Sidebar";
import { MobileSidebar } from "@/components/shared/MobileSidebar";
import { Navbar } from "@/components/shared/Navbar";
import { QuickActionsFab } from "@/components/shared/QuickActionsFab";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { GlobalErrorHandler } from "@/components/error/GlobalErrorHandler";
import { DashboardWrapper } from "@/components/layout/DashboardWrapper";

function LoadingFallback() {
  return (
    <div className="flex-1 p-6 space-y-6 animate-pulse">
      <Skeleton className="h-8 w-48 bg-slate-200" />
      <div className="space-y-4">
        <Skeleton className="h-32 w-full bg-slate-100 dark:bg-slate-800" />
        <Skeleton className="h-32 w-full bg-slate-100 dark:bg-slate-800" />
        <Skeleton className="h-32 w-full bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authContext = await getAuthContext();
  
  const { 
    realUser, 
    effectiveUser, 
    effectiveRole, 
    isImpersonating 
  } = authContext;

  if (!realUser) {
    return redirect("/login");
  }

  return (
    <GlobalErrorHandler>
      <div className="h-full flex overflow-hidden">
        {/* Persistent Sidebar - Fixed but with dynamic width handled by component */}
        <aside className="hidden md:block fixed inset-y-0 left-0 z-50">
          <Sidebar 
            initialProfile={effectiveUser} 
            userRole={effectiveRole}
          />
        </aside>

        {/* Mobile Navigation Drawer */}
        <MobileSidebar 
          initialProfile={effectiveUser} 
          userRole={effectiveRole}
        />
        
        {/* Main Content Area with Dynamic Padding Wrapper */}
        <DashboardWrapper>
          {/* Persistent Navbar - Fixed */}
          <Navbar user={realUser} userRole={effectiveRole} />
          
          {/* Page Content with Suspense for streaming */}
          <Suspense fallback={<LoadingFallback />}>
            <main className="flex-1 p-4 md:p-6 mt-16 overflow-y-auto">
              {children}
            </main>
          </Suspense>
          <QuickActionsFab />
        </DashboardWrapper>
      </div>
    </GlobalErrorHandler>
  );
}
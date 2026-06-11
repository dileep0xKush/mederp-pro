"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShieldAlert, LogOut, ShieldCheck, Home } from "lucide-react";
import useStore from "@/store";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, activeRole, setCurrentUser } = useStore();
  
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true once component mounts to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (isClient && !currentUser) {
      router.push("/auth/login");
    }
  }, [currentUser, router, isClient]);

  if (!isClient || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Loading session...</p>
        </div>
      </div>
    );
  }

  // RBAC Permission Grid Validation
  const hasPermission = () => {
    if (!pathname) return true;
    
    // Admins and Super Admins have access to everything
    if (activeRole === "Super Admin" || activeRole === "Admin") return true;

    // Check specific path accesses
    if (pathname.startsWith("/dashboard/products")) {
      return ["Purchase Manager", "Sales Manager", "Store Manager"].includes(activeRole);
    }
    if (pathname.startsWith("/dashboard/batches")) {
      return ["Purchase Manager", "Store Manager"].includes(activeRole);
    }
    if (pathname.startsWith("/dashboard/inventory")) {
      return ["Purchase Manager", "Store Manager"].includes(activeRole);
    }
    if (pathname.startsWith("/dashboard/purchases")) {
      return ["Purchase Manager", "Accountant"].includes(activeRole);
    }
    if (pathname.startsWith("/dashboard/sales")) {
      return ["Sales Manager", "Accountant"].includes(activeRole);
    }
    if (pathname.startsWith("/dashboard/doctor-crm")) {
      return ["Sales Manager", "Medical Representative"].includes(activeRole);
    }
    if (pathname.startsWith("/dashboard/mr-management")) {
      return ["Sales Manager", "Medical Representative"].includes(activeRole);
    }
    if (pathname.startsWith("/dashboard/gifts")) {
      return ["Sales Manager", "Medical Representative"].includes(activeRole);
    }
    if (pathname.startsWith("/dashboard/accounting")) {
      return ["Accountant"].includes(activeRole);
    }
    if (pathname.startsWith("/dashboard/reports")) {
      return ["Purchase Manager", "Sales Manager", "Accountant"].includes(activeRole);
    }
    if (pathname.startsWith("/dashboard/settings")) {
      // MR and Accountants can access limited settings (e.g. profile, session info)
      return ["Medical Representative", "Accountant"].includes(activeRole);
    }

    return true;
  };

  const isAuthorized = hasPermission();

  const handleLogout = () => {
    setCurrentUser(null);
    router.push("/auth/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {isAuthorized ? (
            children
          ) : (
            // Access Denied / Role Gate Block
            <div className="h-[75vh] flex items-center justify-center p-6">
              <div className="w-full max-w-md bg-white border border-zinc-200 rounded-xl p-8 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50 backdrop-blur-sm animate-in fade-in-50 zoom-in-95 duration-200">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 mb-6">
                  <ShieldAlert className="h-8 w-8 stroke-[1.8]" />
                </div>
                
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
                  Access Denied
                </h2>
                
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
                  Your current active role (<strong className="text-zinc-800 dark:text-zinc-200">{activeRole}</strong>) does not have authorization to view this page. Please contact your system administrator or switch role simulation in the header.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" className="flex items-center gap-1.5" onClick={() => router.push("/dashboard")}>
                    <Home className="h-4 w-4" />
                    Back to Dashboard
                  </Button>
                  <Button variant="destructive" className="flex items-center gap-1.5" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>

                <div className="mt-8 border-t border-zinc-100 dark:border-zinc-800 pt-6">
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center justify-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    MedERP Role-Based Access Control Active
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-xs"
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Menu, ChevronDown, User, Shield, LogOut, Search, Activity } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import useStore from "@/store";
import { UserRole } from "@/types";
import { ThemeToggle } from "../theme-toggle";
import { NotificationCenter } from "./notification-center";
import { CommandPalette } from "./command-palette";
import { Button } from "../ui/button";

interface HeaderProps {
  mobileOpen: boolean;
  setMobileOpen: (o: boolean) => void;
}

export function Header({ mobileOpen, setMobileOpen }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, activeRole, setActiveRole, setCurrentUser } = useStore();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    setRoleDropdownOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    router.push("/auth/login");
  };

  // Generate breadcrumbs based on pathname
  const getBreadcrumbs = () => {
    if (!pathname) return [{ name: "Dashboard", href: "/dashboard" }];
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((seg, idx) => {
      const href = "/" + segments.slice(0, idx + 1).join("/");
      const name = seg
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return { name, href };
    });
  };

  const breadcrumbs = getBreadcrumbs();
  const availableRoles: UserRole[] = [
    "Super Admin",
    "Admin",
    "Purchase Manager",
    "Sales Manager",
    "Store Manager",
    "Medical Representative",
    "Accountant",
  ];

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-zinc-200 bg-white/80 dark:border-zinc-900 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 selection:bg-emerald-500">
      {/* Mobile Drawer Trigger & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
        >
          <Menu className="h-5 w-5 text-zinc-500" />
        </button>

        <nav className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <Link href="/dashboard" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
            MedERP Pro
          </Link>
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <span key={crumb.href} className="flex items-center gap-1.5">
                <span>/</span>
                <Link
                  href={crumb.href}
                  className={
                    isLast
                      ? "text-zinc-900 dark:text-white font-bold"
                      : "hover:text-zinc-900 dark:hover:text-white transition-colors"
                  }
                >
                  {crumb.name}
                </Link>
              </span>
            );
          })}
        </nav>
      </div>

      {/* Center Search / Command Palette */}
      <div className="flex-1 md:flex-initial max-w-[200px] md:max-w-md mx-2 md:mx-4 flex justify-center">
        <CommandPalette />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        {/* Dynamic Role Swapper (RBAC Simulator) */}
        <div className="relative">
          <button
            onClick={() => {
              setRoleDropdownOpen(!roleDropdownOpen);
              setUserDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg hover:bg-emerald-100/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60 dark:hover:bg-emerald-950/80 transition-colors cursor-pointer"
            title={`Active Role: ${activeRole}`}
          >
            <Shield className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="hidden sm:inline"><span className="hidden md:inline">Role:</span> {activeRole}</span>
            <ChevronDown className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>

          {roleDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setRoleDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 p-2 z-40 animate-in fade-in-50 slide-in-from-top-1">
                <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-2.5 py-1 mb-1">
                  Simulate RBAC Role
                </div>
                <div className="space-y-0.5">
                  {availableRoles.map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold rounded-lg text-left transition-colors cursor-pointer ${
                        activeRole === role
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <span>{role}</span>
                      {activeRole === role && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notification center */}
        <NotificationCenter />

        {/* User Account Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setUserDropdownOpen(!userDropdownOpen);
              setRoleDropdownOpen(false);
            }}
            className="flex items-center gap-2 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
          >
            <div className="h-8 w-8 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white dark:text-zinc-950 font-bold flex items-center justify-center text-xs shadow-sm">
              {currentUser?.name.split(" ").map((n) => n[0]).join("") || "VM"}
            </div>
            <span className="hidden lg:flex items-center gap-1 text-xs font-semibold">
              <span className="max-w-[100px] truncate">{currentUser?.name || "Dr. Vikram Mehra"}</span>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
            </span>
          </button>

          {userDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setUserDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 p-2 z-40 animate-in fade-in-50 slide-in-from-top-1">
                {/* User Info */}
                <div className="px-2.5 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                  <p className="text-xs font-bold text-zinc-950 dark:text-white truncate">
                    {currentUser?.name || "Dr. Vikram Mehra"}
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                    {currentUser?.email || "vikram@mederppro.com"}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-lg text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <User className="h-4 w-4 text-zinc-400" />
                    My Profile & Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

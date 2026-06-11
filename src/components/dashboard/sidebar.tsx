"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  LayoutDashboard,
  Package,
  Layers,
  ClipboardList,
  ShoppingCart,
  BadgePercent,
  Stethoscope,
  Users2,
  Gift,
  BookOpen,
  FileBarChart,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import useStore from "@/store";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (o: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeRole, setCurrentUser } = useStore();

  const handleLogout = () => {
    setCurrentUser(null);
    router.push("/auth/login");
  };

  // Define sidebar menu configurations
  const menuItems = [
    {
      title: "Core Overview",
      items: [
        { name: "Executive Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["Super Admin", "Admin", "Purchase Manager", "Sales Manager", "Store Manager", "Medical Representative", "Accountant"] },
      ]
    },
    {
      title: "Catalog & Stock",
      items: [
        { name: "Product Catalog", path: "/dashboard/products", icon: Package, roles: ["Super Admin", "Admin", "Purchase Manager", "Sales Manager", "Store Manager"] },
        { name: "Batch Tracking", path: "/dashboard/batches", icon: Layers, roles: ["Super Admin", "Admin", "Purchase Manager", "Store Manager"] },
        { name: "Inventory Logistics", path: "/dashboard/inventory", icon: ClipboardList, roles: ["Super Admin", "Admin", "Purchase Manager", "Store Manager"] },
      ]
    },
    {
      title: "Commercials",
      items: [
        { name: "Purchase Orders", path: "/dashboard/purchases", icon: ShoppingCart, roles: ["Super Admin", "Admin", "Purchase Manager", "Accountant"] },
        { name: "Sales & Invoicing", path: "/dashboard/sales", icon: BadgePercent, roles: ["Super Admin", "Admin", "Sales Manager", "Accountant"] },
      ]
    },
    {
      title: "Field Force",
      items: [
        { name: "Doctor CRM", path: "/dashboard/doctor-crm", icon: Stethoscope, roles: ["Super Admin", "Admin", "Sales Manager", "Medical Representative"] },
        { name: "MR Activity logs", path: "/dashboard/mr-management", icon: Users2, roles: ["Super Admin", "Admin", "Sales Manager", "Medical Representative"] },
        { name: "Gift Management", path: "/dashboard/gifts", icon: Gift, roles: ["Super Admin", "Admin", "Sales Manager", "Medical Representative"] },
      ]
    },
    {
      title: "Finance & Reports",
      items: [
        { name: "Ledger Accounts", path: "/dashboard/accounting", icon: BookOpen, roles: ["Super Admin", "Admin", "Accountant"] },
        { name: "Reports Hub", path: "/dashboard/reports", icon: FileBarChart, roles: ["Super Admin", "Admin", "Purchase Manager", "Sales Manager", "Accountant"] },
      ]
    },
    {
      title: "Security & Setup",
      items: [
        { name: "System Settings", path: "/dashboard/settings", icon: Settings, roles: ["Super Admin", "Admin", "Medical Representative", "Accountant"] },
      ]
    }
  ];

  return (
    <aside
      className={cn(
        "fixed md:sticky top-0 bottom-0 left-0 z-40 bg-zinc-950 text-zinc-400 border-r border-zinc-900 flex flex-col justify-between transition-all duration-300 ease-in-out select-none",
        collapsed ? "w-20" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Sidebar Header Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-900 h-16">
        <Link href="/dashboard" className="flex items-center gap-2.5 text-white font-bold text-lg tracking-tight">
          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
            <Activity className="h-4.5 w-4.5 text-emerald-950 stroke-[2.5]" />
          </div>
          {!collapsed && (
            <span className="animate-in fade-in-50 duration-200">
              MedERP <span className="text-emerald-400">Pro</span>
            </span>
          )}
        </Link>
        
        {/* Toggle button on desktop */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex h-6 w-6 rounded-md bg-zinc-900 border border-zinc-800 items-center justify-center hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Nav Menu Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {menuItems.map((group) => {
          // Filter group items based on role
          const visibleItems = group.items.filter((item) =>
            item.roles.includes(activeRole)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="space-y-1.5">
              {!collapsed && (
                <div className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-500 uppercase tracking-wider px-3 py-1">
                  {group.title}
                </div>
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.path || pathname?.startsWith(item.path + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={() => setMobileOpen?.(false)}
                      title={collapsed ? item.name : undefined}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all group",
                        isActive
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20"
                          : "hover:bg-zinc-900 hover:text-white"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-105", isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300")} />
                      {!collapsed && <span className="truncate">{item.name}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-zinc-900 space-y-2">
        {/* Role Badge Indicator */}
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/60 rounded-lg border border-zinc-800/40 text-[10px] text-zinc-400">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-400 flex-shrink-0" />
            <div className="truncate">
              <p className="font-semibold text-zinc-300 leading-none mb-0.5">Role Mode</p>
              <p className="text-zinc-500 leading-none truncate">{activeRole}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-all cursor-pointer"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

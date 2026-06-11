"use client";

import { useEffect, useState } from "react";
import { Search, Sparkles, FileText, ArrowRight, Laptop, Moon, Sun, UserCheck, Stethoscope, Package2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import useStore from "@/store";

interface SearchResult {
  id: string;
  category: "Pages" | "Products" | "Doctors" | "Actions";
  title: string;
  subtitle: string;
  route: string;
  icon: React.ReactNode;
}

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { products, doctors, setActiveRole } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const pages = [
    { title: "Dashboard Overview", subtitle: "Jump to main charts and stock widgets", route: "/dashboard", icon: <Laptop className="h-4 w-4" /> },
    { title: "Product Catalog", subtitle: "View and edit pharmaceutical products", route: "/dashboard/products", icon: <Package2 className="h-4 w-4" /> },
    { title: "Batch Expiry Tracker", subtitle: "Track expiry dates and batch numbers", route: "/dashboard/batches", icon: <ShieldAlert className="h-4 w-4" /> },
    { title: "Inventory stock logs", subtitle: "Adjustments, stock in and stock transfers", route: "/dashboard/inventory", icon: <FileText className="h-4 w-4" /> },
    { title: "Doctor CRM Database", subtitle: "Manage doctor Master lists and visit logs", route: "/dashboard/doctor-crm", icon: <Stethoscope className="h-4 w-4" /> },
  ];

  const searchResults: SearchResult[] = [];

  // Filter Pages
  pages.forEach((p) => {
    if (p.title.toLowerCase().includes(query.toLowerCase()) || p.subtitle.toLowerCase().includes(query.toLowerCase())) {
      searchResults.push({
        id: p.route,
        category: "Pages",
        title: p.title,
        subtitle: p.subtitle,
        route: p.route,
        icon: p.icon,
      });
    }
  });

  // Filter Products
  products.forEach((p) => {
    if (p.brandName.toLowerCase().includes(query.toLowerCase()) || p.genericName.toLowerCase().includes(query.toLowerCase())) {
      searchResults.push({
        id: `prod-${p.id}`,
        category: "Products",
        title: p.brandName,
        subtitle: `${p.genericName} • ${p.strength} • Stock: ${p.stockLevel}`,
        route: `/dashboard/products?id=${p.id}`,
        icon: <Package2 className="h-4 w-4 text-emerald-500" />,
      });
    }
  });

  // Filter Doctors
  doctors.forEach((d) => {
    if (d.name.toLowerCase().includes(query.toLowerCase()) || d.specialty.toLowerCase().includes(query.toLowerCase())) {
      searchResults.push({
        id: `doc-${d.id}`,
        category: "Doctors",
        title: d.name,
        subtitle: `${d.specialty} • ${d.hospital}`,
        route: `/dashboard/doctor-crm?id=${d.id}`,
        icon: <Stethoscope className="h-4 w-4 text-sky-500" />,
      });
    }
  });

  // Filter Quick Actions
  const actions = [
    { title: "Switch to Store Manager Role", action: () => setActiveRole("Store Manager") },
    { title: "Switch to Accountant Role", action: () => setActiveRole("Accountant") },
    { title: "Switch to MR Role", action: () => setActiveRole("Medical Representative") },
  ];
  actions.forEach((a, i) => {
    if (a.title.toLowerCase().includes(query.toLowerCase())) {
      searchResults.push({
        id: `act-${i}`,
        category: "Actions",
        title: a.title,
        subtitle: "Instantly update RBAC dashboard access",
        route: "#action",
        icon: <UserCheck className="h-4 w-4 text-amber-500" />,
      });
    }
  });

  const handleSelect = (item: SearchResult) => {
    setIsOpen(false);
    setQuery("");
    if (item.route === "#action") {
      const idx = parseInt(item.id.split("-")[1]);
      actions[idx].action();
      alert("Role swapped via Command Palette!");
    } else {
      router.push(item.route);
    }
  };

  return (
    <>
      {/* Search trigger bar */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center md:justify-between h-9 w-9 md:w-64 md:px-3 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 dark:hover:border-zinc-700 text-zinc-400 dark:text-zinc-500 transition-all text-sm cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 flex-shrink-0" />
          <span className="hidden md:inline text-xs">Quick search...</span>
        </div>
        <kbd className="hidden md:inline-flex h-5 select-none items-center gap-0.5 rounded border border-zinc-200 bg-white px-1.5 font-mono text-[10px] font-medium text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950">
          <span>Ctrl</span>K
        </kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Overlay background */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Palette container */}
          <div className="relative w-full max-w-xl rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden flex flex-col z-10 animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Header search bar */}
            <div className="flex items-center border-b border-zinc-100 dark:border-zinc-800 px-4 py-3">
              <Search className="h-5 w-5 text-zinc-400 mr-3" />
              <input
                type="text"
                placeholder="Search products, doctors, pages, or actions..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-0 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400 text-sm focus:ring-0"
                autoFocus
              />
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs border border-zinc-200 dark:border-zinc-800 rounded px-1.5 py-0.5 text-zinc-400 dark:bg-zinc-950"
              >
                ESC
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[360px] overflow-y-auto p-2">
              {searchResults.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 dark:text-zinc-400">
                  <Sparkles className="h-6 w-6 mx-auto mb-2 text-zinc-300 stroke-[1.5]" />
                  <p className="text-xs font-medium">No results found for &quot;{query}&quot;</p>
                  <p className="text-[11px] text-zinc-400 mt-1">Try searching another query or term.</p>
                </div>
              ) : (
                // Group by category
                ["Pages", "Products", "Doctors", "Actions"].map((cat) => {
                  const filtered = searchResults.filter((r) => r.category === cat);
                  if (filtered.length === 0) return null;
                  return (
                    <div key={cat} className="space-y-1 mb-3 last:mb-1">
                      <div className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-3 py-1">
                        {cat}
                      </div>
                      {filtered.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-white dark:group-hover:bg-zinc-900 transition-colors">
                              {item.icon}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {item.title}
                              </p>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                {item.subtitle}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer hints */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-2 bg-zinc-50/50 dark:bg-zinc-900/50 text-[10px] text-zinc-400 flex items-center justify-between select-none">
              <span className="flex items-center gap-1.5">
                <span>↑↓ Navigate</span>
                <span>•</span>
                <span>Enter to Select</span>
              </span>
              <span>MedERP Pro Command Palette</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

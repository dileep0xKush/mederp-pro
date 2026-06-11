import { ThemeToggle } from "@/components/theme-toggle";
import { Activity } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-zinc-950 transition-colors duration-200">
      {/* Brand Section - Left Side */}
      <div className="hidden md:flex md:w-[45%] lg:w-[40%] bg-emerald-950 text-white relative overflow-hidden flex-col justify-between p-10 select-none">
        {/* Decorative background grid and gradients */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(16,185,129,0.15),transparent)] z-0" />
        <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute right-0 bottom-0 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl" />
        
        {/* Content */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
            <div className="h-9 w-9 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Activity className="h-5 w-5 text-emerald-950 stroke-[2.5]" />
            </div>
            <span>MedERP <span className="text-emerald-400">Pro</span></span>
          </Link>
        </div>

        <div className="relative z-10 my-auto py-10">
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight mb-4 text-emerald-50">
            Enterprise Grade Healthcare Management
          </h1>
          <p className="text-emerald-200/80 text-sm lg:text-base leading-relaxed mb-8 max-w-md">
            Streamline your inventory, supplier operations, MR reporting, and medical billing with the next-generation ERP designed specifically for pharmaceutical leaders.
          </p>

          {/* Testimonial/Key metric card */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-2xl shadow-black/10">
            <p className="text-emerald-100/90 text-sm italic mb-4">
              "MedERP Pro has completely changed how our distribution operates. MR call approvals and batch expiry management are now fully automated."
            </p>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-400/20 flex items-center justify-center text-xs font-bold text-emerald-300">
                SD
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-50">Sandeep Deshmukh</p>
                <p className="text-[10px] text-emerald-300/80">Operations Director, Lifecare Pharma</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-emerald-300/60">
          <span>&copy; 2026 MedERP Pro Services</span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            SaaS Version 4.12
          </span>
        </div>
      </div>

      {/* Main Content Area - Right Side */}
      <div className="flex-1 flex flex-col justify-between min-h-screen">
        <header className="p-6 flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 md:border-none">
          {/* Logo on mobile */}
          <Link href="/" className="flex md:hidden items-center gap-2 text-zinc-950 dark:text-white font-bold text-lg">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center">
              <Activity className="h-4 w-4 text-white dark:text-zinc-950 stroke-[2.5]" />
            </div>
            <span>MedERP</span>
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-16">
          <div className="w-full max-w-[420px] transition-all duration-200">
            {children}
          </div>
        </main>

        <footer className="p-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
          <div className="flex justify-center gap-4 mb-2">
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <span>&bull;</span>
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <span>&bull;</span>
            <Link href="/support" className="hover:underline">Contact Support</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

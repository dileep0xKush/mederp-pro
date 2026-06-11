"use client";

import Link from "next/link";
import { Activity, ShieldCheck, TrendingUp, Users, HeartPulse, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const roles = [
    { title: "Pharma Marketing", desc: "Manage brands, doctor schemes, and sales budgets." },
    { title: "Medical Distributors & Stockists", desc: "Control batch tracking, stock levels, and supplier ledgers." },
    { title: "Medical Representatives", desc: "Log daily visit calls, request gift inventories, and track plans." },
    { title: "Accountants & Admins", desc: "Review GST receipts, manage company profiles, and verify ledgers." }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 selection:bg-emerald-500 transition-colors duration-200">
      {/* Top Header */}
      <header className="max-w-7xl w-full mx-auto px-6 h-16 flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Activity className="h-4.5 w-4.5 text-white dark:text-zinc-950 stroke-[2.5]" />
          </div>
          <span>MedERP <span className="text-emerald-600 dark:text-emerald-400">Pro</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="font-semibold text-xs">Sign In</Button>
          </Link>
          <Link href="/auth/register">
            <Button size="sm" className="font-semibold text-xs">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-6 py-12 md:py-20 text-center relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -left-20 top-20 w-72 h-72 rounded-full bg-emerald-500/10 dark:bg-emerald-400/5 blur-3xl" />
        <div className="absolute -right-20 bottom-10 w-72 h-72 rounded-full bg-teal-500/10 dark:bg-teal-400/5 blur-3xl" />

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60 text-[11px] font-bold">
            <Sparkles className="h-3 w-3" />
            Healthcare ERP Suite
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-slate-800 to-zinc-900 dark:from-white dark:via-zinc-200 dark:to-white">
            Modernize Your Pharmaceutical & Medical Distribution ERP
          </h1>
          
          <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            The next-generation cloud solution for Pharma Marketing Companies, Medical Distributors, Stockists, and Medical Representatives.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 w-full sm:w-auto max-w-sm mx-auto sm:max-w-none">
            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button size="lg" className="font-bold text-sm h-11 px-8 w-full sm:w-auto">
                Enter Dashboard Demo
              </Button>
            </Link>
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="font-bold text-sm h-11 px-8 w-full sm:w-auto">
                Request Pilot Access
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-16 md:mt-24 text-left relative z-10">
          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800/80 rounded-xl space-y-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm">Strict Expiry & Batch Track</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Instant quarantine of expired stocks and near-expiry batch reminders.</p>
          </div>

          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800/80 rounded-xl space-y-3">
            <div className="h-10 w-10 rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400 flex items-center justify-center">
              <HeartPulse className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm">Doctor CRM & Visits</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Map client segments, visits logs, drug samples, and gift distributions.</p>
          </div>

          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800/80 rounded-xl space-y-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm">MR Activity Tour Plans</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Automate daily reports, routes, outstation travel expenses, and targets.</p>
          </div>

          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800/80 rounded-xl space-y-3">
            <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm">Ledger & GST Billing</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Commercial purchases order, sales invoicing, outstanding debt, and GST ledger books.</p>
          </div>
        </div>

        {/* Roles Details */}
        <div className="w-full mt-16 md:mt-24 text-left border-t border-zinc-200 dark:border-zinc-800 pt-16">
          <h2 className="text-2xl font-bold tracking-tight mb-8 text-center sm:text-left">
            Built For Diverse Healthcare Stakeholders
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {roles.map((role) => (
              <div key={role.title} className="flex gap-4 items-start">
                <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{role.title}</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-normal">{role.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-zinc-400 dark:text-zinc-500 border-t border-zinc-200/50 dark:border-zinc-800/50 bg-white/20 dark:bg-zinc-900/10">
        <p>&copy; 2026 MedERP Pro SaaS Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}

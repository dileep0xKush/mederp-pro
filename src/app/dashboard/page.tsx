"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Package,
  Layers,
  ShoppingBag,
  Stethoscope,
  Users,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingDown,
  CheckCircle,
  FileSpreadsheet,
  XCircle,
  AlertCircle,
  Eye,
  Check,
  X,
  FileCheck
} from "lucide-react";
import Link from "next/link";
import useStore from "@/store";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function DashboardPage() {
  const {
    products,
    batches,
    salesInvoices,
    doctors,
    mrReports,
    approveMRReport,
    rejectMRReport,
    addNotification,
    logActivity
  } = useStore();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Compute stats
  const totalProducts = products.length;
  const totalInventory = batches.reduce((acc, curr) => acc + curr.availableQuantity, 0);
  
  const totalSales = salesInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalPurchases = 20850.0; // Mock base purchases + active POs
  
  const totalDoctors = doctors.length;
  const totalMRs = 3; // Rahul Kapoor, Sneha Sen, Vikram Rathore
  
  const pendingPayments = salesInvoices.reduce((acc, curr) => acc + curr.outstandingAmount, 0);
  const monthlyRevenue = totalSales - pendingPayments;

  // Alerts widgets
  const nearExpiryCount = batches.filter((b) => b.status === "Near Expiry").length;
  const expiredCount = batches.filter((b) => b.status === "Expired").length;
  const lowStockProducts = products.filter((p) => p.stockLevel < 150);

  // MR reports pending approval
  const pendingReports = mrReports.filter((r) => r.status === "Pending Approval");

  // Mock charts data
  const revenueTrendData = [
    { month: "Jan", Sales: 18000, Purchases: 12000, Revenue: 14000 },
    { month: "Feb", Sales: 22000, Purchases: 15000, Revenue: 18000 },
    { month: "Mar", Sales: 25000, Purchases: 14000, Revenue: 21000 },
    { month: "Apr", Sales: 31000, Purchases: 18000, Revenue: 26000 },
    { month: "May", Sales: 28000, Purchases: 16000, Revenue: 23000 },
    { month: "Jun", Sales: totalSales, Purchases: totalPurchases, Revenue: monthlyRevenue }
  ];

  const topProductsData = products
    .slice(0, 4)
    .map((p, idx) => ({
      name: p.brandName,
      sales: [850, 620, 500, 430][idx] || 300,
      stock: p.stockLevel
    }));

  const specialtyDistribution = [
    { name: "Cardiology", value: doctors.filter(d => d.specialty === "Cardiologist").length },
    { name: "Pediatrics", value: doctors.filter(d => d.specialty === "Pediatrician").length },
    { name: "General Med", value: doctors.filter(d => d.specialty === "General Physician").length },
    { name: "Diabetes", value: doctors.filter(d => d.specialty === "Diabetologist").length },
    { name: "Orthopedic", value: doctors.filter(d => d.specialty === "Orthopedic").length }
  ];

  const PIE_COLORS = ["#10b981", "#0ea5e9", "#f59e0b", "#6366f1", "#ec4899"];

  const handleApproveReport = (id: string, name: string) => {
    approveMRReport(id);
    addNotification("success", "MR Expense Approved", `Reimbursement for ${name} approved successfully.`);
    logActivity("MR Expense Approved", `Approved daily activity log expenses for ${name}`);
  };

  const handleRejectReport = (id: string, name: string) => {
    rejectMRReport(id);
    addNotification("warning", "MR Expense Rejected", `Expenses for ${name} were rejected.`);
    logActivity("MR Expense Rejected", `Rejected daily activity log expenses for ${name}`);
  };

  if (!isClient) return null;

  return (
    <div className="space-y-6 pb-10">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Real-time medical inventory, drug batch logs, and representative call diagnostics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 font-semibold text-xs flex items-center gap-1.5" onClick={() => alert("Exporting PDF Summary...")}>
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
            Export Overview
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <Card className="hover:scale-[1.01] transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Total Products</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-semibold flex items-center">
                <TrendingUp className="h-3 w-3 mr-0.5" /> +12%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        {/* Total Inventory */}
        <Card className="hover:scale-[1.01] transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Available stock</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInventory} <span className="text-xs text-zinc-500 font-normal">units</span></div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-semibold flex items-center">
                <TrendingUp className="h-3 w-3 mr-0.5" /> +4.2%
              </span>
              replenished this week
            </p>
          </CardContent>
        </Card>

        {/* Net Sales */}
        <Card className="hover:scale-[1.01] transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Total Sales</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-semibold flex items-center">
                <TrendingUp className="h-3 w-3 mr-0.5" /> +18.4%
              </span>
              net order invoice growth
            </p>
          </CardContent>
        </Card>

        {/* Pending Receivables */}
        <Card className="hover:scale-[1.01] transition-transform duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Outstanding Debt</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(pendingPayments)}</div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
              <span className="text-rose-500 font-semibold flex items-center">
                <Clock className="h-3 w-3 mr-0.5" /> Average 14 Days
              </span>
              collection cycle time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Warning Widget Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Near Expiry */}
        <div className="flex items-center gap-4 p-4 rounded-xl border border-amber-200 bg-amber-500/5 dark:border-amber-900/40 dark:bg-amber-950/10 backdrop-blur-sm">
          <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 animate-pulse-subtle">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-950 dark:text-zinc-100">Near Expiry Warning</h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              <strong className="text-zinc-950 dark:text-white">{nearExpiryCount} batches</strong> require urgent marketing clearance/schemes.
            </p>
          </div>
          <Link href="/dashboard/batches" className="ml-auto">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-950/30">
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Expired Products */}
        <div className="flex items-center gap-4 p-4 rounded-xl border border-rose-200 bg-rose-500/5 dark:border-rose-900/40 dark:bg-rose-950/10 backdrop-blur-sm">
          <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-950 dark:text-zinc-100">Expired Stock Alert</h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              <strong className="text-zinc-950 dark:text-white">{expiredCount} batches</strong> have expired. Must move to quarantine immediately.
            </p>
          </div>
          <Link href="/dashboard/batches" className="ml-auto">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-600 hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-950/30">
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Low Stock Alert */}
        <div className="flex items-center gap-4 p-4 rounded-xl border border-red-200 bg-red-500/5 dark:border-red-900/40 dark:bg-red-950/10 backdrop-blur-sm">
          <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-950 dark:text-zinc-100">Low Stock Alert</h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              <strong className="text-zinc-950 dark:text-white">{lowStockProducts.length} items</strong> have fallen below safety inventory limits.
            </p>
          </div>
          <Link href="/dashboard/products" className="ml-auto">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-950/30">
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Purchases Trend AreaChart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Sales & Purchase Commercial Trends</CardTitle>
            <CardDescription className="text-xs">Compare monthly invoice sales vs purchase orders</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" className="dark:stroke-zinc-800" />
                <XAxis dataKey="month" fontSize={11} stroke="#888888" tickLine={false} />
                <YAxis fontSize={11} stroke="#888888" tickLine={false} />
                <RechartsTooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Area type="monotone" dataKey="Sales" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="Purchases" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorPurchases)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Doctor Specialties Master PieChart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold">Doctor CRM Demographics</CardTitle>
            <CardDescription className="text-xs">Active doctor master list broken by specialty</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-between">
            <div className="h-56 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={specialtyDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {specialtyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold">{totalDoctors}</span>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase">Total Doctors</span>
              </div>
            </div>
            
            {/* Pie chart legends */}
            <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-zinc-100 dark:border-zinc-800">
              {specialtyDistribution.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  <span className="truncate text-zinc-600 dark:text-zinc-400 font-semibold">{entry.name}:</span>
                  <span className="font-bold ml-auto">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Product Stock vs Sales BarChart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Top Product Outflows</CardTitle>
            <CardDescription className="text-xs">High demanding molecules against stock limits</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" className="dark:stroke-zinc-800" />
                <XAxis dataKey="name" fontSize={10} stroke="#888888" tickLine={false} />
                <YAxis fontSize={10} stroke="#888888" tickLine={false} />
                <RechartsTooltip />
                <Legend iconType="square" wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} name="Monthly Units Sold" />
                <Bar dataKey="stock" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="In-Stock Units" className="dark:fill-zinc-800" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* MR Daily Visit Call Expenses Approvals Widget */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-bold">MR Daily Calls & Expense Approvals</CardTitle>
              <CardDescription className="text-xs">Review daily activity logs and reimburse travel slips</CardDescription>
            </div>
            <Badge variant="warning" className="text-[10px] font-bold">
              {pendingReports.length} Pending
            </Badge>
          </CardHeader>
          <CardContent>
            {pendingReports.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 flex flex-col items-center justify-center">
                <FileCheck className="h-10 w-10 mb-2 text-zinc-300 dark:text-zinc-700 stroke-[1.5]" />
                <p className="text-xs font-semibold">No pending field expense reports</p>
                <p className="text-[10px] text-zinc-400 mt-1">All Medical Representative travel receipts are verified.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs py-2">Representative</TableHead>
                    <TableHead className="text-xs py-2">Route/Town</TableHead>
                    <TableHead className="text-xs py-2 text-center">Visits (Dr/Ch)</TableHead>
                    <TableHead className="text-xs py-2">Expenses</TableHead>
                    <TableHead className="text-xs py-2 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-semibold text-xs py-3">{report.mrName}</TableCell>
                      <TableCell className="text-xs py-3 text-zinc-500">
                        {report.tourPlanName.replace("TP-2026-", "Zone ")} Route
                      </TableCell>
                      <TableCell className="text-xs py-3 text-center">
                        {report.doctorsVisited.length} Drs / {report.chemistVisitsCount} Ch
                      </TableCell>
                      <TableCell className="text-xs py-3 font-semibold text-zinc-950 dark:text-zinc-200">
                        {formatCurrency(report.totalExpense)}
                      </TableCell>
                      <TableCell className="text-xs py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRejectReport(report.id, report.mrName)}
                            className="h-7 w-7 p-0 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                            title="Reject Report"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproveReport(report.id, report.mrName)}
                            className="h-7 w-7 p-0 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 text-white"
                            title="Approve Report"
                          >
                            <Check className="h-4 w-4 text-white dark:text-zinc-950 stroke-[2.5]" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import {
  TrendingUp,
  Package,
  Layers,
  ShoppingBag,
  Clock,
  ArrowUpRight,
  TrendingDown,
  CheckCircle,
  FileSpreadsheet,
  XCircle,
  AlertCircle,
  FileText,
  Printer,
  Download
} from "lucide-react";
import useStore from "@/store";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default function ReportsPage() {
  const {
    products,
    batches,
    salesInvoices,
    purchaseOrders,
    mrReports,
    ledger
  } = useStore();

  const [isClient, setIsClient] = useState(false);
  const [reportType, setReportType] = useState("Sales");

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Compute totals
  const totalSalesVal = useMemo(() => {
    return salesInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0);
  }, [salesInvoices]);

  const totalPurchasesVal = useMemo(() => {
    // base + POs
    return purchaseOrders.reduce((acc, curr) => acc + curr.totalAmount, 0) + 12000;
  }, [purchaseOrders]);

  const totalOutstandingVal = useMemo(() => {
    return salesInvoices.reduce((acc, curr) => acc + curr.outstandingAmount, 0);
  }, [salesInvoices]);

  const operatingExpenses = useMemo(() => {
    return mrReports.reduce((acc, curr) => acc + curr.totalExpense, 0);
  }, [mrReports]);

  // Expiry distribution for pie chart
  const expiryDistribution = useMemo(() => {
    return [
      { name: "Normal Stock", value: batches.filter(b => b.status === "Normal").length, color: "#10b981" },
      { name: "Near Expiry", value: batches.filter(b => b.status === "Near Expiry").length, color: "#f59e0b" },
      { name: "Expired", value: batches.filter(b => b.status === "Expired").length, color: "#ef4444" },
      { name: "Low Stock", value: batches.filter(b => b.status === "Low Stock").length, color: "#3b82f6" }
    ];
  }, [batches]);

  // Product valuation table
  const productValuations = useMemo(() => {
    return products.map((p) => {
      // Find all batches of this product
      const productBatches = batches.filter(b => b.productId === p.id);
      const totalQty = productBatches.reduce((acc, curr) => acc + curr.availableQuantity, 0);
      const valuation = totalQty * p.tradeRate;
      return {
        ...p,
        totalQty,
        valuation
      };
    }).sort((a, b) => b.valuation - a.valuation);
  }, [products, batches]);

  // Monthly Sales trend mock
  const salesTrendData = [
    { month: "Jan", Sales: 18000, Purchases: 12000, Expenses: 800 },
    { month: "Feb", Sales: 22000, Purchases: 15000, Expenses: 1200 },
    { month: "Mar", Sales: 25000, Purchases: 14000, Expenses: 950 },
    { month: "Apr", Sales: 31000, Purchases: 18000, Expenses: 1400 },
    { month: "May", Sales: 28000, Purchases: 16000, Expenses: 1100 },
    { month: "Jun", Sales: totalSalesVal, Purchases: totalPurchasesVal, Expenses: operatingExpenses }
  ];

  if (!isClient) return null;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Reports & Business Intelligence</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            View executive dashboards, examine inventory valuations, analyze monthly P&L trends, and print official statements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("Printing report...")}
            className="h-9 font-semibold text-xs border-zinc-200 dark:border-zinc-800"
          >
            <Printer className="h-4 w-4 mr-1.5 text-zinc-500" />
            Print Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("Downloading CSV...")}
            className="h-9 font-semibold text-xs border-zinc-200 dark:border-zinc-800"
          >
            <Download className="h-4 w-4 mr-1.5 text-zinc-500" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Gross Operating Revenue</CardTitle>
            <ArrowUpRight className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSalesVal)}</div>
            <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-semibold flex items-center">
                <TrendingUp className="h-3 w-3" /> +14.8%
              </span>
              MoM sales revenue growth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Gross Procurement spend</CardTitle>
            <TrendingDown className="h-5 w-5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPurchasesVal)}</div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Supplier bill receipts & raised PO values
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Outstanding Receivables</CardTitle>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{formatCurrency(totalOutstandingVal)}</div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Pending distributor collection aging
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Net Field Force Expense</CardTitle>
            <AlertCircle className="h-5 w-5 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(operatingExpenses)}</div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Travel, food, and promotional costs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales vs Procurement Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Monthly Profitability Trends</CardTitle>
            <CardDescription className="text-xs">Compare monthly invoice sales totals against procurement purchases & MR costs.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Area type="monotone" dataKey="Sales" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" name="Sales Revenue ($)" />
                <Area type="monotone" dataKey="Purchases" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorPurchases)" name="Purchases Spend ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Batch Expiry statuses PieChart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold">Inventory Expiry Status Breakdown</CardTitle>
            <CardDescription className="text-xs">Current batch stocks grouped by aging/expiry categories</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-between">
            <div className="h-56 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expiryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expiryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold">{batches.length}</span>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase">Total Batches</span>
              </div>
            </div>

            {/* Pie chart legends */}
            <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-zinc-100 dark:border-zinc-800">
              {expiryDistribution.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="truncate text-zinc-600 dark:text-zinc-400 font-semibold">{entry.name}:</span>
                  <span className="font-bold ml-auto">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Stock Valuations List */}
      <Card>
        <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Product Portfolio Asset Valuation</CardTitle>
            <CardDescription className="text-xs">Examine total safety stock level value calculated dynamically from active batch quantities.</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-semibold px-2">
            Net Portfolio Value: {formatCurrency(productValuations.reduce((acc, curr) => acc + curr.valuation, 0))}
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-bold">Product Brand</TableHead>
                  <TableHead className="text-xs font-bold">Generic Name</TableHead>
                  <TableHead className="text-xs font-bold">Dosage Form</TableHead>
                  <TableHead className="text-xs font-bold text-center">Safety Stock limit</TableHead>
                  <TableHead className="text-xs font-bold text-center">Available Qty (Packs)</TableHead>
                  <TableHead className="text-xs font-bold">Trade Rate</TableHead>
                  <TableHead className="text-xs font-bold">Asset Valuation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productValuations.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs font-bold text-zinc-950 dark:text-white">
                      {p.brandName} - {p.strength}
                    </TableCell>
                    <TableCell className="text-xs text-zinc-500 italic">
                      {p.genericName}
                    </TableCell>
                    <TableCell className="text-xs text-zinc-600 dark:text-zinc-400">
                      {p.dosageForm} ({p.packing})
                    </TableCell>
                    <TableCell className="text-xs text-center text-zinc-500">
                      150 packs
                    </TableCell>
                    <TableCell className="text-xs text-center font-bold text-zinc-800 dark:text-zinc-200">
                      {p.totalQty}
                    </TableCell>
                    <TableCell className="text-xs text-zinc-500">
                      {formatCurrency(p.tradeRate)}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(p.valuation)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

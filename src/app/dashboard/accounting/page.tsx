"use client";

import { useState, useMemo } from "react";
import {
  FileSpreadsheet,
  Plus,
  TrendingDown,
  TrendingUp,
  Search,
  Filter,
  DollarSign,
  Briefcase,
  Layers,
  FileCheck
} from "lucide-react";
import useStore from "@/store";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AccountingPage() {
  const {
    ledger,
    postLedgerEntry,
    addNotification,
    logActivity
  } = useStore();

  // Dialog State
  const [showPostModal, setShowPostModal] = useState(false);

  // New Journal Entry Form State
  const [accountName, setAccountName] = useState("");
  const [entryType, setEntryType] = useState<"Debit" | "Credit">("Debit");
  const [amount, setAmount] = useState(0);
  const [referenceType, setReferenceType] = useState<"Invoice" | "GRN" | "Payment" | "Receipt" | "Journal">("Journal");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [remarks, setRemarks] = useState("");

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [accountFilter, setAccountFilter] = useState("ALL");

  // Accounts Names List for filtering/dropdown
  const accountList = [
    "Cash & Bank A/c",
    "Sales Revenue A/c",
    "Accounts Receivable A/c",
    "Accounts Payable A/c",
    "MR Business Expenses A/c",
    "Inventory Control A/c",
    "Cost of Goods Sold (COGS) A/c"
  ];

  // Derived financial dashboard numbers
  const cashBalance = useMemo(() => {
    // Let's compute balance in Cash & Bank A/c
    return ledger
      .filter((e) => e.accountName === "Cash & Bank A/c")
      .reduce((acc, curr) => {
        if (curr.type === "Debit") return acc + curr.amount; // In bank A/c, debit increases balance
        return acc - curr.amount;
      }, 0);
  }, [ledger]);

  const accountsReceivable = useMemo(() => {
    // Outstanding collections
    return ledger
      .filter((e) => e.accountName === "Accounts Receivable A/c")
      .reduce((acc, curr) => {
        if (curr.type === "Debit") return acc + curr.amount; // Debit increases receivables
        return acc - curr.amount;
      }, 0);
  }, [ledger]);

  const mrExpensesPaid = useMemo(() => {
    return ledger
      .filter((e) => e.accountName === "MR Business Expenses A/c")
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [ledger]);

  const inventoryAssetVal = useMemo(() => {
    return ledger
      .filter((e) => e.accountName === "Inventory Control A/c")
      .reduce((acc, curr) => {
        if (curr.type === "Debit") return acc + curr.amount;
        return acc - curr.amount;
      }, 0);
  }, [ledger]);

  // Filtered entries list
  const filteredLedger = useMemo(() => {
    return ledger.filter((e) => {
      const matchesSearch =
        e.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.remarks || "").toLowerCase().includes(searchTerm.toLowerCase());

      if (accountFilter === "ALL") return matchesSearch;
      return matchesSearch && e.accountName === accountFilter;
    });
  }, [ledger, searchTerm, accountFilter]);

  // Handle Journal Submission
  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert("Amount must be greater than 0");
      return;
    }
    if (!accountName) {
      alert("Please select an account");
      return;
    }

    postLedgerEntry({
      accountName,
      type: entryType,
      amount,
      referenceType,
      referenceNumber: referenceNumber || `JV-${Date.now().toString().substring(7)}`,
      remarks
    });

    // Reset Form
    setAccountName("");
    setEntryType("Debit");
    setAmount(0);
    setReferenceType("Journal");
    setReferenceNumber("");
    setRemarks("");
    setShowPostModal(false);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">General Ledger Accounting</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Audit double-entry financial logs, post manual journal entries, and track account receivable/payable cash balances.
          </p>
        </div>
        <div>
          <Button
            onClick={() => setShowPostModal(true)}
            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 text-white h-9"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Post Journal Entry
          </Button>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Cash & Bank Balance</CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(cashBalance)}</div>
            <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-semibold flex items-center">
                <TrendingUp className="h-3 w-3" /> +4.2%
              </span>
              liquid assets liquidity status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Accounts Receivable</CardTitle>
            <Briefcase className="h-5 w-5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(accountsReceivable)}</div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Pending client payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Inventory Asset Value</CardTitle>
            <Layers className="h-5 w-5 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(inventoryAssetVal)}</div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Capital held in batch stocks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">MR Expenses Claimed</CardTitle>
            <FileCheck className="h-5 w-5 text-rose-550" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-650 dark:text-rose-450">{formatCurrency(mrExpensesPaid)}</div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Field representative operation costs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80">
        <div className="relative w-full sm:w-80 flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-zinc-400 pointer-events-none" />
          <Input
            placeholder="Search reference or remarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-400" />
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="flex h-9 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 cursor-pointer"
          >
            <option value="ALL">All General Ledgers</option>
            {accountList.map((acc) => (
              <option key={acc} value={acc}>
                {acc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Listing */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Double-Entry Audit Records</CardTitle>
          <CardDescription className="text-xs">Inspect general bookkeeping ledger balances, invoices, payment entries, and custom adjustment journals.</CardDescription>
        </CardHeader>
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-bold">Transaction Date</TableHead>
                      <TableHead className="text-xs font-bold">Ledger Account</TableHead>
                      <TableHead className="text-xs font-bold font-mono">Reference</TableHead>
                      <TableHead className="text-xs font-bold">Debit ($)</TableHead>
                      <TableHead className="text-xs font-bold">Credit ($)</TableHead>
                      <TableHead className="text-xs font-bold">Balance Value</TableHead>
                      <TableHead className="text-xs font-bold">Remarks / Narration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLedger.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-zinc-500">
                          <FileSpreadsheet className="h-10 w-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-700 stroke-[1.5]" />
                          <p className="text-xs font-semibold">No transactions posted to this ledger</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLedger.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-xs text-zinc-500 whitespace-nowrap">
                            {entry.date}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-zinc-950 dark:text-white">
                            {entry.accountName}
                          </TableCell>
                          <TableCell className="text-xs font-mono font-semibold text-zinc-500">
                            <Badge variant="outline" className="text-[9px] font-semibold py-0">
                              {entry.referenceType}: {entry.referenceNumber}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-bold text-emerald-600 dark:text-emerald-450">
                            {entry.type === "Debit" ? formatCurrency(entry.amount) : "-"}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-rose-600 dark:text-rose-455">
                            {entry.type === "Credit" ? formatCurrency(entry.amount) : "-"}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                            {formatCurrency(entry.balance)}
                          </TableCell>
                          <TableCell className="text-xs text-zinc-500 italic max-w-xs truncate">
                            {entry.remarks || "No narration"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
      </Card>

      {/* Modal: Post Voucher Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Post Journal Entry</h2>
              <button
                onClick={() => setShowPostModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
            <form onSubmit={handlePostSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Select Ledger Account</label>
                <select
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  <option value="">-- Choose Account --</option>
                  {accountList.map((acc) => (
                    <option key={acc} value={acc}>
                      {acc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Entry Type</label>
                  <select
                    required
                    value={entryType}
                    onChange={(e) => setEntryType(e.target.value as "Debit" | "Credit")}
                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                  >
                    <option value="Debit">Debit</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Amount ($)</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Reference Type</label>
                  <select
                    required
                    value={referenceType}
                    onChange={(e) => setReferenceType(e.target.value as any)}
                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                  >
                    <option value="Journal">Journal Voucher</option>
                    <option value="Payment">Payment Voucher</option>
                    <option value="Receipt">Receipt Voucher</option>
                    <option value="Invoice">Sales Invoice</option>
                    <option value="GRN">GRN Audit</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Ref Code / Voucher#</label>
                  <Input
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. JV-901 (Auto if empty)"
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Remarks / Narration</label>
                <Input
                  required
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Explain transaction details..."
                  className="h-10 text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPostModal(false)}
                  className="h-9 text-xs font-semibold border-zinc-200 dark:border-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 text-white"
                >
                  Post Voucher
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

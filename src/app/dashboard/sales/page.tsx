"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  Plus,
  Receipt,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle,
  Coins,
  Search,
  Filter
} from "lucide-react";
import useStore from "@/store";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SalesPage() {
  const {
    batches,
    customers,
    salesInvoices,
    createSalesInvoice,
    payInvoice,
    addNotification,
    logActivity
  } = useStore();

  // Dialog modals
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // New Invoice Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [invoiceItems, setInvoiceItems] = useState<{ batchId: string; quantity: number }[]>([
    { batchId: "", quantity: 1 }
  ]);

  // Payment Form State
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(0);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Calculated Sales KPIs
  const totalSalesInvoiced = useMemo(() => {
    return salesInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0);
  }, [salesInvoices]);

  const outstandingCollections = useMemo(() => {
    return salesInvoices.reduce((acc, curr) => acc + curr.outstandingAmount, 0);
  }, [salesInvoices]);

  const paidInvoicesCount = useMemo(() => {
    return salesInvoices.filter((inv) => inv.status === "Paid").length;
  }, [salesInvoices]);

  const overdueInvoicesCount = useMemo(() => {
    return salesInvoices.filter((inv) => inv.status === "Overdue" || (inv.status === "Unpaid" && new Date(inv.dueDate) < new Date())).length;
  }, [salesInvoices]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return salesInvoices.filter((inv) => {
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase());

      if (statusFilter === "ALL") return matchSearch;
      if (statusFilter === "PAID") return matchSearch && inv.status === "Paid";
      if (statusFilter === "UNPAID") return matchSearch && (inv.status === "Unpaid" || inv.status === "Partially Paid");
      if (statusFilter === "OVERDUE") return matchSearch && (inv.status === "Overdue" || (inv.status === "Unpaid" && new Date(inv.dueDate) < new Date()));
      return matchSearch;
    });
  }, [salesInvoices, searchTerm, statusFilter]);

  // Add Item to Invoice
  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { batchId: "", quantity: 1 }]);
  };

  // Remove Item
  const removeInvoiceItem = (index: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    }
  };

  // Update Invoice Item
  const updateInvoiceItem = (index: number, field: "batchId" | "quantity", value: any) => {
    const updated = [...invoiceItems];
    if (field === "batchId") {
      updated[index] = {
        batchId: value,
        quantity: updated[index].quantity
      };
    } else {
      updated[index] = {
        ...updated[index],
        quantity: Number(value)
      };
    }
    setInvoiceItems(updated);
  };

  // Calculate invoice sums live
  const calculatedSums = useMemo(() => {
    let subTotal = 0;
    let gstAmount = 0;

    invoiceItems.forEach((item) => {
      const batch = batches.find((b) => b.id === item.batchId);
      if (batch) {
        // Trade rate is the billing price, GST is usually 12% in pharma
        const rate = batch.tradeRate;
        const lineTotal = rate * item.quantity;
        const lineGst = lineTotal * 0.12; // 12% GST
        subTotal += lineTotal;
        gstAmount += lineGst;
      }
    });

    const totalAmount = subTotal + gstAmount;

    return {
      subTotal,
      gstAmount,
      totalAmount
    };
  }, [invoiceItems, batches]);

  // Handle Create Invoice
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find((c) => c.id === selectedCustomerId);
    if (!customer) {
      alert("Please select a customer");
      return;
    }

    const items = invoiceItems
      .filter((item) => item.batchId !== "")
      .map((item) => {
        const batch = batches.find((b) => b.id === item.batchId);
        if (!batch) throw new Error("Batch not found");
        if (batch.availableQuantity < item.quantity) {
          alert(`Insufficient stock in Batch ${batch.batchNumber} for ${batch.brandName}. Available: ${batch.availableQuantity}`);
          throw new Error("Insufficient stock");
        }

        const lineAmount = batch.tradeRate * item.quantity;
        return {
          productId: batch.productId,
          productName: batch.productName,
          batchNumber: batch.batchNumber,
          quantity: item.quantity,
          rate: batch.tradeRate,
          mrp: batch.mrp,
          gstPercent: 12,
          amount: lineAmount
        };
      });

    if (items.length === 0) {
      alert("Please select at least one batch item");
      return;
    }

    createSalesInvoice({
      customerId: customer.id,
      customerName: customer.name,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      items,
      subTotal: calculatedSums.subTotal,
      gstAmount: calculatedSums.gstAmount,
      discountAmount: 0,
      totalAmount: calculatedSums.totalAmount
    });

    // Reset Form
    setSelectedCustomerId("");
    setInvoiceItems([{ batchId: "", quantity: 1 }]);
    setShowInvoiceModal(false);
  };

  // Handle Record Payment
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = salesInvoices.find((i) => i.id === selectedInvoiceId);
    if (!inv) {
      alert("Invalid invoice selection");
      return;
    }
    if (paymentAmount <= 0 || paymentAmount > inv.outstandingAmount) {
      alert(`Payment amount must be between 0 and outstanding: ${formatCurrency(inv.outstandingAmount)}`);
      return;
    }

    payInvoice(selectedInvoiceId, paymentAmount);

    // Reset Form
    setSelectedInvoiceId("");
    setPaymentAmount(0);
    setShowPaymentModal(false);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Sales & Billing Management</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Generate tax invoices for stockists and medical stores, track outstanding payments, and view credit limits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowInvoiceModal(true)}
            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 text-white h-9"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Invoice
          </Button>
          <Button
            onClick={() => setShowPaymentModal(true)}
            variant="outline"
            className="text-xs font-bold border-zinc-200/80 dark:border-zinc-800 h-9"
          >
            <Coins className="h-4 w-4 mr-1.5 text-zinc-500" />
            Record Payment Receipt
          </Button>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Gross Billing Invoiced</CardTitle>
            <ArrowUpRight className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSalesInvoiced)}</div>
            <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-semibold flex items-center">
                <TrendingUp className="h-3 w-3" /> +14.8%
              </span>
              billing revenue growth (MoM)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Outstanding Collections</CardTitle>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{formatCurrency(outstandingCollections)}</div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Awaiting clearance from stockists
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Fully Settled Sales</CardTitle>
            <CheckCircle className="h-5 w-5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidInvoicesCount} Invoices</div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Receipts matched with zero balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Overdue Collections</CardTitle>
            <ShieldAlert className="h-5 w-5 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{overdueInvoicesCount}</div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Surpassed 30-day payment term
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80">
        <div className="relative w-full sm:w-80 flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-zinc-400 pointer-events-none" />
          <Input
            placeholder="Search invoice or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-9 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid Only</option>
            <option value="UNPAID">Pending Collections</option>
            <option value="OVERDUE">Overdue Invoices</option>
          </select>
        </div>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Tax Invoices Ledger</CardTitle>
          <CardDescription className="text-xs">Audit generated billing details, outstanding credits, and aging balances.</CardDescription>
        </CardHeader>
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-bold">Invoice Number</TableHead>
                      <TableHead className="text-xs font-bold">Billing Date</TableHead>
                      <TableHead className="text-xs font-bold">Customer Name</TableHead>
                      <TableHead className="text-xs font-bold">Due Date</TableHead>
                      <TableHead className="text-xs font-bold">Gross Amount</TableHead>
                      <TableHead className="text-xs font-bold">Outstanding</TableHead>
                      <TableHead className="text-xs font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-zinc-500">
                          <Receipt className="h-10 w-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-700 stroke-[1.5]" />
                          <p className="text-xs font-semibold">No invoices found matching query</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInvoices.map((inv) => {
                        const isOverdue = inv.status === "Unpaid" && new Date(inv.dueDate) < new Date();
                        return (
                          <TableRow key={inv.id}>
                            <TableCell className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                              {inv.invoiceNumber}
                            </TableCell>
                            <TableCell className="text-xs text-zinc-500">
                              {inv.date}
                            </TableCell>
                            <TableCell className="text-xs font-bold text-zinc-950 dark:text-white">
                              {inv.customerName}
                            </TableCell>
                            <TableCell className="text-xs text-zinc-500">
                              {inv.dueDate}
                            </TableCell>
                            <TableCell className="text-xs font-bold text-zinc-850 dark:text-zinc-100">
                              {formatCurrency(inv.totalAmount)}
                            </TableCell>
                            <TableCell className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                              {formatCurrency(inv.outstandingAmount)}
                            </TableCell>
                            <TableCell>
                              {inv.status === "Paid" && (
                                <Badge variant="success" className="text-[9px] font-bold py-0.5">
                                  Paid
                                </Badge>
                              )}
                              {inv.status === "Partially Paid" && (
                                <Badge variant="warning" className="text-[9px] font-bold py-0.5">
                                  Partial
                                </Badge>
                              )}
                              {inv.status === "Unpaid" && !isOverdue && (
                                <Badge variant="warning" className="text-[9px] font-bold py-0.5">
                                  Unpaid
                                </Badge>
                              )}
                              {(inv.status === "Overdue" || isOverdue) && (
                                <Badge variant="destructive" className="text-[9px] font-bold py-0.5">
                                  Overdue
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
      </Card>

      {/* Modal 1: Raise Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Generate Tax Invoice</h2>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleCreateInvoice}>
              <div className="p-6 space-y-4 max-h-[450px] overflow-y-auto">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Select Customer (Stockist / Store)</label>
                  <select
                    required
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers
                      .filter((c) => c.status === "Active")
                      .map((cust) => (
                        <option key={cust.id} value={cust.id}>
                          {cust.name} ({cust.type} - {cust.city})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Invoice Items</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addInvoiceItem}
                      className="h-7 text-[10px] font-bold border-zinc-200/80 dark:border-zinc-800"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Batch Item
                    </Button>
                  </div>

                  {invoiceItems.map((item, index) => {
                    const selectedBatch = batches.find((b) => b.id === item.batchId);
                    return (
                      <div key={index} className="grid grid-cols-12 gap-3 items-end border-b border-zinc-100 dark:border-zinc-900 pb-3">
                        <div className="col-span-7 space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400">Inventory Batch (Drug & Expiry)</label>
                          <select
                            required
                            value={item.batchId}
                            onChange={(e) => updateInvoiceItem(index, "batchId", e.target.value)}
                            className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                          >
                            <option value="">-- Select Available Batch --</option>
                            {batches
                              .filter((b) => b.availableQuantity > 0 && b.status !== "Expired")
                              .map((b) => (
                                <option key={b.id} value={b.id}>
                                  {b.brandName} - {b.batchNumber} (Stock: {b.availableQuantity} | Exp: {b.expiryDate})
                                </option>
                              ))}
                          </select>
                        </div>

                        <div className="col-span-3 space-y-1">
                          <label className="text-[10px] font-bold text-zinc-400">Qty (Packs)</label>
                          <Input
                            required
                            type="number"
                            min="1"
                            max={selectedBatch ? selectedBatch.availableQuantity : undefined}
                            value={item.quantity}
                            onChange={(e) => updateInvoiceItem(index, "quantity", e.target.value)}
                            className="h-9 text-xs"
                          />
                        </div>

                        <div className="col-span-1 text-xs font-semibold text-zinc-500 pb-2.5">
                          {selectedBatch ? `@$${selectedBatch.tradeRate}` : ""}
                        </div>

                        <div className="col-span-1 pb-1">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => removeInvoiceItem(index)}
                            disabled={invoiceItems.length === 1}
                            className="h-9 w-9 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 disabled:opacity-40"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
                <div className="text-[11px] text-zinc-500 leading-tight">
                  Subtotal: {formatCurrency(calculatedSums.subTotal)}<br />
                  Tax (12% GST): {formatCurrency(calculatedSums.gstAmount)}<br />
                  Total Invoiced: <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">{formatCurrency(calculatedSums.totalAmount)}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowInvoiceModal(false)}
                    className="h-9 text-xs font-semibold border-zinc-200 dark:border-zinc-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 text-white"
                  >
                    Generate Invoice
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Record Invoice Payment</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Select Invoice</label>
                <select
                  required
                  value={selectedInvoiceId}
                  onChange={(e) => {
                    setSelectedInvoiceId(e.target.value);
                    const inv = salesInvoices.find((i) => i.id === e.target.value);
                    setPaymentAmount(inv ? inv.outstandingAmount : 0);
                  }}
                  className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  <option value="">-- Select Invoice --</option>
                  {salesInvoices
                    .filter((inv) => inv.outstandingAmount > 0)
                    .map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} - {inv.customerName} (Due: {formatCurrency(inv.outstandingAmount)})
                      </option>
                    ))}
                </select>
              </div>

              {selectedInvoiceId && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Amount Received ($)</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="h-10 text-sm"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                  className="h-9 text-xs font-semibold border-zinc-200 dark:border-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!selectedInvoiceId}
                  className="h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 text-white disabled:opacity-50"
                >
                  Record Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

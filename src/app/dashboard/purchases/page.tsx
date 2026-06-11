"use client";

import { useState, useMemo } from "react";
import {
  FileSpreadsheet,
  Plus,
  PackageCheck,
  TrendingUp,
  Clock,
  ArrowDownLeft,
  Truck,
  Calendar,
  AlertCircle,
  CheckCircle,
  FileText
} from "lucide-react";
import useStore from "@/store";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PurchasesPage() {
  const {
    products,
    suppliers,
    purchaseOrders,
    grns,
    createPurchaseOrder,
    receiveGRN,
    addNotification,
    logActivity
  } = useStore();

  const [activeTab, setActiveTab] = useState("purchase-orders");

  // Modals state
  const [showPOModal, setShowPOModal] = useState(false);
  const [showGRNModal, setShowGRNModal] = useState(false);

  // New PO Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [poItems, setPoItems] = useState<{ productId: string; quantity: number; rate: number }[]>([
    { productId: "", quantity: 1, rate: 0 }
  ]);

  // New GRN Form State
  const [selectedPoId, setSelectedPoId] = useState("");
  const [grnItems, setGrnItems] = useState<{
    productId: string;
    productName: string;
    orderedQty: number;
    receivedQty: number;
    acceptedQty: number;
    rejectedQty: number;
    batchNumber: string;
    expiryDate: string;
  }[]>([]);

  // Derived KPI analytics
  const totalPOAmount = useMemo(() => {
    return purchaseOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);
  }, [purchaseOrders]);

  const openPOsCount = useMemo(() => {
    return purchaseOrders.filter((po) => po.status === "Sent" || po.status === "Draft").length;
  }, [purchaseOrders]);

  const totalSpend = useMemo(() => {
    return purchaseOrders
      .filter((po) => po.status === "Received")
      .reduce((acc, curr) => acc + curr.totalAmount, 0);
  }, [purchaseOrders]);

  const pendingGrnCount = useMemo(() => {
    return purchaseOrders.filter((po) => po.status === "Sent").length;
  }, [purchaseOrders]);

  // Handle PO Supplier Change
  const handlePOSupplierChange = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
  };

  // Add Item to PO
  const addPOItem = () => {
    setPoItems([...poItems, { productId: "", quantity: 1, rate: 0 }]);
  };

  // Remove Item from PO
  const removePOItem = (index: number) => {
    if (poItems.length > 1) {
      setPoItems(poItems.filter((_, i) => i !== index));
    }
  };

  // Update PO Item Field
  const updatePOItem = (index: number, field: "productId" | "quantity" | "rate", value: any) => {
    const updated = [...poItems];
    if (field === "productId") {
      const prod = products.find((p) => p.id === value);
      updated[index] = {
        productId: value,
        quantity: updated[index].quantity,
        rate: prod ? prod.tradeRate : 0
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: Number(value)
      };
    }
    setPoItems(updated);
  };

  // Handle PO Submit
  const handlePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const supplier = suppliers.find((s) => s.id === selectedSupplierId);
    if (!supplier) {
      alert("Please select a valid supplier");
      return;
    }

    const items = poItems
      .filter((item) => item.productId !== "")
      .map((item) => {
        const prod = products.find((p) => p.id === item.productId);
        return {
          productId: item.productId,
          productName: prod ? prod.brandName : "Unknown Product",
          quantity: item.quantity,
          rate: item.rate,
          amount: item.quantity * item.rate
        };
      });

    if (items.length === 0) {
      alert("Please add at least one product");
      return;
    }

    const totalAmount = items.reduce((acc, curr) => acc + curr.amount, 0);

    createPurchaseOrder({
      supplierId: supplier.id,
      supplierName: supplier.name,
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      items,
      totalAmount
    });

    // Reset Form
    setSelectedSupplierId("");
    setPoItems([{ productId: "", quantity: 1, rate: 0 }]);
    setShowPOModal(false);
  };

  // Handle Select PO for GRN
  const handleSelectPoForGrn = (poId: string) => {
    setSelectedPoId(poId);
    const po = purchaseOrders.find((p) => p.id === poId);
    if (po) {
      const mappedItems = po.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        orderedQty: item.quantity,
        receivedQty: item.quantity,
        acceptedQty: item.quantity,
        rejectedQty: 0,
        batchNumber: `B-${Math.random().toString(36).substring(3, 8).toUpperCase()}`,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
      }));
      setGrnItems(mappedItems);
    } else {
      setGrnItems([]);
    }
  };

  // Update GRN Item Field
  const updateGRNItem = (index: number, field: string, value: any) => {
    const updated = [...grnItems];
    if (field === "receivedQty" || field === "acceptedQty" || field === "rejectedQty") {
      updated[index] = {
        ...updated[index],
        [field]: Number(value)
      };
      if (field === "receivedQty") {
        updated[index].acceptedQty = Number(value);
        updated[index].rejectedQty = 0;
      } else if (field === "acceptedQty") {
        updated[index].rejectedQty = updated[index].receivedQty - Number(value);
      }
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value
      };
    }
    setGrnItems(updated);
  };

  // Handle GRN Submit
  const handleGRNSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const po = purchaseOrders.find((p) => p.id === selectedPoId);
    if (!po) {
      alert("Please select an open Purchase Order");
      return;
    }

    receiveGRN({
      poNumber: po.poNumber,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      receivedBy: "Store Manager",
      items: grnItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
        orderedQty: item.orderedQty,
        receivedQty: item.receivedQty,
        acceptedQty: item.acceptedQty,
        rejectedQty: item.rejectedQty
      }))
    });

    // Reset Form
    setSelectedPoId("");
    setGrnItems([]);
    setShowGRNModal(false);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Purchase & GRN Management</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Create Purchase Orders (PO), verify vendor shipments, log incoming batches, and process Goods Receipt Notes (GRN).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowPOModal(true)}
            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 text-white h-9"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Raise PO
          </Button>
          <Button
            onClick={() => setShowGRNModal(true)}
            variant="outline"
            className="text-xs font-bold border-zinc-200/80 dark:border-zinc-800 h-9"
          >
            <PackageCheck className="h-4 w-4 mr-1.5 text-zinc-500" />
            Receive GRN Shipment
          </Button>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Total Procurement Value</CardTitle>
            <ArrowDownLeft className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPOAmount)}</div>
            <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-semibold flex items-center">
                <TrendingUp className="h-3 w-3" /> +10.2%
              </span>
              procurement volume (MoM)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Received Spend</CardTitle>
            <CheckCircle className="h-5 w-5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpend)}</div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Supplier invoices received & stock-checked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Open Purchase Orders</CardTitle>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{openPOsCount}</div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Awaiting shipment confirmation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Pending GRN Arrivals</CardTitle>
            <Truck className="h-5 w-5 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">{pendingGrnCount}</div>
            <p className="text-[10px] text-zinc-500 mt-1">
              In-transit stock waiting verification
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-80 grid-cols-2">
          <TabsTrigger value="purchase-orders" className="flex items-center gap-1.5 font-bold text-xs">
            <FileText className="h-4 w-4" />
            Purchase Orders
          </TabsTrigger>
          <TabsTrigger value="grns" className="flex items-center gap-1.5 font-bold text-xs">
            <PackageCheck className="h-4 w-4" />
            Received GRNs
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Purchase Orders */}
        <TabsContent value="purchase-orders" className="mt-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Raised Purchase Orders</CardTitle>
              <CardDescription className="text-xs">Monitor procurement details, delivery timelines, and statuses.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-bold">PO Number</TableHead>
                      <TableHead className="text-xs font-bold">Date Raised</TableHead>
                      <TableHead className="text-xs font-bold">Supplier Name</TableHead>
                      <TableHead className="text-xs font-bold">Items Count</TableHead>
                      <TableHead className="text-xs font-bold">Expected Delivery</TableHead>
                      <TableHead className="text-xs font-bold">Total Amount</TableHead>
                      <TableHead className="text-xs font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-zinc-500">
                          <FileSpreadsheet className="h-10 w-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-700 stroke-[1.5]" />
                          <p className="text-xs font-semibold">No purchase orders found</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      purchaseOrders.map((po) => (
                        <TableRow key={po.id}>
                          <TableCell className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                            {po.poNumber}
                          </TableCell>
                          <TableCell className="text-xs text-zinc-500">
                            {po.date}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-zinc-950 dark:text-white">
                            {po.supplierName}
                          </TableCell>
                          <TableCell className="text-xs text-zinc-700 dark:text-zinc-300">
                            {po.items.length} Product(s)
                          </TableCell>
                          <TableCell className="text-xs text-zinc-500">
                            {po.deliveryDate}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-zinc-850 dark:text-zinc-100">
                            {formatCurrency(po.totalAmount)}
                          </TableCell>
                          <TableCell>
                            {po.status === "Received" && (
                              <Badge variant="success" className="text-[9px] font-bold py-0.5">
                                Received
                              </Badge>
                            )}
                            {po.status === "Sent" && (
                              <Badge variant="warning" className="text-[9px] font-bold py-0.5">
                                In-Transit
                              </Badge>
                            )}
                            {po.status === "Draft" && (
                              <Badge variant="secondary" className="text-[9px] font-bold py-0.5">
                                Draft
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Received GRNs */}
        <TabsContent value="grns" className="mt-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Goods Receipt Notes (GRN)</CardTitle>
              <CardDescription className="text-xs">Verify warehouse check-in history, generated batch numbers, and QC discrepancies.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-bold">GRN Number</TableHead>
                      <TableHead className="text-xs font-bold">Date Received</TableHead>
                      <TableHead className="text-xs font-bold">PO Reference</TableHead>
                      <TableHead className="text-xs font-bold">Supplier</TableHead>
                      <TableHead className="text-xs font-bold">Items Inspected</TableHead>
                      <TableHead className="text-xs font-bold">Received By</TableHead>
                      <TableHead className="text-xs font-bold">QC Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-zinc-500">
                          <PackageCheck className="h-10 w-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-700 stroke-[1.5]" />
                          <p className="text-xs font-semibold">No GRNs processed yet</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      grns.map((grn) => {
                        const totalRejected = grn.items.reduce((acc, i) => acc + i.rejectedQty, 0);
                        return (
                          <TableRow key={grn.id}>
                            <TableCell className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                              {grn.grnNumber}
                            </TableCell>
                            <TableCell className="text-xs text-zinc-500">
                              {grn.date}
                            </TableCell>
                            <TableCell className="text-xs font-mono font-semibold text-zinc-600 dark:text-zinc-400">
                              {grn.poNumber || "N/A"}
                            </TableCell>
                            <TableCell className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              {grn.supplierName}
                            </TableCell>
                            <TableCell className="text-xs text-zinc-700 dark:text-zinc-300">
                              {grn.items.length} Product(s)
                            </TableCell>
                            <TableCell className="text-xs text-zinc-500">
                              {grn.receivedBy}
                            </TableCell>
                            <TableCell>
                              {totalRejected > 0 ? (
                                <Badge variant="destructive" className="text-[9px] font-bold py-0.5 flex items-center gap-1 w-fit">
                                  <AlertCircle className="h-3 w-3" /> QA Hold ({totalRejected} units)
                                </Badge>
                              ) : (
                                <Badge variant="success" className="text-[9px] font-bold py-0.5 flex items-center gap-1 w-fit">
                                  <CheckCircle className="h-3 w-3" /> Passed Inspection
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
        </TabsContent>
      </Tabs>

      {/* Modal 1: Raise PO Modal */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Raise Purchase Order (PO)</h2>
              <button
                onClick={() => setShowPOModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
            <form onSubmit={handlePOSubmit}>
              <div className="p-6 space-y-4 max-h-[450px] overflow-y-auto">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Select Supplier</label>
                  <select
                    required
                    value={selectedSupplierId}
                    onChange={(e) => handlePOSupplierChange(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                  >
                    <option value="">-- Choose Supplier --</option>
                    {suppliers
                      .filter((s) => s.status === "Active")
                      .map((sup) => (
                        <option key={sup.id} value={sup.id}>
                          {sup.name} ({sup.city})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Purchase Items</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addPOItem}
                      className="h-7 text-[10px] font-bold border-zinc-200/80 dark:border-zinc-800"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Product
                    </Button>
                  </div>

                  {poItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-end border-b border-zinc-100 dark:border-zinc-900 pb-3">
                      <div className="col-span-6 space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400">Product</label>
                        <select
                          required
                          value={item.productId}
                          onChange={(e) => updatePOItem(index, "productId", e.target.value)}
                          className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                        >
                          <option value="">-- Choose Brand --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.brandName} - {p.strength} ({p.dosageForm})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400">Qty (Packs)</label>
                        <Input
                          required
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updatePOItem(index, "quantity", e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="col-span-3 space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400">Trade Rate ($)</label>
                        <Input
                          required
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.rate}
                          onChange={(e) => updatePOItem(index, "rate", e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>

                      <div className="col-span-1 pb-1">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removePOItem(index)}
                          disabled={poItems.length === 1}
                          className="h-9 w-9 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 disabled:opacity-40"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
                <div className="text-xs font-semibold text-zinc-500">
                  Total PO: <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm ml-1">
                    {formatCurrency(poItems.reduce((acc, i) => acc + i.quantity * i.rate, 0))}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPOModal(false)}
                    className="h-9 text-xs font-semibold border-zinc-200 dark:border-zinc-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 text-white"
                  >
                    Submit Purchase Order
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Receive GRN Modal */}
      {showGRNModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Receive Shipment & Generate GRN</h2>
              <button
                onClick={() => setShowGRNModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleGRNSubmit}>
              <div className="p-6 space-y-4 max-h-[450px] overflow-y-auto">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Select In-Transit PO</label>
                  <select
                    required
                    value={selectedPoId}
                    onChange={(e) => handleSelectPoForGrn(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                  >
                    <option value="">-- Choose Open PO --</option>
                    {purchaseOrders
                      .filter((po) => po.status === "Sent")
                      .map((po) => (
                        <option key={po.id} value={po.id}>
                          {po.poNumber} - {po.supplierName} ({formatCurrency(po.totalAmount)})
                        </option>
                      ))}
                  </select>
                </div>

                {grnItems.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Goods Quality Control & Receipt Log</label>
                    <div className="space-y-4">
                      {grnItems.map((item, index) => (
                        <div key={item.productId} className="bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-lg border border-zinc-200/60 dark:border-zinc-800/80 space-y-3">
                          <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 pb-2">
                            <span className="text-xs font-bold text-zinc-850 dark:text-zinc-200">{item.productName}</span>
                            <span className="text-[10px] text-zinc-500">Ordered: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{item.orderedQty} packs</span></span>
                          </div>

                          <div className="grid grid-cols-4 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-zinc-500">Received Qty</label>
                              <Input
                                required
                                type="number"
                                min="0"
                                value={item.receivedQty}
                                onChange={(e) => updateGRNItem(index, "receivedQty", e.target.value)}
                                className="h-8 text-xs bg-white dark:bg-zinc-950"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-zinc-500">Accepted Qty (QA)</label>
                              <Input
                                required
                                type="number"
                                min="0"
                                max={item.receivedQty}
                                value={item.acceptedQty}
                                onChange={(e) => updateGRNItem(index, "acceptedQty", e.target.value)}
                                className="h-8 text-xs bg-white dark:bg-zinc-950"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-zinc-500">Rejected Qty (Bad QC)</label>
                              <Input
                                disabled
                                type="number"
                                value={item.rejectedQty}
                                className="h-8 text-xs opacity-60 bg-zinc-100 dark:bg-zinc-800"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-zinc-500">Expiry Date</label>
                              <Input
                                required
                                type="date"
                                value={item.expiryDate}
                                onChange={(e) => updateGRNItem(index, "expiryDate", e.target.value)}
                                className="h-8 text-xs bg-white dark:bg-zinc-950"
                              />
                            </div>
                          </div>

                          <div className="w-1/2 space-y-1">
                            <label className="text-[10px] font-semibold text-zinc-500">Assign Batch Code</label>
                            <Input
                              required
                              value={item.batchNumber}
                              onChange={(e) => updateGRNItem(index, "batchNumber", e.target.value)}
                              placeholder="e.g. B-AZ901"
                              className="h-8 text-xs font-mono bg-white dark:bg-zinc-950"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGRNModal(false)}
                  className="h-9 text-xs font-semibold border-zinc-200 dark:border-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={grnItems.length === 0}
                  className="h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 text-white disabled:opacity-50"
                >
                  Generate GRN & Update Inventory
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

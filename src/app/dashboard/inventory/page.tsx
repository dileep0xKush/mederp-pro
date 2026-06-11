"use client";

import { useState } from "react";
import {
  ClipboardList,
  Plus,
  ArrowRightLeft,
  Sliders,
  Search,
  ScanBarcode,
  History,
  FileCheck,
  Package,
  Layers,
  MapPin
} from "lucide-react";
import useStore from "@/store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function InventoryPage() {
  const {
    products,
    batches,
    inventoryTransactions,
    addInventoryTransaction,
    logActivity,
    addNotification
  } = useStore();

  const [activeTab, setActiveTab] = useState("ledger");
  const [barcodeQuery, setBarcodeQuery] = useState("");
  const [selectedTxType, setSelectedTxType] = useState<"Stock In" | "Stock Out" | "Stock Transfer" | "Stock Adjustment">("Stock In");

  // Form State
  const [formData, setFormData] = useState({
    productId: "",
    batchNumber: "",
    quantity: 0,
    sourceWarehouse: "",
    targetWarehouse: "",
    referenceNumber: "",
    remarks: ""
  });

  // Filter batches based on selected product
  const availableBatchesForProduct = batches.filter(
    (b) => b.productId === formData.productId
  );

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const product = products.find((p) => p.id === formData.productId);
    if (!product) {
      alert("Please select a product.");
      return;
    }

    addInventoryTransaction({
      type: selectedTxType,
      productId: formData.productId,
      productName: product.brandName,
      batchNumber: formData.batchNumber,
      quantity: Number(formData.quantity),
      sourceWarehouse: selectedTxType !== "Stock In" ? formData.sourceWarehouse : undefined,
      targetWarehouse: selectedTxType !== "Stock Out" ? formData.targetWarehouse : undefined,
      referenceNumber: formData.referenceNumber || `REF-${Date.now().toString().substring(8)}`,
      remarks: formData.remarks
    });

    addNotification(
      "success",
      "Stock Transaction Logged",
      `${selectedTxType} processed for ${product.brandName} (${formData.quantity} units).`
    );

    // Reset Form & switch tab
    setFormData({
      productId: "",
      batchNumber: "",
      quantity: 0,
      sourceWarehouse: "",
      targetWarehouse: "",
      referenceNumber: "",
      remarks: ""
    });
    setActiveTab("ledger");
  };

  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeQuery.trim()) return;

    // Simulate scanning - match a mock product or batch
    const match = batches.find((b) => b.batchNumber.toLowerCase() === barcodeQuery.toLowerCase());
    if (match) {
      alert(`Barcode Scan Successful!\nFound Batch: ${match.batchNumber}\nProduct: ${match.brandName}\nAvailable Stock: ${match.availableQuantity}`);
      setFormData({
        productId: match.productId,
        batchNumber: match.batchNumber,
        quantity: 1,
        sourceWarehouse: "Warehouse Alpha (Main)",
        targetWarehouse: "",
        referenceNumber: "SCANNED-BARCODE",
        remarks: "Auto-loaded from barcode scanning UI"
      });
      setActiveTab("actions");
    } else {
      alert("Barcode not registered in database. Try scanning 'B-CP902' or 'B-PC102'.");
    }
    setBarcodeQuery("");
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Warehouse Stock & Inventory Logs</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Log incoming consignments, manage inter-depot stock transfers, execute adjustments, and audit ledger entries.
          </p>
        </div>
      </div>

      {/* Barcode scanner simulation */}
      <Card className="bg-emerald-500/5 dark:bg-emerald-400/5 border border-emerald-500/10">
        <CardContent className="p-4">
          <form onSubmit={handleBarcodeScan} className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <ScanBarcode className="h-5 w-5 stroke-[2]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-950 dark:text-zinc-50">Barcode Ready Scanner UI</h4>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Enter a batch number to simulate scanning a physical box barcode.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <Input
                placeholder="Scan batch (e.g. B-CP902)..."
                value={barcodeQuery}
                onChange={(e) => setBarcodeQuery(e.target.value)}
                className="h-9 text-xs sm:w-64"
              />
              <Button type="submit" size="sm" className="h-9 font-semibold text-xs">Scan</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-80 grid-cols-2">
          <TabsTrigger value="ledger" className="flex items-center gap-1.5 font-bold text-xs">
            <History className="h-4 w-4" />
            Stock Ledger
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-1.5 font-bold text-xs">
            <Plus className="h-4 w-4" />
            Stock Adjustments
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Ledger */}
        <TabsContent value="ledger" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-bold">Stock Outflow & Inflow Ledgers</CardTitle>
              <CardDescription className="text-xs">Live tracking of active inventory log edits</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-bold">Timestamp</TableHead>
                    <TableHead className="text-xs font-bold">Transaction Type</TableHead>
                    <TableHead className="text-xs font-bold">Product Formulation</TableHead>
                    <TableHead className="text-xs font-bold">Batch ID</TableHead>
                    <TableHead className="text-xs font-bold">Quantity</TableHead>
                    <TableHead className="text-xs font-bold">Warehouses (From → To)</TableHead>
                    <TableHead className="text-xs font-bold">Ref Code & User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-zinc-500">
                        <ClipboardList className="h-10 w-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-700 stroke-[1.5]" />
                        <p className="text-xs font-semibold">No stock transfers found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    inventoryTransactions.map((tx) => {
                      return (
                        <TableRow key={tx.id}>
                          <TableCell className="text-xs text-zinc-500 whitespace-nowrap">
                            {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell>
                            {tx.type === "Stock In" && (
                              <Badge variant="success" className="text-[9px] font-bold py-0.5">Stock In</Badge>
                            )}
                            {tx.type === "Stock Out" && (
                              <Badge variant="destructive" className="text-[9px] font-bold py-0.5">Stock Out</Badge>
                            )}
                            {tx.type === "Stock Transfer" && (
                              <Badge variant="info" className="text-[9px] font-bold py-0.5">Transfer</Badge>
                            )}
                            {tx.type === "Stock Adjustment" && (
                              <Badge variant="warning" className="text-[9px] font-bold py-0.5">Adjustment</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                            {tx.productName}
                          </TableCell>
                          <TableCell className="text-xs font-mono font-bold text-zinc-500">
                            {tx.batchNumber}
                          </TableCell>
                          <TableCell className="text-xs font-bold">
                            <span className={tx.quantity > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                              {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-zinc-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-zinc-400" />
                              {tx.type === "Stock In" && `→ ${tx.targetWarehouse}`}
                              {tx.type === "Stock Out" && `${tx.sourceWarehouse} → Out`}
                              {tx.type === "Stock Transfer" && `${tx.sourceWarehouse} → ${tx.targetWarehouse}`}
                              {tx.type === "Stock Adjustment" && `${tx.sourceWarehouse || "Alpha"} Adjustment`}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-[10px] font-mono font-bold text-zinc-700 dark:text-zinc-300">{tx.referenceNumber}</p>
                              <p className="text-[9px] text-zinc-400 font-semibold">By: {tx.performedBy}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Actions Form */}
        <TabsContent value="actions" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Record Inventory Event</CardTitle>
                <CardDescription className="text-xs">Adjust stock counts, document breakages, or update depots.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTxSubmit} className="space-y-4">
                  {/* Select Tx Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Adjustment Action</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(["Stock In", "Stock Out", "Stock Transfer", "Stock Adjustment"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSelectedTxType(type)}
                          className={`py-2 px-1 text-[10px] font-bold rounded-lg border text-center transition-colors cursor-pointer ${
                            selectedTxType === type
                              ? "bg-emerald-50 text-emerald-800 border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : "border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/30"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Select Product */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Select Brand Formulation</label>
                      <Select
                        required
                        value={formData.productId}
                        onChange={(e) => setFormData({ ...formData, productId: e.target.value, batchNumber: "" })}
                      >
                        <option value="">-- Choose Product --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.brandName} ({p.strength})</option>
                        ))}
                      </Select>
                    </div>

                    {/* Select Batch */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Select Batch</label>
                      <Select
                        required
                        value={formData.batchNumber}
                        onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                        disabled={!formData.productId}
                      >
                        <option value="">-- Choose Batch --</option>
                        {availableBatchesForProduct.map((b) => (
                          <option key={b.id} value={b.batchNumber}>
                            {b.batchNumber} (Stock: {b.availableQuantity})
                          </option>
                        ))}
                      </Select>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Quantity ({selectedTxType === "Stock Out" || selectedTxType === "Stock Transfer" ? "Deduct" : "Add/Modify"})
                      </label>
                      <Input
                        required
                        type="number"
                        min={1}
                        value={formData.quantity || ""}
                        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                      />
                    </div>

                    {/* Reference Number */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Reference Number</label>
                      <Input
                        placeholder="e.g. GRN-9023, ADJ-102"
                        value={formData.referenceNumber}
                        onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                      />
                    </div>

                    {/* Warehouses */}
                    {selectedTxType !== "Stock In" && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Source Warehouse</label>
                        <Select
                          value={formData.sourceWarehouse}
                          onChange={(e) => setFormData({ ...formData, sourceWarehouse: e.target.value })}
                        >
                          <option value="Warehouse Alpha (Main)">Warehouse Alpha (Main)</option>
                          <option value="Sub-Depot Beta">Sub-Depot Beta</option>
                        </Select>
                      </div>
                    )}

                    {selectedTxType !== "Stock Out" && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Target Warehouse</label>
                        <Select
                          value={formData.targetWarehouse}
                          onChange={(e) => setFormData({ ...formData, targetWarehouse: e.target.value })}
                        >
                          <option value="Warehouse Alpha (Main)">Warehouse Alpha (Main)</option>
                          <option value="Sub-Depot Beta">Sub-Depot Beta</option>
                          <option value="Quarantine Depot">Quarantine Depot</option>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Remarks */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Remarks / Journal Notes</label>
                    <Input
                      placeholder="e.g. Discarded water damaged packages"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    />
                  </div>

                  <Button type="submit" className="w-full font-bold text-xs py-2 mt-4">
                    Submit Stock Action
                  </Button>
                </form>
              </CardContent>
            </Card>


            {/* Guide Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold">Inventory Rules</CardTitle>
                <CardDescription className="text-xs">Quick guidelines on handling operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="flex gap-2">
                  <div className="h-5 w-5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">1</div>
                  <p className="text-zinc-500"><strong>Stock In</strong> processes increase available quantities directly for the batch selection.</p>
                </div>
                <div className="flex gap-2">
                  <div className="h-5 w-5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">2</div>
                  <p className="text-zinc-500"><strong>Stock Out</strong> decreases available quantity and sets the out transaction logs.</p>
                </div>
                <div className="flex gap-2">
                  <div className="h-5 w-5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">3</div>
                  <p className="text-zinc-500"><strong>Stock Transfer</strong> moves quantity records without net stock loss unless routed to Quarantine Depot.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

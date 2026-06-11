"use client";

import { useState, useMemo } from "react";
import {
  Gift,
  Plus,
  TrendingUp,
  Percent,
  Calendar,
  Layers,
  Award,
  Users2,
  PackageCheck
} from "lucide-react";
import useStore from "@/store";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function GiftsPage() {
  const {
    giftInventory,
    giftAllocations,
    allocateGift,
    addNotification,
    logActivity
  } = useStore();

  const [activeTab, setActiveTab] = useState("inventory");

  // Modals state
  const [showAllocateModal, setShowAllocateModal] = useState(false);

  // Form State
  const [selectedGiftId, setSelectedGiftId] = useState("");
  const [selectedMrId, setSelectedMrId] = useState("");
  const [allocatedQty, setAllocatedQty] = useState(1);

  // Representatives directory
  const reps = [
    { id: "mr-1", name: "Rahul Kapoor" },
    { id: "mr-2", name: "Sneha Sen" }
  ];

  // Derived KPI Analytics
  const totalGiftValue = useMemo(() => {
    return giftInventory.reduce((acc, curr) => acc + (curr.totalStock * curr.valuePerUnit), 0);
  }, [giftInventory]);

  const allocatedValue = useMemo(() => {
    return giftInventory.reduce((acc, curr) => acc + (curr.allocatedQty * curr.valuePerUnit), 0);
  }, [giftInventory]);

  const distributedValue = useMemo(() => {
    return giftInventory.reduce((acc, curr) => acc + (curr.distributedQty * curr.valuePerUnit), 0);
  }, [giftInventory]);

  const availableGiftsCount = useMemo(() => {
    return giftInventory.reduce((acc, curr) => acc + curr.availableQty, 0);
  }, [giftInventory]);

  const topGift = useMemo(() => {
    if (giftInventory.length === 0) return null;
    return [...giftInventory].sort((a, b) => b.distributedQty - a.distributedQty)[0];
  }, [giftInventory]);

  // Handle allocation submission
  const handleAllocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gift = giftInventory.find((g) => g.id === selectedGiftId);
    const mr = reps.find((r) => r.id === selectedMrId);

    if (!gift || !mr) {
      alert("Please select a valid gift and representative.");
      return;
    }

    if (gift.availableQty < allocatedQty) {
      alert(`Insufficient stock! Only ${gift.availableQty} units of ${gift.giftName} available.`);
      return;
    }

    allocateGift({
      giftId: gift.id,
      giftName: gift.giftName,
      mrId: mr.id,
      mrName: mr.name,
      allocatedQty
    });

    // Reset Form
    setSelectedGiftId("");
    setSelectedMrId("");
    setAllocatedQty(1);
    setShowAllocateModal(false);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Promotional Gift Inventory</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Manage sample and gift listings, allocate promotional budgets to Medical Representatives, and audit distributed counts.
          </p>
        </div>
        <div>
          <Button
            onClick={() => setShowAllocateModal(true)}
            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 text-white h-9"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Allocate Gifts
          </Button>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Total Gift Asset Value</CardTitle>
            <Gift className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalGiftValue)}</div>
            <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-semibold flex items-center">
                <TrendingUp className="h-3 w-3" /> +8.4%
              </span>
              promotional budget allocation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Allocated to Field Force</CardTitle>
            <Users2 className="h-5 w-5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(allocatedValue)}</div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Active in Medical Rep custody
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Distributed Value</CardTitle>
            <PackageCheck className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(distributedValue)}</div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Gifts presented during doctor visits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Remaining In-Stock</CardTitle>
            <Layers className="h-5 w-5 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">{availableGiftsCount} Units</div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Warehouse reserve quantity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-80 grid-cols-2">
          <TabsTrigger value="inventory" className="flex items-center gap-1.5 font-bold text-xs">
            <Layers className="h-4 w-4" />
            Gift Stock Ledger
          </TabsTrigger>
          <TabsTrigger value="allocations" className="flex items-center gap-1.5 font-bold text-xs">
            <Users2 className="h-4 w-4" />
            MR Allocations
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Gift Stock Ledger */}
        <TabsContent value="inventory" className="mt-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Stock Directory</CardTitle>
              <CardDescription className="text-xs">Audit values, total purchases, allocations, and stock level warnings.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-bold">Gift Details</TableHead>
                      <TableHead className="text-xs font-bold">Value per Unit</TableHead>
                      <TableHead className="text-xs font-bold text-center">Total In Stock</TableHead>
                      <TableHead className="text-xs font-bold text-center">Allocated Qty</TableHead>
                      <TableHead className="text-xs font-bold text-center">Distributed Qty</TableHead>
                      <TableHead className="text-xs font-bold text-center">Available Reserve</TableHead>
                      <TableHead className="text-xs font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {giftInventory.map((item) => {
                      const status = item.availableQty <= 10 ? "LOW STOCK" : "NORMAL";
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-bold text-xs text-zinc-950 dark:text-white">{item.giftName}</p>
                              <p className="text-[10px] text-zinc-400 font-semibold">{item.description || "No description"}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                            {formatCurrency(item.valuePerUnit)}
                          </TableCell>
                          <TableCell className="text-xs text-center font-semibold text-zinc-600 dark:text-zinc-400">
                            {item.totalStock}
                          </TableCell>
                          <TableCell className="text-xs text-center text-zinc-700 dark:text-zinc-350">
                            {item.allocatedQty}
                          </TableCell>
                          <TableCell className="text-xs text-center text-zinc-750 dark:text-zinc-300">
                            {item.distributedQty}
                          </TableCell>
                          <TableCell className="text-xs text-center font-bold text-zinc-900 dark:text-zinc-100">
                            {item.availableQty}
                          </TableCell>
                          <TableCell>
                            {status === "LOW STOCK" ? (
                              <Badge variant="destructive" className="text-[8px] font-bold py-0.5">
                                Low Stock
                              </Badge>
                            ) : (
                              <Badge variant="success" className="text-[8px] font-bold py-0.5">
                                Normal
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: MR Allocations */}
        <TabsContent value="allocations" className="mt-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Representative Allocation History</CardTitle>
              <CardDescription className="text-xs">View stock quantities transferred to Medical Representatives for clinical distribution.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-bold">Allocation ID</TableHead>
                      <TableHead className="text-xs font-bold">Representative</TableHead>
                      <TableHead className="text-xs font-bold">Gift Name</TableHead>
                      <TableHead className="text-xs font-bold">Allocated Qty</TableHead>
                      <TableHead className="text-xs font-bold">Distributed Qty</TableHead>
                      <TableHead className="text-xs font-bold">Remaining Custody</TableHead>
                      <TableHead className="text-xs font-bold">Date Transferred</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {giftAllocations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-zinc-500">
                          <Users2 className="h-10 w-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-700 stroke-[1.5]" />
                          <p className="text-xs font-semibold">No allocations created yet</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      giftAllocations.map((alloc) => {
                        const custody = alloc.allocatedQty - alloc.distributedQty;
                        return (
                          <TableRow key={alloc.id}>
                            <TableCell className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                              {alloc.id}
                            </TableCell>
                            <TableCell className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              {alloc.mrName}
                            </TableCell>
                            <TableCell className="text-xs font-semibold text-zinc-750 dark:text-zinc-300">
                              {alloc.giftName}
                            </TableCell>
                            <TableCell className="text-xs text-zinc-600 dark:text-zinc-400">
                              {alloc.allocatedQty}
                            </TableCell>
                            <TableCell className="text-xs text-zinc-600 dark:text-zinc-400">
                              {alloc.distributedQty}
                            </TableCell>
                            <TableCell className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              {custody}
                            </TableCell>
                            <TableCell className="text-xs text-zinc-500">
                              {alloc.dateAllocated}
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

      {/* Modal: Allocate Gift Modal */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">Allocate Stock to MR</h2>
              <button
                onClick={() => setShowAllocateModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleAllocationSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Select Gift Item</label>
                <select
                  required
                  value={selectedGiftId}
                  onChange={(e) => setSelectedGiftId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  <option value="">-- Choose Gift --</option>
                  {giftInventory
                    .filter((g) => g.availableQty > 0)
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.giftName} (Available: {g.availableQty})
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Select Representative</label>
                <select
                  required
                  value={selectedMrId}
                  onChange={(e) => setSelectedMrId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  <option value="">-- Choose MR --</option>
                  {reps.map((mr) => (
                    <option key={mr.id} value={mr.id}>
                      {mr.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Allocation Quantity</label>
                <Input
                  required
                  type="number"
                  min="1"
                  value={allocatedQty}
                  onChange={(e) => setAllocatedQty(Number(e.target.value))}
                  className="h-10 text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAllocateModal(false)}
                  className="h-9 text-xs font-semibold border-zinc-200 dark:border-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 text-white"
                >
                  Allocate Stock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

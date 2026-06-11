"use client";

import { useState, useMemo } from "react";
import {
  Layers,
  Search,
  AlertTriangle,
  AlertCircle,
  FileCheck,
  Activity,
  Trash2,
  Calendar,
  XCircle,
  ShieldCheck,
  CheckCircle
} from "lucide-react";
import useStore from "@/store";
import { Batch } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function BatchesPage() {
  const { batches, updateBatch, addInventoryTransaction, logActivity, addNotification } = useStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Filtered Batches
  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      const matchesSearch =
        b.brandName.toLowerCase().includes(search.toLowerCase()) ||
        b.batchNumber.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [batches, search, statusFilter]);

  // Expiry stats
  const expiredCount = batches.filter((b) => b.status === "Expired").length;
  const nearExpiryCount = batches.filter((b) => b.status === "Near Expiry").length;
  const healthyCount = batches.filter((b) => b.status === "Normal").length;

  const handleQuarantine = (batch: Batch) => {
    const qty = batch.availableQuantity;
    if (qty === 0) {
      alert("This batch is already empty.");
      return;
    }

    if (confirm(`Move all ${qty} units of batch ${batch.batchNumber} to quarantine? This will reduce available stock to zero.`)) {
      // Update batch quantity to 0
      updateBatch(batch.id, {
        availableQuantity: 0,
        status: "Expired"
      });

      // Log stock adjustment transaction
      addInventoryTransaction({
        type: "Stock Adjustment",
        productId: batch.productId,
        productName: batch.productName,
        batchNumber: batch.batchNumber,
        quantity: -qty,
        sourceWarehouse: "Warehouse Alpha (Main)",
        referenceNumber: `QAR-${Date.now().toString().substring(8)}`,
        remarks: `Quarantined & Discarded expired batch ${batch.batchNumber}`
      });

      addNotification(
        "error",
        "Stock Quarantined",
        `Batch ${batch.batchNumber} (${qty} units) moved to quarantine depot.`
      );
      logActivity(
        "Stock Quarantined",
        `Quarantined ${qty} units of ${batch.productName} (Batch: ${batch.batchNumber})`
      );
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Drug Batch & Expiry Tracking</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Monitor batch-wise stock longevity, verify manufacturing/expiry timestamps, and quarantine compromised inventory.
          </p>
        </div>
      </div>

      {/* Batch Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Expired Stock */}
        <Card className="border-rose-100 bg-rose-500/5 dark:border-rose-950/30 dark:bg-rose-950/15">
          <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-rose-800 dark:text-rose-400 uppercase">Expired Batches</CardTitle>
            <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-rose-700 dark:text-rose-400">{expiredCount}</div>
            <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-1">Requires immediate disposal logs</p>
          </CardContent>
        </Card>

        {/* Near Expiry */}
        <Card className="border-amber-100 bg-amber-500/5 dark:border-amber-950/30 dark:bg-amber-950/15">
          <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase">Near Expiry ({"<"}60 Days)</CardTitle>
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 animate-pulse-subtle" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{nearExpiryCount}</div>
            <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-1">Clear via distributor promos</p>
          </CardContent>
        </Card>

        {/* Active Healthy */}
        <Card className="border-emerald-100 bg-emerald-500/5 dark:border-emerald-950/30 dark:bg-emerald-950/15">
          <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase">Healthy batches</CardTitle>
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{healthyCount}</div>
            <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">Safe for billing distributions</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Options */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-80 relative flex items-center">
            <Input
              placeholder="Search batch number or brand name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="w-full md:w-auto">
            <Select
              className="text-xs font-semibold h-9 py-1 w-full sm:w-44"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Batches</option>
              <option value="Normal">Normal</option>
              <option value="Near Expiry">Near Expiry</option>
              <option value="Expired">Expired</option>
              <option value="Low Stock">Low Stock</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Batches Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-bold">Product Brand</TableHead>
                <TableHead className="text-xs font-bold">Batch Number</TableHead>
                <TableHead className="text-xs font-bold">Mfg Date</TableHead>
                <TableHead className="text-xs font-bold">Expiry Date</TableHead>
                <TableHead className="text-xs font-bold">MRP ($)</TableHead>
                <TableHead className="text-xs font-bold">Available Stock</TableHead>
                <TableHead className="text-xs font-bold">Longevity Status</TableHead>
                <TableHead className="text-xs font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-zinc-500">
                    <Layers className="h-10 w-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-700 stroke-[1.5]" />
                    <p className="text-xs font-semibold">No drug batches found</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Try relaxing your queries.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBatches.map((b) => {
                  return (
                    <TableRow key={b.id}>
                      <TableCell>
                        <div>
                          <p className="font-bold text-xs text-zinc-950 dark:text-white">{b.brandName}</p>
                          <p className="text-[10px] text-zinc-400 font-semibold">{b.productName}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                        {b.batchNumber}
                      </TableCell>
                      <TableCell className="text-xs text-zinc-500">
                        {b.manufacturingDate}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 flex items-center gap-1 mt-3">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                        {b.expiryDate}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        ${b.mrp.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs font-bold ${b.availableQuantity === 0 ? "text-zinc-400" : ""}`}>
                          {b.availableQuantity} / {b.quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        {b.status === "Normal" && (
                          <Badge variant="success" className="text-[9px] font-bold">
                            <CheckCircle className="h-3 w-3 mr-1" /> Safe Stock
                          </Badge>
                        )}
                        {b.status === "Near Expiry" && (
                          <Badge variant="warning" className="text-[9px] font-bold">
                            <AlertTriangle className="h-3 w-3 mr-1" /> Near Expiry
                          </Badge>
                        )}
                        {b.status === "Expired" && (
                          <Badge variant="destructive" className="text-[9px] font-bold">
                            <XCircle className="h-3 w-3 mr-1" /> Expired
                          </Badge>
                        )}
                        {b.status === "Low Stock" && (
                          <Badge variant="destructive" className="text-[9px] font-bold">
                            <AlertCircle className="h-3 w-3 mr-1" /> Critical Qty
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {b.availableQuantity > 0 && (b.status === "Expired" || b.status === "Near Expiry") ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-7 px-2.5 text-[10px] font-bold"
                            onClick={() => handleQuarantine(b)}
                          >
                            Quarantine
                          </Button>
                        ) : b.availableQuantity === 0 ? (
                          <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-600 italic">Quarantined</span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Dispatched Ready</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

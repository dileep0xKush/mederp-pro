"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  MoreVertical,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import useStore from "@/store";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ProductsPage() {
  const { products, suppliers, addProduct, updateProduct, deleteProduct, logActivity, addNotification } = useStore();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [moleculeFilter, setMoleculeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected products for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    brandName: "",
    genericName: "",
    molecule: "",
    strength: "",
    dosageForm: "Tablet",
    packing: "",
    manufacturer: "",
    supplierId: "",
    hsnCode: "",
    gstPercent: 12,
    tradeRate: 0,
    mrp: 0,
    doctorGiftScheme: "None",
    status: "Active" as "Active" | "Inactive"
  });

  // Unique Molecules list for filtering
  const moleculesList = useMemo(() => {
    const list = new Set(products.map((p) => p.molecule));
    return ["All", ...Array.from(list)];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.brandName.toLowerCase().includes(search.toLowerCase()) ||
        p.genericName.toLowerCase().includes(search.toLowerCase()) ||
        p.manufacturer.toLowerCase().includes(search.toLowerCase());
      const matchesMolecule = moleculeFilter === "All" || p.molecule === moleculeFilter;
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      return matchesSearch && matchesMolecule && matchesStatus;
    });
  }, [products, search, moleculeFilter, statusFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const supplier = suppliers.find(s => s.id === formData.supplierId);
    
    addProduct({
      brandName: formData.brandName,
      genericName: formData.genericName,
      molecule: formData.molecule,
      strength: formData.strength,
      dosageForm: formData.dosageForm,
      packing: formData.packing,
      manufacturer: formData.manufacturer,
      supplierId: formData.supplierId || "supp-1",
      supplierName: supplier ? supplier.name : "Cipla Distributors",
      hsnCode: formData.hsnCode,
      gstPercent: Number(formData.gstPercent),
      tradeRate: Number(formData.tradeRate),
      mrp: Number(formData.mrp),
      doctorGiftScheme: formData.doctorGiftScheme,
      status: formData.status
    });

    setIsAddOpen(false);
    resetForm();
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      brandName: product.brandName,
      genericName: product.genericName,
      molecule: product.molecule,
      strength: product.strength,
      dosageForm: product.dosageForm,
      packing: product.packing,
      manufacturer: product.manufacturer,
      supplierId: product.supplierId,
      hsnCode: product.hsnCode,
      gstPercent: product.gstPercent,
      tradeRate: product.tradeRate,
      mrp: product.mrp,
      doctorGiftScheme: product.doctorGiftScheme,
      status: product.status
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const supplier = suppliers.find(s => s.id === formData.supplierId);

    updateProduct(selectedProduct.id, {
      brandName: formData.brandName,
      genericName: formData.genericName,
      molecule: formData.molecule,
      strength: formData.strength,
      dosageForm: formData.dosageForm,
      packing: formData.packing,
      manufacturer: formData.manufacturer,
      supplierId: formData.supplierId,
      supplierName: supplier ? supplier.name : selectedProduct.supplierName,
      hsnCode: formData.hsnCode,
      gstPercent: Number(formData.gstPercent),
      tradeRate: Number(formData.tradeRate),
      mrp: Number(formData.mrp),
      doctorGiftScheme: formData.doctorGiftScheme,
      status: formData.status
    });

    addNotification("success", "Product Updated", `Brand "${formData.brandName}" details modified.`);
    logActivity("Product Updated", `Modified details for product: ${formData.brandName}`);
    setIsEditOpen(false);
    setSelectedProduct(null);
    resetForm();
  };

  const handleDeleteClick = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete the ${selectedIds.length} selected products?`)) {
      selectedIds.forEach((id) => deleteProduct(id));
      setSelectedIds([]);
    }
  };

  const resetForm = () => {
    setFormData({
      brandName: "",
      genericName: "",
      molecule: "",
      strength: "",
      dosageForm: "Tablet",
      packing: "",
      manufacturer: "",
      supplierId: suppliers[0]?.id || "",
      hsnCode: "",
      gstPercent: 12,
      tradeRate: 0,
      mrp: 0,
      doctorGiftScheme: "None",
      status: "Active"
    });
  };

  const handleExportCSV = () => {
    alert("Exporting catalog to CSV...");
    logActivity("Export Products", "Exported product catalog to CSV format.");
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Catalog Management</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Define drug molecules, strengths, HSN codes, schemes, and trade margins.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 font-semibold text-xs flex items-center gap-1.5" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            Export Catalog
          </Button>
          <Button size="sm" className="h-9 font-semibold text-xs flex items-center gap-1.5" onClick={() => { resetForm(); setIsAddOpen(true); }}>
            <Plus className="h-4 w-4 stroke-[2.5]" />
            New Product
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-80 relative flex items-center">
            <Input
              placeholder="Search brand, generic, or maker..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Molecule Filter */}
            <Select
              className="text-xs font-semibold h-9 py-1 w-full sm:w-44"
              value={moleculeFilter}
              onChange={(e) => setMoleculeFilter(e.target.value)}
            >
              <option value="All">All Molecules</option>
              {moleculesList.filter(m => m !== "All").map((mol) => (
                <option key={mol} value={mol}>{mol}</option>
              ))}
            </Select>

            {/* Status Filter */}
            <Select
              className="text-xs font-semibold h-9 py-1 w-full sm:w-36"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div className="bg-emerald-500/5 dark:bg-emerald-400/5 border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between text-xs animate-in fade-in-50 slide-in-from-top-1">
          <span className="font-semibold text-emerald-800 dark:text-emerald-400">
            Selected {selectedIds.length} items for bulk operations
          </span>
          <Button variant="destructive" size="sm" className="h-8 font-semibold text-[11px] flex items-center gap-1.5" onClick={handleBulkDelete}>
            <Trash2 className="h-3.5 w-3.5" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* Catalog Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={paginatedProducts.length > 0 && selectedIds.length === paginatedProducts.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </TableHead>
                <TableHead className="text-xs font-bold">Brand & Molecule</TableHead>
                <TableHead className="text-xs font-bold">Category & Packing</TableHead>
                <TableHead className="text-xs font-bold">HSN Code</TableHead>
                <TableHead className="text-xs font-bold">Trade Rate / MRP</TableHead>
                <TableHead className="text-xs font-bold">Doc Schemes</TableHead>
                <TableHead className="text-xs font-bold">Status</TableHead>
                <TableHead className="text-xs font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-zinc-500">
                    <SlidersHorizontal className="h-10 w-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-700 stroke-[1.5]" />
                    <p className="text-xs font-semibold">No products match your criteria</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Try resetting your queries or filters.</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((p) => {
                  const isChecked = selectedIds.includes(p.id);
                  return (
                    <TableRow key={p.id} className={isChecked ? "bg-emerald-500/5 dark:bg-emerald-400/5" : ""}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectOne(p.id, e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold text-xs text-zinc-950 dark:text-white">{p.brandName}</p>
                          <p className="text-[10px] text-zinc-400 font-semibold">{p.genericName} • {p.strength}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-xs text-zinc-700 dark:text-zinc-300">{p.dosageForm}</p>
                          <p className="text-[10px] text-zinc-500">{p.packing}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-zinc-500">{p.hsnCode}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">TR: ${p.tradeRate.toFixed(2)}</p>
                          <p className="text-[10px] text-emerald-600 font-bold">MRP: ${p.mrp.toFixed(2)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-zinc-500">{p.doctorGiftScheme}</TableCell>
                      <TableCell>
                        {p.status === "Active" ? (
                          <Badge variant="success" className="text-[9px] font-bold py-0.5">
                            <CheckCircle className="h-3 w-3 mr-1" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[9px] font-bold py-0.5">
                            <XCircle className="h-3 w-3 mr-1" /> Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-500 hover:text-zinc-950 dark:hover:text-white"
                            onClick={() => handleEditClick(p)}
                            title="Edit Product"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                            onClick={() => handleDeleteClick(p.id)}
                            title="Delete Product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="border-t border-zinc-100 dark:border-zinc-800 p-4 flex items-center justify-between text-xs text-zinc-500 select-none">
              <span>
                Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredProducts.length} items)
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Pharmaceutical Brand</DialogTitle>
            <DialogDescription>Define your new drug brand formulation and supply pricing rules.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Brand Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Brand Name</label>
                <Input
                  required
                  placeholder="Augmentin 625 DUO"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                />
              </div>

              {/* Generic Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Generic Formula Name</label>
                <Input
                  required
                  placeholder="Amoxicillin + Clavulanic Acid"
                  value={formData.genericName}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                />
              </div>

              {/* Molecule */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Molecule Classification</label>
                <Input
                  required
                  placeholder="Penicillin Antibiotics"
                  value={formData.molecule}
                  onChange={(e) => setFormData({ ...formData, molecule: e.target.value })}
                />
              </div>

              {/* Strength */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Strength</label>
                <Input
                  required
                  placeholder="625mg"
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                />
              </div>

              {/* Dosage Form */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Dosage Form</label>
                <Select
                  value={formData.dosageForm}
                  onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                >
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Ointment">Ointment</option>
                </Select>
              </div>

              {/* Packing */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Packing details</label>
                <Input
                  required
                  placeholder="10x10 Tablets"
                  value={formData.packing}
                  onChange={(e) => setFormData({ ...formData, packing: e.target.value })}
                />
              </div>

              {/* Manufacturer */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Manufacturer</label>
                <Input
                  required
                  placeholder="Cipla Ltd"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                />
              </div>

              {/* Supplier */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Preferred Supplier</label>
                <Select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
              </div>

              {/* HSN Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">HSN Code</label>
                <Input
                  required
                  placeholder="30049011"
                  value={formData.hsnCode}
                  onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                />
              </div>

              {/* GST Percent */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">GST Rate (%)</label>
                <Select
                  value={formData.gstPercent}
                  onChange={(e) => setFormData({ ...formData, gstPercent: Number(e.target.value) })}
                >
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18%</option>
                  <option value={28}>28%</option>
                </Select>
              </div>

              {/* Trade Rate */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Trade Rate ($)</label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  placeholder="45.00"
                  value={formData.tradeRate || ""}
                  onChange={(e) => setFormData({ ...formData, tradeRate: Number(e.target.value) })}
                />
              </div>

              {/* MRP */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">MRP ($)</label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  placeholder="78.00"
                  value={formData.mrp || ""}
                  onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                />
              </div>

              {/* Doctor Gift Scheme */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Doctor Gift Scheme</label>
                <Input
                  placeholder="Buy 10 Get 1 Free promo"
                  value={formData.doctorGiftScheme}
                  onChange={(e) => setFormData({ ...formData, doctorGiftScheme: e.target.value })}
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Status</label>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit">Create Product</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Brand Formulation</DialogTitle>
            <DialogDescription>Modify catalog configuration for brand formulation.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Brand Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Brand Name</label>
                <Input
                  required
                  placeholder="Augmentin 625 DUO"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                />
              </div>

              {/* Generic Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Generic Formula Name</label>
                <Input
                  required
                  placeholder="Amoxicillin + Clavulanic Acid"
                  value={formData.genericName}
                  onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                />
              </div>

              {/* Molecule */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Molecule Classification</label>
                <Input
                  required
                  placeholder="Penicillin Antibiotics"
                  value={formData.molecule}
                  onChange={(e) => setFormData({ ...formData, molecule: e.target.value })}
                />
              </div>

              {/* Strength */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Strength</label>
                <Input
                  required
                  placeholder="625mg"
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                />
              </div>

              {/* Dosage Form */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Dosage Form</label>
                <Select
                  value={formData.dosageForm}
                  onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                >
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Ointment">Ointment</option>
                </Select>
              </div>

              {/* Packing */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Packing details</label>
                <Input
                  required
                  placeholder="10x10 Tablets"
                  value={formData.packing}
                  onChange={(e) => setFormData({ ...formData, packing: e.target.value })}
                />
              </div>

              {/* Manufacturer */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Manufacturer</label>
                <Input
                  required
                  placeholder="Cipla Ltd"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                />
              </div>

              {/* Supplier */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Preferred Supplier</label>
                <Select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
              </div>

              {/* HSN Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">HSN Code</label>
                <Input
                  required
                  placeholder="30049011"
                  value={formData.hsnCode}
                  onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                />
              </div>

              {/* GST Percent */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">GST Rate (%)</label>
                <Select
                  value={formData.gstPercent}
                  onChange={(e) => setFormData({ ...formData, gstPercent: Number(e.target.value) })}
                >
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18%</option>
                  <option value={28}>28%</option>
                </Select>
              </div>

              {/* Trade Rate */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Trade Rate ($)</label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  placeholder="45.00"
                  value={formData.tradeRate || ""}
                  onChange={(e) => setFormData({ ...formData, tradeRate: Number(e.target.value) })}
                />
              </div>

              {/* MRP */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">MRP ($)</label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  placeholder="78.00"
                  value={formData.mrp || ""}
                  onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                />
              </div>

              {/* Doctor Gift Scheme */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Doctor Gift Scheme</label>
                <Input
                  placeholder="Buy 10 Get 1 Free promo"
                  value={formData.doctorGiftScheme}
                  onChange={(e) => setFormData({ ...formData, doctorGiftScheme: e.target.value })}
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Status</label>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => { setIsEditOpen(false); setSelectedProduct(null); }}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

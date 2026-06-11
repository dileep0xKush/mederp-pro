"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Stethoscope,
  Building,
  Mail,
  Phone,
  Calendar,
  Gift,
  PlusCircle,
  FileText,
  User,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  MapPin,
  Tag
} from "lucide-react";
import useStore from "@/store";
import { Doctor } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

export default function DoctorCrmPage() {
  const {
    doctors,
    visitRecords,
    giftInventory,
    addDoctor,
    logDoctorVisit,
    logActivity,
    addNotification
  } = useStore();

  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");

  // Selection for detailed view
  const [activeDoctor, setActiveDoctor] = useState<Doctor | null>(null);

  // Dialog modals
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [isLogCallOpen, setIsLogCallOpen] = useState(false);

  // Add Doctor Form
  const [docFormData, setDocFormData] = useState({
    name: "",
    specialty: "Cardiologist",
    hospital: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
    zone: "North",
    category: "A" as "A" | "B" | "C"
  });

  // Log Call Visit Form
  const [callFormData, setCallFormData] = useState({
    type: "Routine" as "Routine" | "Product Launch" | "Scheme Presentation",
    feedback: "",
    sampleName: "",
    sampleQty: 0,
    giftName: "",
    giftQty: 0,
    nextFollowUpDate: ""
  });

  const filteredDoctors = useMemo(() => {
    return doctors.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.specialty.toLowerCase().includes(search.toLowerCase()) ||
        d.hospital.toLowerCase().includes(search.toLowerCase());
      const matchesZone = zoneFilter === "All" || d.zone === zoneFilter;
      const matchesCat = catFilter === "All" || d.category === catFilter;
      return matchesSearch && matchesZone && matchesCat;
    });
  }, [doctors, search, zoneFilter, catFilter]);

  // Visit history for currently selected doctor
  const activeDocVisits = useMemo(() => {
    if (!activeDoctor) return [];
    return visitRecords.filter((v) => v.doctorId === activeDoctor.id);
  }, [visitRecords, activeDoctor]);

  const handleAddDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDoctor(docFormData);
    setIsAddDocOpen(false);
    setDocFormData({
      name: "",
      specialty: "Cardiologist",
      hospital: "",
      mobile: "",
      email: "",
      address: "",
      city: "",
      zone: "North",
      category: "A"
    });
  };

  const handleLogCallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoctor) return;

    logDoctorVisit({
      doctorId: activeDoctor.id,
      doctorName: activeDoctor.name,
      type: callFormData.type,
      feedback: callFormData.feedback,
      samplesDistributed: callFormData.sampleName
        ? [{ productName: callFormData.sampleName, quantity: Number(callFormData.sampleQty) }]
        : [],
      giftsGiven: callFormData.giftName
        ? [{ giftName: callFormData.giftName, quantity: Number(callFormData.giftQty) }]
        : [],
      nextFollowUpDate: callFormData.nextFollowUpDate || undefined
    });

    setIsLogCallOpen(false);
    setCallFormData({
      type: "Routine",
      feedback: "",
      sampleName: "",
      sampleQty: 0,
      giftName: "",
      giftQty: 0,
      nextFollowUpDate: ""
    });

    // Refresh active doctor object to update visit count in drawer
    const updated = useStore.getState().doctors.find((d) => d.id === activeDoctor.id);
    if (updated) setActiveDoctor(updated);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Doctor CRM Master</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Manage medical practitioner directories, track representative calls, log feedback, and monitor free sample giveaways.
          </p>
        </div>
        <div>
          <Button size="sm" className="h-9 font-semibold text-xs flex items-center gap-1.5" onClick={() => setIsAddDocOpen(true)}>
            <Plus className="h-4 w-4 stroke-[2.5]" />
            New Doctor Entry
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main List Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="w-full sm:w-72 relative flex items-center">
                <Input
                  placeholder="Search doctor, hospital, clinic..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  icon={<Search className="h-4 w-4" />}
                  className="h-9"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Select
                  className="text-xs font-semibold h-9 py-1 w-full sm:w-32"
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                >
                  <option value="All">All Zones</option>
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                </Select>

                <Select
                  className="text-xs font-semibold h-9 py-1 w-full sm:w-32"
                  value={catFilter}
                  onChange={(e) => setCatFilter(e.target.value)}
                >
                  <option value="All">All Tiers</option>
                  <option value="A">Tier A (VIP)</option>
                  <option value="B">Tier B (Medium)</option>
                  <option value="C">Tier C (Low)</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-bold">Doctor Details</TableHead>
                    <TableHead className="text-xs font-bold">Specialty</TableHead>
                    <TableHead className="text-xs font-bold">Clinic/Hospital</TableHead>
                    <TableHead className="text-xs font-bold text-center">Visits Count</TableHead>
                    <TableHead className="text-xs font-bold">Last Visit</TableHead>
                    <TableHead className="text-xs font-bold text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-zinc-500">
                        <Stethoscope className="h-10 w-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-700 stroke-[1.5]" />
                        <p className="text-xs font-semibold">No doctors found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDoctors.map((doc) => {
                      const isActive = activeDoctor?.id === doc.id;
                      return (
                        <TableRow
                          key={doc.id}
                          className={`cursor-pointer transition-colors ${isActive ? "bg-emerald-500/5 dark:bg-emerald-400/5" : ""}`}
                          onClick={() => setActiveDoctor(doc)}
                        >
                          <TableCell>
                            <div>
                              <p className="font-bold text-xs text-zinc-950 dark:text-white flex items-center gap-1.5">
                                {doc.name}
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                  doc.category === "A" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400" :
                                  doc.category === "B" ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400" :
                                  "bg-zinc-100 text-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-400"
                                }`}>Tier {doc.category}</span>
                              </p>
                              <p className="text-[10px] text-zinc-400 font-semibold">{doc.city} ({doc.zone} Zone)</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                            {doc.specialty}
                          </TableCell>
                          <TableCell className="text-xs text-zinc-500 max-w-[150px] truncate">
                            {doc.hospital}
                          </TableCell>
                          <TableCell className="text-xs text-center font-bold text-zinc-950 dark:text-zinc-200">
                            {doc.visitsCount}
                          </TableCell>
                          <TableCell className="text-xs text-zinc-500">
                            {doc.lastVisitDate || "Not Visited Yet"}
                          </TableCell>
                          <TableCell className="text-right">
                            <ChevronRight className={`h-4 w-4 ml-auto text-zinc-400 transition-transform ${isActive ? "translate-x-1 text-emerald-500" : ""}`} />
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

        {/* Doctor Details Drawer Card (Right Panel) */}
        <div className="lg:col-span-1">
          {activeDoctor ? (
            <Card className="sticky top-20 border-emerald-500/20 dark:border-emerald-500/10 shadow-lg animate-in fade-in-50 slide-in-from-right-2 duration-200">
              <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 items-center">
                    <div className="h-10 w-10 rounded-full bg-emerald-500 text-zinc-950 font-bold flex items-center justify-center text-sm shadow-md shadow-emerald-500/10">
                      {activeDoctor.name.split(" ").slice(-1)[0][0] || "D"}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">{activeDoctor.name}</CardTitle>
                      <CardDescription className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {activeDoctor.specialty}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-bold">Tier {activeDoctor.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-4 text-xs">
                {/* Contact Card */}
                <div className="space-y-2.5">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Contact Directory</h4>
                  <div className="space-y-1.5 text-zinc-600 dark:text-zinc-300">
                    <p className="flex items-center gap-2">
                      <Building className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                      <span className="truncate">{activeDoctor.hospital}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                      <span>{activeDoctor.mobile}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                      <span className="truncate">{activeDoctor.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                      <span>{activeDoctor.address}, {activeDoctor.city}</span>
                    </p>
                  </div>
                </div>

                {/* Prescribed Molecules */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Prescribed Brand Molecules</h4>
                  <div className="flex flex-wrap gap-1">
                    {activeDoctor.prescribingMolecules.length === 0 ? (
                      <span className="text-[10px] text-zinc-400 italic">None logged yet</span>
                    ) : (
                      activeDoctor.prescribingMolecules.map((m) => (
                        <Badge key={m} variant="secondary" className="text-[9px] font-semibold py-0.5">{m}</Badge>
                      ))
                    )}
                  </div>
                </div>

                {/* Visits History */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Visit History Log</h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                      onClick={() => setIsLogCallOpen(true)}
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      Log Call
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {activeDocVisits.length === 0 ? (
                      <p className="text-[10px] text-zinc-400 italic text-center py-4">No visits logged for this doctor</p>
                    ) : (
                      activeDocVisits.map((visit) => (
                        <div key={visit.id} className="bg-zinc-50 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 space-y-1.5">
                          <div className="flex items-center justify-between text-[9px] text-zinc-400 font-semibold">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {visit.date}
                            </span>
                            <span className="text-zinc-500 font-bold">{visit.type}</span>
                          </div>
                          <p className="text-[10px] text-zinc-600 dark:text-zinc-300 leading-normal">{visit.feedback}</p>
                          
                          {/* Samples/Gifts details */}
                          {(visit.samplesDistributed.length > 0 || visit.giftsGiven.length > 0) && (
                            <div className="pt-1.5 border-t border-zinc-200/50 dark:border-zinc-800/50 flex flex-wrap gap-1">
                              {visit.samplesDistributed.map((s) => (
                                <span key={s.productName} className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 px-1 py-0.5 rounded">
                                  Sample: {s.productName} (x{s.quantity})
                                </span>
                              ))}
                              {visit.giftsGiven.map((g) => (
                                <span key={g.giftName} className="text-[9px] font-semibold text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20 px-1 py-0.5 rounded flex items-center gap-0.5">
                                  <Gift className="h-2.5 w-2.5" />
                                  Gift: {g.giftName}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-zinc-200 dark:border-zinc-800 p-8 text-center h-full flex flex-col items-center justify-center text-zinc-400">
              <User className="h-8 w-8 mb-2 stroke-[1.5] text-zinc-300 dark:text-zinc-700" />
              <p className="text-xs font-semibold">No Doctor Selected</p>
              <p className="text-[10px] text-zinc-400/80 mt-1 max-w-[200px] mx-auto">Select a doctor from the list to view visit records and profile detail directories.</p>
            </Card>
          )}
        </div>
      </div>

      {/* Add Doctor Dialog */}
      <Dialog open={isAddDocOpen} onOpenChange={setIsAddDocOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Doctor CRM Record</DialogTitle>
            <DialogDescription>Register a new clinic or hospital practitioner into the master directory.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddDocSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 font-medium">Doctor Name</label>
              <Input
                required
                placeholder="Dr. Rajesh Khanna"
                value={docFormData.name}
                onChange={(e) => setDocFormData({ ...docFormData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 font-medium">Specialty</label>
                <Select
                  value={docFormData.specialty}
                  onChange={(e) => setDocFormData({ ...docFormData, specialty: e.target.value })}
                >
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="General Physician">General Physician</option>
                  <option value="Diabetologist">Diabetologist</option>
                  <option value="Orthopedic">Orthopedic</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 font-medium">Practitioner Tier</label>
                <Select
                  value={docFormData.category}
                  onChange={(e) => setDocFormData({ ...docFormData, category: e.target.value as "A" | "B" | "C" })}
                >
                  <option value="A">Tier A (VIP)</option>
                  <option value="B">Tier B (Regular)</option>
                  <option value="C">Tier C (Low Priority)</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 font-medium">Zone</label>
                <Select
                  value={docFormData.zone}
                  onChange={(e) => setDocFormData({ ...docFormData, zone: e.target.value })}
                >
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 font-medium">City</label>
                <Input
                  required
                  placeholder="New Delhi"
                  value={docFormData.city}
                  onChange={(e) => setDocFormData({ ...docFormData, city: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 font-medium">Hospital/Clinic Name</label>
              <Input
                required
                placeholder="Max Healthcare Saket"
                value={docFormData.hospital}
                onChange={(e) => setDocFormData({ ...docFormData, hospital: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 font-medium">Mobile Number</label>
                <Input
                  required
                  placeholder="+91 99112 23344"
                  value={docFormData.mobile}
                  onChange={(e) => setDocFormData({ ...docFormData, mobile: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 font-medium">Email Address</label>
                <Input
                  required
                  type="email"
                  placeholder="rajesh@max.com"
                  value={docFormData.email}
                  onChange={(e) => setDocFormData({ ...docFormData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 font-medium">Clinic Address</label>
              <Input
                required
                placeholder="Press Club Road, Block-G"
                value={docFormData.address}
                onChange={(e) => setDocFormData({ ...docFormData, address: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddDocOpen(false)}>Cancel</Button>
              <Button type="submit">Register Doctor</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Log Call Visit Dialog */}
      <Dialog open={isLogCallOpen} onOpenChange={setIsLogCallOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Daily Visit Call Report</DialogTitle>
            <DialogDescription>Submit visit notes, samples, and gifts distributed to <strong>{activeDoctor?.name}</strong>.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogCallSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Call Type</label>
                <Select
                  value={callFormData.type}
                  onChange={(e) => setCallFormData({ ...callFormData, type: e.target.value as any })}
                >
                  <option value="Routine">Routine Visit</option>
                  <option value="Product Launch">Product Launch</option>
                  <option value="Scheme Presentation">Scheme Presentation</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Follow-up Date</label>
                <Input
                  type="date"
                  value={callFormData.nextFollowUpDate}
                  onChange={(e) => setCallFormData({ ...callFormData, nextFollowUpDate: e.target.value })}
                />
              </div>
            </div>

            {/* Drug Sample distributed */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Distributed Drug Sample</label>
                <Select
                  value={callFormData.sampleName}
                  onChange={(e) => setCallFormData({ ...callFormData, sampleName: e.target.value })}
                >
                  <option value="">-- No Samples --</option>
                  <option value="Ciprodac 500">Ciprodac 500</option>
                  <option value="Paracip 650">Paracip 650</option>
                  <option value="Augmentin 625">Augmentin 625</option>
                  <option value="Atorva 10">Atorva 10</option>
                  <option value="Glycomet GP2">Glycomet GP2</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Sample Qty</label>
                <Input
                  type="number"
                  min={0}
                  value={callFormData.sampleQty || ""}
                  onChange={(e) => setCallFormData({ ...callFormData, sampleQty: Number(e.target.value) })}
                  disabled={!callFormData.sampleName}
                />
              </div>
            </div>

            {/* Gift given */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Allotted Doctor Gift</label>
                <Select
                  value={callFormData.giftName}
                  onChange={(e) => setCallFormData({ ...callFormData, giftName: e.target.value })}
                >
                  <option value="">-- No Gifts --</option>
                  {giftInventory.map((g) => (
                    <option key={g.id} value={g.giftName}>{g.giftName}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Gift Qty</label>
                <Input
                  type="number"
                  min={0}
                  value={callFormData.giftQty || ""}
                  onChange={(e) => setCallFormData({ ...callFormData, giftQty: Number(e.target.value) })}
                  disabled={!callFormData.giftName}
                />
              </div>
            </div>

            {/* Feedback notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Call Feedback & Notes</label>
              <Input
                required
                placeholder="Doctor agreed to prescribe Atorva. Requested clinical trial sheets."
                value={callFormData.feedback}
                onChange={(e) => setCallFormData({ ...callFormData, feedback: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsLogCallOpen(false)}>Cancel</Button>
              <Button type="submit">Submit Call Log</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

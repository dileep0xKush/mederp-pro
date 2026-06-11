"use client";

import { useState, useMemo } from "react";
import {
  Users2,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  TrendingUp,
  Award,
  Wallet,
  FileCheck,
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Map
} from "lucide-react";
import useStore from "@/store";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function MRManagementPage() {
  const {
    mrReports,
    mrTourPlans,
    approveMRReport,
    rejectMRReport,
    approveTourPlan,
    rejectTourPlan,
    addNotification,
    logActivity
  } = useStore();

  const [activeTab, setActiveTab] = useState("activity-logs");

  // Summaries
  const totalVisitsCount = mrReports.reduce((acc, curr) => acc + curr.doctorsVisited.length + curr.chemistVisitsCount, 0);
  const totalExpensesClaimed = mrReports.reduce((acc, curr) => acc + curr.totalExpense, 0);
  const pendingReportsCount = mrReports.filter((r) => r.status === "Pending Approval").length;
  const pendingTourPlansCount = mrTourPlans.filter((t) => t.status === "Submitted").length;

  const handleApproveReport = (id: string, name: string) => {
    approveMRReport(id);
    addNotification("success", "MR Activity Approved", `Approved expense claim for ${name}.`);
    logActivity("MR Activity Approved", `Approved daily activity log expenses for ${name}`);
  };

  const handleRejectReport = (id: string, name: string) => {
    rejectMRReport(id);
    addNotification("warning", "MR Activity Rejected", `Rejected expense claim for ${name}.`);
    logActivity("MR Activity Rejected", `Rejected daily activity log expenses for ${name}`);
  };

  const handleApproveTour = (id: string, name: string) => {
    approveTourPlan(id);
    addNotification("success", "Tour Plan Approved", `Approved MR ${name}'s travel itinerary route.`);
    logActivity("Tour Plan Approved", `Approved tour plan ${id} for ${name}`);
  };

  const handleRejectTour = (id: string, name: string) => {
    rejectTourPlan(id);
    addNotification("warning", "Tour Plan Rejected", `Rejected MR ${name}'s travel itinerary route.`);
    logActivity("Tour Plan Rejected", `Rejected tour plan ${id} for ${name}`);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">MR Field Force Management</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Monitor Medical Representatives tour plans, approve daily travel logs, verify doctor samples, and authorize reimbursement claims.
          </p>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total doctor calls */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Field Calls Logged</CardTitle>
            <Users2 className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisitsCount}</div>
            <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-semibold flex items-center">
                <TrendingUp className="h-3 w-3" /> +15.5%
              </span>
              weekly coverage growth
            </p>
          </CardContent>
        </Card>

        {/* Expenses Claimed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Total Field Expenses</CardTitle>
            <Wallet className="h-5 w-5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpensesClaimed)}</div>
            <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
              <span className="text-zinc-700 dark:text-zinc-300 font-semibold flex items-center">
                <Clock className="h-3 w-3 mr-0.5" /> 24 Hrs
              </span>
              average approval window
            </p>
          </CardContent>
        </Card>

        {/* Pending Activity Logs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Pending Expense Logs</CardTitle>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingReportsCount}</div>
            <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-1 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Awaiting manager review
            </p>
          </CardContent>
        </Card>

        {/* Pending Tour Plans */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-zinc-500 uppercase">Pending Tour Plans</CardTitle>
            <Map className="h-5 w-5 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">{pendingTourPlansCount}</div>
            <p className="text-[10px] text-sky-600/80 dark:text-sky-400/80 mt-1 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
              Target routes checklist
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-80 grid-cols-2">
          <TabsTrigger value="activity-logs" className="flex items-center gap-1.5 font-bold text-xs">
            <FileCheck className="h-4 w-4" />
            Daily Activity Logs
          </TabsTrigger>
          <TabsTrigger value="tour-plans" className="flex items-center gap-1.5 font-bold text-xs">
            <MapPin className="h-4 w-4" />
            Tour Route Plans
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Daily Activity Logs */}
        <TabsContent value="activity-logs" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-bold">MR Expense Reimbursements</CardTitle>
              <CardDescription className="text-xs">Authorize or reject daily travel receipts and doctor call logs</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-bold">Date & Representative</TableHead>
                    <TableHead className="text-xs font-bold">Coverage Calls</TableHead>
                    <TableHead className="text-xs font-bold">Samples Distributed</TableHead>
                    <TableHead className="text-xs font-bold">Gifts Distributed</TableHead>
                    <TableHead className="text-xs font-bold">Reimbursement Slip</TableHead>
                    <TableHead className="text-xs font-bold">Approval Status</TableHead>
                    <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mrReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-zinc-500">
                        <Users2 className="h-10 w-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-700 stroke-[1.5]" />
                        <p className="text-xs font-semibold">No representative activity reports logged</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    mrReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div>
                            <p className="font-bold text-xs text-zinc-950 dark:text-white">{report.mrName}</p>
                            <p className="text-[10px] text-zinc-400 font-semibold">{report.date}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                          <div className="space-y-0.5">
                            <p>Drs: {report.doctorsVisited.join(", ")}</p>
                            <p className="text-[10px] text-zinc-500 font-semibold">Chemists Visited: {report.chemistVisitsCount}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {(!report.samplesDistributed || report.samplesDistributed.length === 0) ? (
                            <span className="text-[10px] text-zinc-400 italic">None</span>
                          ) : (
                            report.samplesDistributed.map((s) => (
                              <Badge key={s.productName} variant="secondary" className="text-[8px] font-semibold py-0 mr-1 mt-1">
                                {s.productName} (x{s.quantity})
                              </Badge>
                            ))
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          {(!report.giftsGiven || report.giftsGiven.length === 0) ? (
                            <span className="text-[10px] text-zinc-400 italic">None</span>
                          ) : (
                            report.giftsGiven.map((g) => (
                              <Badge key={g.giftName} variant="secondary" className="text-[8px] font-semibold py-0 mr-1 mt-1 text-amber-700 dark:text-amber-400">
                                {g.giftName} (x{g.quantity})
                              </Badge>
                            ))
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          {formatCurrency(report.totalExpense)}
                          <p className="text-[9px] text-zinc-400 font-semibold">
                            Travel: ${report.expenses.find((e) => e.type === "Travel")?.amount || 0} | Food: ${report.expenses.find((e) => e.type === "Food")?.amount || 0}
                          </p>
                        </TableCell>
                        <TableCell>
                          {report.status === "Approved" && (
                            <Badge variant="success" className="text-[9px] font-bold py-0.5">
                              <CheckCircle className="h-3 w-3 mr-1" /> Approved
                            </Badge>
                          )}
                          {report.status === "Pending Approval" && (
                            <Badge variant="warning" className="text-[9px] font-bold py-0.5">
                              <Clock className="h-3 w-3 mr-1" /> Pending Review
                            </Badge>
                          )}
                          {report.status === "Rejected" && (
                            <Badge variant="destructive" className="text-[9px] font-bold py-0.5">
                              <XCircle className="h-3 w-3 mr-1" /> Rejected
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {report.status === "Pending Approval" ? (
                            <div className="flex justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[10px] font-bold text-rose-500 hover:bg-rose-50 border-rose-200/50 dark:hover:bg-rose-950/20 dark:border-rose-900/40"
                                onClick={() => handleRejectReport(report.id, report.mrName)}
                              >
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 text-white"
                                onClick={() => handleApproveReport(report.id, report.mrName)}
                              >
                                Approve
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-semibold italic">Processed</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Tour Plans */}
        <TabsContent value="tour-plans" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-bold">Subdivision Monthly Tour Plans</CardTitle>
              <CardDescription className="text-xs">Verify planned travel routes, cities, and doctor list targets.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-bold">Plan Details</TableHead>
                    <TableHead className="text-xs font-bold">Representative</TableHead>
                    <TableHead className="text-xs font-bold">Month & Year</TableHead>
                    <TableHead className="text-xs font-bold">Target Outstation Cities</TableHead>
                    <TableHead className="text-xs font-bold text-center">Doctors Target</TableHead>
                    <TableHead className="text-xs font-bold">Approval Status</TableHead>
                    <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mrTourPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                        {plan.id}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-zinc-950 dark:text-white">
                        {plan.mrName}
                      </TableCell>
                      <TableCell className="text-xs text-zinc-500">
                        {plan.month}
                      </TableCell>
                      <TableCell className="text-xs text-zinc-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                          {plan.routes.map((r) => r.town).join(" → ")}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-center font-bold text-zinc-900 dark:text-zinc-200">
                        {plan.targetCalls}
                      </TableCell>
                      <TableCell>
                        {plan.status === "Approved" && (
                          <Badge variant="success" className="text-[9px] font-bold py-0.5">
                            <CheckCircle className="h-3 w-3 mr-1" /> Approved
                          </Badge>
                        )}
                        {plan.status === "Submitted" && (
                          <Badge variant="warning" className="text-[9px] font-bold py-0.5">
                            <Clock className="h-3 w-3 mr-1" /> Submitted
                          </Badge>
                        )}
                        {plan.status === "Rejected" && (
                          <Badge variant="destructive" className="text-[9px] font-bold py-0.5">
                            <XCircle className="h-3 w-3 mr-1" /> Rejected
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {plan.status === "Submitted" ? (
                          <div className="flex justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[10px] font-bold text-rose-500 hover:bg-rose-50 border-rose-200/50 dark:hover:bg-rose-950/20"
                              onClick={() => handleRejectTour(plan.id, plan.mrName)}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 text-white"
                              onClick={() => handleApproveTour(plan.id, plan.mrName)}
                            >
                              Approve
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-semibold italic">Processed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

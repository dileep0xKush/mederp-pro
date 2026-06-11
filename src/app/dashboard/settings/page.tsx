"use client";

import { useState } from "react";
import {
  Settings,
  ShieldAlert,
  User,
  Key,
  Database,
  Smartphone,
  Globe,
  Trash2,
  Lock,
  FileSpreadsheet,
  CheckCircle,
  Activity,
  History,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import useStore from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const {
    currentUser,
    auditLogs,
    addNotification,
    logActivity
  } = useStore();

  const [activeTab, setActiveTab] = useState("profile");

  // Form States
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || "Dr. Vikram Mehra",
    email: currentUser?.email || "vikram@mederppro.com",
    mobile: currentUser?.mobile || "+91 98765 43210",
    company: currentUser?.companyName || "MedERP Pro Ltd"
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [is2FAEnabled, setIs2FAEnabled] = useState(currentUser?.is2FAEnabled || false);

  // Mock Active Sessions
  const [sessions, setSessions] = useState([
    { id: "sess-1", ip: "192.168.1.45", browser: "Chrome on macOS", location: "Mumbai, IN", current: true, date: "Active Now" },
    { id: "sess-2", ip: "103.88.22.10", browser: "Safari on iPhone 15", location: "Pune, IN", current: false, date: "2 hours ago" },
    { id: "sess-3", ip: "115.112.90.3", browser: "Firefox on Windows 11", location: "New Delhi, IN", current: false, date: "3 days ago" }
  ]);

  // Handle Profile Update
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    addNotification("success", "Profile Saved", "Personal details successfully saved.");
    logActivity("Profile Updated", "Modified name and mobile settings in profile.");
    alert("Profile saved successfully!");
  };

  // Handle Password Change
  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    addNotification("success", "Password Updated", "Security password updated successfully.");
    logActivity("Password Changed", "Updated credentials via security panel.");
    alert("Password updated successfully!");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  // Revoke Session
  const handleRevokeSession = (id: string, browser: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    addNotification("warning", "Session Revoked", `Revoked session on ${browser}`);
    logActivity("Session Revoked", `Terminated access token for IP ${id}`);
  };

  // Toggle 2FA
  const handle2FAToggle = () => {
    const nextState = !is2FAEnabled;
    setIs2FAEnabled(nextState);
    if (nextState) {
      addNotification("success", "2FA Activated", "Two-Factor verification enabled.");
      logActivity("2FA Setup", "Configured Google Authenticator TOTP token.");
      alert("2FA Setup QR code generated. Verify with Google Authenticator.");
    } else {
      addNotification("warning", "2FA Disabled", "Two-Factor authentication turned off.");
      logActivity("2FA Off", "Disabled two-factor security.");
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Settings & Controls</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Configure profile credentials, manage active logins, audit user access events, and setup permissions.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full sm:w-[500px] grid-cols-4">
          <TabsTrigger value="profile" className="text-xs font-bold">Profile</TabsTrigger>
          <TabsTrigger value="sessions" className="text-xs font-bold font-mono">Sessions</TabsTrigger>
          <TabsTrigger value="rbac" className="text-xs font-bold">RBAC Gate</TabsTrigger>
          <TabsTrigger value="audits" className="text-xs font-bold">Audit Logs</TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile & Security */}
        <TabsContent value="profile" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Update */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Company Profile Settings</CardTitle>
                <CardDescription className="text-xs">Update your core personal and company directory details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Your Name</label>
                      <Input
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Company Name</label>
                      <Input
                        value={profileForm.company}
                        onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Mobile Number</label>
                      <Input
                        value={profileForm.mobile}
                        onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Email Address</label>
                      <Input
                        disabled
                        value={profileForm.email}
                        className="opacity-60 bg-zinc-100 dark:bg-zinc-800"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="h-9 text-xs font-bold">Save Profile Changes</Button>
                </form>
              </CardContent>
            </Card>

            {/* Change Password & 2FA */}
            <div className="space-y-6">
              {/* 2FA Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Two-Factor Authentication (2FA)</CardTitle>
                  <CardDescription className="text-xs">Secure login access via authenticator token slips</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4.5 w-4.5 text-zinc-400" />
                      <span className="text-xs font-semibold">TOTP Verification Code</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={is2FAEnabled}
                      onChange={handle2FAToggle}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 rounded border-zinc-300 cursor-pointer"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-normal">
                    When enabled, signing in will require a one-time OTP generated inside Google Authenticator or Microsoft Authenticator app.
                  </p>
                </CardContent>
              </Card>

              {/* Password Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSave} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400">Current Password</label>
                      <Input
                        required
                        type="password"
                        placeholder="••••••••"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400">New Password</label>
                      <Input
                        required
                        type="password"
                        placeholder="••••••••"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400">Confirm Password</label>
                      <Input
                        required
                        type="password"
                        placeholder="••••••••"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <Button type="submit" className="w-full h-8 text-xs font-bold mt-2">Update Credentials</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Sessions */}
        <TabsContent value="sessions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Active User Login Sessions</CardTitle>
              <CardDescription className="text-xs">Monitor and revoke devices logged into your company account</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-bold">Device / Browser</TableHead>
                    <TableHead className="text-xs font-bold">IP Address</TableHead>
                    <TableHead className="text-xs font-bold">Geographic Location</TableHead>
                    <TableHead className="text-xs font-bold">Last Active Date</TableHead>
                    <TableHead className="text-xs font-bold text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((sess) => (
                    <TableRow key={sess.id}>
                      <TableCell className="text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-zinc-400" />
                          <span>{sess.browser}</span>
                          {sess.current && (
                            <Badge variant="success" className="text-[8px] font-bold py-0">Current</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-zinc-500">{sess.ip}</TableCell>
                      <TableCell className="text-xs text-zinc-600 dark:text-zinc-400">{sess.location}</TableCell>
                      <TableCell className="text-xs text-zinc-500">{sess.date}</TableCell>
                      <TableCell className="text-right">
                        {!sess.current ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                            onClick={() => handleRevokeSession(sess.id, sess.browser)}
                            title="Revoke Session"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="text-[10px] text-zinc-400 italic">Self</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: RBAC Configuration */}
        <TabsContent value="rbac" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Role-Based Access Permissions Matrix</CardTitle>
              <CardDescription className="text-xs">Configure system module filters against ERP User Roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Role matrix explanation */}
              <div className="flex gap-3 items-center p-3 rounded-lg bg-zinc-50 border border-zinc-200/60 dark:bg-zinc-900/60 dark:border-zinc-800/80 text-xs text-zinc-500">
                <ShieldCheck className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <p>
                  <strong>Active RBAC:</strong> The sidebar menu and sub-pages filter automatically based on active roles. Use the role switcher in the header to simulate other permissions in real-time.
                </p>
              </div>

              {/* Roles matrix table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-bold">Modules</TableHead>
                    <TableHead className="text-xs font-bold text-center">Super Admin</TableHead>
                    <TableHead className="text-xs font-bold text-center">Store Manager</TableHead>
                    <TableHead className="text-xs font-bold text-center">MR Rep</TableHead>
                    <TableHead className="text-xs font-bold text-center">Accountant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {[
                    { module: "Dashboard KPI Overview", r1: true, r2: true, r3: true, r4: true },
                    { module: "Product Master Catalog", r1: true, r2: true, r3: false, r4: false },
                    { module: "Batch Track & Quarantine", r1: true, r2: true, r3: false, r4: false },
                    { module: "Inventory Log Transfers", r1: true, r2: true, r3: false, r4: false },
                    { module: "Purchase Orders", r1: true, r2: false, r3: false, r4: true },
                    { module: "Sales & Invoicing", r1: true, r2: false, r3: false, r4: true },
                    { module: "Doctor CRM Directories", r1: true, r2: false, r3: true, r4: false },
                    { module: "MR Call Activity Approval", r1: true, r2: false, r3: false, r4: false },
                    { module: "Gift Inventory Allocation", r1: true, r2: false, r3: true, r4: false },
                    { module: "Ledger Ledger Accounts", r1: true, r2: false, r3: false, r4: true }
                  ].map((row) => (
                    <TableRow key={row.module}>
                      <TableCell className="font-semibold text-zinc-700 dark:text-zinc-300">{row.module}</TableCell>
                      <TableCell className="text-center">
                        <input type="checkbox" checked={row.r1} readOnly className="rounded text-emerald-600 focus:ring-emerald-500" />
                      </TableCell>
                      <TableCell className="text-center">
                        <input type="checkbox" checked={row.r2} readOnly className="rounded text-emerald-600 focus:ring-emerald-500" />
                      </TableCell>
                      <TableCell className="text-center">
                        <input type="checkbox" checked={row.r3} readOnly className="rounded text-emerald-600 focus:ring-emerald-500" />
                      </TableCell>
                      <TableCell className="text-center">
                        <input type="checkbox" checked={row.r4} readOnly className="rounded text-emerald-600 focus:ring-emerald-500" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Audit Logs */}
        <TabsContent value="audits" className="mt-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-bold">System Activity & Audit Logs</CardTitle>
              <CardDescription className="text-xs">Real-time audit trails of actions, batch updates, and sales orders</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-bold">Timestamp</TableHead>
                    <TableHead className="text-xs font-bold">Action Event</TableHead>
                    <TableHead className="text-xs font-bold">Description Details</TableHead>
                    <TableHead className="text-xs font-bold">Performed By</TableHead>
                    <TableHead className="text-xs font-bold">IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs text-zinc-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[9px] font-bold py-0.5">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-zinc-700 dark:text-zinc-300 max-w-sm truncate">
                        {log.details}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">{log.userName}</TableCell>
                      <TableCell className="text-xs font-mono text-zinc-400">{log.ipAddress}</TableCell>
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

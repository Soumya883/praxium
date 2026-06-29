"use client";

import * as React from "react";
import { 
  Building, 
  Bell, 
  CreditCard, 
  Key, 
  Sliders, 
  ShieldAlert, 
  Check, 
  Loader2,
  Mail,
  Smartphone,
  MapPin,
  RotateCcw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";
import { resetDemoEnvironment } from "@/app/actions/demo-reset";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);

  // Clerk setup
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  const hasClerk = !!clerkKey && clerkKey.startsWith("pk_");
  
  let clerkUser: any = null;
  try {
    const { user } = useUser();
    clerkUser = user;
  } catch (e) {
    // In local evaluation without ClerkProvider, useUser can fail
  }
  
  const email = clerkUser?.primaryEmailAddress?.emailAddress || "admin@praxium.edu";
  const showResetButton = !hasClerk || email === "admin@praxium.edu" || email === "sushvine@praxium.edu";

  const handleReset = async () => {
    if (!confirm("CRITICAL WARNING: This will permanently erase the database. Proceed?")) {
      return;
    }
    setIsResetting(true);
    try {
      const res = await resetDemoEnvironment();
      if (res.success) {
        alert(res.message);
      } else {
        alert("Error: " + res.message);
      }
    } catch (e) {
      alert("Failed to reset database environment.");
    } finally {
      setIsResetting(false);
    }
  };

  // Load from LocalStorage if in browser
  const [academyName, setAcademyName] = React.useState("Praxium Odisha Academy");
  const [supportEmail, setSupportEmail] = React.useState("admin@praxium.edu");
  const [supportPhone, setSupportPhone] = React.useState("+91 99999 88888");
  const [attendanceThreshold, setAttendanceThreshold] = React.useState("75");
  const [apiKey, setApiKey] = React.useState("re_K9A2f8h23...");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("settings_academy_name");
      const savedEmail = localStorage.getItem("settings_email");
      const savedPhone = localStorage.getItem("settings_phone");
      const savedThreshold = localStorage.getItem("settings_threshold");
      const savedKey = localStorage.getItem("settings_apikey");

      if (savedName) setAcademyName(savedName);
      if (savedEmail) setSupportEmail(savedEmail);
      if (savedPhone) setSupportPhone(savedPhone);
      if (savedThreshold) setAttendanceThreshold(savedThreshold);
      if (savedKey) setApiKey(savedKey);
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    // Simulate database write delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (typeof window !== "undefined") {
      localStorage.setItem("settings_academy_name", academyName);
      localStorage.setItem("settings_email", supportEmail);
      localStorage.setItem("settings_phone", supportPhone);
      localStorage.setItem("settings_threshold", attendanceThreshold);
      localStorage.setItem("settings_apikey", apiKey);
    }

    setIsSaving(false);
    setSaveSuccess(true);

    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Settings</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Configure institute details, parent notifications, API keys, and billing.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Save success toast banner */}
        {saveSuccess && (
          <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <Check className="h-4.5 w-4.5" />
            <span>Settings saved successfully. Changes applied across all dashboard modules.</span>
          </div>
        )}

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          
          {/* Card 1: Institute profile */}
          <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Building className="h-4.5 w-4.5 text-neutral-400" />
                <span>Institute Details</span>
              </CardTitle>
              <CardDescription className="text-[11px] text-neutral-500">
                Academy identity and global contact records.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="academy-name" className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Academy Name</Label>
                <Input 
                  id="academy-name" 
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  className="bg-neutral-50 dark:bg-neutral-900 text-xs focus-visible:ring-neutral-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="support-email" className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Support Email Address</Label>
                <Input 
                  id="support-email" 
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="bg-neutral-50 dark:bg-neutral-900 text-xs focus-visible:ring-neutral-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="support-phone" className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Contact Number</Label>
                <Input 
                  id="support-phone" 
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="bg-neutral-50 dark:bg-neutral-900 text-xs focus-visible:ring-neutral-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Communication & alert thresholds */}
          <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Bell className="h-4.5 w-4.5 text-neutral-400" />
                <span>Parent Communication Rules</span>
              </CardTitle>
              <CardDescription className="text-[11px] text-neutral-500">
                Setup conditions for automated alerts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="attendance-threshold" className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Critical Attendance Threshold (%)
                </Label>
                <Input 
                  id="attendance-threshold" 
                  type="number"
                  min="0"
                  max="100"
                  value={attendanceThreshold}
                  onChange={(e) => setAttendanceThreshold(e.target.value)}
                  className="bg-neutral-50 dark:bg-neutral-900 text-xs focus-visible:ring-neutral-400"
                />
                <p className="text-[10px] text-neutral-400">
                  Parents receive alert warnings if student attendance drops below this score.
                </p>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Rate Limiting Enabled</span>
                </div>
                <p className="text-[10px] text-neutral-500 leading-relaxed">
                  Spam protection forces a minimum interval of <strong>7 days</strong> between attendance alert emails to the same parent.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Integrations & API credentials */}
          <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Key className="h-4.5 w-4.5 text-neutral-400" />
                <span>API & Integrations</span>
              </CardTitle>
              <CardDescription className="text-[11px] text-neutral-500">
                Configure external services for email dispatching.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="resend-key" className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Resend API Key
                </Label>
                <Input 
                  id="resend-key" 
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-neutral-50 dark:bg-neutral-900 text-xs focus-visible:ring-neutral-400"
                />
                <p className="text-[10px] text-neutral-400">
                  Paste your Resend API secret to deliver real attendance and fee reminder emails.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: SaaS plan overview */}
          <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-neutral-400" />
                <span>SaaS Subscription Plan</span>
              </CardTitle>
              <CardDescription className="text-[11px] text-neutral-500">
                Details about your active subscription with Praxium.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex justify-between items-center text-xs pb-1 border-b border-neutral-100 dark:border-neutral-900">
                <span className="text-neutral-500">Current Plan</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                  <span>Growth Plan</span>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/20">Active</span>
                </span>
              </div>

              <div className="flex justify-between items-center text-xs pb-1 border-b border-neutral-100 dark:border-neutral-900">
                <span className="text-neutral-500">Billing Period</span>
                <span className="text-neutral-800 dark:text-neutral-300">Monthly</span>
              </div>

              <div className="flex justify-between items-center text-xs pb-1 border-b border-neutral-100 dark:border-neutral-900">
                <span className="text-neutral-500">Capacity Usage</span>
                <span className="text-neutral-800 dark:text-neutral-300">15 / 500 Students</span>
              </div>

              <Button type="button" variant="outline" className="w-full text-xs font-semibold h-9.5 border-neutral-200 dark:border-neutral-900 cursor-pointer">
                Manage Billing & Invoices
              </Button>
            </CardContent>
          </Card>

        </div>

        {showResetButton && (
          <Card className="border border-red-500/20 dark:border-red-950/40 bg-red-500/5 dark:bg-red-950/10 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                <RotateCcw className="h-4.5 w-4.5" />
                <span>Golden Demo Sandbox Reset</span>
              </CardTitle>
              <CardDescription className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Wipe all records and reset the system with perfect demo data before meetings. Available only to founder accounts.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <p className="text-[10px] text-neutral-500 max-w-lg leading-relaxed">
                This deletes all students, active attendance history, custom scheduled batches, and payment invoices, and restores the pristine demo dataset.
              </p>
              <Button
                type="button"
                onClick={handleReset}
                disabled={isResetting}
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-4 h-9.5 cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                {isResetting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="h-3.5 w-3.5" />
                )}
                <span>{isResetting ? "Resetting Database..." : "Reset Demo Environment"}</span>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Submit controls */}
        <div className="flex justify-end pt-4 border-t border-neutral-200 dark:border-neutral-900">
          <Button 
            type="submit" 
            disabled={isSaving}
            className="bg-neutral-900 hover:bg-neutral-800 text-neutral-50 dark:bg-neutral-50 dark:hover:bg-neutral-200 dark:text-neutral-950 text-xs font-semibold px-6 h-10 cursor-pointer flex items-center gap-1.5"
          >
            {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{isSaving ? "Saving Settings..." : "Save Settings"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

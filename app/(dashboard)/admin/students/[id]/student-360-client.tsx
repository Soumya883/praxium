"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  ShieldAlert, 
  CreditCard, 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  ChevronLeft, 
  Plus, 
  Check, 
  Loader2,
  DollarSign,
  TrendingUp,
  FileText
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateStudentProfile, recordPayment } from "@/app/actions/student-360";
import { formatINR } from "@/lib/utils";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FeeReceiptPDF } from "@/components/pdf/fee-receipt";
import { ReportCardPDF } from "@/components/pdf/report-card";

interface Student360ClientProps {
  student: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    batchId: string | null;
    batchName: string;
    collegeName: string | null;
    guardianName: string | null;
    guardianPhone: string | null;
    guardianAddress: string | null;
    totalCourseFee: number;
    tenthBoardMarks: {
      physics: number;
      chemistry: number;
      biology: number;
      it: number;
    } | null;
  };
  paymentsList: {
    id: string;
    amount: number;
    status: "paid" | "pending" | "overdue";
    dueDate: string;
    paymentDate: string | null;
    paymentMode: "CASH" | "UPI" | "BANK_TRANSFER" | "CARD";
    receiptNumber: string | null;
  }[];
  examsList: {
    id: string;
    subject: string;
    maxMarks: number;
    date: string;
    marksObtained: number | null;
  }[];
  batchesList: {
    id: string;
    name: string;
  }[];
}

export function Student360Client({ student, paymentsList, examsList, batchesList }: Student360ClientProps) {
  const router = useRouter();
  
  // Profile form state
  const [name, setName] = React.useState(student.name);
  const [email, setEmail] = React.useState(student.email);
  const [phone, setPhone] = React.useState(student.phone || "");
  const [batchId, setBatchId] = React.useState(student.batchId || "");
  const [collegeName, setCollegeName] = React.useState(student.collegeName || "");
  const [guardianName, setGuardianName] = React.useState(student.guardianName || "");
  const [guardianPhone, setGuardianPhone] = React.useState(student.guardianPhone || "");
  const [guardianAddress, setGuardianAddress] = React.useState(student.guardianAddress || "");
  const [totalCourseFee, setTotalCourseFee] = React.useState(student.totalCourseFee.toString());
  
  // 10th marks state
  const [marksPhy, setMarksPhy] = React.useState(student.tenthBoardMarks?.physics?.toString() || "0");
  const [marksChe, setMarksChe] = React.useState(student.tenthBoardMarks?.chemistry?.toString() || "0");
  const [marksBio, setMarksBio] = React.useState(student.tenthBoardMarks?.biology?.toString() || "0");
  const [marksIt, setMarksIt] = React.useState(student.tenthBoardMarks?.it?.toString() || "0");

  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [profileMsg, setProfileMsg] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Add Payment Modal/Form state
  const [payAmount, setPayAmount] = React.useState("");
  const [payMode, setPayMode] = React.useState<"CASH" | "UPI" | "BANK_TRANSFER" | "CARD">("CASH");
  const [payDate, setPayDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [isRecordingPayment, setIsRecordingPayment] = React.useState(false);
  const [showAddPaymentCard, setShowAddPaymentCard] = React.useState(false);
  const [sendWhatsApp, setSendWhatsApp] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Financial aggregates
  const totalPaid = paymentsList
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const outstandingBalance = student.totalCourseFee - totalPaid;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMsg(null);

    const tenthMarks = {
      physics: parseInt(marksPhy) || 0,
      chemistry: parseInt(marksChe) || 0,
      biology: parseInt(marksBio) || 0,
      it: parseInt(marksIt) || 0,
    };

    const res = await updateStudentProfile(student.id, {
      name,
      email,
      phone: phone || null,
      batchId: batchId || null,
      collegeName,
      guardianName,
      guardianPhone,
      guardianAddress,
      totalCourseFee: parseFloat(totalCourseFee) || undefined,
      tenthBoardMarks: tenthMarks,
    });

    setIsSavingProfile(false);
    if (res.success) {
      setProfileMsg({ type: "success", text: res.message || "Profile updated successfully." });
      router.refresh();
      setTimeout(() => setProfileMsg(null), 3000);
    } else {
      setProfileMsg({ type: "error", text: res.error || "Failed to update profile." });
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || parseFloat(payAmount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setIsRecordingPayment(true);
    const res = await recordPayment(student.id, null, {
      amount: parseFloat(payAmount),
      paymentMode: payMode,
      submittedDate: new Date(payDate).toISOString(),
    }, sendWhatsApp);

    setIsRecordingPayment(false);
    if (res.success) {
      alert("Payment recorded successfully!");
      setPayAmount("");
      setShowAddPaymentCard(false);
      router.refresh();
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 cursor-pointer"
          onClick={() => router.push("/students")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">{student.name}</h2>
            <span className="text-xs bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2.5 py-0.5 rounded-full font-medium">
              {student.batchName}
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Student 360 profile, academic history, fee ledgers, and exam scores.
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-neutral-100 dark:bg-neutral-900">
          <TabsTrigger value="profile">Profile & Guardian</TabsTrigger>
          <TabsTrigger value="academics">Academic History</TabsTrigger>
          <TabsTrigger value="finances">Fee Management</TabsTrigger>
          <TabsTrigger value="exams">Exam Performance</TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile & Guardian */}
        <TabsContent value="profile">
          <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-neutral-400" />
                <span>Guardian & Demographics Information</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Edit college credentials and emergency contacts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                {profileMsg && (
                  <div className={`p-3 rounded-lg border text-xs font-semibold ${
                    profileMsg.type === "success" 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                      : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                  }`}>
                    {profileMsg.text}
                  </div>
                )}

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs text-neutral-500 font-semibold">Student Full Name</Label>
                    <Input 
                      id="name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="bg-neutral-50 dark:bg-neutral-900 text-xs focus-visible:ring-neutral-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs text-neutral-500 font-semibold">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      className="bg-neutral-50 dark:bg-neutral-900 text-xs focus-visible:ring-neutral-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs text-neutral-500 font-semibold">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 99999 99999"
                      className="bg-neutral-50 dark:bg-neutral-900 text-xs focus-visible:ring-neutral-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="batch" className="text-xs text-neutral-500 font-semibold">Assigned Batch</Label>
                    <Select 
                      value={batchId} 
                      onValueChange={(val) => setBatchId(val || "")}
                    >
                      <SelectTrigger id="batch" className="bg-neutral-50 dark:bg-neutral-900 text-xs h-9 focus-visible:ring-neutral-400">
                        <SelectValue placeholder="Choose a batch" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 text-neutral-900 dark:text-neutral-200">
                        <SelectItem value="" className="text-xs cursor-pointer">Unassigned</SelectItem>
                        {batchesList.map((b) => (
                          <SelectItem key={b.id} value={b.id} className="text-xs cursor-pointer">
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="college" className="text-xs text-neutral-500">Current College / High School</Label>
                    <Input 
                      id="college" 
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      placeholder="e.g. Ravenshaw Junior College"
                      className="bg-neutral-50 dark:bg-neutral-900 text-xs focus-visible:ring-neutral-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="g-name" className="text-xs text-neutral-500">Guardian Name</Label>
                    <Input 
                      id="g-name" 
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="e.g. Prasanna Kumar Dash"
                      className="bg-neutral-50 dark:bg-neutral-900 text-xs focus-visible:ring-neutral-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="g-phone" className="text-xs text-neutral-500">Guardian Phone</Label>
                    <Input 
                      id="g-phone" 
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="e.g. +91 94370 12345"
                      className="bg-neutral-50 dark:bg-neutral-900 text-xs focus-visible:ring-neutral-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="g-addr" className="text-xs text-neutral-500">Guardian Address</Label>
                    <Input 
                      id="g-addr" 
                      value={guardianAddress}
                      onChange={(e) => setGuardianAddress(e.target.value)}
                      placeholder="e.g. Nayapalli, Bhubaneswar"
                      className="bg-neutral-50 dark:bg-neutral-900 text-xs focus-visible:ring-neutral-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-neutral-200 dark:border-neutral-900">
                  <Button 
                    type="submit" 
                    disabled={isSavingProfile}
                    className="bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold px-4 h-9.5 cursor-pointer flex items-center gap-1.5"
                  >
                    {isSavingProfile && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Save Demographic Details</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Academic History */}
        <TabsContent value="academics">
          <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <GraduationCap className="h-4.5 w-4.5 text-neutral-400" />
                <span>10th Board Marks Registry</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Record the student's entry-level secondary school scores.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {profileMsg && (
                  <div className={`p-3 rounded-lg border text-xs font-semibold ${
                    profileMsg.type === "success" 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                      : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                  }`}>
                    {profileMsg.text}
                  </div>
                )}

                <div className="grid gap-6 grid-cols-2 sm:grid-cols-4">
                  <div className="space-y-1.5 p-3.5 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <Label htmlFor="phy" className="text-xs font-semibold block text-neutral-700 dark:text-neutral-300">Physics (%)</Label>
                    <Input 
                      id="phy" 
                      type="number"
                      value={marksPhy}
                      onChange={(e) => setMarksPhy(e.target.value)}
                      className="bg-white dark:bg-neutral-950 mt-1 h-9 text-xs focus-visible:ring-neutral-400 text-center font-bold"
                    />
                  </div>

                  <div className="space-y-1.5 p-3.5 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <Label htmlFor="che" className="text-xs font-semibold block text-neutral-700 dark:text-neutral-300">Chemistry (%)</Label>
                    <Input 
                      id="che" 
                      type="number"
                      value={marksChe}
                      onChange={(e) => setMarksChe(e.target.value)}
                      className="bg-white dark:bg-neutral-950 mt-1 h-9 text-xs focus-visible:ring-neutral-400 text-center font-bold"
                    />
                  </div>

                  <div className="space-y-1.5 p-3.5 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <Label htmlFor="bio" className="text-xs font-semibold block text-neutral-700 dark:text-neutral-300">Biology (%)</Label>
                    <Input 
                      id="bio" 
                      type="number"
                      value={marksBio}
                      onChange={(e) => setMarksBio(e.target.value)}
                      className="bg-white dark:bg-neutral-950 mt-1 h-9 text-xs focus-visible:ring-neutral-400 text-center font-bold"
                    />
                  </div>

                  <div className="space-y-1.5 p-3.5 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <Label htmlFor="it" className="text-xs font-semibold block text-neutral-700 dark:text-neutral-300">Info Tech (%)</Label>
                    <Input 
                      id="it" 
                      type="number"
                      value={marksIt}
                      onChange={(e) => setMarksIt(e.target.value)}
                      className="bg-white dark:bg-neutral-950 mt-1 h-9 text-xs focus-visible:ring-neutral-400 text-center font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-neutral-200 dark:border-neutral-900">
                  <Button 
                    type="submit" 
                    disabled={isSavingProfile}
                    className="bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold px-4 h-9.5 cursor-pointer flex items-center gap-1.5"
                  >
                    {isSavingProfile && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Save Board Marks</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Fee Management */}
        <TabsContent value="finances">
          <div className="space-y-6">
            
            {/* Balance Widget Cards */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
              <Card className="bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-900">
                <CardHeader className="pb-2">
                  <span className="text-[10px] text-neutral-500 uppercase font-semibold">Total Course Fee</span>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <div className="text-xl font-bold">{formatINR(student.totalCourseFee)}</div>
                  {/* Fee editor input */}
                  <div className="flex items-center gap-1.5 max-w-[120px]">
                    <Input 
                      type="number" 
                      value={totalCourseFee}
                      onChange={(e) => setTotalCourseFee(e.target.value)}
                      className="h-8 text-xs bg-white dark:bg-neutral-950 focus-visible:ring-neutral-400"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={handleUpdateProfile} 
                      className="h-8 w-8 cursor-pointer shrink-0"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-emerald-500/5 border border-emerald-500/10">
                <CardHeader className="pb-2">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Total Fees Settled</span>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatINR(totalPaid)}</div>
                </CardContent>
              </Card>

              <Card className="bg-rose-500/5 border border-rose-500/10">
                <CardHeader className="pb-2">
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-semibold">Outstanding Balance</span>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <div className="text-xl font-bold text-rose-600 dark:text-rose-400">{formatINR(outstandingBalance)}</div>
                  <Button 
                    onClick={() => setShowAddPaymentCard(!showAddPaymentCard)}
                    className="h-8 px-3 rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold gap-1.5 cursor-pointer shadow"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Record Payment</span>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Add Payment Drawer card */}
            {showAddPaymentCard && (
              <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Record Manual Fee Transaction</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRecordPayment} className="grid gap-4 grid-cols-1 sm:grid-cols-4 items-end">
                    <div className="space-y-1.5">
                      <Label htmlFor="pay-amt" className="text-xs text-neutral-500">Amount (INR)</Label>
                      <Input 
                        id="pay-amt" 
                        type="number"
                        placeholder="e.g. 5000"
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        className="bg-neutral-50 dark:bg-neutral-900 text-xs h-9 focus-visible:ring-neutral-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="pay-mode" className="text-xs text-neutral-500">Payment Mode</Label>
                      <Select 
                        value={payMode} 
                        onValueChange={(val: any) => setPayMode(val)}
                      >
                        <SelectTrigger className="bg-neutral-50 dark:bg-neutral-900 text-xs h-9 focus-visible:ring-neutral-400">
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 text-neutral-900 dark:text-neutral-200">
                          <SelectItem value="CASH" className="text-xs cursor-pointer">Cash</SelectItem>
                          <SelectItem value="UPI" className="text-xs cursor-pointer">UPI / QR Code</SelectItem>
                          <SelectItem value="BANK_TRANSFER" className="text-xs cursor-pointer">Bank Transfer</SelectItem>
                          <SelectItem value="CARD" className="text-xs cursor-pointer">Card Swipe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="pay-date" className="text-xs text-neutral-500">Date Received</Label>
                      <Input 
                        id="pay-date" 
                        type="date"
                        value={payDate}
                        onChange={(e) => setPayDate(e.target.value)}
                        className="bg-neutral-50 dark:bg-neutral-900 text-xs h-9 focus-visible:ring-neutral-400"
                      />
                    </div>

                    <div className="flex items-center gap-2 pb-2 h-9">
                      <input 
                        id="send-wa" 
                        type="checkbox"
                        checked={sendWhatsApp}
                        onChange={(e) => setSendWhatsApp(e.target.checked)}
                        className="h-4 w-4 rounded border-neutral-300 text-indigo-650 focus:ring-indigo-600 bg-neutral-50 dark:bg-neutral-900 cursor-pointer"
                      />
                      <Label htmlFor="send-wa" className="text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer select-none">
                        WhatsApp Parent Receipt
                      </Label>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={isRecordingPayment}
                        className="flex-1 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold h-9 cursor-pointer flex items-center justify-center gap-1"
                      >
                        {isRecordingPayment && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        <span>Submit Ledger Receipt</span>
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => setShowAddPaymentCard(false)}
                        className="h-9 px-3 text-xs border border-neutral-200 dark:border-neutral-900 cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Payment history register */}
            <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Invoices & Receipts Ledger</CardTitle>
                <CardDescription className="text-xs">
                  Historical log of payment requests, receipts, and modes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-900 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-neutral-50 dark:bg-neutral-900/30">
                      <TableRow>
                        <TableHead className="text-xs font-semibold py-3.5">Invoice / Receipt</TableHead>
                        <TableHead className="text-xs font-semibold py-3.5">Date Paid</TableHead>
                        <TableHead className="text-xs font-semibold py-3.5">Mode</TableHead>
                        <TableHead className="text-xs font-semibold py-3.5">Due Date</TableHead>
                        <TableHead className="text-xs font-semibold py-3.5 text-right">Amount</TableHead>
                        <TableHead className="text-xs font-semibold py-3.5">Status</TableHead>
                        <TableHead className="text-xs font-semibold py-3.5 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentsList.length > 0 ? (
                        paymentsList.map((p) => (
                          <TableRow key={p.id} className="hover:bg-neutral-50/55 dark:hover:bg-neutral-900/10">
                            <TableCell className="text-xs font-bold text-neutral-800 dark:text-neutral-200 py-3.5">
                              {p.receiptNumber || `INV-${p.id.substring(4, 9).toUpperCase()}`}
                            </TableCell>
                            <TableCell className="text-xs text-neutral-500 py-3.5">
                              {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : "—"}
                            </TableCell>
                            <TableCell className="text-xs text-neutral-700 dark:text-neutral-300 py-3.5 font-medium">
                              {p.paymentMode}
                            </TableCell>
                            <TableCell className="text-xs text-neutral-500 py-3.5">
                              {p.dueDate}
                            </TableCell>
                            <TableCell className="text-xs font-bold text-neutral-900 dark:text-neutral-100 text-right py-3.5">
                              {formatINR(p.amount)}
                            </TableCell>
                            <TableCell className="py-3.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                p.status === "paid"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : (p.status === "overdue" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" : "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20")
                              }`}>
                                {p.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right py-3.5">
                              {p.status === "paid" && isMounted ? (
                                <PDFDownloadLink
                                  document={
                                    <FeeReceiptPDF
                                      studentName={student.name}
                                      batchName={student.batchName}
                                      amount={p.amount}
                                      paymentMode={p.paymentMode}
                                      date={p.paymentDate || p.dueDate}
                                      receiptNumber={p.receiptNumber || `INV-${p.id.substring(4, 9).toUpperCase()}`}
                                    />
                                  }
                                  fileName={`receipt-${p.receiptNumber || p.id}.pdf`}
                                  className="text-indigo-650 dark:text-indigo-400 hover:underline font-semibold"
                                >
                                  {({ loading }) => loading ? "..." : "PDF"}
                                </PDFDownloadLink>
                              ) : (
                                <span className="text-neutral-400">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-20 text-center text-xs text-neutral-500">
                            No payment transactions recorded.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* Tab 4: Exam Performance */}
        <TabsContent value="exams">
          <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5 text-neutral-400" />
                    <span>Institute Academic Records</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    View or record scores for classroom monthly exams.
                  </CardDescription>
                </div>
                {isMounted && examsList.length > 0 && (
                  <PDFDownloadLink
                    document={
                      <ReportCardPDF
                        studentName={student.name}
                        guardianName={student.guardianName || ""}
                        batchName={student.batchName}
                        collegeName={student.collegeName || ""}
                        examScores={examsList.map(e => ({
                          subject: e.subject,
                          studentScore: e.marksObtained ?? 0,
                          classAverage: Math.round(e.maxMarks * 0.76),
                        }))}
                        attendancePercentage={88}
                      />
                    }
                    fileName={`report-card-${student.name.toLowerCase().replace(/\s+/g, "-")}.pdf`}
                  >
                    {({ loading }) => (
                      <Button
                        disabled={loading}
                        className="h-8.5 px-3 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold gap-1.5 cursor-pointer shadow rounded-lg border border-transparent flex items-center"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Prep PDF...</span>
                          </>
                        ) : (
                          <>
                            <FileText className="h-3.5 w-3.5" />
                            <span>Download Report Card</span>
                          </>
                        )}
                      </Button>
                    )}
                  </PDFDownloadLink>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-900 overflow-hidden">
                <Table>
                  <TableHeader className="bg-neutral-50 dark:bg-neutral-900/30">
                    <TableRow>
                      <TableHead className="text-xs font-semibold py-3.5">Subject</TableHead>
                      <TableHead className="text-xs font-semibold py-3.5">Exam Date</TableHead>
                      <TableHead className="text-xs font-semibold py-3.5 text-center">Marks Obtained</TableHead>
                      <TableHead className="text-xs font-semibold py-3.5 text-center">Max Marks</TableHead>
                      <TableHead className="text-xs font-semibold py-3.5 text-right">Performance Ratio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examsList.length > 0 ? (
                      examsList.map((ex) => {
                        const marksVal = ex.marksObtained ?? 0;
                        const percent = ex.maxMarks > 0 ? Math.round((marksVal / ex.maxMarks) * 100) : 0;
                        return (
                          <TableRow key={ex.id} className="hover:bg-neutral-50/55 dark:hover:bg-neutral-900/10">
                            <TableCell className="text-xs font-bold text-neutral-800 dark:text-neutral-200 py-3.5">
                              {ex.subject}
                            </TableCell>
                            <TableCell className="text-xs text-neutral-500 py-3.5">
                              {new Date(ex.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-xs text-neutral-950 dark:text-neutral-50 text-center font-bold py-3.5">
                              {ex.marksObtained !== null ? ex.marksObtained : "—"}
                            </TableCell>
                            <TableCell className="text-xs text-neutral-500 text-center py-3.5 font-medium">
                              {ex.maxMarks}
                            </TableCell>
                            <TableCell className="text-xs text-right py-3.5">
                              <span className={`font-semibold ${
                                percent >= 75 ? "text-emerald-500" : (percent >= 50 ? "text-amber-500" : "text-rose-500")
                              }`}>
                                {ex.marksObtained !== null ? `${percent}%` : "—"}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-20 text-center text-xs text-neutral-500">
                          No institute exams recorded for this batch.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

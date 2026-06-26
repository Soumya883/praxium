"use client";

import * as React from "react";
import Link from "next/link";
import { 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  Clock, 
  Percent, 
  DollarSign, 
  User, 
  Loader2,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { submitAssignment } from "@/app/actions/academic-eval";
import { formatINR } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from "recharts";

interface StudentPortalClientProps {
  student: {
    id: string;
    name: string;
    batchName: string;
    totalCourseFee: number;
    totalPaid: number;
    collegeName?: string | null;
    guardianName?: string | null;
    guardianPhone?: string | null;
    guardianAddress?: string | null;
    tenthBoardMarks?: {
      physics?: number;
      chemistry?: number;
      biology?: number;
      it?: number;
    } | null;
  };
  assignmentsList: {
    id: string;
    title: string;
    description: string | null;
    dueDate: string;
    teacherName: string;
    submitted: boolean;
    submissionUrl: string | null;
    grade: string | null;
  }[];
  attendanceList: {
    subject: string;
    attended: number;
    total: number;
    percentage: number;
  }[];
  examsPerformance: {
    subject: string;
    studentScore: number;
    classAverage: number;
  }[];
  paymentsList: {
    id: string;
    amount: number;
    status: string;
    dueDate: string;
    paymentDate: string | null;
    paymentMode: string;
    receiptNumber: string | null;
  }[];
  cbtExamsList: {
    id: string;
    title: string;
    durationMinutes: number;
    startTime: string;
    endTime: string;
    attempted: boolean;
    attemptId: string | null;
    submitted: boolean;
  }[];
}

export function StudentPortalClient({ 
  student, 
  assignmentsList, 
  attendanceList, 
  examsPerformance,
  paymentsList,
  cbtExamsList
}: StudentPortalClientProps) {
  const [selectedAssignment, setSelectedAssignment] = React.useState<{ id: string; title: string } | null>(null);
  const [fileUrl, setFileUrl] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const outstandingBalance = student.totalCourseFee - student.totalPaid;
  const paymentRatio = student.totalCourseFee > 0 ? Math.round((student.totalPaid / student.totalCourseFee) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !fileUrl) return;

    setIsSubmitting(true);
    const res = await submitAssignment(student.id, fileUrl);

    setIsSubmitting(false);
    if (res.success) {
      alert("Assignment solution submitted successfully!");
      setFileUrl("");
      setDialogOpen(false);
      window.location.reload();
    } else {
      alert("Error: " + res.error);
    }
  };

  // Recharts chart data
  const chartData = examsPerformance.map(item => ({
    subject: item.subject,
    "My Score": item.studentScore,
    "Batch Average": item.classAverage
  }));

  return (
    <div className="space-y-8">
      {/* 1. Welcome Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 p-6 text-white shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-950 to-indigo-950/20 z-0 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Student Workspace</span>
            <h2 className="text-3xl font-extrabold tracking-tight">Welcome back, {student.name}</h2>
            <div className="flex items-center gap-2 text-sm text-neutral-300">
              <GraduationCap className="h-4.5 w-4.5 text-neutral-400" />
              <span>Enrolled in Batch: <strong>{student.batchName}</strong></span>
            </div>
          </div>

          {/* Simple Top Metric Card */}
          <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-4 min-w-[280px] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-400">Total Paid Ratio</span>
              <span className="font-semibold text-emerald-400">{paymentRatio}% Settled</span>
            </div>
            
            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${paymentRatio}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-neutral-500 font-semibold pt-1">
              <span>Paid: {formatINR(student.totalPaid)}</span>
              <span>Due: {formatINR(outstandingBalance)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        
        {/* 2. Grades & Exams Comparison Chart */}
        <Card className="lg:col-span-2 border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-neutral-400" />
              <span>Institute Examination Performance</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Comparison of your monthly test scores against the batch average.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-850" />
                <XAxis dataKey="subject" className="text-[10px] fill-neutral-500" tickLine={false} />
                <YAxis className="text-[10px] fill-neutral-500" tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "var(--popover)", 
                    borderColor: "var(--border)",
                    color: "var(--popover-foreground)",
                    fontSize: "11px",
                    borderRadius: "8px"
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="My Score" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="Batch Average" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 3. Subject-level Attendance Grid */}
        <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Percent className="h-4.5 w-4.5 text-neutral-400" />
              <span>Subject Attendance Roll</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Attended lectures index per subject.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {attendanceList.map((att, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between items-center font-medium">
                  <span className="text-neutral-800 dark:text-neutral-200">{att.subject}</span>
                  <span className={att.percentage >= 75 ? "text-emerald-500" : "text-rose-500 font-semibold"}>
                    {att.percentage}% ({att.attended}/{att.total})
                  </span>
                </div>
                <div className="h-1.5 bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${att.percentage >= 75 ? "bg-emerald-500" : "bg-rose-500"}`}
                    style={{ width: `${att.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 4. Academic Profile Card */}
        <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-neutral-400" />
              <span>Academic & Guardian Profile</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Read-only student registry profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-xs">
            <div className="space-y-3.5 border-b border-neutral-100 dark:border-neutral-900 pb-4">
              <div className="flex justify-between items-start">
                <span className="text-neutral-400">College:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 text-right max-w-[155px] truncate">
                  {student.collegeName || "Not provided"}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-neutral-400">Guardian Name:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {student.guardianName || "Not provided"}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-neutral-400">Guardian Phone:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {student.guardianPhone || "Not provided"}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-neutral-400">Guardian Address:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 text-right max-w-[155px] truncate" title={student.guardianAddress || undefined}>
                  {student.guardianAddress || "Not provided"}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">10th Board Marks</span>
              {student.tenthBoardMarks ? (
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-900 rounded-lg p-2.5">
                    <span className="text-[10px] text-neutral-400 block font-semibold">Physics</span>
                    <span className="text-xs font-extrabold text-indigo-500">{student.tenthBoardMarks.physics ?? "N/A"}/100</span>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-900 rounded-lg p-2.5">
                    <span className="text-[10px] text-neutral-400 block font-semibold">Chemistry</span>
                    <span className="text-xs font-extrabold text-indigo-500">{student.tenthBoardMarks.chemistry ?? "N/A"}/100</span>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-900 rounded-lg p-2.5">
                    <span className="text-[10px] text-neutral-400 block font-semibold">Biology</span>
                    <span className="text-xs font-extrabold text-indigo-500">{student.tenthBoardMarks.biology ?? "N/A"}/100</span>
                  </div>
                  <div className="bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-900 rounded-lg p-2.5">
                    <span className="text-[10px] text-neutral-400 block font-semibold">IT</span>
                    <span className="text-xs font-extrabold text-indigo-500">{student.tenthBoardMarks.it ?? "N/A"}/100</span>
                  </div>
                </div>
              ) : (
                <div className="text-neutral-500 text-center py-2 italic">No board marks provided.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 5. Fee Tracker Card & Transactions Table */}
        <Card className="lg:col-span-2 border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <DollarSign className="h-4.5 w-4.5 text-neutral-400" />
                <span>Tuition Fee Tracker & Payments</span>
              </CardTitle>
              
              {outstandingBalance === 0 ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Fully Paid
                </span>
              ) : paymentsList.some(p => p.status === "overdue") ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  Overdue
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Pending Due
                </span>
              )}
            </div>
            <CardDescription className="text-xs">
              Outstanding ledgers and transaction logs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4 border-b border-neutral-100 dark:border-neutral-900 pb-4 text-center">
              <div>
                <span className="text-[10px] text-neutral-400 block font-semibold">Total Course Fee</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-neutral-50">{formatINR(student.totalCourseFee)}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block font-semibold">Paid to Date</span>
                <span className="text-sm font-bold text-emerald-500">{formatINR(student.totalPaid)}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block font-semibold">Outstanding Due</span>
                <span className={`text-sm font-bold ${outstandingBalance > 0 ? "text-amber-500" : "text-neutral-500"}`}>{formatINR(outstandingBalance)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Transaction Log</span>
              <div className="border border-neutral-100 dark:border-neutral-900 rounded-xl overflow-hidden text-xs bg-neutral-50/20 dark:bg-neutral-950/20">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-900/40 text-[10px] text-neutral-500 font-bold uppercase border-b border-neutral-100 dark:border-neutral-900">
                      <th className="p-3">Receipt / Date</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Mode</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentsList.length > 0 ? (
                      paymentsList.map(pay => (
                        <tr key={pay.id} className="border-b border-neutral-100 dark:border-neutral-900 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10">
                          <td className="p-3">
                            <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                              {pay.receiptNumber || `INV-${pay.id.substring(4, 8).toUpperCase()}`}
                            </div>
                            <div className="text-[10px] text-neutral-400">
                              {pay.paymentDate 
                                ? `Paid: ${new Date(pay.paymentDate).toLocaleDateString()}`
                                : `Due: ${new Date(pay.dueDate).toLocaleDateString()}`}
                            </div>
                          </td>
                          <td className="p-3 font-semibold">{formatINR(pay.amount)}</td>
                          <td className="p-3 text-neutral-500">{pay.paymentMode || "N/A"}</td>
                          <td className="p-3 text-right">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              pay.status === "paid"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : pay.status === "overdue"
                                  ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                  : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            }`}>
                              {pay.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-neutral-400 italic">No transactions recorded.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CBT Timed Mock Exams */}
        <Card className="lg:col-span-3 border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-neutral-400" />
              <span>Computer Based Timed Exams (CBT)</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Take timed mock tests (JEE/NEET format) and view instant evaluations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {cbtExamsList.map((exam) => {
                const now = new Date();
                const start = new Date(exam.startTime);
                const end = new Date(exam.endTime);

                const isUpcoming = now < start;
                const isExpired = now > end;
                const isActive = now >= start && now <= end;

                return (
                  <div 
                    key={exam.id} 
                    className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-900/30 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] bg-neutral-200 dark:bg-neutral-850 text-neutral-600 dark:text-neutral-300 px-2.5 py-0.5 rounded font-medium">
                          {exam.durationMinutes} mins
                        </span>
                        {exam.submitted ? (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/20">
                            Completed
                          </span>
                        ) : isUpcoming ? (
                          <span className="text-[10px] bg-neutral-500/10 text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded-full font-semibold border border-neutral-500/20">
                            Upcoming
                          </span>
                        ) : isExpired ? (
                          <span className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full font-semibold border border-rose-500/20">
                            Expired
                          </span>
                        ) : (
                          <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-semibold border border-blue-500/20 animate-pulse">
                            Active
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-50">{exam.title}</h4>
                      <p className="text-[10px] text-neutral-450 font-semibold">
                        Window: {start.toLocaleString()} — {end.toLocaleString()}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-850 flex gap-2">
                      {exam.submitted ? (
                        <Link
                          href={`/student-portal/exams/${exam.id}/results?att=${exam.attemptId}`}
                          className="flex-1 text-center inline-flex items-center justify-center h-8.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 text-white dark:bg-white dark:hover:bg-neutral-250 dark:text-neutral-950 text-xs font-bold border border-transparent cursor-pointer"
                        >
                          View Evaluation Report
                        </Link>
                      ) : isActive ? (
                        <Link
                          href={`/student-portal/exams/${exam.id}/take`}
                          className="flex-1 text-center inline-flex items-center justify-center h-8.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold border border-transparent cursor-pointer"
                        >
                          Take Timed Exam
                        </Link>
                      ) : (
                        <Button
                          disabled
                          className="flex-1 h-8.5 text-xs font-bold"
                          variant="secondary"
                        >
                          {isUpcoming ? "Locked (Upcoming)" : "Unavailable (Closed)"}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              {cbtExamsList.length === 0 && (
                <div className="col-span-full py-8 text-center text-xs text-neutral-500 italic">
                  No online timed exams scheduled for your cohort.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 6. Assignments Card */}
        <Card className="lg:col-span-3 border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5 text-neutral-400" />
              <span>Pending Assignments & Task Desk</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Complete class tasks and upload solutions below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              {assignmentsList.map((asg) => (
                <div 
                  key={asg.id} 
                  className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-900/30 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2 py-0.5 rounded font-medium truncate max-w-[100px]">
                        {asg.teacherName}
                      </span>
                      {asg.submitted ? (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/20">
                          Submitted
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold border border-amber-500/20 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          <span>Pending</span>
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-50">{asg.title}</h4>
                    <p className="text-[11px] text-neutral-500 leading-relaxed truncate">{asg.description || "No description provided."}</p>
                  </div>

                  <div className="space-y-3.5 pt-2 border-t border-neutral-200 dark:border-neutral-850 text-xs">
                    <div className="flex justify-between text-[11px] text-neutral-400">
                      <span>Due date:</span>
                      <span className="font-semibold">{new Date(asg.dueDate).toLocaleDateString()}</span>
                    </div>

                    {asg.grade && (
                      <div className="flex justify-between text-[11px] text-emerald-500 dark:text-emerald-400 font-bold">
                        <span>Score:</span>
                        <span>Grade {asg.grade}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {asg.submitted && asg.submissionUrl && (
                        <a 
                          href={asg.submissionUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex-1 inline-flex items-center justify-center gap-1.5 h-8.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-[10px] font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-850"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>View Solution</span>
                        </a>
                      )}
                      
                      <Dialog open={dialogOpen && selectedAssignment?.id === asg.id} onOpenChange={(val) => {
                        setDialogOpen(val);
                        if (val) {
                          setSelectedAssignment({ id: asg.id, title: asg.title });
                        }
                      }}>
                        <DialogTrigger className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 text-[10px] font-bold h-8.5 cursor-pointer rounded-lg flex items-center justify-center border border-transparent">
                          <span>{asg.submitted ? "Resubmit" : "Submit Answer"}</span>
                        </DialogTrigger>
                        <DialogContent className="max-w-[400px] bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900">
                          <DialogHeader>
                            <DialogTitle className="text-sm font-semibold">Submit Assignment: {selectedAssignment?.title}</DialogTitle>
                            <DialogDescription className="text-xs text-neutral-500">
                              Provide a URL to your submission (Google Drive, GitHub, etc.)
                            </DialogDescription>
                          </DialogHeader>
                          
                          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                              <Label htmlFor="file-link" className="text-xs text-neutral-500">Attachment File URL</Label>
                              <Input 
                                id="file-link" 
                                type="url"
                                required
                                value={fileUrl}
                                onChange={(e) => setFileUrl(e.target.value)}
                                placeholder="https://drive.google.com/..."
                                className="bg-neutral-50 dark:bg-neutral-900 text-xs h-9"
                              />
                            </div>
                            <div className="flex justify-end gap-2.5 pt-2">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setDialogOpen(false)}
                                className="h-9 px-3 text-xs"
                              >
                                Cancel
                              </Button>
                              <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold h-9 px-4 cursor-pointer flex items-center gap-1.5"
                              >
                                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                <span>Send Submission</span>
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

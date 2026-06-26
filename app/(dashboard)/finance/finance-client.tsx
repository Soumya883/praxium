"use client";

import * as React from "react";
import { CreditCard, AlertCircle, CheckCircle2, TrendingUp, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordPaymentModal } from "@/components/finance/record-payment-modal";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

export type PaymentRecord = {
  id: string;
  studentName: string;
  studentEmail: string;
  amount: string | number;
  status: "paid" | "pending" | "overdue";
  dueDate: string;
  paymentDate: string | Date | null;
  receiptNumber: string | null;
};

interface FinanceClientProps {
  initialPayments: PaymentRecord[];
}

export function FinanceClient({ initialPayments }: FinanceClientProps) {
  const [paymentsList, setPaymentsList] = React.useState<PaymentRecord[]>(initialPayments);
  const [selectedPayment, setSelectedPayment] = React.useState<PaymentRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Keep list in sync with server-side props revalidation
  React.useEffect(() => {
    setPaymentsList(initialPayments);
  }, [initialPayments]);

  // Calculations for overview stats
  const stats = React.useMemo(() => {
    let collected = 0;
    let outstanding = 0;
    let overdueCount = 0;

    paymentsList.forEach(p => {
      const amt = parseFloat(p.amount.toString());
      if (p.status === "paid") {
        collected += amt;
      } else if (p.status === "pending") {
        outstanding += amt;
      } else if (p.status === "overdue") {
        outstanding += amt;
        overdueCount += 1;
      }
    });

    return { collected, outstanding, overdueCount };
  }, [paymentsList]);

  const unpaidPayments = React.useMemo(() => {
    return paymentsList.filter(p => p.status === "pending" || p.status === "overdue");
  }, [paymentsList]);

  const paidPayments = React.useMemo(() => {
    return paymentsList.filter(p => p.status === "paid");
  }, [paymentsList]);

  const handlePaymentSuccess = (receiptNumber: string) => {
    if (!selectedPayment) return;
    
    // Optimistic / session fallback update
    setPaymentsList(prev => 
      prev.map(p => 
        p.id === selectedPayment.id 
          ? { 
              ...p, 
              status: "paid", 
              paymentDate: new Date(), 
              receiptNumber 
            } 
          : p
      )
    );
    setSelectedPayment(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Finance & Fees</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Track student invoices, manage accounts receivable, and log payments.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
        <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Total Collected</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{formatINR(stats.collected)}</div>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 font-medium">
              Setted payments this month
            </p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Total Outstanding</span>
            <CreditCard className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{formatINR(stats.outstanding)}</div>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 font-medium">
              Pending & overdue invoices
            </p>
          </CardContent>
        </Card>

        <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Overdue Invoices</span>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-rose-500 dark:text-rose-400">{stats.overdueCount}</div>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 font-medium">
              Requires immediate action
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-neutral-100 dark:bg-neutral-900/50 p-1 border border-neutral-200 dark:border-neutral-800 rounded-lg">
          <TabsTrigger value="overview" className="text-xs cursor-pointer rounded-md">Overview</TabsTrigger>
          <TabsTrigger value="pending" className="text-xs cursor-pointer rounded-md">Pending/Overdue ({unpaidPayments.length})</TabsTrigger>
          <TabsTrigger value="history" className="text-xs cursor-pointer rounded-md">Payment History</TabsTrigger>
        </TabsList>

        {/* 1. Overview Tab */}
        <TabsContent value="overview" className="space-y-6 outline-none">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {/* Quick Summary list */}
            <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Latest Unsettled Accounts</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="divide-y divide-neutral-100 dark:divide-neutral-900">
                  {unpaidPayments.slice(0, 4).map(p => (
                    <div key={p.id} className="flex items-center justify-between px-6 py-3.5 text-xs">
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">{p.studentName}</p>
                        <p className="text-neutral-400 text-[10px]">Due on {p.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-neutral-950 dark:text-neutral-50">{formatINR(parseFloat(p.amount.toString()))}</p>
                        <span className={cn(
                          "inline-block px-1.5 py-0.5 rounded-full text-[9px] font-semibold border mt-1",
                          p.status === "overdue" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        )}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {unpaidPayments.length === 0 && (
                    <p className="text-neutral-400 text-xs text-center py-6">All dues settled!</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Collected History list */}
            <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <div className="divide-y divide-neutral-100 dark:divide-neutral-900">
                  {paidPayments.slice(0, 4).map(p => (
                    <div key={p.id} className="flex items-center justify-between px-6 py-3.5 text-xs">
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">{p.studentName}</p>
                        <p className="text-neutral-400 text-[10px]">{p.receiptNumber} • {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : ""}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-500 dark:text-emerald-400">{formatINR(parseFloat(p.amount.toString()))}</p>
                        <span className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-semibold border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 mt-1">
                          settled
                        </span>
                      </div>
                    </div>
                  ))}
                  {paidPayments.length === 0 && (
                    <p className="text-neutral-400 text-xs text-center py-6">No payments recorded yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. Pending/Overdue Tab */}
        <TabsContent value="pending" className="outline-none">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-neutral-50 dark:bg-neutral-900/30 border-b border-neutral-200 dark:border-neutral-900">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 py-3.5">Student</TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 py-3.5">Email</TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 py-3.5">Amount Outstanding</TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 py-3.5">Due Date</TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 py-3.5">Status</TableHead>
                  <TableHead className="w-[120px] text-right py-3.5"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unpaidPayments.length > 0 ? (
                  unpaidPayments.map((p) => (
                    <TableRow key={p.id} className="border-b border-neutral-200 dark:border-neutral-900">
                      <TableCell className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 py-3.5">
                        {p.studentName}
                      </TableCell>
                      <TableCell className="text-xs text-neutral-500 dark:text-neutral-400 py-3.5">
                        {p.studentEmail}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-neutral-900 dark:text-neutral-100 py-3.5">
                        {formatINR(parseFloat(p.amount.toString()))}
                      </TableCell>
                      <TableCell className="text-xs text-neutral-500 dark:text-neutral-400 py-3.5">
                        {p.dueDate}
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize",
                            p.status === "overdue"
                              ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          )}
                        >
                          {p.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right py-3.5">
                        <Button 
                          onClick={() => {
                            setSelectedPayment(p);
                            setIsModalOpen(true);
                          }}
                          className="h-7 px-2.5 rounded-md bg-neutral-900 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200 text-[10px] font-semibold cursor-pointer"
                        >
                          Record Payment
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-xs text-neutral-500 dark:text-neutral-400">
                      All fees are paid. No pending invoices.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* 3. History Tab */}
        <TabsContent value="history" className="outline-none">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-neutral-50 dark:bg-neutral-900/30 border-b border-neutral-200 dark:border-neutral-900">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 py-3.5">Receipt No</TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 py-3.5">Student</TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 py-3.5">Amount Settled</TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 py-3.5">Payment Date</TableHead>
                  <TableHead className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 py-3.5">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paidPayments.length > 0 ? (
                  paidPayments.map((p) => (
                    <TableRow key={p.id} className="border-b border-neutral-200 dark:border-neutral-900">
                      <TableCell className="text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100 py-3.5">
                        {p.receiptNumber}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 py-3.5">
                        {p.studentName}
                        <p className="text-[10px] text-neutral-400 font-normal">{p.studentEmail}</p>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-emerald-500 dark:text-emerald-400 py-3.5">
                        {formatINR(parseFloat(p.amount.toString()))}
                      </TableCell>
                      <TableCell className="text-xs text-neutral-500 dark:text-neutral-400 py-3.5">
                        {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 capitalize">
                          settled
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-xs text-neutral-500 dark:text-neutral-400">
                      No payment history recorded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Controlled record payment modal */}
      {selectedPayment && (
        <RecordPaymentModal 
          paymentId={selectedPayment.id}
          studentName={selectedPayment.studentName}
          amountOutstanding={parseFloat(selectedPayment.amount.toString())}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

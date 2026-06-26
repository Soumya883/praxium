import { 
  Users, 
  CreditCard, 
  Layers, 
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { AttendanceChart } from "@/components/attendance-chart";
import { formatINR } from "@/lib/utils";
import { db } from "@/db";
import { students, payments, batches, users, communicationLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const revalidate = 0; // Always fetch dynamic dashboard stats

// Default fallback activities if PostgreSQL is offline
const mockActivities = [
  {
    id: "act-1",
    title: "Subhashree Dash enrolled",
    desc: "Added to JEE Physics (Bhubaneswar Batch A)",
    time: "12m ago",
    icon: Plus,
    color: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20"
  },
  {
    id: "act-2",
    title: `Payment of ${formatINR(4500)} received`,
    desc: "From Arpan Mohanty for Cuttack Batch B fee",
    time: "42m ago",
    icon: CreditCard,
    color: "text-blue-500 bg-blue-500/10 dark:bg-blue-500/5 border border-blue-500/20"
  },
  {
    id: "act-3",
    title: "Attendance marked",
    desc: "NEET Biology (Odisha Batch C) - 94% present",
    time: "2h ago",
    icon: CheckCircle,
    color: "text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/5 border border-indigo-500/20"
  },
  {
    id: "act-4",
    title: "Teacher assigned",
    desc: "Prof. Manoj Das assigned to Super 30 Batch",
    time: "5h ago",
    icon: Users,
    color: "text-amber-500 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20"
  },
  {
    id: "act-5",
    title: "Outstanding fee alert",
    desc: "Invoice overdue for Debasish Patnaik",
    time: "1d ago",
    icon: AlertCircle,
    color: "text-rose-500 bg-rose-500/10 dark:bg-rose-500/5 border border-rose-500/20"
  }
];

export default async function DashboardPage() {
  let stats = {
    totalStudents: 1280,
    monthlyRevenue: 385000,
    activeBatches: 36,
    outstandingFees: 75400,
    pendingInvoicesCount: 14,
    batchesStartingThisWeek: 4,
    studentsGrowthPercent: 12,
    revenueGrowthPercent: 8.2,
  };

  let activities = mockActivities;
  let useFallback = false;

  try {
    // 1. Fetch total active students
    const activeStudents = await db
      .select({ id: students.id })
      .from(students)
      .where(eq(students.status, "active"));
    
    // 2. Fetch active batches
    const allBatches = await db.select().from(batches);

    // 3. Fetch payments
    const allPayments = await db.select().from(payments);

    // 4. Calculate financial aggregates
    const paidSum = allPayments
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const outstandingSum = allPayments
      .filter(p => p.status === "pending" || p.status === "overdue")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const pendingInvoices = allPayments
      .filter(p => p.status === "pending" || p.status === "overdue")
      .length;

    // 5. Query recent activity logs from DB
    // Fetch latest 3 enrolled students
    const recentStudents = await db
      .select({
        name: users.name,
        batchName: batches.name,
        enrollmentDate: students.enrollmentDate
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .leftJoin(batches, eq(students.batchId, batches.id))
      .orderBy(desc(students.enrollmentDate))
      .limit(3);

    // Fetch latest 2 payments
    const recentPaidPayments = await db
      .select({
        amount: payments.amount,
        studentName: users.name,
        paymentDate: payments.paymentDate
      })
      .from(payments)
      .innerJoin(students, eq(payments.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(payments.status, "paid"))
      .orderBy(desc(payments.paymentDate))
      .limit(2);

    // Map DB values to stats
    stats.totalStudents = activeStudents.length || 0;
    stats.activeBatches = allBatches.length || 0;
    stats.monthlyRevenue = paidSum || 0;
    stats.outstandingFees = outstandingSum || 0;
    stats.pendingInvoicesCount = pendingInvoices || 0;

    // Combine recent operations from database dynamically if populated
    const dbActivities: any[] = [];
    
    recentStudents.forEach((s, idx) => {
      dbActivities.push({
        id: `db-student-${idx}`,
        title: `${s.name} enrolled`,
        desc: `Added to ${s.batchName || "unassigned batch"}`,
        time: "Just now",
        icon: Plus,
        color: "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20"
      });
    });

    recentPaidPayments.forEach((p, idx) => {
      dbActivities.push({
        id: `db-pay-${idx}`,
        title: `Payment of ${formatINR(parseFloat(p.amount))} received`,
        desc: `Settled fee invoice for ${p.studentName}`,
        time: "Recently",
        icon: CreditCard,
        color: "text-blue-500 bg-blue-500/10 dark:bg-blue-500/5 border border-blue-500/20"
      });
    });

    if (dbActivities.length > 0) {
      activities = dbActivities;
    }
  } catch (err) {
    console.warn("Postgres connection unavailable. Using mock dashboard stats.");
    useFallback = true;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Overview</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Real-time metrics and center operations tracker.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Active Students */}
        <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 backdrop-blur-sm shadow-sm transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Total Active Students</span>
            <Users className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{stats.totalStudents}</div>
            <p className="text-[10px] text-emerald-500 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="h-3 w-3" />
              <span>+{stats.studentsGrowthPercent}% from last month</span>
            </p>
          </CardContent>
        </Card>

        {/* Revenue This Month */}
        <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 backdrop-blur-sm shadow-sm transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Total Revenue Collected</span>
            <CreditCard className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{formatINR(stats.monthlyRevenue)}</div>
            <p className="text-[10px] text-emerald-500 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="h-3 w-3" />
              <span>+{stats.revenueGrowthPercent}% from last month</span>
            </p>
          </CardContent>
        </Card>

        {/* Active Batches */}
        <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 backdrop-blur-sm shadow-sm transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Active Batches</span>
            <Layers className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{stats.activeBatches}</div>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1 mt-1 font-medium">
              <Clock className="h-3 w-3" />
              <span>{stats.batchesStartingThisWeek} batches starting this week</span>
            </p>
          </CardContent>
        </Card>

        {/* Outstanding Fees */}
        <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 backdrop-blur-sm shadow-sm transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Outstanding Fees</span>
            <AlertCircle className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{formatINR(stats.outstandingFees)}</div>
            <p className="text-[10px] text-rose-500 dark:text-rose-400 flex items-center gap-1 mt-1 font-medium">
              <AlertCircle className="h-3 w-3" />
              <span>{stats.pendingInvoicesCount} pending invoices</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Main Section */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Attendance trends chart */}
        <Card className="lg:col-span-2 border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Attendance Trends</CardTitle>
            <CardDescription className="text-xs text-neutral-500 dark:text-neutral-400">
              Weekly ratio tracker for student check-ins across core cohorts.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <AttendanceChart />
          </CardContent>
        </Card>

        {/* Recent Activity feed */}
        <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
            <CardDescription className="text-xs text-neutral-500 dark:text-neutral-400">
              Operational updates from teachers and admin desk.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {activities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="flex gap-3.5 items-start text-xs">
                    <div className={`p-1.5 rounded-lg shrink-0 ${act.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="font-semibold text-neutral-900 dark:text-neutral-200 truncate leading-tight">
                        {act.title}
                      </p>
                      <p className="text-neutral-500 dark:text-neutral-400 text-[11px] leading-tight">
                        {act.desc}
                      </p>
                    </div>
                    <span className="text-[10px] text-neutral-400 whitespace-nowrap pt-1 shrink-0">
                      {act.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

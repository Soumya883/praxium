import { Suspense } from "react";
import { getFinancialMetrics, getRevenueTrend, getBatchPerformance } from "@/app/actions/analytics";
import { 
  OutstandingFeesCard, 
  RevenueChartClient, 
  FeeCollectionRatioClient, 
  AcademicHealthClient 
} from "./analytics-charts-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";
import { ShieldX } from "lucide-react";


export const revalidate = 0; // Always dynamic

export const metadata = {
  title: "God Mode Executive Analytics | Praxium",
  description: "High-level overview of profitability, payroll expenses, outstanding fees, and academic performance.",
};

// ---------------------------------------------------------
// Skeletons for staggered loading states
// ---------------------------------------------------------
function MetricsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-6 shadow-sm h-32 animate-pulse" />
      ))}
    </div>
  );
}

function RevenueChartSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-6 shadow-sm h-[400px] w-full animate-pulse" />
  );
}

function PieChartSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-6 shadow-sm h-[320px] w-full animate-pulse" />
  );
}

function BarChartSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-6 shadow-sm h-[320px] w-full animate-pulse" />
  );
}

function AccessRestricted() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/20 p-12 text-center gap-4">
      <ShieldX className="h-12 w-12 text-amber-500" />
      <div>
        <p className="font-semibold text-amber-700 dark:text-amber-400 text-lg">Access Restricted</p>
        <p className="text-sm text-amber-600/80 dark:text-amber-500/70 mt-1">
          Executive Analytics is only visible to Administrators.<br/>
          Switch to the Admin role using the avatar menu.
        </p>
      </div>
    </div>
  );
}


// ---------------------------------------------------------
// Individual Server-Rendered Components
// ---------------------------------------------------------
async function MetricsCards() {
  const metrics = await getFinancialMetrics();
  if (!metrics) return <AccessRestricted />;

  const marginPercent = metrics.totalFeeRevenue > 0
    ? ((metrics.netProfit / metrics.totalFeeRevenue) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Monthly Revenue */}
      <Card className="bg-white dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Monthly Revenue
          </CardTitle>
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatINR(metrics.totalFeeRevenue)}
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
            Sum of settled invoices this month
          </p>
        </CardContent>
      </Card>

      {/* Outstanding Fees (Client Component for interactive whatsapp messages) */}
      <OutstandingFeesCard amount={metrics.totalPendingFees} />

      {/* Payroll Liability */}
      <Card className="bg-white dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Payroll Liability
          </CardTitle>
          <div className="h-2 w-2 rounded-full bg-neutral-400 dark:bg-neutral-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold tracking-tight text-neutral-800 dark:text-neutral-300">
            {formatINR(metrics.totalPayrollExpense)}
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
            Sum of payslips issued this month
          </p>
        </CardContent>
      </Card>

      {/* Net Margin */}
      <Card className="bg-white dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Net Margin
          </CardTitle>
          <div className="h-2 w-2 rounded-full bg-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">
            {marginPercent}%
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
            Net profit margin of total collections
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

async function RevenueChart() {
  const trend = await getRevenueTrend();
  if (!trend) return null;
  return <RevenueChartClient data={trend} />;
}

async function FeeCollectionStatus() {
  const metrics = await getFinancialMetrics();
  if (!metrics) return null;
  return <FeeCollectionRatioClient revenue={metrics.totalFeeRevenue} pending={metrics.totalPendingFees} />;
}

async function AcademicHealth() {
  const performance = await getBatchPerformance();
  if (!performance) return null;
  return <AcademicHealthClient data={performance} />;
}

// ---------------------------------------------------------
// Main Page Layout Shell
// ---------------------------------------------------------
export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50 font-heading">
          Executive Analytics
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Real-time "God Mode" view of business profitability, payroll expenses, outstanding fees, and academic standing.
        </p>
      </div>

      {/* 1. Metrics Cards (Staggered Suspense) */}
      <Suspense fallback={<MetricsSkeleton />}>
        <MetricsCards />
      </Suspense>

      {/* 2. Main Revenue trend chart */}
      <Suspense fallback={<RevenueChartSkeleton />}>
        <RevenueChart />
      </Suspense>

      {/* 3. Secondary Side-by-Side charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<PieChartSkeleton />}>
          <FeeCollectionStatus />
        </Suspense>
        
        <Suspense fallback={<BarChartSkeleton />}>
          <AcademicHealth />
        </Suspense>
      </div>
    </div>
  );
}

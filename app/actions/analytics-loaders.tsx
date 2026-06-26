"use server";

import { getFinancialMetrics, getRevenueTrend, getBatchPerformance } from "@/app/actions/analytics";
import { formatINR } from "@/lib/utils";

// This file hosts the server-side data loaders for our analytics sub-sections.
// They are separate Server Components wrapped in Suspense boundaries in page.tsx.

export async function MetricsCards() {
  const metrics = await getFinancialMetrics();
  if (!metrics) return null;

  // Calculate margin percentage
  const marginPercent = metrics.totalFeeRevenue > 0 
    ? ((metrics.netProfit / metrics.totalFeeRevenue) * 100).toFixed(1) 
    : "0.0";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Monthly Revenue Card */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-6 shadow-sm">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Monthly Revenue</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Active
          </span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
          {formatINR(metrics.totalFeeRevenue)}
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Sum of settled invoices this month
        </p>
      </div>

      {/* Outstanding Fees Card */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Outstanding Fees</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse">
              Critical
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
            {formatINR(metrics.totalPendingFees)}
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Total course fee backlog outstanding
          </p>
        </div>
      </div>

      {/* Payroll Liability Card */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-6 shadow-sm">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Payroll Liability</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            Monthly
          </span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-neutral-600 dark:text-neutral-300">
          {formatINR(metrics.totalPayrollExpense)}
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Settled staff payslips this month
        </p>
      </div>

      {/* Net Margin Card */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-6 shadow-sm">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Net Margin</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
            Profit
          </span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
          {marginPercent}%
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Net profit margin of total collections
        </p>
      </div>
    </div>
  );
}

export async function RevenueChart() {
  const trendData = await getRevenueTrend();
  return { trendData: trendData ?? [] };
}

export async function AcademicChart() {
  const performanceData = await getBatchPerformance();
  return { performanceData: performanceData ?? [] };
}

export async function FeeStatusData() {
  const metrics = await getFinancialMetrics();
  return {
    totalFeeRevenue: metrics?.totalFeeRevenue ?? 0,
    totalPendingFees: metrics?.totalPendingFees ?? 0,
  };
}

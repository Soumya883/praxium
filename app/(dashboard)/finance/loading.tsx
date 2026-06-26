import * as React from "react";

export default function FinanceLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
          <div className="h-4 w-96 bg-neutral-100 dark:bg-neutral-900 rounded-lg" />
        </div>
        <div className="h-9 w-36 bg-neutral-200 dark:bg-neutral-850 rounded-lg" />
      </div>

      {/* 3 Metric Cards Skeleton */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border border-neutral-200 dark:border-neutral-900 rounded-xl p-5 space-y-4 bg-white dark:bg-neutral-950/20"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-28 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-4 w-4 bg-neutral-100 dark:bg-neutral-900/60 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-7 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-3 w-32 bg-neutral-100 dark:bg-neutral-900/50 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Layout Skeleton */}
      <div className="space-y-6">
        {/* Tab list buttons */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-900 pb-px gap-4">
          <div className="h-8 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-t" />
          <div className="h-8 w-32 bg-neutral-100 dark:bg-neutral-900/50 rounded-t" />
          <div className="h-8 w-28 bg-neutral-100 dark:bg-neutral-900/50 rounded-t" />
        </div>

        {/* Data Table Skeleton */}
        <div className="border border-neutral-200 dark:border-neutral-900 rounded-xl bg-white dark:bg-neutral-950/20 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-5 p-4 border-b border-neutral-200 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-900/10">
            <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-3 w-16 bg-neutral-250 dark:bg-neutral-800 rounded" />
            <div className="h-3 w-16 bg-neutral-250 dark:bg-neutral-800 rounded" />
            <div className="h-3 w-20 bg-neutral-250 dark:bg-neutral-800 rounded" />
            <div className="h-3 w-16 bg-neutral-250 dark:bg-neutral-800 rounded text-right" />
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-neutral-150 dark:divide-neutral-900">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-5 p-4 items-center">
                <div className="space-y-1">
                  <div className="h-3.5 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
                  <div className="h-2.5 w-40 bg-neutral-100 dark:bg-neutral-900/50 rounded" />
                </div>
                <div className="h-3.5 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" />
                <div className="h-5 w-14 bg-neutral-150 dark:bg-neutral-900/60 rounded-full" />
                <div className="h-3.5 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
                <div className="h-3.5 w-12 bg-neutral-200 dark:bg-neutral-800 rounded justify-self-end" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

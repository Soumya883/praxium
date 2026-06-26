import * as React from "react";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        <div className="h-4 w-64 bg-neutral-100 dark:bg-neutral-900 rounded-lg" />
      </div>

      {/* Grid of 4 Metric Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border border-neutral-200 dark:border-neutral-900 rounded-xl p-5 space-y-4 bg-white dark:bg-neutral-950/20"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-4 w-4 bg-neutral-100 dark:bg-neutral-900/60 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-7 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-3 w-28 bg-neutral-100 dark:bg-neutral-900/50 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Main 2-Column Section */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Left Chart skeleton */}
        <div className="lg:col-span-2 border border-neutral-200 dark:border-neutral-900 rounded-xl p-6 bg-white dark:bg-neutral-950/20 space-y-4">
          <div className="space-y-2">
            <div className="h-4.5 w-36 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-3 w-72 bg-neutral-100 dark:bg-neutral-900/50 rounded" />
          </div>
          <div className="h-64 w-full bg-neutral-50 dark:bg-neutral-900/10 rounded-lg border border-neutral-100/50 dark:border-neutral-900" />
        </div>

        {/* Right Activity skeleton */}
        <div className="border border-neutral-200 dark:border-neutral-900 rounded-xl p-6 bg-white dark:bg-neutral-950/20 space-y-6">
          <div className="space-y-2">
            <div className="h-4.5 w-28 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-3 w-48 bg-neutral-100 dark:bg-neutral-900/50 rounded" />
          </div>
          <div className="space-y-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3.5 items-start">
                <div className="h-8.5 w-8.5 bg-neutral-150 dark:bg-neutral-900/50 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5 pt-0.5">
                  <div className="h-3 w-28 bg-neutral-200 dark:bg-neutral-800 rounded" />
                  <div className="h-2.5 w-40 bg-neutral-100 dark:bg-neutral-900/50 rounded" />
                </div>
                <div className="h-3 w-8 bg-neutral-100 dark:bg-neutral-900/50 rounded mt-1 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

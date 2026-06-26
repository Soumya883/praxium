import * as React from "react";

export default function AcademicLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
          <div className="h-4 w-80 bg-neutral-100 dark:bg-neutral-900 rounded-lg" />
        </div>
        <div className="h-9 w-36 bg-neutral-200 dark:bg-neutral-850 rounded-lg" />
      </div>

      {/* Grid skeleton */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Left Batches Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-4 w-40 bg-neutral-200 dark:bg-neutral-850 rounded-md" />
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="border border-neutral-200 dark:border-neutral-900 rounded-xl p-5 space-y-4 bg-white dark:bg-neutral-950/20"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
                    <div className="h-3 w-20 bg-neutral-100 dark:bg-neutral-900/50 rounded" />
                  </div>
                  <div className="h-5 w-14 bg-neutral-100 dark:bg-neutral-900/60 rounded-full" />
                </div>
                <div className="h-8 w-full bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-900 rounded-lg" />
                <div className="h-3 w-36 bg-neutral-100 dark:bg-neutral-900/50 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Teachers Registry Column */}
        <div className="space-y-6">
          <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-850 rounded-md" />
          <div className="border border-neutral-200 dark:border-neutral-900 rounded-xl p-5 space-y-4 bg-white dark:bg-neutral-950/20">
            <div className="space-y-1.5">
              <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-3 w-36 bg-neutral-100 dark:bg-neutral-900/50 rounded" />
            </div>
            <div className="space-y-4 pt-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between items-center py-1">
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-28 bg-neutral-200 dark:bg-neutral-800 rounded" />
                    <div className="h-2.5 w-20 bg-neutral-150 dark:bg-neutral-900/50 rounded" />
                  </div>
                  <div className="h-5 w-14 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

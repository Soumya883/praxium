import * as React from "react";

export default function StudentsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header section skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
          <div className="h-4 w-80 bg-neutral-100 dark:bg-neutral-900 rounded-lg" />
        </div>
        <div className="h-9 w-32 bg-neutral-200 dark:bg-neutral-850 rounded-lg" />
      </div>

      {/* Filter toolbar skeleton */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input skeleton */}
        <div className="h-9.5 w-full md:w-80 bg-neutral-150 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-900" />
        
        {/* Batch Filter dropdown skeleton */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="h-4 w-4 bg-neutral-100 dark:bg-neutral-900 rounded" />
          <div className="h-9.5 w-full md:w-56 bg-neutral-150 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-900" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/20 overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-5 p-4 border-b border-neutral-200 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-900/10">
          <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="h-3 w-32 bg-neutral-250 dark:bg-neutral-800 rounded" />
          <div className="h-3 w-28 bg-neutral-250 dark:bg-neutral-800 rounded" />
          <div className="h-3 w-16 bg-neutral-250 dark:bg-neutral-800 rounded" />
          <div className="h-3 w-8 bg-neutral-250 dark:bg-neutral-800 rounded text-right justify-self-end" />
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-neutral-150 dark:divide-neutral-900">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="grid grid-cols-5 p-4 items-center">
              <div className="h-3.5 w-28 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-3.5 w-40 bg-neutral-150 dark:bg-neutral-900/55 rounded" />
              <div className="h-3.5 w-36 bg-neutral-150 dark:bg-neutral-900/55 rounded" />
              <div className="h-5 w-14 bg-neutral-100 dark:bg-neutral-900/60 rounded-full" />
              <div className="h-8 w-8 bg-neutral-150 dark:bg-neutral-900/60 rounded-md justify-self-end" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

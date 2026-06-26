import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function StudentPortalLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* 1. Header Banner Skeleton */}
      <div className="h-44 rounded-2xl bg-neutral-200 dark:bg-neutral-900 border border-neutral-350 dark:border-neutral-850 p-6 flex flex-col justify-between" />

      {/* Bento Grid Skeleton */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        
        {/* Chart Skeleton */}
        <Card className="lg:col-span-2 border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 shadow-sm h-[360px]">
          <CardHeader className="space-y-2">
            <div className="h-5 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-3.5 w-1/2 bg-neutral-100 dark:bg-neutral-900/60 rounded" />
          </CardHeader>
          <CardContent className="h-[240px] flex items-end justify-around px-10 pb-6">
            <div className="w-10 h-[60%] bg-neutral-200 dark:bg-neutral-800 rounded-t" />
            <div className="w-10 h-[40%] bg-neutral-200 dark:bg-neutral-800 rounded-t" />
            <div className="w-10 h-[80%] bg-neutral-200 dark:bg-neutral-800 rounded-t" />
            <div className="w-10 h-[50%] bg-neutral-200 dark:bg-neutral-800 rounded-t" />
            <div className="w-10 h-[70%] bg-neutral-200 dark:bg-neutral-800 rounded-t" />
            <div className="w-10 h-[55%] bg-neutral-200 dark:bg-neutral-800 rounded-t" />
          </CardContent>
        </Card>

        {/* Attendance Grid Skeleton */}
        <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 shadow-sm h-[360px]">
          <CardHeader className="space-y-2">
            <div className="h-5 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-3.5 w-2/3 bg-neutral-100 dark:bg-neutral-900/60 rounded" />
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-3.5 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded" />
                  <div className="h-3.5 w-10 bg-neutral-200 dark:bg-neutral-800 rounded" />
                </div>
                <div className="h-2 bg-neutral-100 dark:bg-neutral-900 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Profile Details Skeleton */}
        <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 shadow-sm h-[380px]">
          <CardHeader className="space-y-2">
            <div className="h-5 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-3.5 w-2/3 bg-neutral-100 dark:bg-neutral-900/60 rounded" />
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-900">
                <div className="h-3 w-1/4 bg-neutral-250 dark:bg-neutral-800 rounded" />
                <div className="h-3 w-1/3 bg-neutral-200 dark:bg-neutral-700 rounded" />
              </div>
            ))}
            <div className="h-3 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded pt-4" />
            <div className="grid grid-cols-2 gap-2 text-center pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-900 rounded-lg p-2.5 h-12 flex flex-col justify-around" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fee Ledger Skeleton */}
        <Card className="lg:col-span-2 border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 shadow-sm h-[380px]">
          <CardHeader className="space-y-2">
            <div className="h-5 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-3.5 w-1/2 bg-neutral-100 dark:bg-neutral-900/60 rounded" />
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            <div className="grid grid-cols-3 gap-4 border-b border-neutral-100 dark:border-neutral-900 pb-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 w-12 mx-auto bg-neutral-200 dark:bg-neutral-800 rounded" />
                  <div className="h-5 w-20 mx-auto bg-neutral-200 dark:bg-neutral-700 rounded" />
                </div>
              ))}
            </div>
            <div className="space-y-3.5">
              <div className="h-3 w-20 bg-neutral-250 dark:bg-neutral-800 rounded" />
              <div className="border border-neutral-100 dark:border-neutral-900 rounded-xl overflow-hidden h-32 bg-neutral-50/10 dark:bg-neutral-900/10" />
            </div>
          </CardContent>
        </Card>

        {/* Assignments Skeleton */}
        <Card className="lg:col-span-3 border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 shadow-sm h-[200px]">
          <CardHeader className="space-y-2">
            <div className="h-5 w-1/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-3.5 w-1/3 bg-neutral-100 dark:bg-neutral-900/60 rounded" />
          </CardHeader>
          <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-900/30 h-28" />
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, User, Calendar, MapPin, Layers, CheckSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateBatchModal } from "@/components/academic/create-batch-modal";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CourseItem = {
  id: string;
  name: string;
};

export type TeacherItem = {
  id: string;
  name: string;
  subject: string;
  batchesCount: number;
};

export type BatchItem = {
  id: string;
  name: string;
  courseName: string;
  teacherName: string;
  daysOfWeek: string[]; // parsed e.g. ["MON", "WED"]
  startTime: string;
  endTime: string;
  roomNumber: string;
};

interface AcademicClientProps {
  initialBatches: BatchItem[];
  courses: CourseItem[];
  teachers: TeacherItem[];
}

// Convert 24-hour time "14:00" to 12-hour format "02:00 PM"
function format12Hour(time24: string): string {
  if (!time24) return "";
  const [hStr, mStr] = time24.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (isNaN(h) || isNaN(m)) return time24;
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  const displayM = m < 10 ? `0${m}` : m;
  return `${displayH}:${displayM} ${ampm}`;
}

export function AcademicClient({ initialBatches, courses, teachers }: AcademicClientProps) {
  const [batchesList, setBatchesList] = React.useState<BatchItem[]>(initialBatches);

  // Sync state with revalidated server props
  React.useEffect(() => {
    setBatchesList(initialBatches);
  }, [initialBatches]);

  const handleBatchCreated = () => {
    // When a batch is created, the server revalidatePath('/academic') will trigger,
    // refreshing the RSC data. For local standalone fallback mode, we can just trigger a reload
    // or let the page re-fetch if supported, or let the user see it.
    // In local dev without database, since the action returns success, we can refresh the window.
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Academic Operations</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage course batches, class timetables, and teacher assignments.
          </p>
        </div>
        <div className="shrink-0">
          <CreateBatchModal 
            courses={courses} 
            teachers={teachers.map(t => ({ id: t.id, name: t.name }))}
            onSuccess={handleBatchCreated}
          />
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Left Column: Batches Grid (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-neutral-400" />
            <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Active Batches ({batchesList.length})</h3>
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            {batchesList.length > 0 ? (
              batchesList.map((batch) => (
                <Card 
                  key={batch.id} 
                  className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 backdrop-blur-sm shadow-sm hover:border-neutral-300 dark:hover:border-neutral-800 transition-all duration-200"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-[180px]">{batch.name}</CardTitle>
                        <CardDescription className="text-[10px] text-neutral-400 mt-0.5">{batch.courseName}</CardDescription>
                      </div>
                      <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400">
                        <MapPin className="h-2.5 w-2.5" />
                        <span>{batch.roomNumber}</span>
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3.5 text-xs">
                    {/* Time schedule badge */}
                    <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-200/50 dark:border-neutral-900 flex items-center gap-2.5 text-neutral-600 dark:text-neutral-300">
                      <Calendar className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      <span className="font-medium text-[11px] truncate">
                        {batch.daysOfWeek.join(", ")} | {format12Hour(batch.startTime)} - {format12Hour(batch.endTime)}
                      </span>
                    </div>

                    {/* Teacher assignment */}
                    <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                      <User className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      <span>Teacher: <span className="font-semibold text-neutral-800 dark:text-neutral-300">{batch.teacherName}</span></span>
                    </div>

                    {/* Action link for marking attendance */}
                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-900 flex justify-end">
                      <Link
                        href={`/academic/batches/${batch.id}/attendance`}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "h-7 text-[10px] font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50/50 dark:hover:bg-neutral-900 flex items-center gap-1 cursor-pointer"
                        )}
                      >
                        <CheckSquare className="h-3.5 w-3.5 text-neutral-400" />
                        <span>Mark Attendance</span>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 border border-dashed border-neutral-200 dark:border-neutral-900 rounded-xl p-12 text-center text-xs text-neutral-500 dark:text-neutral-400">
                No active batches scheduled yet. Click "Schedule New Batch" to begin.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Teacher Registry (1/3 width) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-neutral-400" />
            <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">Teacher Registry</h3>
          </div>

          <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Available Faculty</CardTitle>
              <CardDescription className="text-[10px] text-neutral-400">Active educators and cohort assignments.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="divide-y divide-neutral-100 dark:divide-neutral-900">
                {teachers.map((teacher) => (
                  <div key={teacher.id} className="px-5 py-3 flex items-center justify-between text-xs hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10 transition">
                    <div className="min-w-0">
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">{teacher.name}</p>
                      <p className="text-[10px] text-neutral-400 truncate">{teacher.subject}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold border",
                        teacher.batchesCount > 0 
                          ? "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/15"
                          : "bg-neutral-500/5 text-neutral-500 border-neutral-500/15"
                      )}>
                        {teacher.batchesCount} {teacher.batchesCount === 1 ? "batch" : "batches"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  User, 
  Check, 
  X, 
  AlertCircle,
  Clock,
  Save,
  CheckSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { saveDailyAttendance, DailyAttendanceInput } from "@/app/actions/attendance";
import { cn } from "@/lib/utils";

interface StudentItem {
  id: string;
  name: string;
  email: string;
}

interface AttendanceClientProps {
  batchId: string;
  batchName: string;
  teacherName: string;
  students: StudentItem[];
}

export function AttendanceClient({ batchId, batchName, teacherName, students }: AttendanceClientProps) {
  const router = useRouter();
  
  // Default to today's date in YYYY-MM-DD
  const getTodayStr = () => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  };

  const [date, setDate] = React.useState(getTodayStr());
  const [attendanceState, setAttendanceState] = React.useState<Record<string, "present" | "absent" | "late">>(
    students.reduce((acc, student) => {
      acc[student.id] = "present"; // Default all to present
      return acc;
    }, {} as Record<string, "present" | "absent" | "late">)
  );
  
  const [isPending, setIsPending] = React.useState(false);
  const [actionStatus, setActionStatus] = React.useState<{ success: boolean; message: string } | null>(null);

  const handleStatusChange = (studentId: string, status: "present" | "absent" | "late") => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const markAllAs = (status: "present" | "absent" | "late") => {
    setAttendanceState(
      students.reduce((acc, student) => {
        acc[student.id] = status;
        return acc;
      }, {} as Record<string, "present" | "absent" | "late">)
    );
  };

  const handleSave = async () => {
    setIsPending(true);
    setActionStatus(null);

    const payload: DailyAttendanceInput[] = students.map(s => ({
      studentId: s.id,
      status: attendanceState[s.id]
    }));

    try {
      const res = await saveDailyAttendance(batchId, date, payload);
      if (res.success) {
        setActionStatus({
          success: true,
          message: "Attendance register updated successfully!"
        });
        // Refresh routes
        router.refresh();
      } else {
        setActionStatus({
          success: false,
          message: res.error || "Failed to update attendance."
        });
      }
    } catch (err) {
      setActionStatus({
        success: false,
        message: "An unexpected network error occurred."
      });
    } finally {
      setIsPending(false);
    }
  };

  // Stats counters
  const total = students.length;
  const presentCount = Object.values(attendanceState).filter(s => s === "present").length;
  const lateCount = Object.values(attendanceState).filter(s => s === "late").length;
  const absentCount = Object.values(attendanceState).filter(s => s === "absent").length;
  const attendanceRate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Back button and page header */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/academic" 
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Academics</span>
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Daily Attendance</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Mark student check-ins, tardiness, and absences.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-neutral-400 font-medium">Select Class Date:</span>
            <div className="relative">
              <CalendarIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
              <input
                type="date"
                value={date}
                max={getTodayStr()}
                onChange={(e) => setDate(e.target.value)}
                className="pl-8.5 pr-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 text-xs text-neutral-800 dark:text-neutral-200 focus-visible:outline-none focus:border-neutral-300 dark:focus:border-neutral-800 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cohort Stats Ribbon */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/40 p-4 space-y-1">
          <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Cohort Info</p>
          <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">{batchName}</h4>
          <p className="text-[10px] text-neutral-500 flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{teacherName}</span>
          </p>
        </Card>

        <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/40 p-4 space-y-1">
          <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Attendance Rate</p>
          <h4 className={cn(
            "text-lg font-bold",
            attendanceRate >= 75 ? "text-emerald-500" : "text-rose-500"
          )}>{attendanceRate}%</h4>
          <p className="text-[10px] text-neutral-500">
            {presentCount + lateCount} / {total} active students
          </p>
        </Card>

        <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/40 p-4 space-y-1">
          <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Present / Late</p>
          <h4 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
            {presentCount} <span className="text-xs text-neutral-400 font-normal">Present</span>
          </h4>
          <p className="text-[10px] text-amber-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{lateCount} checked in late</span>
          </p>
        </Card>

        <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/40 p-4 space-y-1">
          <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Absentees</p>
          <h4 className={cn(
            "text-lg font-bold",
            absentCount > 0 ? "text-rose-500" : "text-neutral-400"
          )}>{absentCount} Absent</h4>
          <p className="text-[10px] text-neutral-500">
            Will trigger low attendance alerts if below threshold
          </p>
        </Card>
      </div>

      {/* Main Register card */}
      <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/30 backdrop-blur-sm overflow-hidden shadow-sm">
        <CardHeader className="pb-3 border-b border-neutral-200 dark:border-neutral-900 flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-bold">Register Log</CardTitle>
            <CardDescription className="text-[10px] text-neutral-400">Mark daily attendance statuses.</CardDescription>
          </div>
          
          {/* Bulk selectors */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-400 font-semibold mr-1 uppercase">Bulk Set:</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => markAllAs("present")}
              className="h-7 text-[10px] font-semibold border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300"
            >
              <CheckSquare className="h-3 w-3 text-emerald-500" />
              All Present
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => markAllAs("absent")}
              className="h-7 text-[10px] font-semibold border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300"
            >
              <X className="h-3 w-3 text-rose-500" />
              All Absent
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-neutral-100 dark:divide-neutral-900">
            {students.length > 0 ? (
              students.map((student, idx) => {
                const currentStatus = attendanceState[student.id];
                return (
                  <div 
                    key={student.id} 
                    className={cn(
                      "px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors",
                      currentStatus === "absent" 
                        ? "bg-rose-500/5 hover:bg-rose-500/10 dark:bg-rose-950/5 dark:hover:bg-rose-950/10" 
                        : "hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10"
                    )}
                  >
                    {/* Student Info */}
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-neutral-400 w-5 shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h4 className={cn(
                          "text-xs font-bold transition-all",
                          currentStatus === "absent" ? "text-rose-600 dark:text-rose-400line-through decoration-rose-500/30" : "text-neutral-900 dark:text-neutral-100"
                        )}>{student.name}</h4>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{student.email}</p>
                      </div>
                    </div>

                    {/* Toggle Selector Buttons */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {/* Present button */}
                      <button
                        onClick={() => handleStatusChange(student.id, "present")}
                        className={cn(
                          "inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-semibold border transition cursor-pointer",
                          currentStatus === "present"
                            ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400 shadow-sm"
                            : "bg-transparent border-neutral-200 dark:border-neutral-900 text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                        )}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Present
                      </button>

                      {/* Late button */}
                      <button
                        onClick={() => handleStatusChange(student.id, "late")}
                        className={cn(
                          "inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-semibold border transition cursor-pointer",
                          currentStatus === "late"
                            ? "bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400 shadow-sm"
                            : "bg-transparent border-neutral-200 dark:border-neutral-900 text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                        )}
                      >
                        <Clock className="h-3.5 w-3.5" />
                        Late
                      </button>

                      {/* Absent button */}
                      <button
                        onClick={() => handleStatusChange(student.id, "absent")}
                        className={cn(
                          "inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-semibold border transition cursor-pointer",
                          currentStatus === "absent"
                            ? "bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400 shadow-sm"
                            : "bg-transparent border-neutral-200 dark:border-neutral-900 text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                        )}
                      >
                        <X className="h-3.5 w-3.5" />
                        Absent
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center text-xs text-neutral-500 dark:text-neutral-400">
                No students enrolled in this batch yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status banner and Save action button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-neutral-200 dark:border-neutral-900 rounded-xl bg-white dark:bg-neutral-950/20">
        <div>
          {actionStatus ? (
            <p className={cn(
              "text-xs font-semibold flex items-center gap-1.5",
              actionStatus.success ? "text-emerald-500" : "text-rose-500"
            )}>
              {actionStatus.success ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span>{actionStatus.message}</span>
            </p>
          ) : (
            <p className="text-xs text-neutral-400">
              Save updates to write records to database and log any parent notification events.
            </p>
          )}
        </div>
        
        <Button
          onClick={handleSave}
          disabled={isPending || students.length === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-9 px-6 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-50 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 cursor-pointer"
        >
          {isPending ? (
            <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          <span>Save Changes</span>
        </Button>
      </div>
    </div>
  );
}

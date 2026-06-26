"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Calendar, 
  Check, 
  ExternalLink, 
  FileText, 
  GraduationCap, 
  Loader2, 
  Search, 
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { gradeSubmission } from "@/app/actions/academic-eval";

interface Submission {
  studentId: string;
  studentName: string;
  status: "submitted" | "pending";
  submissionId: string | null;
  submissionUrl: string | null;
  submittedAt: string | null;
  marksObtained: number | null;
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  maxMarks: number;
  batchName: string;
}

interface TeacherGradingClientProps {
  assignment: Assignment;
  initialSubmissions: Submission[];
}

export function TeacherGradingClient({
  assignment,
  initialSubmissions,
}: TeacherGradingClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "pending" | "submitted" | "graded">("all");
  
  // Track inline grading inputs
  const [marksInputs, setMarksInputs] = React.useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    initialSubmissions.forEach(sub => {
      if (sub.marksObtained !== null) {
        initial[sub.studentId] = sub.marksObtained.toString();
      }
    });
    return initial;
  });

  // Track grading loading states per student
  const [gradingStates, setGradingStates] = React.useState<Record<string, boolean>>({});

  const filteredSubmissions = React.useMemo(() => {
    return initialSubmissions.filter(sub => {
      const matchesSearch = sub.studentName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const isGraded = sub.marksObtained !== null;
      const isSubmittedOnly = sub.status === "submitted" && !isGraded;
      const isPending = sub.status === "pending";

      let matchesFilter = true;
      if (statusFilter === "pending") {
        matchesFilter = isPending;
      } else if (statusFilter === "submitted") {
        matchesFilter = isSubmittedOnly;
      } else if (statusFilter === "graded") {
        matchesFilter = isGraded;
      }

      return matchesSearch && matchesFilter;
    });
  }, [initialSubmissions, searchTerm, statusFilter]);

  const handleGradeSubmit = async (studentId: string, submissionId: string | null) => {
    if (!submissionId) {
      alert("Cannot grade a pending submission.");
      return;
    }

    const marksStr = marksInputs[studentId] || "";
    if (marksStr.trim() === "") {
      alert("Please enter a grade/mark.");
      return;
    }

    const marks = parseFloat(marksStr);
    if (isNaN(marks) || marks < 0 || marks > assignment.maxMarks) {
      alert(`Invalid grade. Marks must be a number between 0 and ${assignment.maxMarks}.`);
      return;
    }

    setGradingStates(prev => ({ ...prev, [studentId]: true }));
    try {
      const res = await gradeSubmission(submissionId, marks);
      if (res.success) {
        alert("Grade recorded successfully!");
        router.refresh();
      } else {
        alert("Grading Failed: " + res.error);
      }
    } catch (err: any) {
      alert("Error saving grade: " + (err.message || err));
    } finally {
      setGradingStates(prev => ({ ...prev, [studentId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 border-b border-neutral-200 dark:border-neutral-900 pb-5">
        <div className="flex items-center gap-2">
          <Link
            href="/teacher/assignments"
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-neutral-200 dark:border-neutral-850 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-500 hover:text-neutral-955 dark:hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="text-xs text-neutral-400 font-semibold">Back to Assignments</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                {assignment.title}
              </h2>
              <span className="text-[10px] bg-neutral-100 dark:bg-neutral-900 text-neutral-500 font-semibold px-2 py-0.5 rounded">
                {assignment.batchName}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Due Date: {new Date(assignment.dueDate).toLocaleString()}</span>
              <span>&bull;</span>
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Maximum Marks: {assignment.maxMarks}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="grid gap-6">
        <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold">Submission Registry</CardTitle>
                <CardDescription className="text-xs">
                  Review student submissions, access attached documents, and record grades.
                </CardDescription>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1 sm:w-60">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Search by student name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 text-xs bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                  />
                </div>
                
                <div className="flex border border-neutral-200 dark:border-neutral-800 rounded-lg p-0.5 bg-neutral-50 dark:bg-neutral-900 text-xs">
                  {(["all", "pending", "submitted", "graded"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setStatusFilter(filter)}
                      className={`px-3 py-1.5 rounded-md font-semibold capitalize cursor-pointer transition-all ${
                        statusFilter === filter
                          ? "bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white shadow-xs"
                          : "text-neutral-500 hover:text-neutral-850 dark:hover:text-neutral-350"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-0 sm:px-6">
            <div className="overflow-x-auto border-t sm:border border-neutral-200 dark:border-neutral-900 sm:rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-900 text-neutral-500 font-semibold">
                    <th className="p-4">Student</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Submitted At</th>
                    <th className="p-4">Attachment</th>
                    <th className="p-4 text-right">Score / Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900">
                  {filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((sub) => {
                      const isGraded = sub.marksObtained !== null;
                      const isPending = sub.status === "pending";
                      const isLoading = gradingStates[sub.studentId] || false;

                      return (
                        <tr key={sub.studentId} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20 transition-colors">
                          <td className="p-4 font-bold text-neutral-850 dark:text-neutral-200">
                            {sub.studentName}
                          </td>
                          <td className="p-4">
                            {isPending ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-250 dark:border-amber-900">
                                Pending
                              </span>
                            ) : isGraded ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900">
                                Graded
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-250 dark:border-blue-900">
                                Submitted
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-neutral-500">
                            {sub.submittedAt 
                              ? new Date(sub.submittedAt).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                }) 
                              : "—"}
                          </td>
                          <td className="p-4">
                            {sub.submissionUrl ? (
                              <a
                                href={sub.submissionUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-bold text-neutral-900 hover:text-neutral-700 dark:text-neutral-300 dark:hover:text-white underline cursor-pointer"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                <span>View File</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-neutral-400 italic">No file uploaded</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-1.5 text-neutral-400 italic text-[11px]">
                                <AlertCircle className="h-3.5 w-3.5 text-neutral-400" />
                                <span>Awaiting Upload</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    min="0"
                                    max={assignment.maxMarks}
                                    step="0.5"
                                    placeholder="Marks"
                                    value={marksInputs[sub.studentId] || ""}
                                    onChange={(e) => {
                                      setMarksInputs(prev => ({ ...prev, [sub.studentId]: e.target.value }));
                                    }}
                                    className="w-16 h-8 text-xs text-right bg-neutral-50 dark:bg-neutral-900"
                                    disabled={isLoading}
                                  />
                                  <span className="text-[11px] text-neutral-400 font-semibold px-1">
                                    / {assignment.maxMarks}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleGradeSubmit(sub.studentId, sub.submissionId)}
                                  disabled={isLoading}
                                  className="h-8 px-3 text-xs bg-neutral-950 hover:bg-neutral-850 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-250 cursor-pointer"
                                >
                                  {isLoading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-neutral-400 italic">
                        No submissions matching current search or filters found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

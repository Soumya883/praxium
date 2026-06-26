"use client";

import * as React from "react";
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Loader2, 
  ExternalLink,
  ChevronRight,
  Upload,
  Link2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UploadDropzone } from "@/components/uploadthing";
import { submitAssignment } from "@/app/actions/academic-eval";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  maxMarks: number;
  teacherName: string;
  submitted: boolean;
  submissionUrl: string | null;
  submittedAt: string | null;
  marksObtained: number | null;
  grade: string | null;
}

interface StudentAssignmentsClientProps {
  studentId: string;
  initialAssignments: Assignment[];
}

export function StudentAssignmentsClient({ 
  studentId, 
  initialAssignments 
}: StudentAssignmentsClientProps) {
  const [activeTab, setActiveTab] = React.useState<"pending" | "completed">("pending");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedAssignment, setSelectedAssignment] = React.useState<Assignment | null>(null);
  
  // Solution link inputs
  const [inputMode, setInputMode] = React.useState<"upload" | "link">("upload");
  const [pastedUrl, setPastedUrl] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const pendingAssignments = initialAssignments.filter(a => !a.submitted);
  const completedAssignments = initialAssignments.filter(a => a.submitted);

  const getCountdownText = (dueDateStr: string) => {
    const diffTime = new Date(dueDateStr).getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: "Overdue", class: "text-rose-500 font-bold" };
    } else if (diffDays === 0) {
      return { text: "Due today", class: "text-amber-500 font-bold" };
    } else if (diffDays === 1) {
      return { text: "Due tomorrow", class: "text-amber-500 font-medium" };
    } else {
      return { text: `Due in ${diffDays} days`, class: "text-neutral-400" };
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !pastedUrl) return;

    setIsSubmitting(true);
    try {
      const res = await submitAssignment(selectedAssignment.id, pastedUrl);
      if (res.success) {
        alert("Assignment solution submitted successfully!");
        setDialogOpen(false);
        setPastedUrl("");
        window.location.reload();
      } else {
        alert("Error submitting: " + res.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadComplete = async (res: any) => {
    if (!selectedAssignment || !res || res.length === 0) return;
    
    const fileUrl = res[0].url;
    setIsSubmitting(true);
    try {
      const dbRes = await submitAssignment(selectedAssignment.id, fileUrl);
      if (dbRes.success) {
        alert("File uploaded and assignment submitted successfully!");
        setDialogOpen(false);
        window.location.reload();
      } else {
        alert("Error updating assignment record: " + dbRes.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 dark:border-neutral-900 pb-5">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold tracking-tight">Academic Tasks & Assignments</h2>
          <p className="text-xs text-neutral-500">
            Submit worksheet answers and view scores graded by your instructors.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-neutral-100 dark:bg-neutral-900/50 p-1 rounded-xl border border-neutral-200/40 dark:border-neutral-850/50 self-start">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeTab === "pending"
                ? "bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-sm font-bold"
                : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
            }`}
          >
            Pending ({pendingAssignments.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeTab === "completed"
                ? "bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-sm font-bold"
                : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
            }`}
          >
            Completed ({completedAssignments.length})
          </button>
        </div>
      </div>

      {/* Main Kanban Content Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {activeTab === "pending" ? (
          pendingAssignments.length > 0 ? (
            pendingAssignments.map(asg => {
              const countdown = getCountdownText(asg.dueDate);
              return (
                <Card 
                  key={asg.id} 
                  className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 hover:border-neutral-300 dark:hover:border-neutral-850 transition-all flex flex-col justify-between"
                >
                  <CardHeader className="pb-3.5">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-semibold border border-indigo-500/20 truncate">
                        {asg.teacherName}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-semibold">
                        Max: {asg.maxMarks} marks
                      </span>
                    </div>
                    <CardTitle className="text-sm font-extrabold pt-2 text-neutral-900 dark:text-white line-clamp-1">
                      {asg.title}
                    </CardTitle>
                    <CardDescription className="text-[11px] leading-relaxed line-clamp-2 min-h-[32px] pt-1">
                      {asg.description || "No description provided."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <div className="flex justify-between items-center text-xs border-t border-neutral-100 dark:border-neutral-900 pt-3">
                      <div className="flex items-center gap-1.5 text-neutral-500">
                        <Clock className="h-3.5 w-3.5" />
                        <span className={countdown.class}>{countdown.text}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400">
                        Due: {new Date(asg.dueDate).toLocaleDateString()}
                      </span>
                    </div>

                    <Dialog 
                      open={dialogOpen && selectedAssignment?.id === asg.id} 
                      onOpenChange={(val) => {
                        setDialogOpen(val);
                        if (val) {
                          setSelectedAssignment(asg);
                        }
                      }}
                    >
                      <DialogTrigger className="w-full bg-neutral-950 text-white hover:bg-neutral-850 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 text-xs font-bold h-9 cursor-pointer rounded-lg flex items-center justify-center gap-1">
                        <span>Submit Work</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </DialogTrigger>
                      <DialogContent className="max-w-[420px] bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900">
                        <DialogHeader>
                          <DialogTitle className="text-sm font-semibold">Submit Answer: {selectedAssignment?.title}</DialogTitle>
                          <DialogDescription className="text-xs text-neutral-500">
                            Upload a direct PDF/image worksheet or submit a Google Drive link.
                          </DialogDescription>
                        </DialogHeader>

                        {/* Submission Inputs Toggle */}
                        <div className="flex border-b border-neutral-100 dark:border-neutral-900 pb-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setInputMode("upload")}
                            className={`flex items-center gap-1 pb-1 text-xs font-semibold cursor-pointer ${
                              inputMode === "upload"
                                ? "border-b-2 border-indigo-500 text-neutral-900 dark:text-white"
                                : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-350"
                            }`}
                          >
                            <Upload className="h-3.5 w-3.5" />
                            <span>File Upload</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setInputMode("link")}
                            className={`flex items-center gap-1 pb-1 text-xs font-semibold cursor-pointer ${
                              inputMode === "link"
                                ? "border-b-2 border-indigo-500 text-neutral-900 dark:text-white"
                                : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-350"
                            }`}
                          >
                            <Link2 className="h-3.5 w-3.5" />
                            <span>Shareable Link</span>
                          </button>
                        </div>

                        {inputMode === "upload" ? (
                          <div className="space-y-4 pt-3">
                            <UploadDropzone
                              endpoint="assignmentUploader"
                              onClientUploadComplete={handleUploadComplete}
                              onUploadError={(err: Error) => alert("Upload Error: " + err.message)}
                              className="ut-label:text-xs ut-button:bg-indigo-650 border-neutral-300 dark:border-neutral-800"
                            />
                            {isSubmitting && (
                              <div className="flex items-center justify-center gap-2 text-xs text-indigo-400">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Saving submission to record...</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <form onSubmit={handleManualSubmit} className="space-y-4 pt-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="solution-link" className="text-xs text-neutral-400">Google Drive or Dropbox URL</Label>
                              <Input
                                id="solution-link"
                                type="url"
                                required
                                value={pastedUrl}
                                onChange={(e) => setPastedUrl(e.target.value)}
                                placeholder="https://drive.google.com/..."
                                className="bg-neutral-50 dark:bg-neutral-900 text-xs h-9"
                              />
                            </div>
                            <div className="flex justify-end gap-2.5 pt-2">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setDialogOpen(false)}
                                className="h-9 px-3 text-xs"
                              >
                                Cancel
                              </Button>
                              <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold h-9 px-4 cursor-pointer flex items-center gap-1.5"
                              >
                                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                <span>Submit Link</span>
                              </Button>
                            </div>
                          </form>
                        )}
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center space-y-3 bg-neutral-50/20 dark:bg-neutral-900/10 border border-dashed border-neutral-200 dark:border-neutral-900 rounded-2xl">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold">All caught up!</h4>
                <p className="text-xs text-neutral-500">You have no pending assignments due.</p>
              </div>
            </div>
          )
        ) : (
          completedAssignments.length > 0 ? (
            completedAssignments.map(asg => (
              <Card 
                key={asg.id} 
                className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 hover:border-neutral-300 dark:hover:border-neutral-850 transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3.5">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] bg-neutral-100 dark:bg-neutral-900 text-neutral-500 px-2 py-0.5 rounded font-medium truncate max-w-[100px]">
                      {asg.teacherName}
                    </span>
                    
                    {asg.marksObtained !== null ? (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-500/20">
                        Score: {asg.marksObtained}/{asg.maxMarks}
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold border border-amber-500/20 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>Pending Grading</span>
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-sm font-extrabold pt-2 text-neutral-900 dark:text-white line-clamp-1">
                    {asg.title}
                  </CardTitle>
                  <CardDescription className="text-[11px] leading-relaxed line-clamp-2 min-h-[32px] pt-1">
                    {asg.description || "No description provided."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="flex justify-between items-center text-[10px] text-neutral-450 border-t border-neutral-100 dark:border-neutral-900 pt-3.5">
                    <span>Submitted: {asg.submittedAt ? new Date(asg.submittedAt).toLocaleDateString() : "N/A"}</span>
                    {asg.grade && (
                      <span className="font-bold text-indigo-500 uppercase">Grade: {asg.grade}</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {asg.submissionUrl && (
                      <a
                        href={asg.submissionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>View Solution</span>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-16 text-center space-y-3 bg-neutral-50/20 dark:bg-neutral-900/10 border border-dashed border-neutral-200 dark:border-neutral-900 rounded-2xl">
              <FileText className="h-10 w-10 text-neutral-400 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold">No submissions yet</h4>
                <p className="text-xs text-neutral-500">You haven't submitted any assignment answers.</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

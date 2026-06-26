"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  Calendar, 
  Plus, 
  Users, 
  Loader2, 
  ArrowRight,
  ClipboardList,
  GraduationCap,
  ChevronRight
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAssignment } from "@/app/actions/academic-eval";

interface Batch {
  id: string;
  name: string;
  courseName: string;
  roomNumber: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  maxMarks: number;
  batchId: string;
  batchName: string;
}

interface TeacherAssignmentsClientProps {
  batches: Batch[];
  assignments: Assignment[];
}

export function TeacherAssignmentsClient({ 
  batches, 
  assignments 
}: TeacherAssignmentsClientProps) {
  const router = useRouter();
  
  // Filtering & Selection state
  const [selectedBatchId, setSelectedBatchId] = React.useState<string | "all">("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  
  // Creation form state
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [maxMarks, setMaxMarks] = React.useState("100");
  const [targetBatchId, setTargetBatchId] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);

  const filteredAssignments = selectedBatchId === "all"
    ? assignments
    : assignments.filter(a => a.batchId === selectedBatchId);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate || !targetBatchId) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsCreating(true);
    const res = await createAssignment({
      title,
      description: description || null,
      dueDate: new Date(dueDate).toISOString(),
      maxMarks: parseInt(maxMarks) || 100,
      batchId: targetBatchId,
    });

    setIsCreating(false);
    if (res.success) {
      alert("Assignment dispatched successfully!");
      setTitle("");
      setDescription("");
      setDueDate("");
      setTargetBatchId("");
      setDialogOpen(false);
      router.refresh();
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 dark:border-neutral-900 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Teacher Assignments Panel</h2>
          <p className="text-xs text-neutral-500">
            Dispatch worksheets, assign tasks to cohorts, and grade student submissions.
          </p>
        </div>

        {/* Create Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger className="bg-neutral-950 text-white hover:bg-neutral-850 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-250 text-xs font-bold h-9 px-4.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow">
            <Plus className="h-4 w-4" />
            <span>Create Assignment</span>
          </DialogTrigger>
          <DialogContent className="max-w-[420px] bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold">Deploy New Class Assignment</DialogTitle>
              <DialogDescription className="text-xs text-neutral-500">
                Provide details to publish a new task for your batch students.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateAssignment} className="space-y-4 pt-2.5">
              <div className="space-y-1.5">
                <Label htmlFor="asg-title" className="text-xs text-neutral-500">Assignment Title</Label>
                <Input 
                  id="asg-title" 
                  required
                  placeholder="e.g. Gauss's Law Applications"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-neutral-50 dark:bg-neutral-900 text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="asg-desc" className="text-xs text-neutral-500">Description / Guidelines</Label>
                <Input 
                  id="asg-desc" 
                  placeholder="Describe key guidelines, questions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-neutral-50 dark:bg-neutral-900 text-xs h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="asg-marks" className="text-xs text-neutral-500">Max Marks</Label>
                  <Input 
                    id="asg-marks" 
                    type="number"
                    required
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                    className="bg-neutral-50 dark:bg-neutral-900 text-xs h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="asg-due" className="text-xs text-neutral-500">Due Date</Label>
                  <Input 
                    id="asg-due" 
                    type="datetime-local"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-neutral-50 dark:bg-neutral-900 text-xs h-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="asg-batch" className="text-xs text-neutral-500">Target Cohort / Batch</Label>
                <Select value={targetBatchId} onValueChange={(val) => setTargetBatchId(val || "")}>
                  <SelectTrigger className="bg-neutral-50 dark:bg-neutral-900 text-xs h-9 focus-visible:ring-neutral-400">
                    <SelectValue placeholder="Select target batch" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 text-neutral-900 dark:text-neutral-200">
                    {batches.map(b => (
                      <SelectItem key={b.id} value={b.id} className="text-xs cursor-pointer">
                        {b.name} ({b.courseName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  disabled={isCreating}
                  className="bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold h-9 px-4 cursor-pointer flex items-center gap-1.5"
                >
                  {isCreating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Dispatch Task</span>
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: My Batches */}
        <div className="w-full lg:w-1/3 space-y-4 shrink-0">
          <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50">
            <CardHeader className="pb-3.5">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-neutral-400" />
                <span>My Cohort Batches</span>
              </CardTitle>
              <CardDescription className="text-[11px]">
                Filter assignments board by selecting a class.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 px-3">
              <button
                onClick={() => setSelectedBatchId("all")}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                  selectedBatchId === "all"
                    ? "bg-neutral-100 dark:bg-neutral-900 text-neutral-950 dark:text-white border border-neutral-250 dark:border-neutral-800"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 border border-transparent"
                }`}
              >
                <span>All Managed Cohorts</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
              {batches.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBatchId(b.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                    selectedBatchId === b.id
                      ? "bg-neutral-100 dark:bg-neutral-900 text-neutral-950 dark:text-white border border-neutral-250 dark:border-neutral-800"
                      : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 border border-transparent"
                  }`}
                >
                  <div className="truncate max-w-[200px]">
                    <div className="font-bold text-neutral-800 dark:text-neutral-200">{b.name}</div>
                    <div className="text-[10px] text-neutral-400">{b.courseName} &bull; {b.roomNumber}</div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Assignments Board */}
        <div className="flex-1 space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {filteredAssignments.length > 0 ? (
              filteredAssignments.map(asg => (
                <Card 
                  key={asg.id} 
                  className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 hover:border-neutral-300 dark:hover:border-neutral-850 transition-all flex flex-col justify-between"
                >
                  <CardHeader className="pb-3.5">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] bg-neutral-100 dark:bg-neutral-900 text-neutral-500 px-2 py-0.5 rounded font-medium truncate max-w-[150px]">
                        {asg.batchName}
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
                    <div className="flex justify-between items-center text-[10px] text-neutral-400 border-t border-neutral-100 dark:border-neutral-900 pt-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Due: {new Date(asg.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <Link 
                      href={`/teacher/assignments/${asg.id}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 text-xs font-bold cursor-pointer"
                    >
                      <ClipboardList className="h-4 w-4" />
                      <span>Grade Submissions</span>
                    </Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-16 text-center space-y-3 border border-dashed border-neutral-200 dark:border-neutral-900 rounded-2xl">
                <BookOpen className="h-10 w-10 text-neutral-400 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold">No assignments deployed</h4>
                  <p className="text-xs text-neutral-500">Published tasks for this cohort will show up here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

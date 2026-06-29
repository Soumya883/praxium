"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, BookOpen, Calendar, Users, Target } from "lucide-react";
import { createOfflineExam } from "@/app/actions/offline-exams";

export function OfflineExamsClient({ 
  batches, 
  initialExams 
}: { 
  batches: any[];
  initialExams: any[];
}) {
  const router = useRouter();
  const [isCreating, setIsCreating] = React.useState(false);
  const [showDialog, setShowDialog] = React.useState(false);

  // Form State
  const [subject, setSubject] = React.useState("");
  const [batchId, setBatchId] = React.useState("");
  const [maxMarks, setMaxMarks] = React.useState("100");
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = React.useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !batchId || !maxMarks || !date) {
      setError("Please fill all fields.");
      return;
    }
    setError("");
    setIsCreating(true);
    try {
      const res = await createOfflineExam({
        batchId,
        subject,
        maxMarks: parseInt(maxMarks),
        date,
      });

      if (res.success) {
        setShowDialog(false);
        // Reset form
        setSubject("");
        setBatchId("");
        setMaxMarks("100");
        router.push(`/teacher/exams/offline/${res.examId}`);
      } else {
        setError(res.error || "Failed to create exam");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Offline Exams</h1>
          <p className="text-neutral-500 text-sm">Manage test scores and board results for your batches.</p>
        </div>
        <button
          onClick={() => setShowDialog(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Record New Exam
        </button>
      </div>

      {initialExams.length === 0 ? (
        <div className="border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl p-12 text-center bg-neutral-50 dark:bg-neutral-900/50">
          <BookOpen className="h-10 w-10 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 dark:text-white">No exams recorded</h3>
          <p className="text-neutral-500 mt-2 max-w-sm mx-auto">
            You haven't recorded any offline exams yet. Click the button above to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialExams.map((exam) => (
            <div 
              key={exam.id} 
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 hover:border-indigo-500/30 transition-all cursor-pointer shadow-sm hover:shadow-md"
              onClick={() => router.push(`/teacher/exams/offline/${exam.id}`)}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-neutral-900 dark:text-white truncate" title={exam.subject}>
                  {exam.subject}
                </h3>
                <span className="text-xs font-medium px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded-md whitespace-nowrap">
                  {exam.maxMarks} Marks
                </span>
              </div>
              <div className="space-y-2 mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 opacity-70" />
                  <span className="truncate">{exam.batchName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 opacity-70" />
                  <span>{new Date(exam.date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-sm">
                <span className="text-neutral-500">Recorded {new Date(exam.createdAt).toLocaleDateString()}</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-medium group-hover:underline">View Scores →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">Record Offline Exam</h2>
            <p className="text-sm text-neutral-500 mb-6">Create a record for an offline test or exam.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Subject / Exam Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Physics Midterm"
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Batch <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                >
                  <option value="" disabled>Select a batch</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.courseName})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Max Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Exam Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  className="flex-1 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {isCreating ? "Creating..." : "Create & Grade"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

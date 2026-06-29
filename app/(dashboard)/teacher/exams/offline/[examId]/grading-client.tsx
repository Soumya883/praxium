"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Send, CheckCircle2 } from "lucide-react";
import { uploadExamScores } from "@/app/actions/offline-exams";
import { sendExamResultWhatsApp } from "@/app/actions/whatsapp";
import Link from "next/link";

export function GradingClient({ 
  exam, 
  students, 
  existingScores 
}: { 
  exam: any;
  students: any[];
  existingScores: any[];
}) {
  const router = useRouter();
  
  // State for scores: map of studentId -> { marksObtained, remarks }
  const [scores, setScores] = React.useState<Record<string, { marksObtained: string; remarks: string }>>(() => {
    const initial: Record<string, { marksObtained: string; remarks: string }> = {};
    // Pre-fill existing scores
    students.forEach(s => {
      const existing = existingScores.find(es => es.studentId === s.id);
      initial[s.id] = {
        marksObtained: existing ? existing.marksObtained : "",
        remarks: existing?.remarks || "",
      };
    });
    return initial;
  });

  const [notifyParents, setNotifyParents] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const handleScoreChange = (studentId: string, field: "marksObtained" | "remarks", value: string) => {
    setScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      // Filter out empty marks
      const scoresToSubmit = Object.entries(scores)
        .filter(([_, data]) => data.marksObtained !== "")
        .map(([studentId, data]) => ({
          studentId,
          marksObtained: parseFloat(data.marksObtained),
          remarks: data.remarks
        }));

      if (scoresToSubmit.length === 0) {
        setError("Please enter marks for at least one student.");
        setIsSaving(false);
        return;
      }

      // 1. Save scores to DB
      const res = await uploadExamScores({
        examId: exam.id,
        scores: scoresToSubmit
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to save scores");
      }

      // 2. Dispatch WhatsApp notifications if checked
      if (notifyParents) {
        let sentCount = 0;
        for (const score of scoresToSubmit) {
          try {
            await sendExamResultWhatsApp(
              score.studentId,
              exam.subject,
              score.marksObtained.toString(),
              exam.maxMarks.toString(),
              score.remarks
            );
            sentCount++;
          } catch (wErr) {
            console.error("WhatsApp dispatch failed for", score.studentId, wErr);
          }
        }
        setSuccess(`Saved successfully and notified ${sentCount} parents via WhatsApp!`);
      } else {
        setSuccess("Scores saved successfully!");
      }

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/teacher/exams/offline" className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-2 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Exams
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Grade: {exam.subject}</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Batch: <span className="font-medium text-neutral-700 dark:text-neutral-300">{exam.batchName}</span> • 
            Date: <span className="font-medium text-neutral-700 dark:text-neutral-300">{new Date(exam.date).toLocaleDateString()}</span> • 
            Max Marks: <span className="font-medium text-indigo-600 dark:text-indigo-400">{exam.maxMarks}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer pl-2">
            <input 
              type="checkbox" 
              checked={notifyParents}
              onChange={(e) => setNotifyParents(e.target.checked)}
              className="rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700"
            />
            <Send className="h-4 w-4 text-green-600 dark:text-green-500" />
            Notify Parents via WhatsApp
          </label>
          <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800 mx-1"></div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            {isSaving ? "Saving..." : <><Save className="h-4 w-4" /> Save Scores</>}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 rounded-xl text-sm">
          <CheckCircle2 className="h-5 w-5" />
          {success}
        </div>
      )}

      {/* Grading Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Student Name</th>
                <th className="px-6 py-4 font-medium w-48">Marks Obtained</th>
                <th className="px-6 py-4 font-medium">Teacher Remarks / Improvements</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-neutral-500">
                    No students found in this batch.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">
                      {student.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max={exam.maxMarks}
                          step="0.5"
                          placeholder="0.0"
                          value={scores[student.id]?.marksObtained || ""}
                          onChange={(e) => handleScoreChange(student.id, "marksObtained", e.target.value)}
                          className="w-32 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="absolute right-12 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">
                          / {exam.maxMarks}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        placeholder="E.g. Needs improvement in calculus..."
                        value={scores[student.id]?.remarks || ""}
                        onChange={(e) => handleScoreChange(student.id, "remarks", e.target.value)}
                        className="w-full max-w-md rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import * as React from "react";
import { db } from "@/db";
import { batches, instituteExams, students, users, examScores } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { checkRole } from "@/app/actions/rbac-utils";
import { getTenantDb } from "@/lib/db/tenant";
import { GradingClient } from "./grading-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Grade Offline Exam | Praxium",
};

export default async function GradeOfflineExamPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  let examData: any = null;
  let batchStudents: any[] = [];
  let existingScores: any[] = [];
  let loadError: string | null = null;

  try {
    const { authorized } = await checkRole(["ADMIN", "TEACHER"]);
    const { instituteId } = await getTenantDb();

    if (!authorized) {
      return (
        <div className="py-6 max-w-5xl mx-auto">
          <div className="p-6 bg-red-50 dark:bg-red-500/10 border border-red-200 rounded-xl text-red-700">
            Unauthorized: Only teachers and admins can access this page.
          </div>
        </div>
      );
    }

    // 1. Fetch exam details — query by examId only first, no instituteId filter
    //    so we don't miss it due to tenant mismatch
    const [exam] = await db
      .select({
        id: instituteExams.id,
        subject: instituteExams.subject,
        maxMarks: instituteExams.maxMarks,
        date: instituteExams.date,
        batchId: instituteExams.batchId,
      })
      .from(instituteExams)
      .where(eq(instituteExams.id, examId))
      .limit(1);

    if (!exam) {
      return (
        <div className="py-6 max-w-5xl mx-auto">
          <div className="p-6 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 rounded-xl text-amber-700 space-y-2">
            <h2 className="font-bold">Exam Not Found</h2>
            <p className="text-sm">The exam with ID <code className="bg-amber-100 px-1 rounded">{examId}</code> does not exist in the database.</p>
            <a href="/teacher/exams/offline" className="text-sm text-indigo-600 underline">← Back to Offline Exams</a>
          </div>
        </div>
      );
    }

    // 2. Fetch batch name separately (no join dependency)
    let batchName = "Unknown Batch";
    if (exam.batchId) {
      const [batch] = await db
        .select({ name: batches.name })
        .from(batches)
        .where(eq(batches.id, exam.batchId))
        .limit(1);
      if (batch) batchName = batch.name;
    }

    examData = { ...exam, batchName };

    // 3. Fetch all students in the batch first
    if (exam.batchId) {
      batchStudents = await db
        .select({
          id: students.id,
          name: users.name,
        })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .where(and(eq(students.batchId, exam.batchId), eq(students.instituteId, instituteId)));
    }

    // Fallback: if no students found in the batch, load ALL students in the institute
    if (batchStudents.length === 0) {
      batchStudents = await db
        .select({
          id: students.id,
          name: users.name,
        })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .where(eq(students.instituteId, instituteId));
    }

    // 4. Fetch existing scores for this exam
    existingScores = await db
      .select({
        studentId: examScores.studentId,
        marksObtained: examScores.marksObtained,
        remarks: examScores.remarks,
      })
      .from(examScores)
      .where(eq(examScores.examId, examId));

  } catch (error: any) {
    console.error("Failed to load exam grading data", error);
    loadError = error?.message || "An unknown error occurred while loading exam data.";
  }

  if (loadError) {
    return (
      <div className="py-6 max-w-5xl mx-auto">
        <div className="p-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 rounded-xl space-y-2">
          <h2 className="font-bold text-base">Failed to load exam</h2>
          <p className="text-sm">{loadError}</p>
          <a href="/teacher/exams/offline" className="text-sm text-indigo-600 underline">← Back to Offline Exams</a>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <GradingClient 
        exam={examData} 
        students={batchStudents} 
        existingScores={existingScores} 
      />
    </div>
  );
}

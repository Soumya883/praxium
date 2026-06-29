import * as React from "react";
import { db } from "@/db";
import { batches, instituteExams, students, users, examScores } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { checkRole } from "@/app/actions/rbac-utils";
import { getTenantDb } from "@/lib/db/tenant";
import { GradingClient } from "./grading-client";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Grade Offline Exam | Praxium",
};

export default async function GradeOfflineExamPage({ params }: { params: { examId: string } }) {
  let examData: any = null;
  let batchStudents: any[] = [];
  let existingScores: any[] = [];
  let loadError: string | null = null;

  try {
    const { authorized, userId } = await checkRole(["ADMIN", "TEACHER"]);
    const { instituteId } = await getTenantDb();

    if (!authorized) {
      return (
        <div className="py-6 max-w-5xl mx-auto">
          <div className="p-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 rounded-xl">
            Unauthorized: Only teachers and admins can access this page.
          </div>
        </div>
      );
    }

    // 1. Fetch exam details
    const [exam] = await db
      .select({
        id: instituteExams.id,
        subject: instituteExams.subject,
        maxMarks: instituteExams.maxMarks,
        date: instituteExams.date,
        batchId: instituteExams.batchId,
        batchName: batches.name,
      })
      .from(instituteExams)
      .innerJoin(batches, eq(instituteExams.batchId, batches.id))
      .where(and(eq(instituteExams.id, params.examId), eq(instituteExams.instituteId, instituteId)))
      .limit(1);

    if (!exam) {
      notFound();
    }
    examData = exam;

    // 2. Fetch all students in the batch
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

    // Fallback: if no students in batch, load all students in the institute
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

    // 3. Fetch existing scores for this exam
    existingScores = await db
      .select({
        studentId: examScores.studentId,
        marksObtained: examScores.marksObtained,
        remarks: examScores.remarks,
      })
      .from(examScores)
      .where(and(eq(examScores.examId, params.examId), eq(examScores.instituteId, instituteId)));

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
          <p className="text-xs text-red-500">If this error persists, the database may need a schema migration. Contact support.</p>
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

import * as React from "react";
import { db } from "@/db";
import { batches, courses, instituteExams, students, users, examScores } from "@/db/schema";
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

  try {
    const { authorized, userId } = await checkRole(["ADMIN", "TEACHER"]);
    const { instituteId } = await getTenantDb();

    if (authorized && userId) {
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
      batchStudents = await db
        .select({
          id: students.id,
          name: users.name,
        })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .where(and(eq(students.batchId, exam.batchId), eq(students.instituteId, instituteId)));

      // 3. Fetch existing scores for this exam
      existingScores = await db
        .select({
          studentId: examScores.studentId,
          marksObtained: examScores.marksObtained,
          remarks: examScores.remarks,
        })
        .from(examScores)
        .where(and(eq(examScores.examId, params.examId), eq(examScores.instituteId, instituteId)));
    }
  } catch (error) {
    console.error("Failed to load exam grading data", error);
    notFound();
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

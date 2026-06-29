"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { instituteExams, examScores } from "@/db/schema";
import { checkRole } from "./rbac-utils";
import { getTenantDb } from "@/lib/db/tenant";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createOfflineExamSchema = z.object({
  batchId: z.string().min(1, "Batch is required"),
  subject: z.string().min(1, "Subject is required"),
  maxMarks: z.number().positive(),
  date: z.string(),
});

export async function createOfflineExam(data: z.infer<typeof createOfflineExamSchema>) {
  try {
    const { authorized } = await checkRole(["ADMIN", "TEACHER"]);
    if (!authorized) {
      return { success: false, error: "Unauthorized access: Only teachers/admins can create exams." };
    }

    const validated = createOfflineExamSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { instituteId } = await getTenantDb();
    const examId = crypto.randomUUID();

    await db.insert(instituteExams).values({
      id: examId,
      instituteId,
      batchId: validated.data.batchId,
      subject: validated.data.subject,
      maxMarks: validated.data.maxMarks,
      date: validated.data.date,
    });

    revalidatePath("/teacher/exams/offline");
    revalidatePath("/admin/academic");

    return { success: true, examId };
  } catch (error: any) {
    console.error("[CREATE OFFLINE EXAM ERROR]:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}

const scoreEntrySchema = z.object({
  studentId: z.string().min(1),
  marksObtained: z.number().min(0),
  remarks: z.string().optional(),
});

const uploadScoresSchema = z.object({
  examId: z.string().min(1),
  scores: z.array(scoreEntrySchema),
});

export async function uploadExamScores(data: z.infer<typeof uploadScoresSchema>) {
  try {
    const { authorized } = await checkRole(["ADMIN", "TEACHER"]);
    if (!authorized) {
      return { success: false, error: "Unauthorized access: Only teachers/admins can upload scores." };
    }

    const validated = uploadScoresSchema.safeParse(data);
    if (!validated.success) {
      const firstError = validated.error.issues[0];
      return { success: false, error: firstError?.message || "Invalid score data submitted." };
    }

    const { instituteId } = await getTenantDb();
    
    await db.transaction(async (tx) => {
      // Clear existing scores for these students for this exam
      await tx.delete(examScores)
        .where(
          and(
            eq(examScores.examId, validated.data.examId),
            eq(examScores.instituteId, instituteId)
          )
        );

      // Insert new scores
      const scoreRows = validated.data.scores.map(score => ({
        id: crypto.randomUUID(),
        examId: validated.data.examId,
        studentId: score.studentId,
        marksObtained: score.marksObtained.toString(),
        remarks: score.remarks || null,
        instituteId,
      }));

      if (scoreRows.length > 0) {
        await tx.insert(examScores).values(scoreRows);
      }
    });

    revalidatePath(`/teacher/exams/offline/${validated.data.examId}`);
    revalidatePath("/student-portal");
    revalidatePath("/admin/students");

    return { success: true };
  } catch (error: any) {
    console.error("[UPLOAD SCORES ERROR]:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}

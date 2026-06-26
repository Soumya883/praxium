"use server";

import { revalidatePath } from "next/cache";
import { eq, and, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { mockExams, questions, examAttempts, attemptAnswers, students } from "@/db/schema";
import { checkRole } from "./rbac-utils";
import { getTenantDb } from "@/lib/db/tenant";

import { createExamSchema } from "./schemas";

/**
 * Creates a timed mock exam and inserts questions in a single transaction.
 * Scoped to active tenant.
 */
export async function createMockExam(data: z.infer<typeof createExamSchema>) {
  try {
    const { authorized, role, userId } = await checkRole(["ADMIN", "TEACHER"]);
    if (!authorized || !userId) {
      return { success: false, error: "Unauthorized access: Only teachers/admins can create exams." };
    }

    const validated = createExamSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.issues.map(i => i.message).join(", ") };
    }

    const { instituteId } = await getTenantDb();

    // Perform transaction
    const examId = await db.transaction(async (tx) => {
      const examId = "exam_" + Math.random().toString(36).substring(2, 11);
      
      // 1. Insert exam
      await tx.insert(mockExams).values({
        id: examId,
        batchId: validated.data.batchId,
        title: validated.data.title,
        durationMinutes: validated.data.durationMinutes,
        startTime: new Date(validated.data.startTime),
        endTime: new Date(validated.data.endTime),
        instituteId,
      });

      // 2. Insert questions
      const questionRecords = validated.data.questions.map((q) => {
        const qId = "q_" + Math.random().toString(36).substring(2, 11);
        return {
          id: qId,
          examId,
          questionText: q.questionText,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          positiveMarks: q.positiveMarks,
          negativeMarks: q.negativeMarks,
          instituteId,
        };
      });

      if (questionRecords.length > 0) {
        await tx.insert(questions).values(questionRecords);
      }

      return examId;
    });

    revalidatePath("/teacher/exams");
    revalidatePath("/student-portal");

    return { success: true, examId, message: "Mock exam created successfully!" };
  } catch (error: any) {
    console.error("[CREATE MOCK EXAM ERROR]:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

/**
 * Starts or retrieves an ongoing exam attempt for a student.
 * Scoped to active tenant.
 */
export async function startExamAttempt(examId: string) {
  try {
    const { authorized, role, userId } = await checkRole(["ADMIN", "STUDENT"]);
    if (!authorized || !userId) {
      return { success: false, error: "Unauthorized access" };
    }

    const { instituteId } = await getTenantDb();

    // 1. Resolve student profile
    let activeStudentId = "";
    if (role === "STUDENT") {
      const [studentProfile] = await db
        .select()
        .from(students)
        .where(and(eq(students.userId, userId), eq(students.instituteId, instituteId)))
        .limit(1);

      if (!studentProfile) {
        return { success: false, error: "Student profile not found." };
      }
      activeStudentId = studentProfile.id;
    } else {
      // Fallback for Admin testing
      const [firstStudent] = await db
        .select()
        .from(students)
        .where(eq(students.instituteId, instituteId))
        .limit(1);
      
      if (!firstStudent) {
        return { success: false, error: "No student profiles exist to test this exam." };
      }
      activeStudentId = firstStudent.id;
    }

    // 2. Check for existing attempts
    const [existingAttempt] = await db
      .select()
      .from(examAttempts)
      .where(
        and(
          eq(examAttempts.examId, examId),
          eq(examAttempts.studentId, activeStudentId),
          eq(examAttempts.instituteId, instituteId)
        )
      )
      .limit(1);

    if (existingAttempt) {
      return { 
        success: true, 
        attemptId: existingAttempt.id, 
        alreadySubmitted: existingAttempt.submitTime !== null 
      };
    }

    // 3. Start a new attempt
    const attemptId = "att_" + Math.random().toString(36).substring(2, 11);
    await db.insert(examAttempts).values({
      id: attemptId,
      examId,
      studentId: activeStudentId,
      startTime: new Date(),
      instituteId,
    });

    return { success: true, attemptId, alreadySubmitted: false };
  } catch (error: any) {
    console.error("[START EXAM ATTEMPT ERROR]:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

/**
 * Grades a timed mock exam attempt using NTA grading logic (positive / negative marks).
 * Scoped to active tenant.
 */
export async function submitExamAttempt(
  attemptId: string,
  answers: Array<{ questionId: string; selectedOptionIndex: number | null }>
) {
  try {
    const { authorized, role, userId } = await checkRole(["ADMIN", "STUDENT"]);
    if (!authorized) {
      return { success: false, error: "Unauthorized access" };
    }

    const { instituteId } = await getTenantDb();

    // 1. Fetch the attempt record
    const [attempt] = await db
      .select()
      .from(examAttempts)
      .where(and(eq(examAttempts.id, attemptId), eq(examAttempts.instituteId, instituteId)))
      .limit(1);

    if (!attempt) {
      return { success: false, error: "Exam attempt not found." };
    }

    if (attempt.submitTime) {
      return { success: false, error: "This exam attempt has already been submitted." };
    }

    // 2. Fetch the mock exam questions
    const examQuestions = await db
      .select()
      .from(questions)
      .where(and(eq(questions.examId, attempt.examId), eq(questions.instituteId, instituteId)));

    // 3. Compute score based on NTA negative marking logic
    let totalScore = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;
    let maxPossibleMarks = 0;

    const answerInserts: Array<{
      id: string;
      attemptId: string;
      questionId: string;
      selectedOptionIndex: number | null;
      instituteId: string;
    }> = [];

    examQuestions.forEach((q) => {
      maxPossibleMarks += q.positiveMarks;

      const studentAns = answers.find((ans) => ans.questionId === q.id);
      const selectedIdx = studentAns?.selectedOptionIndex ?? null;

      // Add to attempt answers table list
      const ansId = "ans_" + Math.random().toString(36).substring(2, 11);
      answerInserts.push({
        id: ansId,
        attemptId,
        questionId: q.id,
        selectedOptionIndex: selectedIdx,
        instituteId,
      });

      if (selectedIdx === null || selectedIdx === -1) {
        skippedCount++;
      } else if (selectedIdx === q.correctOptionIndex) {
        correctCount++;
        totalScore += q.positiveMarks;
      } else {
        incorrectCount++;
        totalScore -= q.negativeMarks;
      }
    });

    // 4. Save results in a single transaction
    await db.transaction(async (tx) => {
      // Insert student answers
      if (answerInserts.length > 0) {
        await tx.insert(attemptAnswers).values(answerInserts);
      }

      // Update attempt score and submit time
      await tx
        .update(examAttempts)
        .set({
          totalScore,
          submitTime: new Date(),
        })
        .where(eq(examAttempts.id, attemptId));
    });

    revalidatePath("/student-portal");

    return {
      success: true,
      totalScore,
      maxPossibleMarks,
      correctCount,
      incorrectCount,
      skippedCount,
      accuracy: examQuestions.length > 0 
        ? Math.round((correctCount / examQuestions.length) * 100) 
        : 0,
    };
  } catch (error: any) {
    console.error("[SUBMIT EXAM ATTEMPT ERROR]:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

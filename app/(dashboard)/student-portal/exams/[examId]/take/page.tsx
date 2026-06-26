import * as React from "react";
import { db } from "@/db";
import { mockExams, questions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { checkRole } from "@/app/actions/rbac-utils";
import { getTenantDb } from "@/lib/db/tenant";
import { startExamAttempt } from "@/app/actions/exams";
import { StudentExamTakeClient } from "./take-client";
import { currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Online CBT Exam Console | Praxium",
};

const mockQuestions = [
  {
    id: "q_demo_1",
    questionText: "A copper wire of length L and cross-sectional area A has resistance R. If it is stretched to twice its initial length, what will be its new resistance (assuming density remains constant)?",
    options: ["R", "2R", "4R", "8R"],
    positiveMarks: 4,
    negativeMarks: 1,
  },
  {
    id: "q_demo_2",
    questionText: "Two charges +q and -q are situated at a distance r. The force between them is F. If the distance is halved and charges are doubled, what is the new force?",
    options: ["F", "4F", "8F", "16F"],
    positiveMarks: 4,
    negativeMarks: 1,
  },
  {
    id: "q_demo_3",
    questionText: "A particle of mass m and charge q enters a uniform magnetic field B perpendicularly with velocity v. What is the time period of its circular motion?",
    options: ["2πm / (qB)", "2πq / (mB)", "2πB / (mq)", "πm / (qB)"],
    positiveMarks: 4,
    negativeMarks: 1,
  },
];

const mockExamDetail = {
  id: "exam_demo",
  title: "AITS Chapter Mock Test — Electrostatics & Current Electricity",
  durationMinutes: 180,
};

export default async function TakeExamPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  let examDetail: any = null;
  let questionsList: any[] = [];
  let attemptId = "att_demo_123";
  let studentName = "Sushvine Demo Student";
  let useFallback = false;

  try {
    const { authorized, role, userId } = await checkRole(["ADMIN", "STUDENT"]);
    const { instituteId } = await getTenantDb();

    if (!authorized) {
      useFallback = true;
    } else {
      // 1. Fetch Clerk user profile name
      const user = await currentUser();
      if (user) {
        studentName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Student Candidate";
      }

      // 2. Fetch Mock Exam details
      const [exam] = await db
        .select()
        .from(mockExams)
        .where(and(eq(mockExams.id, examId), eq(mockExams.instituteId, instituteId)))
        .limit(1);

      if (!exam) {
        useFallback = true;
      } else {
        examDetail = {
          id: exam.id,
          title: exam.title,
          durationMinutes: exam.durationMinutes,
        };

        // 3. Fetch questions - SECURE: Omit correctOptionIndex so it cannot be inspected in client payload!
        const dbQuestions = await db
          .select({
            id: questions.id,
            questionText: questions.questionText,
            options: questions.options,
            positiveMarks: questions.positiveMarks,
            negativeMarks: questions.negativeMarks,
          })
          .from(questions)
          .where(and(eq(questions.examId, examId), eq(questions.instituteId, instituteId)));

        questionsList = dbQuestions.map(q => ({
          id: q.id,
          questionText: q.questionText,
          options: q.options as string[],
          positiveMarks: q.positiveMarks,
          negativeMarks: q.negativeMarks,
        }));

        // 4. Start/retrieve attempt
        const attRes = await startExamAttempt(examId);
        if (attRes.success && attRes.attemptId) {
          attemptId = attRes.attemptId;
        } else {
          useFallback = true;
        }
      }
    }
  } catch (error) {
    console.warn("DB connection offline during take exam fetch. Using fallback CBT.");
    useFallback = true;
  }

  if (useFallback || !examDetail || questionsList.length === 0) {
    examDetail = mockExamDetail;
    questionsList = mockQuestions;
    attemptId = "att_demo_123";
  }

  return (
    <StudentExamTakeClient
      exam={examDetail}
      questions={questionsList}
      attemptId={attemptId}
      studentName={studentName}
    />
  );
}

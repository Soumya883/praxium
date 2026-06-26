"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { assignments, submissions, students, users } from "@/db/schema";
import { checkRole } from "./rbac-utils";
import { getTenantDb } from "@/lib/db/tenant";

import { createAssignmentSchema } from "./schemas";

export async function createAssignment(data: z.infer<typeof createAssignmentSchema>) {
  try {
    const { authorized, role, userId } = await checkRole(["ADMIN", "TEACHER"]);
    if (!authorized || !userId) {
      return { success: false, error: "Unauthorized access: Only instructors can create assignments" };
    }

    const validated = createAssignmentSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.issues.map(i => i.message).join(", ") };
    }

    const { instituteId } = await getTenantDb();

    const assignmentId = "asg_" + Math.random().toString(36).substring(2, 11);
    await db.insert(assignments).values({
      id: assignmentId,
      batchId: validated.data.batchId,
      teacherId: userId,
      title: validated.data.title,
      description: validated.data.description || null,
      dueDate: new Date(validated.data.dueDate),
      maxMarks: validated.data.maxMarks,
      instituteId,
    });

    revalidatePath("/academic");
    revalidatePath("/teacher/assignments");
    revalidatePath("/student-portal");

    return { success: true, message: "Assignment created successfully" };
  } catch (error: any) {
    console.error("[CREATE ASSIGNMENT ERROR]:", error);
    return { success: false, error: error.message || "An unexpected database error occurred" };
  }
}

export async function submitAssignment(assignmentId: string, submissionUrl: string) {
  try {
    const { authorized, role, userId } = await checkRole(["ADMIN", "STUDENT"]);
    if (!authorized) {
      return { success: false, error: "Unauthorized access" };
    }

    let activeStudentId = "";
    const { instituteId } = await getTenantDb();

    if (role === "STUDENT" && userId) {
      const [studentProfile] = await db
        .select()
        .from(students)
        .where(and(eq(students.userId, userId), eq(students.instituteId, instituteId)))
        .limit(1);

      if (!studentProfile) {
        return { success: false, error: "Access denied: Student profile not found." };
      }
      activeStudentId = studentProfile.id;
    } else {
      // Fallback for Admin testing: select first student from database
      const [firstStudent] = await db
        .select()
        .from(students)
        .where(eq(students.instituteId, instituteId))
        .limit(1);
      
      if (!firstStudent) {
        return { success: false, error: "No student profiles exist in this institute to submit for." };
      }
      activeStudentId = firstStudent.id;
    }

    // Check if submission already exists
    const [existing] = await db
      .select()
      .from(submissions)
      .where(and(
        eq(submissions.assignmentId, assignmentId), 
        eq(submissions.studentId, activeStudentId)
      ))
      .limit(1);

    if (existing) {
      await db
        .update(submissions)
        .set({
          fileUrl: submissionUrl,
          submittedAt: new Date(),
        })
        .where(eq(submissions.id, existing.id));
    } else {
      const subId = "sub_" + Math.random().toString(36).substring(2, 11);
      await db.insert(submissions).values({
        id: subId,
        assignmentId,
        studentId: activeStudentId,
        fileUrl: submissionUrl,
        submittedAt: new Date(),
        instituteId,
      });
    }

    revalidatePath("/student-portal");
    revalidatePath(`/teacher/assignments/${assignmentId}`);

    return { success: true, message: "Assignment submitted successfully" };
  } catch (error: any) {
    console.error("[SUBMIT ASSIGNMENT ERROR]:", error);
    return { success: false, error: error.message || "An unexpected database error occurred" };
  }
}

export async function gradeSubmission(submissionId: string, marks: number) {
  try {
    const { authorized, role, userId } = await checkRole(["ADMIN", "TEACHER"]);
    if (!authorized || !userId) {
      return { success: false, error: "Unauthorized access: Only teachers or admins can grade submissions." };
    }

    const { instituteId } = await getTenantDb();

    // Fetch submission and corresponding assignment for validation
    const [subDetail] = await db
      .select({
        assignmentTeacherId: assignments.teacherId,
        assignmentId: assignments.id,
      })
      .from(submissions)
      .innerJoin(assignments, eq(submissions.assignmentId, assignments.id))
      .where(and(eq(submissions.id, submissionId), eq(submissions.instituteId, instituteId)))
      .limit(1);

    if (!subDetail) {
      return { success: false, error: "Submission not found or unauthorized tenant context." };
    }

    // Strict RLS: Verify that grading teacher is the creator of the assignment (or Admin)
    if (role === "TEACHER" && subDetail.assignmentTeacherId !== userId) {
      return { success: false, error: "Access Denied: You can only grade submissions for assignments you created." };
    }

    // Auto-calculate letter grade based on marks percentage
    const gradeVal = marks >= 90 ? "A+" : marks >= 80 ? "A" : marks >= 70 ? "B" : marks >= 60 ? "C" : "D";

    await db
      .update(submissions)
      .set({
        marksObtained: marks,
        grade: gradeVal,
      })
      .where(eq(submissions.id, submissionId));

    revalidatePath(`/teacher/assignments/${subDetail.assignmentId}`);
    revalidatePath("/student-portal");

    return { success: true, message: "Submission graded successfully" };
  } catch (error: any) {
    console.error("[GRADE SUBMISSION ERROR]:", error);
    return { success: false, error: error.message || "An unexpected database error occurred" };
  }
}

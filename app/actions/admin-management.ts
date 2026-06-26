"use server";

import { revalidatePath } from "next/cache";
import { eq, and, ne } from "drizzle-orm";
import { db } from "@/db";
import { users, students, batches, courses, assignments } from "@/db/schema";
import { checkRole } from "./rbac-utils";
import { getTenantDb } from "@/lib/db/tenant";

// ─── USER MANAGEMENT ─────────────────────────────────────────────────────────

/**
 * Lists all users (teachers + students) for the admin's institute.
 */
export async function listUsersForAdmin() {
  try {
    const { authorized } = await checkRole(["ADMIN"]);
    if (!authorized) return { success: false, error: "Unauthorized", data: [] };

    const { instituteId } = await getTenantDb();

    const data = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(eq(users.instituteId, instituteId), ne(users.role, "ADMIN")))
      .orderBy(users.createdAt);

    return { success: true, data };
  } catch (err: any) {
    console.error("[listUsersForAdmin]", err);
    return { success: false, error: err.message || "Failed to load users.", data: [] };
  }
}

/**
 * Creates a new teacher or student directly (admin-initiated, no registration needed).
 */
export async function createUserByAdmin(data: {
  name: string;
  email: string;
  phone?: string;
  role: "TEACHER" | "STUDENT";
  password: string;
}) {
  try {
    const { authorized } = await checkRole(["ADMIN"]);
    if (!authorized) return { success: false, error: "Unauthorized" };

    const { instituteId } = await getTenantDb();

    // Check for duplicate email
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser) {
      return { success: false, error: "A user with this email already exists." };
    }

    // Hash the password using bcrypt-like approach (simple hash for demo)
    const { createHash } = await import("crypto");
    const passwordHash = createHash("sha256").update(data.password).digest("hex");

    const userId = `usr_${Math.random().toString(36).substring(2, 11)}`;

    await db.transaction(async (tx) => {
      // 1. Insert user
      await tx.insert(users).values({
        id: userId,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        role: data.role,
        instituteId,
      });

      // 2. If STUDENT, auto-create student record
      if (data.role === "STUDENT") {
        await tx.insert(students).values({
          userId,
          instituteId,
          status: "active",
        });
      }
    });

    revalidatePath("/students");
    revalidatePath("/academic");
    revalidatePath("/admin/users");

    return { success: true, userId };
  } catch (err: any) {
    console.error("[createUserByAdmin]", err);
    return { success: false, error: err.message || "Failed to create user." };
  }
}

/**
 * Updates a user's name, email, phone (admin only).
 */
export async function updateUserByAdmin(userId: string, data: {
  name: string;
  email: string;
  phone?: string;
}) {
  try {
    const { authorized } = await checkRole(["ADMIN"]);
    if (!authorized) return { success: false, error: "Unauthorized" };

    const { instituteId } = await getTenantDb();

    // Verify user belongs to this institute
    const [userRec] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, userId), eq(users.instituteId, instituteId)))
      .limit(1);

    if (!userRec) return { success: false, error: "User not found." };

    await db
      .update(users)
      .set({ name: data.name, email: data.email, phone: data.phone || null })
      .where(eq(users.id, userId));

    revalidatePath("/students");
    revalidatePath("/academic");
    revalidatePath("/admin/users");

    return { success: true };
  } catch (err: any) {
    console.error("[updateUserByAdmin]", err);
    return { success: false, error: err.message || "Failed to update user." };
  }
}

/**
 * Updates a student's status (active/inactive/suspended).
 */
export async function updateStudentStatusByAdmin(studentId: string, status: "active" | "inactive" | "suspended") {
  try {
    const { authorized } = await checkRole(["ADMIN"]);
    if (!authorized) return { success: false, error: "Unauthorized" };

    const { instituteId } = await getTenantDb();

    await db
      .update(students)
      .set({ status })
      .where(and(eq(students.id, studentId), eq(students.instituteId, instituteId)));

    revalidatePath("/students");
    revalidatePath("/admin/users");

    return { success: true };
  } catch (err: any) {
    console.error("[updateStudentStatusByAdmin]", err);
    return { success: false, error: err.message || "Failed to update status." };
  }
}

/**
 * Deletes a user and cascades to their student/teacher records.
 */
export async function deleteUserByAdmin(userId: string) {
  try {
    const { authorized } = await checkRole(["ADMIN"]);
    if (!authorized) return { success: false, error: "Unauthorized" };

    const { instituteId } = await getTenantDb();

    const [userRec] = await db
      .select({ id: users.id, role: users.role })
      .from(users)
      .where(and(eq(users.id, userId), eq(users.instituteId, instituteId)))
      .limit(1);

    if (!userRec) return { success: false, error: "User not found." };
    if (userRec.role === "ADMIN") return { success: false, error: "Cannot delete admin accounts." };

    // Cascade handled by DB foreign keys; just delete the user
    await db.delete(users).where(eq(users.id, userId));

    revalidatePath("/students");
    revalidatePath("/academic");
    revalidatePath("/admin/users");

    return { success: true };
  } catch (err: any) {
    console.error("[deleteUserByAdmin]", err);
    return { success: false, error: err.message || "Failed to delete user." };
  }
}

// ─── BATCH MANAGEMENT ────────────────────────────────────────────────────────

/**
 * Lists all batches for the admin's institute (with full details).
 */
export async function listBatchesForAdmin() {
  try {
    const { authorized } = await checkRole(["ADMIN"]);
    if (!authorized) return { success: false, error: "Unauthorized", data: [] };

    const { instituteId } = await getTenantDb();

    const data = await db
      .select({
        id: batches.id,
        name: batches.name,
        daysOfWeek: batches.daysOfWeek,
        startTime: batches.startTime,
        endTime: batches.endTime,
        roomNumber: batches.roomNumber,
        maxCapacity: batches.maxCapacity,
        courseId: batches.courseId,
        teacherId: batches.teacherId,
        courseName: courses.name,
        teacherName: users.name,
      })
      .from(batches)
      .innerJoin(courses, eq(batches.courseId, courses.id))
      .leftJoin(users, eq(batches.teacherId, users.id))
      .where(eq(batches.instituteId, instituteId));

    return { success: true, data };
  } catch (err: any) {
    console.error("[listBatchesForAdmin]", err);
    return { success: false, error: err.message || "Failed to load batches.", data: [] };
  }
}

/**
 * Updates an existing batch's details (admin only).
 */
export async function updateBatchByAdmin(batchId: string, data: {
  name: string;
  teacherId: string | null;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  roomNumber: string;
  maxCapacity: number;
}) {
  try {
    const { authorized } = await checkRole(["ADMIN"]);
    if (!authorized) return { success: false, error: "Unauthorized" };

    const { instituteId } = await getTenantDb();

    await db
      .update(batches)
      .set({
        name: data.name,
        teacherId: data.teacherId,
        daysOfWeek: JSON.stringify(data.daysOfWeek),
        startTime: data.startTime,
        endTime: data.endTime,
        roomNumber: data.roomNumber,
        maxCapacity: data.maxCapacity,
      })
      .where(and(eq(batches.id, batchId), eq(batches.instituteId, instituteId)));

    revalidatePath("/academic");
    revalidatePath("/dashboard");
    revalidatePath("/admin/batches");

    return { success: true };
  } catch (err: any) {
    console.error("[updateBatchByAdmin]", err);
    return { success: false, error: err.message || "Failed to update batch." };
  }
}

/**
 * Deletes a batch (admin only). Students enrolled are set to unassigned.
 */
export async function deleteBatchByAdmin(batchId: string) {
  try {
    const { authorized } = await checkRole(["ADMIN"]);
    if (!authorized) return { success: false, error: "Unauthorized" };

    const { instituteId } = await getTenantDb();

    await db
      .delete(batches)
      .where(and(eq(batches.id, batchId), eq(batches.instituteId, instituteId)));

    revalidatePath("/academic");
    revalidatePath("/dashboard");
    revalidatePath("/students");

    return { success: true };
  } catch (err: any) {
    console.error("[deleteBatchByAdmin]", err);
    return { success: false, error: err.message || "Failed to delete batch." };
  }
}

// ─── COURSE MANAGEMENT ───────────────────────────────────────────────────────

/**
 * Lists all courses for the admin's institute.
 */
export async function listCoursesForAdmin() {
  try {
    const { authorized } = await checkRole(["ADMIN"]);
    if (!authorized) return { success: false, error: "Unauthorized", data: [] };

    const { instituteId } = await getTenantDb();

    const data = await db
      .select()
      .from(courses)
      .where(eq(courses.instituteId, instituteId))
      .orderBy(courses.createdAt);

    return { success: true, data };
  } catch (err: any) {
    console.error("[listCoursesForAdmin]", err);
    return { success: false, error: err.message || "Failed to load courses.", data: [] };
  }
}

/**
 * Updates a course's name and description.
 */
export async function updateCourseByAdmin(courseId: string, data: { name: string; description?: string }) {
  try {
    const { authorized } = await checkRole(["ADMIN"]);
    if (!authorized) return { success: false, error: "Unauthorized" };

    const { instituteId } = await getTenantDb();

    await db
      .update(courses)
      .set({ name: data.name, description: data.description || null })
      .where(and(eq(courses.id, courseId), eq(courses.instituteId, instituteId)));

    revalidatePath("/academic");
    revalidatePath("/admin/courses");

    return { success: true };
  } catch (err: any) {
    console.error("[updateCourseByAdmin]", err);
    return { success: false, error: err.message || "Failed to update course." };
  }
}

/**
 * Deletes a course (and cascades to batches, etc. via DB FK).
 */
export async function deleteCourseByAdmin(courseId: string) {
  try {
    const { authorized } = await checkRole(["ADMIN"]);
    if (!authorized) return { success: false, error: "Unauthorized" };

    const { instituteId } = await getTenantDb();

    await db
      .delete(courses)
      .where(and(eq(courses.id, courseId), eq(courses.instituteId, instituteId)));

    revalidatePath("/academic");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    console.error("[deleteCourseByAdmin]", err);
    return { success: false, error: err.message || "Failed to delete course." };
  }
}

// ─── ASSIGNMENTS MANAGEMENT ──────────────────────────────────────────────────

/**
 * Lists all assignments across the institute (admin view).
 */
export async function listAssignmentsForAdmin() {
  try {
    const { authorized } = await checkRole(["ADMIN"]);
    if (!authorized) return { success: false, error: "Unauthorized", data: [] };

    const { instituteId } = await getTenantDb();

    const data = await db
      .select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        dueDate: assignments.dueDate,
        maxMarks: assignments.maxMarks,
        batchName: batches.name,
        teacherName: users.name,
        batchId: assignments.batchId,
        teacherId: assignments.teacherId,
      })
      .from(assignments)
      .innerJoin(batches, eq(assignments.batchId, batches.id))
      .innerJoin(users, eq(assignments.teacherId, users.id))
      .where(eq(assignments.instituteId, instituteId))
      .orderBy(assignments.dueDate);

    return { success: true, data };
  } catch (err: any) {
    console.error("[listAssignmentsForAdmin]", err);
    return { success: false, error: err.message || "Failed to load assignments.", data: [] };
  }
}

/**
 * Creates an assignment on behalf of a teacher (admin only).
 */
export async function createAssignmentByAdmin(data: {
  title: string;
  description?: string;
  batchId: string;
  teacherId: string;
  dueDate: string;
  maxMarks: number;
}) {
  try {
    const { authorized } = await checkRole(["ADMIN"]);
    if (!authorized) return { success: false, error: "Unauthorized" };

    const { instituteId } = await getTenantDb();

    await db.insert(assignments).values({
      title: data.title,
      description: data.description || null,
      batchId: data.batchId,
      teacherId: data.teacherId,
      dueDate: new Date(data.dueDate),
      maxMarks: data.maxMarks,
      instituteId,
    });

    revalidatePath("/teacher/assignments");
    revalidatePath("/student-portal");
    revalidatePath("/admin/assignments");

    return { success: true };
  } catch (err: any) {
    console.error("[createAssignmentByAdmin]", err);
    return { success: false, error: err.message || "Failed to create assignment." };
  }
}

/**
 * Deletes an assignment.
 */
export async function deleteAssignmentByAdmin(assignmentId: string) {
  try {
    const { authorized } = await checkRole(["ADMIN"]);
    if (!authorized) return { success: false, error: "Unauthorized" };

    const { instituteId } = await getTenantDb();

    await db
      .delete(assignments)
      .where(and(eq(assignments.id, assignmentId), eq(assignments.instituteId, instituteId)));

    revalidatePath("/teacher/assignments");
    revalidatePath("/student-portal");

    return { success: true };
  } catch (err: any) {
    console.error("[deleteAssignmentByAdmin]", err);
    return { success: false, error: err.message || "Failed to delete assignment." };
  }
}

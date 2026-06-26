"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { getTenantDb } from "@/lib/db/tenant";
import { checkRole } from "./rbac-utils";
import { inquiries, students, users } from "@/db/schema";
import { db } from "@/db";

import {
  createInquirySchema,
  updateInquiryNotesSchema,
  type InquiryStatus,
} from "./schemas";

// --- Actions ---

/**
 * Fetches all inquiries for the current tenant, ordered by creation date ASC.
 */
export async function getInquiries() {
  try {
    const { authorized } = await checkRole(["ADMIN"]);
    if (!authorized) return { success: false, error: "Unauthorized", data: [] };

    const { instituteId } = await getTenantDb();
    const data = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.instituteId, instituteId))
      .orderBy(inquiries.createdAt);

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * Creates a new walk-in inquiry for the CRM board.
 */
export async function createNewInquiry(
  data: z.infer<typeof createInquirySchema>
) {
  try {
    const { authorized } = await checkRole(["ADMIN"]);
    if (!authorized) return { success: false, error: "Unauthorized" };

    const parsed = createInquirySchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const { instituteId } = await getTenantDb();

    await db.insert(inquiries).values({
      instituteId,
      studentName: parsed.data.studentName,
      guardianPhone: parsed.data.guardianPhone,
      targetCourse: parsed.data.targetCourse,
      status: "NEW_WALKIN",
      followUpDate: parsed.data.followUpDate
        ? new Date(parsed.data.followUpDate)
        : null,
      notes: parsed.data.notes || null,
    });

    revalidatePath("/admin/admissions");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Updates the status of an inquiry (used by drag-and-drop Kanban).
 */
export async function updateInquiryStatus(
  inquiryId: string,
  status: InquiryStatus
) {
  try {
    const { authorized } = await checkRole(["ADMIN"]);
    if (!authorized) return { success: false, error: "Unauthorized" };

    const { instituteId } = await getTenantDb();

    await db
      .update(inquiries)
      .set({ status })
      .where(
        and(
          eq(inquiries.id, inquiryId),
          eq(inquiries.instituteId, instituteId)
        )
      );

    revalidatePath("/admin/admissions");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Updates the notes and follow-up date for an inquiry card.
 */
export async function updateInquiryNotes(
  inquiryId: string,
  data: z.infer<typeof updateInquiryNotesSchema>
) {
  try {
    const { authorized } = await checkRole(["ADMIN"]);
    if (!authorized) return { success: false, error: "Unauthorized" };

    const { instituteId } = await getTenantDb();

    await db
      .update(inquiries)
      .set({
        notes: data.notes || null,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      })
      .where(
        and(
          eq(inquiries.id, inquiryId),
          eq(inquiries.instituteId, instituteId)
        )
      );

    revalidatePath("/admin/admissions");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Converts a won inquiry into an enrolled Student.
 * Transactional: creates a User + Student record and marks inquiry as ENROLLED.
 */
export async function convertInquiryToStudent(
  inquiryId: string,
  batchId: string
) {
  try {
    const { authorized } = await checkRole(["ADMIN"]);
    if (!authorized) return { success: false, error: "Unauthorized" };

    const { instituteId } = await getTenantDb();

    // 1. Fetch the inquiry
    const [inquiry] = await db
      .select()
      .from(inquiries)
      .where(
        and(
          eq(inquiries.id, inquiryId),
          eq(inquiries.instituteId, instituteId)
        )
      )
      .limit(1);

    if (!inquiry) return { success: false, error: "Inquiry not found" };

    // 2. Create a placeholder user record (no Clerk auth yet — admin enrolls them)
    const userId = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const placeholderEmail = `${userId}@praxium-placeholder.internal`;

    await db.insert(users).values({
      id: userId,
      name: inquiry.studentName,
      email: placeholderEmail,
      role: "STUDENT",
      instituteId,
    });

    // 3. Create the student record
    await db.insert(students).values({
      userId,
      batchId,
      parentPhone: inquiry.guardianPhone,
      status: "active",
      instituteId,
    });

    // 4. Mark the inquiry as ENROLLED
    await db
      .update(inquiries)
      .set({ status: "ENROLLED" })
      .where(eq(inquiries.id, inquiryId));

    revalidatePath("/admin/admissions");
    revalidatePath("/admin/students");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

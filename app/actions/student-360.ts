"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { students, payments, users } from "@/db/schema";
import { checkRole } from "./rbac-utils";
import { getTenantDb } from "@/lib/db/tenant";
import { sendFeeReceiptWhatsApp } from "./whatsapp";

import { studentProfileSchema, paymentRecordSchema } from "./schemas";

/**
 * Updates student details, guardian info, and 10th board marks.
 * Scoped to active tenant.
 */
export async function updateStudentProfile(
  studentId: string,
  data: z.infer<typeof studentProfileSchema>
) {
  try {
    const { authorized, role, userId } = await checkRole(["ADMIN", "STUDENT"]);
    if (!authorized) {
      return { success: false, error: "Unauthorized access" };
    }

    const { instituteId } = await getTenantDb();

    // If student role, ensure they are editing their own profile in their tenant
    if (role === "STUDENT" && userId) {
      const [ownProfile] = await db
        .select()
        .from(students)
        .where(and(
          eq(students.id, studentId), 
          eq(students.userId, userId),
          eq(students.instituteId, instituteId)
        ))
        .limit(1);
      if (!ownProfile) {
        return { success: false, error: "Access denied: You can only edit your own profile." };
      }
    }

    const validated = studentProfileSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.issues.map(i => i.message).join(", ") };
    }

    // 1. Fetch student to get associated userId
    const [studentRec] = await db
      .select({ userId: students.userId })
      .from(students)
      .where(and(eq(students.id, studentId), eq(students.instituteId, instituteId)))
      .limit(1);

    if (!studentRec) {
      return { success: false, error: "Student profile not found." };
    }

    // 2. Update users table if name, email, or phone is modified
    const userUpdateValues: Record<string, any> = {};
    if (validated.data.name !== undefined) userUpdateValues.name = validated.data.name;
    if (validated.data.email !== undefined) userUpdateValues.email = validated.data.email;
    if (validated.data.phone !== undefined) userUpdateValues.phone = validated.data.phone;

    if (Object.keys(userUpdateValues).length > 0) {
      await db
        .update(users)
        .set(userUpdateValues)
        .where(eq(users.id, studentRec.userId));
    }

    // 3. Update students table
    const studentUpdateValues: Record<string, any> = {};
    if (validated.data.batchId !== undefined) {
      studentUpdateValues.batchId = validated.data.batchId === "" ? null : validated.data.batchId;
    }
    if (validated.data.collegeName !== undefined) studentUpdateValues.collegeName = validated.data.collegeName;
    if (validated.data.guardianName !== undefined) studentUpdateValues.guardianName = validated.data.guardianName;
    if (validated.data.guardianPhone !== undefined) studentUpdateValues.guardianPhone = validated.data.guardianPhone;
    if (validated.data.guardianAddress !== undefined) studentUpdateValues.guardianAddress = validated.data.guardianAddress;
    if (validated.data.totalCourseFee !== undefined) studentUpdateValues.totalCourseFee = validated.data.totalCourseFee.toString();
    if (validated.data.tenthBoardMarks !== undefined) studentUpdateValues.tenthBoardMarks = validated.data.tenthBoardMarks;

    if (Object.keys(studentUpdateValues).length > 0) {
      await db
        .update(students)
        .set(studentUpdateValues)
        .where(and(eq(students.id, studentId), eq(students.instituteId, instituteId)));
    }

    revalidatePath(`/admin/students/${studentId}`);
    revalidatePath("/students");
    revalidatePath("/student-portal");

    return { success: true, message: "Student profile updated successfully" };
  } catch (error: any) {
    console.error("[UPDATE STUDENT PROFILE ERROR]:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

/**
 * Records a payment, optionally triggering a WhatsApp notification.
 * Scoped to active tenant.
 */
export async function recordPayment(
  studentId: string,
  paymentId: string | null,
  data: z.infer<typeof paymentRecordSchema>,
  sendWhatsApp: boolean = false
) {
  try {
    const { authorized } = await checkRole(["ADMIN"]);
    if (!authorized) {
      return { success: false, error: "Unauthorized access: Only administrators can record payments" };
    }

    const validated = paymentRecordSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.issues.map(i => i.message).join(", ") };
    }

    const { instituteId } = await getTenantDb();

    const receipt = validated.data.receiptNumber || "REC-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const payDate = new Date(validated.data.submittedDate);
    let resolvedPaymentId = "";

    if (paymentId) {
      resolvedPaymentId = paymentId;
      await db
        .update(payments)
        .set({
          amount: validated.data.amount.toString(),
          status: "paid",
          paymentDate: payDate,
          submittedDate: payDate,
          paymentMode: validated.data.paymentMode,
          receiptNumber: receipt,
        })
        .where(and(eq(payments.id, paymentId), eq(payments.instituteId, instituteId)));
    } else {
      resolvedPaymentId = "pay_" + Math.random().toString(36).substring(2, 11);
      await db.insert(payments).values({
        id: resolvedPaymentId,
        studentId,
        amount: validated.data.amount.toString(),
        status: "paid",
        dueDate: new Date().toISOString().split("T")[0],
        paymentDate: payDate,
        submittedDate: payDate,
        paymentMode: validated.data.paymentMode,
        receiptNumber: receipt,
        instituteId,
      });
    }

    // Dispatch WhatsApp receipt to parent/guardian if checkbox enabled
    if (sendWhatsApp) {
      try {
        await sendFeeReceiptWhatsApp(resolvedPaymentId);
      } catch (wError) {
        console.error("[RECORD PAYMENT]: WhatsApp automated receipt delivery failed:", wError);
      }
    }

    revalidatePath(`/admin/students/${studentId}`);
    revalidatePath("/finance");
    revalidatePath("/dashboard");
    revalidatePath("/student-portal");

    return { success: true, message: "Payment recorded successfully" };
  } catch (error: any) {
    console.error("[RECORD PAYMENT ERROR]:", error);
    return { success: false, error: error.message || "An unexpected database error occurred" };
  }
}

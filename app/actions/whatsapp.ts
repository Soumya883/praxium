"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { payments, students, users, communicationLogs } from "@/db/schema";
import { sendWhatsAppMessage } from "@/lib/twilio";
import { checkRole } from "./rbac-utils";
import { getTenantDb } from "@/lib/db/tenant";

export async function sendFeeReceiptWhatsApp(paymentId: string) {
  try {
    const { authorized } = await checkRole(["ADMIN"]);
    if (!authorized) {
      return { success: false, error: "Unauthorized access: Only administrators can dispatch WhatsApp receipts." };
    }

    const { instituteId } = await getTenantDb();

    // Query payment, student, and user details
    const [paymentRecord] = await db
      .select({
        paymentId: payments.id,
        amount: payments.amount,
        paymentMode: payments.paymentMode,
        submittedDate: payments.submittedDate,
        studentId: students.id,
        parentPhone: students.parentPhone,
        guardianPhone: students.guardianPhone,
        studentName: users.name,
      })
      .from(payments)
      .innerJoin(students, eq(payments.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .where(and(eq(payments.id, paymentId), eq(payments.instituteId, instituteId)))
      .limit(1);

    if (!paymentRecord) {
      return { success: false, error: "Payment record not found." };
    }

    // Target either guardian phone or parent phone
    const targetPhone = paymentRecord.guardianPhone || paymentRecord.parentPhone;
    if (!targetPhone) {
      return { success: false, error: "No guardian or parent contact phone set on this student profile." };
    }

    const formattedDate = paymentRecord.submittedDate 
      ? new Date(paymentRecord.submittedDate).toLocaleDateString()
      : new Date().toLocaleDateString();

    const amountNum = parseFloat(paymentRecord.amount);

    const message = `*OFFICIAL RECEIPT* 🧾\n\nDear Guardian,\nWe have received a payment of *₹${amountNum}* for ${paymentRecord.studentName} via ${paymentRecord.paymentMode}.\n\nDate: ${formattedDate}\n\nThank you for choosing Sharma Physics Academy.`;

    const sendRes = await sendWhatsAppMessage(targetPhone, message);

    // Save history to communication log
    const logId = "log_" + Math.random().toString(36).substring(2, 11);
    await db.insert(communicationLogs).values({
      id: logId,
      studentId: paymentRecord.studentId,
      type: "FEE_REMINDER",
      status: sendRes.success ? "DELIVERED" : "FAILED",
      instituteId,
    });

    return sendRes;
  } catch (error: any) {
    console.error("[WHATSAPP FEE RECEIPT DISPATCH ERROR]:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}

export async function sendAttendanceAlertWhatsApp(studentId: string, subject: string) {
  try {
    const { authorized } = await checkRole(["ADMIN", "TEACHER"]);
    if (!authorized) {
      return { success: false, error: "Unauthorized access: Only teachers/admins can trigger alerts." };
    }

    const { instituteId } = await getTenantDb();

    // Query student and user info
    const [studentProfile] = await db
      .select({
        studentId: students.id,
        parentPhone: students.parentPhone,
        guardianPhone: students.guardianPhone,
        studentName: users.name,
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(and(eq(students.id, studentId), eq(students.instituteId, instituteId)))
      .limit(1);

    if (!studentProfile) {
      return { success: false, error: "Student profile not found." };
    }

    const targetPhone = studentProfile.guardianPhone || studentProfile.parentPhone;
    if (!targetPhone) {
      return { success: false, error: "No contact phone number set on this student profile." };
    }

    const message = `*ATTENDANCE ALERT* ⚠️\n\nDear Guardian,\nThis is to notify you that ${studentProfile.studentName} was marked ABSENT for ${subject} today.\n\nPlease contact the administration for any queries.`;

    const sendRes = await sendWhatsAppMessage(targetPhone, message);

    // Save history to communication log
    const logId = "log_" + Math.random().toString(36).substring(2, 11);
    await db.insert(communicationLogs).values({
      id: logId,
      studentId: studentProfile.studentId,
      type: "ATTENDANCE_WARNING",
      status: sendRes.success ? "DELIVERED" : "FAILED",
      instituteId,
    });

    return sendRes;
  } catch (error: any) {
    console.error("[WHATSAPP ATTENDANCE DISPATCH ERROR]:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}

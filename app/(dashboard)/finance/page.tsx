import { db } from "@/db";
import { payments, students, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { FinanceClient, PaymentRecord } from "./finance-client";

// Rich fallback mockup payments for local demo-ability
const mockPayments: PaymentRecord[] = [
  { id: "pay-1", studentName: "Subhashree Dash", studentEmail: "subhashree.d@example.com", amount: 4500.00, status: "paid", dueDate: "2026-06-15", paymentDate: new Date("2026-06-14").toISOString(), receiptNumber: "REC-A8F2K9" },
  { id: "pay-2", studentName: "Arpan Mohanty", studentEmail: "arpan.m@example.com", amount: 5200.00, status: "pending", dueDate: "2026-06-30", paymentDate: null, receiptNumber: null },
  { id: "pay-3", studentName: "Ananya Mishra", studentEmail: "ananya.m@example.com", amount: 4800.00, status: "overdue", dueDate: "2026-06-10", paymentDate: null, receiptNumber: null },
  { id: "pay-4", studentName: "Chinmay Mohapatra", studentEmail: "chinmay.m@example.com", amount: 6000.00, status: "paid", dueDate: "2026-06-05", paymentDate: new Date("2026-06-04").toISOString(), receiptNumber: "REC-G3H7X1" },
  { id: "pay-5", studentName: "Priyanka Jena", studentEmail: "priyanka.j@example.com", amount: 4500.00, status: "pending", dueDate: "2026-06-28", paymentDate: null, receiptNumber: null },
  { id: "pay-6", studentName: "Soumya Ranjan", studentEmail: "soumya.r@example.com", amount: 5200.00, status: "overdue", dueDate: "2026-06-20", paymentDate: null, receiptNumber: null },
  { id: "pay-7", studentName: "Debasish Patnaik", studentEmail: "debasish.p@example.com", amount: 4800.00, status: "paid", dueDate: "2026-06-02", paymentDate: new Date("2026-06-01").toISOString(), receiptNumber: "REC-K9L8P4" },
];

export const revalidate = 0; // Do not cache this route

export const metadata = {
  title: "Finance & Fee Management",
};

export default async function FinancePage() {
  let dbPayments: any[] = [];
  let useFallback = false;

  try {
    // Relational join to gather payment details, student details, and names
    dbPayments = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        status: payments.status,
        dueDate: payments.dueDate,
        paymentDate: payments.paymentDate,
        receiptNumber: payments.receiptNumber,
        studentName: users.name,
        studentEmail: users.email,
      })
      .from(payments)
      .innerJoin(students, eq(payments.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .orderBy(desc(payments.createdAt));
  } catch (error) {
    console.warn("Postgres connection unavailable. Rendering mock fee dashboard.");
    useFallback = true;
  }

  // Format payment date objects into strings before passing down
  const finalPaymentsList: PaymentRecord[] = useFallback 
    ? mockPayments 
    : dbPayments.map((p) => ({
        id: p.id,
        studentName: p.studentName,
        studentEmail: p.studentEmail,
        amount: p.amount,
        status: p.status as any,
        dueDate: p.dueDate,
        paymentDate: p.paymentDate ? new Date(p.paymentDate).toISOString() : null,
        receiptNumber: p.receiptNumber,
      }));

  return <FinanceClient initialPayments={finalPaymentsList} />;
}

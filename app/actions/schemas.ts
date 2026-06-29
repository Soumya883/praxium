import { z } from "zod";

// --- Student 360 Schemas ---
export const tenthBoardMarksSchema = z.object({
  physics: z.number().min(0, "Marks cannot be negative").max(100, "Max marks is 100"),
  chemistry: z.number().min(0, "Marks cannot be negative").max(100, "Max marks is 100"),
  biology: z.number().min(0, "Marks cannot be negative").max(100, "Max marks is 100"),
  it: z.number().min(0, "Marks cannot be negative").max(100, "Max marks is 100"),
});

export const studentProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Enter a valid email").optional(),
  phone: z.string().optional().nullable(),
  batchId: z.string().uuid("Invalid batch ID").nullable().optional().or(z.literal("")),
  collegeName: z.string().min(2, "College name must be at least 2 characters").optional().or(z.literal("")),
  guardianName: z.string().min(2, "Guardian name must be at least 2 characters").optional().or(z.literal("")),
  guardianPhone: z.string().min(8, "Guardian phone is too short").optional().or(z.literal("")),
  guardianAddress: z.string().min(5, "Address must be detailed").optional().or(z.literal("")),
  totalCourseFee: z.number().positive("Course fee must be positive").optional(),
  tenthBoardMarks: tenthBoardMarksSchema.optional(),
});

export const paymentRecordSchema = z.object({
  amount: z.number().positive("Payment amount must be greater than zero"),
  paymentMode: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CARD"]),
  submittedDate: z.string().min(1, "Payment date is required"),
  receiptNumber: z.string().optional(),
});

// --- Academic Evaluation Schemas ---
export const createAssignmentSchema = z.object({
  batchId: z.string().uuid("Invalid batch ID"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional().nullable(),
  dueDate: z.string().min(1, "Due date is required"),
  maxMarks: z.number().positive("Max marks must be positive").default(100),
});

// --- CBT Exam Builder Schemas ---
// Use z.number() + react-hook-form's { valueAsNumber: true } for HTML number inputs.
// This is the idiomatic pattern — RHF coerces the string, Zod validates the number.
const questionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  options: z.array(z.string().min(1, "Option text cannot be empty")).min(2, "At least two options are required"),
  correctOptionIndex: z.number().min(0, "Correct option index must be valid"),
  positiveMarks: z.number().min(1, "Positive marks must be at least 1"),
  negativeMarks: z.number().min(0, "Negative marks cannot be negative"),
});

export const createExamSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  batchId: z.string().uuid("Invalid batch ID"),
  durationMinutes: z.number().positive("Duration must be positive"),
  startTime: z.string().min(1, "Start window is required"),
  endTime: z.string().min(1, "End window is required"),
  questions: z.array(questionSchema).min(1, "At least one question is required"),
});

// --- Finance Schemas ---
export const paymentFormSchema = z.object({
  amountReceived: z.number().positive("Amount received must be greater than zero"),
  paymentMethod: z.enum(["Cash", "Card", "Bank Transfer"], {
    message: "Select a valid payment method",
  }),
  note: z.string().optional(),
});

// --- CRM / Admissions Schemas ---
export const createInquirySchema = z.object({
  studentName: z.string().min(2, "Name must be at least 2 characters"),
  guardianPhone: z.string().min(8, "Phone number is too short"),
  targetCourse: z.string().min(2, "Target course is required"),
  followUpDate: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["NEW_WALKIN", "CALLED", "TRIAL_SCHEDULED", "ENROLLED", "LOST"]).optional(),
});

export const updateInquiryNotesSchema = z.object({
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
});

export type InquiryStatus =
  | "NEW_WALKIN"
  | "CALLED"
  | "TRIAL_SCHEDULED"
  | "ENROLLED"
  | "LOST";


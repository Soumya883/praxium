import { pgTable, text, timestamp, integer, pgEnum, decimal, uuid, date, unique, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums definitions
export const roleEnum = pgEnum("role", ["ADMIN", "TEACHER", "STUDENT"]);
export const statusEnum = pgEnum("status", ["active", "inactive", "suspended"]);
export const paymentStatusEnum = pgEnum("payment_status", ["paid", "pending", "overdue"]);
export const attendanceStatusEnum = pgEnum("attendance_status", ["present", "absent", "late"]);
export const commTypeEnum = pgEnum("comm_type", ["ATTENDANCE_WARNING", "FEE_REMINDER", "GENERAL", "EXAM_RESULT"]);
export const paymentModeEnum = pgEnum("payment_mode", ["CASH", "UPI", "BANK_TRANSFER", "CARD"]);
export const registrationStatusEnum = pgEnum("registration_status", ["PENDING", "APPROVED", "REJECTED"]);


// 0. Institutes Table
export const institutes = pgTable("institutes", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkOrgId: text("clerk_org_id").notNull().unique(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull().default("#6366f1"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 1. Users Table
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  clerkUserId: text("clerk_user_id").unique(), // Maps database user record to Clerk login session
  role: roleEnum("role").notNull().default("STUDENT"),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  instituteId: uuid("institute_id").references(() => institutes.id, { onDelete: "cascade" }),
});

// 2. Courses Table
export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  instituteId: uuid("institute_id").references(() => institutes.id, { onDelete: "cascade" }),
});

// 3. Batches Table
export const batches = pgTable("batches", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  teacherId: text("teacher_id").references(() => users.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  daysOfWeek: text("days_of_week").notNull(), // JSON array, e.g. "['MON', 'WED', 'FRI']"
  startTime: text("start_time").notNull(), // HH:mm format
  endTime: text("end_time").notNull(), // HH:mm format
  roomNumber: text("room_number").notNull(),
  maxCapacity: integer("max_capacity").notNull().default(30),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  instituteId: uuid("institute_id").references(() => institutes.id, { onDelete: "cascade" }),
});

// 4. Students Table (with added parent communication contacts)
export const students = pgTable("students", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  batchId: uuid("batch_id").references(() => batches.id, { onDelete: "set null" }),
  parentEmail: text("parent_email"),
  parentPhone: text("parent_phone"),
  enrollmentDate: timestamp("enrollment_date").defaultNow().notNull(),
  status: statusEnum("status").notNull().default("active"),
  collegeName: text("college_name"),
  guardianName: text("guardian_name"),
  guardianPhone: text("guardian_phone"),
  guardianAddress: text("guardian_address"),
  totalCourseFee: decimal("total_course_fee", { precision: 10, scale: 2 }).notNull().default("15000.00"),
  tenthBoardMarks: jsonb("tenth_board_marks"),
  instituteId: uuid("institute_id").references(() => institutes.id, { onDelete: "cascade" }),
});

// 5. Payments Table
export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  dueDate: date("due_date").notNull(),
  paymentDate: timestamp("payment_date"),
  receiptNumber: text("receipt_number").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  paymentMode: paymentModeEnum("payment_mode").notNull().default("CASH"),
  submittedDate: timestamp("submitted_date"),
  instituteId: uuid("institute_id").references(() => institutes.id, { onDelete: "cascade" }),
}, (table) => {
  return {
    paymentsInstituteIdIdx: index("payments_institute_id_idx").on(table.instituteId),
  };
});

// 6. Attendance Table (with composite unique constraints & recorder reference)
export const attendance = pgTable("attendance", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  batchId: uuid("batch_id").notNull().references(() => batches.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  status: attendanceStatusEnum("status").notNull(),
  recordedBy: text("recorded_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  instituteId: uuid("institute_id").references(() => institutes.id, { onDelete: "cascade" }),
}, (table) => {
  return {
    studentBatchDateUnique: unique("student_batch_date_unique").on(table.studentId, table.batchId, table.date),
    attendanceInstituteIdIdx: index("attendance_institute_id_idx").on(table.instituteId),
  };
});

// 7. Communication Logs Table
export const communicationLogs = pgTable("communication_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  type: commTypeEnum("type").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  status: text("status").notNull(), // 'DELIVERED' or 'FAILED'
  instituteId: uuid("institute_id").references(() => institutes.id, { onDelete: "cascade" }),
});

// 8. Subject Attendance Table
export const subjectAttendance = pgTable("subject_attendance", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  status: attendanceStatusEnum("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  instituteId: uuid("institute_id").references(() => institutes.id, { onDelete: "cascade" }),
});

// 9. Assignments Table
export const assignments = pgTable("assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  batchId: uuid("batch_id").notNull().references(() => batches.id, { onDelete: "cascade" }),
  teacherId: text("teacher_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  maxMarks: integer("max_marks").notNull().default(100),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  instituteId: uuid("institute_id").references(() => institutes.id, { onDelete: "cascade" }),
});

// 10. Submissions Table
export const submissions = pgTable("submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  assignmentId: uuid("assignment_id").notNull().references(() => assignments.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  fileUrl: text("file_url").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  grade: text("grade"),
  marksObtained: integer("marks_obtained"),
  instituteId: uuid("institute_id").references(() => institutes.id, { onDelete: "cascade" }),
}, (table) => {
  return {
    submissionsInstituteIdIdx: index("submissions_institute_id_idx").on(table.instituteId),
  };
});

// 11. Institute Exams Table
export const instituteExams = pgTable("institute_exams", {
  id: uuid("id").defaultRandom().primaryKey(),
  batchId: uuid("batch_id").notNull().references(() => batches.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  maxMarks: integer("max_marks").notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  instituteId: uuid("institute_id").references(() => institutes.id, { onDelete: "cascade" }),
});

// 12. Exam Scores Table
export const examScores = pgTable("exam_scores", {
  id: uuid("id").defaultRandom().primaryKey(),
  examId: uuid("exam_id").notNull().references(() => instituteExams.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  marksObtained: decimal("marks_obtained", { precision: 5, scale: 2 }).notNull(),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  instituteId: uuid("institute_id").references(() => institutes.id, { onDelete: "cascade" }),
}, (table) => {
  return {
    examScoresInstituteIdIdx: index("exam_scores_institute_id_idx").on(table.instituteId),
  };
});

// 13. Mock Timed Exams Table
export const mockExams = pgTable("mock_exams", {
  id: uuid("id").defaultRandom().primaryKey(),
  batchId: uuid("batch_id").notNull().references(() => batches.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  instituteId: uuid("institute_id").references(() => institutes.id, { onDelete: "cascade" }),
}, (table) => {
  return {
    mockExamsInstituteIdIdx: index("mock_exams_institute_id_idx").on(table.instituteId),
  };
});

// 14. CBT Exam Questions Table
export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  examId: uuid("exam_id").notNull().references(() => mockExams.id, { onDelete: "cascade" }),
  questionText: text("question_text").notNull(),
  options: jsonb("options").notNull(), // JSON array of choice strings: e.g. ["Option A", "Option B", ...]
  correctOptionIndex: integer("correct_option_index").notNull(),
  positiveMarks: integer("positive_marks").notNull().default(4),
  negativeMarks: integer("negative_marks").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  instituteId: uuid("institute_id").references(() => institutes.id, { onDelete: "cascade" }),
}, (table) => {
  return {
    questionsInstituteIdIdx: index("questions_institute_id_idx").on(table.instituteId),
  };
});

// 15. CBT Exam Attempts Table
export const examAttempts = pgTable("exam_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  examId: uuid("exam_id").notNull().references(() => mockExams.id, { onDelete: "cascade" }),
  studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time").defaultNow().notNull(),
  submitTime: timestamp("submit_time"),
  totalScore: integer("total_score"),
  instituteId: uuid("institute_id").references(() => institutes.id, { onDelete: "cascade" }),
}, (table) => {
  return {
    examAttemptsInstituteIdIdx: index("exam_attempts_institute_id_idx").on(table.instituteId),
  };
});

// 16. Attempt Answers Table (Tracks student's individual answers)
export const attemptAnswers = pgTable("attempt_answers", {
  id: uuid("id").defaultRandom().primaryKey(),
  attemptId: uuid("attempt_id").notNull().references(() => examAttempts.id, { onDelete: "cascade" }),
  questionId: uuid("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  selectedOptionIndex: integer("selected_option_index"),
  instituteId: uuid("institute_id").references(() => institutes.id, { onDelete: "cascade" }),
}, (table) => {
  return {
    attemptAnswersInstituteIdIdx: index("attempt_answers_institute_id_idx").on(table.instituteId),
  };
});

// --- Relations Definitions ---

export const institutesRelations = relations(institutes, ({ many }) => ({
  users: many(users),
  students: many(students),
  batches: many(batches),
  courses: many(courses),
  payments: many(payments),
  attendance: many(attendance),
  communicationLogs: many(communicationLogs),
  subjectAttendance: many(subjectAttendance),
  assignments: many(assignments),
  submissions: many(submissions),
  instituteExams: many(instituteExams),
  examScores: many(examScores),
  mockExams: many(mockExams),
  questions: many(questions),
  examAttempts: many(examAttempts),
  attemptAnswers: many(attemptAnswers),
  payslips: many(payslips),
  inquiries: many(inquiries),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  batches: many(batches),
  students: many(students),
  institute: one(institutes, {
    fields: [users.instituteId],
    references: [institutes.id],
  }),
  payslips: many(payslips),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  batches: many(batches),
  institute: one(institutes, {
    fields: [courses.instituteId],
    references: [institutes.id],
  }),
}));

export const batchesRelations = relations(batches, ({ one, many }) => ({
  course: one(courses, {
    fields: [batches.courseId],
    references: [courses.id],
  }),
  teacher: one(users, {
    fields: [batches.teacherId],
    references: [users.id],
  }),
  students: many(students),
  attendance: many(attendance),
  institute: one(institutes, {
    fields: [batches.instituteId],
    references: [institutes.id],
  }),
  mockExams: many(mockExams),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  batch: one(batches, {
    fields: [students.batchId],
    references: [batches.id],
  }),
  payments: many(payments),
  attendance: many(attendance),
  communicationLogs: many(communicationLogs),
  subjectAttendance: many(subjectAttendance),
  submissions: many(submissions),
  examScores: many(examScores),
  institute: one(institutes, {
    fields: [students.instituteId],
    references: [institutes.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  student: one(students, {
    fields: [payments.studentId],
    references: [students.id],
  }),
  institute: one(institutes, {
    fields: [payments.instituteId],
    references: [institutes.id],
  }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, {
    fields: [attendance.studentId],
    references: [students.id],
  }),
  batch: one(batches, {
    fields: [attendance.batchId],
    references: [batches.id],
  }),
  institute: one(institutes, {
    fields: [attendance.instituteId],
    references: [institutes.id],
  }),
}));

export const communicationLogsRelations = relations(communicationLogs, ({ one }) => ({
  student: one(students, {
    fields: [communicationLogs.studentId],
    references: [students.id],
  }),
  institute: one(institutes, {
    fields: [communicationLogs.instituteId],
    references: [institutes.id],
  }),
}));

// --- Phase 8 Relations ---
export const subjectAttendanceRelations = relations(subjectAttendance, ({ one }) => ({
  student: one(students, {
    fields: [subjectAttendance.studentId],
    references: [students.id],
  }),
  course: one(courses, {
    fields: [subjectAttendance.courseId],
    references: [courses.id],
  }),
  institute: one(institutes, {
    fields: [subjectAttendance.instituteId],
    references: [institutes.id],
  }),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  batch: one(batches, {
    fields: [assignments.batchId],
    references: [batches.id],
  }),
  teacher: one(users, {
    fields: [assignments.teacherId],
    references: [users.id],
  }),
  submissions: many(submissions),
  institute: one(institutes, {
    fields: [assignments.instituteId],
    references: [institutes.id],
  }),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  assignment: one(assignments, {
    fields: [submissions.assignmentId],
    references: [assignments.id],
  }),
  student: one(students, {
    fields: [submissions.studentId],
    references: [students.id],
  }),
  institute: one(institutes, {
    fields: [submissions.instituteId],
    references: [institutes.id],
  }),
}));

export const instituteExamsRelations = relations(instituteExams, ({ one, many }) => ({
  batch: one(batches, {
    fields: [instituteExams.batchId],
    references: [batches.id],
  }),
  scores: many(examScores),
  institute: one(institutes, {
    fields: [instituteExams.instituteId],
    references: [institutes.id],
  }),
}));

export const examScoresRelations = relations(examScores, ({ one }) => ({
  exam: one(instituteExams, {
    fields: [examScores.examId],
    references: [instituteExams.id],
  }),
  student: one(students, {
    fields: [examScores.studentId],
    references: [students.id],
  }),
  institute: one(institutes, {
    fields: [examScores.instituteId],
    references: [institutes.id],
  }),
}));

// MockTimedExams Relations
export const mockExamsRelations = relations(mockExams, ({ one, many }) => ({
  batch: one(batches, {
    fields: [mockExams.batchId],
    references: [batches.id],
  }),
  questions: many(questions),
  attempts: many(examAttempts),
  institute: one(institutes, {
    fields: [mockExams.instituteId],
    references: [institutes.id],
  }),
}));

// Questions Relations
export const questionsRelations = relations(questions, ({ one, many }) => ({
  exam: one(mockExams, {
    fields: [questions.examId],
    references: [mockExams.id],
  }),
  answers: many(attemptAnswers),
  institute: one(institutes, {
    fields: [questions.instituteId],
    references: [institutes.id],
  }),
}));

// ExamAttempts Relations
export const examAttemptsRelations = relations(examAttempts, ({ one, many }) => ({
  exam: one(mockExams, {
    fields: [examAttempts.examId],
    references: [mockExams.id],
  }),
  student: one(students, {
    fields: [examAttempts.studentId],
    references: [students.id],
  }),
  answers: many(attemptAnswers),
  institute: one(institutes, {
    fields: [examAttempts.instituteId],
    references: [institutes.id],
  }),
}));

// AttemptAnswers Relations
export const attemptAnswersRelations = relations(attemptAnswers, ({ one }) => ({
  attempt: one(examAttempts, {
    fields: [attemptAnswers.attemptId],
    references: [examAttempts.id],
  }),
  question: one(questions, {
    fields: [attemptAnswers.questionId],
    references: [questions.id],
  }),
  institute: one(institutes, {
    fields: [attemptAnswers.instituteId],
    references: [institutes.id],
  }),
}));

// 17. Payslips Table
export const payslips = pgTable("payslips", {
  id: uuid("id").defaultRandom().primaryKey(),
  teacherId: text("teacher_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  netPay: decimal("net_pay", { precision: 10, scale: 2 }).notNull(),
  month: text("month").notNull(), // format YYYY-MM
  createdAt: timestamp("created_at").defaultNow().notNull(),
  instituteId: uuid("institute_id").references(() => institutes.id, { onDelete: "cascade" }),
}, (table) => {
  return {
    payslipsInstituteIdIdx: index("payslips_institute_id_idx").on(table.instituteId),
  };
});

// Payslips Relations
export const payslipsRelations = relations(payslips, ({ one }) => ({
  teacher: one(users, {
    fields: [payslips.teacherId],
    references: [users.id],
  }),
  institute: one(institutes, {
    fields: [payslips.instituteId],
    references: [institutes.id],
  }),
}));

// 18. Inquiries (Admissions CRM) Table
export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "NEW_WALKIN",
  "CALLED",
  "TRIAL_SCHEDULED",
  "ENROLLED",
  "LOST",
]);

export const inquiries = pgTable("inquiries", {
  id: uuid("id").defaultRandom().primaryKey(),
  instituteId: uuid("institute_id").references(() => institutes.id, { onDelete: "cascade" }),
  studentName: text("student_name").notNull(),
  guardianPhone: text("guardian_phone").notNull(),
  targetCourse: text("target_course").notNull(),
  status: inquiryStatusEnum("status").notNull().default("NEW_WALKIN"),
  followUpDate: timestamp("follow_up_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    inquiriesInstituteIdIdx: index("inquiries_institute_id_idx").on(table.instituteId),
  };
});

// Inquiries Relations
export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  institute: one(institutes, {
    fields: [inquiries.instituteId],
    references: [institutes.id],
  }),
}));

// User Registrations — self-signup awaiting admin approval
export const userRegistrations = pgTable("user_registrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  role: roleEnum("role").notNull().default("STUDENT"),   // TEACHER or STUDENT
  passwordHash: text("password_hash").notNull(),
  status: registrationStatusEnum("status").notNull().default("PENDING"),
  rejectionReason: text("rejection_reason"),
  // Set by admin on approval — which institute to place this user in
  instituteId: uuid("institute_id").references(() => institutes.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: text("reviewed_by"),  // admin userId who took action
});

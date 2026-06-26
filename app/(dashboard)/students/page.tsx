import * as React from "react";
import { db } from "@/db";
import { students, users, batches } from "@/db/schema";
import { eq } from "drizzle-orm";
import { StudentsClient } from "./students-client";
import { EnrolledStudent } from "./student-dialog";

export const revalidate = 0; // Dynamic route to pull latest student list

export const metadata = {
  title: "Students Directory",
};

// Standalone fallback mock records if Postgres is offline
const mockStudents: EnrolledStudent[] = [
  { id: "std_1", name: "Subhashree Dash", email: "subhashree.d@example.com", batch: "Class 12 — Physics A", status: "active" },
  { id: "std_2", name: "Arpan Mohanty", email: "arpan.m@example.com", batch: "Mock Cohort Batch", status: "active" },
  { id: "std_3", name: "Ananya Mishra", email: "ananya.m@example.com", batch: "Mock Cohort Batch", status: "active" },
  { id: "std_4", name: "Chinmay Mohapatra", email: "chinmay.m@example.com", batch: "Mock Cohort Batch", status: "active" },
  { id: "std_5", name: "Priyanka Jena", email: "priyanka.j@example.com", batch: "Class 12 — Physics A", status: "inactive" },
  { id: "std_6", name: "Soumya Ranjan", email: "soumya.r@example.com", batch: "Mock Cohort Batch", status: "active" },
  { id: "std_7", name: "Debasish Patnaik", email: "debasish.p@example.com", batch: "Class 12 — Physics A", status: "inactive" },
  { id: "std_8", name: "Lipsa Priyadarshini", email: "lipsa.p@example.com", batch: "Class 12 — Physics A", status: "active" },
];

const mockBatches = [
  { id: "b-1", name: "Class 12 — Physics A" },
  { id: "b-2", name: "Class 11 — CS B" },
  { id: "b-mock", name: "Mock Cohort Batch" },
];

export default async function StudentsPage() {
  let dbStudents: any[] = [];
  let dbBatchesList: any[] = [];
  let useFallback = false;

  try {
    // 1. Fetch students joined with user profile and batch details
    dbStudents = await db
      .select({
        id: students.id,
        name: users.name,
        email: users.email,
        batchName: batches.name,
        status: students.status,
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .leftJoin(batches, eq(students.batchId, batches.id));

    // 2. Fetch all batches for filtering and selection dropdowns
    dbBatchesList = await db.select({ id: batches.id, name: batches.name }).from(batches);
  } catch (error) {
    console.warn("Postgres connection unavailable. Rendering mock students directory.");
    useFallback = true;
  }

  const finalStudentsList: EnrolledStudent[] = useFallback
    ? mockStudents
    : dbStudents.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        batch: s.batchName || "Unassigned",
        status: s.status as "active" | "inactive",
      }));

  const finalBatchesList = useFallback
    ? mockBatches
    : dbBatchesList.map((b) => ({ id: b.id, name: b.name }));

  return (
    <StudentsClient
      initialStudents={finalStudentsList}
      batches={finalBatchesList}
    />
  );
}

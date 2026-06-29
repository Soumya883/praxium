import * as React from "react";
import { db } from "@/db";
import { batches, courses, instituteExams } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { checkRole } from "@/app/actions/rbac-utils";
import { getTenantDb } from "@/lib/db/tenant";
import { OfflineExamsClient } from "./offline-exams-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Offline Exams | Praxium",
};

export default async function OfflineExamsPage() {
  let teacherBatches: any[] = [];
  let pastExams: any[] = [];
  let loadError: string | null = null;

  try {
    const { authorized, role, userId } = await checkRole(["ADMIN", "TEACHER"]);
    const { instituteId } = await getTenantDb();

    if (authorized && userId) {
      // 1. Fetch batches for dropdown — ALWAYs load all institute batches for ADMIN
      // For TEACHER: try to load their batches, fall back to all batches if none found
      teacherBatches = await db
        .select({
          id: batches.id,
          name: batches.name,
          courseName: courses.name,
        })
        .from(batches)
        .innerJoin(courses, eq(batches.courseId, courses.id))
        .where(eq(batches.instituteId, instituteId));

      // If teacher mode and has assigned batches, filter to those
      if (role === "TEACHER") {
        const myBatches = teacherBatches.filter(b => b.teacherId === userId);
        if (myBatches.length > 0) {
          teacherBatches = myBatches;
        }
        // else keep all batches so teacher can still enter marks
      }

      // 2. Fetch existing offline exams
      try {
        pastExams = await db
          .select({
            id: instituteExams.id,
            subject: instituteExams.subject,
            maxMarks: instituteExams.maxMarks,
            date: instituteExams.date,
            batchName: batches.name,
            createdAt: instituteExams.createdAt,
          })
          .from(instituteExams)
          .innerJoin(batches, eq(instituteExams.batchId, batches.id))
          .where(eq(instituteExams.instituteId, instituteId))
          .orderBy(desc(instituteExams.date));
      } catch (examErr: any) {
        // Table might not exist yet on cloud DB - gracefully handle
        console.error("Failed to fetch institute_exams:", examErr.message);
        loadError = examErr.message;
      }
    }
  } catch (error: any) {
    console.error("Failed to load offline exams data", error);
    loadError = error?.message || "Failed to load page data.";
  }

  return (
    <div className="py-6">
      {loadError && (
        <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl text-sm max-w-6xl mx-auto">
          <strong>Warning:</strong> Could not load exam history. {loadError.includes("institute_exams") || loadError.includes("does not exist") 
            ? "The database table is missing. Please run the migration script." 
            : loadError}
        </div>
      )}
      <OfflineExamsClient batches={teacherBatches} initialExams={pastExams} />
    </div>
  );
}

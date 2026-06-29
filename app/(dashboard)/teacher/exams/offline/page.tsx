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

  try {
    const { authorized, role, userId } = await checkRole(["ADMIN", "TEACHER"]);
    const { instituteId } = await getTenantDb();

    if (authorized && userId) {
      // 1. Fetch batches for dropdown
      let batchesQuery = db
        .select({
          id: batches.id,
          name: batches.name,
          courseName: courses.name,
        })
        .from(batches)
        .innerJoin(courses, eq(batches.courseId, courses.id))
        .where(eq(batches.instituteId, instituteId));

      if (role === "TEACHER") {
        batchesQuery = db
          .select({
            id: batches.id,
            name: batches.name,
            courseName: courses.name,
          })
          .from(batches)
          .innerJoin(courses, eq(batches.courseId, courses.id))
          .where(and(eq(batches.teacherId, userId), eq(batches.instituteId, instituteId)));
      }

      teacherBatches = await batchesQuery;

      // 2. Fetch existing offline exams
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
    }
  } catch (error) {
    console.error("Failed to load offline exams data", error);
  }

  return (
    <div className="py-6">
      <OfflineExamsClient batches={teacherBatches} initialExams={pastExams} />
    </div>
  );
}

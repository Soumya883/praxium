import * as React from "react";
import { db } from "@/db";
import { batches, courses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { checkRole } from "@/app/actions/rbac-utils";
import { getTenantDb } from "@/lib/db/tenant";
import { TeacherExamBuilderClient } from "./exam-builder-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Build CBT Exam | Praxium",
};

const mockTeacherBatches = [
  { id: "batch_phy_a", name: "Class 12 — Physics A", courseName: "JEE Advanced Physics" },
  { id: "batch_phy_b", name: "Class 11 — Physics B", courseName: "JEE Advanced Physics" }
];

export default async function NewExamPage() {
  let teacherBatches: any[] = [];
  let useFallback = false;

  try {
    const { authorized, role, userId } = await checkRole(["ADMIN", "TEACHER"]);
    const { instituteId } = await getTenantDb();

    if (!authorized || !userId) {
      useFallback = true;
    } else {
      // Query batches assigned to this teacher (or all batches if Admin)
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
    }
  } catch (error) {
    console.warn("DB connection unavailable for exam batch fetch. Using mock cohorts.");
    useFallback = true;
  }

  if (useFallback || teacherBatches.length === 0) {
    teacherBatches = mockTeacherBatches;
  }

  return (
    <div className="py-6">
      <TeacherExamBuilderClient batches={teacherBatches} />
    </div>
  );
}

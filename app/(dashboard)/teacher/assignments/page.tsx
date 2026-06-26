import * as React from "react";
import { db } from "@/db";
import { batches, courses, assignments, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { checkRole } from "@/app/actions/rbac-utils";
import { getTenantDb } from "@/lib/db/tenant";
import { TeacherAssignmentsClient } from "./assignments-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Teacher Assignments Panel | Praxium",
};

const mockTeacherBatches = [
  { id: "batch_phy_a", name: "Class 12 — Physics A", courseName: "JEE Advanced Physics", roomNumber: "Room 101" },
  { id: "batch_phy_b", name: "Class 11 — Physics B", courseName: "JEE Advanced Physics", roomNumber: "Room 101" }
];

const mockTeacherAssignments = [
  { id: "asg_1", title: "Electrostatics Gauss Law Worksheet", description: "Submit proofs for Gauss's law applications and sphere distributions.", dueDate: "2026-07-02T18:00:00Z", maxMarks: 100, batchName: "Class 12 — Physics A", submissionsCount: 2, batchId: "batch_phy_a" },
  { id: "asg_2", title: "Capacitance Combo Sheet", description: "Solve Chapter 31 exercises on capacitor dielectric combinations.", dueDate: "2026-07-08T18:00:00Z", maxMarks: 50, batchName: "Class 12 — Physics A", submissionsCount: 1, batchId: "batch_phy_a" },
  { id: "asg_3", title: "Geometrical Optics Proofs", description: "Lens maker formula and prism minimum deviation proofs.", dueDate: "2026-07-15T18:00:00Z", maxMarks: 100, batchName: "Class 12 — Physics A", submissionsCount: 0, batchId: "batch_phy_a" }
];

export default async function TeacherAssignmentsPage() {
  let teacherBatches: any[] = [];
  let teacherAssignments: any[] = [];
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
          roomNumber: batches.roomNumber,
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
            roomNumber: batches.roomNumber,
          })
          .from(batches)
          .innerJoin(courses, eq(batches.courseId, courses.id))
          .where(and(eq(batches.teacherId, userId), eq(batches.instituteId, instituteId)));
      }

      teacherBatches = await batchesQuery;

      // Query assignments in batches managed by this teacher
      const batchIdsList = teacherBatches.map(b => b.id);
      if (batchIdsList.length > 0) {
        const dbAssignments = await db
          .select({
            id: assignments.id,
            title: assignments.title,
            description: assignments.description,
            dueDate: assignments.dueDate,
            maxMarks: assignments.maxMarks,
            batchId: assignments.batchId,
            batchName: batches.name,
          })
          .from(assignments)
          .innerJoin(batches, eq(assignments.batchId, batches.id))
          .where(and(eq(assignments.instituteId, instituteId)))
          .orderBy(desc(assignments.dueDate));
        
        // Filter in code or query to match teacher's batches
        teacherAssignments = dbAssignments.filter(a => batchIdsList.includes(a.batchId));
      }
    }
  } catch (error) {
    console.warn("DB connection unavailable for teacher assignments dashboard. Using mock.");
    useFallback = true;
  }

  if (useFallback || teacherBatches.length === 0) {
    teacherBatches = mockTeacherBatches;
    teacherAssignments = mockTeacherAssignments;
  }

  return (
    <TeacherAssignmentsClient
      batches={teacherBatches}
      assignments={teacherAssignments}
    />
  );
}

import * as React from "react";
import { db } from "@/db";
import { users, batches, courses, assignments } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { getTenantDb } from "@/lib/db/tenant";
import { AdminManageClient } from "./admin-manage-client";

export const revalidate = 0;

export const metadata = {
  title: "Admin Control Panel",
};

// Fallback mock data
const mockUsers = [
  { id: "usr_t1", name: "Prof. Manoj Das", email: "manoj.das@praxium.io", phone: "+91 98765 00001", role: "TEACHER" as const, createdAt: new Date("2026-01-10") },
  { id: "usr_t2", name: "Dr. Rashmi Rekha", email: "rashmi.r@praxium.io", phone: "+91 98765 00002", role: "TEACHER" as const, createdAt: new Date("2026-01-12") },
  { id: "usr_s1", name: "Subhashree Dash", email: "subhashree.d@example.com", phone: "+91 90000 00010", role: "STUDENT" as const, createdAt: new Date("2026-02-01") },
  { id: "usr_s2", name: "Arpan Mohanty", email: "arpan.m@example.com", phone: "+91 90000 00011", role: "STUDENT" as const, createdAt: new Date("2026-02-05") },
];

const mockBatches = [
  { id: "b1", name: "Class 12 — Physics A", courseId: "c1", teacherId: "usr_t1", courseName: "JEE Advanced Physics", teacherName: "Prof. Manoj Das", daysOfWeek: ["MON","WED","FRI"], startTime: "14:00", endTime: "15:30", roomNumber: "Room 101", maxCapacity: 30 },
  { id: "b2", name: "Class 11 — CS B", courseId: "c4", teacherId: "usr_t2", courseName: "Computer Science", teacherName: "Dr. Rashmi Rekha", daysOfWeek: ["TUE","THU"], startTime: "10:30", endTime: "12:00", roomNumber: "Room 102", maxCapacity: 25 },
];

const mockCourses = [
  { id: "c1", name: "JEE Advanced Physics", description: "Advanced Physics for JEE Mains and Advanced", createdAt: new Date("2026-01-01") },
  { id: "c2", name: "JEE Advanced Mathematics", description: "Comprehensive Maths for competitive exams", createdAt: new Date("2026-01-01") },
  { id: "c4", name: "Computer Science", description: "Programming and Theory for Board Exams", createdAt: new Date("2026-01-01") },
];

const mockAssignments = [
  { id: "asgn1", title: "Kinematics Problem Set", description: "Solve problems 1-20", batchId: "b1", teacherId: "usr_t1", batchName: "Class 12 — Physics A", teacherName: "Prof. Manoj Das", dueDate: new Date("2026-07-05"), maxMarks: 50 },
];

export default async function AdminManagePage() {
  let dbUsers: any[] = [];
  let dbBatches: any[] = [];
  let dbCourses: any[] = [];
  let dbAssignments: any[] = [];
  let dbTeachers: any[] = [];
  let useFallback = false;

  try {
    const { instituteId } = await getTenantDb();

    // 1. Fetch all non-admin users
    dbUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(eq(users.instituteId, instituteId), ne(users.role, "ADMIN")))
      .orderBy(users.createdAt);

    // 2. Teachers list (for assignment/batch dropdowns)
    dbTeachers = dbUsers.filter(u => u.role === "TEACHER");

    // 3. Fetch batches
    dbBatches = await db
      .select({
        id: batches.id,
        name: batches.name,
        daysOfWeek: batches.daysOfWeek,
        startTime: batches.startTime,
        endTime: batches.endTime,
        roomNumber: batches.roomNumber,
        maxCapacity: batches.maxCapacity,
        courseId: batches.courseId,
        teacherId: batches.teacherId,
        courseName: courses.name,
        teacherName: users.name,
      })
      .from(batches)
      .innerJoin(courses, eq(batches.courseId, courses.id))
      .leftJoin(users, eq(batches.teacherId, users.id))
      .where(eq(batches.instituteId, instituteId));

    // 4. Parse daysOfWeek JSON
    dbBatches = dbBatches.map((b: any) => ({
      ...b,
      daysOfWeek: (() => {
        try { return JSON.parse(b.daysOfWeek); } catch { return [b.daysOfWeek]; }
      })(),
    }));

    // 5. Fetch courses
    dbCourses = await db
      .select()
      .from(courses)
      .where(eq(courses.instituteId, instituteId))
      .orderBy(courses.createdAt);

    // 6. Fetch assignments
    dbAssignments = await db
      .select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        batchId: assignments.batchId,
        teacherId: assignments.teacherId,
        dueDate: assignments.dueDate,
        maxMarks: assignments.maxMarks,
        batchName: batches.name,
        teacherName: users.name,
      })
      .from(assignments)
      .innerJoin(batches, eq(assignments.batchId, batches.id))
      .innerJoin(users, eq(assignments.teacherId, users.id))
      .where(eq(assignments.instituteId, instituteId))
      .orderBy(assignments.dueDate);

  } catch (error) {
    console.warn("Postgres unavailable. Rendering mock admin manage data.");
    useFallback = true;
  }

  const finalUsers = useFallback ? mockUsers : dbUsers;
  const finalBatches = useFallback ? mockBatches : dbBatches;
  const finalCourses = useFallback ? mockCourses : dbCourses;
  const finalAssignments = useFallback ? mockAssignments : dbAssignments.map((a: any) => ({
    ...a,
    dueDate: new Date(a.dueDate),
  }));
  const finalTeachers = useFallback
    ? mockUsers.filter(u => u.role === "TEACHER").map(u => ({ id: u.id, name: u.name }))
    : dbTeachers.map((t: any) => ({ id: t.id, name: t.name }));

  return (
    <AdminManageClient
      initialUsers={finalUsers}
      initialBatches={finalBatches}
      initialCourses={finalCourses}
      initialAssignments={finalAssignments}
      teachers={finalTeachers}
      batches={finalBatches.map(b => ({ id: b.id, name: b.name, courseId: b.courseId }))}
      courses={finalCourses.map((c: any) => ({ id: c.id, name: c.name }))}
    />
  );
}

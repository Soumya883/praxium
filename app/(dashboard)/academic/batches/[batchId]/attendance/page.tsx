import * as React from "react";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { batches, students, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AttendanceClient } from "./attendance-client";

export const dynamic = "force-dynamic";

interface AttendancePageProps {
  params: Promise<{
    batchId: string;
  }>;
}

export const metadata = {
  title: "Daily Attendance Register",
};

export default async function AttendanceRegisterPage({ params }: AttendancePageProps) {
  const { batchId } = await params;

  let batchInfo = null;
  let studentList: { id: string; name: string; email: string }[] = [];
  let useFallback = false;

  try {
    // 1. Fetch batch details
    const [dbBatch] = await db
      .select({
        id: batches.id,
        name: batches.name,
        teacherName: users.name,
      })
      .from(batches)
      .leftJoin(users, eq(batches.teacherId, users.id))
      .where(eq(batches.id, batchId));

    if (!dbBatch) {
      // If db connects but batch doesn't exist
      notFound();
    }
    batchInfo = dbBatch;

    // 2. Fetch students in the batch
    studentList = await db
      .select({
        id: students.id,
        name: users.name,
        email: users.email,
      })
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(students.batchId, batchId));
  } catch (error) {
    console.warn("Postgres connection unavailable. Rendering mock attendance register.");
    useFallback = true;
  }

  // Handle local mockup fallback values
  if (useFallback) {
    batchInfo = {
      id: batchId,
      name: batchId === "b-1" ? "Class 12 — Physics A" : "Mock Cohort Batch",
      teacherName: "Dr. Richard Feynman",
    };
    studentList = [
      { id: "s-1", name: "Sarah Jenkins", email: "sarah.j@example.com" },
      { id: "s-2", name: "David Miller", email: "david.m@example.com" },
      { id: "s-3", name: "Emily Watson", email: "emily.w@example.com" },
      { id: "s-4", name: "Michael Chang", email: "michael.c@example.com" },
      { id: "s-5", name: "Alice Cooper", email: "alice.c@example.com" },
    ];
  }

  if (!batchInfo) {
    notFound();
  }

  return (
    <AttendanceClient
      batchId={batchInfo.id}
      batchName={batchInfo.name}
      teacherName={batchInfo.teacherName || "Unassigned"}
      students={studentList}
    />
  );
}

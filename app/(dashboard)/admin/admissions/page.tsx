import * as React from "react";
import { getInquiries } from "@/app/actions/crm";
import { getTenantDb } from "@/lib/db/tenant";
import { db } from "@/db";
import { batches, courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AdmissionsKanbanClient } from "./admissions-kanban-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admissions CRM | Praxium",
  description: "Track and manage student inquiries through the admissions pipeline.",
};

export default async function AdminAdmissionsPage() {
  // Fetch inquiries — wrapped so DB/auth errors never 500 the page
  let inquiriesData: any[] = [];
  try {
    const result = await getInquiries();
    inquiriesData = result.data ?? [];
  } catch {
    // DB offline or auth error — render empty board
  }

  // Fetch available batches for the "Convert to Student" dialog
  let availableBatches: { id: string; name: string; courseName: string }[] = [];
  try {
    const { instituteId } = await getTenantDb();
    const batchRows = await db
      .select({
        id: batches.id,
        name: batches.name,
        courseName: courses.name,
      })
      .from(batches)
      .leftJoin(courses, eq(batches.courseId, courses.id))
      .where(eq(batches.instituteId, instituteId));

    availableBatches = batchRows.map((b) => ({
      id: b.id,
      name: b.name,
      courseName: b.courseName ?? "Unknown Course",
    }));
  } catch {
    // Demo mode — DB not available
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Admissions CRM
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Track every walk-in from first contact to enrollment.{" "}
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {inquiriesData?.length ?? 0} total leads
            </span>
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <AdmissionsKanbanClient
        initialInquiries={inquiriesData ?? []}
        availableBatches={availableBatches}
      />
    </div>
  );
}

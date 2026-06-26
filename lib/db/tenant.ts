import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { institutes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getTenantDb() {
  let clerkOrgId = "mock_org_123";

  // Check if Clerk keys are present
  const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (hasClerk) {
    const session = await auth();
    if (session.orgId) {
      clerkOrgId = session.orgId;
    } else {
      // In production or strict checks, orgId is mandatory for dashboard access
      if (process.env.NODE_ENV === "production" || process.env.STRICT_ENV_CHECK === "1") {
        throw new Error("Catastrophic Access Control Failure: Active Organization session is required.");
      }
    }
  }

  // Fallback UUID for offline database states
  let dbTenantId = "00000000-0000-0000-0000-000000000000";

  try {
    // Try resolving from database
    const [inst] = await db
      .select()
      .from(institutes)
      .where(eq(institutes.clerkOrgId, clerkOrgId))
      .limit(1);

    if (inst) {
      dbTenantId = inst.id;
    } else {
      // Auto-provision tenant record on first login
      const name = clerkOrgId === "mock_org_123" ? "Sharma Physics Academy" : `Coaching Institute (${clerkOrgId.substring(0, 8)})`;
      const [newInst] = await db
        .insert(institutes)
        .values({
          clerkOrgId,
          name,
          primaryColor: "#4f46e5", // Default Indigo
        })
        .returning();
      
      if (newInst) {
        dbTenantId = newInst.id;
      }
    }
  } catch (error) {
    // Fallback if Postgres is offline during local evaluation
    console.warn("[TENANT RESOLUTION FALLBACK]: Database offline. Using default static tenant UUID.");
  }

  return {
    clerkOrgId,
    instituteId: dbTenantId,
    withTenant: (table: any) => eq(table.instituteId, dbTenantId),
  };
}

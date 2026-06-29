"use server";

import { db } from "@/db";
import { users, userRegistrations, students } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";

interface AuthCallbackArgs {
  clerkUserId: string;
  email: string;
  fullName: string;
  phone?: string;
  requestedRole: "STUDENT" | "TEACHER";
}

export async function handleAuthCallbackAction(args: AuthCallbackArgs) {
  const { clerkUserId, email, fullName, phone, requestedRole } = args;

  try {
    // 1. Check if user already has a users record linked by clerkUserId
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);

    if (existingUser) {
      // Sync Clerk role publicMetadata just in case it is missing/lost
      await syncClerkRole(clerkUserId, existingUser.role);
      return { success: true, redirectUrl: redirectByRole(existingUser.role) };
    }

    // 2. Check if a users record exists by email (e.g. seeded users or approved via admin panel)
    const [userByEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userByEmail) {
      // Link the Clerk user ID
      await db
        .update(users)
        .set({ clerkUserId })
        .where(eq(users.id, userByEmail.id));

      // Sync Clerk role publicMetadata
      await syncClerkRole(clerkUserId, userByEmail.role);

      return { success: true, redirectUrl: redirectByRole(userByEmail.role) };
    }

    // 3. Check userRegistrations table by email
    const [reg] = await db
      .select()
      .from(userRegistrations)
      .where(eq(userRegistrations.email, email))
      .limit(1);

    if (reg) {
      if (reg.status === "APPROVED") {
        // If registration was approved but users table record is missing clerkUserId:
        // Query users by email to find the approved record
        const [linkedUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (linkedUser) {
          await db
            .update(users)
            .set({ clerkUserId })
            .where(eq(users.id, linkedUser.id));

          await syncClerkRole(clerkUserId, linkedUser.role);
          return { success: true, redirectUrl: redirectByRole(linkedUser.role) };
        } else {
          // If approved registration exists but users table doesn't have it (fallback edge case):
          const generatedUserId = `usr_${Math.random().toString(36).substring(2, 10)}`;
          
          await db.transaction(async (tx) => {
            await tx.insert(users).values({
              id: generatedUserId,
              clerkUserId,
              role: reg.role,
              name: reg.name,
              email: reg.email,
              phone: reg.phone,
              instituteId: reg.instituteId || "inst_demo_01",
            });

            if (reg.role === "STUDENT") {
              await tx.insert(students).values({
                userId: generatedUserId,
                instituteId: reg.instituteId || "inst_demo_01",
                status: "active",
              });
            }
          });

          await syncClerkRole(clerkUserId, reg.role);
          return { success: true, redirectUrl: redirectByRole(reg.role) };
        }
      }

      if (reg.status === "REJECTED") {
        return { success: true, redirectUrl: "/rejected" };
      }

      // PENDING
      return { success: true, redirectUrl: "/pending" };
    }

    // 4. No registration exists at all: create a PENDING registration
    await db.insert(userRegistrations).values({
      name: fullName || email,
      email,
      phone: phone || null,
      passwordHash: "CLERK_MANAGED",
      role: requestedRole,
      status: "PENDING",
    });

    return { success: true, redirectUrl: "/pending" };
  } catch (err: any) {
    console.error("[handleAuthCallbackAction]", err);
    return { success: false, error: err.message || "Failed to complete authentication callback." };
  }
}

async function syncClerkRole(clerkUserId: string, role: string) {
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { role }
    });
  } catch (e) {
    console.error(`Failed to update publicMetadata role for Clerk user ${clerkUserId}:`, e);
  }
}

function redirectByRole(role: string) {
  if (role === "STUDENT") return "/student-portal";
  if (role === "TEACHER") return "/academic";
  return "/dashboard"; // ADMIN
}

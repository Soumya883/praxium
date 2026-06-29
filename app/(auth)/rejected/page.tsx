import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { userRegistrations } from "@/db/schema";
import { eq } from "drizzle-orm";
import RejectedClient from "./rejected-client";

export const dynamic = "force-dynamic";

export default async function RejectedPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect("/login");
  }

  const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
  let reason = "Please contact the administration for details.";

  try {
    const [reg] = await db
      .select({ rejectionReason: userRegistrations.rejectionReason })
      .from(userRegistrations)
      .where(eq(userRegistrations.email, email))
      .limit(1);

    if (reg?.rejectionReason) {
      reason = reg.rejectionReason;
    }
  } catch (e) {
    console.error("Failed to query rejection reason", e);
  }

  return <RejectedClient email={email} reason={reason} />;
}

import { auth } from "@clerk/nextjs/server";

export type Role = "ADMIN" | "TEACHER" | "STUDENT";

/**
 * Reusable utility to assert and verify Clerk session roles.
 * Supports local standalone testing if Clerk publishable keys are not set.
 */
export async function checkRole(allowedRoles: Role[]): Promise<{ authorized: boolean; role: Role; userId: string | null }> {
  // Bypasses checks if Clerk publishable key is not set to facilitate local evaluation
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const rawSession = cookieStore.get("praxium_session")?.value;
      if (rawSession) {
        const decodedStr = Buffer.from(rawSession, "base64url").toString("utf8");
        const payload = JSON.parse(decodedStr);
        if (payload && payload.exp > Date.now()) {
          const role = payload.role as Role;
          const authorized = allowedRoles.includes(role);
          return { authorized, role, userId: payload.userId };
        }
      }
    } catch {
      // ignore
    }

    let mockRole: Role = "ADMIN";
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const val = cookieStore.get("praxium_mock_role")?.value;
      if (val === "ADMIN" || val === "TEACHER" || val === "STUDENT") {
        mockRole = val;
      }
    } catch {
      // ignore
    }

    let userId = "mock_user_123";
    if (mockRole === "ADMIN") userId = "usr_admin_01";
    if (mockRole === "TEACHER") userId = "usr_teacher_01";
    if (mockRole === "STUDENT") userId = "usr_student_1";

    const authorized = allowedRoles.includes(mockRole);
    return { authorized, role: mockRole, userId };
  }

  const session = await auth();
  const role = session.sessionClaims?.metadata?.role as Role | undefined;
  const userId = session.userId;

  if (!role || !allowedRoles.includes(role)) {
    return { authorized: false, role: role || "STUDENT", userId };
  }

  return { authorized: true, role, userId };
}

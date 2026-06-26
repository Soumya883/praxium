"use server";

import { db } from "@/db";
import { userRegistrations, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { z } from "zod";

// ─── Password helpers (uses Node crypto — no extra deps) ──────────────────────

const SALT_ITERATIONS = 100000;
const SALT_BYTES = 32;
const KEY_BYTES = 64;
const DIGEST = "sha512";

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_BYTES).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, SALT_ITERATIONS, KEY_BYTES, DIGEST)
    .toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto
    .pbkdf2Sync(password, salt, SALT_ITERATIONS, KEY_BYTES, DIGEST)
    .toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
}

// ─── Session helpers ──────────────────────────────────────────────────────────

const SESSION_COOKIE = "praxium_session";

export interface SessionPayload {
  userId: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  name: string;
  email: string;
  exp: number; // unix ms
}

function encodeSession(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeSession(raw: string): SessionPayload | null {
  try {
    const data = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as SessionPayload;
    if (Date.now() > data.exp) return null; // expired
    return data;
  } catch {
    return null;
  }
}

export async function getCurrentSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(SESSION_COOKIE)?.value;
    if (!raw) return null;
    return decodeSession(raw);
  } catch {
    return null;
  }
}

// ─── Register ─────────────────────────────────────────────────────────────────

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  role: z.enum(["TEACHER", "STUDENT"]),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function registerUser(formData: FormData): Promise<RegisterResult> {
  const raw = {
    name: formData.get("name") as string,
    email: (formData.get("email") as string)?.trim().toLowerCase(),
    phone: formData.get("phone") as string | undefined,
    role: formData.get("role") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, phone, role, password } = parsed.data;

  // Check for existing registration
  try {
    const existing = await db
      .select({ id: userRegistrations.id })
      .from(userRegistrations)
      .where(eq(userRegistrations.email, email))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: "An account with this email already exists or is pending review." };
    }

    const passwordHash = hashPassword(password);

    await db.insert(userRegistrations).values({
      name,
      email,
      phone: phone || null,
      role: role as "TEACHER" | "STUDENT",
      passwordHash,
      status: "PENDING",
    });

    return { success: true };
  } catch (err: any) {
    // Unique constraint violation
    if (err?.code === "23505") {
      return { success: false, error: "An account with this email already exists." };
    }
    console.error("[registerUser]", err);
    return { success: false, error: "Registration failed. Please try again." };
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────

export type LoginResult =
  | { success: true; role: string }
  | { success: false; error: string; status?: "PENDING" | "REJECTED" };

export async function loginUser(formData: FormData): Promise<LoginResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasClerk = clerkKey && clerkKey.includes(".");
  
  // 1. Bypass check for default Admin under local/mock dev when Clerk is offline
  if (!hasClerk && email === "admin@praxium.edu") {
    const payload: SessionPayload = {
      userId: "usr_admin_01",
      role: "ADMIN",
      name: "Sushvine Admin",
      email: "admin@praxium.edu",
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    };

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, encodeSession(payload), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });

    cookieStore.set("praxium_mock_role", "ADMIN", {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true, role: "ADMIN" };
  }

  try {
    const rows = await db
      .select()
      .from(userRegistrations)
      .where(eq(userRegistrations.email, email))
      .limit(1);

    const user = rows[0];

    if (!user) {
      return { success: false, error: "Invalid email or password." };
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return { success: false, error: "Invalid email or password." };
    }

    if (user.status === "PENDING") {
      return {
        success: false,
        error: "Your registration is pending admin approval. Please wait.",
        status: "PENDING",
      };
    }

    if (user.status === "REJECTED") {
      const reason = user.rejectionReason
        ? `Reason: ${user.rejectionReason}`
        : "Please contact the institute for more information.";
      return {
        success: false,
        error: `Your application was rejected. ${reason}`,
        status: "REJECTED",
      };
    }

    // APPROVED — resolve actual users table record to get the correct userId
    // (approveRegistration creates a users record with a new generatedUserId)
    let resolvedUserId = user.id; // fallback to registration id
    try {
      const [dbUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (dbUser) {
        resolvedUserId = dbUser.id;
      }
    } catch {
      // fallback to registration id if users lookup fails
    }

    const payload: SessionPayload = {
      userId: resolvedUserId,
      role: user.role as "TEACHER" | "STUDENT",
      name: user.name,
      email: user.email,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    };

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, encodeSession(payload), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });

    // Also set the mock role cookie so the sidebar filters correctly
    cookieStore.set("praxium_mock_role", payload.role, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true, role: payload.role };
  } catch (err: any) {
    console.error("[loginUser]", err);
    return { success: false, error: "Login failed. Please try again." };
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutUser(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete("praxium_mock_role");
  redirect("/login");
}

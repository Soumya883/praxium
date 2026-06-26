import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection URL"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"),
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
});

const envValues = {
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
};

const isProd = process.env.VERCEL === "1" || process.env.STRICT_ENV_CHECK === "1";

const parsed = envSchema.safeParse(envValues);

if (!parsed.success) {
  if (isProd) {
    console.error("\n❌ PROD BUILD FAILURE: Missing or invalid environment variables:");
    const formatted = parsed.error.format();
    Object.entries(formatted).forEach(([key, value]) => {
      if (key !== "_errors" && value && "_errors" in value) {
        console.error(`   - ${key}: ${value._errors.join(", ")}`);
      }
    });
    console.error("\nEnsure all required keys are populated in your Vercel project settings.\n");
    throw new Error("Build aborted: Missing environment variables.");
  } else {
    console.warn("\n⚠️  [LOCAL DEVELOPMENT WARNING]: Missing environment variables:");
    const formatted = parsed.error.format();
    Object.entries(formatted).forEach(([key, value]) => {
      if (key !== "_errors" && value && "_errors" in value) {
        console.warn(`   - ${key}: ${value._errors.join(", ")}`);
      }
    });
    console.warn("Praxium will fall back to local interactive mockup data configurations.\n");
  }
}

export const env = parsed.success
  ? parsed.data
  : {
      DATABASE_URL: envValues.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/praxium",
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: envValues.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
      CLERK_SECRET_KEY: envValues.CLERK_SECRET_KEY || "",
      RESEND_API_KEY: envValues.RESEND_API_KEY || "",
    };

import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const runCustomMigrate = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  const connectionString = process.env.DATABASE_URL;
  const sql = postgres(connectionString, { max: 1 });

  console.log("Running custom queries...");
  
  try {
    await sql`ALTER TYPE "public"."comm_type" ADD VALUE 'EXAM_RESULT'`;
    console.log("Added EXAM_RESULT to comm_type");
  } catch (e: any) {
    console.log("Enum add error:", e.message);
  }

  try {
    await sql`ALTER TABLE "public"."exam_scores" ADD COLUMN "remarks" text`;
    console.log("Added remarks column to exam_scores");
  } catch (e: any) {
    console.log("Column add error:", e.message);
  }
  
  console.log("Done!");
  await sql.end();
};

runCustomMigrate().catch((err) => {
  console.error("Custom migration failed:", err);
  process.exit(1);
});

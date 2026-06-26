import { db } from "@/db";
import { batches, courses, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AcademicClient, BatchItem, CourseItem, TeacherItem } from "./academic-client";
import { unstable_cache } from "next/cache";

// Cache slowly-changing Course directory with a specific tag
const getCachedCourses = unstable_cache(
  async () => {
    return db.select().from(courses);
  },
  ["courses-list"],
  { tags: ["courses"] }
);

// Mock academic cohorts for standalone fallback
const mockCourses: CourseItem[] = [
  { id: "c-1", name: "JEE Advanced Physics" },
  { id: "c-2", name: "JEE Advanced Mathematics" },
  { id: "c-3", name: "NEET Organic Chemistry" },
  { id: "c-4", name: "High School Computer Science" },
];

const mockTeachers: TeacherItem[] = [
  { id: "t-1", name: "Prof. Manoj Das", subject: "JEE Advanced Physics", batchesCount: 1 },
  { id: "t-2", name: "Dr. Rashmi Rekha", subject: "JEE Advanced Mathematics", batchesCount: 1 },
  { id: "t-3", name: "Prof. Debasish Mohanty", subject: "NEET Organic Chemistry", batchesCount: 1 },
  { id: "t-4", name: "Dr. Subrat Tripathy", subject: "High School Computer Science", batchesCount: 1 },
];

const mockBatches: BatchItem[] = [
  {
    id: "b-1",
    name: "Class 12 — Physics A",
    courseName: "JEE Advanced Physics",
    teacherName: "Prof. Manoj Das",
    daysOfWeek: ["MON", "WED", "FRI"],
    startTime: "14:00",
    endTime: "15:30",
    roomNumber: "Bhubaneswar 101",
  },
  {
    id: "b-2",
    name: "Class 11 — CS B",
    courseName: "High School Computer Science",
    teacherName: "Dr. Subrat Tripathy",
    daysOfWeek: ["TUE", "THU"],
    startTime: "10:30",
    endTime: "12:00",
    roomNumber: "Cuttack 102",
  },
];

export const revalidate = 0; // Keep batches dynamic but cached items can refresh via tags

export const metadata = {
  title: "Academic Operations",
};

export default async function AcademicPage() {
  let dbBatches: any[] = [];
  let dbCourses: any[] = [];
  let dbTeachers: any[] = [];
  let useFallback = false;

  try {
    // 1. Fetch courses (utilizing tag-cached fetch)
    dbCourses = await getCachedCourses();

    // 2. Fetch teachers
    dbTeachers = await db
      .select()
      .from(users)
      .where(eq(users.role, "TEACHER"));

    // 3. Fetch batches joined with course and teacher
    dbBatches = await db
      .select({
        id: batches.id,
        name: batches.name,
        daysOfWeek: batches.daysOfWeek,
        startTime: batches.startTime,
        endTime: batches.endTime,
        roomNumber: batches.roomNumber,
        courseName: courses.name,
        teacherName: users.name,
      })
      .from(batches)
      .innerJoin(courses, eq(batches.courseId, courses.id))
      .leftJoin(users, eq(batches.teacherId, users.id));
  } catch (error) {
    console.warn("Postgres connection unavailable. Rendering mock academic overview.");
    useFallback = true;
  }

  // Parse daysOfWeek JSON array for UI rendering
  const formattedBatches: BatchItem[] = useFallback 
    ? mockBatches 
    : dbBatches.map((b) => {
        let days: string[] = [];
        try {
          days = JSON.parse(b.daysOfWeek);
        } catch (e) {
          days = [b.daysOfWeek];
        }
        return {
          id: b.id,
          name: b.name,
          courseName: b.courseName,
          teacherName: b.teacherName || "Unassigned",
          daysOfWeek: days,
          startTime: b.startTime,
          endTime: b.endTime,
          roomNumber: b.roomNumber,
        };
      });

  const finalCoursesList: CourseItem[] = useFallback 
    ? mockCourses 
    : dbCourses.map(c => ({ id: c.id, name: c.name }));

  const finalTeachersList: TeacherItem[] = useFallback
    ? mockTeachers
    : dbTeachers.map(t => {
        // Find how many batches this teacher is assigned to
        const assignedBatches = dbBatches.filter(b => b.teacherName === t.name);
        return {
          id: t.id,
          name: t.name,
          subject: t.role === "TEACHER" ? "Faculty" : "Staff", // Placeholder
          batchesCount: assignedBatches.length,
        };
      });

  return (
    <AcademicClient 
      initialBatches={formattedBatches} 
      courses={finalCoursesList}
      teachers={finalTeachersList}
    />
  );
}

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { faker } from "@faker-js/faker/locale/en_IN";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/praxium";

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

async function seed() {
  console.log("🚀 Starting database seeding...");

  try {
    // --- 1. TEARDOWN (Topological Order) ---
    console.log("🧹 Tearing down existing tables to avoid FK violations...");
    
    await db.delete(schema.attemptAnswers);
    console.log("✅ Cleared Attempt Answers");

    await db.delete(schema.examAttempts);
    console.log("✅ Cleared Exam Attempts");

    await db.delete(schema.questions);
    console.log("✅ Cleared Questions");

    await db.delete(schema.mockExams);
    console.log("✅ Cleared Mock Exams");

    await db.delete(schema.examScores);
    console.log("✅ Cleared Exam Scores");

    await db.delete(schema.instituteExams);
    console.log("✅ Cleared Institute Exams");

    await db.delete(schema.submissions);
    console.log("✅ Cleared Submissions");

    await db.delete(schema.assignments);
    console.log("✅ Cleared Assignments");

    await db.delete(schema.subjectAttendance);
    console.log("✅ Cleared Subject Attendance");

    await db.delete(schema.communicationLogs);
    console.log("✅ Cleared Communication Logs");

    await db.delete(schema.payments);
    console.log("✅ Cleared Payments");

    await db.delete(schema.attendance);
    console.log("✅ Cleared Attendance");

    await db.delete(schema.students);
    console.log("✅ Cleared Students");

    await db.delete(schema.batches);
    console.log("✅ Cleared Batches");

    await db.delete(schema.courses);
    console.log("✅ Cleared Courses");

    await db.delete(schema.payslips);
    console.log("✅ Cleared Payslips");

    await db.delete(schema.inquiries);
    console.log("✅ Cleared Inquiries");

    await db.delete(schema.userRegistrations);
    console.log("✅ Cleared User Registrations");

    await db.delete(schema.users);
    console.log("✅ Cleared Users");

    await db.delete(schema.institutes);
    console.log("✅ Cleared Institutes");

    // --- 2. INSTITUTES GENERATION ---
    console.log("🏢 Generating Institute...");
    const [inst] = await db.insert(schema.institutes).values({
      clerkOrgId: "mock_org_123",
      name: "Sharma Physics Academy",
      primaryColor: "#4f46e5",
    }).returning();
    const instId = inst.id;
    console.log(`✅ Created Institute: ${inst.name} (${instId})`);

    // --- 3. USERS GENERATION ---
    console.log("👥 Generating Users...");
    
    const usersList: typeof schema.users.$inferInsert[] = [];

    // Create 1 Admin
    const adminEmail = "admin@praxium.edu";
    usersList.push({
      id: "usr_admin_01",
      clerkUserId: "mock_admin_123",
      role: "ADMIN",
      name: "Sushvine Admin",
      email: adminEmail,
      phone: "+91 99999 88888",
      instituteId: instId,
    });

    // Create 3 Teachers
    const teacherIds = ["usr_teacher_01", "usr_teacher_02", "usr_teacher_03"];
    for (let i = 0; i < 3; i++) {
      usersList.push({
        id: teacherIds[i],
        clerkUserId: `mock_teacher_${i + 1}`,
        role: "TEACHER",
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        phone: "+91 " + faker.string.numeric(10),
        instituteId: instId,
      });
    }

    // Create 15 Students
    const studentUserIds: string[] = [];
    for (let i = 0; i < 15; i++) {
      const sId = `usr_student_${i + 1}`;
      studentUserIds.push(sId);
      usersList.push({
        id: sId,
        clerkUserId: `mock_student_${i + 1}`,
        role: "STUDENT",
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        phone: "+91 " + faker.string.numeric(10),
        instituteId: instId,
      });
    }

    // Bulk insert users
    await db.insert(schema.users).values(usersList);
    console.log(`✅ Created 19 Users (1 ADMIN, 3 TEACHERs, 15 STUDENTs)`);
    console.log(`👉 Test Admin Account: ${adminEmail}`);

    // --- 4. COURSES GENERATION ---
    console.log("📚 Generating Courses...");
    const coursesList = [
      { id: faker.string.uuid(), name: "JEE Advanced Physics", description: "Rigorous preparation for IIT-JEE Advanced Physics mechanics, electrodynamics, and modern physics.", instituteId: instId },
      { id: faker.string.uuid(), name: "NEET Biology Foundation", description: "Comprehensive syllabus covering human physiology, plant biology, and genetics for medical aspirants.", instituteId: instId },
      { id: faker.string.uuid(), name: "Organic Chemistry Specialist", description: "Mastering reaction pathways, mechanisms, and stereochemistry.", instituteId: instId },
      { id: faker.string.uuid(), name: "High School Computer Science", description: "Introduction to data structures, algorithms, and web applications in TypeScript.", instituteId: instId },
    ];
    await db.insert(schema.courses).values(coursesList);
    console.log("✅ Created 4 Academic Courses");

    const crsPhysicsId = coursesList[0].id;
    const crsBiologyId = coursesList[1].id;
    const crsChemistryId = coursesList[2].id;
    const crsCsId = coursesList[3].id;

    // --- 5. BATCHES GENERATION ---
    console.log("⚡ Generating Batches...");
    const batchList = [
      {
        id: faker.string.uuid(),
        courseId: crsPhysicsId,
        teacherId: "usr_teacher_01",
        name: "Class 12 — Physics A",
        daysOfWeek: JSON.stringify(["MON", "WED", "FRI"]),
        startTime: "16:00",
        endTime: "18:00",
        roomNumber: "Room 101",
        maxCapacity: 30,
        instituteId: instId,
      },
      {
        id: faker.string.uuid(),
        courseId: crsPhysicsId,
        teacherId: "usr_teacher_01",
        name: "Class 11 — Physics B",
        daysOfWeek: JSON.stringify(["TUE", "THU"]),
        startTime: "16:00",
        endTime: "18:00",
        roomNumber: "Room 101",
        maxCapacity: 30,
        instituteId: instId,
      },
      {
        id: faker.string.uuid(),
        courseId: crsBiologyId,
        teacherId: "usr_teacher_02",
        name: "Class 12 — Biology A",
        daysOfWeek: JSON.stringify(["MON", "WED"]),
        startTime: "14:00",
        endTime: "15:30",
        roomNumber: "Room 102",
        maxCapacity: 30,
        instituteId: instId,
      },
      {
        id: faker.string.uuid(),
        courseId: crsChemistryId,
        teacherId: "usr_teacher_03",
        name: "Class 12 — Chemistry A",
        daysOfWeek: JSON.stringify(["TUE", "THU"]),
        startTime: "14:00",
        endTime: "15:30",
        roomNumber: "Room 103",
        maxCapacity: 30,
        instituteId: instId,
      },
      {
        id: faker.string.uuid(),
        courseId: crsCsId,
        teacherId: "usr_teacher_01",
        name: "Class 11 — CS A",
        daysOfWeek: JSON.stringify(["FRI"]),
        startTime: "10:30",
        endTime: "12:00",
        roomNumber: "Room 104",
        maxCapacity: 30,
        instituteId: instId,
      },
    ];
    await db.insert(schema.batches).values(batchList);
    console.log("✅ Created 5 Batches with Teachers & Schedules");

    const batchIds = batchList.map(b => b.id);

    // --- 6. STUDENTS PROFILE & ENROLLMENT GENERATION ---
    console.log("🎓 Enrolling Students...");
    const studentProfiles: typeof schema.students.$inferInsert[] = [];
    const studentProfileIds = Array.from({ length: 15 }, () => faker.string.uuid());

    for (let i = 0; i < 15; i++) {
      const assignedBatchId = batchIds[i % batchIds.length];
      studentProfiles.push({
        id: studentProfileIds[i],
        userId: studentUserIds[i],
        batchId: assignedBatchId,
        parentEmail: faker.internet.email().toLowerCase(),
        parentPhone: "+91 " + faker.string.numeric(10),
        status: "active",
        instituteId: instId,
      });
    }
    await db.insert(schema.students).values(studentProfiles);
    console.log("✅ Created 15 Student Profiles & enrolled them into Batches");

    // --- 7. PAYMENTS GENERATION ---
    console.log("💳 Generating Payments (70% Paid, 20% Pending, 10% Overdue)...");
    const paymentsList: typeof schema.payments.$inferInsert[] = [];

    for (let i = 0; i < 15; i++) {
      const studentId = studentProfileIds[i];
      
      // Generate 1st payment record
      const rand1 = Math.random();
      let status1: "paid" | "pending" | "overdue" = "paid";
      let pDate1: Date | null = faker.date.recent({ days: 10 });
      let receipt1: string | null = "REC-" + Math.random().toString(36).substring(2, 8).toUpperCase();

      if (rand1 < 0.1) {
        status1 = "overdue";
        pDate1 = null;
        receipt1 = null;
      } else if (rand1 < 0.3) {
        status1 = "pending";
        pDate1 = null;
        receipt1 = null;
      }

      paymentsList.push({
        id: faker.string.uuid(),
        studentId,
        amount: "4800.00",
        status: status1,
        dueDate: "2026-06-15",
        paymentDate: pDate1,
        receiptNumber: receipt1,
        instituteId: instId,
      });

      // Generate 2nd payment record for some students
      if (i % 2 === 0) {
        const rand2 = Math.random();
        let status2: "paid" | "pending" | "overdue" = "paid";
        let pDate2: Date | null = faker.date.recent({ days: 20 });
        let receipt2: string | null = "REC-" + Math.random().toString(36).substring(2, 8).toUpperCase();

        if (rand2 < 0.2) {
          status2 = "pending";
          pDate2 = null;
          receipt2 = null;
        }

        paymentsList.push({
          id: faker.string.uuid(),
          studentId,
          amount: "5200.00",
          status: status2,
          dueDate: "2026-07-05",
          paymentDate: pDate2,
          receiptNumber: receipt2,
          instituteId: instId,
        });
      }
    }

    await db.insert(schema.payments).values(paymentsList);
    console.log(`✅ Seeded ${paymentsList.length} Payment invoices`);

    // --- 8. ATTENDANCE HISTORICAL DATA ---
    console.log("📅 Generating 5 Days of Attendance History for alerts...");
    const attendanceRecords: typeof schema.attendance.$inferInsert[] = [];
    const dates = ["2026-06-19", "2026-06-20", "2026-06-21", "2026-06-22", "2026-06-23"];

    // We want 2-3 specific students to have critically low attendance (< 75%) to test low attendance alerts
    for (let i = 0; i < 15; i++) {
      const studentId = studentProfileIds[i];
      const batchId = batchIds[i % batchIds.length];

      for (const d of dates) {
        let status: "present" | "absent" | "late" = "present";
        const rand = Math.random();

        if (i === 0 || i === 4) { // Force low attendance (std_profile_1 and std_profile_5)
          status = rand < 0.8 ? "absent" : "present"; // 80% Absent
        } else {
          if (rand < 0.1) {
            status = "absent";
          } else if (rand < 0.15) {
            status = "late";
          }
        }

        attendanceRecords.push({
          id: faker.string.uuid(),
          studentId,
          batchId,
          date: d,
          status,
          recordedBy: "usr_teacher_01",
          instituteId: instId,
        });
      }
    }

    await db.insert(schema.attendance).values(attendanceRecords);
    console.log(`✅ Seeded ${attendanceRecords.length} Attendance rows`);

    console.log("🎉 Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database seeding failed with error:", error);
    process.exit(1);
  }
}

seed();

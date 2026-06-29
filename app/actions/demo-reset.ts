"use server";

import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import * as schema from "@/db/schema";

/**
 * Next.js Server Action to reset the demo database to a clean, structured state.
 * Scopes all records under a default multi-tenant institute.
 */
export async function resetDemoEnvironment(): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Authorize the user (check that email matches the founder's account)
    const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const hasClerk = !!(clerkKey && clerkKey.startsWith("pk_"));
    
    let isAuthorized = false;

    if (hasClerk) {
      const user = await currentUser();
      const email = user?.emailAddresses[0]?.emailAddress;
      
      // Allow only the admin email to trigger the database reset
      if (email === "admin@praxium.edu" || email === "sushvine@praxium.edu") {
        isAuthorized = true;
      }
    } else {
      // Bypassed in mock sandbox development mode
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return {
        success: false,
        message: "Unauthorized: Only the system administrator can trigger a database reset.",
      };
    }

    console.log("🧹 Wiping database tables for reset...");

    // 2. Perform Cascading Teardown in correct order of foreign keys
    await db.delete(schema.inquiries);
    await db.delete(schema.attemptAnswers);
    await db.delete(schema.examAttempts);
    await db.delete(schema.questions);
    await db.delete(schema.mockExams);

    await db.delete(schema.examScores);
    await db.delete(schema.instituteExams);
    await db.delete(schema.submissions);
    await db.delete(schema.assignments);
    await db.delete(schema.subjectAttendance);
    await db.delete(schema.communicationLogs);
    await db.delete(schema.payments);
    await db.delete(schema.payslips);
    await db.delete(schema.attendance);
    await db.delete(schema.students);
    await db.delete(schema.batches);
    await db.delete(schema.courses);
    await db.delete(schema.users);
    await db.delete(schema.institutes);

    console.log("🏢 Seeding default demo institute tenant...");
    const defaultInstituteId = "inst_demo_01";
    await db.insert(schema.institutes).values({
      id: defaultInstituteId,
      clerkOrgId: "mock_org_123",
      name: "Sharma Physics Academy",
      logoUrl: null,
      primaryColor: "#4f46e5",
    });

    console.log("👥 Inserting standard demo users...");

    // 3. Seed Users
    // Admin User
    await db.insert(schema.users).values({
      id: "usr_admin_01",
      clerkUserId: "mock_admin_123",
      role: "ADMIN",
      name: "Sushvine Admin",
      email: "admin@praxium.edu",
      phone: "+91 99999 88888",
      instituteId: defaultInstituteId,
    });

    // 3 Teachers
    const teacherIds = ["usr_teacher_01", "usr_teacher_02", "usr_teacher_03"];
    await db.insert(schema.users).values([
      {
        id: teacherIds[0],
        clerkUserId: "mock_teacher_1",
        role: "TEACHER",
        name: "Dr. Richard Feynman",
        email: "feynman@praxium.edu",
        phone: "+91 98765 43210",
        instituteId: defaultInstituteId,
      },
      {
        id: teacherIds[1],
        clerkUserId: "mock_teacher_2",
        role: "TEACHER",
        name: "Prof. Manoj Das",
        email: "manoj.das@praxium.edu",
        phone: "+91 98654 32109",
        instituteId: defaultInstituteId,
      },
      {
        id: teacherIds[2],
        clerkUserId: "mock_teacher_3",
        role: "TEACHER",
        name: "Dr. Rashmi Rekha",
        email: "rashmi.rekha@praxium.edu",
        phone: "+91 98543 21098",
        instituteId: defaultInstituteId,
      }
    ]);

    // 15 Students
    const studentUserNames = [
      "Subhashree Dash", "Arpan Mohanty", "Ananya Mishra", "Chinmay Mohapatra",
      "Priyanka Jena", "Soumya Ranjan", "Debasish Patnaik", "Lipsa Priyadarshini",
      "Rudra Prasad", "Swagatika Rout", "Manoj Behera", "Sanghamitra Sahu",
      "Ashutosh Nayak", "Pritam Patra", "Lopamudra Panda"
    ];

    const studentUserIds: string[] = [];
    const studentUsersValues = studentUserNames.map((name, i) => {
      const id = `usr_student_${i + 1}`;
      studentUserIds.push(id);
      return {
        id,
        clerkUserId: i === 0 ? "mock_user_123" : `mock_student_${i + 1}`, // Bind first student to default login
        role: "STUDENT" as const,
        name,
        email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        phone: `+91 90000 000${(i + 10).toString().substring(0,2)}`,
        instituteId: defaultInstituteId,
      };
    });
    await db.insert(schema.users).values(studentUsersValues);

    console.log("📚 Seeding demo courses & batches...");

    // 4. Seed Courses
    const courseIds = [
      "course_phy_101",
      "course_bio_102",
      "course_chm_103",
      "course_cs_104"
    ];
    await db.insert(schema.courses).values([
      { id: courseIds[0], name: "JEE Advanced Physics", description: "IIT-JEE Advanced Physics Mechanics & Electrodynamics.", instituteId: defaultInstituteId },
      { id: courseIds[1], name: "NEET Biology Foundation", description: "Human Physiology & Genetics for medical aspirants.", instituteId: defaultInstituteId },
      { id: courseIds[2], name: "Organic Chemistry Specialist", description: "Mastering reaction pathways and stereochemistry.", instituteId: defaultInstituteId },
      { id: courseIds[3], name: "High School Computer Science", description: "Introduction to data structures in TypeScript.", instituteId: defaultInstituteId }
    ]);

    // 5. Seed Batches
    const batchIds = [
      "batch_phy_a",
      "batch_phy_b",
      "batch_bio_a",
      "batch_chm_a",
      "batch_cs_a"
    ];
    await db.insert(schema.batches).values([
      {
        id: batchIds[0],
        courseId: courseIds[0],
        teacherId: teacherIds[1], // Manoj Das
        name: "Class 12 — Physics A",
        daysOfWeek: JSON.stringify(["MON", "WED", "FRI"]),
        startTime: "16:00",
        endTime: "18:00",
        roomNumber: "Room 101",
        maxCapacity: 30,
        instituteId: defaultInstituteId,
      },
      {
        id: batchIds[1],
        courseId: courseIds[0],
        teacherId: teacherIds[1], // Manoj Das
        name: "Class 11 — Physics B",
        daysOfWeek: JSON.stringify(["TUE", "THU"]),
        startTime: "16:00",
        endTime: "18:00",
        roomNumber: "Room 101",
        maxCapacity: 30,
        instituteId: defaultInstituteId,
      },
      {
        id: batchIds[2],
        courseId: courseIds[1],
        teacherId: teacherIds[2], // Rashmi Rekha
        name: "Class 12 — Biology A",
        daysOfWeek: JSON.stringify(["MON", "WED"]),
        startTime: "14:00",
        endTime: "15:30",
        roomNumber: "Room 102",
        maxCapacity: 30,
        instituteId: defaultInstituteId,
      },
      {
        id: batchIds[3],
        courseId: courseIds[2],
        teacherId: teacherIds[0], // Feynman
        name: "Class 12 — Chemistry A",
        daysOfWeek: JSON.stringify(["TUE", "THU"]),
        startTime: "14:00",
        endTime: "15:30",
        roomNumber: "Room 103",
        maxCapacity: 30,
        instituteId: defaultInstituteId,
      },
      {
        id: batchIds[4],
        courseId: courseIds[3],
        teacherId: teacherIds[1], // Manoj Das
        name: "Class 11 — CS A",
        daysOfWeek: JSON.stringify(["FRI"]),
        startTime: "10:30",
        endTime: "12:00",
        roomNumber: "Room 104",
        maxCapacity: 30,
        instituteId: defaultInstituteId,
      }
    ]);

    console.log("🎓 Seeding demo student profiles...");

    // 6. Seed Student Profiles
    const studentProfileIds = Array.from({ length: 15 }, (_, i) => `std_profile_${i + 1}`);
    const studentProfilesValues = Array.from({ length: 15 }, (_, i) => {
      const assignedBatchId = batchIds[i % batchIds.length];
      const isSubhashree = i === 0;

      return {
        id: studentProfileIds[i],
        userId: studentUserIds[i],
        batchId: assignedBatchId,
        parentEmail: `parent.${studentUserNames[i].toLowerCase().split(' ')[0]}@praxium.edu`,
        parentPhone: `+91 98888 888${(i + 10).toString().substring(0,2)}`,
        status: "active" as const,
        collegeName: isSubhashree ? "Delhi Public School" : "National Science Academy",
        guardianName: isSubhashree ? "Alok Dash" : "Mr. Guardian",
        guardianPhone: isSubhashree ? "9876543210" : "9000000000",
        guardianAddress: isSubhashree ? "Plot 42, Vasant Kunj, New Delhi" : "Address Info",
        totalCourseFee: isSubhashree ? "18000.00" : "15000.00",
        tenthBoardMarks: isSubhashree 
          ? { physics: 95, chemistry: 92, biology: 94, it: 98 }
          : { physics: 88, chemistry: 85, biology: 80, it: 90 },
        instituteId: defaultInstituteId,
      };
    });
    await db.insert(schema.students).values(studentProfilesValues);

    console.log("💳 Seeding demo payments register...");

    // 7. Seed Payments across last 6 months to populate the revenue trend
    const paymentsList: any[] = [];
    const months = [
      { name: "Jan", dateStr: "2026-01", dueDay: "15", payDay: "14" },
      { name: "Feb", dateStr: "2026-02", dueDay: "15", payDay: "14" },
      { name: "Mar", dateStr: "2026-03", dueDay: "15", payDay: "14" },
      { name: "Apr", dateStr: "2026-04", dueDay: "15", payDay: "14" },
      { name: "May", dateStr: "2026-05", dueDay: "15", payDay: "14" },
      { name: "June", dateStr: "2026-06", dueDay: "15", payDay: "14" },
    ];

    // Seed payments for students across these months
    for (let i = 0; i < 15; i++) {
      const studentId = studentProfileIds[i];
      
      // Let's create multiple payments for each student across different months
      months.forEach((m, mIdx) => {
        // Not all students have payments in all months (adds variability)
        if ((i + mIdx) % 3 !== 0) {
          const isPaid = (i + mIdx) % 4 !== 0; // some pending
          const amount = (3000 + (i * 100) + (mIdx * 200)).toFixed(2);
          
          paymentsList.push({
            id: `pay_invoice_${i}_m_${mIdx}`,
            studentId,
            amount,
            status: (isPaid ? "paid" : (mIdx < 4 ? "overdue" : "pending")) as any,
            dueDate: `${m.dateStr}-${m.dueDay}`,
            paymentDate: isPaid ? new Date(`${m.dateStr}-${m.payDay}T10:00:00Z`) : null,
            submittedDate: isPaid ? new Date(`${m.dateStr}-${m.payDay}T10:00:00Z`) : null,
            paymentMode: (mIdx % 2 === 0 ? "UPI" : "CASH") as any,
            receiptNumber: isPaid ? `REC-M${mIdx}S${i}K` : null,
            instituteId: defaultInstituteId,
          });
        }
      });
    }
    await db.insert(schema.payments).values(paymentsList);

    console.log("💰 Seeding demo payslips...");
    const payslipsList: any[] = [];
    const teacherSalaries = [
      { id: "usr_teacher_01", base: 45000 },
      { id: "usr_teacher_02", base: 50000 },
      { id: "usr_teacher_03", base: 40000 },
    ];

    months.forEach((m, mIdx) => {
      teacherSalaries.forEach((t, tIdx) => {
        // payslips netPay
        const netPay = (t.base + (tIdx * 1000) + (mIdx * 500)).toFixed(2);
        payslipsList.push({
          id: `payslip_${t.id}_m_${mIdx}`,
          teacherId: t.id,
          netPay,
          month: m.dateStr, // YYYY-MM
          createdAt: new Date(`${m.dateStr}-28T09:00:00Z`),
          instituteId: defaultInstituteId,
        });
      });
    });
    await db.insert(schema.payslips).values(payslipsList);

    console.log("📅 Seeding historical attendance records...");

    // 8. Seed Attendance Logs (5 days)
    const dates = ["2026-06-19", "2026-06-20", "2026-06-21", "2026-06-22", "2026-06-23"];
    const attendanceRecords: any[] = [];

    for (let i = 0; i < 15; i++) {
      const studentId = studentProfileIds[i];
      const batchId = batchIds[i % batchIds.length];

      for (const d of dates) {
        let status: "present" | "absent" | "late" = "present";
        
        // Force low attendance for Student 1 and 5
        if (i === 0 || i === 4) {
          status = Math.random() < 0.8 ? "absent" : "present";
        } else {
          const rand = Math.random();
          if (rand < 0.1) {
            status = "absent";
          } else if (rand < 0.15) {
            status = "late";
          }
        }

        attendanceRecords.push({
          id: `att_row_${studentId.substring(12)}_${d.replace(/-/g,'')}`,
          studentId,
          batchId,
          date: d,
          status,
          recordedBy: "usr_teacher_02",
          instituteId: defaultInstituteId,
        });
      }
    }
    await db.insert(schema.attendance).values(attendanceRecords);

    console.log("📝 Seeding demo assignments & submissions...");

    // 9. Seed Assignments
    const assignmentIds = ["asg_demo_01", "asg_demo_02", "asg_demo_03"];
    await db.insert(schema.assignments).values([
      {
        id: assignmentIds[0],
        batchId: batchIds[0], // Class 12 Physics A
        teacherId: teacherIds[1], // Manoj Das
        title: "Electrostatics Gauss Law Worksheet",
        description: "Submit proofs for Gauss's law applications and sphere distributions.",
        dueDate: new Date("2026-07-02T18:00:00Z"),
        maxMarks: 100,
        instituteId: defaultInstituteId,
      },
      {
        id: assignmentIds[1],
        batchId: batchIds[0],
        teacherId: teacherIds[1],
        title: "Capacitance Combo Sheet",
        description: "Solve Chapter 31 exercises on capacitor dielectric combinations.",
        dueDate: new Date("2026-07-08T18:00:00Z"),
        maxMarks: 50,
        instituteId: defaultInstituteId,
      },
      {
        id: assignmentIds[2],
        batchId: batchIds[0],
        teacherId: teacherIds[1],
        title: "Geometrical Optics Proofs",
        description: "Lens maker formula and prism minimum deviation proofs.",
        dueDate: new Date("2026-07-15T18:00:00Z"),
        maxMarks: 100,
        instituteId: defaultInstituteId,
      }
    ]);

    // 10. Seed Submissions
    await db.insert(schema.submissions).values([
      {
        id: "sub_demo_01",
        assignmentId: assignmentIds[0],
        studentId: studentProfileIds[0], // Subhashree Dash
        fileUrl: "https://google.com/gauss-law-submission",
        submittedAt: new Date("2026-06-24T12:00:00Z"),
        grade: "A+",
        marksObtained: 95,
        instituteId: defaultInstituteId,
      },
      {
        id: "sub_demo_02",
        assignmentId: assignmentIds[1],
        studentId: studentProfileIds[0],
        fileUrl: "https://google.com/capacitance-submission",
        submittedAt: new Date("2026-06-25T08:00:00Z"),
        grade: null,
        marksObtained: null,
        instituteId: defaultInstituteId,
      }
    ]);

    console.log("📊 Seeding subject-level attendance registers...");

    // 11. Seed Subject Attendance
    const subAttData = [];
    const subAttendanceRatios = [
      { courseId: courseIds[0], present: 9, absent: 1 },
      { courseId: courseIds[1], present: 8, absent: 2 },
      { courseId: courseIds[2], present: 10, absent: 0 },
      { courseId: courseIds[3], present: 7, absent: 3 },
    ];

    let attIdx = 0;
    for (const ratio of subAttendanceRatios) {
      for (let p = 0; p < ratio.present; p++) {
        subAttData.push({
          id: `sub_att_seed_${attIdx++}`,
          studentId: studentProfileIds[0],
          courseId: ratio.courseId,
          date: new Date(Date.now() - p * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          status: "present" as const,
          instituteId: defaultInstituteId,
        });
      }
      for (let a = 0; a < ratio.absent; a++) {
        subAttData.push({
          id: `sub_att_seed_${attIdx++}`,
          studentId: studentProfileIds[0],
          courseId: ratio.courseId,
          date: new Date(Date.now() - (a + 5) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          status: "absent" as const,
          instituteId: defaultInstituteId,
        });
      }
    }
    await db.insert(schema.subjectAttendance).values(subAttData);

    console.log("📈 Seeding institute exams and test scores...");

    // 12. Seed Exams
    const examIds = ["ex_demo_01", "ex_demo_02", "ex_demo_03"];
    await db.insert(schema.instituteExams).values([
      {
        id: examIds[0],
        batchId: batchIds[0],
        subject: "Mechanics Test",
        maxMarks: 50,
        date: "2026-06-10",
        instituteId: defaultInstituteId,
      },
      {
        id: examIds[1],
        batchId: batchIds[0],
        subject: "Magnetism Test",
        maxMarks: 50,
        date: "2026-06-18",
        instituteId: defaultInstituteId,
      },
      {
        id: examIds[2],
        batchId: batchIds[0],
        subject: "Optics Test",
        maxMarks: 50,
        date: "2026-06-24",
        instituteId: defaultInstituteId,
      }
    ]);

    // Seed Scores for Subhashree Dash
    await db.insert(schema.examScores).values([
      {
        id: "esc_demo_01",
        examId: examIds[0],
        studentId: studentProfileIds[0],
        marksObtained: "44.00",
        instituteId: defaultInstituteId,
      },
      {
        id: "esc_demo_02",
        examId: examIds[1],
        studentId: studentProfileIds[0],
        marksObtained: "42.00",
        instituteId: defaultInstituteId,
      },
      {
        id: "esc_demo_03",
        examId: examIds[2],
        studentId: studentProfileIds[0],
        marksObtained: "48.00",
        instituteId: defaultInstituteId,
      }
    ]);

    console.log("📝 Seeding timed mock exams (CBT) and questions...");
    const mockExamId = "exam_demo_1";
    await db.insert(schema.mockExams).values({
      id: mockExamId,
      batchId: batchIds[0], // Class 12 Physics A
      title: "AITS Chapter Mock Test — Electrostatics & Current Electricity",
      durationMinutes: 180,
      startTime: new Date(Date.now() - 2 * 3600 * 1000), // Started 2 hours ago
      endTime: new Date(Date.now() + 22 * 3600 * 1000), // Ends in 22 hours
      instituteId: defaultInstituteId,
    });

    const mockExamId2 = "exam_demo_2";
    await db.insert(schema.mockExams).values({
      id: mockExamId2,
      batchId: batchIds[1], // Class 11 Physics B
      title: "JEE Advanced Physics Practice — Magnetism",
      durationMinutes: 120,
      startTime: new Date(Date.now() - 10 * 3600 * 1000),
      endTime: new Date(Date.now() + 14 * 3600 * 1000),
      instituteId: defaultInstituteId,
    });

    const mockExamId3 = "exam_demo_3";
    await db.insert(schema.mockExams).values({
      id: mockExamId3,
      batchId: batchIds[2], // Class 12 Biology A
      title: "NEET Biology Foundation — Cell Division",
      durationMinutes: 90,
      startTime: new Date(Date.now() - 24 * 3600 * 1000),
      endTime: new Date(Date.now() + 24 * 3600 * 1000),
      instituteId: defaultInstituteId,
    });

    const mockExamId4 = "exam_demo_4";
    await db.insert(schema.mockExams).values({
      id: mockExamId4,
      batchId: batchIds[3], // Class 12 Chemistry A
      title: "Organic Chemistry Specialist — Hydrocarbons",
      durationMinutes: 120,
      startTime: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      endTime: new Date(Date.now() - 4 * 24 * 3600 * 1000),
      instituteId: defaultInstituteId,
    });

    // Seed questions
    await db.insert(schema.questions).values([
      {
        id: "q_demo_1",
        examId: mockExamId,
        questionText: "A copper wire of length L and cross-sectional area A has resistance R. If it is stretched to twice its initial length, what will be its new resistance (assuming density remains constant)?",
        options: ["R", "2R", "4R", "8R"],
        correctOptionIndex: 2,
        positiveMarks: 4,
        negativeMarks: 1,
        instituteId: defaultInstituteId,
      },
      {
        id: "q_demo_2",
        examId: mockExamId,
        questionText: "Two charges +q and -q are situated at a distance r. The force between them is F. If the distance is halved and charges are doubled, what is the new force?",
        options: ["F", "4F", "8F", "16F"],
        correctOptionIndex: 3,
        positiveMarks: 4,
        negativeMarks: 1,
        instituteId: defaultInstituteId,
      },
      {
        id: "q_demo_3",
        examId: mockExamId,
        questionText: "A particle of mass m and charge q enters a uniform magnetic field B perpendicularly with velocity v. What is the time period of its circular motion?",
        options: ["2πm / (qB)", "2πq / (mB)", "2πB / (mq)", "πm / (qB)"],
        correctOptionIndex: 0,
        positiveMarks: 4,
        negativeMarks: 1,
        instituteId: defaultInstituteId,
      }
    ]);

    console.log("📝 Seeding mock exam attempts...");
    await db.insert(schema.examAttempts).values([
      // Batch 0 (Physics A) attempts
      {
        id: "attempt_demo_1",
        examId: mockExamId,
        studentId: studentProfileIds[0], // Subhashree (batch 0)
        startTime: new Date(Date.now() - 3600 * 1000),
        submitTime: new Date(),
        totalScore: 12,
        instituteId: defaultInstituteId,
      },
      {
        id: "attempt_demo_2",
        examId: mockExamId,
        studentId: studentProfileIds[5], // Soumya Ranjan (batch 0)
        startTime: new Date(Date.now() - 3600 * 1000),
        submitTime: new Date(),
        totalScore: 8,
        instituteId: defaultInstituteId,
      },
      {
        id: "attempt_demo_3",
        examId: mockExamId,
        studentId: studentProfileIds[10], // Manoj Behera (batch 0)
        startTime: new Date(Date.now() - 3600 * 1000),
        submitTime: new Date(),
        totalScore: 4,
        instituteId: defaultInstituteId,
      },
      // Batch 1 (Physics B) attempts
      {
        id: "attempt_demo_4",
        examId: mockExamId2,
        studentId: studentProfileIds[1], // Arpan (batch 1)
        startTime: new Date(Date.now() - 3600 * 1000),
        submitTime: new Date(),
        totalScore: 8,
        instituteId: defaultInstituteId,
      },
      {
        id: "attempt_demo_5",
        examId: mockExamId2,
        studentId: studentProfileIds[6], // Debasish (batch 1)
        startTime: new Date(Date.now() - 3600 * 1000),
        submitTime: new Date(),
        totalScore: 12,
        instituteId: defaultInstituteId,
      },
      // Batch 2 (Biology A) attempts
      {
        id: "attempt_demo_6",
        examId: mockExamId3,
        studentId: studentProfileIds[2], // Ananya (batch 2)
        startTime: new Date(Date.now() - 3600 * 1000),
        submitTime: new Date(),
        totalScore: 16,
        instituteId: defaultInstituteId,
      },
      {
        id: "attempt_demo_7",
        examId: mockExamId3,
        studentId: studentProfileIds[7], // Lipsa (batch 2)
        startTime: new Date(Date.now() - 3600 * 1000),
        submitTime: new Date(),
        totalScore: 14,
        instituteId: defaultInstituteId,
      },
      // Batch 3 (Chemistry A) attempts
      {
        id: "attempt_demo_8",
        examId: mockExamId4,
        studentId: studentProfileIds[3], // Chinmay (batch 3)
        startTime: new Date(Date.now() - 3600 * 1000),
        submitTime: new Date(),
        totalScore: 8,
        instituteId: defaultInstituteId,
      },
      {
        id: "attempt_demo_9",
        examId: mockExamId4,
        studentId: studentProfileIds[8], // Rudra (batch 3)
        startTime: new Date(Date.now() - 3600 * 1000),
        submitTime: new Date(),
        totalScore: 4,
        instituteId: defaultInstituteId,
      }
    ]);

    // --- Phase 18: Seed CRM Inquiries ---
    console.log("📋 Seeding CRM admissions leads...");
    const now = new Date();
    const yesterday = new Date(now.getTime() - 86400000);
    const tomorrow = new Date(now.getTime() + 86400000);
    const nextWeek = new Date(now.getTime() + 7 * 86400000);

    await db.insert(schema.inquiries).values([
      {
        id: "inq_001",
        instituteId: defaultInstituteId,
        studentName: "Arjun Sharma",
        guardianPhone: "9876543210",
        targetCourse: "JEE Advanced 2025",
        status: "NEW_WALKIN",
        followUpDate: tomorrow,
        notes: "Father came in personally. Very interested. Son scored 85% in Class 11.",
      },
      {
        id: "inq_002",
        instituteId: defaultInstituteId,
        studentName: "Priya Patel",
        guardianPhone: "9812345678",
        targetCourse: "NEET UG 2025",
        status: "NEW_WALKIN",
        followUpDate: null,
        notes: null,
      },
      {
        id: "inq_003",
        instituteId: defaultInstituteId,
        studentName: "Rohan Verma",
        guardianPhone: "9823456789",
        targetCourse: "JEE Main 2025",
        status: "CALLED",
        followUpDate: yesterday,
        notes: "Called on Monday. Interested but comparing with another institute. FOLLOW UP URGENTLY.",
      },
      {
        id: "inq_004",
        instituteId: defaultInstituteId,
        studentName: "Ananya Singh",
        guardianPhone: "9834567890",
        targetCourse: "NEET UG 2025",
        status: "CALLED",
        followUpDate: nextWeek,
        notes: "Wants scholarship. Check with admin for discount options.",
      },
      {
        id: "inq_005",
        instituteId: defaultInstituteId,
        studentName: "Dev Kapoor",
        guardianPhone: "9845678901",
        targetCourse: "JEE Advanced 2025",
        status: "TRIAL_SCHEDULED",
        followUpDate: tomorrow,
        notes: "Trial class scheduled for Thursday 10 AM. Physics batch.",
      },
      {
        id: "inq_006",
        instituteId: defaultInstituteId,
        studentName: "Sneha Mehta",
        guardianPhone: "9856789012",
        targetCourse: "NEET UG 2025",
        status: "TRIAL_SCHEDULED",
        followUpDate: null,
        notes: null,
      },
      {
        id: "inq_007",
        instituteId: defaultInstituteId,
        studentName: "Vikram Joshi",
        guardianPhone: "9867890123",
        targetCourse: "JEE Main 2025",
        status: "ENROLLED",
        followUpDate: null,
        notes: "Enrolled in Batch A — JEE Main 2025.",
      },
      {
        id: "inq_008",
        instituteId: defaultInstituteId,
        studentName: "Meera Nair",
        guardianPhone: "9878901234",
        targetCourse: "NEET UG 2025",
        status: "LOST",
        followUpDate: null,
        notes: "Joined a competitor institute. Pricing was the deciding factor.",
      },
    ]);

    console.log("🎉 Seeding completed successfully!");

    revalidatePath("/dashboard");
    revalidatePath("/students");
    revalidatePath("/finance");
    revalidatePath("/academic");
    revalidatePath("/student-portal");
    revalidatePath("/admin/analytics");
    revalidatePath("/admin/admissions");

    return {
      success: true,
      message: "Database environment reset successfully! Clean multi-tenant demo data seeded.",
    };
  } catch (error: any) {
    console.error("[DATABASE RESET SERVER ACTION ERROR]:", error);
    return {
      success: false,
      message: error.message || "Failed to reset demo environment.",
    };
  }
}

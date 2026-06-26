import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface AttendanceWarningEmailProps {
  studentName: string;
  attendancePercentage: number;
  batchName: string;
}

export const AttendanceWarningEmail = ({
  studentName = "Student",
  attendancePercentage = 68,
  batchName = "Physics Cohort A",
}: AttendanceWarningEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Urgent: Academic Attendance Warning for {studentName}</Preview>
      <Tailwind>
        <Body className="bg-[#fafafa] font-sans text-neutral-800 my-auto mx-auto">
          <Container className="border border-solid border-[#e5e5e5] rounded-xl my-[40px] mx-auto p-[32px] max-w-[465px] bg-white shadow-sm">
            <Section className="mt-[16px]">
              <Text className="text-lg font-bold tracking-tight text-neutral-900 leading-tight my-0">
                Praxium Academic Alert
              </Text>
              <Text className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold my-1">
                Attendance Notification
              </Text>
            </Section>
            <Section className="mt-[24px]">
              <Text className="text-xs leading-relaxed text-neutral-600">
                Dear Parent/Guardian,
              </Text>
              <Text className="text-xs leading-relaxed text-neutral-600">
                We are writing to notify you that your child, <strong>{studentName}</strong>, enrolled in batch <strong>{batchName}</strong>, currently has an overall attendance percentage of <strong className="text-red-600">{attendancePercentage}%</strong>.
              </Text>
              <Text className="text-xs leading-relaxed text-neutral-600">
                At Praxium, we maintain a strict minimum attendance policy of <strong>75%</strong> to ensure optimal academic progression and cohort performance. Falling below this critical threshold hinders students' understanding and overall outcomes.
              </Text>
              <Text className="text-xs leading-relaxed text-neutral-600">
                Please review this matter with your child. We recommend contacting the administration desk immediately to discuss any required support.
              </Text>
            </Section>
            <Section className="text-center mt-[32px] mb-[16px]">
              <Button
                className="bg-neutral-950 rounded-lg text-white text-[11px] font-semibold px-5 py-3 text-center no-underline cursor-pointer"
                href="mailto:admin@praxium.edu?subject=Attendance Support Request"
              >
                Contact Administration
              </Button>
            </Section>
            <Section className="border-t border-solid border-[#f0f0f0] mt-[32px] pt-[20px]">
              <Text className="text-[10px] text-neutral-400 leading-tight">
                This is an automated notification from Praxium ERP. Please do not reply directly to this email. For support, contact admin@praxium.edu.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default AttendanceWarningEmail;

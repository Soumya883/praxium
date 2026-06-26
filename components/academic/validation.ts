import { z } from "zod";

export const batchFormSchema = z.object({
  name: z.string().min(2, { message: "Batch name must be at least 2 characters." }),
  courseId: z.string().min(1, { message: "Please select a course." }),
  teacherId: z.string().min(1, { message: "Please select a teacher." }),
  daysOfWeek: z.array(z.string()).min(1, { message: "Select at least one day of the week." }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Valid 24h start time (HH:mm) is required." }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Valid 24h end time (HH:mm) is required." }),
  roomNumber: z.string().min(1, { message: "Room number is required." }),
}).refine((data) => {
  const [startH, startM] = data.startTime.split(":").map(Number);
  const [endH, endM] = data.endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  return endMinutes > startMinutes;
}, {
  message: "End time must be strictly after start time.",
  path: ["endTime"],
});

export type BatchFormData = z.infer<typeof batchFormSchema>;
export type DaysOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
export const DAYS_LIST: DaysOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

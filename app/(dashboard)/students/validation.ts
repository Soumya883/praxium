import { z } from "zod";

export const studentSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  batchId: z.string().min(1, { message: "Please select a batch." }),
});

export type StudentFormInput = z.infer<typeof studentSchema>;

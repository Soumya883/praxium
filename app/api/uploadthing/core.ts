import { createUploadthing, type FileRouter } from "uploadthing/next";
import { checkRole } from "@/app/actions/rbac-utils";

const f = createUploadthing();

export const ourFileRouter = {
  assignmentUploader: f({
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      const hasClerk = !!(clerkKey && clerkKey.startsWith("pk_"));
      
      let userId = "mock_user_123";
      let role = "STUDENT";

      if (hasClerk) {
        const { authorized, role: resolvedRole, userId: resolvedUserId } = await checkRole(["STUDENT", "ADMIN"]);
        if (!authorized || !resolvedUserId) {
          throw new Error("Unauthorized access: Student role is required for uploading.");
        }
        userId = resolvedUserId;
        role = resolvedRole;
      }

      return { studentId: userId, role };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(`[UPLOADTHING UPLOAD COMPLETED] Uploaded by: ${metadata.studentId}, File URL: ${file.url}`);
      return { uploadedBy: metadata.studentId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

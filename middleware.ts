import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";


const isDashboardRoute = createRouteMatcher([
  "/dashboard(.*)", 
  "/students(.*)", 
  "/batches(.*)", 
  "/finance(.*)", 
  "/settings(.*)",
  "/teacher(.*)",
  "/admin(.*)"
]);

const isStudentPortalRoute = createRouteMatcher(["/student-portal(.*)"]);

export default function middleware(req: any, event: any) {
  // Bypass authentication if Clerk keys are not set or are mock keys in the environment
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!clerkKey || !clerkKey.includes(".")) {
    return NextResponse.next();
  }

  return clerkMiddleware(async (auth, req) => {
    const session = await auth();
    const isDashboard = isDashboardRoute(req);
    const isStudentPortal = isStudentPortalRoute(req);

    if (isDashboard || isStudentPortal) {
      await auth.protect();
    }

    // Force active organization (tenant) membership for dashboard routes
    if (isDashboard && !session.orgId) {
      const orgSelect = new URL("/select-org", req.url);
      return NextResponse.redirect(orgSelect);
    }
  })(req, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.[\\w]+$|_next/image|favicon.ico).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { handleAuthCallbackAction } from "@/app/actions/auth-callback";
import { ShieldAlert, LogOut } from "lucide-react";

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_");

function ClerkAuthCallbackPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      router.replace("/login");
      return;
    }

    const email = user.emailAddresses?.[0]?.emailAddress;
    if (!email) {
      setError("No email address found in your Clerk account.");
      return;
    }

    // Read details stored in localStorage during the registration step
    const requestedRole = (localStorage.getItem("praxium_reg_role") || "STUDENT") as "STUDENT" | "TEACHER";
    const name = localStorage.getItem("praxium_reg_name") || user.fullName || user.username || email;
    const phone = localStorage.getItem("praxium_reg_phone") || undefined;

    // Clear localStorage to prevent any stale metadata reuse
    localStorage.removeItem("praxium_reg_role");
    localStorage.removeItem("praxium_reg_name");
    localStorage.removeItem("praxium_reg_phone");

    startTransition(async () => {
      try {
        const res = await handleAuthCallbackAction({
          clerkUserId: user.id,
          email,
          fullName: name,
          phone,
          requestedRole,
        });

        if (res.success && res.redirectUrl) {
          try {
            await user.reload();
          } catch (e) {
            console.error("Failed to reload Clerk user session:", e);
          }
          router.replace(res.redirectUrl);
        } else {
          setError(res.error || "Failed to complete authentication sync.");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to complete authentication callback.");
      }
    });
  }, [isLoaded, isSignedIn, user, router]);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#060608] flex flex-col items-center justify-center p-4 font-sans text-neutral-200">
        <div className="w-full max-w-md bg-neutral-950/60 backdrop-blur-md border border-neutral-900 rounded-2xl p-6 text-center space-y-5 shadow-xl">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
              <ShieldAlert className="h-6 w-6" />
            </div>
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-white tracking-tight">Authentication Sync Error</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">{error}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full py-2.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:text-white text-neutral-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition shadow-md"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out & Return to Login</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060608] flex flex-col items-center justify-center space-y-4 font-sans text-neutral-200">
      <div className="h-9 w-9 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-xs text-neutral-400 tracking-wide font-medium">Setting up your secure portal session...</p>
    </div>
  );
}

function MockAuthCallbackPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#060608] flex flex-col items-center justify-center space-y-4 font-sans text-neutral-200">
      <div className="h-9 w-9 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-xs text-neutral-400 tracking-wide font-medium">Redirecting to mock dashboard...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  if (hasClerk) {
    return <ClerkAuthCallbackPage />;
  }
  return <MockAuthCallbackPage />;
}

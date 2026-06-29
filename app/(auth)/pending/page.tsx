"use client";

import React, { useTransition } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Clock, RefreshCw, LogOut } from "lucide-react";

export default function PendingPage() {
  const { isLoaded, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      // Redirect to auth-callback to re-check status
      router.push("/auth-callback");
    });
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/5 animate-pulse">
          <Clock className="h-8 w-8" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight text-white font-sans">Review Pending</h2>
        <p className="text-sm text-neutral-400 max-w-xs mx-auto leading-relaxed font-sans">
          Thank you for registering{isLoaded && user?.firstName ? `, ${user.firstName}` : ""}. Your request is currently awaiting administrator approval.
        </p>
      </div>

      {isLoaded && user && (
        <div className="bg-neutral-950/50 border border-neutral-900 rounded-xl p-3.5 text-left text-xs space-y-1.5 max-w-sm mx-auto">
          <div className="flex justify-between text-neutral-400">
            <span>Name:</span>
            <span className="font-medium text-neutral-200">{user.fullName || user.username}</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Email:</span>
            <span className="font-medium text-neutral-200">{user.emailAddresses?.[0]?.emailAddress}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 pt-2">
        <button
          onClick={handleRefresh}
          disabled={isPending}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-lg shadow-indigo-600/10"
        >
          {isPending ? (
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Check Status</span>
            </>
          )}
        </button>

        <button
          onClick={handleSignOut}
          className="w-full py-2.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:text-white text-neutral-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

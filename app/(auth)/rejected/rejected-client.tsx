"use client";

import React from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ShieldAlert, LogOut } from "lucide-react";

export default function RejectedClient({ email, reason }: { email: string; reason: string }) {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="h-16 w-16 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/5">
          <ShieldAlert className="h-8 w-8" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight text-white font-sans">Application Rejected</h2>
        <p className="text-sm text-neutral-400 max-w-xs mx-auto leading-relaxed font-sans">
          Unfortunately, your registration request for <span className="text-neutral-300 font-semibold">{email}</span> has been rejected by an administrator.
        </p>
      </div>

      <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 text-left space-y-1.5 max-w-sm mx-auto">
        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Reason for Rejection:</span>
        <p className="text-xs text-neutral-300 leading-relaxed font-sans">{reason}</p>
      </div>

      <div className="pt-2">
        <button
          onClick={handleSignOut}
          className="w-full py-2.5 bg-neutral-900 border border-neutral-800 hover:border-red-500/30 hover:bg-red-500/5 text-neutral-400 hover:text-red-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out / Use Another Account</span>
        </button>
      </div>
    </div>
  );
}

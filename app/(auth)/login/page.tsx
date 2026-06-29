"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { loginUser } from "@/app/actions/auth";
import { LogIn, KeyRound, Mail, AlertTriangle, ArrowRight } from "lucide-react";

const hasClerk =
  typeof process !== "undefined" &&
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_");

// ── Clerk mode ────────────────────────────────────────────────────────────────
function ClerkLogin() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
        <p className="text-sm text-neutral-400">Sign in to access your portal</p>
      </div>

      <SignIn
        fallbackRedirectUrl="/auth-callback"
        appearance={{
          variables: {
            colorPrimary: "#6366f1",
            colorBackground: "#0a0a0f",
            colorForeground: "#f5f5f5",
            colorMutedForeground: "#a3a3a3",
            colorInput: "#111118",
            colorInputForeground: "#f5f5f5",
            borderRadius: "0.75rem",
            fontFamily: "inherit",
          },
          elements: {
            card: "bg-transparent shadow-none border-none",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            socialButtonsBlockButton:
              "bg-neutral-900 border border-neutral-800 text-neutral-200 hover:bg-neutral-800 transition",
            formFieldInput:
              "bg-neutral-950/40 border border-neutral-800 text-neutral-100 placeholder-neutral-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500",
            formButtonPrimary:
              "bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-600/10",
            footerActionLink: "text-indigo-400 hover:text-indigo-300",
            dividerLine: "bg-neutral-800",
            dividerText: "text-neutral-500",
          },
        }}
      />

      <div className="border-t border-neutral-900/60 pt-4 text-center">
        <p className="text-xs text-neutral-400">
          Need an account?{" "}
          <Link
            href="/register"
            className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-0.5 hover:underline"
          >
            Register <ArrowRight className="h-3 w-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}

// ── Fallback (no Clerk keys) ──────────────────────────────────────────────────
function LocalLogin() {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"PENDING" | "REJECTED" | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setStatus(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await loginUser(formData);
      if (!res.success) {
        setError(res.error);
        if (res.status) setStatus(res.status);
      } else {
        if (res.role === "STUDENT") window.location.href = "/student-portal";
        else if (res.role === "TEACHER") window.location.href = "/academic";
        else window.location.href = "/dashboard";
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
        <p className="text-sm text-neutral-400">Enter your credentials to access your portal</p>
      </div>

      {status === "PENDING" && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-300 space-y-1">
            <p className="font-semibold">Review Pending</p>
            <p>Your registration request is awaiting administrator approval.</p>
          </div>
        </div>
      )}

      {status === "REJECTED" && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs text-red-300 space-y-1">
            <p className="font-semibold">Application Rejected</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {error && !status && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              name="email"
              type="email"
              required
              placeholder="you@academy.com"
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-950/40 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Password</label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-950/40 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition"
        >
          {isPending ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn className="h-4 w-4" /><span>Log In</span></>}
        </button>
      </form>

      <div className="border-t border-neutral-900/60 pt-4 text-center">
        <p className="text-xs text-neutral-400">
          Need an account?{" "}
          <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-0.5 hover:underline">
            Create one <ArrowRight className="h-3 w-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return hasClerk ? <ClerkLogin /> : <LocalLogin />;
}

"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { loginUser } from "@/app/actions/auth";
import { LogIn, KeyRound, Mail, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
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
        if (res.status) {
          setStatus(res.status);
        }
      } else {
        // Successful login: Redirect
        if (res.role === "STUDENT") {
          window.location.href = "/student-portal";
        } else if (res.role === "TEACHER") {
          window.location.href = "/academic";
        } else {
          window.location.href = "/dashboard";
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Welcome back
        </h1>
        <p className="text-sm text-neutral-400">
          Enter your credentials to access your portal
        </p>
      </div>

      {/* Rejection / Pending Warnings */}
      {status === "PENDING" && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-300 space-y-1">
            <p className="font-semibold">Review Pending</p>
            <p>Your registration request has been received and is awaiting administrator approval. You will be able to log in once approved.</p>
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            Email Address
          </label>
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

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Password
            </label>
          </div>
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

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-indigo-600/10"
        >
          {isPending ? (
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              <span>Log In</span>
            </>
          )}
        </button>
      </form>

      {/* Toggle Account Mode switcher / Register link */}
      <div className="border-t border-neutral-900/60 pt-4 text-center">
        <p className="text-xs text-neutral-400">
          Need a student or teacher account?{" "}
          <Link
            href="/register"
            className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-0.5 hover:underline"
          >
            Create one <ArrowRight className="h-3 w-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}

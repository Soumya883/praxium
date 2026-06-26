"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { registerUser } from "@/app/actions/auth";
import { 
  UserPlus, 
  Mail, 
  Phone, 
  User, 
  KeyRound, 
  GraduationCap, 
  Briefcase, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ChevronRight
} from "lucide-react";

export default function RegisterPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    // Explicitly add role from state to make sure it's included
    formData.set("role", selectedRole);

    startTransition(async () => {
      const res = await registerUser(formData);
      if (!res.success) {
        setError(res.error);
        if (res.fieldErrors) {
          setFieldErrors(res.fieldErrors);
        }
      } else {
        setSuccess(true);
      }
    });
  };

  if (success) {
    return (
      <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
            <CheckCircle2 className="h-8 w-8" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-white">
            Application Submitted!
          </h2>
          <p className="text-sm text-neutral-400 max-w-xs mx-auto leading-relaxed">
            Your registration request is now pending review. An administrator will verify and approve your account shortly.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/login"
            className="w-full py-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-200 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <span>Back to Log In</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
          Create an Account
        </h1>
        <p className="text-sm text-neutral-400">
          Submit your profile for administrator approval
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selector Tabs */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            I am registering as a
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950 border border-neutral-900 rounded-xl">
            <button
              type="button"
              onClick={() => setSelectedRole("STUDENT")}
              className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                selectedRole === "STUDENT"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("TEACHER")}
              className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                selectedRole === "TEACHER"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>Teacher</span>
            </button>
          </div>
        </div>

        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              name="name"
              type="text"
              required
              placeholder="e.g. John Doe"
              className={`w-full pl-10 pr-4 py-2 bg-neutral-950/40 border rounded-xl text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition ${
                fieldErrors.name ? "border-red-500/50" : "border-neutral-800"
              }`}
            />
          </div>
          {fieldErrors.name && (
            <p className="text-[10px] text-red-400 font-medium pl-1">{fieldErrors.name[0]}</p>
          )}
        </div>

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
              placeholder="e.g. john@example.com"
              className={`w-full pl-10 pr-4 py-2 bg-neutral-950/40 border rounded-xl text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition ${
                fieldErrors.email ? "border-red-500/50" : "border-neutral-800"
              }`}
            />
          </div>
          {fieldErrors.email && (
            <p className="text-[10px] text-red-400 font-medium pl-1">{fieldErrors.email[0]}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            Phone Number <span className="text-neutral-500 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              name="phone"
              type="tel"
              placeholder="+91 99999 88888"
              className="w-full pl-10 pr-4 py-2 bg-neutral-950/40 border border-neutral-800 rounded-xl text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        {/* Password Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2 bg-neutral-950/40 border rounded-xl text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition ${
                  fieldErrors.password ? "border-red-500/50" : "border-neutral-800"
                }`}
              />
            </div>
            {fieldErrors.password && (
              <p className="text-[10px] text-red-400 font-medium pl-1">{fieldErrors.password[0]}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                name="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2 bg-neutral-950/40 border rounded-xl text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition ${
                  fieldErrors.confirmPassword ? "border-red-500/50" : "border-neutral-800"
                }`}
              />
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-[10px] text-red-400 font-medium pl-1">{fieldErrors.confirmPassword[0]}</p>
            )}
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
              <UserPlus className="h-4 w-4" />
              <span>Submit Request</span>
            </>
          )}
        </button>
      </form>

      {/* Login link */}
      <div className="border-t border-neutral-900/60 pt-4 text-center">
        <p className="text-xs text-neutral-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-0.5 hover:underline"
          >
            Log in <ArrowRight className="h-3 w-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}

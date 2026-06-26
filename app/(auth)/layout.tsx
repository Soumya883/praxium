import React from "react";
import { GraduationCap } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-50 font-sans selection:bg-indigo-500 selection:text-neutral-50 relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-900/10 blur-[150px] pointer-events-none" />
      
      {/* Tiny grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f13_1px,transparent_1px),linear-gradient(to_bottom,#0f0f13_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full px-6 py-5 flex items-center justify-between border-b border-neutral-900/60 bg-neutral-950/20 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-neutral-100">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 text-neutral-50 flex items-center justify-center shadow-md shadow-indigo-600/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Praxium</span>
        </Link>
        <div className="text-xs text-neutral-400 font-medium">
          Secure Portal Access
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/80 rounded-2xl p-8 shadow-2xl relative group">
          {/* Subtle card glow border effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none" />
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-neutral-900/60 text-center text-xs text-neutral-500">
        &copy; {new Date().getFullYear()} Praxium Coaching Academy. All rights reserved.
      </footer>
    </div>
  );
}

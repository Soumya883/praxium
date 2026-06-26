"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Avoid using console.log/info, but logging errors is allowed for enterprise diagnostics
    console.error("[GLOBAL ERROR BOUNDARY]:", error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-md border border-neutral-200 dark:border-neutral-900 rounded-xl bg-white dark:bg-neutral-950 p-8 shadow-lg text-center space-y-6">
        <div className="inline-flex p-3 rounded-full bg-rose-500/10 dark:bg-rose-500/5 text-rose-500 border border-rose-500/20">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Something went wrong</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            An unexpected error occurred during database communications or server execution. We have logged this diagnostic information.
          </p>
          {error.message && (
            <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg text-[10px] text-neutral-600 dark:text-neutral-400 font-mono text-left max-h-24 overflow-y-auto border border-neutral-200/50 dark:border-neutral-900/60">
              {error.message}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 h-9 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-50 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Try Again
          </Button>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "flex-1 inline-flex items-center justify-center gap-2 h-9 text-xs font-semibold border-neutral-200 dark:border-neutral-900 bg-transparent text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer"
            )}
          >
            <Home className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

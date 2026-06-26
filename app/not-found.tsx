import Link from "next/link";
import { HelpCircle, Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6 bg-neutral-50 dark:bg-neutral-950">
      <div className="w-full max-w-md border border-neutral-200 dark:border-neutral-900 rounded-xl bg-white dark:bg-neutral-950 p-8 shadow-lg text-center space-y-6">
        <div className="inline-flex p-3 rounded-full bg-neutral-500/10 dark:bg-neutral-500/5 text-neutral-500 border border-neutral-500/20">
          <HelpCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Record or page not found</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            The page you are looking for, or the student profile, fee invoice, or academic cohort record does not exist or has been deleted.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "default" }),
              "w-full inline-flex items-center justify-center gap-2 h-9 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-50 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 cursor-pointer"
            )}
          >
            <Home className="h-3.5 w-3.5" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

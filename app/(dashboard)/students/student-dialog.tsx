"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createStudentAction } from "./actions";
import { studentSchema, StudentFormInput } from "./validation";

export type EnrolledStudent = {
  id: string;
  name: string;
  email: string;
  batch: string;
  status: "active" | "inactive";
};

interface StudentDialogProps {
  onAdd: (student: EnrolledStudent) => void;
  dbBatches: { id: string; name: string }[];
}

export function StudentDialog({ onAdd, dbBatches }: StudentDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<StudentFormInput>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: "",
      email: "",
      batchId: "",
    },
  });

  const onSubmit = async (values: StudentFormInput) => {
    setIsPending(true);
    setServerError(null);

    try {
      const res = await createStudentAction(values);
      if (res.success) {
        const selectedBatch = dbBatches.find(b => b.id === values.batchId)?.name || "Unassigned";
        onAdd({
          id: `std_${Math.random().toString(36).substring(2, 11)}`,
          name: values.name,
          email: values.email,
          batch: selectedBatch,
          status: "active"
        });
        form.reset();
        setOpen(false);
      } else if (res.errors) {
        Object.entries(res.errors).forEach(([key, val]) => {
          form.setError(key as any, {
            type: "server",
            message: val?.join(", "),
          });
        });
      } else {
        setServerError(res.message || "Failed to add student.");
      }
    } catch (e) {
      setServerError("An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) {
        form.reset();
        setServerError(null);
      }
    }}>
      <DialogTrigger className="h-9 px-4 rounded-lg bg-neutral-900 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200 text-xs font-semibold gap-2 cursor-pointer transition inline-flex items-center justify-center border border-transparent outline-none">
        <Plus className="h-4.5 w-4.5" />
        <span>Add New Student</span>
      </DialogTrigger>
      <DialogContent className="max-w-[420px] bg-white/95 dark:bg-neutral-950/95 border border-neutral-200 dark:border-neutral-900 text-neutral-900 dark:text-neutral-100 backdrop-blur-md shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Enroll Student</DialogTitle>
          <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
            Fill in the details below to add a student to a batch.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs font-medium">
            {serverError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. John Doe" 
                      className="bg-neutral-50 border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700"
                      disabled={isPending}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-500 dark:text-rose-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. john.doe@example.com" 
                      className="bg-neutral-50 border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700"
                      disabled={isPending}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-500 dark:text-rose-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="batchId"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Select Batch</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-neutral-50 border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-300 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700">
                        <SelectValue placeholder="Choose a batch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 text-neutral-900 dark:text-neutral-200">
                      {dbBatches.map((b) => (
                        <SelectItem key={b.id} value={b.id} className="cursor-pointer text-xs hover:bg-neutral-100 dark:hover:bg-neutral-900 focus:bg-neutral-100 dark:focus:bg-neutral-900">
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs text-rose-500 dark:text-rose-400" />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-900">
              <Button 
                type="button" 
                variant="ghost" 
                disabled={isPending}
                onClick={() => setOpen(false)}
                className="hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-200 text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="bg-neutral-900 hover:bg-neutral-800 text-neutral-50 dark:bg-neutral-50 dark:hover:bg-neutral-200 dark:text-neutral-950 text-xs font-semibold px-4 cursor-pointer flex items-center gap-1.5"
              >
                {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                <span>{isPending ? "Enrolling..." : "Enroll Student"}</span>
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

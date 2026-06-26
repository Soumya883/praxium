"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
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
import { Button } from "@/components/ui/button";
import { batchFormSchema, BatchFormData, DAYS_LIST } from "./validation";
import { createBatch } from "@/app/actions/academic";
import { cn } from "@/lib/utils";

interface CreateBatchModalProps {
  courses: { id: string; name: string }[];
  teachers: { id: string; name: string }[];
  onSuccess: () => void;
}

export function CreateBatchModal({ courses, teachers, onSuccess }: CreateBatchModalProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<BatchFormData>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      name: "",
      courseId: "",
      teacherId: "",
      daysOfWeek: [],
      startTime: "",
      endTime: "",
      roomNumber: "",
    },
  });

  const onSubmit = async (values: BatchFormData) => {
    setServerError(null);
    startTransition(async () => {
      try {
        const response = await createBatch(values);
        if (response.success) {
          onSuccess();
          form.reset();
          setOpen(false);
        } else {
          setServerError(response.error || "Failed to schedule batch");
        }
      } catch (err) {
        setServerError("A network error occurred. Please try again.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!isPending) {
        setOpen(val);
        if (!val) {
          form.reset();
          setServerError(null);
        }
      }
    }}>
      <DialogTrigger className="h-9 px-4 rounded-lg bg-neutral-900 text-neutral-50 hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-200 text-xs font-semibold gap-2 cursor-pointer transition flex items-center justify-center border border-transparent outline-none">
        <Plus className="h-4.5 w-4.5" />
        <span>Schedule New Batch</span>
      </DialogTrigger>
      <DialogContent className="max-w-[460px] bg-white/95 dark:bg-neutral-950/95 border border-neutral-200 dark:border-neutral-900 text-neutral-900 dark:text-neutral-100 backdrop-blur-md shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Schedule Batch</DialogTitle>
          <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
            Define a new academic batch, assign a teacher, and allocate a classroom.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 text-xs font-medium">
            {serverError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Batch Name Input */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Batch Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Class 12 — Physics A" 
                      className="bg-neutral-50 border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700"
                      disabled={isPending}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-500 dark:text-rose-400" />
                </FormItem>
              )}
            />

            {/* Course Select & Teacher Select */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Course</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-neutral-50 border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 text-xs text-neutral-850 dark:text-neutral-300">
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 text-neutral-900 dark:text-neutral-200">
                        {courses.map((c) => (
                          <SelectItem key={c.id} value={c.id} className="text-xs cursor-pointer">
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs text-rose-500 dark:text-rose-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teacherId"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Teacher</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-neutral-50 border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 text-xs text-neutral-850 dark:text-neutral-300">
                          <SelectValue placeholder="Select teacher" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 text-neutral-900 dark:text-neutral-200">
                        {teachers.map((t) => (
                          <SelectItem key={t.id} value={t.id} className="text-xs cursor-pointer">
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs text-rose-500 dark:text-rose-400" />
                  </FormItem>
                )}
              />
            </div>

            {/* Days of Week Circle Group */}
            <FormField
              control={form.control}
              name="daysOfWeek"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Days of the Week</FormLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS_LIST.map((day) => {
                      const isSelected = field.value?.includes(day);
                      return (
                        <button
                          type="button"
                          key={day}
                          onClick={() => {
                            const current = field.value || [];
                            const updated = current.includes(day)
                              ? current.filter((d) => d !== day)
                              : [...current, day];
                            field.onChange(updated);
                          }}
                          className={cn(
                            "w-8.5 h-8.5 rounded-full border text-[10px] font-bold cursor-pointer transition flex items-center justify-center outline-none select-none",
                            isSelected
                              ? "bg-neutral-950 text-neutral-50 border-neutral-950 dark:bg-neutral-50 dark:text-neutral-950 dark:border-neutral-50"
                              : "bg-transparent text-neutral-500 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700"
                          )}
                          disabled={isPending}
                        >
                          {day.substring(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage className="text-xs text-rose-500 dark:text-rose-400" />
                </FormItem>
              )}
            />

            {/* Start Time & End Time */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Start Time (24h)</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
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
                name="endTime"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-medium text-neutral-500 dark:text-neutral-400">End Time (24h)</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        className="bg-neutral-50 border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700"
                        disabled={isPending}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-rose-500 dark:text-rose-400" />
                  </FormItem>
                )}
              />
            </div>

            {/* Room Number Input */}
            <FormField
              control={form.control}
              name="roomNumber"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Room Allocation</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Room 102" 
                      className="bg-neutral-50 border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 text-xs text-neutral-900 dark:text-neutral-100 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-700"
                      disabled={isPending}
                      {...field} 
                    />
                  </FormControl>
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
                className="hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-200 text-xs cursor-pointer bg-transparent"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="bg-neutral-900 hover:bg-neutral-800 text-neutral-50 dark:bg-neutral-50 dark:hover:bg-neutral-200 dark:text-neutral-950 text-xs font-semibold px-4 cursor-pointer flex items-center gap-1.5"
              >
                {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                <span>{isPending ? "Scheduling..." : "Schedule Batch"}</span>
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

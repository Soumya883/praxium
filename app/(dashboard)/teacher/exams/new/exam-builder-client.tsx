"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Settings, 
  BookOpen, 
  Check, 
  Loader2, 
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMockExam } from "@/app/actions/exams";
import { createExamSchema } from "@/app/actions/schemas";

interface Batch {
  id: string;
  name: string;
  courseName: string;
}

interface ExamBuilderProps {
  batches: Batch[];
}

type FormValues = z.infer<typeof createExamSchema>;

export function TeacherExamBuilderClient({ batches }: ExamBuilderProps) {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createExamSchema),
    defaultValues: {
      title: "",
      batchId: "",
      durationMinutes: 180,
      startTime: "",
      endTime: "",
      questions: [
        {
          questionText: "",
          options: ["", "", "", ""],
          correctOptionIndex: 0,
          positiveMarks: 4,
          negativeMarks: 1,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const watchQuestions = watch("questions");
  const watchBatchId = watch("batchId");

  const handleNextStep = () => {
    // Validate Step 1 fields
    const titleVal = watch("title");
    const batchIdVal = watch("batchId");
    const durationVal = watch("durationMinutes");
    const startVal = watch("startTime");
    const endVal = watch("endTime");

    if (!titleVal || titleVal.length < 3) {
      alert("Please enter a valid title (at least 3 characters).");
      return;
    }
    if (!batchIdVal) {
      alert("Please select a target batch.");
      return;
    }
    if (!durationVal || durationVal <= 0) {
      alert("Please enter a valid duration.");
      return;
    }
    if (!startVal || !endVal) {
      alert("Please select both start and end time windows.");
      return;
    }

    setStep(2);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const res = await createMockExam(data);
      if (res.success) {
        alert("Mock Exam created and scheduled successfully!");
        router.push("/teacher/assignments"); // Navigate to teacher dashboard
      } else {
        alert("Error creating exam: " + res.error);
      }
    } catch (err: any) {
      alert("Submission failed: " + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-900 pb-5">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Create CBT Mock Exam</h2>
            <p className="text-xs text-neutral-500">Configure JEE/NEET format tests with auto-grading rules.</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className={`px-2.5 py-1 rounded-md ${step === 1 ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950" : "bg-neutral-100 dark:bg-neutral-900 text-neutral-500"}`}>
            1. Settings
          </span>
          <ArrowRight className="h-3 w-3 text-neutral-400" />
          <span className={`px-2.5 py-1 rounded-md ${step === 2 ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950" : "bg-neutral-100 dark:bg-neutral-900 text-neutral-500"}`}>
            2. Question Paper
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {step === 1 ? (
          <Card className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Settings className="h-4.5 w-4.5 text-neutral-400" />
                <span>Exam Scheduling & Rules</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Set basic test metadata, duration constraints, and target cohorts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs text-neutral-500">Exam Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. JEE Main Mock Physics Test — Chapter 1-3"
                  className="bg-neutral-50 dark:bg-neutral-900 text-xs h-9"
                  {...register("title")}
                />
                {errors.title && <span className="text-[10px] text-red-500">{errors.title.message}</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="batchId" className="text-xs text-neutral-500">Target Cohort / Batch</Label>
                  <Select
                    value={watchBatchId}
                    onValueChange={(val) => setValue("batchId", val || "")}
                  >
                    <SelectTrigger className="bg-neutral-50 dark:bg-neutral-900 text-xs h-9">
                      <SelectValue placeholder="Select target batch" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 text-neutral-900 dark:text-neutral-200">
                      {batches.map((b) => (
                        <SelectItem key={b.id} value={b.id} className="text-xs cursor-pointer">
                          {b.name} ({b.courseName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.batchId && <span className="text-[10px] text-red-500">{errors.batchId.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="durationMinutes" className="text-xs text-neutral-500">Duration (Minutes)</Label>
                  <Input
                    id="durationMinutes"
                    type="number"
                    placeholder="e.g. 180"
                    className="bg-neutral-50 dark:bg-neutral-900 text-xs h-9"
                    {...register("durationMinutes", { valueAsNumber: true })}
                  />
                  {errors.durationMinutes && <span className="text-[10px] text-red-500">{errors.durationMinutes.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="startTime" className="text-xs text-neutral-500">Available From</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    className="bg-neutral-50 dark:bg-neutral-900 text-xs h-9"
                    {...register("startTime")}
                  />
                  {errors.startTime && <span className="text-[10px] text-red-500">{errors.startTime.message}</span>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="endTime" className="text-xs text-neutral-500">Closes At</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    className="bg-neutral-50 dark:bg-neutral-900 text-xs h-9"
                    {...register("endTime")}
                  />
                  {errors.endTime && <span className="text-[10px] text-red-500">{errors.endTime.message}</span>}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold h-9 px-5 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Continue to Questions</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 p-4 rounded-xl">
              <div className="text-xs text-neutral-500">
                <span className="font-bold text-neutral-800 dark:text-neutral-200">Exam Name:</span> {watch("title")} &bull;{" "}
                <span className="font-bold text-neutral-800 dark:text-neutral-200">Duration:</span> {watch("durationMinutes")} mins
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="h-8 text-xs font-semibold"
              >
                Edit Settings
              </Button>
            </div>

            {/* Questions Array */}
            <div className="space-y-6">
              {fields.map((field, index) => (
                <Card key={field.id} className="border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-neutral-900 dark:bg-neutral-100" />
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-extrabold text-neutral-900 dark:text-white">
                        Question #{index + 1}
                      </CardTitle>
                      <CardDescription className="text-[11px]">Compose the question statement and multiple choice options.</CardDescription>
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => remove(index)}
                        className="h-8 px-2 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Question Text */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-neutral-500">Question Statement</Label>
                      <textarea
                        required
                        rows={3}
                        placeholder="e.g. Which of the following equations represents Gauss's Law in integral form?"
                        className="w-full text-xs p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                        {...register(`questions.${index}.questionText` as const)}
                      />
                    </div>

                    {/* Positive & Negative Marks */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-neutral-500">Positive Marking (+ Marks)</Label>
                        <Input
                          type="number"
                          className="bg-neutral-50 dark:bg-neutral-900 text-xs h-9"
                          {...register(`questions.${index}.positiveMarks` as const, { valueAsNumber: true })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-neutral-500">Negative Marking (- Marks)</Label>
                        <Input
                          type="number"
                          className="bg-neutral-50 dark:bg-neutral-900 text-xs h-9"
                          {...register(`questions.${index}.negativeMarks` as const, { valueAsNumber: true })}
                        />
                      </div>
                    </div>

                    {/* Choice Options */}
                    <div className="space-y-2.5">
                      <Label className="text-xs text-neutral-500">Multiple Choice Options (JEE/NEET Format)</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[0, 1, 2, 3].map((optIdx) => (
                          <div key={optIdx} className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-neutral-400 w-6">
                                ({String.fromCharCode(65 + optIdx)})
                              </span>
                              <Input
                                placeholder={`Enter Option ${optIdx + 1}`}
                                required
                                className="bg-neutral-50 dark:bg-neutral-900 text-xs h-9 flex-1"
                                {...register(`questions.${index}.options.${optIdx}` as const)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Correct Option index */}
                    <div className="space-y-1.5 pt-2">
                      <Label className="text-xs text-neutral-500">Correct Choice (Key Answer)</Label>
                      <Select
                        value={watchQuestions[index]?.correctOptionIndex?.toString() || "0"}
                        onValueChange={(val) => setValue(`questions.${index}.correctOptionIndex`, parseInt(val ?? "0"))}
                      >
                        <SelectTrigger className="bg-neutral-50 dark:bg-neutral-900 text-xs h-9 w-48">
                          <SelectValue placeholder="Select correct answer" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 text-neutral-900 dark:text-neutral-200">
                          <SelectItem value="0" className="text-xs cursor-pointer">(A) Option 1</SelectItem>
                          <SelectItem value="1" className="text-xs cursor-pointer">(B) Option 2</SelectItem>
                          <SelectItem value="2" className="text-xs cursor-pointer">(C) Option 3</SelectItem>
                          <SelectItem value="3" className="text-xs cursor-pointer">(D) Option 4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Form actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-neutral-200 dark:border-neutral-900 pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  append({
                    questionText: "",
                    options: ["", "", "", ""],
                    correctOptionIndex: 0,
                    positiveMarks: 4,
                    negativeMarks: 1,
                  });
                }}
                className="text-xs font-semibold h-9 px-4 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Add Question to Paper</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="h-9 px-4 text-xs font-semibold"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold h-9 px-6 cursor-pointer flex items-center gap-1.5 shadow"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span>Publish Timed Exam</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

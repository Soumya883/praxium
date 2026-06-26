"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { 
  Clock, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  Loader2, 
  Lock,
  User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { submitExamAttempt } from "@/app/actions/exams";

interface Question {
  id: string;
  questionText: string;
  options: string[];
  positiveMarks: number;
  negativeMarks: number;
}

interface Exam {
  id: string;
  title: string;
  durationMinutes: number;
}

interface StudentExamTakeClientProps {
  exam: Exam;
  questions: Question[];
  attemptId: string;
  studentName: string;
}

export function StudentExamTakeClient({
  exam,
  questions,
  attemptId,
  studentName,
}: StudentExamTakeClientProps) {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = React.useState(false);

  // Answers state: questionId -> selectedIndex (0-3), or null if not answered
  const [answers, setAnswers] = React.useState<Record<string, number | null>>(() => {
    const initial: Record<string, number | null> = {};
    questions.forEach(q => {
      initial[q.id] = null;
    });
    return initial;
  });

  // Track visited questions state: questionId -> boolean
  const [visited, setVisited] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    questions.forEach((q, idx) => {
      initial[q.id] = idx === 0; // First question is visited on load
    });
    return initial;
  });

  // Timer countdown: remaining seconds
  const [timeLeft, setTimeLeft] = React.useState(exam.durationMinutes * 60);

  // Lockdown security event handlers
  React.useEffect(() => {
    const preventRightClick = (e: MouseEvent) => {
      e.preventDefault();
    };

    const preventCopyCutHighlight = (e: KeyboardEvent) => {
      // Prevent Ctrl+C, Ctrl+V, Ctrl+U, Ctrl+A, F12
      if (
        e.ctrlKey &&
        (e.key === "c" || e.key === "C" || e.key === "v" || e.key === "V" || e.key === "u" || e.key === "U" || e.key === "a" || e.key === "A")
      ) {
        e.preventDefault();
      }
      if (e.key === "F12") {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", preventRightClick);
    document.addEventListener("keydown", preventCopyCutHighlight);

    return () => {
      document.removeEventListener("contextmenu", preventRightClick);
      document.removeEventListener("keydown", preventCopyCutHighlight);
    };
  }, []);

  // Timer countdown hook
  React.useEffect(() => {
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = (qId: string, optIdx: number) => {
    setAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleClearResponse = () => {
    const qId = questions[currentIdx].id;
    setAnswers(prev => ({ ...prev, [qId]: null }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      const nextId = questions[currentIdx + 1].id;
      setVisited(prev => ({ ...prev, [nextId]: true }));
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      const prevId = questions[currentIdx - 1].id;
      setVisited(prev => ({ ...prev, [prevId]: true }));
      setCurrentIdx(prev => prev - 1);
    }
  };

  const handleQuestionSelect = (idx: number) => {
    const qId = questions[idx].id;
    setVisited(prev => ({ ...prev, [qId]: true }));
    setCurrentIdx(idx);
  };

  const executeSubmission = async () => {
    setIsSubmitting(true);
    try {
      const answersPayload = Object.entries(answers).map(([questionId, selectedOptionIndex]) => ({
        questionId,
        selectedOptionIndex,
      }));

      const res = await submitExamAttempt(attemptId, answersPayload);
      if (res.success) {
        alert("Exam submitted successfully!");
        // Store results in session/local storage or route directly. Let's route to the results dashboard summary!
        router.replace(`/student-portal/exams/${exam.id}/results?att=${attemptId}`);
      } else {
        alert("Failed to submit exam: " + res.error);
        setIsSubmitting(false);
      }
    } catch (err: any) {
      alert("Error submitting answers: " + (err.message || err));
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    alert("Time is up! Your answers will be submitted automatically.");
    executeSubmission();
  };

  const currentQuestion = questions[currentIdx];
  const answeredCount = Object.values(answers).filter(v => v !== null).length;
  const notAnsweredCount = Object.values(answers).filter((v, idx) => v === null && visited[questions[idx].id]).length;
  const notVisitedCount = questions.length - Object.keys(visited).length;

  return (
    <div className="flex flex-col h-screen bg-neutral-900 text-neutral-100 font-sans select-none overflow-hidden">
      {/* Locked Down Header */}
      <header className="bg-neutral-950 border-b border-neutral-850 px-6 py-4 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2">
          <Lock className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
          <h1 className="text-sm font-extrabold tracking-tight truncate max-w-[200px] sm:max-w-md">
            {exam.title}
          </h1>
        </div>

        {/* Dynamic Timer Widget */}
        <div className="flex items-center gap-2.5 bg-neutral-900 border border-neutral-800 px-3.5 py-1.5 rounded-lg">
          <Clock className={`h-4.5 w-4.5 ${timeLeft < 300 ? "text-red-500 animate-pulse" : "text-emerald-500"}`} />
          <span className={`font-mono text-sm font-bold ${timeLeft < 300 ? "text-red-400 font-extrabold" : "text-neutral-200"}`}>
            Time Left: {formatTime(timeLeft)}
          </span>
        </div>
      </header>

      {/* Main Workspace split panel */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: MCQ Question Console */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-neutral-850">
          {/* Question panel header */}
          <div className="bg-neutral-950/60 px-6 py-3 border-b border-neutral-850 flex justify-between items-center text-xs text-neutral-400 shrink-0">
            <span className="font-semibold">Section: Physics Core</span>
            <span className="bg-neutral-800 text-neutral-300 px-2.5 py-0.5 rounded font-mono font-bold">
              +{currentQuestion.positiveMarks} / -{currentQuestion.negativeMarks} Marks
            </span>
          </div>

          {/* Question content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            <div className="space-y-4">
              <div className="text-sm font-extrabold text-neutral-300">
                Question {currentIdx + 1} of {questions.length}
              </div>
              <div className="text-base leading-relaxed text-neutral-200 whitespace-pre-line font-medium border-l-2 border-neutral-700 pl-4">
                {currentQuestion.questionText}
              </div>
            </div>

            {/* Options list */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((opt, optIdx) => {
                const isSelected = answers[currentQuestion.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                    className={`w-full text-left p-4 rounded-xl border text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-neutral-800 border-neutral-400 text-white shadow-xs"
                        : "bg-neutral-950/45 border-neutral-850 hover:bg-neutral-850/30 text-neutral-300"
                    }`}
                  >
                    <span className={`h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                      isSelected
                        ? "bg-neutral-100 text-neutral-950 border-neutral-100"
                        : "border-neutral-700 bg-neutral-900 text-neutral-400"
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="leading-normal">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Console Action Bar */}
          <div className="bg-neutral-950 border-t border-neutral-850 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="h-9 px-3 text-xs bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span>Previous</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentIdx === questions.length - 1}
                className="h-9 px-3 text-xs bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={handleClearResponse}
              disabled={answers[currentQuestion.id] === null}
              className="text-xs text-neutral-400 hover:text-red-400 hover:bg-transparent h-9 cursor-pointer"
            >
              Clear Response
            </Button>
          </div>
        </div>

        {/* Right Side: Candidate Profile & Question Palette */}
        <div className="w-full md:w-80 bg-neutral-950 flex flex-col shrink-0 overflow-y-auto">
          {/* Candidate Card */}
          <div className="p-5 border-b border-neutral-850 flex items-center gap-3 bg-neutral-900/30">
            <div className="h-10 w-10 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300">
              <User className="h-5 w-5" />
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-neutral-200 truncate">{studentName}</div>
              <div className="text-[10px] text-neutral-500">Candidate ID: MOCK-STUDENT</div>
            </div>
          </div>

          {/* Palette Grid */}
          <div className="p-5 flex-1 flex flex-col">
            <div className="text-xs font-extrabold text-neutral-400 mb-3.5">Question Navigation Palette</div>
            
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIdx;
                const isAnswered = answers[q.id] !== null;
                const isVisited = visited[q.id];

                let bgClass = "bg-neutral-900 border-neutral-800 text-neutral-500";
                if (isAnswered) {
                  bgClass = "bg-emerald-600/90 border-emerald-500 text-white";
                } else if (isVisited) {
                  bgClass = "bg-red-600/90 border-red-500 text-white";
                }

                if (isCurrent) {
                  bgClass += " ring-2 ring-neutral-200 ring-offset-2 ring-offset-neutral-950";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => handleQuestionSelect(idx)}
                    className={`h-9 rounded-lg border font-mono font-bold text-xs flex items-center justify-center cursor-pointer transition-all ${bgClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend section */}
            <div className="mt-8 border-t border-neutral-900 pt-5 space-y-3">
              <div className="text-[10px] font-extrabold tracking-wider text-neutral-500 uppercase">Status Indicators</div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 bg-neutral-900 border border-neutral-800 rounded" />
                  <span>Not Visited ({notVisitedCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 bg-red-600 border border-red-500 rounded" />
                  <span>Not Answered ({notAnsweredCount})</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <span className="h-3 w-3 bg-emerald-600 border border-emerald-500 rounded" />
                  <span>Answered ({answeredCount})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submission CTA */}
          <div className="p-5 border-t border-neutral-850">
            <Button
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-950 h-10 text-xs font-bold shadow rounded-xl cursor-pointer"
            >
              Submit Exam Paper
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal overlay */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-sm w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2.5 text-amber-500">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="text-sm font-extrabold">Confirm Final Submission</h3>
            </div>
            
            <div className="space-y-2 text-xs text-neutral-400 leading-relaxed">
              <p>Are you sure you want to submit your mock exam paper? You will not be able to change your answers after submission.</p>
              <div className="bg-neutral-950/80 p-3 rounded-lg border border-neutral-850 font-medium space-y-1 mt-3">
                <div className="flex justify-between">
                  <span>Total Questions:</span>
                  <span className="font-bold text-neutral-200">{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Answered Questions:</span>
                  <span className="font-bold text-emerald-400">{answeredCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unanswered Questions:</span>
                  <span className="font-bold text-red-400">{questions.length - answeredCount}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                disabled={isSubmitting}
                onClick={() => setIsSubmitModalOpen(false)}
                className="h-9 px-3 text-xs bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={executeSubmission}
                disabled={isSubmitting}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-bold text-xs h-9 px-4 cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Submit & Exit</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Phone,
  Calendar,
  Plus,
  AlertCircle,
  Clock,
  User,
  BookOpen,
  Loader2,
  StickyNote,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  createNewInquiry,
  updateInquiryStatus,
  updateInquiryNotes,
  convertInquiryToStudent,
} from "@/app/actions/crm";
import { type InquiryStatus } from "@/app/actions/schemas";

// --- Types ---
interface Inquiry {
  id: string;
  studentName: string;
  guardianPhone: string;
  targetCourse: string;
  status: InquiryStatus;
  followUpDate: Date | string | null;
  notes: string | null;
  createdAt: Date | string;
}

interface Batch {
  id: string;
  name: string;
  courseName: string;
}

interface AdmissionsKanbanClientProps {
  initialInquiries: Inquiry[];
  availableBatches: Batch[];
}

// --- Column Config ---
const COLUMNS: {
  id: InquiryStatus;
  label: string;
  color: string;
  bgColor: string;
  dotColor: string;
}[] = [
  {
    id: "NEW_WALKIN",
    label: "New Walk-in",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900",
    dotColor: "bg-blue-500",
  },
  {
    id: "CALLED",
    label: "Called",
    color: "text-yellow-700 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900",
    dotColor: "bg-yellow-500",
  },
  {
    id: "TRIAL_SCHEDULED",
    label: "Trial Scheduled",
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900",
    dotColor: "bg-purple-500",
  },
  {
    id: "ENROLLED",
    label: "Enrolled ✓",
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900",
    dotColor: "bg-green-500",
  },
  {
    id: "LOST",
    label: "Lost",
    color: "text-neutral-500 dark:text-neutral-400",
    bgColor: "bg-neutral-100 dark:bg-neutral-900/30 border-neutral-200 dark:border-neutral-800",
    dotColor: "bg-neutral-400",
  },
];

// --- Utility ---
function isOverdue(date: Date | string | null): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}

function formatDate(date: Date | string | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// --- Add Walk-in Dialog ---
function AddWalkinDialog({ onAdd }: { onAdd: (inquiry: Inquiry) => void }) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    studentName: "",
    guardianPhone: "",
    targetCourse: "",
    followUpDate: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createNewInquiry(form);
      if (res.success) {
        // Optimistic: create a mock inquiry for immediate UI update
        const mockInquiry: Inquiry = {
          id: `temp-${Date.now()}`,
          studentName: form.studentName,
          guardianPhone: form.guardianPhone,
          targetCourse: form.targetCourse,
          status: "NEW_WALKIN",
          followUpDate: form.followUpDate ? new Date(form.followUpDate) : null,
          notes: form.notes || null,
          createdAt: new Date(),
        };
        onAdd(mockInquiry);
        setOpen(false);
        setForm({ studentName: "", guardianPhone: "", targetCourse: "", followUpDate: "", notes: "" });
      } else {
        alert("Error: " + res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            className="bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold h-9 px-4 flex items-center gap-1.5 cursor-pointer"
            id="add-walkin-btn"
          >
            <Plus className="h-4 w-4" />
            Add Walk-in
          </Button>
        }
      />
      <DialogContent className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">New Walk-in Lead</DialogTitle>
          <DialogDescription className="text-xs text-neutral-500">
            Capture a new inquiry from a walk-in student or phone call.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="studentName" className="text-xs text-neutral-500">Student Name</Label>
            <Input
              id="studentName"
              placeholder="e.g. Arjun Sharma"
              value={form.studentName}
              onChange={(e) => setForm((f) => ({ ...f, studentName: e.target.value }))}
              className="h-9 text-xs bg-neutral-50 dark:bg-neutral-900"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="guardianPhone" className="text-xs text-neutral-500">Guardian Phone</Label>
            <Input
              id="guardianPhone"
              placeholder="e.g. 9876543210"
              value={form.guardianPhone}
              onChange={(e) => setForm((f) => ({ ...f, guardianPhone: e.target.value }))}
              className="h-9 text-xs bg-neutral-50 dark:bg-neutral-900"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="targetCourse" className="text-xs text-neutral-500">Target Course</Label>
            <Input
              id="targetCourse"
              placeholder="e.g. JEE Advanced 2025"
              value={form.targetCourse}
              onChange={(e) => setForm((f) => ({ ...f, targetCourse: e.target.value }))}
              className="h-9 text-xs bg-neutral-50 dark:bg-neutral-900"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="followUpDate" className="text-xs text-neutral-500">Follow-up Date <span className="text-neutral-400">(optional)</span></Label>
            <Input
              id="followUpDate"
              type="datetime-local"
              value={form.followUpDate}
              onChange={(e) => setForm((f) => ({ ...f, followUpDate: e.target.value }))}
              className="h-9 text-xs bg-neutral-50 dark:bg-neutral-900"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs text-neutral-500">Notes <span className="text-neutral-400">(optional)</span></Label>
            <textarea
              id="notes"
              rows={2}
              placeholder="e.g. Student is interested in JEE batch, father called..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full text-xs p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" className="h-9 text-xs" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="h-9 text-xs bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-semibold cursor-pointer">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Lead Detail Sheet ---
function LeadDetailSheet({
  inquiry,
  open,
  onOpenChange,
  availableBatches,
  onUpdate,
}: {
  inquiry: Inquiry | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  availableBatches: Batch[];
  onUpdate: (id: string, notes: string, followUpDate: string) => void;
}) {
  const [notes, setNotes] = React.useState(inquiry?.notes || "");
  const [followUpDate, setFollowUpDate] = React.useState(
    inquiry?.followUpDate ? new Date(inquiry.followUpDate).toISOString().slice(0, 16) : ""
  );
  const [saving, setSaving] = React.useState(false);
  const [convertOpen, setConvertOpen] = React.useState(false);
  const [selectedBatch, setSelectedBatch] = React.useState("");
  const [converting, setConverting] = React.useState(false);

  React.useEffect(() => {
    if (inquiry) {
      setNotes(inquiry.notes || "");
      setFollowUpDate(
        inquiry.followUpDate ? new Date(inquiry.followUpDate).toISOString().slice(0, 16) : ""
      );
    }
  }, [inquiry]);

  const handleSaveNotes = async () => {
    if (!inquiry) return;
    setSaving(true);
    await updateInquiryNotes(inquiry.id, { notes, followUpDate });
    onUpdate(inquiry.id, notes, followUpDate);
    setSaving(false);
  };

  const handleConvert = async () => {
    if (!inquiry || !selectedBatch) {
      alert("Please select a batch first.");
      return;
    }
    setConverting(true);
    const res = await convertInquiryToStudent(inquiry.id, selectedBatch);
    if (res.success) {
      alert(`✅ ${inquiry.studentName} has been enrolled as a student!`);
      setConvertOpen(false);
      onOpenChange(false);
    } else {
      alert("Error: " + res.error);
    }
    setConverting(false);
  };

  if (!inquiry) return null;
  const overdue = isOverdue(inquiry.followUpDate);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-900 w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-neutral-200 dark:border-neutral-900">
          <SheetTitle className="text-base font-bold">{inquiry.studentName}</SheetTitle>
          <SheetDescription className="text-xs text-neutral-500">
            Lead Details & Notes
          </SheetDescription>
        </SheetHeader>

        <div className="py-5 space-y-5">
          {/* Basic Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs">
              <Phone className="h-3.5 w-3.5 text-neutral-400" />
              <span className="text-neutral-500">Guardian:</span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200">{inquiry.guardianPhone}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <BookOpen className="h-3.5 w-3.5 text-neutral-400" />
              <span className="text-neutral-500">Target Course:</span>
              <span className="font-medium text-neutral-800 dark:text-neutral-200">{inquiry.targetCourse}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <User className="h-3.5 w-3.5 text-neutral-400" />
              <span className="text-neutral-500">Status:</span>
              <Badge variant="secondary" className="text-[10px] font-semibold px-2">
                {inquiry.status.replace("_", " ")}
              </Badge>
            </div>
            {inquiry.followUpDate && (
              <div className={`flex items-center gap-2 text-xs ${overdue ? "text-red-600 dark:text-red-400" : "text-neutral-500"}`}>
                {overdue ? (
                  <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                ) : (
                  <Clock className="h-3.5 w-3.5" />
                )}
                <span>{overdue ? "OVERDUE — " : "Follow-up: "}</span>
                <span className="font-medium">{formatDate(inquiry.followUpDate)}</span>
              </div>
            )}
          </div>

          {/* Notes Editor */}
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500 flex items-center gap-1.5">
              <StickyNote className="h-3.5 w-3.5" />
              Notes
            </Label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this lead..."
              className="w-full text-xs p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-none"
            />
          </div>

          {/* Follow-up Date Editor */}
          <div className="space-y-2">
            <Label htmlFor="sheet-followup" className="text-xs text-neutral-500 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Follow-up Date
            </Label>
            <Input
              id="sheet-followup"
              type="datetime-local"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="h-9 text-xs bg-neutral-50 dark:bg-neutral-900"
            />
          </div>

          <Button
            onClick={handleSaveNotes}
            disabled={saving}
            className="w-full h-9 text-xs bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-semibold cursor-pointer"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Notes & Follow-up
          </Button>

          {/* Convert to Student */}
          {inquiry.status !== "ENROLLED" && inquiry.status !== "LOST" && (
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-900 space-y-3">
              <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Convert to Enrolled Student
              </p>
              <p className="text-[11px] text-neutral-500">
                This will create a student account and move this lead to ENROLLED.
              </p>
              {!convertOpen ? (
                <Button
                  onClick={() => setConvertOpen(true)}
                  variant="outline"
                  className="w-full h-9 text-xs font-semibold border-green-500 text-green-700 hover:bg-green-50 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-950/30 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Convert to Student
                </Button>
              ) : (
                <div className="space-y-2">
                  <Select value={selectedBatch} onValueChange={(v) => setSelectedBatch(v ?? "")}>
                    <SelectTrigger className="h-9 text-xs bg-neutral-50 dark:bg-neutral-900">
                      <SelectValue placeholder="Select a batch to enroll into" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900">
                      {availableBatches.map((b) => (
                        <SelectItem key={b.id} value={b.id} className="text-xs">
                          {b.name} ({b.courseName})
                        </SelectItem>
                      ))}
                      {availableBatches.length === 0 && (
                        <SelectItem value="_none" disabled className="text-xs text-neutral-400">
                          No batches available (demo mode)
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 h-9 text-xs cursor-pointer"
                      onClick={() => setConvertOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 h-9 text-xs bg-green-600 text-white hover:bg-green-700 font-semibold cursor-pointer flex items-center gap-1.5"
                      onClick={handleConvert}
                      disabled={converting || !selectedBatch}
                    >
                      {converting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                      Confirm Enroll
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// --- Kanban Card ---
function KanbanCard({
  inquiry,
  index,
  onClick,
}: {
  inquiry: Inquiry;
  index: number;
  onClick: () => void;
}) {
  const overdue = isOverdue(inquiry.followUpDate);

  return (
    <Draggable draggableId={inquiry.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style as React.CSSProperties}
          onClick={onClick}
          className={`
            p-3 rounded-xl border cursor-pointer transition-all select-none
            ${snapshot.isDragging
              ? "shadow-xl rotate-1 scale-[1.02] border-neutral-400 dark:border-neutral-600 bg-white dark:bg-neutral-900"
              : "bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:shadow-md"
            }
            ${overdue ? "border-l-4 border-l-red-500" : ""}
          `}
        >
          <div className="space-y-2">
            {/* Student Name */}
            <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
              {inquiry.studentName}
            </p>

            {/* Course */}
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
              <BookOpen className="h-3 w-3 shrink-0" />
              <span className="truncate">{inquiry.targetCourse}</span>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
              <Phone className="h-3 w-3 shrink-0" />
              <span>{inquiry.guardianPhone}</span>
            </div>

            {/* Follow-up badge */}
            {inquiry.followUpDate && (
              <div
                className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md w-fit ${
                  overdue
                    ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
                }`}
              >
                {overdue ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                {overdue ? "OVERDUE" : formatDate(inquiry.followUpDate)}
              </div>
            )}

            {/* Notes snippet */}
            {inquiry.notes && (
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 italic truncate">
                &ldquo;{inquiry.notes}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

// --- Main Kanban Board ---
export function AdmissionsKanbanClient({
  initialInquiries,
  availableBatches,
}: AdmissionsKanbanClientProps) {
  const [inquiries, setInquiries] = React.useState<Inquiry[]>(initialInquiries);
  const [selectedInquiry, setSelectedInquiry] = React.useState<Inquiry | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as InquiryStatus;

    // Optimistic update
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === draggableId ? { ...inq, status: newStatus } : inq))
    );

    // Persist to DB
    const res = await updateInquiryStatus(draggableId, newStatus);
    if (!res.success) {
      // Rollback on error
      setInquiries(initialInquiries);
      alert("Failed to update status: " + res.error);
    }
  };

  const handleCardClick = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setSheetOpen(true);
  };

  const handleAddInquiry = (inquiry: Inquiry) => {
    setInquiries((prev) => [inquiry, ...prev]);
  };

  const handleNoteUpdate = (id: string, notes: string, followUpDate: string) => {
    setInquiries((prev) =>
      prev.map((inq) =>
        inq.id === id
          ? { ...inq, notes, followUpDate: followUpDate ? new Date(followUpDate) : null }
          : inq
      )
    );
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          {COLUMNS.map((col) => {
            const count = inquiries.filter((i) => i.status === col.id).length;
            return (
              <div key={col.id} className="flex items-center gap-1.5 text-xs text-neutral-500">
                <div className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                <span>{col.label}</span>
                <span className="font-bold text-neutral-700 dark:text-neutral-300">({count})</span>
              </div>
            );
          })}
        </div>
        <AddWalkinDialog onAdd={handleAddInquiry} />
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
          {COLUMNS.map((col) => {
            const colInquiries = inquiries.filter((i) => i.status === col.id);
            return (
              <div
                key={col.id}
                className={`flex-shrink-0 w-64 rounded-xl border p-3 flex flex-col gap-2 ${col.bgColor}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${col.dotColor}`} />
                    <span className={`text-xs font-bold ${col.color}`}>{col.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/60 dark:bg-neutral-950/60 ${col.color}`}>
                    {colInquiries.length}
                  </span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-2 min-h-[100px] rounded-lg transition-colors p-1 ${
                        snapshot.isDraggingOver ? "bg-white/40 dark:bg-neutral-900/40" : ""
                      }`}
                    >
                      {colInquiries.map((inquiry, index) => (
                        <KanbanCard
                          key={inquiry.id}
                          inquiry={inquiry}
                          index={index}
                          onClick={() => handleCardClick(inquiry)}
                        />
                      ))}
                      {provided.placeholder}
                      {colInquiries.length === 0 && (
                        <div className="flex items-center justify-center h-16 text-[10px] text-neutral-400 dark:text-neutral-600 text-center px-2">
                          Drop cards here
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Detail Sheet */}
      <LeadDetailSheet
        inquiry={selectedInquiry}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        availableBatches={availableBatches}
        onUpdate={handleNoteUpdate}
      />
    </>
  );
}

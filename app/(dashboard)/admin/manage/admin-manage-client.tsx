"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Users, BookOpen, GraduationCap, ClipboardList,
  Plus, Pencil, Trash2, X, Check, Loader2,
  Search, ChevronDown, UserPlus, AlertTriangle,
  Shield, Mail, Phone, Calendar, MoreHorizontal,
  Building2, Clock, Hash, Star, RefreshCw
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  createUserByAdmin, updateUserByAdmin, deleteUserByAdmin,
  updateBatchByAdmin, deleteBatchByAdmin,
  updateCourseByAdmin, deleteCourseByAdmin,
  createAssignmentByAdmin, deleteAssignmentByAdmin,
} from "@/app/actions/admin-management";
import { createBatch, createCourse } from "@/app/actions/academic";

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "TEACHER" | "STUDENT" | "ADMIN";
  createdAt: Date;
}

interface BatchItem {
  id: string;
  name: string;
  courseId: string;
  teacherId: string | null;
  courseName: string;
  teacherName: string | null | undefined;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  roomNumber: string;
  maxCapacity: number;
}

interface CourseItem {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
}

interface AssignmentItem {
  id: string;
  title: string;
  description?: string | null;
  batchId: string;
  teacherId: string;
  batchName: string;
  teacherName: string;
  dueDate: Date;
  maxMarks: number;
}

interface AdminManageClientProps {
  initialUsers: UserItem[];
  initialBatches: BatchItem[];
  initialCourses: CourseItem[];
  initialAssignments: AssignmentItem[];
  teachers: { id: string; name: string }[];
  batches: { id: string; name: string; courseId: string }[];
  courses: { id: string; name: string }[];
}

// ─── Shared Dialog Component ─────────────────────────────────────────────────

function Modal({ title, icon: Icon, onClose, children }: {
  title: string;
  icon: React.ElementType;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Icon className="h-5 w-5 text-indigo-400" />
            <span>{title}</span>
          </h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-300 transition cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-indigo-500 transition";
const btnPrimary = "px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
const btnDanger = "px-4 py-2 bg-red-600/90 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50";
const btnSecondary = "px-4 py-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 rounded-lg text-xs font-semibold transition cursor-pointer";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// ─── Users Tab ───────────────────────────────────────────────────────────────

function UsersTab({ initialUsers, onRefresh }: { initialUsers: UserItem[]; onRefresh: () => void }) {
  const [users, setUsers] = React.useState(initialUsers);
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [creating, setCreating] = React.useState(false);
  const [editing, setEditing] = React.useState<UserItem | null>(null);
  const [deleting, setDeleting] = React.useState<UserItem | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Form state
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", role: "TEACHER" as "TEACHER" | "STUDENT", password: "" });

  React.useEffect(() => { setUsers(initialUsers); }, [initialUsers]);

  const filtered = React.useMemo(() =>
    users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      return matchSearch && matchRole;
    }),
    [users, search, roleFilter]
  );

  const openCreate = () => {
    setForm({ name: "", email: "", phone: "", role: "TEACHER", password: "" });
    setCreating(true);
  };

  const openEdit = (u: UserItem) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, phone: u.phone || "", role: u.role as any, password: "" });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createUserByAdmin(form);
    setLoading(false);
    if (res.success) {
      setCreating(false);
      onRefresh();
    } else {
      alert(res.error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setLoading(true);
    const res = await updateUserByAdmin(editing.id, { name: form.name, email: form.email, phone: form.phone });
    setLoading(false);
    if (res.success) {
      setEditing(null);
      onRefresh();
    } else {
      alert(res.error);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setLoading(true);
    const res = await deleteUserByAdmin(deleting.id);
    setLoading(false);
    if (res.success) {
      setDeleting(null);
      onRefresh();
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="TEACHER">Teachers</option>
            <option value="STUDENT">Students</option>
          </select>
        </div>
        <button onClick={openCreate} className={btnPrimary}>
          <UserPlus className="h-4 w-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Users", value: users.length, color: "text-indigo-400" },
          { label: "Teachers", value: users.filter(u => u.role === "TEACHER").length, color: "text-amber-400" },
          { label: "Students", value: users.filter(u => u.role === "STUDENT").length, color: "text-emerald-400" },
        ].map(s => (
          <div key={s.label} className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-4">
            <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">{s.label}</div>
            <div className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* User List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
            No users found.
          </div>
        ) : filtered.map(u => (
          <div key={u.id} className="flex items-center justify-between gap-4 bg-neutral-900/30 border border-neutral-800 rounded-xl px-4 py-3 hover:border-neutral-700 transition">
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                u.role === "TEACHER" ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"
              )}>
                {u.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-white truncate">{u.name}</div>
                <div className="text-xs text-neutral-500 truncate">{u.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                u.role === "TEACHER"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              )}>
                {u.role}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-neutral-200 transition cursor-pointer outline-none">
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs">
                  <DropdownMenuItem onClick={() => openEdit(u)} className="cursor-pointer hover:bg-neutral-800 gap-2">
                    <Pencil className="h-3.5 w-3.5" /> Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-neutral-800" />
                  <DropdownMenuItem onClick={() => setDeleting(u)} className="text-red-400 cursor-pointer hover:bg-red-500/10 gap-2">
                    <Trash2 className="h-3.5 w-3.5" /> Delete User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {creating && (
        <Modal title="Add New User" icon={UserPlus} onClose={() => setCreating(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Full Name">
                <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" required />
              </FormField>
              <FormField label="Role">
                <select className={inputCls} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as any }))}>
                  <option value="TEACHER">Teacher</option>
                  <option value="STUDENT">Student</option>
                </select>
              </FormField>
            </div>
            <FormField label="Email Address">
              <input className={inputCls} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@example.com" required />
            </FormField>
            <FormField label="Phone Number">
              <input className={inputCls} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 99999 99999" />
            </FormField>
            <FormField label="Set Password">
              <input className={inputCls} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" required minLength={6} />
            </FormField>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className={`${btnPrimary} flex-1 justify-center`}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus className="h-4 w-4" /><span>Create User</span></>}
              </button>
              <button type="button" onClick={() => setCreating(false)} className={`${btnSecondary} flex-1`}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {editing && (
        <Modal title="Edit User" icon={Pencil} onClose={() => setEditing(null)}>
          <form onSubmit={handleUpdate} className="space-y-4">
            <FormField label="Full Name">
              <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </FormField>
            <FormField label="Email Address">
              <input className={inputCls} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </FormField>
            <FormField label="Phone Number">
              <input className={inputCls} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </FormField>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className={`${btnPrimary} flex-1 justify-center`}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4" /><span>Save Changes</span></>}
              </button>
              <button type="button" onClick={() => setEditing(null)} className={`${btnSecondary} flex-1`}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleting && (
        <Modal title="Confirm Delete" icon={AlertTriangle} onClose={() => setDeleting(null)}>
          <div className="space-y-4">
            <p className="text-sm text-neutral-400">
              Are you sure you want to delete <strong className="text-white">{deleting.name}</strong>? This will permanently remove their account and all associated records.
            </p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={loading} className={`${btnDanger} flex-1 justify-center`}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="h-4 w-4" /><span>Delete Permanently</span></>}
              </button>
              <button onClick={() => setDeleting(null)} className={`${btnSecondary} flex-1`}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Batches Tab ─────────────────────────────────────────────────────────────

function BatchesTab({ initialBatches, courses, teachers, onRefresh }: {
  initialBatches: BatchItem[];
  courses: { id: string; name: string }[];
  teachers: { id: string; name: string }[];
  onRefresh: () => void;
}) {
  const [batches, setBatches] = React.useState(initialBatches);
  const [creating, setCreating] = React.useState(false);
  const [editing, setEditing] = React.useState<BatchItem | null>(null);
  const [deleting, setDeleting] = React.useState<BatchItem | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", courseId: "", teacherId: "", daysOfWeek: [] as string[], startTime: "", endTime: "", roomNumber: "", maxCapacity: "30" });

  React.useEffect(() => { setBatches(initialBatches); }, [initialBatches]);

  const openCreate = () => {
    setForm({ name: "", courseId: courses[0]?.id || "", teacherId: teachers[0]?.id || "", daysOfWeek: [], startTime: "09:00", endTime: "10:30", roomNumber: "", maxCapacity: "30" });
    setCreating(true);
  };

  const openEdit = (b: BatchItem) => {
    setEditing(b);
    setForm({ name: b.name, courseId: b.courseId, teacherId: b.teacherId || "", daysOfWeek: b.daysOfWeek, startTime: b.startTime, endTime: b.endTime, roomNumber: b.roomNumber, maxCapacity: b.maxCapacity.toString() });
  };

  const toggleDay = (day: string) => {
    setForm(f => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(day)
        ? f.daysOfWeek.filter(d => d !== day)
        : [...f.daysOfWeek, day]
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.daysOfWeek.length === 0) { alert("Select at least one day."); return; }
    setLoading(true);
    const res = await createBatch({ name: form.name, courseId: form.courseId, teacherId: form.teacherId || "", daysOfWeek: form.daysOfWeek, startTime: form.startTime, endTime: form.endTime, roomNumber: form.roomNumber });
    setLoading(false);
    if (res.success) { setCreating(false); onRefresh(); }
    else alert(res.error);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (form.daysOfWeek.length === 0) { alert("Select at least one day."); return; }
    setLoading(true);
    const res = await updateBatchByAdmin(editing.id, {
      name: form.name, teacherId: form.teacherId || null, daysOfWeek: form.daysOfWeek,
      startTime: form.startTime, endTime: form.endTime, roomNumber: form.roomNumber,
      maxCapacity: parseInt(form.maxCapacity) || 30,
    });
    setLoading(false);
    if (res.success) { setEditing(null); onRefresh(); }
    else alert(res.error);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setLoading(true);
    const res = await deleteBatchByAdmin(deleting.id);
    setLoading(false);
    if (res.success) { setDeleting(null); onRefresh(); }
    else alert(res.error);
  };

  const BatchForm = ({ onSubmit, submitLabel }: { onSubmit: (e: React.FormEvent) => void; submitLabel: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Batch Name">
          <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Class 12 Physics A" required />
        </FormField>
        <FormField label="Course">
          <select className={inputCls} value={form.courseId} onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))} required>
            <option value="">Select course...</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </FormField>
      </div>
      <FormField label="Assigned Teacher">
        <select className={inputCls} value={form.teacherId} onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))}>
          <option value="">No teacher assigned</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </FormField>
      <FormField label="Days of Week">
        <div className="flex flex-wrap gap-1.5">
          {DAYS.map(day => (
            <button
              key={day} type="button" onClick={() => toggleDay(day)}
              className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer",
                form.daysOfWeek.includes(day)
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-indigo-500")}
            >
              {day}
            </button>
          ))}
        </div>
      </FormField>
      <div className="grid grid-cols-3 gap-3">
        <FormField label="Start Time">
          <input className={inputCls} type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} required />
        </FormField>
        <FormField label="End Time">
          <input className={inputCls} type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} required />
        </FormField>
        <FormField label="Max Capacity">
          <input className={inputCls} type="number" value={form.maxCapacity} onChange={e => setForm(f => ({ ...f, maxCapacity: e.target.value }))} min="1" max="200" required />
        </FormField>
      </div>
      <FormField label="Room Number">
        <input className={inputCls} value={form.roomNumber} onChange={e => setForm(f => ({ ...f, roomNumber: e.target.value }))} placeholder="e.g. Room 101" required />
      </FormField>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className={`${btnPrimary} flex-1 justify-center`}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4" /><span>{submitLabel}</span></>}
        </button>
        <button type="button" onClick={() => { setCreating(false); setEditing(null); }} className={`${btnSecondary} flex-1`}>Cancel</button>
      </div>
    </form>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-neutral-400">{batches.length} batch{batches.length !== 1 ? "es" : ""} configured</div>
        <button onClick={openCreate} className={btnPrimary}>
          <Plus className="h-4 w-4" /><span>New Batch</span>
        </button>
      </div>

      <div className="space-y-2">
        {batches.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">No batches found.</div>
        ) : batches.map(b => (
          <div key={b.id} className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="font-semibold text-white text-sm">{b.name}</div>
                <div className="text-xs text-neutral-500">{b.courseName} · {b.teacherName || "No teacher"}</div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {b.daysOfWeek.map(d => (
                    <span key={d} className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">{d}</span>
                  ))}
                  <span className="text-[10px] text-neutral-500 flex items-center gap-1 ml-1">
                    <Clock className="h-3 w-3" /> {b.startTime}–{b.endTime}
                  </span>
                  <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> {b.roomNumber}
                  </span>
                  <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                    <Hash className="h-3 w-3" /> Cap: {b.maxCapacity}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(b)} className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-indigo-400 transition cursor-pointer">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => setDeleting(b)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-neutral-400 hover:text-red-400 transition cursor-pointer">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {creating && <Modal title="Create New Batch" icon={BookOpen} onClose={() => setCreating(false)}><BatchForm onSubmit={handleCreate} submitLabel="Create Batch" /></Modal>}
      {editing && <Modal title="Edit Batch" icon={Pencil} onClose={() => setEditing(null)}><BatchForm onSubmit={handleUpdate} submitLabel="Save Changes" /></Modal>}
      {deleting && (
        <Modal title="Delete Batch" icon={AlertTriangle} onClose={() => setDeleting(null)}>
          <div className="space-y-4">
            <p className="text-sm text-neutral-400">Delete <strong className="text-white">{deleting.name}</strong>? Students in this batch will be unassigned.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={loading} className={`${btnDanger} flex-1 justify-center`}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="h-4 w-4" /><span>Delete Batch</span></>}
              </button>
              <button onClick={() => setDeleting(null)} className={`${btnSecondary} flex-1`}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Courses Tab ─────────────────────────────────────────────────────────────

function CoursesTab({ initialCourses, onRefresh }: { initialCourses: CourseItem[]; onRefresh: () => void }) {
  const [courses, setCourses] = React.useState(initialCourses);
  const [creating, setCreating] = React.useState(false);
  const [editing, setEditing] = React.useState<CourseItem | null>(null);
  const [deleting, setDeleting] = React.useState<CourseItem | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", description: "" });

  React.useEffect(() => { setCourses(initialCourses); }, [initialCourses]);

  const openCreate = () => { setForm({ name: "", description: "" }); setCreating(true); };
  const openEdit = (c: CourseItem) => { setEditing(c); setForm({ name: c.name, description: c.description || "" }); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createCourse(form.name, form.description);
    setLoading(false);
    if (res.success) { setCreating(false); onRefresh(); }
    else alert(res.error);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setLoading(true);
    const res = await updateCourseByAdmin(editing.id, { name: form.name, description: form.description });
    setLoading(false);
    if (res.success) { setEditing(null); onRefresh(); }
    else alert(res.error);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setLoading(true);
    const res = await deleteCourseByAdmin(deleting.id);
    setLoading(false);
    if (res.success) { setDeleting(null); onRefresh(); }
    else alert(res.error);
  };

  const CourseForm = ({ onSubmit, submitLabel }: { onSubmit: (e: React.FormEvent) => void; submitLabel: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField label="Course Name">
        <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. JEE Advanced Physics" required />
      </FormField>
      <FormField label="Description (Optional)">
        <textarea className={`${inputCls} resize-none`} rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of this course..." />
      </FormField>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className={`${btnPrimary} flex-1 justify-center`}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4" /><span>{submitLabel}</span></>}
        </button>
        <button type="button" onClick={() => { setCreating(false); setEditing(null); }} className={`${btnSecondary} flex-1`}>Cancel</button>
      </div>
    </form>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-neutral-400">{courses.length} course{courses.length !== 1 ? "s" : ""} available</div>
        <button onClick={openCreate} className={btnPrimary}>
          <Plus className="h-4 w-4" /><span>New Course</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {courses.length === 0 ? (
          <div className="text-center col-span-2 py-12 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">No courses found.</div>
        ) : courses.map(c => (
          <div key={c.id} className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 min-w-0">
                <div className="font-semibold text-white text-sm truncate">{c.name}</div>
                {c.description && <div className="text-xs text-neutral-500 line-clamp-2">{c.description}</div>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-indigo-400 transition cursor-pointer">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setDeleting(c)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-neutral-400 hover:text-red-400 transition cursor-pointer">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {creating && <Modal title="Create New Course" icon={GraduationCap} onClose={() => setCreating(false)}><CourseForm onSubmit={handleCreate} submitLabel="Create Course" /></Modal>}
      {editing && <Modal title="Edit Course" icon={Pencil} onClose={() => setEditing(null)}><CourseForm onSubmit={handleUpdate} submitLabel="Save Changes" /></Modal>}
      {deleting && (
        <Modal title="Delete Course" icon={AlertTriangle} onClose={() => setDeleting(null)}>
          <div className="space-y-4">
            <p className="text-sm text-neutral-400">Delete <strong className="text-white">{deleting.name}</strong>? All batches under this course will also be removed.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={loading} className={`${btnDanger} flex-1 justify-center`}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="h-4 w-4" /><span>Delete Course</span></>}
              </button>
              <button onClick={() => setDeleting(null)} className={`${btnSecondary} flex-1`}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Assignments Tab ─────────────────────────────────────────────────────────

function AssignmentsTab({ initialAssignments, batches, teachers, onRefresh }: {
  initialAssignments: AssignmentItem[];
  batches: { id: string; name: string; courseId: string }[];
  teachers: { id: string; name: string }[];
  onRefresh: () => void;
}) {
  const [assignments, setAssignments] = React.useState(initialAssignments);
  const [creating, setCreating] = React.useState(false);
  const [deleting, setDeleting] = React.useState<AssignmentItem | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({ title: "", description: "", batchId: "", teacherId: "", dueDate: "", maxMarks: "100" });

  React.useEffect(() => { setAssignments(initialAssignments); }, [initialAssignments]);

  const openCreate = () => {
    setForm({ title: "", description: "", batchId: batches[0]?.id || "", teacherId: teachers[0]?.id || "", dueDate: new Date().toISOString().split("T")[0], maxMarks: "100" });
    setCreating(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createAssignmentByAdmin({
      title: form.title,
      description: form.description,
      batchId: form.batchId,
      teacherId: form.teacherId,
      dueDate: form.dueDate,
      maxMarks: parseInt(form.maxMarks) || 100,
    });
    setLoading(false);
    if (res.success) { setCreating(false); onRefresh(); }
    else alert(res.error);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setLoading(true);
    const res = await deleteAssignmentByAdmin(deleting.id);
    setLoading(false);
    if (res.success) { setDeleting(null); onRefresh(); }
    else alert(res.error);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-neutral-400">{assignments.length} assignment{assignments.length !== 1 ? "s" : ""}</div>
        <button onClick={openCreate} className={btnPrimary}>
          <Plus className="h-4 w-4" /><span>Create Assignment</span>
        </button>
      </div>

      <div className="space-y-2">
        {assignments.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">No assignments found.</div>
        ) : assignments.map(a => (
          <div key={a.id} className="bg-neutral-900/30 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="font-semibold text-white text-sm">{a.title}</div>
                <div className="text-xs text-neutral-500">{a.batchName} · {a.teacherName}</div>
                {a.description && <div className="text-xs text-neutral-600 mt-1 line-clamp-1">{a.description}</div>}
                <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Due: {new Date(a.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {a.maxMarks} marks</span>
                </div>
              </div>
              <button onClick={() => setDeleting(a)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-neutral-400 hover:text-red-400 transition cursor-pointer shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {creating && (
        <Modal title="Create Assignment" icon={ClipboardList} onClose={() => setCreating(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <FormField label="Assignment Title">
              <input className={inputCls} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Kinematics Problem Set" required />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Assign to Batch">
                <select className={inputCls} value={form.batchId} onChange={e => setForm(f => ({ ...f, batchId: e.target.value }))} required>
                  <option value="">Select batch...</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </FormField>
              <FormField label="Assigned Teacher">
                <select className={inputCls} value={form.teacherId} onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))} required>
                  <option value="">Select teacher...</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Due Date">
                <input className={inputCls} type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} required />
              </FormField>
              <FormField label="Max Marks">
                <input className={inputCls} type="number" value={form.maxMarks} onChange={e => setForm(f => ({ ...f, maxMarks: e.target.value }))} min="1" required />
              </FormField>
            </div>
            <FormField label="Description (Optional)">
              <textarea className={`${inputCls} resize-none`} rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Instructions or notes for students..." />
            </FormField>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className={`${btnPrimary} flex-1 justify-center`}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /><span>Create Assignment</span></>}
              </button>
              <button type="button" onClick={() => setCreating(false)} className={`${btnSecondary} flex-1`}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <Modal title="Delete Assignment" icon={AlertTriangle} onClose={() => setDeleting(null)}>
          <div className="space-y-4">
            <p className="text-sm text-neutral-400">Delete assignment <strong className="text-white">{deleting.title}</strong>? All student submissions will also be removed.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={loading} className={`${btnDanger} flex-1 justify-center`}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="h-4 w-4" /><span>Delete Assignment</span></>}
              </button>
              <button onClick={() => setDeleting(null)} className={`${btnSecondary} flex-1`}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdminManageClient({
  initialUsers, initialBatches, initialCourses, initialAssignments,
  teachers, batches, courses,
}: AdminManageClientProps) {
  const router = useRouter();

  const refresh = () => router.refresh();

  return (
    <div className="space-y-6 text-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-500" />
            <span>Admin Control Panel</span>
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Full administrative control over users, batches, courses, and assignments.
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-neutral-900 border border-neutral-800 p-1 gap-1">
          <TabsTrigger value="users" className="text-xs gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-none">
            <Users className="h-3.5 w-3.5" /> Users ({initialUsers.length})
          </TabsTrigger>
          <TabsTrigger value="batches" className="text-xs gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-none">
            <BookOpen className="h-3.5 w-3.5" /> Batches ({initialBatches.length})
          </TabsTrigger>
          <TabsTrigger value="courses" className="text-xs gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-none">
            <GraduationCap className="h-3.5 w-3.5" /> Courses ({initialCourses.length})
          </TabsTrigger>
          <TabsTrigger value="assignments" className="text-xs gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-none">
            <ClipboardList className="h-3.5 w-3.5" /> Assignments ({initialAssignments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersTab initialUsers={initialUsers} onRefresh={refresh} />
        </TabsContent>
        <TabsContent value="batches">
          <BatchesTab initialBatches={initialBatches} courses={courses} teachers={teachers} onRefresh={refresh} />
        </TabsContent>
        <TabsContent value="courses">
          <CoursesTab initialCourses={initialCourses} onRefresh={refresh} />
        </TabsContent>
        <TabsContent value="assignments">
          <AssignmentsTab initialAssignments={initialAssignments} batches={batches} teachers={teachers} onRefresh={refresh} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

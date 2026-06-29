"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  getPendingRegistrations, 
  approveRegistration, 
  rejectRegistration, 
  getInstitutes,
  getBatchesForInstitute
} from "@/app/actions/registrations";
import { 
  UserCheck, 
  UserX, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldAlert, 
  Check, 
  X, 
  Building2, 
  ClipboardCheck, 
  AlertCircle,
  FileText
} from "lucide-react";

interface PendingRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  createdAt: Date;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface Institute {
  id: string;
  name: string;
}

export default function AdminRegistrationsPage() {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals / Actions states
  const [approvingItem, setApprovingItem] = useState<PendingRequest | null>(null);
  const [selectedInstId, setSelectedInstId] = useState<string>("");
  const [batches, setBatches] = useState<{ id: string; name: string }[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [loadingBatches, setLoadingBatches] = useState(false);

  const [rejectingItem, setRejectingItem] = useState<PendingRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");

  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [regRes, instRes] = await Promise.all([
        getPendingRegistrations(),
        getInstitutes()
      ]);

      if (regRes.success) {
        setRequests(regRes.data as PendingRequest[]);
      } else {
        setError(regRes.error || "Failed to load registrations.");
      }

      if (instRes.success) {
        setInstitutes(instRes.data);
        if (instRes.data.length > 0) {
          setSelectedInstId(instRes.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while fetching registrations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedInstId && approvingItem?.role === "STUDENT") {
      setLoadingBatches(true);
      getBatchesForInstitute(selectedInstId)
        .then((res) => {
          if (res.success) {
            setBatches(res.data || []);
            if (res.data && res.data.length > 0) {
              setSelectedBatchId(res.data[0].id);
            } else {
              setSelectedBatchId("");
            }
          }
        })
        .finally(() => {
          setLoadingBatches(false);
        });
    } else {
      setBatches([]);
      setSelectedBatchId("");
    }
  }, [selectedInstId, approvingItem]);

  const handleApproveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingItem) return;

    startTransition(async () => {
      const batchIdToAssign = approvingItem.role === "STUDENT" && selectedBatchId ? selectedBatchId : undefined;
      const res = await approveRegistration(approvingItem.id, selectedInstId, batchIdToAssign);
      if (res.success) {
        setApprovingItem(null);
        loadData();
      } else {
        alert(res.error || "Approval failed.");
      }
    });
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingItem) return;

    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }

    startTransition(async () => {
      const res = await rejectRegistration(rejectingItem.id, rejectionReason);
      if (res.success) {
        setRejectingItem(null);
        setRejectionReason("");
        loadData();
      } else {
        alert(res.error || "Rejection failed.");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-neutral-200">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-indigo-500" />
            <span>Pending Registrations</span>
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Review and approve student and teacher self-registration applications.
          </p>
        </div>

        {/* mini stats */}
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-neutral-900/60 border border-neutral-800 rounded-xl">
            <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">Total Pending</div>
            <div className="text-xl font-bold text-indigo-400 mt-0.5">{requests.length}</div>
          </div>
          <div className="px-4 py-2 bg-neutral-900/60 border border-neutral-800 rounded-xl">
            <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">Students</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {requests.filter(r => r.role === "STUDENT").length}
            </div>
          </div>
          <div className="px-4 py-2 bg-neutral-900/60 border border-neutral-800 rounded-xl">
            <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">Teachers</div>
            <div className="text-xl font-bold text-amber-400 mt-0.5">
              {requests.filter(r => r.role === "TEACHER").length}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <div className="h-8 w-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm text-neutral-400">Loading pending requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/20 border border-dashed border-neutral-800 rounded-2xl">
          <Check className="h-12 w-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">All Caught Up!</h3>
          <p className="text-sm text-neutral-400 mt-1 max-w-sm mx-auto">
            There are no pending registrations requiring review at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((req) => (
            <div 
              key={req.id} 
              className="bg-neutral-900/40 backdrop-blur-sm border border-neutral-800/80 rounded-xl p-5 hover:border-neutral-700 transition flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Profile Details */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-white text-base">{req.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    req.role === "TEACHER" 
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {req.role}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-neutral-500" />
                    <span>{req.email}</span>
                  </div>
                  {req.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-neutral-500" />
                      <span>{req.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                    <span>Requested: {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setApprovingItem(req)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-md shadow-indigo-600/5"
                >
                  <UserCheck className="h-4 w-4" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => setRejectingItem(req)}
                  className="px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-red-500/30 hover:bg-red-500/5 text-neutral-400 hover:text-red-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
                >
                  <UserX className="h-4 w-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* APPROVAL DIALOG (Assigned Institute) */}
      {approvingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-400" />
                <span>Assign Institute & Approve</span>
              </h3>
              <button 
                onClick={() => setApprovingItem(null)}
                className="text-neutral-500 hover:text-neutral-300 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleApproveSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Select Institute Tenant
                </label>
                <select
                  value={selectedInstId}
                  onChange={(e) => setSelectedInstId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-200 focus:outline-none focus:border-indigo-500"
                >
                  {institutes.map(inst => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>

              {approvingItem.role === "STUDENT" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                    Assign Batch
                  </label>
                  {loadingBatches ? (
                    <div className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-400">
                      Loading batches...
                    </div>
                  ) : batches.length > 0 ? (
                    <select
                      value={selectedBatchId}
                      onChange={(e) => setSelectedBatchId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-200 focus:outline-none focus:border-indigo-500"
                    >
                      {batches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-xs text-amber-400 bg-amber-950/20 border border-amber-900/30 p-3 rounded-lg leading-relaxed">
                      No batches found for this institute. You can still approve, and assign a batch later, or create a batch in Academic settings first.
                    </div>
                  )}
                </div>
              )}

              <div className="text-xs text-neutral-500 leading-relaxed bg-neutral-900/40 p-3 rounded-lg border border-neutral-900">
                Approving this request will provision the user in the selected institute. If the applicant is a student, their student record will be auto-generated{approvingItem.role === "STUDENT" ? " and assigned to the selected batch." : "."}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isPending ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Confirm Approval</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setApprovingItem(null)}
                  className="flex-1 py-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 rounded-lg text-xs font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECTION DIALOG (Reason Input) */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-400" />
                <span>Reject Registration</span>
              </h3>
              <button 
                onClick={() => setRejectingItem(null)}
                className="text-neutral-500 hover:text-neutral-300 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason (will be displayed to user on login page)..."
                  required
                  rows={4}
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isPending ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Confirm Rejection</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setRejectingItem(null)}
                  className="flex-1 py-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 rounded-lg text-xs font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

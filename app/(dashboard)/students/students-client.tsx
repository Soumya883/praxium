"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, MoreHorizontal, Loader2 } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { StudentDialog, EnrolledStudent } from "./student-dialog";
import { cn } from "@/lib/utils";
import { updateStudentStatusAction, deleteStudentAction } from "./actions";

interface StudentsClientProps {
  initialStudents: EnrolledStudent[];
  batches: { id: string; name: string }[];
}

export function StudentsClient({ initialStudents, batches }: StudentsClientProps) {
  const router = useRouter();
  const [students, setStudents] = React.useState<EnrolledStudent[]>(initialStudents);
  const [search, setSearch] = React.useState("");
  const [batchFilter, setBatchFilter] = React.useState("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  
  const pageSize = 6;

  // Keep state synced with server actions revalidation updates
  React.useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  // Filter students based on search query and batch filter
  const filteredStudents = React.useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) || 
                            student.email.toLowerCase().includes(search.toLowerCase());
      
      const matchesBatch = batchFilter === "all" || student.batch === batchFilter;
      
      return matchesSearch && matchesBatch;
    });
  }, [students, search, batchFilter]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, batchFilter]);

  // Paginated students calculations
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const handleAddStudent = (newStudent: EnrolledStudent) => {
    setStudents(prev => [newStudent, ...prev]);
  };

  const handleStatusChange = async (id: string, newStatus: "active" | "inactive") => {
    setLoadingId(id);
    const res = await updateStudentStatusAction(id, newStatus);
    if (res.success) {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } else {
      alert(res.message || "Failed to update status.");
    }
    setLoadingId(null);
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm("Are you sure you want to remove this student? All their invoices and attendance logs will be permanently deleted.")) {
      return;
    }
    setLoadingId(id);
    const res = await deleteStudentAction(id);
    if (res.success) {
      setStudents(prev => prev.filter(s => s.id !== id));
    } else {
      alert(res.message || "Failed to remove student.");
    }
    setLoadingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Students Directory</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage student enrollments, statuses, and batch assignments.
          </p>
        </div>
        <div className="shrink-0">
          <StudentDialog onAdd={handleAddStudent} dbBatches={batches} />
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9.5 text-xs bg-white dark:bg-neutral-950/40 border-neutral-200 dark:border-neutral-900 text-neutral-900 dark:text-neutral-100 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-800"
          />
        </div>

        {/* Batch Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <SlidersHorizontal className="h-4 w-4 text-neutral-400 dark:text-neutral-500 shrink-0" />
          <Select value={batchFilter} onValueChange={(val) => setBatchFilter(val || "all")}>
            <SelectTrigger className="w-full md:w-56 h-9.5 text-xs bg-white dark:bg-neutral-950/40 border-neutral-200 dark:border-neutral-900 text-neutral-800 dark:text-neutral-300">
              <SelectValue placeholder="Filter by batch" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 text-neutral-900 dark:text-neutral-200">
              <SelectItem value="all" className="text-xs cursor-pointer">All Batches</SelectItem>
              {batches.map((b) => (
                <SelectItem key={b.id} value={b.name} className="text-xs cursor-pointer">
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 backdrop-blur-sm overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-neutral-50 dark:bg-neutral-900/30 border-b border-neutral-200 dark:border-neutral-900">
            <TableRow className="hover:bg-transparent border-b border-neutral-200 dark:border-neutral-900">
              <TableHead className="w-[200px] text-xs font-semibold text-neutral-500 dark:text-neutral-400 py-3.5">Name</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 py-3.5">Email</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 py-3.5">Batch</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 py-3.5">Status</TableHead>
              <TableHead className="w-[80px] text-right py-3.5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedStudents.length > 0 ? (
              paginatedStudents.map((student) => (
                <TableRow 
                  key={student.id} 
                  className={cn(
                    "hover:bg-neutral-50/55 dark:hover:bg-neutral-900/10 border-b border-neutral-200 dark:border-neutral-900 transition-colors",
                    loadingId === student.id && "opacity-60 pointer-events-none"
                  )}
                >
                  <TableCell className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 py-3.5 flex items-center gap-2">
                    {loadingId === student.id && <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400" />}
                    <Link href={`/admin/students/${student.id}`} className="hover:underline text-indigo-650 dark:text-indigo-400 font-semibold">
                      {student.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-neutral-500 dark:text-neutral-400 py-3.5">
                    {student.email}
                  </TableCell>
                  <TableCell className="text-xs text-neutral-600 dark:text-neutral-300 py-3.5">
                    {student.batch || "Unassigned"}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                        student.status === "active"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20"
                      )}
                    >
                      {student.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-3.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer rounded-md flex items-center justify-center border border-transparent bg-transparent outline-none">
                        <MoreHorizontal className="h-4 w-4 text-neutral-400" />
                        <span className="sr-only">Open menu</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 text-neutral-900 dark:text-neutral-200 text-xs">
                        <DropdownMenuItem 
                          className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 focus:bg-neutral-100 dark:focus:bg-neutral-900"
                          onClick={() => router.push(`/admin/students/${student.id}`)}
                        >
                          Manage Profile & Batch
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-900" />
                        <DropdownMenuItem 
                          className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 focus:bg-neutral-100 dark:focus:bg-neutral-900"
                          onClick={() => handleStatusChange(student.id, student.status === "active" ? "inactive" : "active")}
                        >
                          Mark as {student.status === "active" ? "Inactive" : "Active"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-900" />
                        <DropdownMenuItem 
                          className="cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 focus:bg-red-50 dark:focus:bg-red-950/20"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          Remove Student
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-xs text-neutral-500 dark:text-neutral-400">
                  No students found matching filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination controls */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-neutral-50 dark:bg-neutral-900/10 border-t border-neutral-200 dark:border-neutral-900 text-xs text-neutral-500 dark:text-neutral-400">
          <div>
            Showing <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              {filteredStudents.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span> to <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              {Math.min(currentPage * pageSize, filteredStudents.length)}
            </span> of <span className="font-semibold text-neutral-700 dark:text-neutral-300">{filteredStudents.length}</span> students
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-neutral-200 dark:border-neutral-900 disabled:opacity-50 cursor-pointer bg-white dark:bg-neutral-950"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-[11px] font-medium px-2">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-neutral-200 dark:border-neutral-900 disabled:opacity-50 cursor-pointer bg-white dark:bg-neutral-950"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CreditCard, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  GraduationCap,
  Menu,
  X,
  ClipboardList,
  TrendingUp,
  Kanban,
  UserCheck,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserButton } from "@/components/auth-wrapper";
import Footer from "@/components/Footer";

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_");

const ALL_NAVIGATION = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN"] },
  { name: "Analytics", href: "/admin/analytics", icon: TrendingUp, roles: ["ADMIN"] },
  { name: "Admissions", href: "/admin/admissions", icon: Kanban, roles: ["ADMIN"] },
  { name: "Registrations", href: "/admin/registrations", icon: UserCheck, roles: ["ADMIN"] },
  { name: "Control Panel", href: "/admin/manage", icon: Shield, roles: ["ADMIN"] },
  { name: "Students", href: "/students", icon: Users, roles: ["ADMIN", "TEACHER"] },
  { name: "Batches", href: "/academic", icon: BookOpen, roles: ["ADMIN", "TEACHER"] },
  { name: "Finance", href: "/finance", icon: CreditCard, roles: ["ADMIN"] },
  { name: "Teacher Assignments", href: "/teacher/assignments", icon: ClipboardList, roles: ["ADMIN", "TEACHER"] },
  { name: "Student Portal", href: "/student-portal", icon: GraduationCap, roles: ["ADMIN", "STUDENT"] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["ADMIN", "TEACHER"] },
];

interface DashboardLayoutInnerProps {
  children: React.ReactNode;
  role: string;
}

function DashboardLayoutInner({ children, role }: DashboardLayoutInnerProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const filteredNavigation = React.useMemo(() => {
    return ALL_NAVIGATION.filter(item => item.roles.includes(role));
  }, [role]);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50">
      {/* Sidebar for Desktop */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-neutral-200 dark:border-neutral-900 bg-neutral-100/30 dark:bg-neutral-950/30 backdrop-blur-md transition-all duration-300 ease-in-out z-20 shrink-0",
          isCollapsed ? "w-[68px]" : "w-64"
        )}
      >
        {/* Logo and Brand */}
        <div className="h-16 flex items-center px-4 border-b border-neutral-200 dark:border-neutral-900">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-neutral-900 dark:text-neutral-100 w-full overflow-hidden">
            <div className="h-8 w-8 rounded-lg bg-neutral-950 dark:bg-neutral-50 text-neutral-50 dark:text-neutral-950 flex items-center justify-center shadow-sm shrink-0">
              <GraduationCap className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <span className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 truncate">
                Praxium
              </span>
            )}
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1 p-3">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative cursor-pointer",
                  isActive
                    ? "bg-neutral-200/60 dark:bg-neutral-900 text-neutral-950 dark:text-neutral-50 border border-neutral-300/30 dark:border-neutral-800"
                    : "text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50 hover:bg-neutral-100 dark:hover:bg-neutral-900/40 border border-transparent"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-neutral-950 dark:text-neutral-50" : "text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-50")} />
                {!isCollapsed && <span>{item.name}</span>}
                {isCollapsed && (
                  <span className="absolute left-14 scale-0 group-hover:scale-100 transition-all rounded bg-neutral-950 text-neutral-50 text-xs px-2.5 py-1 z-30 shadow-md border border-neutral-800 pointer-events-none whitespace-nowrap">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer (Collapse button) */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-900 flex justify-end">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400 cursor-pointer transition w-full flex items-center justify-center bg-transparent"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-neutral-200 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-950/50 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-900 text-neutral-500 dark:text-neutral-400 cursor-pointer bg-transparent"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-xs font-semibold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
              {ALL_NAVIGATION.find((n) => n.href === pathname || (n.href !== "/" && pathname.startsWith(n.href)))?.name || "Praxium"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-900" />
            <UserButton />
          </div>
        </header>

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-neutral-50 dark:bg-neutral-950">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            {children}
          </div>
          <Footer />
        </main>
      </div>

      {/* Mobile Drawer (Overlay and Menu) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-neutral-950/65 backdrop-blur-sm transition-opacity"
          />
          {/* Drawer Menu */}
          <div className="relative w-64 bg-neutral-100 dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-900 flex flex-col p-4 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-900 mb-4">
              <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                <div className="h-8 w-8 rounded-lg bg-neutral-950 dark:bg-neutral-50 text-neutral-50 dark:text-neutral-950 flex items-center justify-center shadow-md">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="text-base font-semibold">Praxium</span>
              </Link>
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-900 text-neutral-500 dark:text-neutral-400 cursor-pointer bg-transparent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                      isActive
                        ? "bg-neutral-200/60 dark:bg-neutral-900 text-neutral-950 dark:text-neutral-50 border border-neutral-300/30 dark:border-neutral-800"
                        : "text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50 hover:bg-neutral-100 dark:hover:bg-neutral-900/40"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardLayoutWithClerk({ children }: { children: React.ReactNode }) {
  const { isLoaded, user } = useUser();
  
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-950 text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  const role = (user?.publicMetadata?.role as string) || "STUDENT";
  return <DashboardLayoutInner role={role}>{children}</DashboardLayoutInner>;
}

function DashboardLayoutMock({ children }: { children: React.ReactNode }) {
  const [role, setRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    // 1. Try to read from real session cookie
    const sessionMatch = document.cookie.match(/(?:^|; )praxium_session=([^;]*)/);
    if (sessionMatch && sessionMatch[1]) {
      try {
        const raw = sessionMatch[1];
        const base64 = raw.replace(/-/g, "+").replace(/_/g, "/");
        const decoded = JSON.parse(window.atob(base64));
        if (decoded && decoded.exp > Date.now()) {
          setRole(decoded.role);
          return;
        }
      } catch (e) {
        // ignore
      }
    }

    // 2. Fall back to standard mock switcher cookie
    const match = document.cookie.match(/(?:^|; )praxium_mock_role=([^;]*)/);
    if (match && (match[1] === "ADMIN" || match[1] === "TEACHER" || match[1] === "STUDENT")) {
      setRole(match[1]);
      return;
    }

    // 3. No session or mock role cookie -> redirect to login page
    window.location.href = "/login";
  }, []);

  if (!role) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-950 text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  return <DashboardLayoutInner role={role}>{children}</DashboardLayoutInner>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (hasClerk) {
    return <DashboardLayoutWithClerk>{children}</DashboardLayoutWithClerk>;
  }
  return <DashboardLayoutMock>{children}</DashboardLayoutMock>;
}

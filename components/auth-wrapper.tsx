"use client";

import * as React from "react";
import { 
  useAuth, 
  UserButton as ClerkUserButton 
} from "@clerk/nextjs";
import { User, LogOut, Settings } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const hasClerk = typeof window !== "undefined" 
  ? (!!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("."))
  : false;

function ClerkSignedIn({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  if (!isSignedIn) return null;
  return <>{children}</>;
}

function ClerkSignedOut({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  if (isSignedIn) return null;
  return <>{children}</>;
}

export function SignedIn({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>{children}</>;

  if (hasClerk) {
    return <ClerkSignedIn>{children}</ClerkSignedIn>;
  }
  return <>{children}</>;
}

export function SignedOut({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (hasClerk) {
    return <ClerkSignedOut>{children}</ClerkSignedOut>;
  }
  return null; // Mock is always signed in
}

export function UserButton() {
  const [mounted, setMounted] = React.useState(false);
  const [currentRole, setCurrentRole] = React.useState<string>("ADMIN");
  const [displayName, setDisplayName] = React.useState<string>("Sushvine Admin");
  const [displayEmail, setDisplayEmail] = React.useState<string>("admin@praxium.edu");
  const [isRealUser, setIsRealUser] = React.useState<boolean>(false);

  React.useEffect(() => {
    setMounted(true);
    if (!hasClerk) {
      // 1. Try to read real session cookie first
      const sessionMatch = document.cookie.match(/(?:^|; )praxium_session=([^;]*)/);
      if (sessionMatch && sessionMatch[1]) {
        try {
          const raw = sessionMatch[1];
          // Base64URL decode
          const base64 = raw.replace(/-/g, "+").replace(/_/g, "/");
          const decoded = JSON.parse(window.atob(base64));
          if (decoded && decoded.exp > Date.now()) {
            setDisplayName(decoded.name || "User");
            setDisplayEmail(decoded.email || "");
            setCurrentRole(decoded.role || "STUDENT");
            setIsRealUser(true);
            return;
          }
        } catch (e) {
          console.error("Failed to parse session cookie", e);
        }
      }

      // 2. Fall back to standard mock switcher cookie
      const match = document.cookie.match(/(?:^|; )praxium_mock_role=([^;]*)/);
      if (match) {
        const mockRole = match[1];
        setCurrentRole(mockRole);
        if (mockRole === "TEACHER") {
          setDisplayName("Dr. Richard Feynman");
          setDisplayEmail("feynman@praxium.edu");
        } else if (mockRole === "STUDENT") {
          setDisplayName("Subhashree Dash");
          setDisplayEmail("subhashree@example.com");
        } else {
          setDisplayName("Sushvine Admin");
          setDisplayEmail("admin@praxium.edu");
        }
      }
    }
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-full border border-border bg-muted animate-pulse" />
    );
  }

  if (hasClerk) {
    return <ClerkUserButton />;
  }

  const handleSwitchRole = (role: string) => {
    // Clear session if we switch roles manually
    document.cookie = "praxium_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    document.cookie = `praxium_mock_role=${role}; path=/; max-age=31536000`;
    window.location.reload();
  };

  const handleLogout = () => {
    document.cookie = "praxium_mock_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    document.cookie = "praxium_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    window.location.href = "/login";
  };

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center justify-center outline-none cursor-pointer w-8 h-8 rounded-full border border-neutral-800 bg-neutral-900 text-xs font-semibold text-neutral-300 hover:border-neutral-700 transition">
        {initials}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 bg-neutral-950/80 backdrop-blur-md border border-neutral-900 text-neutral-200">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-neutral-100">{displayName}</p>
            <p className="text-xs leading-none text-neutral-400">{displayEmail}</p>
            <p className="text-[10px] text-indigo-400 font-semibold mt-1">Role: {currentRole}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-neutral-900" />
        
        {/* Role Switcher options */}
        <DropdownMenuLabel className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-2 py-1">
          Switch Sandbox Account
        </DropdownMenuLabel>
        <DropdownMenuItem 
          onClick={() => handleSwitchRole("ADMIN")}
          className="cursor-pointer text-xs flex items-center justify-between text-neutral-300 hover:text-neutral-100 focus:bg-neutral-900"
        >
          <span>Act as Administrator</span>
          {currentRole === "ADMIN" && <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-bold">Active</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleSwitchRole("TEACHER")}
          className="cursor-pointer text-xs flex items-center justify-between text-neutral-300 hover:text-neutral-100 focus:bg-neutral-900"
        >
          <span>Act as Teacher (Feynman)</span>
          {currentRole === "TEACHER" && <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-bold">Active</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleSwitchRole("STUDENT")}
          className="cursor-pointer text-xs flex items-center justify-between text-neutral-300 hover:text-neutral-100 focus:bg-neutral-900"
        >
          <span>Act as Student (Subhashree)</span>
          {currentRole === "STUDENT" && <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-bold">Active</span>}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-neutral-900" />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer text-xs text-red-400 hover:text-red-300 focus:bg-neutral-900 focus:text-red-300 flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

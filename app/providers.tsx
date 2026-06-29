"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";

export function Providers({ children }: { children: React.ReactNode }) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  console.log("[Providers] NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:", clerkKey ? `defined (starts with: ${clerkKey.substring(0, 10)})` : "undefined");
  const hasClerk = !!clerkKey && clerkKey.startsWith("pk_");

  if (hasClerk) {
    return (
      <ClerkProvider publishableKey={clerkKey}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </ClerkProvider>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}

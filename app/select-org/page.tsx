"use client";

import * as React from "react";
import { OrganizationList, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { GraduationCap, ArrowRight, Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_");

function ClerkSelectOrgContainer() {
  const router = useRouter();
  const { orgId } = useAuth();

  React.useEffect(() => {
    if (orgId) {
      router.push("/dashboard");
    }
  }, [orgId, router]);

  return (
    <div className="clerk-org-list-container w-full flex justify-center">
      <OrganizationList
        afterCreateOrganizationUrl="/dashboard"
        afterSelectOrganizationUrl="/dashboard"
        appearance={{
          variables: {
            colorPrimary: "#6366f1",
            colorBackground: "#0a0a0c",
          },
          elements: {
            rootBox: "w-full",
            organizationListPreviewContainer: "border border-neutral-800 bg-neutral-950 rounded-xl p-3",
            organizationSwitcherTrigger: "text-white bg-neutral-800",
          }
        }}
      />
    </div>
  );
}

export default function SelectOrgPage() {
  const router = useRouter();

  const handleBypass = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Decorative background grid and gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0f13_1px,transparent_1px),linear-gradient(to_bottom,#0f0f13_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-900/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-md space-y-8 flex flex-col items-center">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white text-neutral-950 flex items-center justify-center shadow-lg shadow-white/5 shrink-0">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            Praxium B2B
          </span>
        </div>

        <div className="w-full text-center space-y-2">
          <h2 className="text-xl font-bold tracking-tight">Select Your Coaching Institute</h2>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-sm mx-auto">
            Choose an active institute workspace to manage classes, attendance registers, and tuition ledgers.
          </p>
        </div>

        {/* Dynamic selector UI or mock UI */}
        <div className="w-full bg-neutral-900/40 border border-neutral-900 rounded-2xl p-6 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center min-h-[300px]">
          {hasClerk ? (
            <ClerkSelectOrgContainer />
          ) : (
            <div className="w-full text-center space-y-6">
              <div className="flex flex-col items-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-indigo-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold">Local Sandbox Sandbox</h3>
                  <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                    Clerk auth bypass is active. A default multi-tenant institute workspace is auto-provisioned.
                  </p>
                </div>
              </div>

              {/* Demo Cohorts Preview */}
              <div className="text-left bg-neutral-950/50 border border-neutral-900 rounded-xl p-4.5 space-y-3">
                <div className="flex items-center gap-2 text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Provisioned Tenant</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold">Sharma Physics Academy</h4>
                  <p className="text-[10px] text-neutral-500">Org ID: mock_org_123 (Default Demo Workspace)</p>
                </div>
              </div>

              <Button
                onClick={handleBypass}
                className="w-full bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-xs h-10 cursor-pointer flex items-center justify-center gap-1.5 rounded-xl shadow-md transition-all"
              >
                <span>Launch Sharma Physics Portal</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-neutral-600">
          Praxium ERP Platform &copy; 2026. All rights reserved.
        </div>
      </div>
    </div>
  );
}

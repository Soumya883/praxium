import Link from "next/link";
import { 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  Calendar, 
  Bell, 
  ShieldAlert, 
  CreditCard, 
  Users, 
  Layers, 
  Sparkles,
  Zap,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Praxium ERP — Premium Educational Management Platform",
  description: "The next-generation CRM, fee tracking, conflict-free scheduling, and parent communication portal for coaching centers.",
};

export default function MarketingLandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-neutral-800 selection:text-white overflow-x-hidden">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[130px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto h-20 px-6 flex items-center justify-between border-b border-neutral-900 bg-neutral-950/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-neutral-50 text-neutral-950 flex items-center justify-center shadow-lg">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Praxium
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#about" className="hover:text-white transition-colors">Why Praxium</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button className="h-10 px-5 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 text-xs font-semibold gap-2 cursor-pointer shadow-md transition-all">
              <span>Go to App</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-20 pb-16 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-300">
          <Sparkles className="h-3.5 w-3.5 text-yellow-500 animate-pulse" />
          <span>Next-Generation ERP for Coaching Academies</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Manage your academy. <br />
          <span className="bg-gradient-to-r from-neutral-100 via-neutral-300 to-neutral-500 bg-clip-text text-transparent">
            Automate with logic.
          </span>
        </h1>

        <p className="text-neutral-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          The ultimate platform for coaching institutes. Elevate class scheduling, student enrollment, fee collection, and automated parent communication in one modern workflow.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4">
          <Link href="/dashboard">
            <Button className="h-12 px-8 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 text-sm font-semibold gap-2 cursor-pointer shadow-lg transition-all transform hover:scale-[1.02]">
              <span>Launch Demo Sandbox</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </Button>
          </Link>
          <a href="#features">
            <Button variant="outline" className="h-12 px-8 rounded-xl border-neutral-800 hover:bg-neutral-900/50 hover:text-white text-sm font-semibold cursor-pointer transition-all">
              Explore Features
            </Button>
          </a>
        </div>

        {/* Dashboard Preview / Mock Screenshot */}
        <div className="pt-10 max-w-5xl mx-auto">
          <div className="relative rounded-2xl border border-neutral-800 bg-neutral-950/80 backdrop-blur p-2.5 shadow-[0_0_50px_rgba(255,255,255,0.02)] transition-all hover:border-neutral-700">
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent z-10 pointer-events-none rounded-2xl" />
            <div className="rounded-xl overflow-hidden border border-neutral-900 bg-neutral-900/30 aspect-[16/10] flex flex-col">
              
              {/* Fake Window Header */}
              <div className="h-9 bg-neutral-900/60 border-b border-neutral-900/90 flex items-center px-4 justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
                  <div className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
                  <div className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
                </div>
                <span className="text-[10px] text-neutral-500 font-mono tracking-tight">praxium.edu/dashboard</span>
                <div className="w-10" />
              </div>

              {/* Fake Dashboard Content */}
              <div className="flex-1 p-5 grid grid-cols-3 gap-4 text-left font-sans">
                {/* Metric cards */}
                <div className="col-span-3 grid grid-cols-3 gap-3">
                  {[
                    { label: "Active Cohorts", val: "36 batches", desc: "4 commencing this week", color: "border-blue-500/10 text-blue-400" },
                    { label: "Total Students", val: "1,280 profiles", desc: "+12% monthly growth", color: "border-emerald-500/10 text-emerald-400" },
                    { label: "Fee Realization Rate", val: "94.2%", desc: "INR 3,85,000 this month", color: "border-purple-500/10 text-purple-400" },
                  ].map((x, idx) => (
                    <div key={idx} className="p-3 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-1">
                      <span className="text-[10px] text-neutral-500 uppercase tracking-widest">{x.label}</span>
                      <div className="text-sm font-bold text-white">{x.val}</div>
                      <p className="text-[9px] text-neutral-400">{x.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Left panel */}
                <div className="col-span-2 bg-neutral-900/20 border border-neutral-900/80 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
                    <span className="text-xs font-semibold text-white">Daily Attendance tracker</span>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Class 12 - Physics</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: "Subhashree Dash", status: "Present", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                      { name: "Arpan Mohanty", status: "Present", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
                      { name: "Debasish Patnaik", status: "Absent", badge: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
                    ].map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px] p-1.5 bg-neutral-900/30 rounded border border-neutral-800/40">
                        <span className="text-neutral-300">{s.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${s.badge}`}>{s.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right panel */}
                <div className="bg-neutral-900/20 border border-neutral-900/80 rounded-xl p-4 space-y-3">
                  <span className="text-xs font-semibold text-white block">Recent Activity Log</span>
                  <div className="space-y-2.5">
                    {[
                      { title: "Attendance Warning Sent", desc: "Parent of Debasish notified", time: "12m ago" },
                      { title: "Fee Receipt Generated", desc: "REC-A8F2K9 for Subhashree", time: "1h ago" },
                      { title: "Batch Conflict Resolved", desc: "Room 101 rescheduled", time: "3h ago" },
                    ].map((a, idx) => (
                      <div key={idx} className="text-[10px] space-y-0.5">
                        <div className="font-medium text-neutral-300 flex justify-between">
                          <span>{a.title}</span>
                          <span className="text-neutral-500 text-[8px]">{a.time}</span>
                        </div>
                        <p className="text-neutral-500 leading-tight">{a.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 border-t border-neutral-900 space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Smarter school management.
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base">
            Everything your administrative team, teaching staff, and students need to run classes at peak efficiency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="p-8 rounded-2xl border border-neutral-900 bg-neutral-900/10 hover:bg-neutral-900/20 hover:border-neutral-800 transition duration-300 space-y-4">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Conflict-Free Scheduling</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Never double-book a classroom or a teacher again. Our scheduler checks constraints in real-time, checking days of the week, timing overlaps, and physical capacities.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl border border-neutral-900 bg-neutral-900/10 hover:bg-neutral-900/20 hover:border-neutral-800 transition duration-300 space-y-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Bell className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Automated Parent Alerts</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Keep parents updated in real-time. Instantly dispatch warnings for student absence or low attendance via integration, featuring customizable rate-limiting protection.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl border border-neutral-900 bg-neutral-900/10 hover:bg-neutral-900/20 hover:border-neutral-800 transition duration-300 space-y-4">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Streamlined Invoicing</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Track outstanding fees, issue pending invoices, and receive settled payments. Generates distinct receipts automatically and tracks payment methods in a secure audit log.
            </p>
          </div>

        </div>
      </section>

      {/* Feature Deep Dive (The "Logic") */}
      <section id="about" className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 border-t border-neutral-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Zap className="h-4 w-4" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Designed for the operations of modern educational hubs.
            </h2>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Traditional ERP tools are bloated, complex, and slow. Praxium is built with absolute clarity: focus on batches, attendance, and finances.
            </p>
            <div className="space-y-4 text-xs font-semibold text-neutral-300">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>Zero-Configuration database fallbacks for sandbox evaluations</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>Modern RBAC (Role-Based Access Control) using secure metadata</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>Responsive layout adapts perfectly to mobile, tablet, and desktops</span>
              </div>
            </div>
          </div>
          
          <div className="p-8 rounded-2xl border border-neutral-900 bg-neutral-900/20 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-900">
              <ShieldAlert className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-semibold text-white">How our Smart Alerts work</span>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Step 1: Check Attendance</span>
                <p className="text-xs text-neutral-300">Teacher logs daily student status. If a student is absent, it computes the historical check-in ratio instantly.</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Step 2: Rate Limit & Validate</span>
                <p className="text-xs text-neutral-300">The system queries communication logs to prevent spam, ensuring parents receive warnings at most once every 7 days.</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Step 3: Immediate Notification</span>
                <p className="text-xs text-neutral-300">Generates custom emails outlining student name, current course attendance metrics, and a direct review link.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 border-t border-neutral-900 space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Simple transparent pricing</span>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Choose a plan for your academy.
          </h2>
          <p className="text-neutral-400 text-sm">
            Unlock professional management controls. Free trial included on all plans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Plan 1 */}
          <div className="p-8 rounded-2xl border border-neutral-900 bg-neutral-900/10 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Starter</span>
              <div className="flex items-baseline gap-1 text-white">
                <span className="text-3xl font-bold">₹</span>
                <span className="text-5xl font-extrabold tracking-tight">1,999</span>
                <span className="text-neutral-500 text-xs font-medium">/month</span>
              </div>
              <p className="text-neutral-400 text-xs">For independent centers managing up to 100 students.</p>
              <div className="h-px bg-neutral-900" />
              <ul className="space-y-2.5 text-xs text-neutral-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Up to 100 Students</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>10 Active Batches</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Standard attendance logs</span>
                </li>
              </ul>
            </div>
            <Link href="/dashboard">
              <Button className="w-full h-10 mt-6 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold border border-neutral-800 cursor-pointer">
                Start Trial
              </Button>
            </Link>
          </div>

          {/* Plan 2 */}
          <div className="p-8 rounded-2xl border-2 border-white bg-neutral-900/30 space-y-6 flex flex-col justify-between relative">
            <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-white text-neutral-950 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <div className="space-y-4">
              <span className="text-xs font-semibold text-white uppercase tracking-widest flex items-center gap-2">
                <span>Growth</span>
                <Zap className="h-3 w-3 text-yellow-500" />
              </span>
              <div className="flex items-baseline gap-1 text-white">
                <span className="text-3xl font-bold">₹</span>
                <span className="text-5xl font-extrabold tracking-tight">4,999</span>
                <span className="text-neutral-500 text-xs font-medium">/month</span>
              </div>
              <p className="text-neutral-400 text-xs">Ideal for scaling centers managing up to 500 students.</p>
              <div className="h-px bg-neutral-900" />
              <ul className="space-y-2.5 text-xs text-neutral-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Up to 500 Students</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Unlimited Batches</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Automated Parent Warning Emails</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Outstanding fee invoice exports</span>
                </li>
              </ul>
            </div>
            <Link href="/dashboard">
              <Button className="w-full h-10 mt-6 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-semibold cursor-pointer">
                Start Trial
              </Button>
            </Link>
          </div>

          {/* Plan 3 */}
          <div className="p-8 rounded-2xl border border-neutral-900 bg-neutral-900/10 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Enterprise</span>
              <div className="flex items-baseline gap-1 text-white">
                <span className="text-3xl font-bold">₹</span>
                <span className="text-5xl font-extrabold tracking-tight">9,999</span>
                <span className="text-neutral-500 text-xs font-medium">/month</span>
              </div>
              <p className="text-neutral-400 text-xs">For multi-branch centers requiring custom controls.</p>
              <div className="h-px bg-neutral-900" />
              <ul className="space-y-2.5 text-xs text-neutral-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Unlimited Students</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Multi-branch management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Dedicated custom domain</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Priority 24/7 support</span>
                </li>
              </ul>
            </div>
            <Link href="/dashboard">
              <Button className="w-full h-10 mt-6 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold border border-neutral-800 cursor-pointer">
                Contact Sales
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-neutral-900 bg-neutral-950 py-8 text-center text-xs text-neutral-500 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-neutral-400">
            <GraduationCap className="h-4.5 w-4.5" />
            <span>Praxium ERP</span>
          </div>
          <span>© {new Date().getFullYear()} Praxium Inc. All rights reserved.</span>
        </div>
      </footer>

    </div>
  );
}

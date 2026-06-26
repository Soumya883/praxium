"use client";

import * as React from "react";
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from "recharts";
import { MessageSquare, Check, Loader2 } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------
// Component 1: Outstanding Fees Card with interactive SMS/WA trigger
// ---------------------------------------------------------
export function OutstandingFeesCard({ amount }: { amount: number }) {
  const [isSendingWhatsApp, setIsSendingWhatsApp] = React.useState(false);
  const [sentSuccess, setSentSuccess] = React.useState(false);

  const handleSendWhatsApp = () => {
    setIsSendingWhatsApp(true);
    setTimeout(() => {
      setIsSendingWhatsApp(false);
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
      }, 5000);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {sentSuccess && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-xl bg-emerald-500 text-white text-sm font-semibold shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-4 duration-300">
          <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Check className="h-4 w-4 text-white" />
          </div>
          <span>
            WhatsApp fee reminders dispatched to guardians!
          </span>
        </div>
      )}

      <Card className="bg-white dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 shadow-md ring-2 ring-rose-500/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Outstanding Fees
          </CardTitle>
          <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400">
              {formatINR(amount)}
            </div>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
              Uncollected balance across students
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleSendWhatsApp}
            disabled={isSendingWhatsApp || amount === 0}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-rose-950/20 active:scale-[0.98] transition-transform"
          >
            {isSendingWhatsApp ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Dispatching...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4" />
                Remind Parents
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------
// Component 2: Main Profitability Trend Chart
// ---------------------------------------------------------
export function RevenueChartClient({
  data
}: {
  data: Array<{ month: string; revenue: number; expenses: number }>
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[350px] w-full animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-xl" />;
  }

  const formatTooltipValue = (value: any) => formatINR(Number(value));

  return (
    <Card className="bg-white dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 shadow-md p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white">Profitability Trend</CardTitle>
        <CardDescription className="text-xs text-neutral-500">
          Comparison of settled fee revenues vs. payroll expenses over the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pt-4 h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.15} vertical={false} />
            <XAxis 
              dataKey="month" 
              stroke="#666" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              stroke="#666" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip 
              formatter={formatTooltipValue}
              contentStyle={{
                backgroundColor: "#18181b",
                borderColor: "#27272a",
                borderRadius: "8px",
                color: "#f4f4f5",
                fontSize: "12px"
              }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Area 
              type="monotone" 
              name="Fee Revenue" 
              dataKey="revenue" 
              fill="url(#colorRevenue)" 
              stroke="#10b981" 
              strokeWidth={2.5}
            />
            <Line 
              type="monotone" 
              name="Payroll Expenses" 
              dataKey="expenses" 
              stroke="#f43f5e" 
              strokeWidth={2.5}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------
// Component 3: Fee Collection Donut PieChart
// ---------------------------------------------------------
export function FeeCollectionRatioClient({
  revenue,
  pending
}: {
  revenue: number;
  pending: number;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[250px] w-full animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-xl" />;
  }

  const pieData = [
    { name: "Paid Fees", value: revenue, color: "#10b981" },
    { name: "Pending Fees", value: pending, color: "#f43f5e" }
  ];

  const formatTooltipValue = (value: any) => formatINR(Number(value));

  return (
    <Card className="bg-white dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 shadow-md p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white">Fee Collection Ratio</CardTitle>
        <CardDescription className="text-xs text-neutral-500">
          Overview of collected vs outstanding fee amounts across the entire institute
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pt-4 flex flex-col items-center justify-center">
        <div className="h-[250px] w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={formatTooltipValue}
                contentStyle={{
                  backgroundColor: "#18181b",
                  borderColor: "#27272a",
                  borderRadius: "8px",
                  color: "#f4f4f5",
                  fontSize: "12px"
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-xs text-neutral-400">Total Pipeline</span>
            <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {formatINR(revenue + pending)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------
// Component 4: Academic Health BarChart
// ---------------------------------------------------------
export function AcademicHealthClient({
  data
}: {
  data: Array<{ batchId: string; batchName: string; avgScore: number }>
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[250px] w-full animate-pulse bg-neutral-100 dark:bg-neutral-900 rounded-xl" />;
  }

  return (
    <Card className="bg-white dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 shadow-md p-6">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white">Academic Health</CardTitle>
        <CardDescription className="text-xs text-neutral-500">
          Average mock test marks per batch to identify underperforming classes instantly
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pt-4 h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.15} vertical={false} />
            <XAxis 
              dataKey="batchName" 
              stroke="#666" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => value.split(" — ")[1] || value}
            />
            <YAxis 
              stroke="#666" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              domain={[0, 20]}
            />
            <Tooltip 
              formatter={(value) => [`${value} Marks`, "Batch Average"]}
              contentStyle={{
                backgroundColor: "#18181b",
                borderColor: "#27272a",
                borderRadius: "8px",
                color: "#f4f4f5",
                fontSize: "12px"
              }}
            />
            <Bar 
              dataKey="avgScore" 
              name="Average Mock Score" 
              fill="#8b5cf6" 
              radius={[4, 4, 0, 0]}
              maxBarSize={45}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.avgScore < 10 ? "#f43f5e" : "#8b5cf6"} // Underperforming classes highlighted in Red
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

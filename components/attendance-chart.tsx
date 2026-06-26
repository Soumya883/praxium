"use client";

import * as React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { useTheme } from "next-themes";

const data = [
  { name: "Week 1", Present: 94, Late: 4, Absent: 2 },
  { name: "Week 2", Present: 89, Late: 7, Absent: 4 },
  { name: "Week 3", Present: 95, Late: 3, Absent: 2 },
  { name: "Week 4", Present: 91, Late: 5, Absent: 4 },
  { name: "Week 5", Present: 93, Late: 5, Absent: 2 },
  { name: "Week 6", Present: 96, Late: 3, Absent: 1 },
];

export function AttendanceChart() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[300px] w-full bg-neutral-100 dark:bg-neutral-900/50 rounded-xl animate-pulse flex items-center justify-center text-xs text-neutral-400">
        Loading analytics engine...
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";
  
  // High contrast premium color tokens
  const colors = {
    present: isDark ? "#ffffff" : "#09090b",
    late: isDark ? "#737373" : "#a3a3a3",
    absent: "#ef4444",
    grid: isDark ? "#171717" : "#f5f5f5",
    text: isDark ? "#737373" : "#888888",
    tooltipBg: isDark ? "#0a0a0a" : "#ffffff",
    tooltipBorder: isDark ? "#171717" : "#e5e5e5"
  };

  return (
    <div className="h-[300px] w-full text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
          <XAxis 
            dataKey="name" 
            stroke={colors.text} 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke={colors.text} 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
            dx={-5}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: colors.tooltipBg, 
              borderColor: colors.tooltipBorder,
              borderRadius: "8px",
              color: isDark ? "#fafafa" : "#09090b",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
            }} 
          />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle"
            iconSize={6}
            wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }}
          />
          <Bar dataKey="Present" fill={colors.present} radius={[3, 3, 0, 0]} maxBarSize={20} />
          <Bar dataKey="Late" fill={colors.late} radius={[3, 3, 0, 0]} maxBarSize={20} />
          <Bar dataKey="Absent" fill={colors.absent} radius={[3, 3, 0, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

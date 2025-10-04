import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts";
import { useState, useEffect } from "react";

interface DailyStat {
  day: string;
  date: number;
  minutes: number;
  taskCount: number;
}

interface MemberActivityCardProps {
  firstName: string;
  color?: string | null;
  dailyStats: DailyStat[];
  maxMinutes: number;
}

const chartConfig = {
  minutes: {
    label: "Minutes",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

// Check if a date is today
function isToday(timestamp: number): boolean {
  const today = new Date();
  const date = new Date(timestamp);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// Get CSS variable value
function getCSSVariable(name: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Detect if device has touch screen (mobile/tablet)
function useIsTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check if the device has a coarse pointer (touch screen)
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    setIsTouchDevice(hasCoarsePointer);
  }, []);

  return isTouchDevice;
}

export function MemberActivityCard({ firstName, color, dailyStats, maxMinutes }: MemberActivityCardProps) {
  const isTouchDevice = useIsTouchDevice();

  const initials = firstName
    ? firstName.charAt(0).toUpperCase()
    : "?";

  // Get actual color values from CSS variables
  const primaryColor = getCSSVariable('--primary') || 'oklch(0.591 0.293 322.15)';
  const secondaryColor = getCSSVariable('--secondary') || '#E4C090';

  // Transform data to show minimal bars for zero values
  const chartData = dailyStats.map((stat) => ({
    ...stat,
    displayMinutes: stat.minutes === 0 ? maxMinutes * 0.03 : stat.minutes, // 3% of max for empty days
  }));

  return (
    <div className="flex flex-col items-center px-4 pt-3 rounded-lg border border-foreground/10 bg-transparent">
      {/* Avatar and name */}
      <Avatar className="h-12 w-12 mb-1.5">
        <AvatarFallback color={color} className="font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      <p className="text-xs text-muted-foreground mb-3">{firstName}</p>

      {/* Mini bar chart */}
      <ChartContainer config={chartConfig} className="h-[70px] w-full">
        <BarChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 0, right: 0, bottom: 12, left: 0 }}
          barSize={20}
        >
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            height={12}
          />
          <YAxis hide domain={[0, maxMinutes]} allowDataOverflow={false} />
          <ChartTooltip
            allowEscapeViewBox={{ x: false, y: true }}
            position={{ y: isTouchDevice ? -20 : undefined }}
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const data = payload[0]?.payload as DailyStat & { displayMinutes: number };
                  if (!data) return "";
                  const date = new Date(data.date);
                  return date.toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                  });
                }}
                formatter={(value, name, item) => {
                  // Show task count and minutes in tooltip
                  const data = item.payload as DailyStat;
                  const taskLabel = data.taskCount === 1 ? "tâche" : "tâches";
                  return `${data.taskCount} ${taskLabel} • ${data.minutes} min`;
                }}
              />
            }
          />
          <Bar
            dataKey="displayMinutes"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((stat, index) => {
              const isEmpty = dailyStats[index].minutes === 0;
              const today = isToday(stat.date);

              return (
                <Cell
                  key={`cell-${index}`}
                  fill={today ? primaryColor : secondaryColor}
                  fillOpacity={isEmpty ? 0.2 : 1}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

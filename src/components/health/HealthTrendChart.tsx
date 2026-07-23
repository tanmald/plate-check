import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface HealthTrendChartProps {
  data: Array<{ date: string; value: number | null }>;
  label: string;
  colorVar?: string;
}

export function HealthTrendChart({ data, label, colorVar = "--primary" }: HealthTrendChartProps) {
  const config: ChartConfig = {
    value: { label, color: `hsl(var(${colorVar}))` },
  };
  const chartData = data.map((d) => ({ date: d.date.slice(5), value: d.value }));

  return (
    <ChartContainer config={config} className="aspect-auto h-40 w-full">
      <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Area
          dataKey="value"
          name={label}
          type="monotone"
          fill="var(--color-value)"
          fillOpacity={0.15}
          stroke="var(--color-value)"
          strokeWidth={2}
          connectNulls
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}

import { Line, LineChart, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: number | null;
  unit?: string;
  precision?: number;
  trend: Array<number | null>;
  baseline?: number | null;
}

export function MetricCard({ label, value, unit, precision = 0, trend, baseline }: MetricCardProps) {
  const formatted = value === null ? "–" : value.toFixed(precision);
  const delta = value !== null && baseline != null ? value - baseline : null;
  const sparkData = trend.map((v, i) => ({ i, v }));
  const hasSpark = trend.some((v) => v !== null);

  return (
    <Card className="card-shadow">
      <CardContent className="p-4 space-y-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="flex items-end justify-between gap-2">
          <p className="text-2xl font-bold">
            {formatted}
            {unit && value !== null && (
              <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
            )}
          </p>
          {hasSpark && (
            <div className="w-16 h-8 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkData}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        {delta !== null && baseline != null && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {delta >= 0 ? (
              <ArrowUp className="w-3 h-3 text-success" />
            ) : (
              <ArrowDown className="w-3 h-3 text-destructive" />
            )}
            {baseline.toFixed(precision)} baseline
          </p>
        )}
      </CardContent>
    </Card>
  );
}

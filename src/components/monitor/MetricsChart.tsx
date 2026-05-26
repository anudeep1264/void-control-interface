import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MetricSnapshot } from "@/hooks/useMonitoringStream";

export const MetricsChart = ({ history }: { history: MetricSnapshot[] }) => {
  const data = history.map((m, i) => ({
    i,
    cpu: m.cpu,
    mem: m.mem_pct,
  }));
  return (
    <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-md p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-display text-sm tracking-widest text-foreground">PERFORMANCE TIMELINE</h3>
          <p className="text-[10px] font-mono text-muted-foreground">CPU & Memory · last {data.length} samples</p>
        </div>
        <div className="flex gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" />CPU</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" />MEM</span>
        </div>
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="cpuG" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="memG" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.5} />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="i" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                fontSize: "11px",
                borderRadius: "8px",
              }}
            />
            <Area type="monotone" dataKey="cpu" stroke="hsl(var(--primary))" strokeWidth={1.5} fill="url(#cpuG)" isAnimationActive={false} />
            <Area type="monotone" dataKey="mem" stroke="hsl(var(--accent))" strokeWidth={1.5} fill="url(#memG)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

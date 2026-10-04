import { Activity, BookOpen, Link2, ShieldCheck } from "lucide-react";
import { useMonitoringStream } from "@/hooks/useMonitoringStream";

export const HomeWorkspace = () => {
  const { latest } = useMonitoringStream(false);
  const metrics = [
    { label: "CPU", value: Number.isFinite(latest.cpu) ? `${Math.round(latest.cpu)}%` : "Data unavailable" },
    { label: "Memory", value: Number.isFinite(latest.mem_pct) ? `${Math.round(latest.mem_pct)}%` : "Data unavailable" },
    { label: "Network", value: Number.isFinite(latest.net_down) ? `${latest.net_down.toFixed(1)} down` : "Data unavailable" },
    { label: "Security", value: latest.threat_level ? latest.threat_level : "Data unavailable" },
  ];

  return (
    <div className="columns-1 gap-4 px-4 pb-8 sm:columns-2 xl:columns-3 sm:px-6">
      <section className="mb-4 break-inside-avoid rounded-md border bg-card p-5">
        <Activity className="mb-8 h-5 w-5 text-accent" /><small className="uppercase text-muted-foreground">System awareness</small>
        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border">
          {metrics.map((metric) => <div key={metric.label} className="bg-card p-3"><small className="block text-muted-foreground">{metric.label}</small><strong className="mt-1 block capitalize">{metric.value}</strong></div>)}
        </div>
      </section>
      <section className="mb-4 break-inside-avoid rounded-md bg-primary p-5 text-primary-foreground">
        <BookOpen className="mb-12 h-5 w-5" /><small className="uppercase opacity-70">Memory</small><h3 className="mt-2 text-2xl">Context is recalled only when you ask.</h3><p className="mt-3 text-sm leading-6 opacity-70">Your long-term memory stays scoped to your signed-in account.</p>
      </section>
      <section className="mb-4 break-inside-avoid rounded-md border bg-card p-5">
        <Link2 className="mb-8 h-5 w-5 text-primary" /><small className="uppercase text-muted-foreground">Connected services</small><h3 className="mt-2 text-xl">No service status available.</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">Availability appears here after a supported integration is connected.</p>
      </section>
      <section className="mb-4 break-inside-avoid rounded-md border bg-muted p-5">
        <ShieldCheck className="mb-8 h-5 w-5 text-primary" /><small className="uppercase text-muted-foreground">Privacy</small><h3 className="mt-2 text-xl">Per-user data boundaries</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">Assistant memories and operational records remain isolated by account.</p>
      </section>
    </div>
  );
};
import { motion } from "framer-motion";
import { Activity, Brain, Cloud, Mail, Calendar, Music, FileText, Github, Slack, Zap } from "lucide-react";
import { useMonitoringStream } from "@/hooks/useMonitoringStream";

const SERVICES = [
  { icon: Mail, label: "Gmail", status: "online" },
  { icon: Calendar, label: "Calendar", status: "online" },
  { icon: Cloud, label: "Drive", status: "online" },
  { icon: Music, label: "Spotify", status: "idle" },
  { icon: Github, label: "GitHub", status: "online" },
  { icon: Slack, label: "Slack", status: "idle" },
];

const INSIGHTS = [
  "3 unread priority emails detected",
  "Meeting in 42 min — Daily Standup",
  "Energy peak window: 14:00–16:00",
  "2 deadlines approaching this week",
];

export const HomeWorkspace = () => {
  const metrics = useMonitoringStream();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-4">
      <Panel title="ACTIVE TASKS" icon={Zap}>
        <ul className="space-y-2 text-xs font-mono-tech">
          {["Summarize today's emails", "Prepare standup notes", "Track GitHub PR #482"].map((t, i) => (
            <li key={i} className="flex items-center gap-2 text-foreground/80">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" /> {t}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="DAILY INSIGHTS" icon={Brain}>
        <ul className="space-y-2 text-xs font-body">
          {INSIGHTS.map((t, i) => (
            <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="text-muted-foreground border-l-2 border-secondary/40 pl-2">{t}</motion.li>
          ))}
        </ul>
      </Panel>

      <Panel title="SYSTEM AWARENESS" icon={Activity}>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono-tech">
          <Metric label="CPU"  value={`${metrics.cpu}%`} />
          <Metric label="MEM"  value={`${metrics.memPct}%`} />
          <Metric label="NET" value={`${metrics.netDown}↓`} />
          <Metric label="SEC"  value={metrics.threatLevel.toUpperCase()} />
        </div>
      </Panel>

      <Panel title="CONNECTED SERVICES" icon={Cloud} className="md:col-span-2">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {SERVICES.map(s => (
            <div key={s.label} className="flex flex-col items-center gap-1 p-2 rounded-lg border border-border/40 bg-muted/20">
              <s.icon className={`w-4 h-4 ${s.status === "online" ? "text-accent" : "text-muted-foreground"}`} />
              <span className="text-[9px] font-mono-tech text-muted-foreground tracking-wider">{s.label}</span>
              <span className={`w-1 h-1 rounded-full ${s.status === "online" ? "bg-accent" : "bg-muted-foreground/40"}`} />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="MEMORY STATUS" icon={FileText}>
        <div className="space-y-2 text-[11px] font-mono-tech text-muted-foreground">
          <Row k="Conversations" v="247" />
          <Row k="Preferences"   v="38 learned" />
          <Row k="Contacts"      v="156" />
          <Row k="Context Recall" v="OPTIMAL" />
        </div>
      </Panel>
    </div>
  );
};

const Panel = ({ title, icon: Icon, children, className = "" }: any) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
    className={`holo-card border border-border/40 rounded-xl p-3 ${className}`}>
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-3.5 h-3.5 text-primary" />
      <h3 className="font-mono-tech text-[10px] tracking-[0.3em] text-primary">{title}</h3>
    </div>
    {children}
  </motion.div>
);
const Metric = ({ label, value }: any) => (
  <div className="rounded-md border border-border/40 bg-background/40 p-2">
    <div className="text-[9px] text-muted-foreground">{label}</div>
    <div className="text-sm text-foreground">{value}</div>
  </div>
);
const Row = ({ k, v }: any) => (
  <div className="flex justify-between"><span>{k}</span><span className="text-foreground">{v}</span></div>
);

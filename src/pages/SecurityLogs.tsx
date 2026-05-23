import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle2, XCircle, Activity, Search, Zap, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Severity = "critical" | "warning" | "info";

interface LogEntry {
  id: string;
  created_at: string;
  severity: Severity;
  event_type: string;
  description: string;
  ai_response: string | null;
  ip_address: string | null;
}

type Filter = "ALL" | Severity;
const FILTERS: { key: Filter; label: string }[] = [
  { key: "ALL", label: "ALL" },
  { key: "critical", label: "CRITICAL" },
  { key: "warning", label: "WARN" },
  { key: "info", label: "INFO" },
];

const severityBadge: Record<Severity, string> = {
  critical: "bg-destructive/20 text-destructive border-destructive/40",
  warning: "bg-neon-pink/20 text-neon-pink border-neon-pink/40",
  info: "bg-accent/20 text-accent border-accent/40",
};

const aiBadge: Record<string, string> = {
  Blocked: "text-destructive",
  Alerted: "text-destructive",
  Quarantined: "text-destructive",
  Analyzing: "text-neon-pink",
  Monitoring: "text-accent",
};

const fmt = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("en-US", { hour12: false }).replace(",", "");
};

const SecurityLogs = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial fetch + realtime subscription
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let active = true;

    (async () => {
      const { data } = await supabase
        .from("security_logs")
        .select("id, created_at, severity, event_type, description, ai_response, ip_address")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(150);
      if (active && data) setLogs(data as LogEntry[]);
      setLoading(false);
    })();

    const channel = supabase
      .channel(`security-logs-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "security_logs", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setLogs((prev) => [payload.new as LogEntry, ...prev].slice(0, 200));
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  const counts = useMemo(() => {
    const c = { critical: 0, warning: 0, info: 0 };
    logs.forEach((l) => {
      c[l.severity] = (c[l.severity] ?? 0) + 1;
    });
    return c;
  }, [logs]);

  const blocked = useMemo(
    () => logs.filter((l) => ["Blocked", "Alerted", "Quarantined"].includes(l.ai_response ?? "")).length,
    [logs]
  );

  const STATS = [
    { label: "Critical Threats", value: counts.critical, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
    { label: "Warnings", value: counts.warning, icon: AlertTriangle, color: "text-neon-pink", bg: "bg-neon-pink/10", border: "border-neon-pink/30" },
    { label: "Events Tracked", value: logs.length, icon: Activity, color: "text-accent", bg: "bg-accent/10", border: "border-accent/30" },
    { label: "Threats Blocked", value: blocked, icon: Zap, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  ];

  const filtered = useMemo(() => {
    let rows = logs;
    if (filter !== "ALL") rows = rows.filter((l) => l.severity === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (l) =>
          l.event_type.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          (l.ai_response ?? "").toLowerCase().includes(q)
      );
    }
    return rows;
  }, [logs, filter, search]);

  return (
    <div className="flex-1 overflow-y-auto p-6 relative z-10 space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-primary" />
        <h2 className="font-display text-xl font-bold text-primary tracking-widest">SECURITY LOGS</h2>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-accent tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
          </span>
          LIVE — 24/7 MONITORING
        </span>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`holo-card rounded-xl p-4 border ${s.border} flex items-center gap-3`}
            >
              <div className={`p-2.5 rounded-lg ${s.bg}`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[11px] font-mono text-muted-foreground tracking-wider">{s.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all border ${
              filter === f.key
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="flex-1 min-w-[180px] relative ml-auto max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="w-full bg-muted/50 border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="holo-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto custom-scrollbar">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card/95 backdrop-blur z-10">
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[11px] font-mono text-muted-foreground tracking-wider">TIMESTAMP</th>
                <th className="text-left px-4 py-3 text-[11px] font-mono text-muted-foreground tracking-wider">SEVERITY</th>
                <th className="text-left px-4 py-3 text-[11px] font-mono text-muted-foreground tracking-wider">EVENT</th>
                <th className="text-left px-4 py-3 text-[11px] font-mono text-muted-foreground tracking-wider">DESCRIPTION</th>
                <th className="text-left px-4 py-3 text-[11px] font-mono text-muted-foreground tracking-wider">AI RESPONSE</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground font-mono text-xs">Initializing monitor…</td></tr>
              ) : !user ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground font-mono text-xs">Sign in to activate 24/7 monitoring.</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground font-mono text-xs">Awaiting first event… monitor active.</td></tr>
              ) : (
                <AnimatePresence initial={false}>
                  {filtered.map((log) => (
                    <motion.tr
                      key={log.id}
                      layout
                      initial={{ opacity: 0, x: -20, backgroundColor: "hsl(var(--primary) / 0.15)" }}
                      animate={{ opacity: 1, x: 0, backgroundColor: "hsl(var(--primary) / 0)" }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{fmt(log.created_at)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-[10px] font-mono tracking-wider px-2 py-0.5 rounded border ${severityBadge[log.severity]}`}>
                          {log.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground whitespace-nowrap">{log.event_type}</td>
                      <td className="px-4 py-3 text-xs font-body text-foreground">{log.description}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-mono tracking-wider ${aiBadge[log.ai_response ?? "Monitoring"] ?? "text-muted-foreground"}`}>
                          <Brain className="w-3 h-3" />
                          {log.ai_response ?? "Monitoring"}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-1">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
        </span>
        <span className="text-[11px] font-mono text-accent tracking-wider">
          Defense Engine Active — Streaming live events every ~10s — Auto-refresh: ON
        </span>
      </motion.div>
    </div>
  );
};

export default SecurityLogs;

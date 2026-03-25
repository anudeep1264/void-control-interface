import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle2, XCircle, Activity, Search, Zap } from "lucide-react";

type Severity = "CRITICAL" | "WARN" | "INFO";

interface LogEntry {
  timestamp: string;
  severity: Severity;
  eventType: string;
  source: string;
  description: string;
}

const LOGS: LogEntry[] = [
  { timestamp: "2025-03-25 14:32:11", severity: "CRITICAL", eventType: "Unauthorized Access", source: "File System", description: "Write attempt to /system/config blocked" },
  { timestamp: "2025-03-25 14:31:05", severity: "WARN", eventType: "Anomaly Detected", source: "Process Monitor", description: "Unusual CPU spike: python.exe at 94%" },
  { timestamp: "2025-03-25 14:29:44", severity: "WARN", eventType: "Port Scan Detected", source: "Network Monitor", description: "Inbound scan from 192.168.1.104 on port 8080" },
  { timestamp: "2025-03-25 14:28:30", severity: "INFO", eventType: "Module Started", source: "Defense Engine", description: "Autonomous defense daemon initialized" },
  { timestamp: "2025-03-25 14:27:15", severity: "CRITICAL", eventType: "Malware Signature", source: "File Scanner", description: "Suspicious payload pattern in temp_exec.bin" },
  { timestamp: "2025-03-25 14:25:00", severity: "WARN", eventType: "Brute Force Attempt", source: "Auth Monitor", description: "5 failed login attempts from IP 10.0.0.22" },
  { timestamp: "2025-03-25 14:22:38", severity: "INFO", eventType: "Threat Resolved", source: "Alert Manager", description: "Previous anomaly cleared — system stable" },
  { timestamp: "2025-03-25 14:20:11", severity: "INFO", eventType: "Scan Complete", source: "File System", description: "Full directory scan completed — 0 threats found" },
];

const STATS = [
  { label: "Critical Threats", value: 2, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
  { label: "Warnings", value: 3, icon: AlertTriangle, color: "text-neon-pink", bg: "bg-neon-pink/10", border: "border-neon-pink/30" },
  { label: "Events Today", value: 847, icon: Activity, color: "text-accent", bg: "bg-accent/10", border: "border-accent/30" },
  { label: "Threats Blocked", value: 5, icon: Zap, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
];

type Filter = "ALL" | Severity;

const FILTERS: Filter[] = ["ALL", "CRITICAL", "WARN", "INFO"];

const severityBadge: Record<Severity, string> = {
  CRITICAL: "bg-destructive/20 text-destructive border-destructive/40",
  WARN: "bg-neon-pink/20 text-neon-pink border-neon-pink/40",
  INFO: "bg-accent/20 text-accent border-accent/40",
};

const SecurityLogs = () => {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let rows = LOGS;
    if (filter !== "ALL") rows = rows.filter((l) => l.severity === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (l) =>
          l.eventType.toLowerCase().includes(q) ||
          l.source.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [filter, search]);

  return (
    <div className="flex-1 overflow-y-auto p-6 relative z-10 space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-primary" />
        <h2 className="font-display text-xl font-bold text-primary tracking-widest">SECURITY LOGS</h2>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
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

      {/* Filter Bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all border ${
              filter === f
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"
            }`}
          >
            {f}
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

      {/* Log Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="holo-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[11px] font-mono text-muted-foreground tracking-wider">TIMESTAMP</th>
                <th className="text-left px-4 py-3 text-[11px] font-mono text-muted-foreground tracking-wider">SEVERITY</th>
                <th className="text-left px-4 py-3 text-[11px] font-mono text-muted-foreground tracking-wider">EVENT TYPE</th>
                <th className="text-left px-4 py-3 text-[11px] font-mono text-muted-foreground tracking-wider">SOURCE</th>
                <th className="text-left px-4 py-3 text-[11px] font-mono text-muted-foreground tracking-wider">DESCRIPTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground font-mono text-xs">No matching logs found</td>
                </tr>
              ) : (
                filtered.map((log, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-[10px] font-mono tracking-wider px-2 py-0.5 rounded border ${severityBadge[log.severity]}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{log.eventType}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.source}</td>
                    <td className="px-4 py-3 text-xs font-body text-foreground">{log.description}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Status Bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-2 px-1">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
        </span>
        <span className="text-[11px] font-mono text-accent tracking-wider">
          Defense Engine Active — Last scan: 2 seconds ago — Auto-refresh: ON
        </span>
      </motion.div>
    </div>
  );
};

export default SecurityLogs;

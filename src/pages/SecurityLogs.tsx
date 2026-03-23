import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface LogEntry {
  id: string;
  event_type: string;
  description: string;
  severity: string;
  ip_address: string | null;
  created_at: string;
}

const severityStyles: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  info: { icon: CheckCircle2, color: "text-accent" },
  warning: { icon: AlertTriangle, color: "text-neon-pink" },
  critical: { icon: XCircle, color: "text-destructive" },
};

const SecurityLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (user) loadLogs();
  }, [user]);

  const loadLogs = async () => {
    const { data } = await supabase
      .from("security_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setLogs(data);
  };

  const logSecurityEvent = async () => {
    if (!user) return;
    // Log the current page visit as a security event
    await supabase.from("security_logs").insert({
      user_id: user.id,
      event_type: "page_access",
      description: "Security Logs panel accessed",
      severity: "info",
    });
    loadLogs();
  };

  useEffect(() => {
    if (user) logSecurityEvent();
  }, [user]);

  const filtered = filter === "all" ? logs : logs.filter((l) => l.severity === filter);

  return (
    <div className="flex-1 overflow-y-auto p-6 relative z-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="font-display text-xl font-bold text-primary text-glow-blue tracking-widest">SECURITY LOGS</h2>
          </div>
          <div className="flex gap-2">
            {["all", "info", "warning", "critical"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech tracking-wider transition-all border ${
                  filter === f
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/20"
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="holo-card rounded-xl p-8 text-center">
            <Shield className="w-12 h-12 text-primary/20 mx-auto mb-3" />
            <p className="font-mono-tech text-sm text-muted-foreground">NO LOGS FOUND</p>
          </div>
        ) : (
          filtered.map((log, i) => {
            const s = severityStyles[log.severity] || severityStyles.info;
            const Icon = s.icon;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="holo-card rounded-lg p-4 flex items-start gap-3"
              >
                <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${s.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-mono-tech tracking-wider ${s.color}`}>
                      {log.event_type.toUpperCase()}
                    </span>
                    <span className={`text-[10px] font-mono-tech px-2 py-0.5 rounded border ${
                      log.severity === "critical" ? "border-destructive/30 text-destructive" :
                      log.severity === "warning" ? "border-neon-pink/30 text-neon-pink" :
                      "border-accent/30 text-accent"
                    }`}>
                      {log.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-body text-foreground">{log.description}</p>
                  {log.ip_address && (
                    <p className="text-[10px] font-mono-tech text-muted-foreground mt-1">IP: {log.ip_address}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-mono-tech">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SecurityLogs;

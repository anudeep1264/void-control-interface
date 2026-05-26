import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDeviceTelemetry } from "@/hooks/useDeviceTelemetry";

export interface MetricSnapshot {
  id?: string;
  cpu: number;
  mem_pct: number;
  mem_gb: number;
  mem_total_gb: number;
  storage_used: number;
  storage_total: number;
  net_up: number;
  net_down: number;
  disk_rw: number;
  active: boolean;
  threat_level: "low" | "medium" | "high";
  captured_at?: string;
}

export interface Insight {
  id: string;
  kind: string;
  severity: "low" | "medium" | "high";
  title: string;
  detail: string | null;
  created_at: string;
}

const FALLBACK: MetricSnapshot = {
  cpu: 32, mem_pct: 48, mem_gb: 3.8, mem_total_gb: 8,
  storage_used: 180 * 1024 ** 3, storage_total: 512 * 1024 ** 3,
  net_up: 1.4, net_down: 12.6, disk_rw: 22, active: true, threat_level: "low",
};

export const useMonitoringStream = (autopilot: boolean) => {
  const { user } = useAuth();
  const { telemetry, resetInteractions } = useDeviceTelemetry();
  const [latest, setLatest] = useState<MetricSnapshot>(FALLBACK);
  const [history, setHistory] = useState<MetricSnapshot[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const tickingRef = useRef(false);
  const telRef = useRef(telemetry);
  telRef.current = telemetry;

  // Load initial history + insights
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [h, i] = await Promise.all([
        supabase.from("monitoring_metrics").select("*").eq("user_id", user.id).order("captured_at", { ascending: false }).limit(60),
        supabase.from("monitoring_insights").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      ]);
      if (h.data) {
        setHistory(h.data.reverse() as MetricSnapshot[]);
        if (h.data[h.data.length - 1]) setLatest(h.data[h.data.length - 1] as MetricSnapshot);
      }
      if (i.data) setInsights(i.data as Insight[]);
    })();
  }, [user]);

  // Tick: call edge function with telemetry
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const tick = async () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/monitoring-tick`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            telemetry: {
              ...telRef.current,
              autopilot,
            },
          }),
        });
        if (!cancelled && resp.ok) {
          resetInteractions();
        }
      } catch { /* ignore */ }
      finally { tickingRef.current = false; }
    };

    tick();
    const period = autopilot ? 1500 : 2500;
    const id = setInterval(() => {
      if (autopilot || document.visibilityState === "visible") tick();
    }, period);
    return () => { cancelled = true; clearInterval(id); };
  }, [user, autopilot, resetInteractions]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`monitoring-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "monitoring_metrics", filter: `user_id=eq.${user.id}` }, (p) => {
        const m = p.new as MetricSnapshot;
        setLatest(m);
        setHistory((prev) => [...prev.slice(-59), m]);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "monitoring_insights", filter: `user_id=eq.${user.id}` }, (p) => {
        const ins = p.new as Insight;
        setInsights((prev) => [ins, ...prev].slice(0, 20));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  return { latest, history, insights, telemetry };
};

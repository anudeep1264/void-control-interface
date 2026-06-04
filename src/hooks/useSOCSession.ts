import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useScreenCapture, type CaptureFrame } from "@/hooks/useScreenCapture";
import { averageHash, phishingMatch, scanSecrets } from "@/lib/socScanners";
import { BiometricsCollector, type BiometricSnapshot } from "@/lib/socBiometrics";

export interface SOCAlert {
  id: string;
  threat_type: string;
  severity: "low" | "medium" | "high" | "critical";
  risk_score: number;
  state: string;
  title: string;
  detail: string | null;
  recommended_action: string | null;
  evidence: Record<string, unknown>;
  created_at: string;
}

export interface SOCEvent {
  id: string;
  kind: string;
  severity: "low" | "medium" | "high" | "critical";
  score: number;
  source: string | null;
  evidence: Record<string, unknown>;
  created_at: string;
}

export interface SOCFrameRow {
  id: string;
  thumb_data_url: string | null;
  phash: string | null;
  ocr_text: string | null;
  ocr_confidence: number | null;
  detections: unknown;
  risk: number;
  captured_at: string;
}

type TesseractWorker = {
  recognize: (img: HTMLCanvasElement) => Promise<{ data: { text: string; confidence: number } }>;
  terminate: () => Promise<void>;
};

let workerPromise: Promise<TesseractWorker> | null = null;
const getOcrWorker = (): Promise<TesseractWorker> => {
  if (workerPromise) return workerPromise;
  workerPromise = import("tesseract.js").then(async (mod) => {
    const w = await mod.createWorker("eng");
    return w as unknown as TesseractWorker;
  });
  return workerPromise;
};

export function useSOCSession() {
  const { user } = useAuth();
  const capture = useScreenCapture(2500);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [risk, setRisk] = useState(0);
  const [state, setState] = useState("Normal");
  const [severity, setSeverity] = useState<"low" | "medium" | "high" | "critical">("low");
  const [events, setEvents] = useState<SOCEvent[]>([]);
  const [alerts, setAlerts] = useState<SOCAlert[]>([]);
  const [frames, setFrames] = useState<SOCFrameRow[]>([]);
  const [biometrics, setBiometrics] = useState<BiometricSnapshot | null>(null);
  const [agentSignal, setAgentSignal] = useState<Record<string, unknown> | null>(null);
  const [ocrStatus, setOcrStatus] = useState<"idle" | "loading" | "running">("idle");
  const bioRef = useRef<BiometricsCollector | null>(null);
  const lastHashRef = useRef<string | null>(null);

  // Post events to risk engine
  const postEvents = useCallback(
    async (sessId: string | null, batch: Array<{ kind: string; severity?: string; score?: number; source?: string; evidence?: Record<string, unknown> }>) => {
      if (batch.length === 0) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      try {
        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/soc-risk-engine`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ sessionId: sessId, events: batch }),
        });
        if (resp.ok) {
          const json = await resp.json();
          setRisk(json.risk ?? 0);
          setState(json.state ?? "Normal");
          setSeverity(json.severity ?? "low");
        }
      } catch { /* ignore network */ }
    },
    [],
  );

  // Start a session + capture
  const startSession = useCallback(async () => {
    if (!user) return;
    bioRef.current = new BiometricsCollector();
    bioRef.current.start();
    setOcrStatus("loading");
    getOcrWorker().then(() => setOcrStatus("running")).catch(() => setOcrStatus("idle"));

    const { data } = await supabase
      .from("soc_sessions")
      .insert({ user_id: user.id, capture_source: "getDisplayMedia" })
      .select()
      .single();
    if (data) setSessionId(data.id);
    await capture.start();
    postEvents(data?.id ?? null, [{ kind: "capture_started", severity: "low", evidence: { source: "getDisplayMedia" } }]);
  }, [user, capture, postEvents]);

  const stopSession = useCallback(async () => {
    capture.stop();
    bioRef.current?.stop();
    bioRef.current = null;
    if (sessionId) {
      await supabase.from("soc_sessions").update({ ended_at: new Date().toISOString() }).eq("id", sessionId);
      postEvents(sessionId, [{ kind: "capture_stopped", severity: "low" }]);
    }
    setOcrStatus("idle");
  }, [capture, sessionId, postEvents]);

  // Process each captured frame
  useEffect(() => {
    if (!capture.active || !user) return;
    const unsub = capture.onFrame(async (frame: CaptureFrame) => {
      // Perceptual hash
      const hash = averageHash(frame.canvas);
      const phish = phishingMatch(hash);

      // OCR
      let text = "";
      let conf = 0;
      try {
        const w = await getOcrWorker();
        const r = await w.recognize(frame.canvas);
        text = r.data.text ?? "";
        conf = r.data.confidence ?? 0;
      } catch { /* OCR failed quietly */ }

      const secretHits = scanSecrets(text);
      const frameRisk = Math.min(100,
        secretHits.length * 12 + (phish.matched ? 35 : 0) + (text.length > 20 ? 3 : 0),
      );

      const { data: frameRow } = await supabase
        .from("soc_frames")
        .insert([{
          user_id: user.id,
          session_id: sessionId ?? undefined,
          thumb_data_url: frame.thumbDataUrl,
          phash: hash,
          ocr_text: text.slice(0, 8000),
          ocr_confidence: Math.round(conf * 100) / 100,
          detections: secretHits.slice(0, 30) as never,
          risk: frameRisk,
        }])
        .select()
        .single();
      if (frameRow) setFrames((p) => [frameRow as SOCFrameRow, ...p].slice(0, 30));
      lastHashRef.current = hash;

      // Build event batch
      const batch: Array<{ kind: string; severity?: string; evidence?: Record<string, unknown> }> = [];
      if (text.length > 30) batch.push({ kind: "ocr_hit", severity: "low", evidence: { chars: text.length, conf } });
      for (const h of secretHits.slice(0, 6)) {
        const k = h.kind.startsWith("keyword:") ? "secret_leak" : "secret_leak";
        batch.push({ kind: k, severity: h.severity, evidence: { kind: h.kind, sample: h.match } });
      }
      if (phish.matched) batch.push({ kind: "phishing_match", severity: "high", evidence: { hash, distance: phish.distance } });

      // Biometrics check (every frame)
      const snap = bioRef.current?.snapshot();
      if (snap) {
        setBiometrics(snap);
        if (snap.botLikelihood >= 0.75 && snap.keystrokes > 40)
          batch.push({ kind: "bot_typing", severity: "high", evidence: { ...snap } });
      }

      if (batch.length) postEvents(sessionId, batch);
    });
    return unsub;
  }, [capture, user, sessionId, postEvents]);

  // Poll stub external agent every 6s
  useEffect(() => {
    if (!capture.active) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/soc-agent-stub`);
        const json = await resp.json();
        if (cancelled) return;
        setAgentSignal(json);
        const batch: Array<{ kind: string; severity?: string; evidence?: Record<string, unknown> }> = [];
        for (const y of json.yolo ?? []) {
          if (["banking_site", "login_form", "crypto_wallet", "remote_desktop", "file_transfer"].includes(y.cls))
            batch.push({ kind: "agent_yolo_hit", severity: "medium", evidence: y });
        }
        if (json.yara) batch.push({ kind: "agent_yara_hit", severity: "critical", evidence: json.yara });
        if (json.usb_insert) batch.push({ kind: "agent_usb_insert", severity: "medium", evidence: { ts: json.timestamp } });
        if (json.file_copy) batch.push({ kind: "agent_file_copy", severity: "high", evidence: json.file_copy });
        if (batch.length) postEvents(sessionId, batch);
      } catch { /* ignore */ }
    };
    poll();
    const id = setInterval(poll, 6000);
    return () => { cancelled = true; clearInterval(id); };
  }, [capture.active, sessionId, postEvents]);

  // Initial load + realtime
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [e, a] = await Promise.all([
        supabase.from("soc_events").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(40),
        supabase.from("soc_alerts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      ]);
      if (e.data) setEvents(e.data as SOCEvent[]);
      if (a.data) setAlerts(a.data as SOCAlert[]);
    })();
    const ch = supabase
      .channel(`soc-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "soc_events", filter: `user_id=eq.${user.id}` }, (p) =>
        setEvents((prev) => [p.new as SOCEvent, ...prev].slice(0, 40)))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "soc_alerts", filter: `user_id=eq.${user.id}` }, (p) =>
        setAlerts((prev) => [p.new as SOCAlert, ...prev].slice(0, 20)))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  return {
    capture, sessionId, risk, state, severity, events, alerts, frames,
    biometrics, agentSignal, ocrStatus, startSession, stopSession,
  };
}

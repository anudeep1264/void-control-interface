import { useSyncExternalStore } from "react";
import { type AiMode } from "@/lib/streamChat";

const LS_KEY = "vlad_asi_state_v1";

export type AsiEvent = {
  ts: number;
  mode: AiMode;
  text: string;
};

export interface AsiState {
  modeUsage: Record<string, number>;     // mode -> count
  totalMessages: number;
  lastEvents: AsiEvent[];                // recent history (max 30)
  keywordHits: Record<string, number>;   // keyword -> count (very small)
  learning: number;                      // 0..100 (sim)
  autonomousEnabled: boolean;
  lastAutoSwitchAt: number;
}

const DEFAULT_STATE: AsiState = {
  modeUsage: {},
  totalMessages: 0,
  lastEvents: [],
  keywordHits: {},
  learning: 8,
  autonomousEnabled: true,
  lastAutoSwitchAt: 0,
};

const load = (): AsiState => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
};

let state: AsiState = load();
const listeners = new Set<() => void>();

const persist = () => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* ignore */ }
};

const emit = () => {
  persist();
  listeners.forEach(l => l());
};

export const asiStore = {
  get: () => state,
  subscribe: (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; },

  recordMessage(mode: AiMode, text: string) {
    state = {
      ...state,
      totalMessages: state.totalMessages + 1,
      modeUsage: { ...state.modeUsage, [mode]: (state.modeUsage[mode] || 0) + 1 },
      lastEvents: [{ ts: Date.now(), mode, text: text.slice(0, 160) }, ...state.lastEvents].slice(0, 30),
      learning: Math.min(100, state.learning + 0.8 + Math.random() * 0.6),
    };
    // tiny keyword extractor
    const kws = text.toLowerCase().match(/\b[a-z]{4,12}\b/g) || [];
    const stop = new Set(["this","that","with","from","have","want","need","make","please","about","what","when","where","they","your","into","just","like","really","could","would"]);
    const hits = { ...state.keywordHits };
    for (const k of kws.slice(0, 8)) {
      if (stop.has(k)) continue;
      hits[k] = (hits[k] || 0) + 1;
    }
    // trim
    const top = Object.entries(hits).sort((a, b) => b[1] - a[1]).slice(0, 40);
    state = { ...state, keywordHits: Object.fromEntries(top) };
    emit();
  },

  setAutonomous(v: boolean) {
    state = { ...state, autonomousEnabled: v };
    emit();
  },

  markAutoSwitch() {
    state = { ...state, lastAutoSwitchAt: Date.now() };
    emit();
  },

  reset() {
    state = { ...DEFAULT_STATE };
    emit();
  },
};

export const useAsi = () =>
  useSyncExternalStore(asiStore.subscribe, asiStore.get, asiStore.get);

// ---------- Prediction engine (rule-based, deterministic + cheap) ----------

const KEYWORD_MODE_MAP: Record<string, AiMode> = {
  code: "developer", bug: "debug", error: "debug", typescript: "developer", function: "developer", api: "developer",
  hack: "security", attack: "security", threat: "security", vulnerability: "security", secure: "security",
  research: "research", compare: "research", analyze: "analytics", data: "analytics", metric: "analytics", chart: "analytics",
  poem: "creative", story: "creative", design: "creative", logo: "creative", image: "creative",
  workflow: "automation", pipeline: "automation", automate: "automation",
  decide: "decision", choose: "decision", recommend: "decision",
  email: "communication", letter: "communication", draft: "communication",
  strategy: "strategy", plan: "strategy", roadmap: "strategy",
  teach: "learning", explain: "learning", quiz: "learning",
  simulate: "simulation", scenario: "simulation",
  solve: "problemsolving", equation: "problemsolving", math: "problemsolving",
};

export interface Prediction {
  suggestedMode: AiMode | null;
  confidence: number; // 0..100
  reason: string;
  proactivePrompts: string[];
}

export const predictFromInput = (input: string, currentMode: AiMode): Prediction => {
  const lower = input.toLowerCase();
  const scores: Partial<Record<AiMode, number>> = {};
  for (const [kw, mode] of Object.entries(KEYWORD_MODE_MAP)) {
    if (lower.includes(kw)) scores[mode] = (scores[mode] || 0) + 1;
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1]! - a[1]!);
  if (!sorted.length) {
    return { suggestedMode: null, confidence: 0, reason: "Insufficient signal", proactivePrompts: [] };
  }
  const [topMode, topScore] = sorted[0];
  const confidence = Math.min(98, 55 + topScore! * 12);
  const suggestedMode = (topMode as AiMode) === currentMode ? null : (topMode as AiMode);
  return {
    suggestedMode,
    confidence,
    reason: suggestedMode
      ? `Detected ${topMode} intent in your input`
      : `Current mode is optimal for this query`,
    proactivePrompts: [],
  };
};

export const predictFromHistory = (s: AsiState, currentMode: AiMode): Prediction => {
  // Suggest the user's most-used mode if it's not current and used >2x more
  const sorted = Object.entries(s.modeUsage).sort((a, b) => b[1] - a[1]);
  if (!sorted.length) {
    return {
      suggestedMode: null,
      confidence: 0,
      reason: "Building behavioral profile…",
      proactivePrompts: [
        "Try a quick demo to bootstrap predictions",
        "Ask anything — I'll learn your patterns",
      ],
    };
  }
  const [topMode, count] = sorted[0];
  const currentCount = s.modeUsage[currentMode] || 0;
  const recent = s.lastEvents[0];
  const proactivePrompts: string[] = [];
  if (recent) {
    proactivePrompts.push(`Continue your previous task: "${recent.text.slice(0, 60)}${recent.text.length > 60 ? "…" : ""}"`);
  }
  // Top keywords as suggestion seeds
  const topKws = Object.entries(s.keywordHits).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);
  if (topKws.length) {
    proactivePrompts.push(`Deep-dive on "${topKws[0]}" — your most-referenced topic`);
  }
  proactivePrompts.push(`Run a multi-agent analysis across all your active domains`);

  const shouldSwitch = topMode !== currentMode && count >= Math.max(3, currentCount + 2);
  return {
    suggestedMode: shouldSwitch ? (topMode as AiMode) : null,
    confidence: Math.min(96, 60 + count * 4),
    reason: shouldSwitch
      ? `Usage pattern favors ${topMode} (${count}× sessions)`
      : `Current mode aligned with behavior`,
    proactivePrompts: proactivePrompts.slice(0, 4),
  };
};

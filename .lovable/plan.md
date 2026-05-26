
# VLAD Monitoring Intelligence Upgrade

Transform VLAD into a real-time, AI-driven monitoring platform with browser-based device telemetry, simulated system metrics, behavior tracking, and autonomous intelligence — persisted per-user.

## Scope

A new **Monitoring Center** route (`/monitor`) plus an upgraded hero widget on the AI Hub. All data is per-user, persisted in Lovable Cloud, streamed via Supabase Realtime, with a Web Worker driving 1–2s polling. No native OS access (browser sandbox), so we combine **real browser signals** + **realistic simulation** that varies per session.

## What we'll build

### 1. Backend (Lovable Cloud)

New tables (per-user, RLS `auth.uid() = user_id`):
- `monitoring_metrics` — time-series snapshots: `cpu, mem_pct, mem_gb, storage_used, storage_total, net_up, net_down, disk_rw, active, threat_level, captured_at`
- `monitoring_sessions` — current session: `started_at, last_active_at, idle_seconds, interactions, tab_visible, autopilot`
- `monitoring_insights` — AI-generated: `kind` (anomaly/suggestion/status), `severity` (low/med/high), `title`, `detail`, `created_at`

Edge function `monitoring-tick` (already have `system-metrics` — extend it):
- Returns enriched metrics by combining real signals (security_logs, chat counts, browser-reported telemetry from POST body) with realistic variation
- Inserts a snapshot row + emits 0–1 insight using rule-based AI (escalates with Lovable AI Gateway only on threshold crossings to keep cost down)

Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE monitoring_metrics, monitoring_insights`.

### 2. Browser telemetry hook (`useDeviceTelemetry`)

Reads what browsers actually expose:
- `navigator.hardwareConcurrency`, `navigator.deviceMemory`
- `navigator.connection` (downlink, rtt, effectiveType)
- `navigator.storage.estimate()` for storage used/quota
- `performance.memory` (Chrome) for JS heap
- Page Visibility API → tab active/inactive
- Mouse/keyboard/scroll listeners → interactions/minute, idle time
- Reports these every 2s to `monitoring-tick`

### 3. Frontend — Monitoring Center page

Layout (bento, Ocean Deep theme, mobile-first single column):
```text
┌─ Hero status strip: CPU | MEM | STORAGE | NET (pulsing, color-coded) ─┐
├─ Realtime line chart (CPU + MEM, 60s window, Recharts) ───────────────┤
├─ Network panel ↑↓ speeds + disk R/W ─┬─ Storage donut + breakdown ────┤
├─ Activity & Behavior ────────────────┴─ Screen Awareness ─────────────┤
├─ AI Decision Engine (analysis stream + suggestions) ──────────────────┤
├─ Security threat ladder (low/med/high) + recent intelligent logs ─────┤
└─ Autopilot toggle (continuous mode) ──────────────────────────────────┘
```

Components:
- `MonitorHero` — 4 KPIs with pulsing dots, color thresholds
- `MetricsChart` — Recharts area chart, smooth animated updates
- `NetworkPanel`, `StoragePanel`, `BehaviorPanel`, `AwarenessPanel`
- `AIDecisionEngine` — typewriter-style status ("Analyzing system behavior…" → "Detecting anomalies…" → suggestion card)
- `SecurityLadder` — threat tiers from `monitoring_insights`
- `AutopilotSwitch` — when on, polling continues even with tab hidden (uses Web Worker `setInterval`)

### 4. Upgrade existing hero widget on AI Hub

`MonitoringHeroWidget` reads from the same realtime stream, gains the threat tier dot and an "Open Monitor" link to `/monitor`.

### 5. Routing & nav

- Add route `/monitor` in `Index.tsx`
- Add "Monitor" entry to `CyberSidebar`
- Add "Monitor" link in landing `Navbar` for logged-in users

## Technical details

- **Polling cadence**: 2s default, 1s when autopilot + foreground
- **Web Worker** (`src/workers/monitor.worker.ts`) keeps timer alive when tab is hidden
- **Fallback simulation**: if telemetry APIs missing, generate smoothed random walks (`prev + (Math.random()-0.5)*8`, clamped)
- **AI usage**: rule engine first; only call Lovable AI (`google/gemini-2.5-flash-lite`) when threshold breach to label the anomaly — keeps it fast and cheap
- **History retention**: keep last 500 rows/user; trim in edge function
- **Charts**: Recharts already implied via shadcn `chart.tsx`
- **Theme**: reuse Ocean Deep tokens (`--primary`, `--accent`, `--destructive`) — no hardcoded colors

## Files

Create:
- `supabase/functions/monitoring-tick/index.ts`
- `src/hooks/useDeviceTelemetry.ts`
- `src/hooks/useMonitoringStream.ts`
- `src/workers/monitor.worker.ts`
- `src/pages/Monitor.tsx`
- `src/components/monitor/MonitorHero.tsx`
- `src/components/monitor/MetricsChart.tsx`
- `src/components/monitor/NetworkPanel.tsx`
- `src/components/monitor/StoragePanel.tsx`
- `src/components/monitor/BehaviorPanel.tsx`
- `src/components/monitor/AwarenessPanel.tsx`
- `src/components/monitor/AIDecisionEngine.tsx`
- `src/components/monitor/SecurityLadder.tsx`
- `src/components/monitor/AutopilotSwitch.tsx`

Edit:
- `src/pages/Index.tsx` (add route)
- `src/components/CyberSidebar.tsx` (add nav)
- `src/components/ai-hub/MonitoringHeroWidget.tsx` (stream + link)
- `src/components/landing/Navbar.tsx` (logged-in link)

## Migration

3 new tables with RLS, plus realtime publication.

## Out of scope

True OS-level metrics (impossible from browser without a native agent), screen recording, keystroke content capture.

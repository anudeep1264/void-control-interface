import { motion } from "framer-motion";
import { Mail, Calendar, FileText, Video, Music, BookOpen, Users, Code2, LucideIcon } from "lucide-react";
import type { WorkspaceId } from "./types";

interface Block { title: string; meta?: string; body?: string; }

const CONTENT: Record<Exclude<WorkspaceId, "home" | "image">, { icon: LucideIcon; label: string; blocks: Block[] }> = {
  email: {
    icon: Mail, label: "EMAIL WORKSPACE",
    blocks: [
      { title: "Re: Q4 budget review", meta: "alex@acme · 12m", body: "Updated numbers are attached. Ready when you are." },
      { title: "Design system handoff",  meta: "lena@studio · 1h", body: "Tokens migrated to v2. Need your sign-off." },
      { title: "Invoice #2049 paid",     meta: "stripe · 3h", body: "Payment of $4,200 settled." },
    ],
  },
  calendar: {
    icon: Calendar, label: "CALENDAR WORKSPACE",
    blocks: [
      { title: "Daily Standup",    meta: "in 42 min · Google Meet", body: "Recurring · 8 attendees" },
      { title: "1:1 with Priya",   meta: "14:00 · Zoom", body: "Quarterly review prep" },
      { title: "Product Strategy", meta: "Thu · 10:00", body: "Roadmap alignment" },
    ],
  },
  files: {
    icon: FileText, label: "FILE MANAGEMENT",
    blocks: [
      { title: "Q4_Strategy.pdf",    meta: "2.4 MB · Drive", body: "Modified 12m ago" },
      { title: "Design Tokens v2",   meta: "Folder · 47 files", body: "Shared with team" },
      { title: "Voice Notes",        meta: "Folder · 23 files", body: "Auto-transcribed" },
    ],
  },
  meetings: {
    icon: Video, label: "MEETING DASHBOARD",
    blocks: [
      { title: "Daily Standup", meta: "Google Meet · in 42m", body: "Join automatically" },
      { title: "Last meeting summary", meta: "yesterday", body: "5 action items extracted, 2 assigned to you" },
    ],
  },
  media: {
    icon: Music, label: "MEDIA CONTROL",
    blocks: [
      { title: "Now playing", meta: "Spotify", body: "Deep Focus — Lofi Beats" },
      { title: "Queue", meta: "12 tracks", body: "Ambient · Synthwave" },
    ],
  },
  memory: {
    icon: BookOpen, label: "MEMORY ENGINE",
    blocks: [
      { title: "Long-term context", meta: "247 conversations indexed", body: "Semantic recall active" },
      { title: "Behavior patterns", meta: "38 learned", body: "Peak focus 14:00–16:00 · prefers concise responses" },
      { title: "Contacts", meta: "156 entries", body: "Synced from connected services" },
    ],
  },
  agents: {
    icon: Users, label: "MULTI-AGENT SYSTEM",
    blocks: [
      { title: "Executive · idle",     body: "Routes top-level intent" },
      { title: "Research · active",    body: "Compiling daily brief" },
      { title: "Communication · idle", body: "Email + chat surface" },
      { title: "Creative · idle",      body: "Image + writing" },
      { title: "Security · monitoring", body: "Telemetry watchdog" },
      { title: "Developer · idle",     body: "Code + repo ops" },
      { title: "Planning · active",    body: "Day prioritization" },
      { title: "Automation · idle",    body: "Workflow runner" },
    ],
  },
  code: {
    icon: Code2, label: "DEVELOPER WORKSPACE",
    blocks: [
      { title: "PR #482 awaiting review", meta: "vlad-os · 3 files", body: "Add IntelligenceCore" },
      { title: "CI: green",               meta: "build #1290", body: "All checks passed" },
    ],
  },
};

export const SimWorkspace = ({ id }: { id: Exclude<WorkspaceId, "home" | "image"> }) => {
  const c = CONTENT[id];
  const Icon = c.icon;
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <h2 className="font-mono-tech text-xs tracking-[0.4em] text-primary">{c.label}</h2>
        <span className="ml-auto text-[10px] font-mono-tech text-muted-foreground">SIMULATED · DEMO DATA</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {c.blocks.map((b, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="holo-card border border-border/40 rounded-xl p-3">
            <h3 className="font-display text-sm text-foreground">{b.title}</h3>
            {b.meta && <p className="text-[10px] font-mono-tech text-secondary mt-0.5">{b.meta}</p>}
            {b.body && <p className="text-xs text-muted-foreground mt-2">{b.body}</p>}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

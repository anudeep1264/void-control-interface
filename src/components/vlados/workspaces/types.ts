export type WorkspaceId =
  | "home" | "email" | "image" | "calendar" | "files"
  | "meetings" | "media" | "memory" | "agents" | "code"
  | "research" | "automation";

export interface DetectedIntent {
  workspace: WorkspaceId;
  payload?: string;
}

// Fallback local heuristic when AI Core is unreachable.
const RULES: Array<{ ws: WorkspaceId; pattern: RegExp; extract?: (m: RegExpMatchArray) => string }> = [
  { ws: "image", pattern: /\b(?:generate|create|draw|make|render)\s+(?:an?\s+)?image\s+(?:of\s+)?(.+)/i, extract: m => m[1] },
  { ws: "image", pattern: /\bimage\s+(?:of|showing)\s+(.+)/i, extract: m => m[1] },
  { ws: "email", pattern: /\b(email|inbox|gmail|reply|draft|send a message)\b/i },
  { ws: "calendar", pattern: /\b(calendar|schedule|meeting|appointment|book|event)\b/i },
  { ws: "files", pattern: /\b(drive|file|document|folder|upload)\b/i },
  { ws: "meetings", pattern: /\b(zoom|google meet|join meeting|standup|conference)\b/i },
  { ws: "media", pattern: /\b(spotify|play music|youtube|playlist|song|video)\b/i },
  { ws: "code", pattern: /\b(github|repo|pull request|code|deploy|commit)\b/i },
  { ws: "research", pattern: /\b(research|look up|find out|investigate|web search|summarize)\b/i },
  { ws: "automation", pattern: /\b(automate|workflow|trigger|recurring|schedule a task|when .* then)\b/i },
  { ws: "memory", pattern: /\b(remember|recall|memory|context|history)\b/i },
  { ws: "agents", pattern: /\b(agent|delegate|task force|swarm)\b/i },
];

export const detectIntent = (text: string): DetectedIntent | null => {
  for (const r of RULES) {
    const m = text.match(r.pattern);
    if (m) return { workspace: r.ws, payload: r.extract?.(m) };
  }
  return null;
};

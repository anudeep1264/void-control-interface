// VLAD Ω SOC — secret scanner (regex + Aho-Corasick) and perceptual hashing utilities.

export interface ScanHit {
  kind: string;
  match: string;
  severity: "low" | "medium" | "high" | "critical";
  index: number;
}

// ── Regex layer: structured secrets ───────────────────────────────────────────
const REGEX_RULES: Array<{ kind: string; re: RegExp; severity: ScanHit["severity"] }> = [
  { kind: "aws_access_key", re: /\bAKIA[0-9A-Z]{16}\b/g, severity: "critical" },
  { kind: "aws_secret_key", re: /\b[0-9a-zA-Z/+]{40}\b/g, severity: "high" },
  { kind: "github_token", re: /\bghp_[A-Za-z0-9]{36,}\b/g, severity: "critical" },
  { kind: "google_api_key", re: /\bAIza[0-9A-Za-z\-_]{35}\b/g, severity: "high" },
  { kind: "openai_key", re: /\bsk-[A-Za-z0-9]{20,}\b/g, severity: "critical" },
  { kind: "slack_token", re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g, severity: "high" },
  { kind: "private_key_block", re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/g, severity: "critical" },
  { kind: "jwt", re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, severity: "high" },
  { kind: "email", re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, severity: "low" },
  { kind: "credit_card", re: /\b(?:\d[ -]*?){13,16}\b/g, severity: "high" },
  { kind: "iban", re: /\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/g, severity: "medium" },
  { kind: "password_label", re: /\b(?:password|passwd|pwd)\s*[:=]\s*\S{4,}/gi, severity: "high" },
];

// ── Aho-Corasick: high-throughput keyword set ────────────────────────────────
interface ACNode { next: Map<number, ACNode>; fail: ACNode | null; outputs: string[]; }
class AhoCorasick {
  root: ACNode = { next: new Map(), fail: null, outputs: [] };
  constructor(words: string[]) {
    for (const w of words) {
      let node = this.root;
      for (const ch of w) {
        const c = ch.charCodeAt(0);
        if (!node.next.has(c)) node.next.set(c, { next: new Map(), fail: null, outputs: [] });
        node = node.next.get(c)!;
      }
      node.outputs.push(w);
    }
    const q: ACNode[] = [];
    for (const child of this.root.next.values()) { child.fail = this.root; q.push(child); }
    while (q.length) {
      const r = q.shift()!;
      for (const [c, child] of r.next) {
        q.push(child);
        let f = r.fail;
        while (f && !f.next.has(c)) f = f.fail;
        child.fail = f?.next.get(c) ?? this.root;
        child.outputs.push(...child.fail.outputs);
      }
    }
  }
  search(text: string): Array<{ word: string; index: number }> {
    const out: Array<{ word: string; index: number }> = [];
    let node = this.root;
    const lower = text.toLowerCase();
    for (let i = 0; i < lower.length; i++) {
      const c = lower.charCodeAt(i);
      while (node !== this.root && !node.next.has(c)) node = node.fail!;
      if (node.next.has(c)) node = node.next.get(c)!;
      if (node.outputs.length) {
        for (const w of node.outputs) out.push({ word: w, index: i - w.length + 1 });
      }
    }
    return out;
  }
}

const KEYWORDS = [
  "confidential", "top secret", "classified", "internal use only",
  "ssn", "social security", "routing number", "swift code",
  "api_key", "api key", "secret_key", "client_secret", "access_token",
  "ransom", "bitcoin wallet", "seed phrase", "private key",
  "wire transfer", "patient record", "medical record",
];
const AC = new AhoCorasick(KEYWORDS);

export function scanSecrets(text: string): ScanHit[] {
  if (!text) return [];
  const hits: ScanHit[] = [];
  for (const rule of REGEX_RULES) {
    rule.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = rule.re.exec(text)) !== null) {
      hits.push({ kind: rule.kind, match: m[0].slice(0, 80), severity: rule.severity, index: m.index });
      if (hits.length > 50) break;
    }
  }
  for (const a of AC.search(text)) {
    hits.push({ kind: "keyword:" + a.word, match: a.word, severity: "medium", index: a.index });
    if (hits.length > 80) break;
  }
  return hits;
}

// ── Perceptual hashing (average hash, 8×8) ───────────────────────────────────
export function averageHash(canvas: HTMLCanvasElement): string {
  const size = 8;
  const tmp = document.createElement("canvas");
  tmp.width = size; tmp.height = size;
  const ctx = tmp.getContext("2d")!;
  ctx.drawImage(canvas, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  const gray: number[] = [];
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    gray.push(g); sum += g;
  }
  const avg = sum / gray.length;
  let bits = "";
  for (const g of gray) bits += g >= avg ? "1" : "0";
  // To hex
  let hex = "";
  for (let i = 0; i < bits.length; i += 4) hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  return hex;
}

export function hamming(a: string, b: string): number {
  if (a.length !== b.length) return 64;
  let d = 0;
  for (let i = 0; i < a.length; i++) {
    const x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    d += (x.toString(2).match(/1/g) ?? []).length;
  }
  return d;
}

// Known phishing/login-page fingerprints (placeholder samples)
export const KNOWN_PHISH_HASHES = [
  "ffe7c3818181c3e7", // sample silhouette
  "0f1f3f7fff7f3f1f",
];

export function phishingMatch(hash: string): { matched: boolean; distance: number } {
  let min = 64;
  for (const k of KNOWN_PHISH_HASHES) min = Math.min(min, hamming(hash, k));
  return { matched: min <= 8, distance: min };
}

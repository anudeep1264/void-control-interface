// VLAD Ω SOC — stub for an external native agent (YOLO/YARA/OS telemetry)
// In production this would be replaced by a real desktop agent posting telemetry.
// We simulate plausible signals so the SOC pipeline can be demoed end-to-end.

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const YOLO_CLASSES = [
  "browser_window", "login_form", "banking_site", "crypto_wallet",
  "email_client", "remote_desktop", "terminal", "code_editor",
  "file_transfer", "unknown_app",
];

const YARA_RULES = [
  "Win.Trojan.Generic", "Ransom.Cryptor", "PUA.CoinMiner",
  "Phish.CredentialGrabber", "Exfil.LargeUpload",
];

const PROCESSES = [
  "chrome.exe", "code.exe", "Slack.exe", "explorer.exe",
  "powershell.exe", "ssh.exe", "rclone.exe", "scp.exe",
];

function rnd<T>(a: T[]) { return a[Math.floor(Math.random() * a.length)]; }
function chance(p: number) { return Math.random() < p; }

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  // No auth required — stub is read-only and returns synthetic telemetry only.
  const yoloHits = Array.from({ length: 1 + Math.floor(Math.random() * 3) }, () => ({
    cls: rnd(YOLO_CLASSES),
    confidence: Math.round((0.55 + Math.random() * 0.44) * 100) / 100,
    bbox: [Math.random(), Math.random(), 0.1 + Math.random() * 0.4, 0.1 + Math.random() * 0.4].map((n) => Math.round(n * 1000) / 1000),
  }));

  const yaraHit = chance(0.08) ? { rule: rnd(YARA_RULES), severity: "high" as const } : null;
  const usbInsert = chance(0.04);
  const fileCopy = chance(0.06) ? { src: "/Users/dev/secrets.env", dst: rnd(["/Volumes/USB/", "/tmp/out/"]), bytes: Math.floor(Math.random() * 8_000_000) } : null;

  const processes = Array.from({ length: 4 }, () => ({
    name: rnd(PROCESSES),
    cpu: Math.round(Math.random() * 60),
    mem_mb: Math.round(50 + Math.random() * 800),
  }));

  return new Response(JSON.stringify({
    agent: "vlad-native-agent-stub",
    version: "0.1.0-mock",
    timestamp: new Date().toISOString(),
    yolo: yoloHits,
    yara: yaraHit,
    usb_insert: usbInsert,
    file_copy: fileCopy,
    processes,
    network: {
      egress_kbps: Math.round(Math.random() * 4000),
      ingress_kbps: Math.round(Math.random() * 8000),
      suspicious_dst: chance(0.05) ? rnd(["185.220.101.7", "45.155.205.233", "92.118.39.150"]) : null,
    },
  }), { headers: { ...cors, "Content-Type": "application/json" } });
});

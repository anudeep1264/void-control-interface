// VLAD Ω SOC — keystroke + mouse dynamics collector.
// Lightweight, runs while the SOC page is mounted. Computes simple risk signals.

export interface BiometricSnapshot {
  keystrokes: number;
  avgHoldMs: number;
  avgFlightMs: number;
  errorRate: number;
  wpm: number;
  mouseMoves: number;
  avgVelocity: number;
  clickIntervalsMs: number[];
  botLikelihood: number; // 0..1
  windowSec: number;
}

export class BiometricsCollector {
  private holds: number[] = [];
  private flights: number[] = [];
  private downAt = new Map<string, number>();
  private lastUp = 0;
  private chars = 0;
  private errors = 0;
  private startedAt = Date.now();

  private moves = 0;
  private velocities: number[] = [];
  private lastMove: { x: number; y: number; t: number } | null = null;
  private clicks: number[] = [];

  private onKeyDown = (e: KeyboardEvent) => {
    this.downAt.set(e.code, performance.now());
    if (this.lastUp) this.flights.push(performance.now() - this.lastUp);
    if (e.key === "Backspace") this.errors++;
    if (e.key.length === 1) this.chars++;
  };
  private onKeyUp = (e: KeyboardEvent) => {
    const d = this.downAt.get(e.code);
    if (d) { this.holds.push(performance.now() - d); this.downAt.delete(e.code); }
    this.lastUp = performance.now();
  };
  private onMove = (e: MouseEvent) => {
    this.moves++;
    const now = performance.now();
    if (this.lastMove) {
      const dx = e.clientX - this.lastMove.x;
      const dy = e.clientY - this.lastMove.y;
      const dt = Math.max(1, now - this.lastMove.t);
      this.velocities.push(Math.sqrt(dx * dx + dy * dy) / dt);
    }
    this.lastMove = { x: e.clientX, y: e.clientY, t: now };
  };
  private onClick = () => {
    const now = performance.now();
    if (this.clicks.length) {
      const last = this.clicks[this.clicks.length - 1];
      this.clicks.push(now);
      // keep last 20 intervals
      if (this.clicks.length > 21) this.clicks.shift();
      void last;
    } else this.clicks.push(now);
  };

  start() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("mousemove", this.onMove);
    window.addEventListener("click", this.onClick);
  }
  stop() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("mousemove", this.onMove);
    window.removeEventListener("click", this.onClick);
  }

  snapshot(): BiometricSnapshot {
    const avgHold = avg(this.holds);
    const avgFlight = avg(this.flights);
    const windowSec = (Date.now() - this.startedAt) / 1000;
    const wpm = windowSec > 0 ? (this.chars / 5) / (windowSec / 60) : 0;
    const errorRate = this.chars > 0 ? this.errors / this.chars : 0;
    const avgVelocity = avg(this.velocities);

    // Bot heuristic: extremely consistent flight (low stddev) + very low/zero error
    const flightSd = stddev(this.flights);
    const consistency = flightSd > 0 ? 1 / (1 + flightSd / 30) : 1;
    const robotic = errorRate < 0.005 && this.chars > 30 ? consistency : consistency * 0.4;
    const constantVel = stddev(this.velocities) < 0.05 && this.velocities.length > 30 ? 0.6 : 0;
    const botLikelihood = Math.min(1, robotic * 0.6 + constantVel);

    const intervals = this.clicks.slice(1).map((t, i) => t - this.clicks[i]);
    return {
      keystrokes: this.chars,
      avgHoldMs: Math.round(avgHold),
      avgFlightMs: Math.round(avgFlight),
      errorRate: Math.round(errorRate * 1000) / 1000,
      wpm: Math.round(wpm),
      mouseMoves: this.moves,
      avgVelocity: Math.round(avgVelocity * 100) / 100,
      clickIntervalsMs: intervals.map((n) => Math.round(n)),
      botLikelihood: Math.round(botLikelihood * 100) / 100,
      windowSec: Math.round(windowSec),
    };
  }

  reset() {
    this.holds = []; this.flights = []; this.downAt.clear(); this.lastUp = 0;
    this.chars = 0; this.errors = 0; this.startedAt = Date.now();
    this.moves = 0; this.velocities = []; this.lastMove = null; this.clicks = [];
  }
}

function avg(a: number[]) { return a.length ? a.reduce((s, n) => s + n, 0) / a.length : 0; }
function stddev(a: number[]) {
  if (a.length < 2) return 0;
  const m = avg(a);
  return Math.sqrt(avg(a.map((n) => (n - m) ** 2)));
}

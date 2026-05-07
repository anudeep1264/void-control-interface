import { useEffect, useRef } from "react";

interface Star { x: number; y: number; r: number; speed: number; bright: number; depth: number; }
interface Nebula { x: number; y: number; r: number; hue: number; alpha: number; }
interface Node { x: number; y: number; vx: number; vy: number; r: number; }
interface Comet { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; }

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars: Star[] = [];
    let nebulae: Nebula[] = [];
    let nodes: Node[] = [];
    let comets: Comet[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      init();
    };

    const init = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const count = Math.floor((w * h) / 3500);
      stars = Array.from({ length: count }, () => {
        const depth = Math.random();
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: depth * 1.4 + 0.2,
          speed: depth * 0.25 + 0.02,
          bright: Math.random(),
          depth,
        };
      });
      nebulae = [
        { x: w * 0.15, y: h * 0.2, r: 380, hue: 258, alpha: 0.045 },
        { x: w * 0.85, y: h * 0.35, r: 320, hue: 188, alpha: 0.04 },
        { x: w * 0.5, y: h * 0.85, r: 420, hue: 220, alpha: 0.035 },
        { x: w * 0.7, y: h * 0.7, r: 260, hue: 320, alpha: 0.025 },
        { x: w * 0.1, y: h * 0.75, r: 280, hue: 158, alpha: 0.022 },
      ];
      nodes = Array.from({ length: 14 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.8 + 0.8,
      }));
      comets = [];
    };

    resize();
    window.addEventListener("resize", resize);

    const spawnComet = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const fromLeft = Math.random() > 0.5;
      const speed = 4 + Math.random() * 3;
      const angle = Math.PI * (0.15 + Math.random() * 0.15);
      comets.push({
        x: fromLeft ? -50 : w + 50,
        y: Math.random() * h * 0.6,
        vx: (fromLeft ? 1 : -1) * Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 80 + Math.random() * 40,
      });
    };

    let frame = 0;
    let animId: number;
    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      frame++;

      // Trail fade
      ctx.fillStyle = "rgba(4, 6, 14, 0.18)";
      ctx.fillRect(0, 0, w, h);

      // Nebulae (drift slowly)
      for (const n of nebulae) {
        const drift = Math.sin(frame * 0.002 + n.hue) * 8;
        const grad = ctx.createRadialGradient(n.x + drift, n.y, 0, n.x + drift, n.y, n.r);
        grad.addColorStop(0, `hsla(${n.hue}, 85%, 45%, ${n.alpha})`);
        grad.addColorStop(0.5, `hsla(${n.hue}, 80%, 35%, ${n.alpha * 0.4})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(n.x - n.r + drift, n.y - n.r, n.r * 2, n.r * 2);
      }

      // Stars (parallax + twinkle)
      for (const s of stars) {
        const twinkle = 0.25 + Math.sin(frame * 0.012 + s.bright * 100) * 0.4;
        const hue = s.depth > 0.7 ? 188 : s.depth > 0.4 ? 200 : 220;
        ctx.fillStyle = `hsla(${hue}, 80%, ${75 + s.depth * 15}%, ${twinkle * (0.5 + s.depth * 0.5)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        // Bright stars get a soft halo
        if (s.depth > 0.85) {
          ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${twinkle * 0.15})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
          ctx.fill();
        }
        s.y += s.speed;
        if (s.y > h) { s.y = 0; s.x = Math.random() * w; }
      }

      // Neural nodes with connections
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        const pulse = 0.4 + Math.sin(frame * 0.025 + i) * 0.4;
        // Outer glow
        const glowGrad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 14);
        glowGrad.addColorStop(0, `hsla(188, 100%, 65%, ${pulse * 0.4})`);
        glowGrad.addColorStop(1, "transparent");
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 14, 0, Math.PI * 2);
        ctx.fill();
        // Core
        ctx.fillStyle = `hsla(188, 100%, 75%, ${pulse})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - n.x;
          const dy = nodes[j].y - n.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 280) {
            const lineGrad = ctx.createLinearGradient(n.x, n.y, nodes[j].x, nodes[j].y);
            const a = (1 - dist / 280) * 0.18;
            lineGrad.addColorStop(0, `hsla(188, 100%, 60%, ${a})`);
            lineGrad.addColorStop(1, `hsla(258, 75%, 65%, ${a})`);
            ctx.strokeStyle = lineGrad;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Comets
      if (Math.random() < 0.005 && comets.length < 3) spawnComet();
      comets = comets.filter(c => c.life < c.maxLife && c.x > -100 && c.x < w + 100);
      for (const c of comets) {
        c.x += c.vx;
        c.y += c.vy;
        c.life++;
        const fade = Math.min(1, (c.maxLife - c.life) / 30) * Math.min(1, c.life / 10);
        // Tail
        const tailLen = 60;
        const tx = c.x - c.vx * (tailLen / Math.hypot(c.vx, c.vy));
        const ty = c.y - c.vy * (tailLen / Math.hypot(c.vx, c.vy));
        const tailGrad = ctx.createLinearGradient(c.x, c.y, tx, ty);
        tailGrad.addColorStop(0, `hsla(188, 100%, 80%, ${0.7 * fade})`);
        tailGrad.addColorStop(1, "transparent");
        ctx.strokeStyle = tailGrad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        // Head
        ctx.fillStyle = `hsla(190, 100%, 90%, ${fade})`;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Slow scanning beam
      const scanY = (frame * 0.8) % (h + 80) - 40;
      const scanGrad = ctx.createLinearGradient(0, scanY - 50, 0, scanY + 50);
      scanGrad.addColorStop(0, "transparent");
      scanGrad.addColorStop(0.5, "hsla(188, 100%, 55%, 0.025)");
      scanGrad.addColorStop(1, "transparent");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 50, w, 100);

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />
      {/* Vignette overlay for cinematic depth */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "radial-gradient(ellipse at center, transparent 40%, hsl(224 60% 2% / 0.55) 100%)",
        }}
      />
    </>
  );
};

export default MatrixRain;

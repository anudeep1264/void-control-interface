import { useEffect, useRef } from "react";

/**
 * Lightweight starfield + drifting nebula particles.
 * Subtle, premium — not a matrix rain.
 */
const Starfield = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = (canvas.width = canvas.offsetWidth * devicePixelRatio);
    let h = (canvas.height = canvas.offsetHeight * devicePixelRatio);

    const stars = Array.from({ length: 140 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.2,
      vy: Math.random() * 0.15 + 0.05,
      a: Math.random() * 0.8 + 0.2,
      tw: Math.random() * 0.02 + 0.005,
    }));

    const onResize = () => {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    };
    window.addEventListener("resize", onResize);

    let t = 0;
    const loop = () => {
      t += 1;
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        s.y += s.vy * devicePixelRatio;
        if (s.y > h) {
          s.y = 0;
          s.x = Math.random() * w;
        }
        const tw = Math.sin(t * s.tw) * 0.4 + 0.6;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(189, 70%, 80%, ${s.a * tw})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />
      {/* Cosmic gradient orbs */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-float-slow" />
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-secondary/20 blur-[140px] animate-float-slow" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-0 left-1/3 w-[480px] h-[480px] rounded-full bg-accent/8 blur-[120px] animate-float-slow" style={{ animationDelay: "4s" }} />
    </div>
  );
};

export default Starfield;

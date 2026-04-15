import { useEffect, useRef } from "react";

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars: { x: number; y: number; r: number; speed: number; bright: number }[] = [];
    let nebulae: { x: number; y: number; r: number; hue: number; alpha: number }[] = [];
    let nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const init = () => {
      const count = Math.floor((canvas.width * canvas.height) / 5000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.2,
        speed: Math.random() * 0.2 + 0.03,
        bright: Math.random(),
      }));
      nebulae = Array.from({ length: 5 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 250 + 80,
        hue: [185, 260, 145, 320, 200][Math.floor(Math.random() * 5)],
        alpha: Math.random() * 0.03 + 0.008,
      }));
      // Pulsing neural nodes
      nodes = Array.from({ length: 12 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 1,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    let animId: number;
    const draw = () => {
      frame++;
      ctx.fillStyle = "rgba(3, 5, 12, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Nebulae
      for (const n of nebulae) {
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        grad.addColorStop(0, `hsla(${n.hue}, 80%, 35%, ${n.alpha})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2);
      }

      // Stars
      for (const s of stars) {
        const twinkle = 0.3 + Math.sin(frame * 0.015 + s.bright * 100) * 0.35;
        ctx.fillStyle = `hsla(185, 70%, 80%, ${twinkle})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        s.y += s.speed;
        if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
      }

      // Neural nodes with connections
      ctx.strokeStyle = "hsla(185, 100%, 50%, 0.04)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

        const pulse = 0.3 + Math.sin(frame * 0.03 + i) * 0.3;
        ctx.fillStyle = `hsla(185, 100%, 60%, ${pulse})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + Math.sin(frame * 0.02 + i) * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - n.x;
          const dy = nodes[j].y - n.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 250) {
            ctx.globalAlpha = (1 - dist / 250) * 0.15;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
      }

      // Scanning line
      const scanY = (frame * 1.2) % (canvas.height + 40) - 20;
      const scanGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
      scanGrad.addColorStop(0, "transparent");
      scanGrad.addColorStop(0.5, "hsla(185, 100%, 50%, 0.03)");
      scanGrad.addColorStop(1, "transparent");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 30, canvas.width, 60);

      // Horizontal light streak (occasional)
      if (frame % 400 < 3) {
        const streakY = Math.random() * canvas.height;
        const streakGrad = ctx.createLinearGradient(0, streakY, canvas.width, streakY);
        streakGrad.addColorStop(0, "transparent");
        streakGrad.addColorStop(0.3, "hsla(185, 100%, 70%, 0.06)");
        streakGrad.addColorStop(0.7, "hsla(185, 100%, 70%, 0.06)");
        streakGrad.addColorStop(1, "transparent");
        ctx.fillStyle = streakGrad;
        ctx.fillRect(0, streakY - 1, canvas.width, 2);
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default MatrixRain;

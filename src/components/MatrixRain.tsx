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

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      const count = Math.floor((canvas.width * canvas.height) / 4000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        speed: Math.random() * 0.3 + 0.05,
        bright: Math.random(),
      }));
      nebulae = Array.from({ length: 4 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 200 + 100,
        hue: [185, 260, 145, 320][Math.floor(Math.random() * 4)],
        alpha: Math.random() * 0.04 + 0.01,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    const draw = () => {
      frame++;
      ctx.fillStyle = "rgba(3, 5, 12, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Nebulae
      for (const n of nebulae) {
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        grad.addColorStop(0, `hsla(${n.hue}, 80%, 40%, ${n.alpha})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2);
      }

      // Stars
      for (const s of stars) {
        const twinkle = 0.4 + Math.sin(frame * 0.02 + s.bright * 100) * 0.3;
        ctx.fillStyle = `hsla(185, 80%, 80%, ${twinkle})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();

        s.y += s.speed;
        if (s.y > canvas.height) {
          s.y = 0;
          s.x = Math.random() * canvas.width;
        }
      }

      // Scanning line
      const scanY = (frame * 1.5) % (canvas.height + 40) - 20;
      const scanGrad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      scanGrad.addColorStop(0, "transparent");
      scanGrad.addColorStop(0.5, "hsla(185, 100%, 50%, 0.04)");
      scanGrad.addColorStop(1, "transparent");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 20, canvas.width, 40);
    };

    const interval = setInterval(draw, 40);

    return () => {
      clearInterval(interval);
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
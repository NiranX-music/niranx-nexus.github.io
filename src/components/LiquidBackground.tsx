import { useEffect, useRef } from "react";

/**
 * LiquidBackground — A full-screen animated liquid/mesh gradient
 * that responds subtly to mouse movement, rendered via canvas.
 * Sits behind all content as a fixed overlay.
 */
export function LiquidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX / w, y: e.clientY / h };
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouse);

    // Blob configuration
    const blobs = [
      { x: 0.3, y: 0.3, r: 300, vx: 0.0003, vy: 0.0002, color: "168, 100%, 48%" },
      { x: 0.7, y: 0.6, r: 250, vx: -0.0002, vy: 0.0003, color: "315, 100%, 60%" },
      { x: 0.5, y: 0.2, r: 200, vx: 0.0004, vy: -0.0001, color: "230, 60%, 30%" },
      { x: 0.2, y: 0.8, r: 280, vx: -0.0003, vy: -0.0002, color: "190, 100%, 45%" },
      { x: 0.8, y: 0.3, r: 220, vx: 0.0001, vy: 0.0004, color: "270, 80%, 50%" },
    ];

    let t = 0;

    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, w, h);

      // Dark base
      const isDark = document.documentElement.classList.contains("dark");
      ctx.fillStyle = isDark ? "hsl(230, 25%, 3%)" : "hsl(220, 14%, 96%)";
      ctx.fillRect(0, 0, w, h);

      // Mouse influence
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const blob of blobs) {
        // Move blobs with slight mouse influence
        blob.x += blob.vx + (mx - 0.5) * 0.0001;
        blob.y += blob.vy + (my - 0.5) * 0.0001;

        // Wrap around
        if (blob.x < -0.2) blob.x = 1.2;
        if (blob.x > 1.2) blob.x = -0.2;
        if (blob.y < -0.2) blob.y = 1.2;
        if (blob.y > 1.2) blob.y = -0.2;

        const cx = blob.x * w;
        const cy = blob.y * h;
        const r = blob.r + Math.sin(t * 0.01) * 30;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, `hsla(${blob.color}, ${isDark ? 0.12 : 0.08})`);
        grad.addColorStop(0.5, `hsla(${blob.color}, ${isDark ? 0.05 : 0.03})`);
        grad.addColorStop(1, `hsla(${blob.color}, 0)`);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // Subtle noise overlay
      if (isDark) {
        ctx.fillStyle = `hsla(230, 25%, 3%, 0.3)`;
        ctx.fillRect(0, 0, w, h);
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouse);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
      aria-hidden="true"
    />
  );
}

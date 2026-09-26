import { useEffect, useRef } from "react";

/** Canvas particles forming text; scatter on load, gather, repel from cursor. */
export function ParticleText({ text = "SEVEN MAX", height = 120, className = "" }: { text?: string; height?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio, 2);
    let w = 0, h = 0;
    type P = { x: number; y: number; tx: number; ty: number; vx: number; vy: number };
    let parts: P[] = [];
    const mouse = { x: -9999, y: -9999 };

    const build = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const off = document.createElement("canvas");
      off.width = w; off.height = h;
      const o = off.getContext("2d")!;
      const size = Math.min(h * 0.75, (w / text.length) * 1.6);
      o.font = `700 ${size}px Marcellus, serif`;
      o.textAlign = "center"; o.textBaseline = "middle";
      o.fillStyle = "#fff";
      o.fillText(text, w / 2, h / 2);
      const img = o.getImageData(0, 0, w, h).data;
      const step = w < 500 ? 3 : 4;
      const next: P[] = [];
      for (let y = 0; y < h; y += step)
        for (let x = 0; x < w; x += step)
          if (img[(y * w + x) * 4 + 3] > 128)
            next.push({ x: Math.random() * w, y: Math.random() * h, tx: x, ty: y, vx: 0, vy: 0 });
      parts = next;
    };
    build();

    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    };
    const leave = () => { mouse.x = -9999; mouse.y = -9999; };
    const scatter = () => parts.forEach((p) => { p.vx += (Math.random() - 0.5) * 30; p.vy += (Math.random() - 0.5) * 30; });
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerleave", leave);
    canvas.addEventListener("click", scatter);
    window.addEventListener("resize", build);

    let raf = 0;
    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#f8fafc";
      ctx.shadowColor = "#92212d";
      ctx.shadowBlur = 8;
      for (const p of parts) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 3600) {
          const f = (3600 - d2) / 3600;
          p.vx += (dx / Math.sqrt(d2 + 1)) * f * 4;
          p.vy += (dy / Math.sqrt(d2 + 1)) * f * 4;
        }
        p.vx += (p.tx - p.x) * 0.06; p.vy += (p.ty - p.y) * 0.06;
        p.vx *= 0.82; p.vy *= 0.82;
        p.x += p.vx; p.y += p.vy;
        ctx.fillRect(p.x, p.y, 1.8, 1.8);
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("click", scatter);
      window.removeEventListener("resize", build);
    };
  }, [text]);

  return <canvas ref={ref} style={{ height }} className={`w-full cursor-crosshair ${className}`} aria-label={text} role="img" />;
}

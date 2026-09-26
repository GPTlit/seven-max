import { useRef, useState, type ReactNode } from "react";

/** Holographic 3D tilt card (VIP pass). */
export function ProfileCard({ children, active = true }: { children: ReactNode; active?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState({ rx: 0, ry: 0, px: 50, py: 50 });
  const move = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 100;
    const py = ((e.clientY - r.top) / r.height) * 100;
    setS({ rx: (50 - py) / 4, ry: (px - 50) / 4, px, py });
  };
  return (
    <div style={{ perspective: 1000 }} className="mx-auto w-full max-w-sm">
      <div
        ref={ref}
        onPointerMove={move}
        onPointerLeave={() => setS({ rx: 0, ry: 0, px: 50, py: 50 })}
        className="relative aspect-[1.6] overflow-hidden rounded-3xl border border-gold/40 bg-gradient-crimson transition-transform duration-150 ease-out"
        style={{ transform: `rotateX(${s.rx}deg) rotateY(${s.ry}deg)`, transformStyle: "preserve-3d", filter: active ? undefined : "grayscale(0.8)" }}
      >
        <div
          className="pointer-events-none absolute inset-0 mix-blend-color-dodge opacity-60"
          style={{
            background: `radial-gradient(circle at ${s.px}% ${s.py}%, oklch(1 0 0 / 0.55), transparent 45%),
              linear-gradient(${115 + s.ry * 3}deg, oklch(0.8 0.15 20 / 0.4), oklch(0.85 0.12 85 / 0.5), oklch(0.7 0.12 300 / 0.35), oklch(0.8 0.12 180 / 0.35))`,
          }}
        />
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent 0 6px, oklch(1 0 0 / .15) 6px 7px)" }} />
        <div className="relative h-full p-5" style={{ transform: "translateZ(40px)" }}>{children}</div>
      </div>
    </div>
  );
}

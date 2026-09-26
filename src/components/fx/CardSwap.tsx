import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/** GSAP 3D stacked card carousel; front card drops to the back every `delay` ms. */
export function CardSwap<T>({
  items,
  render,
  delay = 5000,
  onFrontChange,
}: {
  items: T[];
  render: (item: T) => React.ReactNode;
  delay?: number;
  onFrontChange?: (i: number) => void;
}) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [order, setOrder] = useState(() => items.map((_, i) => i));

  useEffect(() => setOrder(items.map((_, i) => i)), [items.length]);

  const place = (ord: number[], animate: boolean) => {
    ord.forEach((idx, slot) => {
      const el = refs.current[idx];
      if (!el) return;
      const props = { x: slot * 26, y: -slot * 22, z: -slot * 60, rotateY: -8, skewY: 2, zIndex: ord.length - slot, opacity: slot > 3 ? 0 : 1 };
      animate ? gsap.to(el, { ...props, duration: 0.9, ease: "power3.out" }) : gsap.set(el, props);
    });
  };

  useEffect(() => {
    place(order, false);
    onFrontChange?.(order[0]);
  }, [order.length]);

  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => {
      setOrder((prev) => {
        const [front, ...rest] = prev;
        const el = refs.current[front];
        const next = [...rest, front];
        if (el) {
          gsap.timeline()
            .to(el, { y: 260, opacity: 0, duration: 0.6, ease: "power2.in" })
            .add(() => place(next, true))
            .set(el, { zIndex: 0 })
            .to(el, { opacity: 1, duration: 0.4 });
        }
        onFrontChange?.(next[0]);
        return next;
      });
    }, delay);
    return () => clearInterval(id);
  }, [items.length, delay]);

  return (
    <div className="relative h-full w-full" style={{ perspective: 900 }}>
      {items.map((it, i) => (
        <div
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          className="absolute bottom-0 start-0 h-[88%] w-[62%] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          style={{ transformStyle: "preserve-3d" }}
        >
          {render(it)}
        </div>
      ))}
    </div>
  );
}

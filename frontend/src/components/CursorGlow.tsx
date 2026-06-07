"use client";

import { useEffect, useRef } from "react";

/**
 * Subtle radial-gradient glow that follows the cursor across the landing page.
 * Uses CSS custom properties + mix-blend-mode so it washes color over the dark
 * background without ever obscuring text (pointer-events disabled, decorative only).
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--glow-x", `${e.clientX}px`);
        el.style.setProperty("--glow-y", `${e.clientY}px`);
        el.style.opacity = "1";
      });
    };
    const hide = () => {
      el.style.opacity = "0";
    };

    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 opacity-0 transition-opacity duration-700 ease-out"
      style={{
        mixBlendMode: "screen",
        background:
          "radial-gradient(560px circle at var(--glow-x, 50%) var(--glow-y, 35%), rgba(124,58,237,0.18), rgba(236,72,153,0.08) 45%, transparent 70%)",
      }}
    />
  );
}

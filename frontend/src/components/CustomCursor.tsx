"use client";

import { useEffect, useRef } from "react";

const ACCENT = "#a855f7";
const ACCENT_DEEP = "#7c3aed";
const HOVER_SELECTOR = "a, button, [role='button'], input, textarea, select, summary";

/**
 * Replaces the native OS cursor with a small dot + trailing ring (brand purple).
 * Ring position is lerp-eased toward the pointer for a smooth trailing feel;
 * the dot tracks the pointer 1:1. Both are driven from a single rAF loop so the
 * full `transform` string (including hover scale) is set in one go — mixing
 * Tailwind transform classes with direct style writes would silently conflict.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.classList.add("custom-cursor-active");

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let ringX = targetX;
    let ringY = targetY;
    let hovering = false;
    let visible = false;
    let raf = 0;

    const setVisible = (next: boolean) => {
      if (visible === next) return;
      visible = next;
      const opacity = next ? "1" : "0";
      dot.style.opacity = opacity;
      ring.style.opacity = opacity;
    };

    const move = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setVisible(true);

      const target = e.target as Element | null;
      hovering = !!target?.closest(HOVER_SELECTOR);

      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
    };

    const tick = () => {
      const ease = reduceMotion ? 1 : 0.18;
      ringX += (targetX - ringX) * ease;
      ringY += (targetY - ringY) * ease;
      const scale = hovering ? 1.6 : 1;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${scale})`;
      ring.style.borderColor = hovering ? ACCENT : ACCENT_DEEP;
      ring.style.backgroundColor = hovering ? `${ACCENT}1a` : "transparent";
      raf = requestAnimationFrame(tick);
    };

    const hide = () => setVisible(false);

    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] w-1.5 h-1.5 rounded-full opacity-0 transition-opacity duration-300 ease-out"
        style={{ background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] w-8 h-8 rounded-full border opacity-0 transition-[opacity,border-color,background-color] duration-300 ease-out"
        style={{ borderColor: ACCENT_DEEP }}
      />
    </>
  );
}

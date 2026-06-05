"use client";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-6 mt-4">
        <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between">
          <Logo />
          <nav aria-label="주요 메뉴" className="hidden md:flex items-center gap-8 text-sm text-ink-50/80">
            <a href="#features" className="hover:text-white transition">기능</a>
            <a href="#cases" className="hover:text-white transition">사례</a>
            <a href="#how" className="hover:text-white transition">동작 원리</a>
            <a href="#pricing" className="hover:text-white transition">요금제</a>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 text-sm rounded-xl hover:bg-white/5">로그인</Link>
            <Link href="/signup" className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-brand-600 to-fuchsia-600 hover:opacity-90 transition shadow-lg shadow-brand-900/40">
              무료로 시작
            </Link>
          </div>
          <button
            className="md:hidden p-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="메뉴"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.nav
              id="mobile-menu"
              aria-label="모바일 메뉴"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden glass rounded-2xl mt-2 px-4 py-3 flex flex-col gap-2"
            >
              <a href="#features" onClick={() => setOpen(false)} className="py-2">기능</a>
              <a href="#cases" onClick={() => setOpen(false)} className="py-2">사례</a>
              <a href="#how" onClick={() => setOpen(false)} className="py-2">동작 원리</a>
              <a href="#pricing" onClick={() => setOpen(false)} className="py-2">요금제</a>
              <Link href="/login" className="py-2">로그인</Link>
              <Link href="/signup" className="py-2 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-fuchsia-600 text-center">무료로 시작</Link>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

"use client";
import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 group ${className}`}>
      <span className="relative w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-500 to-fuchsia-500 grid place-items-center shadow-lg shadow-brand-700/30">
        <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white relative">
          <path d="M4 5h16a1 1 0 0 1 1 1v10a2 2 0 0 1-2 2H8l-4 4V6a1 1 0 0 1 1-1z" fill="currentColor" />
          <circle cx="9" cy="11" r="1.4" fill="#0b0b10" />
          <circle cx="13" cy="11" r="1.4" fill="#0b0b10" />
          <circle cx="17" cy="11" r="1.4" fill="#0b0b10" />
        </svg>
      </span>
      <span className="font-display font-bold tracking-tight text-xl">
        Vivitalk
      </span>
    </Link>
  );
}

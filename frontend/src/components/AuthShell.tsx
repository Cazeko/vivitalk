"use client";
import { Logo } from "./Logo";
import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  alt,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  alt: { label: string; href: string; cta: string };
}) {
  return (
    <main className="min-h-screen aurora-bg flex items-center justify-center p-6">
      <div className="absolute top-6 left-6"><Logo /></div>
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl p-8 shadow-2xl shadow-black/40">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-ink-50/70 text-sm">{subtitle}</p>}
          <div className="mt-7">{children}</div>
        </div>
        <p className="mt-5 text-center text-sm text-ink-50/70">
          {alt.label}{" "}
          <Link href={alt.href} className="text-brand-300 hover:underline font-medium">
            {alt.cta}
          </Link>
        </p>
      </div>
    </main>
  );
}

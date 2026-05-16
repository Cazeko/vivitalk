import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <Logo />
        <div className="text-sm text-ink-50/50 text-center md:text-right">
          © 2026 Vivitalk. All rights reserved. ·
          <span className="ml-2">Made with 3D + RAG.</span>
        </div>
      </div>
    </footer>
  );
}

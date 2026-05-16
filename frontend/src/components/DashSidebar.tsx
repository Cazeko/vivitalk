"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { useAuthStore } from "@/stores/authStore";

const NAV = [
  { href: "/dashboard", label: "대시보드", icon: "M3 12l9-9 9 9v9a2 2 0 0 1-2 2h-4v-7H10v7H6a2 2 0 0 1-2-2v-9z" },
  { href: "/dashboard/chatbots", label: "챗봇", icon: "M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" },
  { href: "/dashboard/billing", label: "결제", icon: "M3 7h18v10H3zm2 2v6h14V9z" },
];

export function DashSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-white/5 bg-ink-900/60 backdrop-blur sticky top-0 h-screen">
      <div className="px-5 pt-5 pb-3"><Logo /></div>
      <nav className="px-2 py-2 flex-1 space-y-1">
        {NAV.map((n) => {
          const active = pathname === n.href || (n.href !== "/dashboard" && pathname.startsWith(n.href));
          return (
            <Link key={n.href} href={n.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${active ? "bg-white/10 text-white" : "text-ink-50/70 hover:bg-white/5 hover:text-white"}`}>
              <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="currentColor" d={n.icon} /></svg>
              <span>{n.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-3 border-t border-white/5">
        <div className="px-2 mb-2 text-xs text-ink-50/50">로그인 계정</div>
        <div className="px-2 py-2 rounded-xl bg-white/5">
          <div className="text-sm font-medium truncate">{user?.email}</div>
          <div className="text-xs text-ink-50/50 truncate">{user?.company_name || "개인"}</div>
        </div>
        <button onClick={logout} className="mt-2 w-full text-left px-2 py-2 text-sm text-ink-50/60 hover:text-rose-300 transition">
          로그아웃
        </button>
      </div>
    </aside>
  );
}

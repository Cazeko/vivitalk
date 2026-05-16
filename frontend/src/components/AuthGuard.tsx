"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { hydrate, hydrated, isAuthenticated } = useAuthStore();

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen aurora-bg grid place-items-center">
        <div className="text-ink-50/60 text-sm">로딩 중…</div>
      </div>
    );
  }
  if (!isAuthenticated) return null;
  return <>{children}</>;
}

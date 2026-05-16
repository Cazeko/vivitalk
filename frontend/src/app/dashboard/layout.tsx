import { AuthGuard } from "@/components/AuthGuard";
import { DashSidebar } from "@/components/DashSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen aurora-bg flex">
        <DashSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </AuthGuard>
  );
}

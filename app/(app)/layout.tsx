"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

const ADMIN_ONLY = ["/dashboard", "/students", "/bookings", "/payments", "/analytics"];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    // Redirect students away from admin-only pages
    if (user.role === "student" && ADMIN_ONLY.some(p => pathname.startsWith(p))) {
      router.replace("/my-portal");
    }
  }, [user, router, pathname]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 min-h-screen">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

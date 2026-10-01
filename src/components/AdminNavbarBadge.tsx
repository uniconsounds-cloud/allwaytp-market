"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

interface AdminUser {
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "EA_ADMIN";
}

export default function AdminNavbarBadge() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    async function checkAdminSession() {
      try {
        const res = await fetch("/api/admin/auth");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setAdminUser(data.user);
          }
        }
      } catch {
        // Not logged in or error -> do nothing
      }
    }
    checkAdminSession();
  }, []);

  if (!adminUser) return null;

  const isSuper = adminUser.role === "SUPER_ADMIN";

  return (
    <Link
      href="/admin"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-[#D4AF37] text-xs font-bold transition shadow-sm font-mono animate-fadeIn"
      title="คลิกเพื่อเข้าสู่แผงควบคุมระบบ"
    >
      <LayoutDashboard className="w-3.5 h-3.5" />
      <span>{isSuper ? "👑 แผงควบคุม (superadmin)" : "🛡️ แผงควบคุม (admin)"}</span>
    </Link>
  );
}

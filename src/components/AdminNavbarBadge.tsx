"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface AdminUser {
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "EA_ADMIN";
}

export default function AdminNavbarBadge() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    async function checkAndSyncSession() {
      try {
        // 1. Check existing cookie
        const res = await fetch("/api/admin/auth");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setAdminUser(data.user);
            return;
          }
        }

        // 2. If cookie not set yet, check if Supabase has a Google session in browser
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          const syncRes = await fetch("/api/admin/auth/google-sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: session.user.email }),
          });
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            if (syncData.user) {
              setAdminUser(syncData.user);
            }
          }
        }
      } catch {
        // Not logged in or error
      }
    }

    checkAndSyncSession();

    // Listen to login/logout events in Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user?.email) {
        try {
          const syncRes = await fetch("/api/admin/auth/google-sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: session.user.email }),
          });
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            setAdminUser(syncData.user);
          }
        } catch {}
      } else if (event === "SIGNED_OUT") {
        setAdminUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
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

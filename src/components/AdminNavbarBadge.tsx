"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, User, LogIn } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface AdminUser {
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "EA_ADMIN";
}

export default function AdminNavbarBadge() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        // 1. Check existing admin cookie
        const res = await fetch("/api/admin/auth");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setAdminUser(data.user);
            setLoaded(true);
            return;
          }
        }

        // 2. Check Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          const email = session.user.email.toLowerCase();
          if (email === "juntarasate@gmail.com" || email === "bctutor123@gmail.com") {
            const syncRes = await fetch("/api/admin/auth/google-sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            });
            if (syncRes.ok) {
              const syncData = await syncRes.json();
              if (syncData.user) {
                setAdminUser(syncData.user);
                setLoaded(true);
                return;
              }
            }
          } else {
            setCustomerEmail(email);
          }
        }
      } catch {
        // Not logged in
      } finally {
        setLoaded(true);
      }
    }

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user?.email) {
        const email = session.user.email.toLowerCase();
        if (email === "juntarasate@gmail.com" || email === "bctutor123@gmail.com") {
          try {
            const syncRes = await fetch("/api/admin/auth/google-sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            });
            if (syncRes.ok) {
              const syncData = await syncRes.json();
              setAdminUser(syncData.user);
            }
          } catch {}
        } else {
          setCustomerEmail(email);
        }
      } else if (event === "SIGNED_OUT") {
        setAdminUser(null);
        setCustomerEmail(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (!loaded) return null;

  if (adminUser) {
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

  if (customerEmail) {
    return (
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-amber-500/40 bg-surface-100 hover:bg-surface-200 text-[#D4AF37] text-xs font-bold transition shadow-sm animate-fadeIn"
        title="ไปยังหน้าพอร์ตและดาวน์โหลด EA"
      >
        <User className="w-3.5 h-3.5" />
        <span>พอร์ตของฉัน</span>
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-gray-700 hover:border-gold-500/40 text-xs font-semibold text-gray-300 hover:text-white transition shadow-sm"
    >
      <LogIn className="w-3.5 h-3.5 text-amber-400" />
      <span>เข้าสู่ระบบ</span>
    </Link>
  );
}

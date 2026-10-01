"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { RefreshCw, ShieldAlert, CheckCircle2 } from "lucide-react";
import Link from "next/link";

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    async function handleAuth() {
      try {
        const errorParam = searchParams.get("error_description") || searchParams.get("error");
        if (errorParam) {
          throw new Error(decodeURIComponent(errorParam));
        }

        const code = searchParams.get("code");
        let userEmail: string | null = null;

        if (code) {
          // PKCE code exchange
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          userEmail = data.session?.user?.email || null;
        }

        if (!userEmail) {
          // Check existing or hash session
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;
          userEmail = session?.user?.email || null;
        }

        if (!userEmail) {
          // Check current user state
          const { data: { user } } = await supabase.auth.getUser();
          userEmail = user?.email || null;
        }

        if (!userEmail) {
          throw new Error("ไม่พบข้อมูลบัญชีผู้ใช้ Google กรุณาลองเข้าสู่ระบบใหม่อีกครั้ง");
        }

        // Sync admin session cookie on backend
        const syncRes = await fetch("/api/admin/auth/google-sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        });

        const syncData = await syncRes.json();
        if (!syncRes.ok) {
          throw new Error(syncData.error || "อีเมลนี้ไม่มีสิทธิ์เข้าถึงระบบผู้ดูแล");
        }

        setStatus("success");
        // Force full navigation to /admin to ensure session cookie is attached
        window.location.href = "/admin";
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      }
    }

    handleAuth();
  }, [searchParams]);

  return (
    <div className="w-full max-w-md bg-[#0f141f] border border-slate-800 rounded-2xl p-8 text-center shadow-2xl relative z-10">
      {status === "loading" && (
        <div className="space-y-4">
          <RefreshCw className="w-9 h-9 text-amber-400 animate-spin mx-auto" />
          <h2 className="text-lg font-bold text-white">กำลังยืนยันตัวตนกับ Google...</h2>
          <p className="text-xs text-slate-400">กรุณารอสักครู่ ระบบกำลังนำท่านเข้าสู่แผงควบคุมผู้ดูแล</p>
        </div>
      )}

      {status === "success" && (
        <div className="space-y-4">
          <CheckCircle2 className="w-9 h-9 text-emerald-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">ยืนยันตัวตนสำเร็จ!</h2>
          <p className="text-xs text-slate-400">กำลังเปิดแผงควบคุมระบบ AllwayTP Admin...</p>
        </div>
      )}

      {status === "error" && (
        <div className="space-y-4">
          <ShieldAlert className="w-9 h-9 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">ไม่สามารถเข้าสู่ระบบได้</h2>
          <p className="text-xs text-red-300 leading-relaxed bg-red-950/40 p-3 rounded-xl border border-red-500/30">
            {errorMessage}
          </p>
          <div className="pt-2">
            <Link
              href="/admin/login"
              className="inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs transition shadow-lg"
            >
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
      <Suspense fallback={<div className="text-xs text-slate-500 font-mono">กำลังประมวลผล...</div>}>
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}

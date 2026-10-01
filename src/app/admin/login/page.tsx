"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, ShieldAlert, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }

    // Auto-sync if user just returned with an active Supabase session
    const checkActiveSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          const res = await fetch("/api/admin/auth/google-sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: session.user.email }),
          });
          if (res.ok) {
            window.location.href = "/admin";
          }
        }
      } catch {}
    };
    checkActiveSession();
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      setError(
        err.message?.includes("Unsupported provider")
          ? "Google OAuth ยังไม่ได้เปิดใช้งานในระบบ Supabase กรุณาเข้าสู่ระบบด้วยอีเมลและรหัสผ่านด้านล่าง"
          : err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sign-in"
      );
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "เข้าสู่ระบบไม่สำเร็จ ตรวจสอบอีเมลหรือรหัสผ่าน");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-block group mb-4">
          <div className="relative w-20 h-20 mx-auto rounded-2xl overflow-hidden border border-amber-500/30 p-1 bg-black/60 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
            <Image
              src="/images/zenx-logo.jpg"
              alt="Zen X Academy"
              width={80}
              height={80}
              className="w-full h-full object-cover rounded-xl"
              priority
            />
          </div>
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-300 mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin Control Portal</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          เข้าสู่ระบบจัดการ <span className="text-amber-400">AllwayTP</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          พอร์ทัลควบคุมลิขสิทธิ์ EA จัดการสินค้า และมอนิเตอร์ระบบ
        </p>
      </div>

      {/* Login Box */}
      <div className="bg-[#0f141f]/90 border border-slate-800/90 rounded-2xl p-7 shadow-2xl backdrop-blur-xl">
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* 1. Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-60"
        >
          {googleLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>{googleLoading ? "กำลังเชื่อมต่อ Google..." : "เข้าสู่ระบบด้วย Google"}</span>
        </button>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-[#0f141f] px-2 text-slate-500 font-semibold tracking-wider">
              หรือเข้าสู่ระบบด้วยอีเมล
            </span>
          </div>
        </div>

        {/* 2. Direct Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              อีเมลผู้ดูแลระบบ (Email)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juntarasate@gmail.com หรือ bctutor123@gmail.com"
                required
                className="w-full bg-[#0a0d14] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/50 transition font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#0a0d14] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/50 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition transform active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>กำลังตรวจสอบสิทธิ์...</span>
            ) : (
              <>
                <span>เข้าสู่ระบบด้วยรหัสผ่าน</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Account Info Notice */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-medium text-slate-300">สิทธิ์ผู้ดูแลระบบ:</span>
            <span className="text-amber-400 font-mono">Authorized Accounts</span>
          </div>
          <div className="bg-black/40 rounded-xl p-3 border border-slate-800 text-[11px] space-y-1.5 font-mono">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">juntarasate@gmail.com</span>
              <span className="text-amber-400 font-bold text-[10px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                superadmin
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">bctutor123@gmail.com</span>
              <span className="text-blue-400 font-bold text-[10px] bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                admin
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal pt-1">
            * สามารถกด "เข้าสู่ระบบด้วย Google" ได้ทันที หรือป้อนอีเมลและรหัสผ่านเริ่มต้น (admin1234)
          </p>
        </div>
      </div>

      {/* Back to Home link */}
      <div className="text-center mt-6">
        <Link
          href="/"
          className="text-xs text-slate-500 hover:text-amber-400 transition inline-flex items-center gap-1"
        >
          ← กลับสู่หน้าหลัก AllwayTP Market
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
      <Suspense fallback={<div className="text-xs text-slate-500 font-mono">กำลังโหลด...</div>}>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}

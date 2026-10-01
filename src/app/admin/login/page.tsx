"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, ShieldAlert, ArrowRight, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

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
            <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                อีเมลผู้ดูแลระบบ (Admin Email)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@allwaytp.com"
                  required
                  className="w-full bg-[#0a0d14] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/50 transition"
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
                  className="w-full bg-[#0a0d14] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/50 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-sm rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition transform active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>กำลังตรวจสอบสิทธิ์...</span>
              ) : (
                <>
                  <span>เข้าสู่ระบบผู้ดูแล</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Role access notice */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-medium text-slate-300">สิทธิ์ของบทบาทในระบบ:</span>
              <span className="text-amber-400 font-mono">Role System</span>
            </div>
            <p className="leading-relaxed">
              • <strong className="text-amber-300">Super Admin:</strong> ดูแลทุกฟังก์ชัน + แดชบอร์ดตรวจสอบทราฟฟิกและสถานะเซิร์ฟเวอร์<br />
              • <strong className="text-slate-300">EA Admin:</strong> จัดการสินค้า EA อนุมัติและติดตามสิทธิ์พอร์ต
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
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ShieldCheck, 
  DownloadCloud, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  LogOut, 
  Plus, 
  Activity, 
  Layers, 
  ExternalLink,
  Sparkles,
  Calendar
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface CustomerLicense {
  id: string;
  ea_code: string;
  account_number: string;
  broker_server: string;
  client_name: string | null;
  client_email: string | null;
  status: "ACTIVE" | "PENDING" | "REVOKED" | "EXPIRED";
  expires_at: string | null;
  balance: number;
  equity: number;
  floating_pnl: number;
  account_currency: string;
  last_seen_at: string | null;
  ping_count: number;
  eas?: {
    name: string;
    description: string;
    pair: string;
    timeframe: string;
    download_url: string | null;
    version: string;
    images?: string[];
  };
}

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [licenses, setLicenses] = useState<CustomerLicense[]>([]);

  useEffect(() => {
    async function loadCustomerData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.email) {
          router.replace("/login");
          return;
        }

        setUserEmail(user.email);

        // Fetch licenses for this customer's email
        const res = await fetch(`/api/customer/licenses?email=${encodeURIComponent(user.email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.licenses) {
            setLicenses(data.licenses);
          }
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCustomerData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await fetch("/api/admin/auth", { method: "DELETE" }).catch(() => {});
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
          <span className="text-xs font-mono">กำลังโหลดข้อมูลพอร์ตของคุณ...</span>
        </div>
      </div>
    );
  }

  const activeCount = licenses.filter((l) => l.status === "ACTIVE").length;
  const pendingCount = licenses.filter((l) => l.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <Link href="/" className="shrink-0">
              <img 
                src="/images/zenx-logo.jpg" 
                alt="Zen X Academy" 
                className="w-12 h-12 rounded-full border border-gold-500/60 object-cover shadow-lg" 
              />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-[#D4AF37] border border-amber-500/30">
                  Customer Portal
                </span>
                <span className="text-xs text-gray-400 font-mono">{userEmail}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                พอร์ตและรายการ EA ของฉัน
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/register-license"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3C64F] to-[#B8860B] hover:brightness-110 text-black text-xs font-bold shadow-lg shadow-amber-950/40 transition-all"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>ขอสิทธิ์พอร์ตใหม่</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-gray-700 text-xs font-semibold text-gray-300 hover:text-white transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-surface-100 border border-gray-800">
            <span className="text-xs text-gray-400 block mb-1">พอร์ตทั้งหมดที่ขอสิทธิ์</span>
            <div className="text-2xl font-black text-white font-mono">{licenses.length}</div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-100 border border-gold-500/30 bg-amber-950/10">
            <span className="text-xs text-[#D4AF37] block mb-1">เปิดใช้งานแล้ว (Active)</span>
            <div className="text-2xl font-black text-[#D4AF37] font-mono">{activeCount}</div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-100 border border-yellow-500/30 bg-yellow-950/10">
            <span className="text-xs text-yellow-400 block mb-1">รอตรวจสอบ (Pending)</span>
            <div className="text-2xl font-black text-yellow-400 font-mono">{pendingCount}</div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-100 border border-blue-500/30 bg-blue-950/10">
            <span className="text-xs text-blue-400 block mb-1">โบรกเกอร์ที่รองรับ</span>
            <div className="text-base font-bold text-white font-mono mt-1">Versus Trade</div>
          </div>
        </div>

        {/* License Cards Grid */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#D4AF37]" />
            <span>รายการระบบ EA ประจำพอร์ตของคุณ</span>
          </h2>

          {licenses.length === 0 ? (
            <div className="rounded-2xl bg-surface-100 border border-gray-800 p-12 text-center space-y-4">
              <ShieldCheck className="w-12 h-12 text-gray-600 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-white">ยังไม่มีพอร์ตที่ลงทะเบียนขอสิทธิ์</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                  เมื่อคุณเปิดบัญชีกับ Versus Trade และลงทะเบียนขอสิทธิ์ใช้งาน EA พอร์ตของคุณจะปรากฏที่หน้านี้เพื่อติดตามผลและดาวน์โหลดไฟล์ EA
                </p>
              </div>
              <Link
                href="/register-license"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black font-extrabold text-xs shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>ลงทะเบียนขอสิทธิ์พอร์ตแรก</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {licenses.map((lic) => {
                const eaName = lic.eas?.name || lic.ea_code;
                const eaImage = lic.eas?.images?.[0] || 
                  (lic.ea_code.includes("RECON") ? "/images/ea-recon-100.jpg" :
                   lic.ea_code.includes("RANGER") ? "/images/ea-ranger-500.jpg" :
                   "/images/ea-delta-1500.jpg");

                const expiryText = lic.expires_at 
                  ? new Date(lic.expires_at).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })
                  : "ใช้งานได้ตลอดชีพ (Lifetime)";

                return (
                  <div
                    key={lic.id}
                    className="rounded-2xl bg-surface-100 border border-gray-800 p-6 flex flex-col justify-between hover:border-gold-500/40 transition-all shadow-xl"
                  >
                    <div className="space-y-4">
                      {/* Top Bar: EA Image & Name & Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black/60 border border-gray-800 shrink-0">
                            <img src={eaImage} alt={eaName} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-amber-400 font-bold block">{lic.ea_code}</span>
                            <h3 className="text-base font-bold text-white">{eaName}</h3>
                            <span className="text-[11px] text-gray-400 font-mono">
                              พอร์ต: {lic.account_number} ({lic.broker_server})
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {lic.status === "ACTIVE" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gold-500/10 text-[#D4AF37] border border-gold-500/30">
                              <CheckCircle2 className="w-3 h-3" /> เปิดใช้งาน
                            </span>
                          )}
                          {lic.status === "PENDING" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                              <Clock className="w-3 h-3" /> รออนุมัติ
                            </span>
                          )}
                          {lic.status === "EXPIRED" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              <AlertTriangle className="w-3 h-3" /> หมดอายุ
                            </span>
                          )}
                          {lic.status === "REVOKED" && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                              <XCircle className="w-3 h-3" /> ระงับสิทธิ์
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expiration date */}
                      <div className="p-3 rounded-xl bg-[#0c0e14] border border-gray-800/80 flex items-center justify-between text-xs">
                        <span className="text-gray-400 flex items-center gap-1.5 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>กำหนดวันหมดอายุ:</span>
                        </span>
                        <span className={`font-mono font-semibold ${lic.status === "EXPIRED" ? "text-rose-400" : "text-white"}`}>
                          {expiryText}
                        </span>
                      </div>

                      {/* Telemetry info if pinged */}
                      {lic.ping_count > 0 && (
                        <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-[#0c0e14] border border-gray-800/80">
                          <div>
                            <span className="text-gray-500 text-[10px] block">ยอดเงินในพอร์ต (Balance)</span>
                            <span className="font-mono font-bold text-white">
                              ${Number(lic.balance).toLocaleString()} {lic.account_currency}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 text-[10px] block">Equity / กำไรลอยตัว</span>
                            <span className="font-mono font-bold text-gray-300">
                              ${Number(lic.equity).toLocaleString()}
                              {lic.floating_pnl !== 0 && (
                                <span className={lic.floating_pnl > 0 ? " text-emerald-400 ml-1 text-[10px]" : " text-rose-400 ml-1 text-[10px]"}>
                                  ({lic.floating_pnl > 0 ? "+" : ""}{Number(lic.floating_pnl).toFixed(2)})
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Download / Action section */}
                    <div className="pt-4 mt-4 border-t border-gray-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-gray-500">
                        {lic.status === "ACTIVE" ? "สิทธิ์พร้อมใช้งานบน MT4/MT5" : "กรุณารอแอดมินอนุมัติสิทธิ์"}
                      </span>

                      {lic.status === "ACTIVE" && lic.eas?.download_url ? (
                        <a
                          href={lic.eas.download_url}
                          download
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold text-xs shadow-md transition"
                        >
                          <DownloadCloud className="w-3.5 h-3.5" />
                          <span>ดาวน์โหลดไฟล์ EA</span>
                        </a>
                      ) : (
                        <span className="text-xs text-gray-600 font-mono">
                          {lic.status === "ACTIVE" ? "ไฟล์ EA พร้อมส่งมอบ" : "ยังไม่เปิดให้ดาวน์โหลด"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

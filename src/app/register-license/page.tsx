"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

function RegisterLicenseForm() {
  const searchParams = useSearchParams();
  const defaultEa = searchParams.get("ea") || "RECON_100";

  const [formData, setFormData] = useState({
    eaCode: defaultEa,
    accountNumber: "",
    brokerServer: "VersusTrade-Live",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (searchParams.get("ea")) {
      setFormData(prev => ({ ...prev, eaCode: searchParams.get("ea") || "RECON_100" }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (!formData.accountNumber.trim()) {
      setErrorMsg("กรุณาระบุเลขที่บัญชีเทรด (Account Number)");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.from("licenses").insert([
        {
          ea_code: formData.eaCode,
          account_number: formData.accountNumber.trim(),
          broker_server: formData.brokerServer,
          client_name: formData.clientName.trim() || null,
          client_email: formData.clientEmail.trim() || null,
          client_phone: formData.clientPhone.trim() || null,
          notes: formData.notes.trim() || null,
          status: "PENDING",
        },
      ]);

      if (error) {
        if (error.code === "23505") {
          setErrorMsg("เลขบัญชีนี้ได้รับการลงทะเบียนสำหรับ EA ตัวนี้ในระบบแล้ว กรุณาติดต่อผู้ดูแลเพื่อตรวจสอบสถานะ");
        } else {
          setErrorMsg(`เกิดข้อผิดพลาด: ${error.message}`);
        }
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>กลับหน้าหลัก Marketplace</span>
      </Link>

      <div className="rounded-3xl bg-surface-100 border border-gray-800 p-8 sm:p-10 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#00E599]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">ลงทะเบียนขอรับสิทธิ์ใช้งาน EA</h1>
            <p className="text-xs text-gray-400">ผูกสิทธิ์บัญชีเทรดของคุณกับเซิร์ฟเวอร์ Versus Trade</p>
          </div>
        </div>

        {success ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#00E599] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">ส่งคำขอลงทะเบียนเรียบร้อยแล้ว!</h2>
            <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
              ข้อมูลบัญชี <span className="text-[#00E599] font-mono font-semibold">{formData.accountNumber}</span> ถูกส่งเข้าสู่ระบบแล้ว แอดมิน (คุณโจ้ & ครูชัย) จะทำการตรวจสอบและอนุมัติสิทธิ์ให้ท่านโดยเร็วที่สุด
            </p>
            <div className="pt-6 flex justify-center gap-4">
              <Link 
                href="/"
                className="px-5 py-2.5 rounded-xl bg-surface-200 hover:bg-surface-300 text-sm font-medium text-white transition-all"
              >
                กลับสู่หน้าหลัก
              </Link>
              <button 
                onClick={() => {
                  setSuccess(false);
                  setFormData({
                    eaCode: "RECON_100",
                    accountNumber: "",
                    brokerServer: "VersusTrade-Live",
                    clientName: "",
                    clientEmail: "",
                    clientPhone: "",
                    notes: "",
                  });
                }}
                className="px-5 py-2.5 rounded-xl bg-[#00E599] hover:bg-[#00C985] text-black text-sm font-bold transition-all"
              >
                ลงทะเบียนเพิ่มอีกพอร์ต
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* EA Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">เลือก Expert Advisor (EA)</label>
              <select
                value={formData.eaCode}
                onChange={(e) => setFormData({ ...formData, eaCode: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#12151B] border border-gray-700 text-white focus:outline-none focus:border-[#00E599] text-sm"
              >
                <option value="RECON_100">Recon AiAuto100 (EA เริ่มต้น)</option>
                <option value="RANGER_500">Ranger AiAuto500 (ทองคำ พอร์ต Cent)</option>
                <option value="DELTA_1500">Delta AiAuto1500 (ทองคำ พอร์ต Dollar)</option>
              </select>
            </div>

            {/* Account Number & Broker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  เลขที่บัญชีเทรด MT4 / MT5 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 1002345"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#12151B] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E599] text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">เซิร์ฟเวอร์โบรกเกอร์</label>
                <select
                  value={formData.brokerServer}
                  onChange={(e) => setFormData({ ...formData, brokerServer: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#12151B] border border-gray-700 text-white focus:outline-none focus:border-[#00E599] text-sm"
                >
                  <option value="VersusTrade-Live">VersusTrade-Live</option>
                  <option value="VersusTrade-Demo">VersusTrade-Demo (ทดลอง)</option>
                </select>
              </div>
            </div>

            {/* Client Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">ชื่อ-นามสกุล / ชื่อเล่น</label>
                <input
                  type="text"
                  placeholder="ระบุชื่อผู้ติดต่อ"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#12151B] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E599] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">เบอร์โทรศัพท์ / LINE ID</label>
                <input
                  type="text"
                  placeholder="สำหรับติดต่อแจ้งผลอนุมัติ"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#12151B] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E599] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">อีเมล (ถ้ามี)</label>
              <input
                type="email"
                placeholder="your-email@example.com"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#12151B] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-[#00E599] text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#00E599] hover:bg-[#00C985] text-black font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>กำลังส่งข้อมูล...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>ส่งคำขอลงทะเบียนสิทธิ์</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function RegisterLicensePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-400">กำลังโหลด...</div>}>
      <RegisterLicenseForm />
    </Suspense>
  );
}

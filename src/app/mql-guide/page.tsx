"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Check, FileCode2, Download, Sparkles, RefreshCw } from "lucide-react";

export default function MqlGuidePage() {
  const router = useRouter();
  const [authChecking, setAuthChecking] = useState(true);
  const [copied1, setCopied1] = useState(false);
  const [copied2, setCopied2] = useState(false);
  const [copied3, setCopied3] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/auth");
        if (!res.ok) {
          router.replace("/admin/login");
          return;
        }
        const data = await res.json();
        if (!data.authenticated) {
          router.replace("/admin/login");
          return;
        }
      } catch {
        router.replace("/admin/login");
      } finally {
        setAuthChecking(false);
      }
    }
    checkAuth();
  }, [router]);

  const snippet1 = `// ============================================================
// >>> START COPY TO EA (ส่วนที่ 1: กำหนดรหัส EA และ Include) >>>
// ============================================================
#define ALLWAYTP_EA_CODE "RECON_100" // <-- ระบุรหัส EA จุดนี้จุดเดียวเท่านั้น!
#include <AllwayTP_License.mqh>
// ============================================================
// <<< END COPY TO EA (สิ้นสุดส่วนที่ 1) <<<
// ============================================================`;

  const snippet2 = `// ============================================================
// >>> START COPY TO EA (ส่วนที่ 2: ตรวจสิทธิ์เมื่อเริ่มรัน ใน OnInit) >>>
// ============================================================
   if(!VerifyAllwayTPLicense()) return(INIT_FAILED);
// ============================================================
// <<< END COPY TO EA (สิ้นสุดส่วนที่ 2) <<<
// ============================================================`;

  const snippet3 = `// ============================================================
// >>> START COPY TO EA (ส่วนที่ 3: รอบตรวจเช็กสิทธิ์และสถานะ ใน OnTick) >>>
// ============================================================
   if(!CheckAllwayTPHeartbeat()) return;
// ============================================================
// <<< END COPY TO EA (สิ้นสุดส่วนที่ 3) <<<
// ============================================================`;

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#090A0E] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-7 h-7 text-amber-400 animate-spin" />
          <span className="text-xs font-mono">กำลังตรวจสอบสิทธิ์การเข้าถึงคู่มือ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>กลับหน้าระบบหลังบ้าน Admin</span>
      </Link>

      <div className="space-y-3 pb-6 border-b border-gray-800 flex items-start gap-4">
        <img 
          src="/images/zenx-logo.jpg" 
          alt="Zen X Academy" 
          className="w-14 h-14 rounded-full border border-gold-500/60 object-cover shadow-lg hidden sm:block flex-shrink-0" 
        />
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 text-[#D4AF37] border border-gold-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EA Developer Guide • Zen X Academy x AllwayTP</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1">คู่มือเชื่อมต่อระบบตรวจสอบสิทธิ์ใน EA (MQL4 / MQL5)</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            ระบุรหัส EA จุดเดียวที่หัวไฟล์ โค้ดส่วนอื่นเป็นมาตรฐานเดียวกันทุกตัว Copy วางได้ทันที
          </p>
        </div>
      </div>

      {/* Step 1: Download Include File */}
      <div className="p-6 rounded-2xl bg-surface-100 border border-gray-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-black font-bold text-xs flex items-center justify-center">1</span>
            <span>นำไฟล์ Include ไปวางในเครื่อง (ทำครั้งเดียว)</span>
          </h2>
          <a
            href="/mql/AllwayTP_License.mqh"
            download="AllwayTP_License.mqh"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:brightness-110 text-black font-bold text-xs shadow-lg shadow-amber-950/40 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span>ดาวน์โหลด AllwayTP_License.mqh</span>
          </a>
        </div>
        <p className="text-xs text-gray-300">
          ไฟล์อยู่ที่โฟลเดอร์ <code className="text-[#D4AF37] bg-black/50 px-2 py-0.5 rounded font-mono border border-gray-800">mql/AllwayTP_License.mqh</code> ให้คัดลอกไปวางไว้ที่:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#0C0E14] border border-gray-800">
            <span className="text-gray-400 font-semibold block mb-1">สำหรับ MetaTrader 4:</span>
            <code className="text-[#D4AF37] font-mono text-[11px]">MQL4/Include/AllwayTP_License.mqh</code>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0C0E14] border border-gray-800">
            <span className="text-gray-400 font-semibold block mb-1">สำหรับ MetaTrader 5:</span>
            <code className="text-[#D4AF37] font-mono text-[11px]">MQL5/Include/AllwayTP_License.mqh</code>
          </div>
        </div>
      </div>

      {/* Step 2: Code Snippets with Copy */}
      <div className="p-6 rounded-2xl bg-surface-100 border border-gray-800 space-y-6 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-black font-bold text-xs flex items-center justify-center">2</span>
          <span>Copy โค้ดไปวางในไฟล์ EA (.mq4 / .mq5)</span>
        </h2>

        {/* Snippet 1 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-300">
              ส่วนที่ 1: วางไว้บนสุดของโค้ด EA (ระบุรหัส EA จุดนี้จุดเดียวเท่านั้น!)
            </span>
            <button
              onClick={() => copyToClipboard(snippet1, setCopied1)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-200 hover:bg-surface-300 text-gray-300 hover:text-white transition-all text-xs font-medium"
            >
              {copied1 ? <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied1 ? "คัดลอกแล้ว!" : "Copy ส่วนที่ 1"}</span>
            </button>
          </div>
          <div className="rounded-xl bg-[#0B0E14] border border-gray-800 p-4 font-mono text-xs text-amber-200/90 overflow-x-auto">
            <pre>{snippet1}</pre>
          </div>
        </div>

        {/* Snippet 2 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-300">
              ส่วนที่ 2: วางไว้ในฟังก์ชัน <code className="text-[#D4AF37]">OnInit()</code> เป็นบรรทัดแรก (เหมือนกันทุกตัว)
            </span>
            <button
              onClick={() => copyToClipboard(snippet2, setCopied2)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-200 hover:bg-surface-300 text-gray-300 hover:text-white transition-all text-xs font-medium"
            >
              {copied2 ? <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied2 ? "คัดลอกแล้ว!" : "Copy ส่วนที่ 2"}</span>
            </button>
          </div>
          <div className="rounded-xl bg-[#0B0E14] border border-gray-800 p-4 font-mono text-xs text-amber-200/90 overflow-x-auto">
            <pre>{snippet2}</pre>
          </div>
        </div>

        {/* Snippet 3 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-300">
              ส่วนที่ 3: วางไว้ในฟังก์ชัน <code className="text-[#D4AF37]">OnTick()</code> เป็นบรรทัดแรก (เหมือนกันทุกตัว)
            </span>
            <button
              onClick={() => copyToClipboard(snippet3, setCopied3)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-200 hover:bg-surface-300 text-gray-300 hover:text-white transition-all text-xs font-medium"
            >
              {copied3 ? <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied3 ? "คัดลอกแล้ว!" : "Copy ส่วนที่ 3"}</span>
            </button>
          </div>
          <div className="rounded-xl bg-[#0B0E14] border border-gray-800 p-4 font-mono text-xs text-amber-200/90 overflow-x-auto">
            <pre>{snippet3}</pre>
          </div>
        </div>
      </div>

      {/* EA Code Table */}
      <div className="p-6 rounded-2xl bg-surface-100 border border-gray-800 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white">ตารางรหัส EA สำหรับใส่ในส่วนที่ 1 (#define ALLWAYTP_EA_CODE)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0C0E14] border-b border-gray-800 text-gray-400">
              <tr>
                <th className="py-2.5 px-3 font-semibold">รุ่น EA</th>
                <th className="py-2.5 px-3 font-semibold">ชื่อทางการตลาด</th>
                <th className="py-2.5 px-3 font-semibold font-mono text-[#D4AF37]">ใส่ค่าใน #define</th>
                <th className="py-2.5 px-3 font-semibold">ประเภทบัญชีที่รองรับ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr>
                <td className="py-3 px-3 font-bold text-white">Recon</td>
                <td className="py-3 px-3 text-gray-300">Recon AiAuto100</td>
                <td className="py-3 px-3 font-mono font-bold text-[#D4AF37]">"RECON_100"</td>
                <td className="py-3 px-3 text-gray-400">Standard / Dollar (ทุน $100+)</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-white">Ranger</td>
                <td className="py-3 px-3 text-gray-300">Ranger AiAuto500</td>
                <td className="py-3 px-3 font-mono font-bold text-[#D4AF37]">"RANGER_500"</td>
                <td className="py-3 px-3 text-gray-400">Cent Account (ทุน $500+)</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-white">Delta</td>
                <td className="py-3 px-3 text-gray-300">Delta AiAuto1500</td>
                <td className="py-3 px-3 font-mono font-bold text-[#D4AF37]">"DELTA_1500"</td>
                <td className="py-3 px-3 text-gray-400">Standard / Dollar (ทุน $1,500+)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Step 3: WebRequest Setup */}
      <div className="p-6 rounded-2xl bg-surface-100 border border-gray-800 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-black font-bold text-xs flex items-center justify-center">3</span>
          <span>เปิดใช้งาน WebRequest ใน MT4 / MT5 (ทำครั้งเดียว)</span>
        </h2>
        <ol className="list-decimal list-inside text-xs text-gray-300 space-y-2">
          <li>เปิดโปรแกรม MetaTrader 4 / MetaTrader 5</li>
          <li>ไปที่เมนู <b>Tools (เครื่องมือ) &gt; Options (ตัวเลือก)</b> หรือกด <kbd className="bg-gray-800 px-1.5 py-0.5 rounded text-white font-mono">Ctrl + O</kbd></li>
          <li>คลิกแท็บ <b>Expert Advisors</b></li>
          <li>ติ๊กถูกที่ <b>&ldquo;Allow WebRequest for listed URL&rdquo;</b></li>
          <li>
            ดับเบิ้ลคลิกเพิ่ม URL:
            <div className="mt-2 p-2.5 rounded-lg bg-black/60 border border-gray-800 text-[#D4AF37] font-mono text-xs inline-block">
              https://allwaytp.com
            </div>
          </li>
          <li>กด <b>OK</b> เพื่อบันทึก</li>
        </ol>
      </div>
    </div>
  );
}

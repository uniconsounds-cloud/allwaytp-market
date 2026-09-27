"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Check, FileCode2, Download, ExternalLink } from "lucide-react";

export default function MqlGuidePage() {
  const [copied1, setCopied1] = useState(false);
  const [copied2, setCopied2] = useState(false);

  const snippet1 = `// ============================================================
// >>> START COPY TO EA (ส่วนที่ 1: Include Header) >>>
// ============================================================
#include <AllwayTP_License.mqh>
// ============================================================
// <<< END COPY TO EA (สิ้นสุดส่วนที่ 1) <<<
// ============================================================`;

  const snippet2 = `// ============================================================
// >>> START COPY TO EA (ส่วนที่ 2: ตรวจสอบสิทธิ์กับระบบคลาวด์) >>>
// ============================================================
   // ตรวจสอบสิทธิ์กับ AllwayTP Cloud Server
   // รหัส EA: "RECON_100" | "RANGER_500" | "DELTA_1500"
   if(!VerifyAllwayTPLicense("RECON_100"))
   {
      Print("[SECURITY] ตรวจสอบสิทธิ์ไม่ผ่าน! ระงับการทำงานของ EA บนพอร์ตนี้");
      return(INIT_FAILED); // หยุดและสั่งถอด EA ออกจากกราฟทันที
   }
   
   Print("[SECURITY] สิทธิ์ถูกต้อง (ACTIVE) ยินดีต้อนรับสู่ AllwayTP System");
// ============================================================
// <<< END COPY TO EA (สิ้นสุดส่วนที่ 2) <<<
// ============================================================`;

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>กลับหน้าระบบหลังบ้าน Admin</span>
      </Link>

      <div className="space-y-3 pb-6 border-b border-gray-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-[#00E599] border border-emerald-500/20 text-xs font-semibold">
          <FileCode2 className="w-3.5 h-3.5" />
          <span>สำหรับครูชัย (EA Developer Guide)</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">คู่มือเชื่อมต่อระบบตรวจสอบสิทธิ์ EA (AllwayTP License System)</h1>
        <p className="text-sm text-gray-400">
          เอกสารสรุปหน้าเดียวจบ พร้อมโค้ดที่ครอบ Comment กั้นหัวท้ายสำหรับ Copy ไปวางในไฟล์ EA (.mq4 / .mq5)
        </p>
      </div>

      {/* Step 1: Download Include File */}
      <div className="p-6 rounded-2xl bg-surface-100 border border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#00E599] text-black font-bold text-xs flex items-center justify-center">1</span>
            <span>นำไฟล์ Include ไปวางในเครื่อง</span>
          </h2>
          <a
            href="/mql/AllwayTP_License.mqh"
            download="AllwayTP_License.mqh"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#00E599] hover:bg-[#00C985] text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ดาวน์โหลด AllwayTP_License.mqh</span>
          </a>
        </div>
        <p className="text-xs text-gray-300">
          ไฟล์อยู่ที่โฟลเดอร์ <code className="text-[#00E599] bg-black/40 px-2 py-0.5 rounded font-mono">mql/AllwayTP_License.mqh</code> ให้คัดลอกไปวางไว้ที่:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#12151B] border border-gray-800">
            <span className="text-gray-400 font-semibold block mb-1">สำหรับ MetaTrader 4:</span>
            <code className="text-emerald-400 font-mono text-[11px]">MQL4/Include/AllwayTP_License.mqh</code>
          </div>
          <div className="p-3 rounded-xl bg-[#12151B] border border-gray-800">
            <span className="text-gray-400 font-semibold block mb-1">สำหรับ MetaTrader 5:</span>
            <code className="text-emerald-400 font-mono text-[11px]">MQL5/Include/AllwayTP_License.mqh</code>
          </div>
        </div>
      </div>

      {/* Step 2: Code Snippets with Copy */}
      <div className="p-6 rounded-2xl bg-surface-100 border border-gray-800 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#00E599] text-black font-bold text-xs flex items-center justify-center">2</span>
          <span>Copy โค้ดไปวางในไฟล์ EA (.mq4 / .mq5)</span>
        </h2>

        {/* Snippet 1 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-300">ส่วนที่ 1: วางไว้บนสุดของโค้ด EA (ใต้ #property ต่างๆ)</span>
            <button
              onClick={() => copyToClipboard(snippet1, setCopied1)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-200 hover:bg-surface-300 text-gray-300 hover:text-white transition-all text-xs font-medium"
            >
              {copied1 ? <Check className="w-3.5 h-3.5 text-[#00E599]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied1 ? "คัดลอกแล้ว!" : "Copy ส่วนที่ 1"}</span>
            </button>
          </div>
          <div className="rounded-xl bg-[#0B0E14] border border-gray-800 p-4 font-mono text-xs text-emerald-300 overflow-x-auto">
            <pre>{snippet1}</pre>
          </div>
        </div>

        {/* Snippet 2 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-300">ส่วนที่ 2: วางไว้ในฟังก์ชัน <code className="text-[#00E599]">OnInit()</code> เป็นบรรทัดแรก</span>
            <button
              onClick={() => copyToClipboard(snippet2, setCopied2)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-200 hover:bg-surface-300 text-gray-300 hover:text-white transition-all text-xs font-medium"
            >
              {copied2 ? <Check className="w-3.5 h-3.5 text-[#00E599]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied2 ? "คัดลอกแล้ว!" : "Copy ส่วนที่ 2"}</span>
            </button>
          </div>
          <div className="rounded-xl bg-[#0B0E14] border border-gray-800 p-4 font-mono text-xs text-emerald-300 overflow-x-auto">
            <pre>{snippet2}</pre>
          </div>
        </div>
      </div>

      {/* EA Code Table */}
      <div className="p-6 rounded-2xl bg-surface-100 border border-gray-800 space-y-4">
        <h2 className="text-lg font-bold text-white">ตารางรหัส eaCode ที่ต้องระบุในฟังก์ชัน</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#12151B] border-b border-gray-800 text-gray-400">
              <tr>
                <th className="py-2.5 px-3 font-semibold">รุ่น EA</th>
                <th className="py-2.5 px-3 font-semibold">ชื่อทางการตลาด</th>
                <th className="py-2.5 px-3 font-semibold font-mono text-[#00E599]">รหัส eaCode</th>
                <th className="py-2.5 px-3 font-semibold">ประเภทบัญชีที่รองรับ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr>
                <td className="py-3 px-3 font-bold text-white">Recon</td>
                <td className="py-3 px-3 text-gray-300">Recon AiAuto100</td>
                <td className="py-3 px-3 font-mono font-bold text-[#00E599]">"RECON_100"</td>
                <td className="py-3 px-3 text-gray-400">Standard / Dollar (ทุน $100+)</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-white">Ranger</td>
                <td className="py-3 px-3 text-gray-300">Ranger AiAuto500</td>
                <td className="py-3 px-3 font-mono font-bold text-[#00E599]">"RANGER_500"</td>
                <td className="py-3 px-3 text-gray-400">Cent Account (ทุน $500+)</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-bold text-white">Delta</td>
                <td className="py-3 px-3 text-gray-300">Delta AiAuto1500</td>
                <td className="py-3 px-3 font-mono font-bold text-[#00E599]">"DELTA_1500"</td>
                <td className="py-3 px-3 text-gray-400">Standard / Dollar (ทุน $1,500+)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Step 3: WebRequest Setup */}
      <div className="p-6 rounded-2xl bg-surface-100 border border-gray-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#00E599] text-black font-bold text-xs flex items-center justify-center">3</span>
          <span>เปิดใช้งาน WebRequest ใน MT4 / MT5 (ทำครั้งเดียว)</span>
        </h2>
        <ol className="list-decimal list-inside text-xs text-gray-300 space-y-2">
          <li>เปิดโปรแกรม MetaTrader 4 / MetaTrader 5</li>
          <li>ไปที่เมนู <b>Tools (เครื่องมือ) &gt; Options (ตัวเลือก)</b> หรือกด <kbd className="bg-gray-800 px-1.5 py-0.5 rounded text-white font-mono">Ctrl + O</kbd></li>
          <li>คลิกแท็บ <b>Expert Advisors</b></li>
          <li>ติ๊กถูกที่ <b>&ldquo;Allow WebRequest for listed URL&rdquo;</b></li>
          <li>
            ดับเบิ้ลคลิกเพิ่ม URL:
            <div className="mt-2 p-2.5 rounded-lg bg-black/60 border border-gray-800 text-[#00E599] font-mono text-xs inline-block">
              https://allwaytp-market.vercel.app
            </div>
          </li>
          <li>กด <b>OK</b> เพื่อบันทึก</li>
        </ol>
      </div>
    </div>
  );
}

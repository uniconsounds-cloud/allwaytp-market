import Link from "next/link";
import { ArrowLeft, Copy, CheckCircle, FileCode2, ExternalLink, Download } from "lucide-react";

export default function MqlGuidePage() {
  const mqlCodeSample = `// 1. นำไฟล์ AllwayTP_License.mqh ไปวางไว้ที่โฟลเดอร์ MQL4/Include/ หรือ MQL5/Include/
#include <AllwayTP_License.mqh>

// 2. ในฟังก์ชัน OnInit() ของตัว EA ให้เรียกใช้ฟังก์ชันตรวจสิทธิ์:
int OnInit()
{
   // ระบุรหัส EA: "RECON_100", "RANGER_500", หรือ "DELTA_1500"
   if(!VerifyAllwayTPLicense("RECON_100"))
   {
      Print("[SECURITY] ตรวจสอบสิทธิ์ไม่ผ่าน! หยุดการทำงานของ EA ทันที");
      return(INIT_FAILED);
   }

   Print("[SUCCESS] ตรวจสอบสิทธิ์ผ่าน ยินดีต้อนรับเข้าสู่ระบบ AllwayTP");
   
   // ... โค้ดกลยุทธ์การเทรดเดิมของคุณ ...
   return(INIT_SUCCEEDED);
}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>กลับหน้าระบบหลังบ้าน Admin</span>
      </Link>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-[#00E599] border border-emerald-500/20 text-xs font-semibold">
          <FileCode2 className="w-3.5 h-3.5" />
          <span>สำหรับครูชัย (EA Developer Guide)</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">คู่มือการเชื่อมต่อสิทธิ์ใน EA (MQL4 / MQL5)</h1>
        <p className="text-sm text-gray-400">
          วิธีนำโค้ดตรวจสอบสิทธิ์ไปใส่ใน EA แต่ละรุ่นเพื่อเชื่อมต่อกับระบบหลังบ้าน AllwayTP
        </p>
      </div>

      {/* Step 1: Download Include File */}
      <div className="p-6 rounded-2xl bg-surface-100 border border-gray-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#00E599] text-black font-bold text-xs flex items-center justify-center">1</span>
          <span>ดาวน์โหลดไฟล์ Include Header (.mqh)</span>
        </h2>
        <p className="text-xs text-gray-300">
          ดาวน์โหลดไฟล์ <code className="text-[#00E599] bg-black/40 px-2 py-0.5 rounded">AllwayTP_License.mqh</code> แล้วนำไปวางไว้ในโฟลเดอร์: <br />
          <code className="text-gray-400 text-[11px] block mt-1">MT4: MQL4/Include/AllwayTP_License.mqh</code>
          <code className="text-gray-400 text-[11px] block">MT5: MQL5/Include/AllwayTP_License.mqh</code>
        </p>
        <div>
          <a
            href="/mql/AllwayTP_License.mqh"
            download="AllwayTP_License.mqh"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00E599] hover:bg-[#00C985] text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>ดาวน์โหลด AllwayTP_License.mqh</span>
          </a>
        </div>
      </div>

      {/* Step 2: Code Integration */}
      <div className="p-6 rounded-2xl bg-surface-100 border border-gray-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#00E599] text-black font-bold text-xs flex items-center justify-center">2</span>
          <span>เพิ่มโค้ดในไฟล์ EA (.mq4 / .mq5)</span>
        </h2>
        <p className="text-xs text-gray-300">
          เปิดไฟล์โค้ด EA ของครูชัยใน MetaEditor แล้วนำ 2 ส่วนนี้ไปวาง:
        </p>

        <div className="rounded-xl bg-[#0B0E14] border border-gray-800 p-4 font-mono text-xs text-emerald-300 overflow-x-auto">
          <pre>{mqlCodeSample}</pre>
        </div>
      </div>

      {/* Step 3: MetaTrader Options Setting */}
      <div className="p-6 rounded-2xl bg-surface-100 border border-gray-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#00E599] text-black font-bold text-xs flex items-center justify-center">3</span>
          <span>การตั้งค่า WebRequest ใน MT4 / MT5 ของผู้ใช้งาน</span>
        </h2>
        <p className="text-xs text-gray-300 leading-relaxed">
          เพื่อให้ MT4/MT5 สามารถส่งข้อมูลมาตรวจสอบสิทธิ์กับเซิร์ฟเวอร์ AllwayTP ได้ ผู้ใช้งานหรือผู้ติดตั้งต้องเพิ่ม URL ในการตั้งค่าโปรแกรม:
        </p>
        <ol className="list-decimal list-inside text-xs text-gray-400 space-y-2">
          <li>เปิดโปรแกรม MetaTrader 4 / MetaTrader 5</li>
          <li>ไปที่เมนู <b>Tools (เครื่องมือ) &gt; Options (ตัวเลือก)</b> หรือกด <kbd className="bg-gray-800 px-1.5 py-0.5 rounded text-white font-mono">Ctrl + O</kbd></li>
          <li>คลิกแท็บ <b>Expert Advisors</b></li>
          <li>ติ๊กถูกที่ <b>&ldquo;Allow WebRequest for listed URL&rdquo;</b></li>
          <li>
            ดับเบิ้ลคลิกเพิ่ม URL เซิร์ฟเวอร์:
            <div className="mt-2 p-2.5 rounded-lg bg-black/50 border border-gray-800 text-[#00E599] font-mono text-xs inline-block">
              https://allwaytp-market.vercel.app
            </div>
          </li>
          <li>กดปุ่ม <b>OK</b> เพื่อบันทึก</li>
        </ol>
      </div>
    </div>
  );
}

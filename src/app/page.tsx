import Link from "next/link";
import { DownloadCloud, ShieldCheck, ArrowRight, TrendingUp, CheckCircle, ExternalLink, Zap, Lock } from "lucide-react";

export default function Home() {
  const eaList = [
    {
      code: "RECON_100",
      name: "Recon AiAuto100",
      badge: "EA เริ่มต้น",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      description: "ระบบเทรดอัตโนมัติระดับเริ่มต้น ออกแบบมาเพื่อทดสอบและเรียนรู้การทำงาน ควบคุมความเสี่ยงอย่างรัดกุม เหมาะกับผู้เริ่มต้น",
      pair: "XAUUSD / Forex",
      timeframe: "M15",
      minDeposit: "100 USD",
      type: "Standard",
      features: [
        "คุม Drawdown อัตโนมัติ",
        "ตั้งค่า Lot เริ่มต้น 0.01",
        "เหมาะสำหรับบัญชี Standard",
      ]
    },
    {
      code: "RANGER_500",
      name: "Ranger AiAuto500",
      badge: "ยอดนิยม (พอร์ต Cent)",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      description: "ออกแบบเฉพาะสำหรับเทรดทองคำบนพอร์ต Cent กระจายความเสี่ยงขั้นสูง สะสมกำไรต่อเนื่องด้วยอัลกอริทึม DCA ยืดหยุ่น",
      pair: "XAUUSD (ทองคำ)",
      timeframe: "M15",
      minDeposit: "500 USD (50,000 USC)",
      type: "Cent Account",
      features: [
        "กลยุทธ์เฉพาะสำหรับพอร์ต Cent",
        "ทนต่อความผันผวนของราคาทองคำ",
        "มีระบบตัดขาดทุนฉุกเฉิน (Emergency Close)",
      ]
    },
    {
      code: "DELTA_1500",
      name: "Delta AiAuto1500",
      badge: "พอร์ต Dollar มืออาชีพ",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      description: "EA ทองคำระดับพรีเมียมสำหรับพอร์ต Standard Dollar วิเคราะห์สภาวะตลาดแม่นยำ พร้อมระบบ Hedging & Trailing ป้องกันกำไร",
      pair: "XAUUSD (ทองคำ)",
      timeframe: "H1",
      minDeposit: "1,500 USD",
      type: "Dollar Account",
      features: [
        "เน้นความแม่นยำสูงบน Timeframe H1",
        "ระบบ Trailing Stop และ Trailing Step",
        "ควบคุม Position Sizing อัตโนมัติ",
      ]
    },
  ];

  return (
    <div className="space-y-24 py-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-14 text-center">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/15 to-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
        </div>

        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Zap className="w-3.5 h-3.5" />
            <span>Versus Trade Official Partner</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            ยกระดับการเทรดอัตโนมัติด้วย <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E599] via-teal-300 to-cyan-400">
              AllwayTP EA Marketplace
            </span>
          </h1>

          <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            ศูนย์รวม Expert Advisor คุณภาพสูง พัฒนาโดยครูชัย ควบคุมความเสี่ยง แม่นยำ และจัดการสิทธิ์ผ่านระบบคลาวด์ ตรวจสอบสิทธิ์แบบ Real-time ร่วมกับโบรกเกอร์ Versus Trade
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a 
              href="#eas" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00E599] hover:bg-[#00C985] text-black font-bold shadow-lg shadow-emerald-500/25 transition-all"
            >
              <DownloadCloud className="w-5 h-5" />
              <span>เลือกดูและดาวน์โหลด EA</span>
            </a>
            <Link 
              href="/register-license" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-100 hover:bg-surface-200 border border-gray-700 text-white font-semibold transition-all"
            >
              <ShieldCheck className="w-5 h-5 text-[#00E599]" />
              <span>ลงทะเบียนผูกสิทธิ์บัญชี</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Steps Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">ขั้นตอนเริ่มต้นใช้งาน</h2>
          <p className="mt-2 text-sm text-gray-400">เริ่มต้นรัน EA ได้ง่ายๆ ใน 4 ขั้นตอน</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "เปิดบัญชีเทรด",
              desc: "เปิดบัญชีเทรดผ่านโบรกเกอร์ Versus Trade ภายใต้ลิงก์พันธมิตร",
              link: "https://versus.trade/th/",
              linkText: "เปิดบัญชีที่นี่",
            },
            {
              step: "02",
              title: "ดาวน์โหลด EA",
              desc: "เลือกดาวน์โหลดไฟล์ EA รุ่นที่ตรงกับขนาดเงินทุนของท่าน",
              link: "#eas",
              linkText: "ดูรายการ EA",
            },
            {
              step: "03",
              title: "ลงทะเบียนขอสิทธิ์",
              desc: "กรอกเลขที่พอร์ตเทรดเพื่อขอรับการอนุมัติสิทธิ์ (License)",
              link: "/register-license",
              linkText: "ขอสิทธิ์เลย",
            },
            {
              step: "04",
              title: "ติดตั้งและเริ่มเทรด",
              desc: "นำไฟล์ใส่ MT4/MT5 และเปิดระบบ Auto Trading ได้ทันที",
              link: "#",
              linkText: "พร้อมทำงานทันที",
            },
          ].map((item, idx) => (
            <div key={idx} className="relative p-6 rounded-2xl bg-surface-100/60 border border-gray-800 hover:border-gray-700 transition-all">
              <span className="text-3xl font-black text-gray-700 block mb-3">{item.step}</span>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">{item.desc}</p>
              {item.link.startsWith("http") ? (
                <a href={item.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-[#00E599] hover:underline">
                  {item.linkText} <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <Link href={item.link} className="inline-flex items-center gap-1 text-xs font-semibold text-[#00E599] hover:underline">
                  {item.linkText} <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* EA Catalog Section */}
      <section id="eas" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00E599] uppercase tracking-wider mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>Available Systems</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white">รายการ Expert Advisors ประจำระบบ</h2>
          </div>
          <p className="text-sm text-gray-400 max-w-md">
            ทุกตัวผ่านการออกแบบตรรกะการเทรดโดยครูชัย พร้อมระบบตรวจสอบสิทธิ์ป้องกันการละเมิด
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {eaList.map((ea) => (
            <div 
              key={ea.code} 
              className="flex flex-col justify-between rounded-3xl bg-surface-100 border border-gray-800/90 hover:border-emerald-500/40 p-7 transition-all hover:shadow-xl hover:shadow-emerald-950/20"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${ea.badgeColor}`}>
                    {ea.badge}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">v1.0.0</span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{ea.name}</h3>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed min-h-[60px]">{ea.description}</p>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#12151B] border border-gray-800/80 mb-6 text-xs">
                  <div>
                    <span className="text-gray-500 block">สินทรัพย์ / คู่เงิน</span>
                    <span className="font-semibold text-gray-200">{ea.pair}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Timeframe</span>
                    <span className="font-semibold text-gray-200">{ea.timeframe}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">เงินทุนแนะนำขั้นต่ำ</span>
                    <span className="font-semibold text-[#00E599]">{ea.minDeposit}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">ประเภทบัญชี</span>
                    <span className="font-semibold text-gray-200">{ea.type}</span>
                  </div>
                </div>

                {/* Highlights */}
                <ul className="space-y-2.5 mb-8 text-xs text-gray-300">
                  {ea.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-4 border-t border-gray-800">
                <Link 
                  href={`/register-license?ea=${ea.code}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#00E599] hover:bg-[#00C985] text-black font-bold text-sm transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>ขอสิทธิ์ใช้งานตัวนี้</span>
                </Link>
                <div className="text-center">
                  <span className="text-[11px] text-gray-500">
                    ต้องได้รับการอนุมัติเลขพอร์ตก่อน EA จึงจะทำงาน
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Versus Trade Broker Highlight Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/40 via-surface-100 to-gray-900 border border-emerald-500/20 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="text-xs font-bold text-[#00E599] uppercase tracking-wider">Broker Requirement</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              ใช้งานได้เฉพาะกับโบรกเกอร์ Versus Trade เท่านั้น
            </h3>
            <p className="mt-3 text-sm text-gray-300 leading-relaxed">
              ตามสัญญาและข้อตกลงความร่วมมือ ระบบ EA ของ AllwayTP ถูกตั้งค่าความเข้ากันได้ของสัญญาณราคาและระบบจัดการสเปรดบนเซิร์ฟเวอร์ Versus Trade เท่านั้น
            </p>
          </div>
          <div className="flex-shrink-0">
            <a 
              href="https://versus.trade/th/" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-gray-100 text-black font-bold text-sm shadow-xl transition-all"
            >
              <span>ไปยังเว็บไซต์ Versus Trade</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

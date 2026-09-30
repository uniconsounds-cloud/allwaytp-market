import Link from "next/link";
import { DownloadCloud, ShieldCheck, ArrowRight, TrendingUp, CheckCircle, ExternalLink, Zap, Award, Sparkles } from "lucide-react";

export default function Home() {
  const eaList = [
    {
      code: "RECON_100",
      name: "Recon AiAuto100",
      image: "/images/ea-recon-100.jpg",
      badge: "ระบบเริ่มต้นยอดนิยม",
      badgeColor: "bg-amber-500/10 text-[#D4AF37] border-amber-500/30",
      description: "ระบบเทรดอัจฉริยะผสานพลัง AI ภายใต้การควบคุมของ Master พัฒนาขึ้นเพื่อการบริหารความเสี่ยงระดับสูงสุด เหมาะสำหรับการเริ่มต้นลงทุนอย่างมั่นคง",
      pair: "XAUUSD / Forex",
      timeframe: "M15",
      minDeposit: "100 USD",
      type: "Standard / Dollar",
      tagline: "ADVANCED RECONNAISSANCE UNIT",
      features: [
        "ผสานพลัง AI + Master Risk Control",
        "เทคโนโลยี Thai + Japan Development Team",
        "คุม Drawdown และความเสี่ยงเข้มงวด",
      ]
    },
    {
      code: "RANGER_500",
      name: "Ranger AiAuto500",
      image: "/images/ea-ranger-500.jpg",
      badge: "ยอดนิยม (พอร์ต Cent)",
      badgeColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      description: "ออกแบบพิเศษสำหรับกลยุทธ์การเทรดทองคำบนพอร์ต Cent ทนทานต่อสภาวะความผันผวนสูง สะสมกำไรต่อเนื่องด้วยระบบกระจายความเสี่ยงระดับองค์กร",
      pair: "XAUUSD (ทองคำ)",
      timeframe: "M15",
      minDeposit: "500 USD (50,000 USC)",
      type: "Cent Account",
      tagline: "HEAVY COMBAT & RECOVERY UNIT",
      features: [
        "กลยุทธ์เฉพาะสำหรับพอร์ต Cent ความจุสูง",
        "ระบบกระจาย Lot แบบ Dynamic Grid",
        "มีระบบตัดความเสี่ยงฉุกเฉินระดับ Master",
      ]
    },
    {
      code: "DELTA_1500",
      name: "Delta AiAuto1500",
      image: "/images/ea-delta-1500.jpg",
      badge: "พอร์ต Dollar มืออาชีพ",
      badgeColor: "bg-gradient-to-r from-amber-500/20 to-yellow-600/20 text-[#F5D061] border-amber-400/40",
      description: "สุดยอดอัลกอริทึมเทรดทองคำสำหรับพอร์ต Standard Dollar ระดับสถาบัน คำนวณจุดเข้าออกตามโครงสร้างราคาแม่นยำ พร้อมระบบ Hedging & Trailing กำไร",
      pair: "XAUUSD (ทองคำ)",
      timeframe: "H1",
      minDeposit: "1,500 USD",
      type: "Dollar Account",
      tagline: "ELITE SPEC-OPS QUANT TRADING",
      features: [
        "วิเคราะห์โครงสร้างตลาดระดับสถาบันบน H1",
        "ระบบ Smart Trailing Lock กำไรต่อเนื่อง",
        "บริหาร Position Sizing และเลเวอเรจอัจฉริยะ",
      ]
    },
  ];

  return (
    <div className="space-y-28 py-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 text-center">
        {/* Ambient Gold Glow Backdrop */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[750px] h-[400px] bg-gradient-to-tr from-amber-600/15 via-[#D4AF37]/10 to-yellow-500/5 blur-[150px] rounded-full pointer-events-none" />
        </div>

        <div className="max-w-4xl mx-auto px-4">
          {/* Zen X Academy Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-gold-500/35 bg-surface-100/90 text-gold-300 text-xs font-semibold tracking-wider mb-8 shadow-lg shadow-black/60">
            <img 
              src="/images/zenx-logo.jpg" 
              alt="Zen X Academy" 
              className="w-5 h-5 rounded-full object-cover border border-gold-500/60"
            />
            <span className="text-[#D4AF37] font-bold">ZEN X ACADEMY</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-300">THAI + JAPAN DEVELOPMENT TEAM</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.15]">
            ระบบเทรดอัตโนมัติระดับพรีเมียม <br />
            <span className="text-gold-gradient drop-shadow-sm">
              AllwayTP x Zen X Academy
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            ศูนย์รวม Expert Advisor คุณภาพสูงที่ผสานพลัง <span className="text-[#D4AF37] font-semibold">AI System</span> เข้ากับการดูแลของ <span className="text-[#D4AF37] font-semibold">Master Trader</span> พร้อมระบบตรวจสิทธิ์คลาวด์ Real-time ร่วมกับโบรกเกอร์ Versus Trade
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a 
              href="#eas" 
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3C64F] to-[#B8860B] hover:brightness-110 text-black font-extrabold shadow-xl shadow-amber-950/40 transition-all hover:scale-[1.02]"
            >
              <DownloadCloud className="w-5 h-5 text-black" />
              <span>เลือกดูระบบเทรดทั้งหมด</span>
            </a>
            <Link 
              href="/register-license" 
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-gold-500/40 text-white font-semibold transition-all hover:border-gold-500/70"
            >
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
              <span>ลงทะเบียนขอสิทธิ์พอร์ต</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Steps Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HOW IT WORKS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">ขั้นตอนเริ่มต้นใช้งานระบบเทรด</h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-400">เริ่มต้นรัน EA ได้สะดวกรวดเร็วใน 4 ขั้นตอน</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "เปิดบัญชีเทรด",
              desc: "เปิดบัญชีเทรดผ่านโบรกเกอร์ Versus Trade ภายใต้โครงสร้างพันธมิตรของ Zen X Academy",
              link: "https://versus.trade/th/",
              linkText: "เปิดบัญชี Versus Trade",
            },
            {
              step: "02",
              title: "เลือกรุ่น EA",
              desc: "เลือกระบบ EA ที่ตรงกับขนาดเงินทุนและเป้าหมายของท่าน (Recon, Ranger, หรือ Delta)",
              link: "#eas",
              linkText: "ดูสเปกระบบ",
            },
            {
              step: "03",
              title: "ลงทะเบียนขอสิทธิ์",
              desc: "กรอกเลขที่พอร์ตเทรด MT4/MT5 ผ่านหน้าเว็บ เพื่อรับการอนุมัติสิทธิ์ (Cloud License)",
              link: "/register-license",
              linkText: "ขอสิทธิ์เลย",
            },
            {
              step: "04",
              title: "ติดตั้งและเริ่มเทรด",
              desc: "นำไฟล์ใส่ MetaTrader เปิดระบบ Auto Trading พร้อมส่งสัญญาณสิทธิ์ทำงานทันที",
              link: "#",
              linkText: "พร้อมรันทันที",
            },
          ].map((item, idx) => (
            <div key={idx} className="relative p-6 rounded-2xl bg-surface-100 border border-gray-800/80 hover:border-gold-500/40 transition-all hover:-translate-y-1 shadow-lg">
              <span className="text-3xl font-black text-gray-700 block mb-3 font-mono">{item.step}</span>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">{item.desc}</p>
              {item.link.startsWith("http") ? (
                <a href={item.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#D4AF37] hover:underline">
                  {item.linkText} <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <Link href={item.link} className="inline-flex items-center gap-1 text-xs font-bold text-[#D4AF37] hover:underline">
                  {item.linkText} <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* EA Catalog Section with Product Images */}
      <section id="eas" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2">
              <Award className="w-4 h-4" />
              <span>OFFICIAL PRODUCT SUITE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">รายการ Expert Advisors ประจำระบบ</h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md">
            ทุกระบบผ่านการวิเคราะห์ตรรกะการเทรดโดย Master Trader & AI Engineering Team พร้อมระบบป้องกันการละเมิดสิทธิ์ผ่านคลาวด์
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {eaList.map((ea) => (
            <div 
              key={ea.code} 
              className="flex flex-col justify-between rounded-3xl bg-surface-100 border border-gray-800 hover:border-gold-500/50 p-6 sm:p-7 transition-all hover:shadow-2xl hover:shadow-amber-950/20 group"
            >
              <div>
                {/* 3D Box Product Image Showcase */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-6 bg-black/60 border border-gray-800 group-hover:border-gold-500/30 transition-colors">
                  <img 
                    src={ea.image} 
                    alt={ea.name} 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-transparent to-transparent opacity-60" />
                  
                  {/* Badge floating on top of image */}
                  <div className="absolute top-3 left-3">
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border backdrop-blur-md ${ea.badgeColor}`}>
                      {ea.badge}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-gray-300 font-mono">
                    <span className="bg-black/70 px-2 py-0.5 rounded border border-gray-700/60 font-semibold text-[#D4AF37]">
                      {ea.tagline}
                    </span>
                    <span className="text-gray-400">v1.2.0</span>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-[#D4AF37] transition-colors">
                  {ea.name}
                </h3>
                <p className="text-xs text-gray-400 mb-6 leading-relaxed min-h-[55px]">
                  {ea.description}
                </p>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#0C0E14] border border-gray-800/80 mb-6 text-xs">
                  <div>
                    <span className="text-gray-500 block text-[11px]">สินทรัพย์ / คู่เงิน</span>
                    <span className="font-semibold text-gray-200">{ea.pair}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Timeframe</span>
                    <span className="font-semibold text-gray-200">{ea.timeframe}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">เงินทุนแนะนำขั้นต่ำ</span>
                    <span className="font-bold text-[#D4AF37]">{ea.minDeposit}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">ประเภทบัญชี</span>
                    <span className="font-semibold text-gray-200">{ea.type}</span>
                  </div>
                </div>

                {/* Feature Highlights */}
                <ul className="space-y-2.5 mb-8 text-xs text-gray-300">
                  {ea.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-4 border-t border-gray-800">
                <Link 
                  href={`/register-license?ea=${ea.code}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3C64F] to-[#B8860B] hover:brightness-110 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-950/30 transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-black" />
                  <span>ขอรับสิทธิ์ใช้งาน {ea.name}</span>
                </Link>
                <div className="text-center">
                  <span className="text-[11px] text-gray-500">
                    ต้องลงทะเบียนและได้รับการอนุมัติเลขพอร์ตก่อน EA จึงจะทำงาน
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Academy & Broker Collaboration Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#171A24] via-surface-100 to-[#12141C] border border-gold-500/30 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="max-w-xl flex items-start gap-4">
            <img 
              src="/images/zenx-logo.jpg" 
              alt="Zen X Academy" 
              className="w-16 h-16 rounded-full border-2 border-gold-500/60 object-cover shadow-xl flex-shrink-0 hidden sm:block" 
            />
            <div>
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>Zen X Academy x Versus Trade Official Ecosystem</span>
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-1.5 leading-snug">
                มาตรฐานการเทรดความเร็วสูง และความปลอดภัยของเงินทุน
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-gray-300 leading-relaxed">
                ระบบทั้งหมดถูกสอบทานและปรับแต่งสัญญาณราคาเฉพาะกับเซิร์ฟเวอร์โบรกเกอร์ <b>Versus Trade</b> เพื่อให้ค่าสเปรดและตรรกะการเทรดทำงานได้อย่างเต็มประสิทธิภาพสูงสุด
              </p>
            </div>
          </div>

          <div className="flex-shrink-0">
            <a 
              href="https://versus.trade/th/" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3C64F] to-[#B8860B] hover:brightness-110 text-black font-extrabold text-sm shadow-xl transition-all hover:scale-105"
            >
              <span>เปิดบัญชีกับ Versus Trade</span>
              <ExternalLink className="w-4 h-4 text-black" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

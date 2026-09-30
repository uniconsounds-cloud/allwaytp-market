import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { ShieldCheck, LayoutDashboard, DownloadCloud, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "AllwayTP x Zen X Academy | Elite Automated Trading Marketplace",
  description: "ศูนย์รวม Expert Advisors (EA) ระดับพรีเมียม โดย Zen X Academy และระบบตรวจสอบสิทธิ์ใบอนุญาต สำหรับโบรกเกอร์ Versus Trade",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="min-h-screen flex flex-col bg-[#090A0E] text-gray-100 antialiased selection:bg-[#D4AF37]/30 selection:text-white">
        {/* Navigation */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-[#090A0E]/85 border-b border-gray-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tight text-white group py-2">
              <div className="relative">
                <img 
                  src="/images/zenx-logo.jpg" 
                  alt="Zen X Academy Logo" 
                  className="w-10 h-10 rounded-full border border-gold-500/50 object-cover shadow-lg shadow-gold-500/20 group-hover:scale-105 transition-transform"
                />
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#D4AF37] rounded-full border-2 border-[#090A0E]" />
              </div>
              <div className="flex flex-col">
                <span className="leading-tight text-lg">
                  Allway<span className="text-gold-gradient font-black">TP</span>
                </span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                  <span>Zen X Academy</span>
                  <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-6 text-sm font-medium text-gray-300">
              <Link href="/#eas" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                <DownloadCloud className="w-4 h-4 text-gray-400" />
                <span className="hidden sm:inline">แคตตาล็อก</span> EA
              </Link>
              <Link href="/register-license" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                <span>ลงทะเบียนสิทธิ์</span>
              </Link>
              <Link 
                href="/admin" 
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-gold-500/30 bg-surface-100 hover:bg-surface-200 hover:border-gold-500/60 text-xs text-gray-300 hover:text-white transition-all shadow-sm"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Admin Backoffice</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800/80 bg-[#06070A] py-12 mt-20 text-xs text-gray-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img 
                src="/images/zenx-logo.jpg" 
                alt="Zen X Academy" 
                className="w-8 h-8 rounded-full border border-gold-500/30 object-cover" 
              />
              <div>
                <span className="font-semibold text-gray-300 block text-sm">AllwayTP x Zen X Academy</span>
                <span className="text-gray-500 text-[11px]">Elite Trading Automation • Dedicated for Versus Trade</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <a 
                href="https://versus.trade/th/" 
                target="_blank" 
                rel="noreferrer" 
                className="text-gray-400 hover:text-[#D4AF37] transition-colors"
              >
                โบรกเกอร์ Versus Trade
              </a>
              <Link href="/admin" className="text-gray-400 hover:text-gray-200 transition-colors">
                ระบบจัดการสิทธิ์หลังบ้าน
              </Link>
              <Link href="/mql-guide" className="text-gray-400 hover:text-gray-200 transition-colors">
                MQL Integration
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { ShieldCheck, Cpu, LayoutDashboard, DownloadCloud } from "lucide-react";

export const metadata: Metadata = {
  title: "AllwayTP EA Marketplace | Automated Trading with Versus Trade",
  description: "ศูนย์รวม Expert Advisors (EA) และระบบตรวจสอบสิทธิ์ใบอนุญาต สำหรับการเทรดบนโบรกเกอร์ Versus Trade",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="min-h-screen flex flex-col bg-[#0B0E14] text-gray-100 antialiased selection:bg-[#00E599]/30 selection:text-white">
        {/* Navigation */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0B0E14]/80 border-b border-gray-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-white group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Cpu className="w-5 h-5 text-black" />
              </div>
              <span>Allway<span className="text-[#00E599]">TP</span></span>
            </Link>

            <nav className="flex items-center gap-6 text-sm font-medium text-gray-300">
              <Link href="/#eas" className="hover:text-[#00E599] transition-colors flex items-center gap-1.5">
                <DownloadCloud className="w-4 h-4 text-gray-400" />
                <span>ดาวน์โหลด EA</span>
              </Link>
              <Link href="/register-license" className="hover:text-[#00E599] transition-colors flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                <span>ลงทะเบียนขอสิทธิ์</span>
              </Link>
              <Link 
                href="/admin" 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-700 bg-surface-100 hover:bg-surface-200 hover:border-gray-600 text-xs text-gray-300 hover:text-white transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#00E599]" />
                <span>ระบบหลังบ้าน</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800/60 bg-[#07090D] py-10 mt-20 text-xs text-gray-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-400">AllwayTP EA Marketplace</span>
              <span>•</span>
              <span>Exclusive Partner with Versus Trade</span>
            </div>
            <div className="flex items-center gap-6">
              <a 
                href="https://versus.trade/th/" 
                target="_blank" 
                rel="noreferrer" 
                className="text-gray-400 hover:text-[#00E599] transition-colors"
              >
                โบรกเกอร์ Versus Trade
              </a>
              <Link href="/admin" className="hover:text-gray-400 transition-colors">
                Admin Backoffice
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Check, 
  X, 
  Clock, 
  Search, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  FileCode2,
  AlertTriangle,
  Activity,
  DollarSign,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  LogOut,
  Package,
  Server,
  Database,
  Cpu,
  Edit,
  Eye,
  Key,
  TrendingUp,
  Lock,
  UserCheck,
  CheckCircle,
  HardDrive
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

interface AdminUser {
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "EA_ADMIN";
}

interface License {
  id: string;
  ea_code: string;
  account_number: string;
  broker_server: string;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  status: "PENDING" | "ACTIVE" | "REVOKED" | "EXPIRED";
  expires_at: string | null;
  approved_by: string | null;
  notes: string | null;
  created_at: string;
  balance: number;
  equity: number;
  floating_pnl: number;
  account_currency: string;
  leverage: number;
  open_orders_count: number;
  last_seen_at: string | null;
  ping_count: number;
  eas?: { name: string };
}

interface EAProduct {
  id: string;
  code: string;
  name: string;
  description: string | null;
  pair: string;
  timeframe: string;
  min_deposit: number;
  currency_type: string;
  recommended_broker: string;
  download_url: string | null;
  version: string;
  is_active: boolean;
  created_at: string;
}

interface SystemHealthData {
  database: {
    totalEAs: number;
    totalLicenses: number;
    totalLogs: number;
    totalAdmins: number;
    licensesByStatus: {
      ACTIVE: number;
      PENDING: number;
      EXPIRED: number;
      REVOKED: number;
      SUSPENDED: number;
    };
  };
  traffic: {
    requestsLast24h: number;
    sampleSuccessRate: string;
    recentLogs: Array<{
      id: string;
      ea_code: string;
      account_number: string;
      endpoint: string;
      response_status: number;
      error_message: string | null;
      created_at: string;
      telemetry: any;
    }>;
  };
  system: {
    timestamp: string;
    uptimeSeconds: number;
    nodeVersion: string;
    platform: string;
    memory: {
      rssMB: string;
      heapUsedMB: string;
      heapTotalMB: string;
    };
  };
}

export default function AdminDashboard() {
  const router = useRouter();

  // Auth State
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Tab Navigation: 'licenses' | 'eas' | 'technical'
  const [activeTab, setActiveTab] = useState<"licenses" | "eas" | "technical">("licenses");

  // Licenses Tab State
  const [licenses, setLicenses] = useState<License[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, revoked: 0, inactiveAlerts: 0 });
  const [loadingLicenses, setLoadingLicenses] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterEa, setFilterEa] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showSystemInfo, setShowSystemInfo] = useState(true);

  // Modal: Add License
  const [showAddLicenseModal, setShowAddLicenseModal] = useState(false);
  const [newEaCode, setNewEaCode] = useState("RECON_100");
  const [newAccountNumber, setNewAccountNumber] = useState("");
  const [newBrokerServer, setNewBrokerServer] = useState("VersusTrade-Live");
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newStatus, setNewStatus] = useState<"ACTIVE" | "PENDING">("ACTIVE");

  // EA Catalog Tab State
  const [eaList, setEaList] = useState<EAProduct[]>([]);
  const [loadingEAs, setLoadingEAs] = useState(false);
  const [showEAModal, setShowEAModal] = useState(false);
  const [editingEA, setEditingEA] = useState<EAProduct | null>(null);
  const [eaFormData, setEaFormData] = useState({
    code: "",
    name: "",
    description: "",
    pair: "XAUUSD",
    timeframe: "M15",
    min_deposit: 100,
    currency_type: "USD",
    download_url: "",
    version: "1.0.0",
    is_active: true,
  });

  // Technical Health Tab State (Super Admin Only)
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  // 1. Initial Session Check
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/auth");
        if (!res.ok) {
          router.replace("/admin/login");
          return;
        }
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          router.replace("/admin/login");
        }
      } catch {
        router.replace("/admin/login");
      } finally {
        setAuthChecking(false);
      }
    }
    checkAuth();
  }, [router]);

  // 2. Fetch Licenses
  const fetchLicenses = async () => {
    try {
      setLoadingLicenses(true);
      const params = new URLSearchParams();
      if (filterStatus !== "ALL") params.append("status", filterStatus);
      if (filterEa !== "ALL") params.append("ea", filterEa);
      if (searchTerm) params.append("search", searchTerm);

      const res = await fetch(`/api/admin/licenses?${params.toString()}`);
      const data = await res.json();
      if (data.licenses) {
        setLicenses(data.licenses);
        const now = Date.now();
        const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
        const inactiveCount = data.licenses.filter((l: License) => {
          if (l.status !== "ACTIVE" || !l.last_seen_at) return false;
          return (now - new Date(l.last_seen_at).getTime()) > threeDaysMs;
        }).length;

        if (data.stats) {
          setStats({ ...data.stats, inactiveAlerts: inactiveCount });
        }
      }
    } catch (err) {
      console.error("Failed to fetch licenses", err);
    } finally {
      setLoadingLicenses(false);
    }
  };

  // 3. Fetch EAs
  const fetchEAs = async () => {
    try {
      setLoadingEAs(true);
      const res = await fetch("/api/admin/eas");
      const data = await res.json();
      if (data.eas) {
        setEaList(data.eas);
      }
    } catch (err) {
      console.error("Failed to fetch EAs", err);
    } finally {
      setLoadingEAs(false);
    }
  };

  // 4. Fetch System Health (Super Admin)
  const fetchHealth = async () => {
    if (currentUser?.role !== "SUPER_ADMIN") return;
    try {
      setLoadingHealth(true);
      const res = await fetch("/api/admin/system-health");
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      }
    } catch (err) {
      console.error("Failed to fetch system health", err);
    } finally {
      setLoadingHealth(false);
    }
  };

  // Trigger data loading when tabs change
  useEffect(() => {
    if (!currentUser) return;
    if (activeTab === "licenses") {
      fetchLicenses();
    } else if (activeTab === "eas") {
      fetchEAs();
    } else if (activeTab === "technical") {
      fetchHealth();
    }
  }, [activeTab, currentUser, filterStatus, filterEa]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      await fetch("/api/admin/auth", { method: "DELETE" });
      window.location.href = "/admin/login?logged_out=1";
    } catch (err) {
      console.error("Logout failed", err);
      window.location.href = "/admin/login?logged_out=1";
    }
  };

  // Update License status
  const updateLicenseStatus = async (id: string, newStatus: "ACTIVE" | "REVOKED") => {
    try {
      setActionLoading(id);
      const res = await fetch("/api/admin/licenses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: newStatus,
          approved_by: currentUser?.name || "Admin",
        }),
      });
      if (res.ok) {
        await fetchLicenses();
      }
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Delete License
  const deleteLicense = async (id: string, account: string) => {
    if (!confirm(`ต้องการลบรายการสิทธิ์ของพอร์ต ${account} ใช่หรือไม่?`)) return;
    try {
      setActionLoading(id);
      const res = await fetch(`/api/admin/licenses?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchLicenses();
      }
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Create License
  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountNumber.trim()) return;

    try {
      const res = await fetch("/api/admin/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ea_code: newEaCode,
          account_number: newAccountNumber.trim(),
          broker_server: newBrokerServer,
          client_name: newClientName.trim() || null,
          client_phone: newClientPhone.trim() || null,
          status: newStatus,
        }),
      });

      if (res.ok) {
        setShowAddLicenseModal(false);
        setNewAccountNumber("");
        setNewClientName("");
        setNewClientPhone("");
        await fetchLicenses();
      } else {
        const data = await res.json();
        alert(`เกิดข้อผิดพลาด: ${data.error}`);
      }
    } catch (err: any) {
      alert(`บันทึกไม่สำเร็จ: ${err.message}`);
    }
  };

  // Open EA Modal (Add or Edit)
  const openEAModal = (ea?: EAProduct) => {
    if (ea) {
      setEditingEA(ea);
      setEaFormData({
        code: ea.code,
        name: ea.name,
        description: ea.description || "",
        pair: ea.pair,
        timeframe: ea.timeframe,
        min_deposit: ea.min_deposit,
        currency_type: ea.currency_type,
        download_url: ea.download_url || "",
        version: ea.version,
        is_active: ea.is_active,
      });
    } else {
      setEditingEA(null);
      setEaFormData({
        code: "",
        name: "",
        description: "",
        pair: "XAUUSD",
        timeframe: "M15",
        min_deposit: 100,
        currency_type: "USD",
        download_url: "",
        version: "1.0.0",
        is_active: true,
      });
    }
    setShowEAModal(true);
  };

  // Save EA (Create or Update)
  const handleSaveEA = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEA) {
        // PATCH
        const res = await fetch("/api/admin/eas", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingEA.id,
            ...eaFormData,
          }),
        });
        if (!res.ok) {
          const d = await res.json();
          alert(`เกิดข้อผิดพลาด: ${d.error}`);
          return;
        }
      } else {
        // POST
        const res = await fetch("/api/admin/eas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eaFormData),
        });
        if (!res.ok) {
          const d = await res.json();
          alert(`เกิดข้อผิดพลาด: ${d.error}`);
          return;
        }
      }

      setShowEAModal(false);
      await fetchEAs();
    } catch (err: any) {
      alert(`บันทึกสินค้า EA ไม่สำเร็จ: ${err.message}`);
    }
  };

  // Delete EA
  const handleDeleteEA = async (id: string, name: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า EA: "${name}"? การดำเนินการนี้จะลบสินค้าออกจากระบบ`)) return;
    try {
      const res = await fetch(`/api/admin/eas?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchEAs();
      } else {
        const d = await res.json();
        alert(`ลบไม่สำเร็จ: ${d.error}`);
      }
    } catch (err: any) {
      alert(`ลบไม่สำเร็จ: ${err.message}`);
    }
  };

  // Helper format last seen
  const formatLastSeen = (isoDate: string | null) => {
    if (!isoDate) return { text: "ยังไม่เคยเชื่อมต่อ", color: "text-gray-500", isAlert: false };
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays >= 3) {
      return { text: `ขาดการเชื่อมต่อ ${diffDays} วัน`, color: "text-rose-400 font-semibold", isAlert: true };
    }
    if (diffDays >= 1) {
      return { text: `ออฟไลน์ ${diffDays} วัน`, color: "text-amber-400", isAlert: false };
    }
    if (diffHours >= 1) {
      return { text: `${diffHours} ชม. ที่แล้ว`, color: "text-[#D4AF37]", isAlert: false };
    }
    if (diffMins > 0) {
      return { text: `${diffMins} นาทีที่แล้ว`, color: "text-[#D4AF37]", isAlert: false };
    }
    return { text: "เพิ่งเชื่อมต่อเมื่อครู่", color: "text-emerald-400 font-semibold", isAlert: false };
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-7 h-7 text-amber-400 animate-spin" />
          <span className="text-xs font-mono">กำลังตรวจสอบสิทธิ์การเข้าถึงผู้ดูแล...</span>
        </div>
      </div>
    );
  }

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* Top Admin Bar with Role & Logout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800/90">
        <div className="flex items-center gap-3.5">
          <img 
            src="/images/zenx-logo.jpg" 
            alt="Zen X Academy" 
            className="w-12 h-12 rounded-full border border-gold-500/60 object-cover shadow-lg hidden sm:block" 
          />
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border font-mono ${
                isSuperAdmin 
                  ? "bg-amber-500/10 text-[#D4AF37] border-amber-500/40" 
                  : "bg-blue-500/10 text-blue-400 border-blue-500/30"
              }`}>
                {isSuperAdmin ? "👑 superadmin" : "🛡️ admin"}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {currentUser?.email}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              แผงควบคุมระบบ AllwayTP Market
            </h1>
          </div>
        </div>

        {/* Global Admin Actions & Logout */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/mql-guide"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 border border-gray-700 text-xs font-medium text-gray-300 hover:text-white transition-all"
          >
            <FileCode2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">คู่มือ</span> MQL
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-xs font-semibold text-red-300 hover:text-red-100 transition-all"
            title="ออกจากระบบ"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex border-b border-gray-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("licenses")}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "licenses"
              ? "border-[#D4AF37] text-white bg-surface-100/70"
              : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-surface-100/30"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
          <span>จัดการสิทธิ์พอร์ต & Telemetry</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-gray-800 text-gray-300 font-mono">
            {stats.total}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("eas")}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === "eas"
              ? "border-[#D4AF37] text-white bg-surface-100/70"
              : "border-transparent text-gray-400 hover:text-gray-200 hover:bg-surface-100/30"
          }`}
        >
          <Package className="w-4 h-4 text-[#D4AF37]" />
          <span>จัดการสินค้า EA (แคตตาล็อก)</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-gray-800 text-gray-300 font-mono">
            {eaList.length > 0 ? eaList.length : "Catalog"}
          </span>
        </button>

        {/* Super Admin Exclusive Tab */}
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab("technical")}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === "technical"
                ? "border-amber-400 text-amber-300 bg-amber-950/20"
                : "border-transparent text-amber-500/70 hover:text-amber-300 hover:bg-surface-100/30"
            }`}
          >
            <Server className="w-4 h-4 text-amber-400" />
            <span>ระบบวิเคราะห์ทางเทคนิค & ฐานข้อมูล</span>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[9px] bg-amber-500/20 text-amber-300 font-bold">
              SUPER ADMIN
            </span>
          </button>
        )}
      </div>

      {/* ============================================================ */}
      {/* TAB 1: LICENSES & TELEMETRY                                  */}
      {/* ============================================================ */}
      {activeTab === "licenses" && (
        <div className="space-y-6">
          {/* Quick Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>รายการตรวจสอบสิทธิ์พอร์ตเทรด MT4 / MT5</span>
              </h2>
              <p className="text-xs text-gray-400">ควบคุม อนุมัติ ระงับสิทธิ์ และมอนิเตอร์เงินในพอร์ตแบบเรียลไทม์</p>
            </div>
            <button
              onClick={() => setShowAddLicenseModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3C64F] to-[#B8860B] hover:brightness-110 text-black text-xs font-bold shadow-lg shadow-amber-950/40 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>เพิ่มสิทธิ์พอร์ตใหม่</span>
            </button>
          </div>

          {/* Guide Accordion */}
          <div className="rounded-2xl bg-surface-100 border border-gold-500/25 overflow-hidden shadow-xl">
            <div 
              onClick={() => setShowSystemInfo(!showSystemInfo)}
              className="p-4 bg-amber-950/20 flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2.5 text-xs font-bold text-[#D4AF37]">
                <Info className="w-4 h-4" />
                <span>คำอธิบายการทำงานของระบบตรวจเช็กสิทธิ์และรอบเวลา (สำหรับแอดมิน)</span>
              </div>
              <button className="text-gray-400 hover:text-white">
                {showSystemInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showSystemInfo && (
              <div className="p-5 text-xs text-gray-300 space-y-3 border-t border-gray-800/80 leading-relaxed bg-[#0C0E14]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-xl bg-[#141820] border border-gray-800">
                    <span className="font-bold text-white block mb-1 text-[13px] text-[#D4AF37]">⏱️ 1. รอบเวลาตรวจสอบ (Heartbeat)</span>
                    <p className="text-gray-400 text-[11px] leading-relaxed">
                      EA ตรวจสิทธิ์ครั้งแรกทันทีที่เปิดกราฟ และจะยิงตรวจซ้ำ<b>ทุก ~4-5 ชั่วโมง</b> ทำงานแบบ Non-Blocking ไม่หน่วง Tick และไม่กระทบความเร็วการส่งคำสั่งเทรด
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#141820] border border-gray-800">
                    <span className="font-bold text-white block mb-1 text-[13px] text-[#D4AF37]">🛡️ 2. ระบบสุ่มกระจายโหลด (Anti-Spike)</span>
                    <p className="text-gray-400 text-[11px] leading-relaxed">
                      ระบบ<b>ไม่เช็กพร้อมกันเวลาเดียวกัน</b> แต่ใช้เศษเลขพอร์ต (Account Offset) สลับเวลาส่ง Request ตลอด 24 ชม. ป้องกัน Traffic ชนกันและประหยัดค่าใช้จ่าย 100%
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#141820] border border-gray-800">
                    <span className="font-bold text-white block mb-1 text-[13px] text-rose-400">⚠️ 3. การแจ้งเตือนพอร์ตไม่ใช้งาน</span>
                    <p className="text-gray-400 text-[11px] leading-relaxed">
                      หากพอร์ตไหน<b>ขาดการเชื่อมต่อเกิน 3 วัน</b> ระบบจะขึ้นเตือนสีแดง เพื่อให้แอดมินทราบและตัดสินใจกด "ระงับสิทธิ์" ด้วยตนเอง (ระบบจะไม่ตัดสิทธิ์เองอัตโนมัติ)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl bg-surface-100 border border-gray-800">
              <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
                <span>คำขอทั้งหมด</span>
                <Layers className="w-4 h-4 text-gray-500" />
              </div>
              <div className="text-2xl font-black text-white font-mono">{stats.total}</div>
            </div>

            <div className="p-5 rounded-2xl bg-surface-100 border border-gold-500/30 bg-amber-950/10">
              <div className="flex items-center justify-between text-[#D4AF37] text-xs mb-2">
                <span>เปิดสิทธิ์ (Active)</span>
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="text-2xl font-black text-[#D4AF37] font-mono">{stats.active}</div>
            </div>

            <div className="p-5 rounded-2xl bg-surface-100 border border-yellow-500/30 bg-yellow-950/10">
              <div className="flex items-center justify-between text-yellow-400 text-xs mb-2">
                <span>รอการอนุมัติ (Pending)</span>
                <Clock className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-2xl font-black text-yellow-400 font-mono">{stats.pending}</div>
            </div>

            <div className="p-5 rounded-2xl bg-surface-100 border border-red-500/20 bg-red-950/10">
              <div className="flex items-center justify-between text-red-400 text-xs mb-2">
                <span>ระงับสิทธิ์ (Revoked)</span>
                <XCircle className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-2xl font-black text-red-400 font-mono">{stats.revoked}</div>
            </div>

            <div className="p-5 rounded-2xl bg-surface-100 border border-rose-500/30 bg-rose-950/20 col-span-2 md:col-span-1">
              <div className="flex items-center justify-between text-rose-400 text-xs mb-2">
                <span>แจ้งเตือนไม่ได้รัน (&gt;3 วัน)</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-rose-400 font-mono">{stats.inactiveAlerts}</div>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="p-4 rounded-2xl bg-surface-100 border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="ค้นหาเลขพอร์ต, ชื่อลูกค้า, เบอร์โทร..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchLicenses()}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0C0E14] border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <button
                onClick={fetchLicenses}
                className="px-4 py-2 rounded-xl bg-surface-200 hover:bg-surface-300 text-xs font-semibold text-white transition-all"
              >
                ค้นหา
              </button>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0C0E14] border border-gray-700 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="ALL">สถานะทั้งหมด</option>
                <option value="PENDING">รออนุมัติ (Pending)</option>
                <option value="ACTIVE">เปิดสิทธิ์ (Active)</option>
                <option value="REVOKED">ระงับสิทธิ์ (Revoked)</option>
              </select>

              <select
                value={filterEa}
                onChange={(e) => setFilterEa(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#0C0E14] border border-gray-700 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="ALL">EA ทุกรุ่น</option>
                {eaList.map((ea) => (
                  <option key={ea.code} value={ea.code}>{ea.name} ({ea.code})</option>
                ))}
              </select>

              <button
                onClick={fetchLicenses}
                className="p-2 rounded-xl bg-[#0C0E14] border border-gray-700 hover:bg-surface-200 text-gray-400 hover:text-white transition-all"
                title="รีเฟรชข้อมูล"
              >
                <RefreshCw className={`w-4 h-4 ${loadingLicenses ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Licenses Table with Telemetry */}
          <div className="rounded-2xl bg-surface-100 border border-gray-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0C0E14] border-b border-gray-800 text-gray-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">เลขพอร์ตเทรด</th>
                    <th className="py-3.5 px-4 font-semibold">EA / เจ้าของพอร์ต</th>
                    <th className="py-3.5 px-4 font-semibold">ยอดเงินปัจจุบัน (Telemetry)</th>
                    <th className="py-3.5 px-4 font-semibold">สถานะการรัน (Last Seen)</th>
                    <th className="py-3.5 px-4 font-semibold">สถานะสิทธิ์</th>
                    <th className="py-3.5 px-4 font-semibold text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/80">
                  {loadingLicenses ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        กำลังโหลดข้อมูลสิทธิ์และพอร์ต...
                      </td>
                    </tr>
                  ) : licenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        ไม่พบรายการสิทธิ์ตามเงื่อนไขที่เลือก
                      </td>
                    </tr>
                  ) : (
                    licenses.map((lic) => {
                      const lastSeen = formatLastSeen(lic.last_seen_at);

                      return (
                        <tr key={lic.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-mono font-bold text-white text-sm">
                              {lic.account_number}
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {lic.broker_server}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-semibold text-gray-200 block">{lic.eas?.name || lic.ea_code}</span>
                            <div className="text-[11px] text-gray-400">
                              {lic.client_name ? `${lic.client_name} ` : ""}
                              {lic.client_phone ? `(${lic.client_phone})` : ""}
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            {lic.ping_count > 0 ? (
                              <div className="space-y-0.5">
                                <div className="font-mono font-semibold text-white">
                                  ${Number(lic.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })} {lic.account_currency}
                                </div>
                                <div className="text-[10px] text-gray-400 font-mono">
                                  Equity: ${Number(lic.equity).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                  {lic.floating_pnl !== 0 && (
                                    <span className={lic.floating_pnl > 0 ? " text-emerald-400 ml-1.5" : " text-rose-400 ml-1.5"}>
                                      ({lic.floating_pnl > 0 ? "+" : ""}{Number(lic.floating_pnl).toFixed(2)})
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500 font-mono text-[11px]">รอการเชื่อมต่อครั้งแรก</span>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5">
                              <Activity className={`w-3.5 h-3.5 ${lastSeen.color}`} />
                              <span className={`text-[11px] ${lastSeen.color}`}>
                                {lastSeen.text}
                              </span>
                            </div>
                            {lastSeen.isAlert && (
                              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold">
                                <AlertTriangle className="w-3 h-3" /> แนะนำตรวจสอบ/ระงับ
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            {lic.status === "ACTIVE" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gold-500/10 text-[#D4AF37] border border-gold-500/30">
                                <Check className="w-3 h-3" /> เปิดใช้งาน
                              </span>
                            )}
                            {lic.status === "PENDING" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                <Clock className="w-3 h-3" /> รออนุมัติ
                              </span>
                            )}
                            {lic.status === "REVOKED" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                <X className="w-3 h-3" /> ระงับสิทธิ์
                              </span>
                            )}
                            {lic.status === "EXPIRED" && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-700 text-gray-300">
                                หมดอายุ
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              {lic.status !== "ACTIVE" && (
                                <button
                                  onClick={() => updateLicenseStatus(lic.id, "ACTIVE")}
                                  disabled={actionLoading === lic.id}
                                  className="px-2.5 py-1 rounded-lg bg-gold-500/10 hover:bg-gold-500/20 text-[#D4AF37] border border-gold-500/30 text-[11px] font-bold transition-all disabled:opacity-50"
                                  title="อนุมัติสิทธิ์ให้ทำงาน"
                                >
                                  อนุมัติ
                                </button>
                              )}
                              {lic.status === "ACTIVE" && (
                                <button
                                  onClick={() => updateLicenseStatus(lic.id, "REVOKED")}
                                  disabled={actionLoading === lic.id}
                                  className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-bold transition-all disabled:opacity-50"
                                  title="ระงับสิทธิ์"
                                >
                                  ระงับสิทธิ์
                                </button>
                              )}
                              <button
                                onClick={() => deleteLicense(lic.id, lic.account_number)}
                                disabled={actionLoading === lic.id}
                                className="p-1 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                                title="ลบรายการนี้"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: EA PRODUCT CATALOG CRUD                               */}
      {/* ============================================================ */}
      {activeTab === "eas" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>จัดการรายการสินค้า EA (Product Catalog)</span>
              </h2>
              <p className="text-xs text-gray-400">
                เพิ่ม EA รุ่นใหม่ แก้ไขรายละเอียด ทุนขั้นต่ำ ลิงก์ดาวน์โหลด และเปิด/ปิดการจำหน่าย
              </p>
            </div>
            <button
              onClick={() => openEAModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3C64F] to-[#B8860B] hover:brightness-110 text-black text-xs font-bold shadow-lg shadow-amber-950/40 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>สร้างสินค้า EA ใหม่</span>
            </button>
          </div>

          {/* EA Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loadingEAs ? (
              <div className="col-span-full py-12 text-center text-gray-500 text-xs">
                กำลังโหลดรายการสินค้า EA...
              </div>
            ) : eaList.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500 text-xs">
                ยังไม่มีรายการสินค้า EA ในระบบ กดปุ่ม "สร้างสินค้า EA ใหม่" เพื่อเริ่มต้น
              </div>
            ) : (
              eaList.map((ea) => (
                <div
                  key={ea.id}
                  className="rounded-2xl bg-surface-100 border border-gray-800/90 p-5 flex flex-col justify-between hover:border-gold-500/40 transition-all shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        {ea.code}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ea.is_active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-gray-800 text-gray-400"
                      }`}>
                        {ea.is_active ? "พร้อมจำหน่าย" : "ปิดชั่วคราว"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">{ea.name}</h3>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {ea.description || "ไม่มีคำอธิบายเพิ่มเติม"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-800/80">
                      <div>
                        <span className="text-gray-500 block text-[10px]">คู่เงิน / TF</span>
                        <span className="font-semibold text-gray-300">{ea.pair} • {ea.timeframe}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">ทุนขั้นต่ำ</span>
                        <span className="font-semibold text-[#D4AF37]">
                          ${Number(ea.min_deposit).toLocaleString()} {ea.currency_type}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">เวอร์ชัน</span>
                        <span className="font-mono text-gray-300">v{ea.version}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">โบรกเกอร์แนะนำ</span>
                        <span className="text-gray-300">{ea.recommended_broker}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-gray-800/80">
                    <button
                      onClick={() => openEAModal(ea)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-200 hover:bg-surface-300 text-xs font-semibold text-white transition-all"
                    >
                      <Edit className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>แก้ไข</span>
                    </button>
                    <button
                      onClick={() => handleDeleteEA(ea.id, ea.name)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-950/30 hover:bg-red-900/50 text-xs font-semibold text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบ</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: TECHNICAL HEALTH & SYSTEM MONITORING (SUPER ADMIN)     */}
      {/* ============================================================ */}
      {activeTab === "technical" && isSuperAdmin && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                  SUPER ADMIN EXCLUSIVE
                </span>
                <span className="text-xs text-gray-400 font-mono">Backend Telemetry & DB Metrics</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                สถิติทางเทคนิค ปริมาณการสื่อสาร และการใช้ฐานข้อมูล
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                ติดตามรอบการส่ง WebRequest ของ EA ปริมาณ Log การตรวจสอบสิทธิ์ และความพร้อมของระบบ
              </p>
            </div>

            <button
              onClick={fetchHealth}
              disabled={loadingHealth}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 border border-gray-700 text-xs font-semibold text-gray-200 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loadingHealth ? "animate-spin" : ""}`} />
              <span>รีเฟรชข้อมูลเทคนิค</span>
            </button>
          </div>

          {loadingHealth && !healthData ? (
            <div className="py-16 text-center text-gray-500 text-xs">
              กำลังรวบรวมข้อมูลสถิติทางเทคนิคและเมทริกซ์...
            </div>
          ) : healthData ? (
            <div className="space-y-6">
              {/* Database Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-surface-100 border border-gray-800">
                  <div className="flex items-center justify-between text-gray-400 text-xs mb-1.5">
                    <span>ตาราง licenses</span>
                    <HardDrive className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    {healthData.database.totalLicenses}
                  </div>
                  <span className="text-[10px] text-gray-500">จำนวนพอร์ตที่ลงทะเบียนทั้งหมด</span>
                </div>

                <div className="p-4 rounded-2xl bg-surface-100 border border-gray-800">
                  <div className="flex items-center justify-between text-gray-400 text-xs mb-1.5">
                    <span>ตาราง license_logs</span>
                    <Database className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    {healthData.database.totalLogs.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-gray-500">ประวัติการยิงตรวจสอบสิทธิ์สะสม</span>
                </div>

                <div className="p-4 rounded-2xl bg-surface-100 border border-gray-800">
                  <div className="flex items-center justify-between text-gray-400 text-xs mb-1.5">
                    <span>ทราฟฟิก 24 ชั่วโมงล่าสุด</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {healthData.traffic.requestsLast24h}
                  </div>
                  <span className="text-[10px] text-gray-500">Heartbeats ใน 24 ชม. ที่ผ่านมา</span>
                </div>

                <div className="p-4 rounded-2xl bg-surface-100 border border-gray-800">
                  <div className="flex items-center justify-between text-gray-400 text-xs mb-1.5">
                    <span>Memory RSS (Node)</span>
                    <Cpu className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono">
                    {healthData.system.memory.rssMB} <span className="text-xs font-normal text-gray-400">MB</span>
                  </div>
                  <span className="text-[10px] text-gray-500">
                    Heap: {healthData.system.memory.heapUsedMB} MB
                  </span>
                </div>
              </div>

              {/* Server Runtime Environment */}
              <div className="p-5 rounded-2xl bg-[#0c0e14] border border-gray-800 text-xs space-y-3">
                <div className="flex items-center justify-between text-gray-300 font-semibold border-b border-gray-800/80 pb-3">
                  <span className="flex items-center gap-2 text-[#D4AF37]">
                    <Server className="w-4 h-4" />
                    สถานะรันไทม์เซิร์ฟเวอร์ & สภาพแวดล้อม (Server Status)
                  </span>
                  <span className="font-mono text-gray-500 text-[11px]">
                    {new Date(healthData.system.timestamp).toLocaleString("th-TH")}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-400 pt-1">
                  <div>
                    <span className="text-[11px] text-gray-500 block">Node.js Engine</span>
                    <span className="font-mono text-white text-xs">{healthData.system.nodeVersion}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 block">Server Uptime</span>
                    <span className="font-mono text-white text-xs">
                      {Math.floor(healthData.system.uptimeSeconds / 60)} นาที ({healthData.system.uptimeSeconds} วิ)
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 block">อัตราความสำเร็จ API</span>
                    <span className="font-mono text-emerald-400 text-xs font-bold">
                      {healthData.traffic.sampleSuccessRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 block">บัญชีผู้ดูแลระบบใน DB</span>
                    <span className="font-mono text-white text-xs">
                      {healthData.database.totalAdmins} บัญชี
                    </span>
                  </div>
                </div>
              </div>

              {/* Live WebRequest Logs */}
              <div className="rounded-2xl bg-surface-100 border border-gray-800 overflow-hidden shadow-2xl">
                <div className="p-4 bg-[#0C0E14] border-b border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-200">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span>ประวัติการสื่อสารจาก EA ล่าสุด (API Heartbeat / Verify Logs)</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">
                    แสดง 50 รายการล่าสุด
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#090b10] border-b border-gray-800/80 text-gray-400 uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4 font-semibold">เวลา (Timestamp)</th>
                        <th className="py-3 px-4 font-semibold">Endpoint</th>
                        <th className="py-3 px-4 font-semibold">EA Code</th>
                        <th className="py-3 px-4 font-semibold">เลขพอร์ต</th>
                        <th className="py-3 px-4 font-semibold">สถานะ HTTP</th>
                        <th className="py-3 px-4 font-semibold">ข้อมูลประกอบ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60 font-mono text-[11px]">
                      {healthData.traffic.recentLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-gray-500">
                            ยังไม่มีบันทึกทราฟฟิกในฐานข้อมูล
                          </td>
                        </tr>
                      ) : (
                        healthData.traffic.recentLogs.map((log) => {
                          const isOk = log.response_status >= 200 && log.response_status < 300;
                          return (
                            <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                                {new Date(log.created_at).toLocaleTimeString("th-TH", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                                <span className="text-[10px] text-gray-600 block">
                                  {new Date(log.created_at).toLocaleDateString("th-TH")}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-300">
                                {log.endpoint}
                              </td>
                              <td className="py-3 px-4 text-[#D4AF37] font-semibold">
                                {log.ea_code}
                              </td>
                              <td className="py-3 px-4 text-white">
                                {log.account_number}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isOk 
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                }`}>
                                  {log.response_status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-400 max-w-xs truncate text-[10px]">
                                {log.error_message ? (
                                  <span className="text-rose-400">{log.error_message}</span>
                                ) : log.telemetry ? (
                                  <span>
                                    Bal: ${log.telemetry.balance || 0} | Eq: ${log.telemetry.equity || 0}
                                  </span>
                                ) : (
                                  <span className="text-gray-600">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Admin Management Instructions Box */}
              <div className="p-6 rounded-2xl bg-[#0f141f] border border-amber-500/30 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                  <Key className="w-4 h-4" />
                  <span>คู่มือการเพิ่มและจัดการผู้ดูแลระบบ (Admin User Management)</span>
                </div>
                <div className="text-xs text-gray-300 space-y-2 leading-relaxed">
                  <p>
                    ระบบรองรับการเพิ่มผู้ดูแลระบบใหม่ได้โดยตรงผ่านตาราง <code className="bg-black/60 px-2 py-0.5 rounded text-amber-300 font-mono">admin_users</code> ใน Supabase:
                  </p>
                  <div className="p-3 bg-black/50 rounded-xl border border-gray-800 font-mono text-[11px] text-gray-300 space-y-1">
                    <div>1. เปิด Supabase Dashboard → Table Editor → เลือกตาราง <strong className="text-amber-400">admin_users</strong></div>
                    <div>2. กด <strong>Insert Row</strong> แล้วกรอก:</div>
                    <div className="pl-4 text-gray-400">
                      • <strong>email:</strong> อีเมลที่ต้องการใช้ล็อกอิน (เช่น newadmin@allwaytp.com)<br />
                      • <strong>password:</strong> รหัสผ่านที่ต้องการตั้ง<br />
                      • <strong>name:</strong> ชื่อผู้ดูแล<br />
                      • <strong>role:</strong> เลือกเป็น <span className="text-white font-bold">SUPER_ADMIN</span> (เห็นแท็บเทคนิคด้วย) หรือ <span className="text-white font-bold">EA_ADMIN</span> (เห็นเฉพาะสิทธิ์และสินค้า)<br />
                      • <strong>is_active:</strong> true
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD LICENSE                                           */}
      {/* ============================================================ */}
      {showAddLicenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-surface-100 border border-gold-500/30 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800">
              <h2 className="text-lg font-bold text-white">เพิ่มและเปิดสิทธิ์พอร์ตใหม่</h2>
              <button 
                onClick={() => setShowAddLicenseModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLicense} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-300 mb-1.5">เลือกรุ่น EA</label>
                <select
                  value={newEaCode}
                  onChange={(e) => setNewEaCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0C0E14] border border-gray-700 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                >
                  {eaList.length > 0 ? (
                    eaList.map((ea) => (
                      <option key={ea.code} value={ea.code}>{ea.name} ({ea.code})</option>
                    ))
                  ) : (
                    <>
                      <option value="RECON_100">Recon AiAuto100</option>
                      <option value="RANGER_500">Ranger AiAuto500</option>
                      <option value="DELTA_1500">Delta AiAuto1500</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1.5">เลขพอร์ตเทรด MT4 / MT5 *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 1004567"
                  value={newAccountNumber}
                  onChange={(e) => setNewAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0C0E14] border border-gray-700 text-white font-mono text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1.5">เซิร์ฟเวอร์โบรกเกอร์</label>
                <input
                  type="text"
                  value={newBrokerServer}
                  onChange={(e) => setNewBrokerServer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0C0E14] border border-gray-700 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1.5">ชื่อลูกค้า (ถ้ามี)</label>
                <input
                  type="text"
                  placeholder="ชื่อลูกค้าหรือเจ้าของพอร์ต"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0C0E14] border border-gray-700 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1.5">เบอร์โทร / LINE ID</label>
                <input
                  type="text"
                  placeholder="ช่องทางติดต่อ"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0C0E14] border border-gray-700 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1.5">สถานะเริ่มต้น</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as "ACTIVE" | "PENDING")}
                  className="w-full px-3 py-2 rounded-xl bg-[#0C0E14] border border-gray-700 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="ACTIVE">เปิดสิทธิ์ทันที (ACTIVE)</option>
                  <option value="PENDING">รอตรวจสอบ (PENDING)</option>
                </select>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddLicenseModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-surface-200 hover:bg-surface-300 text-white font-medium text-xs transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3C64F] to-[#B8860B] hover:brightness-110 text-black font-extrabold text-xs shadow-lg shadow-amber-950/40 transition-all"
                >
                  บันทึกสิทธิ์
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: CREATE / EDIT EA PRODUCT                              */}
      {/* ============================================================ */}
      {showEAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-surface-100 border border-gold-500/30 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800">
              <h2 className="text-lg font-bold text-white">
                {editingEA ? "แก้ไขสินค้า EA" : "เพิ่มสินค้า EA ใหม่"}
              </h2>
              <button 
                onClick={() => setShowEAModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEA} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1.5">
                    รหัส EA (EA Code) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingEA}
                    placeholder="เช่น DELTA_1500"
                    value={eaFormData.code}
                    onChange={(e) => setEaFormData({ ...eaFormData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0C0E14] border border-gray-700 text-white font-mono text-xs focus:outline-none focus:border-[#D4AF37] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-1.5">
                    ชื่อสินค้า (EA Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น Delta AiAuto1500"
                    value={eaFormData.name}
                    onChange={(e) => setEaFormData({ ...eaFormData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0C0E14] border border-gray-700 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1.5">รายละเอียดสินค้า</label>
                <textarea
                  rows={2}
                  placeholder="กลยุทธ์, จุดเด่น, สไตล์การเทรด..."
                  value={eaFormData.description}
                  onChange={(e) => setEaFormData({ ...eaFormData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0C0E14] border border-gray-700 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1.5">คู่เงินหลัก</label>
                  <input
                    type="text"
                    value={eaFormData.pair}
                    onChange={(e) => setEaFormData({ ...eaFormData, pair: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0C0E14] border border-gray-700 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-1.5">Timeframe</label>
                  <input
                    type="text"
                    value={eaFormData.timeframe}
                    onChange={(e) => setEaFormData({ ...eaFormData, timeframe: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0C0E14] border border-gray-700 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-1.5">เวอร์ชัน (Version)</label>
                  <input
                    type="text"
                    value={eaFormData.version}
                    onChange={(e) => setEaFormData({ ...eaFormData, version: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0C0E14] border border-gray-700 text-white font-mono text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1.5">ทุนขั้นต่ำ ($)</label>
                  <input
                    type="number"
                    value={eaFormData.min_deposit}
                    onChange={(e) => setEaFormData({ ...eaFormData, min_deposit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0C0E14] border border-gray-700 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-1.5">สกุลเงินบัญชี</label>
                  <input
                    type="text"
                    value={eaFormData.currency_type}
                    onChange={(e) => setEaFormData({ ...eaFormData, currency_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0C0E14] border border-gray-700 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1.5">ลิงก์ดาวน์โหลดไฟล์ EA (.ex4 / .ex5)</label>
                <input
                  type="text"
                  placeholder="https://... หรือ /downloads/..."
                  value={eaFormData.download_url}
                  onChange={(e) => setEaFormData({ ...eaFormData, download_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0C0E14] border border-gray-700 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="ea_active"
                  checked={eaFormData.is_active}
                  onChange={(e) => setEaFormData({ ...eaFormData, is_active: e.target.checked })}
                  className="rounded border-gray-700 text-amber-500 focus:ring-0"
                />
                <label htmlFor="ea_active" className="text-gray-300 text-xs cursor-pointer select-none">
                  เปิดให้แสดงในแคตตาล็อกหน้าเว็บ (Active)
                </label>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEAModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-surface-200 hover:bg-surface-300 text-white font-medium text-xs transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3C64F] to-[#B8860B] hover:brightness-110 text-black font-extrabold text-xs shadow-lg shadow-amber-950/40 transition-all"
                >
                  {editingEA ? "บันทึกการแก้ไข" : "สร้างสินค้า EA"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

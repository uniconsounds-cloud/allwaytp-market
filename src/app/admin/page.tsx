"use client";

import { useState, useEffect } from "react";
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
  Sparkles
} from "lucide-react";
import Link from "next/link";

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
  
  // Telemetry fields
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

export default function AdminDashboard() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, revoked: 0, inactiveAlerts: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterEa, setFilterEa] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showSystemInfo, setShowSystemInfo] = useState(true);

  // Modal State for adding new license
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEaCode, setNewEaCode] = useState("RECON_100");
  const [newAccountNumber, setNewAccountNumber] = useState("");
  const [newBrokerServer, setNewBrokerServer] = useState("VersusTrade-Live");
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newStatus, setNewStatus] = useState<"ACTIVE" | "PENDING">("ACTIVE");

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "ALL") params.append("status", filterStatus);
      if (filterEa !== "ALL") params.append("ea", filterEa);
      if (searchTerm) params.append("search", searchTerm);

      const res = await fetch(`/api/admin/licenses?${params.toString()}`);
      const data = await res.json();
      if (data.licenses) {
        setLicenses(data.licenses);
        
        // Calculate inactive alerts (> 3 days without heartbeat)
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, [filterStatus, filterEa]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLicenses();
  };

  const updateStatus = async (id: string, newStatus: "ACTIVE" | "REVOKED") => {
    try {
      setActionLoading(id);
      const res = await fetch("/api/admin/licenses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: newStatus,
          approved_by: "Admin Team",
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
        setShowAddModal(false);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div className="flex items-center gap-3.5">
          <img 
            src="/images/zenx-logo.jpg" 
            alt="Zen X Academy" 
            className="w-12 h-12 rounded-full border border-gold-500/60 object-cover shadow-lg hidden sm:block" 
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gold-500/10 text-[#D4AF37] border border-gold-500/30">
                Admin Backoffice
              </span>
              <span className="text-xs text-gray-500 font-mono">Zen X Academy x Versus Trade</span>
            </div>
            <h1 className="text-3xl font-black text-white mt-1">ระบบจัดการสิทธิ์และติดตามพอร์ต EA</h1>
            <p className="text-xs text-gray-400 mt-1">ควบคุมและอนุมัติสิทธิ์การใช้งาน พร้อมระบบติดตามสถานะพอร์ตแบบ Real-time</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/mql-guide"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-gray-700 text-xs font-semibold text-gray-300 hover:text-white transition-all"
          >
            <FileCode2 className="w-4 h-4 text-[#D4AF37]" />
            <span>คู่มือติดตั้งใน EA (.mqh)</span>
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3C64F] to-[#B8860B] hover:brightness-110 text-black text-xs font-bold shadow-lg shadow-amber-950/40 transition-all"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>เพิ่มสิทธิ์พอร์ตใหม่</span>
          </button>
        </div>
      </div>

      {/* Explanatory Guide Box for Admins */}
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
        <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="ค้นหาเลขพอร์ต, ชื่อลูกค้า, เบอร์โทร..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0C0E14] border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-surface-200 hover:bg-surface-300 text-xs font-semibold text-white transition-all"
          >
            ค้นหา
          </button>
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
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

          {/* EA Filter */}
          <select
            value={filterEa}
            onChange={(e) => setFilterEa(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0C0E14] border border-gray-700 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="ALL">EA ทุกรุ่น</option>
            <option value="RECON_100">Recon AiAuto100</option>
            <option value="RANGER_500">Ranger AiAuto500</option>
            <option value="DELTA_1500">Delta AiAuto1500</option>
          </select>

          <button
            onClick={() => fetchLicenses()}
            className="p-2 rounded-xl bg-[#0C0E14] border border-gray-700 hover:bg-surface-200 text-gray-400 hover:text-white transition-all"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
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
              {loading ? (
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
                      {/* Account Number & Broker */}
                      <td className="py-4 px-4">
                        <div className="font-mono font-bold text-white text-sm">
                          {lic.account_number}
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {lic.broker_server}
                        </span>
                      </td>

                      {/* EA and Client Name */}
                      <td className="py-4 px-4">
                        <span className="font-semibold text-gray-200 block">{lic.eas?.name || lic.ea_code}</span>
                        <div className="text-[11px] text-gray-400">
                          {lic.client_name ? `${lic.client_name} ` : ""}
                          {lic.client_phone ? `(${lic.client_phone})` : ""}
                        </div>
                      </td>

                      {/* Telemetry: Balance & Equity */}
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

                      {/* Heartbeat & Inactivity Status */}
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

                      {/* License Status */}
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

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {lic.status !== "ACTIVE" && (
                            <button
                              onClick={() => updateStatus(lic.id, "ACTIVE")}
                              disabled={actionLoading === lic.id}
                              className="px-2.5 py-1 rounded-lg bg-gold-500/10 hover:bg-gold-500/20 text-[#D4AF37] border border-gold-500/30 text-[11px] font-bold transition-all disabled:opacity-50"
                              title="อนุมัติสิทธิ์ให้ทำงาน"
                            >
                              อนุมัติ
                            </button>
                          )}
                          {lic.status === "ACTIVE" && (
                            <button
                              onClick={() => updateStatus(lic.id, "REVOKED")}
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

      {/* Add License Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-surface-100 border border-gold-500/30 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800">
              <h2 className="text-lg font-bold text-white">เพิ่มและเปิดสิทธิ์พอร์ตใหม่</h2>
              <button 
                onClick={() => setShowAddModal(false)}
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
                  <option value="RECON_100">Recon AiAuto100</option>
                  <option value="RANGER_500">Ranger AiAuto500</option>
                  <option value="DELTA_1500">Delta AiAuto1500</option>
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
                  onClick={() => setShowAddModal(false)}
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
    </div>
  );
}

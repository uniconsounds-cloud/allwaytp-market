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
  UserCheck, 
  AlertTriangle,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  FileCode2
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
  eas?: { name: string };
}

export default function AdminDashboard() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, revoked: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterEa, setFilterEa] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
        if (data.stats) setStats(data.stats);
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
          approved_by: "Admin (คุณโจ้/ครูชัย)",
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-[#00E599] border border-emerald-500/20">
              Admin Backoffice
            </span>
            <span className="text-xs text-gray-500 font-mono">AllwayTP x Versus Trade</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">ระบบจัดการและอนุมัติสิทธิ์ EA</h1>
          <p className="text-xs text-gray-400 mt-1">สำหรับคุณโจ้ (Web Admin) และครูชัย (EA Developer) ควบคุมสิทธิ์รายบัญชี</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/mql-guide"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-gray-700 text-xs font-semibold text-gray-300 hover:text-white transition-all"
          >
            <FileCode2 className="w-4 h-4 text-[#00E599]" />
            <span>โค้ดเชื่อมต่อ MQL (.mqh)</span>
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00E599] hover:bg-[#00C985] text-black text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มสิทธิ์พอร์ตใหม่</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface-100 border border-gray-800">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>คำขอทั้งหมด</span>
            <Layers className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-2xl font-black text-white">{stats.total}</div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-100 border border-emerald-500/20 bg-emerald-950/10">
          <div className="flex items-center justify-between text-emerald-400 text-xs mb-2">
            <span>เปิดสิทธิ์ใช้งาน (Active)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-[#00E599]">{stats.active}</div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-100 border border-amber-500/20 bg-amber-950/10">
          <div className="flex items-center justify-between text-amber-400 text-xs mb-2">
            <span>รอการอนุมัติ (Pending)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{stats.pending}</div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-100 border border-red-500/20 bg-red-950/10">
          <div className="flex items-center justify-between text-red-400 text-xs mb-2">
            <span>ระงับสิทธิ์ (Revoked)</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400">{stats.revoked}</div>
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
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#12151B] border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00E599]"
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
            className="px-3 py-2 rounded-xl bg-[#12151B] border border-gray-700 text-xs text-white focus:outline-none focus:border-[#00E599]"
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
            className="px-3 py-2 rounded-xl bg-[#12151B] border border-gray-700 text-xs text-white focus:outline-none focus:border-[#00E599]"
          >
            <option value="ALL">EA ทุกรุ่น</option>
            <option value="RECON_100">Recon AiAuto100</option>
            <option value="RANGER_500">Ranger AiAuto500</option>
            <option value="DELTA_1500">Delta AiAuto1500</option>
          </select>

          <button
            onClick={() => fetchLicenses()}
            className="p-2 rounded-xl bg-[#12151B] border border-gray-700 hover:bg-surface-200 text-gray-400 hover:text-white transition-all"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Licenses Table */}
      <div className="rounded-2xl bg-surface-100 border border-gray-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#12151B] border-b border-gray-800 text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-semibold">เลขพอร์ตเทรด</th>
                <th className="py-3.5 px-4 font-semibold">Expert Advisor (EA)</th>
                <th className="py-3.5 px-4 font-semibold">เซิร์ฟเวอร์</th>
                <th className="py-3.5 px-4 font-semibold">ผู้ขอสิทธิ์ / เบอร์ติดต่อ</th>
                <th className="py-3.5 px-4 font-semibold">สถานะ</th>
                <th className="py-3.5 px-4 font-semibold">วันหมดอายุ</th>
                <th className="py-3.5 px-4 font-semibold text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    กำลังโหลดข้อมูลสิทธิ์...
                  </td>
                </tr>
              ) : licenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    ไม่พบรายการสิทธิ์ตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                licenses.map((lic) => (
                  <tr key={lic.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-white">
                      {lic.account_number}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-200">{lic.eas?.name || lic.ea_code}</span>
                      <span className="block text-[10px] text-gray-500 font-mono">{lic.ea_code}</span>
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-[11px] font-mono">
                        {lic.broker_server}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-200">{lic.client_name || "-"}</div>
                      <div className="text-[11px] text-gray-500">{lic.client_phone || lic.client_email || "-"}</div>
                    </td>
                    <td className="py-4 px-4">
                      {lic.status === "ACTIVE" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-[#00E599] border border-emerald-500/20">
                          <Check className="w-3 h-3" /> เปิดใช้งาน
                        </span>
                      )}
                      {lic.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
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
                    <td className="py-4 px-4 text-gray-400 font-mono text-[11px]">
                      {lic.expires_at ? new Date(lic.expires_at).toLocaleDateString("th-TH") : "ตลอดชีพ (Lifetime)"}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {lic.status !== "ACTIVE" && (
                          <button
                            onClick={() => updateStatus(lic.id, "ACTIVE")}
                            disabled={actionLoading === lic.id}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[#00E599] border border-emerald-500/30 text-[11px] font-bold transition-all disabled:opacity-50"
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
                            title="ระงับสิทธิ์ชั่วคราว"
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add License Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-surface-100 border border-gray-700 p-6 shadow-2xl">
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
                  className="w-full px-3 py-2 rounded-xl bg-[#12151B] border border-gray-700 text-white text-xs focus:outline-none focus:border-[#00E599]"
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
                  className="w-full px-3 py-2 rounded-xl bg-[#12151B] border border-gray-700 text-white font-mono text-xs focus:outline-none focus:border-[#00E599]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1.5">เซิร์ฟเวอร์โบรกเกอร์</label>
                <input
                  type="text"
                  value={newBrokerServer}
                  onChange={(e) => setNewBrokerServer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#12151B] border border-gray-700 text-white text-xs focus:outline-none focus:border-[#00E599]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1.5">ชื่อลูกค้า (ถ้ามี)</label>
                <input
                  type="text"
                  placeholder="ชื่อลูกค้าหรือเจ้าของพอร์ต"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#12151B] border border-gray-700 text-white text-xs focus:outline-none focus:border-[#00E599]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1.5">เบอร์โทร / LINE ID</label>
                <input
                  type="text"
                  placeholder="ช่องทางติดต่อ"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#12151B] border border-gray-700 text-white text-xs focus:outline-none focus:border-[#00E599]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1.5">สถานะเริ่มต้น</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as "ACTIVE" | "PENDING")}
                  className="w-full px-3 py-2 rounded-xl bg-[#12151B] border border-gray-700 text-white text-xs focus:outline-none focus:border-[#00E599]"
                >
                  <option value="ACTIVE">เปิดสิทธิ์ทันที (ACTIVE)</option>
                  <option value="PENDING">รอตรวจสอบ (PENDING)</option>
                </select>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl bg-surface-200 hover:bg-surface-300 text-white font-medium text-xs transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#00E599] hover:bg-[#00C985] text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
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

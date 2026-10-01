import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (admin.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: หน้านี้สำหรับ Super Admin (ผู้ดูแลระบบหลัก) เท่านั้น" },
        { status: 403 }
      );
    }

    // 1. Table record counts
    const [easCount, licensesCount, logsCount, adminsCount] = await Promise.all([
      supabaseAdmin.from("eas").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("licenses").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("license_logs").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("admin_users").select("*", { count: "exact", head: true }),
    ]);

    // 2. License Status breakdown
    const { data: statusBreakdown } = await supabaseAdmin
      .from("licenses")
      .select("status");

    const countsByStatus = {
      ACTIVE: 0,
      PENDING: 0,
      EXPIRED: 0,
      REVOKED: 0,
      SUSPENDED: 0,
    };
    if (statusBreakdown) {
      statusBreakdown.forEach((l) => {
        const s = l.status as keyof typeof countsByStatus;
        if (countsByStatus[s] !== undefined) {
          countsByStatus[s]++;
        }
      });
    }

    // 3. Telemetry activity in last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentLogs, count: logs24hCount } = await supabaseAdmin
      .from("license_logs")
      .select("id, license_id, ea_code, account_number, endpoint, response_status, error_message, created_at, telemetry", { count: "exact" })
      .gte("created_at", yesterday)
      .order("created_at", { ascending: false })
      .limit(50);

    // Fallback: If no logs in 24h, grab last 50 overall logs
    let displayLogs = recentLogs || [];
    if (displayLogs.length === 0) {
      const { data: anyLogs } = await supabaseAdmin
        .from("license_logs")
        .select("id, license_id, ea_code, account_number, endpoint, response_status, error_message, created_at, telemetry")
        .order("created_at", { ascending: false })
        .limit(50);
      displayLogs = anyLogs || [];
    }

    // Count success vs failed in recent logs
    let successCount = 0;
    let failedCount = 0;
    displayLogs.forEach((log) => {
      if (log.response_status >= 200 && log.response_status < 300) {
        successCount++;
      } else {
        failedCount++;
      }
    });

    // 4. Memory and System metrics
    const memUsage = process.memoryUsage();
    const systemMetrics = {
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rssMB: (memUsage.rss / 1024 / 1024).toFixed(2),
        heapUsedMB: (memUsage.heapUsed / 1024 / 1024).toFixed(2),
        heapTotalMB: (memUsage.heapTotal / 1024 / 1024).toFixed(2),
      },
    };

    return NextResponse.json({
      success: true,
      database: {
        totalEAs: easCount.count || 0,
        totalLicenses: licensesCount.count || 0,
        totalLogs: logsCount.count || 0,
        totalAdmins: adminsCount.count || 0,
        licensesByStatus: countsByStatus,
      },
      traffic: {
        requestsLast24h: logs24hCount || 0,
        sampleSuccessRate: displayLogs.length > 0 ? ((successCount / displayLogs.length) * 100).toFixed(1) : "100.0",
        recentLogs: displayLogs,
      },
      system: systemMetrics,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch system metrics" }, { status: 500 });
  }
}

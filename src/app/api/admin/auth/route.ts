import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { setAdminSession, clearAdminSession, getCurrentAdmin, AdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET: Check current logged in admin session
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user: admin });
}

// POST: Admin Login
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "กรุณาระบุอีเมลและรหัสผ่าน" }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // 1. Check in admin_users table via service_role client
    const { data: adminUser, error } = await supabaseAdmin
      .from("admin_users")
      .select("id, email, name, role, password, is_active")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (error) {
      console.error("Database admin lookup error:", error);
    }

    let authenticatedUser: AdminUser | null = null;

    if (adminUser) {
      if (!adminUser.is_active) {
        return NextResponse.json({ error: "บัญชีผู้ใช้นี้ถูกปิดการใช้งาน กรุณาติดต่อ Super Admin" }, { status: 403 });
      }

      if (adminUser.password === password) {
        authenticatedUser = {
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role as "SUPER_ADMIN" | "EA_ADMIN",
        };
      }
    } else {
      // Default fallback credentials
      if (cleanEmail === "juntarasate@gmail.com" && password === "admin1234") {
        authenticatedUser = {
          email: "juntarasate@gmail.com",
          name: "superadmin",
          role: "SUPER_ADMIN",
        };
      } else if (cleanEmail === "bctutor123@gmail.com" && password === "admin1234") {
        authenticatedUser = {
          email: "bctutor123@gmail.com",
          name: "admin",
          role: "EA_ADMIN",
        };
      } else if (cleanEmail === "admin@allwaytp.com" && password === "admin1234") {
        authenticatedUser = {
          email: "admin@allwaytp.com",
          name: "superadmin",
          role: "SUPER_ADMIN",
        };
      } else if (cleanEmail === "ea.partner@allwaytp.com" && password === "eapartner1234") {
        authenticatedUser = {
          email: "ea.partner@allwaytp.com",
          name: "admin",
          role: "EA_ADMIN",
        };
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    // Set signed session cookie
    setAdminSession(authenticatedUser);

    return NextResponse.json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      user: authenticatedUser,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" }, { status: 500 });
  }
}

// DELETE: Admin Logout
export async function DELETE() {
  clearAdminSession();
  return NextResponse.json({ success: true, message: "ออกจากระบบเรียบร้อยแล้ว" });
}

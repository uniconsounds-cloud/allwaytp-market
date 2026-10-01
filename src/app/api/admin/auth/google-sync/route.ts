import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { signToken, AdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    let adminUser: AdminUser | null = null;

    if (cleanEmail === "juntarasate@gmail.com") {
      adminUser = {
        email: cleanEmail,
        name: "superadmin",
        role: "SUPER_ADMIN",
      };
    } else if (cleanEmail === "bctutor123@gmail.com") {
      adminUser = {
        email: cleanEmail,
        name: "admin",
        role: "EA_ADMIN",
      };
    } else {
      const { data: dbAdmin } = await supabaseAdmin
        .from("admin_users")
        .select("email, name, role, is_active")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (dbAdmin && dbAdmin.is_active) {
        adminUser = {
          email: dbAdmin.email,
          name: dbAdmin.name,
          role: dbAdmin.role as "SUPER_ADMIN" | "EA_ADMIN",
        };
      }
    }

    if (!adminUser) {
      return NextResponse.json(
        { error: `อีเมล (${cleanEmail}) ไม่มีสิทธิ์เข้าถึงระบบผู้ดูแล AllwayTP` },
        { status: 403 }
      );
    }

    const token = signToken(adminUser);
    const response = NextResponse.json({
      success: true,
      user: adminUser,
      redirectTo: "/admin",
    });

    response.cookies.set("allwaytp_admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Sync failed" }, { status: 500 });
  }
}

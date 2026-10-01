import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { setAdminSession, AdminUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/admin";
  const errorDesc = searchParams.get("error_description");

  if (errorDesc) {
    return NextResponse.redirect(`${origin}/admin/login?error=${encodeURIComponent(errorDesc)}`);
  }

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore if called from Server Component
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session?.user?.email) {
      const email = data.session.user.email.toLowerCase().trim();

      // Check predefined role and display name mappings
      let adminUser: AdminUser | null = null;

      if (email === "juntarasate@gmail.com") {
        adminUser = {
          email,
          name: "superadmin",
          role: "SUPER_ADMIN",
        };
      } else if (email === "bctutor123@gmail.com") {
        adminUser = {
          email,
          name: "admin",
          role: "EA_ADMIN",
        };
      } else {
        // Also check if this email exists in admin_users table in Supabase
        const { data: dbAdmin } = await supabaseAdmin
          .from("admin_users")
          .select("email, name, role, is_active")
          .eq("email", email)
          .maybeSingle();

        if (dbAdmin && dbAdmin.is_active) {
          adminUser = {
            email: dbAdmin.email,
            name: dbAdmin.name,
            role: dbAdmin.role as "SUPER_ADMIN" | "EA_ADMIN",
          };
        }
      }

      if (adminUser) {
        // Set secure HMAC-signed admin session cookie
        setAdminSession(adminUser);
        return NextResponse.redirect(`${origin}${next}`);
      } else {
        // Unauthorized Google Account
        return NextResponse.redirect(
          `${origin}/admin/login?error=${encodeURIComponent(
            `อีเมล Google (${email}) ไม่มีสิทธิ์เข้าถึงระบบผู้ดูแล AllwayTP กรุณาใช้อีเมลที่ได้รับอนุญาต`
          )}`
        );
      }
    }
  }

  return NextResponse.redirect(
    `${origin}/admin/login?error=${encodeURIComponent("การเข้าสู่ระบบผ่าน Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")}`
  );
}

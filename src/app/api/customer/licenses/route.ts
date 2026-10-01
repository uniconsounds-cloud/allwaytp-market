import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query licenses associated with this customer's email
    const { data: licenses, error } = await supabaseAdmin
      .from("licenses")
      .select("*, eas(*)")
      .eq("client_email", cleanEmail)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const now = Date.now();
    const processedLicenses = (licenses || []).map((lic) => {
      let status = lic.status;
      if (lic.expires_at && new Date(lic.expires_at).getTime() < now && status === "ACTIVE") {
        status = "EXPIRED";
      }
      return {
        ...lic,
        status,
      };
    });

    return NextResponse.json({
      success: true,
      licenses: processedLicenses,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch customer licenses" }, { status: 500 });
  }
}

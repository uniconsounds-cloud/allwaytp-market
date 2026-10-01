import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET: List all EAs (including active & inactive)
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: eas, error } = await supabaseAdmin
      .from("eas")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ eas });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Create a new EA product
export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { code, name, description, pair, timeframe, min_deposit, currency_type, download_url, version, is_active } = body;

    if (!code || !name) {
      return NextResponse.json({ error: "รหัส EA (code) และชื่อ EA (name) จำเป็นต้องระบุ" }, { status: 400 });
    }

    const cleanCode = String(code).trim().toUpperCase();

    const { data, error } = await supabaseAdmin
      .from("eas")
      .insert([
        {
          code: cleanCode,
          name: name.trim(),
          description: description?.trim() || null,
          pair: pair?.trim() || "XAUUSD",
          timeframe: timeframe?.trim() || "M15",
          min_deposit: Number(min_deposit) || 100,
          currency_type: currency_type || "USD",
          recommended_broker: "Versus Trade",
          download_url: download_url?.trim() || null,
          version: version?.trim() || "1.0.0",
          is_active: is_active !== undefined ? is_active : true,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, ea: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Edit existing EA product
export async function PATCH(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, description, pair, timeframe, min_deposit, currency_type, download_url, version, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing EA id" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updatePayload.name = name.trim();
    if (description !== undefined) updatePayload.description = description.trim();
    if (pair !== undefined) updatePayload.pair = pair.trim();
    if (timeframe !== undefined) updatePayload.timeframe = timeframe.trim();
    if (min_deposit !== undefined) updatePayload.min_deposit = Number(min_deposit);
    if (currency_type !== undefined) updatePayload.currency_type = currency_type;
    if (download_url !== undefined) updatePayload.download_url = download_url?.trim() || null;
    if (version !== undefined) updatePayload.version = version.trim();
    if (is_active !== undefined) updatePayload.is_active = is_active;

    const { data, error } = await supabaseAdmin
      .from("eas")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, ea: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove EA product
export async function DELETE(req: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing EA id" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("eas").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

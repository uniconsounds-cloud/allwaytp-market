import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// GET: List all licenses with filter & statistics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const ea = searchParams.get("ea") || "";

    let query = supabaseAdmin
      .from("licenses")
      .select("*, eas(name)")
      .order("created_at", { ascending: false });

    if (status && status !== "ALL") {
      query = query.eq("status", status);
    }
    if (ea && ea !== "ALL") {
      query = query.eq("ea_code", ea);
    }
    if (search) {
      query = query.or(`account_number.ilike.%${search}%,client_name.ilike.%${search}%,client_phone.ilike.%${search}%`);
    }

    const { data: licenses, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate quick statistics
    const stats = {
      total: licenses?.length || 0,
      active: licenses?.filter(l => l.status === "ACTIVE").length || 0,
      pending: licenses?.filter(l => l.status === "PENDING").length || 0,
      revoked: licenses?.filter(l => l.status === "REVOKED").length || 0,
    };

    return NextResponse.json({ licenses, stats });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Update license status or expiration
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, expires_at, notes, approved_by } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing license id" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) updatePayload.status = status;
    if (expires_at !== undefined) updatePayload.expires_at = expires_at;
    if (notes !== undefined) updatePayload.notes = notes;
    if (approved_by !== undefined) updatePayload.approved_by = approved_by;

    const { data, error } = await supabaseAdmin
      .from("licenses")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, license: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Add new license directly by Admin
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ea_code, account_number, broker_server, client_name, client_email, client_phone, notes, status, expires_at } = body;

    if (!ea_code || !account_number) {
      return NextResponse.json({ error: "ea_code and account_number are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("licenses")
      .insert([
        {
          ea_code,
          account_number: String(account_number).trim(),
          broker_server: broker_server || "VersusTrade-Live",
          client_name: client_name?.trim() || null,
          client_email: client_email?.trim() || null,
          client_phone: client_phone?.trim() || null,
          notes: notes?.trim() || null,
          status: status || "ACTIVE",
          expires_at: expires_at || null,
          approved_by: "Admin",
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, license: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove license
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing license id" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("licenses").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

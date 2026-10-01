import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const DEFAULT_EA_IMAGES: Record<string, string[]> = {
  RECON_100: [
    "/images/ea-recon-100.jpg",
    "/images/9371_0.jpg",
    "/images/9372_0.jpg",
  ],
  RANGER_500: [
    "/images/ea-ranger-500.jpg",
    "/images/9375_0.jpg",
    "/images/9376_0.jpg",
  ],
  DELTA_1500: [
    "/images/ea-delta-1500.jpg",
    "/images/9378_0.jpg",
    "/images/9379_0.jpg",
  ],
};

function parseEAMetadata(ea: any) {
  let images = Array.isArray(ea.images) && ea.images.length > 0 ? ea.images : (DEFAULT_EA_IMAGES[ea.code] || []);
  let duration_days = ea.duration_days || 365;
  let cleanDescription = ea.description || "";

  if (ea.description && ea.description.includes("<!--META:")) {
    try {
      const match = ea.description.match(/<!--META:(.*?)-->/);
      if (match && match[1]) {
        const meta = JSON.parse(match[1]);
        if (Array.isArray(meta.images) && meta.images.length > 0) {
          images = meta.images;
        }
        if (meta.duration_days !== undefined) {
          duration_days = meta.duration_days;
        }
        cleanDescription = ea.description.replace(/<!--META:(.*?)-->/, "").trim();
      }
    } catch {
      // ignore JSON parse error
    }
  }

  return {
    ...ea,
    description: cleanDescription,
    images,
    duration_days,
  };
}

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

    const processedEAs = eas?.map(parseEAMetadata) || [];

    return NextResponse.json({ eas: processedEAs });
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
    const { code, name, description, pair, timeframe, min_deposit, currency_type, download_url, version, is_active, images, duration_days } = body;

    if (!code || !name) {
      return NextResponse.json({ error: "รหัส EA (code) และชื่อ EA (name) จำเป็นต้องระบุ" }, { status: 400 });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const finalImages = Array.isArray(images) && images.length > 0 ? images.slice(0, 3) : (DEFAULT_EA_IMAGES[cleanCode] || []);
    const finalDuration = duration_days !== undefined ? Number(duration_days) : 365;

    const metaTag = `\n<!--META:${JSON.stringify({ images: finalImages, duration_days: finalDuration })}-->`;
    const storedDescription = (description ? description.trim() : "") + metaTag;

    const insertPayload: Record<string, any> = {
      code: cleanCode,
      name: name.trim(),
      description: storedDescription,
      pair: pair?.trim() || "XAUUSD",
      timeframe: timeframe?.trim() || "M15",
      min_deposit: Number(min_deposit) || 100,
      currency_type: currency_type || "USD",
      recommended_broker: "Versus Trade",
      download_url: download_url?.trim() || null,
      version: version?.trim() || "1.0.0",
      is_active: is_active !== undefined ? is_active : true,
    };

    const { data, error } = await supabaseAdmin
      .from("eas")
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, ea: parseEAMetadata(data) });
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
    const { id, code, name, description, pair, timeframe, min_deposit, currency_type, download_url, version, is_active, images, duration_days } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing EA id" }, { status: 400 });
    }

    const finalImages = Array.isArray(images) ? images.slice(0, 3) : [];
    const finalDuration = duration_days !== undefined ? Number(duration_days) : 365;
    const metaTag = `\n<!--META:${JSON.stringify({ images: finalImages, duration_days: finalDuration })}-->`;
    const storedDescription = (description !== undefined ? description.trim() : "") + metaTag;

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
      description: storedDescription,
    };

    if (name !== undefined) updatePayload.name = name.trim();
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

    return NextResponse.json({ success: true, ea: parseEAMetadata(data) });
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

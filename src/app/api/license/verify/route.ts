import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleVerification(req);
}

export async function POST(req: NextRequest) {
  return handleVerification(req);
}

async function handleVerification(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  
  let accountNumber = "";
  let eaCode = "";
  let brokerServer = "";
  let clientVersion = "1.1.0";
  
  // Telemetry variables
  let balance = 0;
  let equity = 0;
  let floatingPnl = 0;
  let freeMargin = 0;
  let currency = "USD";
  let leverage = 100;
  let openOrders = 0;

  if (req.method === "GET") {
    const { searchParams } = new URL(req.url);
    accountNumber = searchParams.get("account") || searchParams.get("account_number") || "";
    eaCode = searchParams.get("ea") || searchParams.get("ea_code") || "";
    brokerServer = searchParams.get("broker") || searchParams.get("broker_server") || "";
    clientVersion = searchParams.get("version") || "1.1.0";
    
    balance = parseFloat(searchParams.get("bal") || "0") || 0;
    equity = parseFloat(searchParams.get("eq") || "0") || 0;
    floatingPnl = parseFloat(searchParams.get("pnl") || "0") || 0;
    freeMargin = parseFloat(searchParams.get("margin") || "0") || 0;
    currency = searchParams.get("cur") || "USD";
    leverage = parseInt(searchParams.get("lev") || "100", 10) || 100;
    openOrders = parseInt(searchParams.get("orders") || "0", 10) || 0;
  } else {
    try {
      const body = await req.json();
      accountNumber = String(body.account || body.account_number || "");
      eaCode = String(body.ea || body.ea_code || "");
      brokerServer = String(body.broker || body.broker_server || "");
      clientVersion = String(body.version || "1.1.0");
      
      balance = parseFloat(body.bal || body.balance || "0") || 0;
      equity = parseFloat(body.eq || body.equity || "0") || 0;
      floatingPnl = parseFloat(body.pnl || body.floating_pnl || "0") || 0;
      freeMargin = parseFloat(body.margin || body.free_margin || "0") || 0;
      currency = body.cur || body.currency || "USD";
      leverage = parseInt(body.lev || body.leverage || "100", 10) || 100;
      openOrders = parseInt(body.orders || body.open_orders || "0", 10) || 0;
    } catch {
      // Body may be empty or form-encoded
    }
  }

  accountNumber = accountNumber.trim();
  eaCode = eaCode.trim().toUpperCase();

  if (!accountNumber || !eaCode) {
    return NextResponse.json(
      {
        authorized: false,
        status: "INVALID_PARAMETERS",
        message: "Missing required parameters: account_number and ea_code are required",
      },
      { status: 400 }
    );
  }

  try {
    // 1. Query license record from Supabase
    const { data: license, error } = await supabaseAdmin
      .from("licenses")
      .select("id, ea_code, account_number, broker_server, status, expires_at, client_name, ping_count")
      .eq("account_number", accountNumber)
      .eq("ea_code", eaCode)
      .maybeSingle();

    if (error) {
      console.error("Database query error:", error);
      return NextResponse.json(
        {
          authorized: false,
          status: "SERVER_ERROR",
          message: "Internal verification error.",
        },
        { status: 500 }
      );
    }

    if (!license) {
      // Log failed attempt for unregistered account
      await supabaseAdmin.from("license_logs").insert([
        {
          account_number: accountNumber,
          ea_code: eaCode,
          broker_server: brokerServer || null,
          ip_address: ip,
          status_result: "NOT_FOUND",
          client_version: clientVersion,
        },
      ]);

      return NextResponse.json({
        authorized: false,
        status: "NOT_FOUND",
        message: `Account ${accountNumber} is not registered for EA ${eaCode}.`,
      });
    }

    // 2. Check expiration
    let isExpired = false;
    if (license.expires_at) {
      const expiry = new Date(license.expires_at).getTime();
      const now = Date.now();
      if (now > expiry) {
        isExpired = true;
      }
    }

    let authorized = false;
    let finalStatus = license.status;
    let responseMessage = "";

    if (isExpired) {
      finalStatus = "EXPIRED";
      authorized = false;
      responseMessage = `License has expired.`;
    } else if (license.status === "ACTIVE") {
      authorized = true;
      finalStatus = "ACTIVE";
      responseMessage = `License verified successfully. Welcome ${license.client_name || accountNumber}!`;
    } else if (license.status === "PENDING") {
      authorized = false;
      finalStatus = "PENDING";
      responseMessage = `License is pending admin approval.`;
    } else if (license.status === "REVOKED") {
      authorized = false;
      finalStatus = "REVOKED";
      responseMessage = `License has been revoked by administrator.`;
    }

    // 3. Update Telemetry into licenses table (Cost-efficient: updates row in place, no endless table bloat)
    await supabaseAdmin
      .from("licenses")
      .update({
        balance,
        equity,
        floating_pnl: floatingPnl,
        free_margin: freeMargin,
        account_currency: currency,
        leverage,
        open_orders_count: openOrders,
        last_seen_at: new Date().toISOString(),
        ping_count: (license.ping_count || 0) + 1,
      })
      .eq("id", license.id);

    // 4. Log check in license_logs
    await supabaseAdmin.from("license_logs").insert([
      {
        license_id: license.id,
        account_number: accountNumber,
        ea_code: eaCode,
        broker_server: brokerServer || license.broker_server,
        ip_address: ip,
        status_result: authorized ? "AUTHORIZED" : `REJECTED_${finalStatus}`,
        client_version: clientVersion,
      },
    ]);

    return NextResponse.json({
      authorized,
      status: finalStatus,
      message: responseMessage,
      account_number: accountNumber,
      ea_code: eaCode,
      expires_at: license.expires_at || "LIFETIME",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Unhandled verification exception:", err);
    return NextResponse.json(
      {
        authorized: false,
        status: "EXCEPTION_ERROR",
        message: err.message || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

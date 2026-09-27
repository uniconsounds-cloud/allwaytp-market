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
  let clientVersion = "1.0.0";

  // Support both GET query parameters and POST JSON body for MQL compatibility
  if (req.method === "GET") {
    const { searchParams } = new URL(req.url);
    accountNumber = searchParams.get("account") || searchParams.get("account_number") || "";
    eaCode = searchParams.get("ea") || searchParams.get("ea_code") || "";
    brokerServer = searchParams.get("broker") || searchParams.get("broker_server") || "";
    clientVersion = searchParams.get("version") || "1.0.0";
  } else {
    try {
      const body = await req.json();
      accountNumber = String(body.account || body.account_number || "");
      eaCode = String(body.ea || body.ea_code || "");
      brokerServer = String(body.broker || body.broker_server || "");
      clientVersion = String(body.version || "1.0.0");
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
    // 1. Query license record from Supabase using admin client
    const { data: license, error } = await supabaseAdmin
      .from("licenses")
      .select("id, ea_code, account_number, broker_server, status, expires_at, client_name")
      .eq("account_number", accountNumber)
      .eq("ea_code", eaCode)
      .maybeSingle();

    if (error) {
      console.error("Database query error:", error);
      return NextResponse.json(
        {
          authorized: false,
          status: "SERVER_ERROR",
          message: "Internal verification error. Please try again later.",
        },
        { status: 500 }
      );
    }

    if (!license) {
      // Log failed attempt
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
        message: `Account ${accountNumber} is not registered for EA ${eaCode}. Please register at https://allwaytp.com/register-license`,
      });
    }

    // 2. Check expiration if active
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
      responseMessage = `License for account ${accountNumber} has expired. Please contact administrator to renew.`;
    } else if (license.status === "ACTIVE") {
      authorized = true;
      finalStatus = "ACTIVE";
      responseMessage = `License verified successfully. Welcome ${license.client_name || accountNumber}!`;
    } else if (license.status === "PENDING") {
      authorized = false;
      finalStatus = "PENDING";
      responseMessage = `License is pending admin approval. Please wait for verification.`;
    } else if (license.status === "REVOKED") {
      authorized = false;
      finalStatus = "REVOKED";
      responseMessage = `License has been revoked by administrator.`;
    }

    // 3. Log verification result
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
        message: err.message || "An unexpected error occurred during verification",
      },
      { status: 500 }
    );
  }
}

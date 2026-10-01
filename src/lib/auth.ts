import { cookies } from "next/headers";
import crypto from "crypto";

export interface AdminUser {
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "EA_ADMIN";
}

const SECRET_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "allwaytp_admin_fallback_secret_key";
const COOKIE_NAME = "allwaytp_admin_session";

// Sign data into a secure token (HMAC-SHA256)
export function signToken(data: AdminUser): string {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

// Verify token integrity
export function verifyToken(token: string): AdminUser | null {
  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(payload)
      .digest("base64url");

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
      return decoded as AdminUser;
    }
    return null;
  } catch {
    return null;
  }
}

// Get current logged-in admin from cookie
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie?.value) return null;
  return verifyToken(sessionCookie.value);
}

// Set session cookie
export function setAdminSession(user: AdminUser) {
  const token = signToken(user);
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

// Clear session cookie
export function clearAdminSession() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

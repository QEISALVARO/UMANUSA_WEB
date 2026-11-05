import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Token sesi stateless: `<payload base64url>.<hmac-sha256 base64url>`.
 * Sesi tidak lagi disimpan di memori proses, sehingga tetap valid
 * saat server restart, recompile, atau berpindah instance.
 *
 * Payload hanya berisi identitas + kedaluwarsa. Tanda tangan HMAC menjamin
 * payload tidak dapat dipalsukan tanpa SESSION_SECRET.
 */
export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 hari

// Fallback stabil hanya untuk development — bukan rahasia produksi.
const DEV_FALLBACK_SECRET = "umanusa-development-session-secret";

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) {
    if (secret.length < 32) {
      throw new Error(
        "SESSION_SECRET terlalu pendek. Gunakan minimal 32 karakter acak (mis. keluaran `openssl rand -base64 32`).",
      );
    }
    return secret;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET belum diatur untuk lingkungan produksi. Tambahkan SESSION_SECRET di environment variables (Vercel: Project Settings → Environment Variables), lalu redeploy.",
    );
  }
  return DEV_FALLBACK_SECRET;
}

function createSignature(payloadBase64Url: string) {
  return createHmac("sha256", getSessionSecret()).update(payloadBase64Url).digest("base64url");
}

export function signSessionToken(userId: string, issuedAtMs = Date.now()) {
  const payload = Buffer.from(
    JSON.stringify({ userId, exp: issuedAtMs + SESSION_TTL_SECONDS * 1000 }),
    "utf8",
  ).toString("base64url");
  return `${payload}.${createSignature(payload)}`;
}

export function verifySessionToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const [payloadBase64Url, signatureBase64Url] = parts;

  // Perbandingan konstanta-waktu agar tahan timing attack.
  const received = Buffer.from(signatureBase64Url, "base64url");
  const expected = Buffer.from(createSignature(payloadBase64Url), "base64url");
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;

  let payload: { userId?: unknown; exp?: unknown };
  try {
    payload = JSON.parse(Buffer.from(payloadBase64Url, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof payload.userId !== "string" || !payload.userId) return null;
  if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp)) return null;
  if (payload.exp <= Date.now()) return null;
  return payload.userId;
}

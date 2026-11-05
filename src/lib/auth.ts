import "server-only";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { getUserById } from "@/lib/mock-data";
import {
  SESSION_TTL_SECONDS,
  signSessionToken,
  verifySessionToken,
} from "@/lib/session-token";

const scrypt = promisify(scryptCallback);
export const SESSION_COOKIE = "umanusa_session";

// Catatan: sesi sekarang stateless (HMAC di cookie) dan tidak lagi
// disimpan di Map in-memory, sehingga tetap valid lintas restart maupun
// perpindahan instance server. lookup user tetap lewat mock data.

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const keyBuffer = Buffer.from(key, "hex");
  return keyBuffer.length === derived.length && timingSafeEqual(keyBuffer, derived);
}

export async function createSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, signSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const userId = verifySessionToken(token);
  if (!userId) return null;
  return getUserById(userId) ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Silakan masuk untuk melanjutkan.");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("Akses khusus Admin Pusat.");
  return user;
}

export function makeReferralCode(name: string) {
  const stem = name.replace(/[^a-zA-Z]/g, "").slice(0, 5).toUpperCase() || "UMAT";
  return `${stem}${randomBytes(3).toString("hex").toUpperCase()}`;
}

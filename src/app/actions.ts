"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { createSession, destroySession, hashPassword, makeReferralCode, verifyPassword } from "@/lib/auth";

export type FormState = { error?: string; success?: string };

function clean(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  await ensureSeeded();
  const email = clean(formData.get("email")).toLowerCase();
  const password = clean(formData.get("password"));
  const next = clean(formData.get("next"));
  if (!email || !password) return { error: "Email dan kata sandi wajib diisi." };
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) return { error: "Email atau kata sandi tidak cocok. Silakan periksa kembali." };
  await createSession(user.id);
  const destination = next.startsWith("/") && !next.startsWith("//") ? next : user.role === "admin" ? "/dashboard/admin" : "/dashboard";
  redirect(destination);
}

export async function registerAction(_: FormState, formData: FormData): Promise<FormState> {
  await ensureSeeded();
  const name = clean(formData.get("name"));
  const email = clean(formData.get("email")).toLowerCase();
  const phone = clean(formData.get("phone"));
  const password = clean(formData.get("password"));
  const requestedRole = clean(formData.get("role"));
  const referral = clean(formData.get("referral")).toUpperCase();
  if (name.length < 3) return { error: "Nama lengkap minimal 3 karakter." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Masukkan alamat email yang valid." };
  if (phone.replace(/\D/g, "").length < 9) return { error: "Masukkan nomor WhatsApp yang aktif." };
  if (password.length < 8) return { error: "Kata sandi minimal 8 karakter." };
  if (!formData.get("terms")) return { error: "Anda perlu menyetujui ketentuan kemitraan." };
  if (!["consumer", "reseller"].includes(requestedRole)) return { error: "Jenjang pendaftaran tidak valid." };
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing) return { error: "Email sudah terdaftar. Silakan masuk ke akun Anda." };
  let sponsorId: string | null = null;
  if (referral) {
    const [sponsor] = await db.select().from(users).where(eq(users.referralCode, referral)).limit(1);
    if (!sponsor || !["reseller", "agent", "distributor"].includes(sponsor.role)) return { error: "Kode referal tidak ditemukan atau belum aktif sebagai mitra." };
    sponsorId = sponsor.id;
  }
  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(users).values({
    name, email, phone, passwordHash,
    role: requestedRole as "consumer" | "reseller",
    referralCode: makeReferralCode(name),
    sponsorId,
  }).returning();
  await createSession(user.id);
  redirect("/dashboard?selamat=1");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { bonusLedger, orderItems, orders, products, users, withdrawals } from "@/db/schema";
import { requireAdmin, requireUser } from "@/lib/auth";
import type { FormState } from "@/app/actions";
import type { Role } from "@/lib/commerce";

function refresh() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/pesanan");
  revalidatePath("/dashboard/bonus");
  revalidatePath("/dashboard/jaringan");
  revalidatePath("/dashboard/admin");
  revalidatePath("/katalog");
}

function sponsorSnapshotPrice(item: typeof orderItems.$inferSelect, role: Role) {
  if (role === "reseller") return item.resellerPrice;
  if (role === "agent") return item.agentPrice;
  if (role === "distributor") return item.distributorPrice;
  return item.retailPrice;
}

export async function verifyPaymentAction(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);
  const [existing] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!existing) return;
  if (decision === "reject") {
    if (existing.status !== "payment_review") return;
    await db.update(orders).set({ status: "awaiting_payment", adminNote: note || "Bukti pembayaran perlu diperbaiki. Silakan unggah ulang.", paymentSubmittedAt: null, updatedAt: new Date() }).where(eq(orders.id, orderId));
    refresh();
    return;
  }
  if (decision !== "approve" || existing.status !== "payment_review" || !existing.paymentProof) return;
  await db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1).for("update");
    if (order.status !== "payment_review" || !order.paymentProof) return;
    const now = new Date();
    await tx.update(orders).set({ status: "paid", adminNote: note || "Pembayaran telah diverifikasi Admin Pusat.", paidAt: now, paymentVerifiedAt: now, updatedAt: now }).where(eq(orders.id, orderId));
    const [buyer] = await tx.select().from(users).where(eq(users.id, order.userId)).limit(1).for("update");
    await tx.update(users).set({ totalOmzet: sql`${users.totalOmzet} + ${order.subtotal}`, updatedAt: now }).where(eq(users.id, buyer.id));
    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    for (const item of items) {
      if (item.productId) await tx.update(products).set({ sold: sql`${products.sold} + ${item.quantity}`, updatedAt: now }).where(eq(products.id, item.productId));
    }
    if (buyer.sponsorId) {
      const [sponsor] = await tx.select().from(users).where(eq(users.id, buyer.sponsorId)).limit(1);
      if (sponsor && ["reseller", "agent", "distributor"].includes(sponsor.role)) {
        const amount = items.reduce((sum, item) => sum + Math.max(item.unitPrice - sponsorSnapshotPrice(item, sponsor.role), 0) * item.quantity, 0);
        if (amount > 0) await tx.insert(bonusLedger).values({ userId: sponsor.id, orderId: order.id, sourceUserId: buyer.id, amount, description: `Komisi selisih harga dari pesanan ${order.invoice}` }).onConflictDoNothing();
      }
    }
  });
  refresh();
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const next = String(formData.get("next") ?? "");
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return;
  const allowed: Record<string, string[]> = { paid: ["processing"], processing: ["shipped"], shipped: ["completed"], awaiting_payment: ["cancelled"], payment_review: ["cancelled"] };
  if (!allowed[order.status]?.includes(next)) return;
  await db.transaction(async (tx) => {
    const [locked] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1).for("update");
    if (!allowed[locked.status]?.includes(next)) return;
    await tx.update(orders).set({ status: next as typeof orders.$inferInsert.status, trackingNumber: trackingNumber || locked.trackingNumber, updatedAt: new Date() }).where(eq(orders.id, orderId));
    if (next === "cancelled") {
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      for (const item of items) if (item.productId) await tx.update(products).set({ stock: sql`${products.stock} + ${item.quantity}` }).where(eq(products.id, item.productId));
    }
  });
  refresh();
}

export async function extendPaymentAction(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || order.status !== "awaiting_payment") return;
  await db.update(orders).set({ expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), adminNote: "Tenggat unggah bukti diperpanjang 1×24 jam oleh Admin Pusat.", updatedAt: new Date() }).where(eq(orders.id, orderId));
  refresh();
}

export async function updateShippingAction(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const shipping = Number(formData.get("shipping"));
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);
  if (!Number.isInteger(shipping) || shipping < 0 || shipping > 5_000_000) return;
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || !["awaiting_payment", "payment_review"].includes(order.status)) return;
  await db.update(orders).set({ shipping, total: order.subtotal + shipping, adminNote: note || `Ongkir disesuaikan Admin menjadi Rp${shipping.toLocaleString("id-ID")}.`, updatedAt: new Date() }).where(eq(orders.id, orderId));
  refresh();
}

export async function upgradeUserAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as Role;
  if (!["consumer", "reseller", "agent", "distributor"].includes(role) || userId === admin.id) return;
  const [target] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!target || target.role === "admin") return;
  if (role === "agent" && target.totalOmzet < 10_000_000) return;
  if (role === "distributor" && target.totalOmzet < 50_000_000) return;
  await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));
  refresh();
}

export async function updateProductAction(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  const stock = Number(formData.get("stock"));
  const consumerPrice = Number(formData.get("consumerPrice"));
  const resellerPrice = Number(formData.get("resellerPrice"));
  const agentPrice = Number(formData.get("agentPrice"));
  const distributorPrice = Number(formData.get("distributorPrice"));
  const values = [stock, consumerPrice, resellerPrice, agentPrice, distributorPrice];
  if (values.some((value) => !Number.isInteger(value) || value < 0) || stock > 1_000_000 || !(consumerPrice >= resellerPrice && resellerPrice >= agentPrice && agentPrice >= distributorPrice) || distributorPrice < 1) return;
  await db.update(products).set({ stock, consumerPrice, resellerPrice, agentPrice, distributorPrice, active: formData.get("active") === "yes", updatedAt: new Date() }).where(eq(products.id, productId));
  refresh();
}

export async function withdrawalAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!["reseller", "agent", "distributor"].includes(user.role)) return { error: "Pencairan hanya tersedia untuk akun mitra." };
  const amount = Number(formData.get("amount"));
  const bankName = String(formData.get("bankName") ?? "").trim();
  const bankAccount = String(formData.get("bankAccount") ?? "").trim();
  const bankHolder = String(formData.get("bankHolder") ?? "").trim();
  if (!Number.isInteger(amount) || amount < 50_000) return { error: "Minimum pencairan adalah Rp50.000." };
  if (!bankName || bankAccount.replace(/\D/g, "").length < 8 || bankHolder.length < 3) return { error: "Lengkapi nama bank, nomor rekening, dan nama pemilik rekening." };
  try {
    await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${user.id}))`);
      const [credit] = await tx.select({ value: sql<number>`coalesce(sum(${bonusLedger.amount}),0)::int` }).from(bonusLedger).where(eq(bonusLedger.userId, user.id));
      const [debit] = await tx.select({ value: sql<number>`coalesce(sum(${withdrawals.amount}),0)::int` }).from(withdrawals).where(and(eq(withdrawals.userId, user.id), inArray(withdrawals.status, ["pending", "paid"])));
      if (amount > credit.value - debit.value) throw new Error("Saldo tersedia tidak mencukupi.");
      await tx.insert(withdrawals).values({ userId: user.id, amount, bankName, bankAccount, bankHolder });
      await tx.update(users).set({ bankName, bankAccount, bankHolder, updatedAt: new Date() }).where(eq(users.id, user.id));
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Pengajuan gagal diproses." };
  }
  refresh();
  return { success: "Pengajuan berhasil dicatat. Keuangan Pusat memproses rekap pada hari Jumat." };
}

export async function processWithdrawalAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("withdrawalId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);
  if (!["paid", "rejected"].includes(decision)) return;
  const [request] = await db.select().from(withdrawals).where(eq(withdrawals.id, id)).limit(1);
  if (!request || request.status !== "pending") return;
  await db.update(withdrawals).set({ status: decision as "paid" | "rejected", note: note || (decision === "paid" ? "Komisi telah ditransfer manual oleh Keuangan Pusat." : "Pengajuan ditolak. Saldo kembali tersedia."), processedAt: new Date() }).where(and(eq(withdrawals.id, id), eq(withdrawals.status, "pending")));
  refresh();
}

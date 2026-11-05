"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireUser } from "@/lib/auth";
import type { FormState } from "@/app/actions";
import { formatRupiah, MIN_WITHDRAWAL, type Role } from "@/lib/commerce";
import {
  approvePayment,
  extendPayment,
  getOrderById,
  getUserById,
  processWithdrawal,
  rejectPayment,
  requestWithdrawal,
  updateOrderShipping,
  updateOrderStatus,
  updateProduct,
  upgradeUser,
} from "@/lib/mock-data";

function refresh() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/pesanan");
  revalidatePath("/dashboard/bonus");
  revalidatePath("/dashboard/jaringan");
  revalidatePath("/dashboard/admin");
  revalidatePath("/katalog");
}

export async function verifyPaymentAction(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);
  const existing = getOrderById(orderId);
  if (!existing) return;
  if (decision === "reject") {
    rejectPayment(orderId, note);
    refresh();
    return;
  }
  if (decision !== "approve") return;
  approvePayment(orderId, note);
  refresh();
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const next = String(formData.get("next") ?? "");
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();
  updateOrderStatus(orderId, next, trackingNumber);
  refresh();
}

export async function extendPaymentAction(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  extendPayment(orderId);
  refresh();
}

export async function updateShippingAction(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const shipping = Number(formData.get("shipping"));
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);
  if (!Number.isInteger(shipping) || shipping < 0 || shipping > 5_000_000) return;
  updateOrderShipping(orderId, shipping, note);
  refresh();
}

export async function upgradeUserAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as Role;
  if (!["consumer", "reseller", "agent", "distributor"].includes(role) || userId === admin.id) return;
  const target = getUserById(userId);
  if (!target || target.role === "admin") return;
  if (role === "agent" && target.totalOmzet < 10_000_000) return;
  if (role === "distributor" && target.totalOmzet < 50_000_000) return;
  upgradeUser(userId, role);
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
  updateProduct(productId, {
    stock,
    consumerPrice,
    resellerPrice,
    agentPrice,
    distributorPrice,
    active: formData.get("active") === "yes",
  });
  refresh();
}

export async function withdrawalAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!["reseller", "agent", "distributor"].includes(user.role)) return { error: "Pencairan hanya tersedia untuk akun mitra." };
  const amount = Number(formData.get("amount"));
  const bankName = String(formData.get("bankName") ?? "").trim();
  const bankAccount = String(formData.get("bankAccount") ?? "").trim();
  const bankHolder = String(formData.get("bankHolder") ?? "").trim();
  if (!Number.isInteger(amount) || amount < MIN_WITHDRAWAL) return { error: `Minimum pencairan adalah ${formatRupiah(MIN_WITHDRAWAL)}.` };
  if (!bankName || bankAccount.replace(/\D/g, "").length < 8 || bankHolder.length < 3) return { error: "Lengkapi nama bank, nomor rekening, dan nama pemilik rekening." };
  try {
    requestWithdrawal({ userId: user.id, amount, bankName, bankAccount, bankHolder });
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
  processWithdrawal(id, decision as "paid" | "rejected", note);
  refresh();
}

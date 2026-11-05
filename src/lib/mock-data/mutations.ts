import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { getPrice, type Role } from "@/lib/commerce";
import { getMockDb } from "./data";
import type {
  MockOrder,
  MockOrderItem,
  MockProduct,
  MockUser,
  OrderStatus,
  WithdrawalStatus,
} from "./types";

export function registerMockUser(input: {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: "consumer" | "reseller";
  referralCode: string;
  sponsorId: string | null;
}) {
  const db = getMockDb();
  const now = new Date();
  const user: MockUser = {
    id: `usr-${randomUUID()}`,
    name: input.name,
    email: input.email,
    phone: input.phone,
    passwordHash: input.passwordHash,
    role: input.role,
    referralCode: input.referralCode,
    sponsorId: input.sponsorId,
    address: "",
    city: "",
    province: "",
    postalCode: "",
    bankName: "",
    bankAccount: "",
    bankHolder: "",
    totalOmzet: 0,
    createdAt: now,
    updatedAt: now,
  };
  db.users.push(user);
  return user;
}

function snapshotPrice(item: MockOrderItem, role: Role) {
  if (role === "reseller") return item.resellerPrice;
  if (role === "agent") return item.agentPrice;
  if (role === "distributor") return item.distributorPrice;
  return item.retailPrice;
}

function newId(prefix: string) {
  return `${prefix}-${randomUUID()}`;
}

export type CheckoutInput = {
  userId: string;
  items: Array<{ id: string; quantity: number }>;
  zoneId: string;
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
};

export function createCheckoutOrder(input: CheckoutInput) {
  const db = getMockDb();
  const user = db.users.find((item) => item.id === input.userId);
  if (!user) throw new Error("Sesi berakhir. Silakan masuk kembali.");

  const zone = db.shippingZones.find((item) => item.id === input.zoneId);
  if (!zone?.active) throw new Error("Zona pengiriman tidak tersedia.");

  const details: Array<{
    product: MockProduct;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }> = [];

  for (const item of input.items) {
    const quantity = Number(item.quantity);
    if (!item.id || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new Error("Jumlah produk harus antara 1–20 per item.");
    }
    const product = db.products.find((row) => row.id === item.id);
    if (!product?.active) throw new Error("Salah satu produk sudah tidak aktif. Perbarui keranjang Anda.");
    if (product.stock < quantity) {
      throw new Error(`Stok ${product.name} tersisa ${product.stock}. Sesuaikan jumlah pesanan.`);
    }
    const unitPrice = getPrice(product, user.role);
    details.push({ product, quantity, unitPrice, lineTotal: unitPrice * quantity });
  }

  const subtotal = details.reduce((sum, item) => sum + item.lineTotal, 0);
  const retailSubtotal = details.reduce((sum, item) => sum + item.product.consumerPrice * item.quantity, 0);
  const now = new Date();
  const invoice = `UMN-${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}-${randomBytes(3).toString("hex").toUpperCase()}`;
  const orderId = newId("ord");

  const order: MockOrder = {
    id: orderId,
    invoice,
    userId: user.id,
    status: "awaiting_payment",
    subtotal,
    retailSubtotal,
    savings: retailSubtotal - subtotal,
    shipping: zone.fee,
    total: subtotal + zone.fee,
    shippingZone: zone.name,
    recipientName: input.recipientName.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    city: input.city.trim(),
    province: input.province.trim(),
    postalCode: input.postalCode.trim(),
    notes: input.notes?.trim().slice(0, 500) ?? "",
    adminNote: "",
    trackingNumber: "",
    paymentProof: null,
    paymentProofName: null,
    paymentSubmittedAt: null,
    paymentVerifiedAt: null,
    paidAt: null,
    expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    createdAt: now,
    updatedAt: now,
  };
  db.orders.push(order);

  for (const detail of details) {
    db.orderItems.push({
      id: newId("itm"),
      orderId: order.id,
      productId: detail.product.id,
      productName: detail.product.name,
      productSlug: detail.product.slug,
      image: detail.product.image,
      unitPrice: detail.unitPrice,
      retailPrice: detail.product.consumerPrice,
      resellerPrice: detail.product.resellerPrice,
      agentPrice: detail.product.agentPrice,
      distributorPrice: detail.product.distributorPrice,
      quantity: detail.quantity,
      lineTotal: detail.lineTotal,
    });
    detail.product.stock -= detail.quantity;
    detail.product.updatedAt = now;
  }

  user.address = input.address.trim();
  user.city = input.city.trim();
  user.province = input.province.trim();
  user.postalCode = input.postalCode.trim();
  user.phone = input.phone.trim();
  user.updatedAt = now;

  return { id: order.id, invoice: order.invoice };
}

export function submitPaymentProof(orderId: string, dataUrl: string, fileName: string) {
  const order = getMockDb().orders.find((item) => item.id === orderId);
  if (!order) return false;
  const now = new Date();
  order.paymentProof = dataUrl;
  order.paymentProofName = fileName.slice(0, 180);
  order.paymentSubmittedAt = now;
  order.status = "payment_review";
  order.adminNote = "";
  order.updatedAt = now;
  return true;
}

export function rejectPayment(orderId: string, note: string) {
  const order = getMockDb().orders.find((item) => item.id === orderId);
  if (!order || order.status !== "payment_review") return false;
  order.status = "awaiting_payment";
  order.adminNote = note || "Bukti pembayaran perlu diperbaiki. Silakan unggah ulang.";
  order.paymentSubmittedAt = null;
  order.updatedAt = new Date();
  return true;
}

export function approvePayment(orderId: string, note: string) {
  const db = getMockDb();
  const order = db.orders.find((item) => item.id === orderId);
  if (!order || order.status !== "payment_review" || !order.paymentProof) return false;

  const now = new Date();
  order.status = "paid";
  order.adminNote = note || "Pembayaran telah diverifikasi Admin Pusat.";
  order.paidAt = now;
  order.paymentVerifiedAt = now;
  order.updatedAt = now;

  const buyer = db.users.find((user) => user.id === order.userId);
  if (!buyer) return true;
  buyer.totalOmzet += order.subtotal;
  buyer.updatedAt = now;

  const items = db.orderItems.filter((item) => item.orderId === order.id);
  for (const item of items) {
    if (!item.productId) continue;
    const product = db.products.find((row) => row.id === item.productId);
    if (product) {
      product.sold += item.quantity;
      product.updatedAt = now;
    }
  }

  if (buyer.sponsorId && !db.bonusLedger.some((bonus) => bonus.orderId === order.id)) {
    const sponsor = db.users.find((user) => user.id === buyer.sponsorId);
    if (sponsor && ["reseller", "agent", "distributor"].includes(sponsor.role)) {
      const amount = items.reduce(
        (sum, item) =>
          sum + Math.max(item.unitPrice - snapshotPrice(item, sponsor.role), 0) * item.quantity,
        0,
      );
      if (amount > 0) {
        db.bonusLedger.push({
          id: newId("bns"),
          userId: sponsor.id,
          orderId: order.id,
          sourceUserId: buyer.id,
          amount,
          description: `Komisi selisih harga dari pesanan ${order.invoice}`,
          createdAt: now,
        });
      }
    }
  }
  return true;
}

const ALLOWED_TRANSITIONS: Record<string, OrderStatus[]> = {
  paid: ["processing"],
  processing: ["shipped"],
  shipped: ["completed"],
  awaiting_payment: ["cancelled"],
  payment_review: ["cancelled"],
};

export function updateOrderStatus(orderId: string, next: string, trackingNumber: string) {
  const db = getMockDb();
  const order = db.orders.find((item) => item.id === orderId);
  if (!order) return false;
  const status = next as OrderStatus;
  if (!ALLOWED_TRANSITIONS[order.status]?.includes(status)) return false;

  const now = new Date();
  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  order.updatedAt = now;

  if (status === "cancelled") {
    const items = db.orderItems.filter((item) => item.orderId === orderId);
    for (const item of items) {
      if (!item.productId) continue;
      const product = db.products.find((row) => row.id === item.productId);
      if (product) product.stock += item.quantity;
    }
  }
  return true;
}

export function extendPayment(orderId: string) {
  const order = getMockDb().orders.find((item) => item.id === orderId);
  if (!order || order.status !== "awaiting_payment") return false;
  order.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  order.adminNote = "Tenggat unggah bukti diperpanjang 1×24 jam oleh Admin Pusat.";
  order.updatedAt = new Date();
  return true;
}

export function updateOrderShipping(orderId: string, shipping: number, note: string) {
  const order = getMockDb().orders.find((item) => item.id === orderId);
  if (!order || !["awaiting_payment", "payment_review"].includes(order.status)) return false;
  order.shipping = shipping;
  order.total = order.subtotal + shipping;
  order.adminNote = note || `Ongkir disesuaikan Admin menjadi Rp${shipping.toLocaleString("id-ID")}.`;
  order.updatedAt = new Date();
  return true;
}

export function upgradeUser(userId: string, role: Role) {
  const user = getMockDb().users.find((item) => item.id === userId);
  if (!user || user.role === "admin") return false;
  user.role = role;
  user.updatedAt = new Date();
  return true;
}

export function updateProduct(
  productId: string,
  values: {
    stock: number;
    consumerPrice: number;
    resellerPrice: number;
    agentPrice: number;
    distributorPrice: number;
    active: boolean;
  },
) {
  const product = getMockDb().products.find((item) => item.id === productId);
  if (!product) return false;
  Object.assign(product, values, { updatedAt: new Date() });
  return true;
}

export function requestWithdrawal(input: {
  userId: string;
  amount: number;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
}) {
  const db = getMockDb();
  const user = db.users.find((item) => item.id === input.userId);
  if (!user) throw new Error("Sesi berakhir. Silakan masuk kembali.");

  const credit = db.bonusLedger
    .filter((bonus) => bonus.userId === user.id)
    .reduce((sum, bonus) => sum + bonus.amount, 0);
  const debit = db.withdrawals
    .filter(
      (withdrawal) =>
        withdrawal.userId === user.id &&
        (withdrawal.status === "pending" || withdrawal.status === "paid"),
    )
    .reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

  if (input.amount > credit - debit) throw new Error("Saldo tersedia tidak mencukupi.");

  const now = new Date();
  db.withdrawals.push({
    id: newId("wd"),
    userId: user.id,
    amount: input.amount,
    status: "pending",
    bankName: input.bankName,
    bankAccount: input.bankAccount,
    bankHolder: input.bankHolder,
    note: "",
    requestedAt: now,
    processedAt: null,
  });

  user.bankName = input.bankName;
  user.bankAccount = input.bankAccount;
  user.bankHolder = input.bankHolder;
  user.updatedAt = now;
}

export function processWithdrawal(id: string, decision: "paid" | "rejected", note: string) {
  const request = getMockDb().withdrawals.find((item) => item.id === id);
  if (!request || request.status !== "pending") return false;
  request.status = decision as WithdrawalStatus;
  request.note =
    note ||
    (decision === "paid"
      ? "Komisi telah ditransfer manual oleh Keuangan Pusat."
      : "Pengajuan ditolak. Saldo kembali tersedia.");
  request.processedAt = new Date();
  return true;
}

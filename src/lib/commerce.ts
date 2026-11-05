export type Role = "consumer" | "reseller" | "agent" | "distributor" | "admin";
export type SellingRole = Exclude<Role, "admin">;

export const ROLE_LABELS: Record<Role, string> = {
  consumer: "Konsumen",
  reseller: "Reseller",
  agent: "Agen",
  distributor: "Distributor",
  admin: "Admin Pusat",
};

export const MIN_WITHDRAWAL = 50_000;

export const PRICE_FIELDS = {
  consumer: "consumerPrice",
  reseller: "resellerPrice",
  agent: "agentPrice",
  distributor: "distributorPrice",
  admin: "consumerPrice",
} as const;

export const TIER_RULES = [
  {
    role: "consumer" as const,
    name: "Konsumen",
    threshold: 0,
    nextThreshold: 1_000_000,
    benefit: "Harga retail, lacak pesanan, dan checkout mudah.",
    description: "Untuk pembeli yang ingin menikmati produk pilihan umat.",
  },
  {
    role: "reseller" as const,
    name: "Reseller",
    threshold: 0,
    nextThreshold: 10_000_000,
    benefit: "Harga khusus, kode referal, omzet, dan saldo bonus.",
    description: "Mulai berjualan tanpa perlu mengelola stok dan gudang.",
  },
  {
    role: "agent" as const,
    name: "Agen",
    threshold: 10_000_000,
    nextThreshold: 50_000_000,
    benefit: "Harga Agen, jaringan Reseller, dan komisi selisih harga.",
    description: "Kembangkan jejaring penjualan dengan pendampingan pusat.",
  },
  {
    role: "distributor" as const,
    name: "Distributor",
    threshold: 50_000_000,
    nextThreshold: null,
    benefit: "Harga terbaik dan pengelolaan jaringan Agen/Reseller.",
    description: "Mitra wilayah dengan akses margin dan jaringan terluas.",
  },
];

export const ORDER_STATUS: Record<string, { label: string; tone: string }> = {
  awaiting_payment: { label: "Menunggu pembayaran", tone: "amber" },
  payment_review: { label: "Bukti sedang diperiksa", tone: "blue" },
  paid: { label: "Pembayaran terverifikasi", tone: "green" },
  processing: { label: "Sedang dikemas", tone: "blue" },
  shipped: { label: "Dalam pengiriman", tone: "purple" },
  completed: { label: "Selesai", tone: "green" },
  cancelled: { label: "Dibatalkan", tone: "red" },
};

export function getPrice(product: {
  consumerPrice: number;
  resellerPrice: number;
  agentPrice: number;
  distributorPrice: number;
}, role: Role) {
  return product[PRICE_FIELDS[role]];
}

export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactRupiah(value: number) {
  if (value >= 1_000_000_000) return `Rp${(value / 1_000_000_000).toFixed(1)} M`;
  if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)} jt`;
  if (value >= 1_000) return `Rp${Math.round(value / 1_000)} rb`;
  return `Rp${value}`;
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function nextTier(role: Role) {
  if (role === "consumer") return TIER_RULES[1];
  if (role === "reseller") return TIER_RULES[2];
  if (role === "agent") return TIER_RULES[3];
  return null;
}

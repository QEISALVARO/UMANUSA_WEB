import "server-only";
import type { Role } from "@/lib/commerce";
import { getMockDb } from "./data";
import type {
  MockBonus,
  MockOrder,
  MockOrderItem,
  MockProduct,
  MockUser,
  MockWithdrawal,
} from "./types";

const REVENUE_STATUSES = new Set(["paid", "processing", "shipped", "completed"]);

export type HomeMetrics = {
  partners: number;
  products: number;
  omzet: number;
  bonus: number;
};

export function getHomeData(): { featured: MockProduct[]; metrics: HomeMetrics } {
  const db = getMockDb();
  const active = db.products.filter((product) => product.active);
  const featured = [...active]
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.sold - a.sold)
    .slice(0, 4);
  const metrics: HomeMetrics = {
    partners: db.users.filter((user) => user.role !== "admin").length,
    products: active.length,
    omzet: db.orders
      .filter((order) => REVENUE_STATUSES.has(order.status))
      .reduce((sum, order) => sum + order.subtotal, 0),
    bonus: db.bonusLedger.reduce((sum, bonus) => sum + bonus.amount, 0),
  };
  return { featured, metrics };
}

export function getActiveProducts(): MockProduct[] {
  return [...getMockDb().products]
    .filter((product) => product.active)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.sold - a.sold);
}

export function findProductBySlug(slug: string): MockProduct | undefined {
  return getMockDb().products.find((product) => product.slug === slug);
}

export function getRelatedProducts(product: MockProduct, limit = 3): MockProduct[] {
  const db = getMockDb();
  const related = db.products.filter(
    (item) => item.active && item.category === product.category && item.id !== product.id,
  );
  const fallback = related.length
    ? related
    : db.products.filter((item) => item.active && item.id !== product.id);
  return fallback.slice(0, limit);
}

export function getActiveShippingZones() {
  return getMockDb().shippingZones.filter((zone) => zone.active);
}

export function getBankSettings() {
  const db = getMockDb();
  const get = (key: string, fallback: string) =>
    db.appSettings.find((setting) => setting.key === key)?.value ?? fallback;
  return {
    bank_name: get("bank_name", "Bank Syariah Indonesia (BSI)"),
    bank_account: get("bank_account", "Hubungi Admin"),
    bank_holder: get("bank_holder", "Koperasi UMANUSA"),
  };
}

export function getUserById(id: string): MockUser | undefined {
  return getMockDb().users.find((user) => user.id === id);
}

export function findUserByEmail(email: string): MockUser | undefined {
  const normalized = email.toLowerCase();
  return getMockDb().users.find((user) => user.email.toLowerCase() === normalized);
}

export function findUserByReferralCode(code: string): MockUser | undefined {
  const normalized = code.toUpperCase();
  return getMockDb().users.find((user) => user.referralCode.toUpperCase() === normalized);
}

export function getDirectMembers(userId: string): MockUser[] {
  return getMockDb().users
    .filter((user) => user.sponsorId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getSecondLevelMembers(direct: MockUser[]): MockUser[] {
  const directIds = new Set(direct.map((member) => member.id));
  return getMockDb().users
    .filter((user) => user.sponsorId !== null && directIds.has(user.sponsorId))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getOrdersByUser(userId: string): MockOrder[] {
  return getMockDb().orders
    .filter((order) => order.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getOrderById(id: string): MockOrder | undefined {
  return getMockDb().orders.find((order) => order.id === id);
}

export function isOrderUploadExpired(order: MockOrder): boolean {
  return order.status === "awaiting_payment" && order.expiresAt.getTime() < Date.now();
}

export function getOrderItems(orderId: string): MockOrderItem[] {
  return getMockDb().orderItems.filter((item) => item.orderId === orderId);
}

export function getDashboardStats(userId: string) {
  const db = getMockDb();
  const orders = db.orders.filter((order) => order.userId === userId);
  return {
    orderCount: { value: orders.length },
    bonus: {
      value: db.bonusLedger
        .filter((bonus) => bonus.userId === userId)
        .reduce((sum, bonus) => sum + bonus.amount, 0),
    },
    withdrawn: {
      value: db.withdrawals
        .filter(
          (withdrawal) =>
            withdrawal.userId === userId &&
            (withdrawal.status === "pending" || withdrawal.status === "paid"),
        )
        .reduce((sum, withdrawal) => sum + withdrawal.amount, 0),
    },
    recent: [...orders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5),
  };
}

export type BonusLedgerRow = {
  bonus: MockBonus;
  invoice: string;
  sourceName: string | null;
};

export function getBonusPageData(userId: string) {
  const db = getMockDb();
  const credit = db.bonusLedger
    .filter((bonus) => bonus.userId === userId)
    .reduce((sum, bonus) => sum + bonus.amount, 0);
  const pending = db.withdrawals
    .filter((withdrawal) => withdrawal.userId === userId && withdrawal.status === "pending")
    .reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
  const paid = db.withdrawals
    .filter((withdrawal) => withdrawal.userId === userId && withdrawal.status === "paid")
    .reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

  const ledger: BonusLedgerRow[] = db.bonusLedger
    .filter((bonus) => bonus.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((bonus) => ({
      bonus,
      invoice: db.orders.find((order) => order.id === bonus.orderId)?.invoice ?? "—",
      sourceName: bonus.sourceUserId
        ? db.users.find((user) => user.id === bonus.sourceUserId)?.name ?? null
        : null,
    }));

  const requests = db.withdrawals
    .filter((withdrawal) => withdrawal.userId === userId)
    .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());

  return {
    credit: { value: credit },
    pending: { value: pending },
    paid: { value: paid },
    available: credit - pending - paid,
    ledger,
    requests,
  };
}

export type AdminOrderRow = {
  order: MockOrder;
  buyer: string;
  role: Role;
};

export type AdminWithdrawalRow = {
  request: MockWithdrawal;
  member: string;
  email: string;
};

export function getAdminData(tab: string) {
  const db = getMockDb();
  const nonAdmin = db.users.filter((user) => user.role !== "admin");
  const orderRows: AdminOrderRow[] =
    tab === "orders" || tab === "overview"
      ? [...db.orders]
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, tab === "overview" ? 6 : 100)
          .map((order) => {
            const buyer = db.users.find((user) => user.id === order.userId);
            return {
              order,
              buyer: buyer?.name ?? "Pengguna UMANUSA",
              role: buyer?.role ?? "consumer",
            };
          })
      : [];

  const partnerRows =
    tab === "partners"
      ? [...nonAdmin].sort((a, b) => b.totalOmzet - a.totalOmzet).slice(0, 100)
      : [];

  const productRows =
    tab === "products" ? [...db.products].sort((a, b) => a.name.localeCompare(b.name)) : [];

  const withdrawalRows: AdminWithdrawalRow[] =
    tab === "withdrawals" || tab === "overview"
      ? [...db.withdrawals]
          .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime())
          .slice(0, tab === "overview" ? 5 : 100)
          .map((request) => {
            const member = db.users.find((user) => user.id === request.userId);
            return {
              request,
              member: member?.name ?? "Mitra UMANUSA",
              email: member?.email ?? "—",
            };
          })
      : [];

  return {
    partnerCount: { value: nonAdmin.length },
    productCount: { value: db.products.length },
    reviewCount: { value: db.orders.filter((order) => order.status === "payment_review").length },
    withdrawCount: {
      value: db.withdrawals
        .filter((withdrawal) => withdrawal.status === "pending")
        .reduce((sum, withdrawal) => sum + withdrawal.amount, 0),
    },
    omzet: {
      value: db.orders
        .filter((order) => REVENUE_STATUSES.has(order.status))
        .reduce((sum, order) => sum + order.subtotal, 0),
    },
    orderRows,
    partnerRows,
    productRows,
    withdrawalRows,
  };
}

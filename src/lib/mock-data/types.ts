import type { CatalogProduct } from "@/lib/catalog-types";
import type { Role } from "@/lib/commerce";

export type OrderStatus =
  | "awaiting_payment"
  | "payment_review"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled";

export type WithdrawalStatus = "pending" | "paid" | "rejected";

export type MockUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: Role;
  referralCode: string;
  sponsorId: string | null;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  totalOmzet: number;
  createdAt: Date;
  updatedAt: Date;
};

export type MockProduct = CatalogProduct & {
  createdAt: Date;
  updatedAt: Date;
};

export type MockOrder = {
  id: string;
  invoice: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  retailSubtotal: number;
  savings: number;
  shipping: number;
  total: number;
  shippingZone: string;
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  notes: string;
  adminNote: string;
  trackingNumber: string;
  paymentProof: string | null;
  paymentProofName: string | null;
  paymentSubmittedAt: Date | null;
  paymentVerifiedAt: Date | null;
  paidAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type MockOrderItem = {
  id: string;
  orderId: string;
  productId: string | null;
  productName: string;
  productSlug: string;
  image: string;
  unitPrice: number;
  retailPrice: number;
  resellerPrice: number;
  agentPrice: number;
  distributorPrice: number;
  quantity: number;
  lineTotal: number;
};

export type MockBonus = {
  id: string;
  userId: string;
  orderId: string;
  sourceUserId: string | null;
  amount: number;
  description: string;
  createdAt: Date;
};

export type MockWithdrawal = {
  id: string;
  userId: string;
  amount: number;
  status: WithdrawalStatus;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  note: string;
  requestedAt: Date;
  processedAt: Date | null;
};

export type MockShippingZone = {
  id: string;
  name: string;
  description: string;
  fee: number;
  eta: string;
  active: boolean;
};

export type MockSetting = {
  key: string;
  value: string;
};

export type MockSession = {
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
};

export type MockDatabase = {
  users: MockUser[];
  products: MockProduct[];
  orders: MockOrder[];
  orderItems: MockOrderItem[];
  bonusLedger: MockBonus[];
  withdrawals: MockWithdrawal[];
  shippingZones: MockShippingZone[];
  appSettings: MockSetting[];
  sessions: Map<string, MockSession>;
};

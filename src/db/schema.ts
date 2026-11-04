import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("user_role", [
  "consumer",
  "reseller",
  "agent",
  "distributor",
  "admin",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "awaiting_payment",
  "payment_review",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
]);
export const withdrawalStatusEnum = pgEnum("withdrawal_status", [
  "pending",
  "paid",
  "rejected",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone").notNull(),
  role: roleEnum("role").notNull().default("consumer"),
  referralCode: text("referral_code").notNull().unique(),
  sponsorId: uuid("sponsor_id"),
  address: text("address").default("").notNull(),
  city: text("city").default("").notNull(),
  province: text("province").default("").notNull(),
  postalCode: text("postal_code").default("").notNull(),
  bankName: text("bank_name").default("").notNull(),
  bankAccount: text("bank_account").default("").notNull(),
  bankHolder: text("bank_holder").default("").notNull(),
  totalOmzet: integer("total_omzet").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  token: text("token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  shortDescription: text("short_description").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  unit: text("unit").notNull(),
  origin: text("origin").notNull(),
  halalCert: text("halal_cert").notNull(),
  stock: integer("stock").default(0).notNull(),
  sold: integer("sold").default(0).notNull(),
  weight: integer("weight").default(500).notNull(),
  featured: boolean("featured").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
  consumerPrice: integer("consumer_price").notNull(),
  resellerPrice: integer("reseller_price").notNull(),
  agentPrice: integer("agent_price").notNull(),
  distributorPrice: integer("distributor_price").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const shippingZones = pgTable("shipping_zones", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  fee: integer("fee").notNull(),
  eta: text("eta").notNull(),
  active: boolean("active").default(true).notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoice: text("invoice").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  status: orderStatusEnum("status").default("awaiting_payment").notNull(),
  subtotal: integer("subtotal").notNull(),
  retailSubtotal: integer("retail_subtotal").notNull(),
  savings: integer("savings").default(0).notNull(),
  shipping: integer("shipping").default(0).notNull(),
  total: integer("total").notNull(),
  shippingZone: text("shipping_zone").notNull(),
  recipientName: text("recipient_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  province: text("province").notNull(),
  postalCode: text("postal_code").notNull(),
  notes: text("notes").default("").notNull(),
  adminNote: text("admin_note").default("").notNull(),
  trackingNumber: text("tracking_number").default("").notNull(),
  paymentProof: text("payment_proof"),
  paymentProofName: text("payment_proof_name"),
  paymentSubmittedAt: timestamp("payment_submitted_at", { withTimezone: true }),
  paymentVerifiedAt: timestamp("payment_verified_at", { withTimezone: true }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id),
  productName: text("product_name").notNull(),
  productSlug: text("product_slug").notNull(),
  image: text("image").notNull(),
  unitPrice: integer("unit_price").notNull(),
  retailPrice: integer("retail_price").notNull(),
  resellerPrice: integer("reseller_price").notNull(),
  agentPrice: integer("agent_price").notNull(),
  distributorPrice: integer("distributor_price").notNull(),
  quantity: integer("quantity").notNull(),
  lineTotal: integer("line_total").notNull(),
});

export const bonusLedger = pgTable(
  "bonus_ledger",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id),
    sourceUserId: uuid("source_user_id").references(() => users.id),
    amount: integer("amount").notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("bonus_order_unique").on(table.orderId)],
);

export const withdrawals = pgTable("withdrawals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  amount: integer("amount").notNull(),
  status: withdrawalStatusEnum("status").default("pending").notNull(),
  bankName: text("bank_name").notNull(),
  bankAccount: text("bank_account").notNull(),
  bankHolder: text("bank_holder").notNull(),
  note: text("note").default("").notNull(),
  requestedAt: timestamp("requested_at", { withTimezone: true }).defaultNow().notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
});

export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  bonuses: many(bonusLedger),
  withdrawals: many(withdrawals),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

import { pgTable, text, timestamp, boolean, integer, decimal, pgEnum, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "customer", "supplier"]);
export const productTypeEnum = pgEnum("product_type", ["dropship", "pod", "digital", "subscription"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "processing", "fulfilled", "cancelled", "returned"]);
export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "paid", "refunded", "failed"]);
export const fulfillmentStatusEnum = pgEnum("fulfillment_status", ["none", "pending", "in_progress", "shipped", "delivered"]);
export const applicationStatusEnum = pgEnum("application_status", ["pending", "approved", "rejected"]);

// Better Auth Tables (Extended)
export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  role: userRoleEnum("role").notNull().default("customer"),
  tosAccepted: boolean("tosAccepted").notNull().default(false),
  privacyPolicyAccepted: boolean("privacyPolicyAccepted").notNull().default(false),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => users.id),
});

export const accounts = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => users.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const verifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

// Commerce Tables
export const categories = pgTable("category", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const products = pgTable("product", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  type: productTypeEnum("type").notNull().default("dropship"),
  categoryId: uuid("categoryId").references(() => categories.id),
  images: text("images").array().notNull().default([]),
  isActive: boolean("isActive").default(true).notNull(),
  supplierId: text("supplierId").references(() => users.id),
  supplierProductId: text("supplierProductId"), // External ID for sync (e.g. Printify)
  metadata: text("metadata"), // JSON for supplier specific info
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const productVariants = pgTable("product_variant", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("productId").notNull().references(() => products.id),
  name: text("name").notNull(), // color, size, etc
  sku: text("sku").notNull().unique(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  inventory: integer("inventory").default(0), // Only for digital or tracked dropship
  supplierVariantId: text("supplierVariantId"), // External ID for Printify/Printful
  assetUrl: text("assetUrl"), // For digital products (ImageKit)
  metadata: text("metadata"), // JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const orders = pgTable("order", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => users.id),
  status: orderStatusEnum("status").notNull().default("pending"),
  paymentStatus: paymentStatusEnum("paymentStatus").notNull().default("unpaid"),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: text("shippingAddress"), // JSON or multiline text
  dodoCheckoutId: text("dodoCheckoutId"), // Dodo Payments reference
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const orderItems = pgTable("order_item", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("orderId").notNull().references(() => orders.id),
  variantId: uuid("variantId").notNull().references(() => productVariants.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  fulfillmentStatus: fulfillmentStatusEnum("fulfillmentStatus").notNull().default("pending"),
  trackingNumber: text("trackingNumber"),
  supplierOrderId: text("supplierOrderId"), // External ID from Printify/etc
});

export const supplierApplications = pgTable("supplier_application", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => users.id),
  storeName: text("storeName").notNull(),
  website: text("website"),
  description: text("description"),
  status: applicationStatusEnum("status").notNull().default("pending"),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Relations
export const productRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  supplier: one(users, {
    fields: [products.supplierId],
    references: [users.id],
  }),
  variants: many(productVariants),
}));

export const variantRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

export const applicationRelations = relations(supplierApplications, ({ one }) => ({
  user: one(users, {
    fields: [supplierApplications.userId],
    references: [users.id],
  }),
}));

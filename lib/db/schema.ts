import { pgTable, text, timestamp, boolean, integer, decimal, pgEnum, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "customer", "business"]);
export const productTypeEnum = pgEnum("product_type", ["dropship", "pod", "digital", "subscription"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "processing", "fulfilled", "cancelled", "returned"]);
export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "paid", "refunded", "failed"]);
export const fulfillmentStatusEnum = pgEnum("fulfillment_status", ["none", "pending", "in_progress", "shipped", "delivered"]);
export const applicationStatusEnum = pgEnum("application_status", ["pending", "approved", "rejected"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "past_due", "cancelled", "expired", "trialing"]);
export const subscriptionPlanEnum = pgEnum("subscription_plan", ["free", "starter", "growth", "agency"]);
export const workflowStatusEnum = pgEnum("workflow_status", ["active", "paused", "error"]);
export const executionStatusEnum = pgEnum("execution_status", ["pending", "running", "completed", "failed"]);

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
  markupPercentage: integer("markupPercentage").default(0), // Profit margin percentage
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

export const subscriptions = pgTable("subscription", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => users.id),
  plan: subscriptionPlanEnum("plan").notNull(),
  status: subscriptionStatusEnum("status").notNull().default("trialing"),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  dodoSubscriptionId: text("dodoSubscriptionId"),
  cancelledAt: timestamp("cancelledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const aiApiKeys = pgTable("ai_api_key", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => users.id),
  provider: text("provider").notNull(), // anthropic, openai, groq, deepseek, gemini
  encryptedKey: text("encryptedKey").notNull(),
  iv: text("iv").notNull(),
  label: text("label"),
  isValid: boolean("isValid").default(true),
  lastValidatedAt: timestamp("lastValidatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const workflowTemplates = pgTable("workflow_template", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  defaultModel: text("defaultModel"),
  defaultProvider: text("defaultProvider"),
  promptTemplate: text("promptTemplate").notNull(),
  inputSchema: text("inputSchema"), // JSON string representing Zod schema or fields
  outputSchema: text("outputSchema"), // JSON string
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const userWorkflows = pgTable("user_workflow", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => users.id),
  templateId: uuid("templateId").notNull().references(() => workflowTemplates.id),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  customPrompt: text("customPrompt"),
  status: workflowStatusEnum("status").notNull().default("active"),
  config: text("config"), // JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const workflowExecutions = pgTable("workflow_execution", {
  id: uuid("id").defaultRandom().primaryKey(),
  userWorkflowId: uuid("userWorkflowId").notNull().references(() => userWorkflows.id),
  userId: text("userId").notNull().references(() => users.id),
  input: text("input"), // JSON
  output: text("output"), // JSON
  tokensUsed: integer("tokensUsed"),
  durationMs: integer("durationMs"),
  status: executionStatusEnum("status").notNull().default("pending"),
  error: text("error"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Relations
export const categoryRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

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

export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const aiApiKeyRelations = relations(aiApiKeys, ({ one }) => ({
  user: one(users, {
    fields: [aiApiKeys.userId],
    references: [users.id],
  }),
}));

export const userWorkflowRelations = relations(userWorkflows, ({ one, many }) => ({
  user: one(users, {
    fields: [userWorkflows.userId],
    references: [users.id],
  }),
  template: one(workflowTemplates, {
    fields: [userWorkflows.templateId],
    references: [workflowTemplates.id],
  }),
  executions: many(workflowExecutions),
}));

export const workflowExecutionRelations = relations(workflowExecutions, ({ one }) => ({
  userWorkflow: one(userWorkflows, {
    fields: [workflowExecutions.userWorkflowId],
    references: [userWorkflows.id],
  }),
  user: one(users, {
    fields: [workflowExecutions.userId],
    references: [users.id],
  }),
}));

// New Scheduled Workflows Tables
export const workflows = pgTable("workflows", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  schedule: text("schedule").notNull(),
  prompt: text("prompt").notNull(),
  provider: text("provider").notNull(),
  apiKey: text("apiKey"),
  status: text("status").notNull().default("active"),
  outputType: text("outputType").notNull().default("email"),
  emailRecipient: text("emailRecipient"),
  lastRunAt: timestamp("lastRunAt"),
  nextRunAt: timestamp("nextRunAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const workflowRuns = pgTable("workflow_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  workflowId: uuid("workflowId").references(() => workflows.id),
  userId: text("userId").references(() => users.id),
  status: text("status").notNull(),
  output: text("output"),
  error: text("error"),
  tokensUsed: integer("tokensUsed"),
  durationMs: integer("durationMs"),
  ranAt: timestamp("ranAt").defaultNow().notNull(),
});

export const workflowSchedulerRelations = relations(workflows, ({ one, many }) => ({
  user: one(users, {
    fields: [workflows.userId],
    references: [users.id],
  }),
  runs: many(workflowRuns),
}));

export const workflowRunSchedulerRelations = relations(workflowRuns, ({ one }) => ({
  workflow: one(workflows, {
    fields: [workflowRuns.workflowId],
    references: [workflows.id],
  }),
  user: one(users, {
    fields: [workflowRuns.userId],
    references: [users.id],
  }),
}));

// CJ Dropshipping Connection Table
export const cjConnections = pgTable("cj_connection", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => users.id),
  encryptedApiKey: text("encryptedApiKey").notNull(),
  iv: text("iv").notNull(),
  storeName: text("storeName"),
  isConnected: boolean("isConnected").default(false).notNull(),
  lastValidatedAt: timestamp("lastValidatedAt"),
  accessToken: text("accessToken"), // Cached access token
  tokenExpiry: timestamp("tokenExpiry"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const cjConnectionRelations = relations(cjConnections, ({ one }) => ({
  user: one(users, {
    fields: [cjConnections.userId],
    references: [users.id],
  }),
}));

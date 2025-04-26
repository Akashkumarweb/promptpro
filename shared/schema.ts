// import { pgTable, text, serial, integer, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
// import { createInsertSchema } from "drizzle-zod";
// import { z } from "zod";

// export const users = pgTable("users", {
//   id: serial("id").primaryKey(),
//   username: text("username").notNull().unique(),
//   password: text("password").notNull(),
//   email: text("email"),
//   displayName: text("display_name"),
//   avatarUrl: text("avatar_url"),
//   provider: text("provider"),
//   providerId: text("provider_id"),
//   promptsUsed: integer("prompts_used").default(0).notNull(),
//   isPremium: boolean("is_premium").default(false).notNull(),
//   stripeCustomerId: text("stripe_customer_id"),
//   stripeSubscriptionId: text("stripe_subscription_id"),
//   subscriptionStatus: text("subscription_status").default("inactive").notNull(),
//   // Track when the promptsUsed counter was last reset
//   lastResetDate: timestamp("last_reset_date").defaultNow().notNull(),
// });

// export const prompts = pgTable("prompts", {
//   id: serial("id").primaryKey(),
//   userId: integer("user_id").notNull(),
//   originalPrompt: text("original_prompt").notNull(),
//   optimizedPrompt: text("optimized_prompt").notNull(),
//   audience: text("audience"),
//   focusAreas: text("focus_areas"),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
// });

// export const promocodes = pgTable("promocodes", {
//   id: serial("id").primaryKey(),
//   code: text("code").notNull().unique(),
//   description: text("description"),
//   discountPercent: integer("discount_percent").notNull(),
//   maxUses: integer("max_uses").default(0),
//   usedCount: integer("used_count").default(0).notNull(),
//   isActive: boolean("is_active").default(true).notNull(),
//   expiresAt: timestamp("expires_at"),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
//   stripePromotionId: text("stripe_promotion_id"),
// });

// export const userPromocodes = pgTable("user_promocodes", {
//   id: serial("id").primaryKey(),
//   userId: integer("user_id").notNull(),
//   promocodeId: integer("promocode_id").notNull(),
//   usedAt: timestamp("used_at").defaultNow().notNull(),
//   // Each user can use a specific promocode only once
// }, (table) => {
//   return {
//     userPromoUnique: uniqueIndex("user_promo_unique_idx").on(table.userId, table.promocodeId),
//   };
// });

// export const insertUserSchema = createInsertSchema(users).pick({
//   username: true,
//   password: true,
//   email: true,
//   displayName: true,
//   avatarUrl: true,
//   provider: true,
//   providerId: true,
// });

// export const loginUserSchema = z.object({
//   username: z.string().min(3),
//   password: z.string().min(6),
// });

// export const insertPromptSchema = createInsertSchema(prompts).pick({
//   userId: true,
//   originalPrompt: true,
//   optimizedPrompt: true,
//   audience: true,
//   focusAreas: true,
// });

// export const promocodeSchema = createInsertSchema(promocodes).pick({
//   code: true,
//   description: true,
//   discountPercent: true,
//   maxUses: true,
//   isActive: true,
//   expiresAt: true,
//   stripePromotionId: true,
// });

// export const applyPromocodeSchema = z.object({
//   code: z.string().min(1, "Please enter a promocode"),
// });

// export const subscriptionSchema = z.object({
//   plan: z.enum(["monthly", "yearly"]),
//   promocode: z.string().optional(),
// });

// export const optimizePromptSchema = z.object({
//   originalPrompt: z.string().min(1, "Please enter a prompt"),
//   audience: z.string().optional(),
//   focusAreas: z.array(z.string()).optional(),
// });

// export type InsertUser = z.infer<typeof insertUserSchema>;
// export type LoginUser = z.infer<typeof loginUserSchema>;
// export type User = typeof users.$inferSelect;
// export type InsertPrompt = z.infer<typeof insertPromptSchema>;
// export type Prompt = typeof prompts.$inferSelect;
// export type OptimizePromptData = z.infer<typeof optimizePromptSchema>;
// export type Promocode = typeof promocodes.$inferSelect;
// export type InsertPromocode = z.infer<typeof promocodeSchema>;
// export type ApplyPromocodeData = z.infer<typeof applyPromocodeSchema>;
// export type SubscriptionData = z.infer<typeof subscriptionSchema>;
import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean, 
  timestamp, 
  uniqueIndex 
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Database Tables ---

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  provider: text("provider"),
  providerId: text("provider_id"),
  promptsUsed: integer("prompts_used").default(0).notNull(),
  isPremium: boolean("is_premium").default(false).notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").default("inactive").notNull(),
  lastResetDate: timestamp("last_reset_date").defaultNow().notNull(),
});

export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  originalPrompt: text("original_prompt").notNull(),
  optimizedPrompt: text("optimized_prompt").notNull(),
  audience: text("audience"),
  focusAreas: text("focus_areas"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const promocodes = pgTable("promocodes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  description: text("description"),
  discountPercent: integer("discount_percent").notNull(),
  maxUses: integer("max_uses").default(0),
  usedCount: integer("used_count").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  stripePromotionId: text("stripe_promotion_id"),
});

export const userPromocodes = pgTable("user_promocodes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  promocodeId: integer("promocode_id").notNull(),
  usedAt: timestamp("used_at").defaultNow().notNull(),
}, (table) => ({
  userPromoUnique: uniqueIndex("user_promo_unique_idx").on(table.userId, table.promocodeId),
}));

// --- Zod Validation Schemas ---

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
  avatarUrl: true,
  provider: true,
  providerId: true,
});

export const loginUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertPromptSchema = createInsertSchema(prompts).pick({
  userId: true,
  originalPrompt: true,
  optimizedPrompt: true,
  audience: true,
  focusAreas: true,
});

export const promocodeSchema = createInsertSchema(promocodes).pick({
  code: true,
  description: true,
  discountPercent: true,
  maxUses: true,
  isActive: true,
  expiresAt: true,
  stripePromotionId: true,
});

export const applyPromocodeSchema = z.object({
  code: z.string().min(1, "Please enter a promocode"),
});

export const subscriptionSchema = z.object({
  plan: z.enum(["monthly", "yearly"]),
  promocode: z.string().optional(),
});

export const optimizePromptSchema = z.object({
  originalPrompt: z.string().min(1, "Please enter a prompt"),
  audience: z.string().optional(),
  focusAreas: z.array(z.string()).optional(),
});

// --- Types for TypeScript Inference ---

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Prompt = typeof prompts.$inferSelect;
export type Promocode = typeof promocodes.$inferSelect;
export type InsertPromocode = z.infer<typeof promocodeSchema>;
export type ApplyPromocodeData = z.infer<typeof applyPromocodeSchema>;
export type SubscriptionData = z.infer<typeof subscriptionSchema>;
export type OptimizePromptData = z.infer<typeof optimizePromptSchema>;

import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  username: z.string().min(3),
  password: z.string().min(6),
});

export const insertPromptSchema = createInsertSchema(prompts).pick({
  userId: true,
  originalPrompt: true,
  optimizedPrompt: true,
  audience: true,
  focusAreas: true,
});

export const optimizePromptSchema = z.object({
  originalPrompt: z.string().min(1, "Please enter a prompt"),
  audience: z.string().optional(),
  focusAreas: z.array(z.string()).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Prompt = typeof prompts.$inferSelect;
export type OptimizePromptData = z.infer<typeof optimizePromptSchema>;

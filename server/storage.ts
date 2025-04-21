import { 
  users, 
  type User, 
  type InsertUser, 
  prompts, 
  type Prompt, 
  type InsertPrompt,
  promocodes,
  type Promocode,
  type InsertPromocode,
  userPromocodes
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, lt, isNull, ne } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPromptCount(userId: number): Promise<User | undefined>;
  
  // Handle subscription-related user updates
  updateUserSubscription(userId: number, data: {
    isPremium: boolean;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStatus?: string;
  }): Promise<User | undefined>;
  
  // Reset monthly prompt counts (could be called by a scheduled task)
  resetMonthlyPromptCounts(): Promise<number>;
  
  // Check if a user is under the monthly limit for free tier
  checkUserPromptLimit(userId: number): Promise<boolean>;

  // Prompt management
  getUserPrompts(userId: number): Promise<Prompt[]>;
  getPrompt(id: number): Promise<Prompt | undefined>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  deletePrompt(id: number): Promise<boolean>;
  
  // Promocode management
  getPromocode(code: string): Promise<Promocode | undefined>;
  getPromocodeById(id: number): Promise<Promocode | undefined>;
  createPromocode(promocode: InsertPromocode): Promise<Promocode>;
  updatePromocode(id: number, data: Partial<Promocode>): Promise<Promocode | undefined>;
  incrementPromocodeUsage(promocodeId: number): Promise<Promocode | undefined>;
  
  // User-promocode relationship
  applyPromocodeToUser(userId: number, promocodeId: number): Promise<boolean>;
  hasUserUsedPromocode(userId: number, promocodeId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, stripeCustomerId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        promptsUsed: 0,
        isPremium: false,
        lastResetDate: new Date(),
        subscriptionStatus: "inactive"
      })
      .returning();
    return user;
  }

  async updateUserPromptCount(userId: number): Promise<User | undefined> {
    // First check if we need to reset the counter (if it's a new month)
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const lastReset = new Date(user.lastResetDate);
    const now = new Date();
    
    // If it's a new month, reset the counter
    if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
      const [updatedUser] = await db
        .update(users)
        .set({ 
          promptsUsed: 1, // Set to 1 because we're using this prompt now
          lastResetDate: now 
        })
        .where(eq(users.id, userId))
        .returning();
      return updatedUser;
    }
    
    // Otherwise just increment the counter
    const [updatedUser] = await db
      .update(users)
      .set({ promptsUsed: user.promptsUsed + 1 })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }
  
  async updateUserSubscription(userId: number, data: {
    isPremium: boolean;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStatus?: string;
  }): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }
  
  async resetMonthlyPromptCounts(): Promise<number> {
    // This could be called by a scheduled task
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const result = await db
      .update(users)
      .set({ 
        promptsUsed: 0,
        lastResetDate: now
      })
      .where(lt(users.lastResetDate, firstDayOfMonth))
      .returning({ id: users.id });
    
    return result.length;
  }
  
  async checkUserPromptLimit(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    
    // Premium users have no limit
    if (user.isPremium) return true;
    
    // Check if the user has reached their monthly limit
    return user.promptsUsed < 10;
  }

  async getUserPrompts(userId: number): Promise<Prompt[]> {
    const userPrompts = await db
      .select()
      .from(prompts)
      .where(eq(prompts.userId, userId))
      .orderBy(prompts.createdAt);
    
    return userPrompts;
  }

  async getPrompt(id: number): Promise<Prompt | undefined> {
    const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
    return prompt;
  }

  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const [prompt] = await db
      .insert(prompts)
      .values(insertPrompt)
      .returning();
    return prompt;
  }

  async deletePrompt(id: number): Promise<boolean> {
    const result = await db.delete(prompts).where(eq(prompts.id, id));
    return result.count > 0;
  }
  
  async getPromocode(code: string): Promise<Promocode | undefined> {
    const [promocode] = await db
      .select()
      .from(promocodes)
      .where(
        and(
          eq(promocodes.code, code),
          eq(promocodes.isActive, true),
          or(
            isNull(promocodes.expiresAt),
            gt(promocodes.expiresAt, new Date())
          ),
          or(
            eq(promocodes.maxUses, 0), // 0 means unlimited uses
            gt(promocodes.maxUses, promocodes.usedCount)
          )
        )
      );
    return promocode;
  }
  
  async getPromocodeById(id: number): Promise<Promocode | undefined> {
    const [promocode] = await db.select().from(promocodes).where(eq(promocodes.id, id));
    return promocode;
  }
  
  async createPromocode(promocode: InsertPromocode): Promise<Promocode> {
    const [newPromocode] = await db
      .insert(promocodes)
      .values({
        ...promocode,
        usedCount: 0,
        isActive: true,
        createdAt: new Date()
      })
      .returning();
    return newPromocode;
  }
  
  async updatePromocode(id: number, data: Partial<Promocode>): Promise<Promocode | undefined> {
    const [updatedPromocode] = await db
      .update(promocodes)
      .set(data)
      .where(eq(promocodes.id, id))
      .returning();
    return updatedPromocode;
  }
  
  async incrementPromocodeUsage(promocodeId: number): Promise<Promocode | undefined> {
    const promocode = await this.getPromocodeById(promocodeId);
    if (!promocode) return undefined;
    
    const [updatedPromocode] = await db
      .update(promocodes)
      .set({ usedCount: promocode.usedCount + 1 })
      .where(eq(promocodes.id, promocodeId))
      .returning();
    return updatedPromocode;
  }
  
  async applyPromocodeToUser(userId: number, promocodeId: number): Promise<boolean> {
    // Check if user has already used this promocode
    const hasUsed = await this.hasUserUsedPromocode(userId, promocodeId);
    if (hasUsed) return false;
    
    // Record the usage
    await db
      .insert(userPromocodes)
      .values({
        userId,
        promocodeId,
        usedAt: new Date()
      });
    
    // Increment the usage counter
    await this.incrementPromocodeUsage(promocodeId);
    
    return true;
  }
  
  async hasUserUsedPromocode(userId: number, promocodeId: number): Promise<boolean> {
    const [record] = await db
      .select()
      .from(userPromocodes)
      .where(
        and(
          eq(userPromocodes.userId, userId),
          eq(userPromocodes.promocodeId, promocodeId)
        )
      );
    
    return !!record;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private prompts: Map<number, Prompt>;
  private promocodes: Map<number, Promocode>;
  private userPromocodes: Map<string, { userId: number, promocodeId: number, usedAt: Date }>;
  private userIdCounter: number;
  private promptIdCounter: number;
  private promocodeIdCounter: number;

  constructor() {
    this.users = new Map();
    this.prompts = new Map();
    this.promocodes = new Map();
    this.userPromocodes = new Map();
    this.userIdCounter = 1;
    this.promptIdCounter = 1;
    this.promocodeIdCounter = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.stripeCustomerId === stripeCustomerId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id, 
      promptsUsed: 0, 
      isPremium: false,
      subscriptionStatus: "inactive",
      lastResetDate: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPromptCount(userId: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const lastReset = new Date(user.lastResetDate);
    const now = new Date();
    
    // If it's a new month, reset the counter
    let updatedUser;
    if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
      updatedUser = {
        ...user,
        promptsUsed: 1, // Set to 1 because we're using this prompt now
        lastResetDate: now
      };
    } else {
      updatedUser = {
        ...user,
        promptsUsed: user.promptsUsed + 1
      };
    }
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserSubscription(userId: number, data: {
    isPremium: boolean;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStatus?: string;
  }): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      ...data
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async resetMonthlyPromptCounts(): Promise<number> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let resetCount = 0;
    for (const [id, user] of this.users.entries()) {
      const lastReset = new Date(user.lastResetDate);
      if (lastReset < firstDayOfMonth) {
        this.users.set(id, {
          ...user,
          promptsUsed: 0,
          lastResetDate: now
        });
        resetCount++;
      }
    }
    
    return resetCount;
  }
  
  async checkUserPromptLimit(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    
    // Premium users have no limit
    if (user.isPremium) return true;
    
    // Free users are limited to 10 per month
    return user.promptsUsed < 10;
  }

  async getUserPrompts(userId: number): Promise<Prompt[]> {
    return Array.from(this.prompts.values())
      .filter(prompt => prompt.userId === userId)
      .sort((a, b) => {
        // Sort by createdAt in descending order (newest first)
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
  }

  async getPrompt(id: number): Promise<Prompt | undefined> {
    return this.prompts.get(id);
  }

  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const id = this.promptIdCounter++;
    const prompt: Prompt = {
      ...insertPrompt,
      id,
      createdAt: new Date()
    };
    this.prompts.set(id, prompt);
    return prompt;
  }

  async deletePrompt(id: number): Promise<boolean> {
    return this.prompts.delete(id);
  }
  
  async getPromocode(code: string): Promise<Promocode | undefined> {
    return Array.from(this.promocodes.values()).find(promo => {
      const isActive = promo.isActive;
      const isNotExpired = !promo.expiresAt || new Date(promo.expiresAt) > new Date();
      const hasAvailableUses = promo.maxUses === 0 || promo.usedCount < promo.maxUses;
      
      return promo.code === code && isActive && isNotExpired && hasAvailableUses;
    });
  }
  
  async getPromocodeById(id: number): Promise<Promocode | undefined> {
    return this.promocodes.get(id);
  }
  
  async createPromocode(promocode: InsertPromocode): Promise<Promocode> {
    const id = this.promocodeIdCounter++;
    const newPromocode: Promocode = {
      ...promocode,
      id,
      usedCount: 0,
      isActive: true,
      createdAt: new Date()
    };
    this.promocodes.set(id, newPromocode);
    return newPromocode;
  }
  
  async updatePromocode(id: number, data: Partial<Promocode>): Promise<Promocode | undefined> {
    const promocode = await this.getPromocodeById(id);
    if (!promocode) return undefined;
    
    const updatedPromocode = {
      ...promocode,
      ...data
    };
    
    this.promocodes.set(id, updatedPromocode);
    return updatedPromocode;
  }
  
  async incrementPromocodeUsage(promocodeId: number): Promise<Promocode | undefined> {
    const promocode = await this.getPromocodeById(promocodeId);
    if (!promocode) return undefined;
    
    const updatedPromocode = {
      ...promocode,
      usedCount: promocode.usedCount + 1
    };
    
    this.promocodes.set(promocodeId, updatedPromocode);
    return updatedPromocode;
  }
  
  async applyPromocodeToUser(userId: number, promocodeId: number): Promise<boolean> {
    // Check if user has already used this promocode
    const hasUsed = await this.hasUserUsedPromocode(userId, promocodeId);
    if (hasUsed) return false;
    
    // Record the usage
    const key = `${userId}-${promocodeId}`;
    this.userPromocodes.set(key, {
      userId,
      promocodeId,
      usedAt: new Date()
    });
    
    // Increment the usage counter
    await this.incrementPromocodeUsage(promocodeId);
    
    return true;
  }
  
  async hasUserUsedPromocode(userId: number, promocodeId: number): Promise<boolean> {
    const key = `${userId}-${promocodeId}`;
    return this.userPromocodes.has(key);
  }
}

// Uncomment below to use the database storage
// export const storage = new DatabaseStorage();

// For now, use the memory storage
export const storage = new MemStorage();

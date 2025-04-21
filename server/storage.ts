import { 
  users, 
  type User, 
  type InsertUser, 
  prompts, 
  type Prompt, 
  type InsertPrompt 
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPromptCount(userId: number): Promise<User | undefined>;
  getUserPrompts(userId: number): Promise<Prompt[]>;
  getPrompt(id: number): Promise<Prompt | undefined>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  deletePrompt(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private prompts: Map<number, Prompt>;
  private userIdCounter: number;
  private promptIdCounter: number;

  constructor() {
    this.users = new Map();
    this.prompts = new Map();
    this.userIdCounter = 1;
    this.promptIdCounter = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id, 
      promptsUsed: 0, 
      isPremium: false 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPromptCount(userId: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      promptsUsed: user.promptsUsed + 1
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
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
}

export const storage = new MemStorage();

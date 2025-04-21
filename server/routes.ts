import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { optimizePrompt } from "./openai";
import { 
  insertUserSchema, 
  loginUserSchema, 
  optimizePromptSchema, 
  insertPromptSchema 
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import MemoryStore from "memorystore";

const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session
  app.use(
    session({
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      secret: process.env.SESSION_SECRET || "prompt-pal-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport config
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid username or password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Auth middleware
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Not authenticated" });
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user with hashed password
      const newUser = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    try {
      loginUserSchema.parse(req.body);
      
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: info.message });
        }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          
          // Remove password from response
          const { password, ...userWithoutPassword } = user;
          
          return res.json(userWithoutPassword);
        });
      })(req, res, next);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", isAuthenticated, (req, res) => {
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  // Prompt optimization routes
  app.post("/api/optimize", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      // Check rate limit for free users
      if (!user.isPremium && user.promptsUsed >= 10) {
        return res.status(429).json({ 
          message: "Free tier limit reached (10 optimizations/month). Please upgrade to Premium." 
        });
      }
      
      const validatedData = optimizePromptSchema.parse(req.body);
      
      const { originalPrompt, audience, focusAreas } = validatedData;
      
      // Call OpenAI to optimize the prompt
      const optimizedResult = await optimizePrompt(
        originalPrompt, 
        audience || "general", 
        focusAreas || ["specificity", "clarity"]
      );
      
      // Save the prompt to the database
      const savedPrompt = await storage.createPrompt({
        userId: user.id,
        originalPrompt,
        optimizedPrompt: optimizedResult.optimizedPrompt,
        audience: audience || "general",
        focusAreas: focusAreas ? focusAreas.join(",") : "specificity,clarity"
      });
      
      // Update user's prompt count
      await storage.updateUserPromptCount(user.id);
      
      // Return the optimized prompt with metadata
      res.json({
        ...savedPrompt,
        reasoning: optimizedResult.reasoning,
        improvements: optimizedResult.improvements
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/prompts", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const prompts = await storage.getUserPrompts(user.id);
      res.json(prompts);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/prompts/:id", isAuthenticated, async (req, res) => {
    try {
      const promptId = parseInt(req.params.id);
      const prompt = await storage.getPrompt(promptId);
      
      if (!prompt) {
        return res.status(404).json({ message: "Prompt not found" });
      }
      
      const user = req.user as any;
      
      // Check if the prompt belongs to the user
      if (prompt.userId !== user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.json(prompt);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/prompts/:id", isAuthenticated, async (req, res) => {
    try {
      const promptId = parseInt(req.params.id);
      const prompt = await storage.getPrompt(promptId);
      
      if (!prompt) {
        return res.status(404).json({ message: "Prompt not found" });
      }
      
      const user = req.user as any;
      
      // Check if the prompt belongs to the user
      if (prompt.userId !== user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deletePrompt(promptId);
      res.json({ message: "Prompt deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

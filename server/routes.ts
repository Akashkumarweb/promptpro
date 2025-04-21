import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { optimizePrompt } from "./openai";
import { 
  insertUserSchema, 
  loginUserSchema, 
  optimizePromptSchema, 
  insertPromptSchema,
  promocodeSchema,
  applyPromocodeSchema,
  subscriptionSchema
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import MemoryStore from "memorystore";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required environment variable: STRIPE_SECRET_KEY");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Define subscription plan pricing
const SUBSCRIPTION_PLANS = {
  monthly: {
    amount: 1499, // $14.99 in cents
    interval: "month" as const,
    name: "PromptPal Pro Monthly"
  },
  yearly: {
    amount: 14990, // $149.90 in cents
    interval: "year" as const,
    name: "PromptPal Pro Yearly"
  }
};

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
      
      // First, check if user can use prompts based on their tier
      const canUsePrompt = await storage.checkUserPromptLimit(user.id);
      if (!canUsePrompt) {
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

  // Subscription and payment routes
  
  // Apply a promocode
  app.post("/api/promocodes/validate", isAuthenticated, async (req, res) => {
    try {
      const { code } = applyPromocodeSchema.parse(req.body);
      
      // Check if this promocode exists and is valid
      const promocode = await storage.getPromocode(code);
      
      if (!promocode) {
        return res.status(404).json({ 
          message: "Invalid or expired promocode"
        });
      }
      
      // Check if user has already used this promocode
      const user = req.user as any;
      if (await storage.hasUserUsedPromocode(user.id, promocode.id)) {
        return res.status(400).json({ 
          message: "You have already used this promocode"
        });
      }
      
      // Return the promocode info (without exposing sensitive details)
      res.json({
        code: promocode.code,
        discountPercent: promocode.discountPercent,
        description: promocode.description
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Create a subscription with optional promocode
  app.post("/api/subscriptions", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { plan, promocode } = subscriptionSchema.parse(req.body);
      
      // Get the plan details
      const planDetails = SUBSCRIPTION_PLANS[plan];
      if (!planDetails) {
        return res.status(400).json({ message: "Invalid subscription plan" });
      }
      
      let discountPercent = 0;
      let promocodeId: number | null = null;
      
      // Apply promocode if provided
      if (promocode) {
        const promocodeData = await storage.getPromocode(promocode);
        if (promocodeData) {
          // Check if user has already used this promocode
          if (await storage.hasUserUsedPromocode(user.id, promocodeData.id)) {
            return res.status(400).json({ 
              message: "You have already used this promocode"
            });
          }
          
          discountPercent = promocodeData.discountPercent;
          promocodeId = promocodeData.id;
        } else {
          return res.status(404).json({ message: "Invalid or expired promocode" });
        }
      }
      
      // Calculate final amount with discount
      const finalAmount = Math.round(planDetails.amount * (1 - discountPercent / 100));
      
      // Find or create a Stripe customer for this user
      let customer;
      if (user.stripeCustomerId) {
        customer = await stripe.customers.retrieve(user.stripeCustomerId);
        if ((customer as any).deleted) {
          // Customer was deleted, create a new one
          customer = await stripe.customers.create({
            email: user.email,
            name: user.displayName || user.username,
            metadata: {
              userId: user.id.toString()
            }
          });
          
          // Update the user with the new customer ID
          await storage.updateUserSubscription(user.id, {
            isPremium: user.isPremium,
            stripeCustomerId: customer.id
          });
        }
      } else {
        // Create a new customer
        customer = await stripe.customers.create({
          email: user.email,
          name: user.displayName || user.username,
          metadata: {
            userId: user.id.toString()
          }
        });
        
        // Update the user with the new customer ID
        await storage.updateUserSubscription(user.id, {
          isPremium: user.isPremium,
          stripeCustomerId: customer.id
        });
      }
      
      // Create a payment intent for this subscription
      const paymentIntent = await stripe.paymentIntents.create({
        amount: finalAmount,
        currency: "usd",
        customer: customer.id,
        description: `${planDetails.name} Subscription`,
        metadata: {
          userId: user.id.toString(),
          plan: plan,
          promocodeId: promocodeId ? promocodeId.toString() : null
        }
      });
      
      // Apply the promocode if used
      if (promocodeId) {
        await storage.applyPromocodeToUser(user.id, promocodeId);
      }
      
      // Return client secret for the frontend to complete payment
      res.json({
        clientSecret: paymentIntent.client_secret,
        amount: finalAmount,
        discountPercent: discountPercent
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Webhook endpoint for Stripe events
  app.post("/api/webhooks/stripe", async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!sig || !endpointSecret) {
      return res.status(400).json({ message: "Missing signature or webhook secret" });
    }
    
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      return res.status(400).json({ message: `Webhook Error: ${err.message}` });
    }
    
    // Handle different webhook events
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        
        // Get the user ID from the payment intent metadata
        const userId = parseInt(paymentIntent.metadata.userId);
        const plan = paymentIntent.metadata.plan;
        
        if (userId && plan) {
          // Update the user's subscription status
          await storage.updateUserSubscription(userId, {
            isPremium: true,
            subscriptionStatus: "active"
          });
        }
        break;
      }
      
      case "subscription.created":
      case "subscription.updated": {
        const subscription = event.data.object;
        
        // Find the user by customer ID
        const user = await storage.getUserByStripeCustomerId(subscription.customer);
        
        if (user) {
          // Update the user's subscription status
          await storage.updateUserSubscription(user.id, {
            isPremium: subscription.status === "active",
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status
          });
        }
        break;
      }
      
      case "subscription.deleted": {
        const subscription = event.data.object;
        
        // Find the user by customer ID
        const user = await storage.getUserByStripeCustomerId(subscription.customer);
        
        if (user) {
          // Update the user's subscription status
          await storage.updateUserSubscription(user.id, {
            isPremium: false,
            subscriptionStatus: "inactive"
          });
        }
        break;
      }
    }
    
    // Return a 200 to acknowledge receipt of the webhook
    res.json({ received: true });
  });

  // Admin routes for promocode management (would need additional admin-level auth)
  app.post("/api/admin/promocodes", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      
      // Check if user is admin (implement a real check in production)
      if (!user.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const promocodeData = promocodeSchema.parse(req.body);
      
      // Check if promocode already exists
      const existingPromo = await storage.getPromocode(promocodeData.code);
      if (existingPromo) {
        return res.status(400).json({ message: "Promocode already exists" });
      }
      
      // Create the promocode
      const newPromocode = await storage.createPromocode(promocodeData);
      
      res.status(201).json(newPromocode);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

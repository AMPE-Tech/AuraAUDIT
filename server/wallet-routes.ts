import { Express, Request, Response } from "express";
import { db } from "./db";
import { wallets, walletLedger, users, companyBillingConfig } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "./auth";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { z } from "zod";

const TOPUP_PACKAGES = [
  { credits: 50, usd: 50, label: "50 créditos" },
  { credits: 100, usd: 100, label: "100 créditos" },
  { credits: 500, usd: 500, label: "500 créditos" },
  { credits: 1000, usd: 1000, label: "1.000 créditos" },
];

const VIP_USERS = ["stabia"];
const VIP_INITIAL_CREDITS = 300;

async function getOrCreateWallet(userId: string) {
  const existing = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  if (existing.length > 0) return existing[0];

  const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const isVip = userRows.length > 0 && VIP_USERS.includes(userRows[0].username);
  const initialCredits = isVip ? VIP_INITIAL_CREDITS : 0;

  const [created] = await db.insert(wallets).values({
    userId,
    currency: "USD",
    balanceCredits: String(initialCredits),
  }).returning();

  if (isVip) {
    await db.insert(walletLedger).values({
      walletId: created.id,
      type: "topup",
      credits: String(VIP_INITIAL_CREDITS),
      usdAmount: "0",
      referenceType: "vip_courtesy",
      description: "Cortesia VIP — creditos iniciais",
    });
  }

  return created;
}

export function registerWalletRoutes(app: Express) {
  app.get("/api/wallet", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const wallet = await getOrCreateWallet(userId);

      const ledger = await db
        .select()
        .from(walletLedger)
        .where(eq(walletLedger.walletId, wallet.id))
        .orderBy(desc(walletLedger.createdAt))
        .limit(20);

      res.json({ wallet, ledger });
    } catch (error: any) {
      console.error("Error fetching wallet:", error.message);
      res.status(500).json({ error: "Failed to fetch wallet" });
    }
  });

  app.get("/api/wallet/ledger", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const wallet = await getOrCreateWallet(userId);

      const ledger = await db
        .select()
        .from(walletLedger)
        .where(eq(walletLedger.walletId, wallet.id))
        .orderBy(desc(walletLedger.createdAt));

      res.json({ ledger });
    } catch (error: any) {
      console.error("Error fetching ledger:", error.message);
      res.status(500).json({ error: "Failed to fetch ledger" });
    }
  });

  app.get("/api/wallet/packages", requireAuth, async (_req: Request, res: Response) => {
    res.json({ packages: TOPUP_PACKAGES });
  });

  app.post("/api/wallet/topup", requireAuth, async (req: Request, res: Response) => {
    try {
      const topupSchema = z.union([
        z.object({ packageIndex: z.number().min(0).max(3) }),
        z.object({ customAmount: z.number().min(1000) }),
      ]);

      const parsed = topupSchema.parse(req.body);

      let credits: number;
      let usd: number;
      let label: string;

      if ("packageIndex" in parsed) {
        const pkg = TOPUP_PACKAGES[parsed.packageIndex];
        credits = pkg.credits;
        usd = pkg.usd;
        label = pkg.label;
      } else {
        credits = parsed.customAmount;
        usd = parsed.customAmount;
        label = `${parsed.customAmount.toLocaleString("pt-BR")} créditos (personalizado)`;
      }

      const userId = req.session.userId!;
      const wallet = await getOrCreateWallet(userId);

      const stripe = await getUncachableStripeClient();

      const domains = process.env.REPLIT_DOMAINS;
      const baseUrl = domains ? `https://${domains.split(",")[0]}` : "http://localhost:5000";

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: usd * 100,
              product_data: {
                name: `AuraAudit AI Desk — ${label}`,
                description: `Recarga de ${credits} creditos para servicos de IA`,
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          wallet_id: wallet.id,
          user_id: userId,
          credits: String(credits),
          type: "wallet_topup",
        },
        success_url: `${baseUrl}/wallet?topup=success&credits=${credits}`,
        cancel_url: `${baseUrl}/wallet?topup=cancel`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating topup session:", error.message);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.post("/api/wallet/credit", requireAuth, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        credits: z.number().positive(),
        description: z.string().optional(),
      });
      const { credits, description } = schema.parse(req.body);

      const userId = req.session.userId!;
      const wallet = await getOrCreateWallet(userId);

      const newBalance = parseFloat(wallet.balanceCredits) + credits;

      await db.update(wallets).set({ balanceCredits: String(newBalance) }).where(eq(wallets.id, wallet.id));

      await db.insert(walletLedger).values({
        walletId: wallet.id,
        type: "topup",
        credits: String(credits),
        usdAmount: String(credits),
        referenceType: "manual",
        description: description || `Recarga de ${credits} creditos`,
      });

      res.json({ balance: newBalance });
    } catch (error: any) {
      console.error("Error crediting wallet:", error.message);
      res.status(500).json({ error: "Failed to credit wallet" });
    }
  });

  app.get("/api/wallet/caps", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;

      const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (userRows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = userRows[0];
      const companyId = user.clientId;

      const defaults = {
        userJobLimitDefault: "200",
        companyJobLimitDefault: "500",
        companyMonthlyWalletCap: null as string | null,
        autoApproveBelow: "200",
      };

      if (!companyId) {
        return res.json({ config: defaults, companyId: null });
      }

      const configRows = await db
        .select()
        .from(companyBillingConfig)
        .where(eq(companyBillingConfig.companyId, companyId))
        .limit(1);

      if (configRows.length === 0) {
        return res.json({ config: defaults, companyId });
      }

      const cfg = configRows[0];
      return res.json({
        config: {
          userJobLimitDefault: cfg.userJobLimitDefault,
          companyJobLimitDefault: cfg.companyJobLimitDefault,
          companyMonthlyWalletCap: cfg.companyMonthlyWalletCap,
          autoApproveBelow: cfg.autoApproveBelow,
        },
        companyId,
      });
    } catch (error: any) {
      console.error("Error fetching caps:", error.message);
      res.status(500).json({ error: "Failed to fetch caps" });
    }
  });

  app.post("/api/wallet/admin/caps", requireAuth, async (req: Request, res: Response) => {
    try {
      const role = req.session.role;
      if (role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const capsSchema = z.object({
        companyId: z.string().min(1),
        userJobLimitDefault: z.string().optional(),
        companyJobLimitDefault: z.string().optional(),
        companyMonthlyWalletCap: z.string().nullable().optional(),
        autoApproveBelow: z.string().optional(),
      });

      const parsed = capsSchema.parse(req.body);

      const existing = await db
        .select()
        .from(companyBillingConfig)
        .where(eq(companyBillingConfig.companyId, parsed.companyId))
        .limit(1);

      if (existing.length > 0) {
        const updateData: Record<string, any> = { updatedAt: new Date() };
        if (parsed.userJobLimitDefault !== undefined) updateData.userJobLimitDefault = parsed.userJobLimitDefault;
        if (parsed.companyJobLimitDefault !== undefined) updateData.companyJobLimitDefault = parsed.companyJobLimitDefault;
        if (parsed.companyMonthlyWalletCap !== undefined) updateData.companyMonthlyWalletCap = parsed.companyMonthlyWalletCap;
        if (parsed.autoApproveBelow !== undefined) updateData.autoApproveBelow = parsed.autoApproveBelow;

        const [updated] = await db
          .update(companyBillingConfig)
          .set(updateData)
          .where(eq(companyBillingConfig.companyId, parsed.companyId))
          .returning();

        return res.json({ config: updated });
      } else {
        const [created] = await db
          .insert(companyBillingConfig)
          .values({
            companyId: parsed.companyId,
            userJobLimitDefault: parsed.userJobLimitDefault || "200",
            companyJobLimitDefault: parsed.companyJobLimitDefault || "500",
            companyMonthlyWalletCap: parsed.companyMonthlyWalletCap || null,
            autoApproveBelow: parsed.autoApproveBelow || "200",
          })
          .returning();

        return res.json({ config: created });
      }
    } catch (error: any) {
      console.error("Error updating caps:", error.message);
      res.status(500).json({ error: "Failed to update caps" });
    }
  });

  app.patch("/api/admin/wallet/set-balance", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") {
        return res.status(403).json({ error: "Admin only" });
      }

      const { username, balance } = req.body;
      if (!username || balance === undefined) {
        return res.status(400).json({ error: "username and balance required" });
      }

      const userRows = await db.select().from(users).where(eq(users.username, username)).limit(1);
      if (userRows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const wallet = await db.select().from(wallets).where(eq(wallets.userId, userRows[0].id)).limit(1);
      if (wallet.length === 0) {
        return res.status(404).json({ error: "Wallet not found" });
      }

      const [updated] = await db.update(wallets)
        .set({ balanceCredits: String(balance) })
        .where(eq(wallets.id, wallet[0].id))
        .returning();

      console.log(`[ADMIN] Wallet balance set: ${username} → $${balance}`);
      res.json({ success: true, wallet: updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}

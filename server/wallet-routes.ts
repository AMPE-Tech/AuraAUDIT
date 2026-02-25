import { Express, Request, Response } from "express";
import { db } from "./db";
import { wallets, walletLedger } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "./auth";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { z } from "zod";

const TOPUP_PACKAGES = [
  { credits: 500, usd: 500, label: "500 creditos" },
  { credits: 1500, usd: 1500, label: "1.500 creditos" },
  { credits: 5000, usd: 5000, label: "5.000 creditos" },
];

async function getOrCreateWallet(userId: string) {
  const existing = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  if (existing.length > 0) return existing[0];

  const [created] = await db.insert(wallets).values({
    userId,
    currency: "USD",
    balanceCredits: "0",
  }).returning();
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

  app.post("/api/wallet/topup", requireAuth, async (req: Request, res: Response) => {
    try {
      const schema = z.object({ packageIndex: z.number().min(0).max(2) });
      const { packageIndex } = schema.parse(req.body);
      const pkg = TOPUP_PACKAGES[packageIndex];

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
              unit_amount: pkg.usd * 100,
              product_data: {
                name: `AuraAudit AI Desk — ${pkg.label}`,
                description: `Recarga de ${pkg.credits} creditos para servicos de IA`,
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          wallet_id: wallet.id,
          user_id: userId,
          credits: String(pkg.credits),
          type: "wallet_topup",
        },
        success_url: `${baseUrl}/wallet?topup=success&credits=${pkg.credits}`,
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
}

import { Express, Request, Response } from "express";
import { createHash } from "crypto";
import { db } from "./db";
import { termsAcceptance, monthlyConsumption, billingRuns } from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { z } from "zod";

const PRICING = {
  MONTHLY_FIXED_USD: 250,
  FRANCHISE_USD: 25000,
  VARIABLE_RATE: 0.003,
  CAP_USD: 3000,
  TERMS_VERSION: "1.0.0",
};

export function calculateMonthlyTotal(vam: number): { fixed: number; variable: number; total: number } {
  const fixed = PRICING.MONTHLY_FIXED_USD;
  const excess = Math.max(0, vam - PRICING.FRANCHISE_USD);
  const variable = PRICING.VARIABLE_RATE * excess;
  const total = Math.min(PRICING.CAP_USD, fixed + variable);
  return { fixed, variable: total - fixed, total };
}

function hashTermsText(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

const TERMS_TEXT_SHORT = `TERMOS DE ADESAO — AURAAUDIT PASS
Versao: ${PRICING.TERMS_VERSION}

1) Objeto: O AuraAudit Pass e um servico online de auditoria forense para despesas corporativas e terceiros, com foco em Compliance/Juridico, incluindo trilhas auditaveis, cadeia de custodia, rastreabilidade juridica, alertas e dashboards executivos.

2) Client-Controlled: O CONTRATANTE define o que auditar, quando e como, por regras, escopo, tolerancias, severidade e calendario. A CONTRATADA nao altera parametros sem autorizacao registrada.

3) VAM e Deduplicacao: VAM (Valor Auditado Mensal) = soma dos valores monetarios das transacoes/despesas efetivamente processadas pela Plataforma no mes. Deduplicacao aplicada quando possivel.

4) Preco e CAP:
- Mensalidade fixa: US$ 250/mes
- Franquia: ate US$ 25.000 de VAM/mes sem variavel
- Variavel: 0,30% sobre o excedente acima de US$ 25.000
- CAP mensal: total limitado a US$ 3.000/mes
- Formula: min(3000, 250 + 0,003 x max(0, VAM - 25.000))

5) Evidencias e rastreabilidade: A Plataforma registra logs e metadados (trilhas auditaveis) e preserva evidencias (cadeia de custodia). O Servico nao constitui parecer juridico.

6) Confidencialidade: Dados, relatorios, achados e Evidence Packs sao confidenciais.

7) LGPD: CONTRATANTE = Controlador; CONTRATADA = Operadora. Medidas de seguranca compativeis.

8) Limitacoes: Resultados dependem da qualidade dos dados. Sem garantia de economia ou recuperacao.

9) Vigencia: Mensal com renovacao automatica. Cancelamento a qualquer tempo, efeitos ao final do ciclo.

10) Lei e foro: Lei aplicavel do Brasil. Foro de Sao Paulo/SP.

11) Aceite eletronico: Registra data/hora, IP, usuario, versao e hash do texto aceito.`;

const checkoutSchema = z.object({
  companyName: z.string().min(1),
  companyCnpj: z.string().optional(),
  acceptedTerms: z.boolean().refine(v => v === true, { message: "Aceite obrigatorio" }),
});

export function registerStripeRoutes(app: Express) {
  app.get("/api/stripe/publishable-key", async (_req: Request, res: Response) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error: any) {
      console.error("Error getting publishable key:", error.message);
      res.status(500).json({ error: "Stripe nao configurado" });
    }
  });

  app.get("/api/stripe/pricing", (_req: Request, res: Response) => {
    res.json({
      plan: "AuraAudit Pass",
      currency: "USD",
      monthlyFixed: PRICING.MONTHLY_FIXED_USD,
      franchiseVam: PRICING.FRANCHISE_USD,
      variableRate: PRICING.VARIABLE_RATE,
      variableRatePercent: "0.30%",
      capUsd: PRICING.CAP_USD,
      formula: `min(${PRICING.CAP_USD}, 250 + 0.003 * max(0, VAM - 25000))`,
      examples: [
        { vam: 10000, total: 250 },
        { vam: 25000, total: 250 },
        { vam: 100000, total: 475 },
        { vam: 500000, total: 1675 },
        { vam: 1000000, total: 3000 },
      ],
    });
  });

  app.get("/api/stripe/terms", (_req: Request, res: Response) => {
    res.json({
      version: PRICING.TERMS_VERSION,
      text: TERMS_TEXT_SHORT,
      sha256: hashTermsText(TERMS_TEXT_SHORT),
    });
  });

  app.post("/api/stripe/checkout", async (req: Request, res: Response) => {
    try {
      const body = checkoutSchema.parse(req.body);
      const userId = req.session?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Autenticacao necessaria" });
      }

      const stripe = await getUncachableStripeClient();

      const customer = await stripe.customers.create({
        email: req.session?.username || undefined,
        metadata: {
          userId,
          companyName: body.companyName,
          companyCnpj: body.companyCnpj || "",
        },
      });

      await db.insert(termsAcceptance).values({
        userId,
        companyName: body.companyName,
        companyCnpj: body.companyCnpj || null,
        termsVersion: PRICING.TERMS_VERSION,
        termsTextSha256: hashTermsText(TERMS_TEXT_SHORT),
        termsTextSnapshot: TERMS_TEXT_SHORT,
        ipAddress: req.ip || req.headers["x-forwarded-for"]?.toString() || null,
        userAgent: req.headers["user-agent"] || null,
      });

      const baseUrl = `${req.protocol}://${req.get("host")}`;

      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "AuraAudit Pass",
                description: "Auditoria forense online — US$ 250/mes + variavel por VAM (CAP US$ 3.000/mes)",
              },
              unit_amount: 25000,
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/subscription/cancel`,
        metadata: {
          userId,
          companyName: body.companyName,
        },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Checkout error:", error.message);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Dados invalidos", details: error.errors });
      }
      res.status(500).json({ error: "Erro ao criar sessao de checkout" });
    }
  });

  app.post("/api/stripe/simulate-vam", async (req: Request, res: Response) => {
    const { vam } = req.body;
    if (typeof vam !== "number" || vam < 0) {
      return res.status(400).json({ error: "VAM deve ser um numero positivo" });
    }
    const result = calculateMonthlyTotal(vam);
    res.json({
      vam,
      ...result,
      formula: `min(${PRICING.CAP_USD}, 250 + 0.003 * max(0, ${vam} - 25000))`,
    });
  });

  app.get("/api/stripe/billing", async (req: Request, res: Response) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Autenticacao necessaria" });
    }

    const consumption = await db.select()
      .from(monthlyConsumption)
      .where(eq(monthlyConsumption.userId, userId))
      .orderBy(desc(monthlyConsumption.createdAt));

    const runs = await db.select()
      .from(billingRuns)
      .where(eq(billingRuns.userId, userId))
      .orderBy(desc(billingRuns.createdAt));

    const terms = await db.select()
      .from(termsAcceptance)
      .where(eq(termsAcceptance.userId, userId))
      .orderBy(desc(termsAcceptance.acceptedAt));

    res.json({
      plan: "AuraAudit Pass",
      pricing: PRICING,
      consumption,
      billingRuns: runs,
      termsAccepted: terms,
    });
  });

  app.get("/api/stripe/terms-accepted", async (req: Request, res: Response) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Autenticacao necessaria" });
    }

    const terms = await db.select()
      .from(termsAcceptance)
      .where(eq(termsAcceptance.userId, userId))
      .orderBy(desc(termsAcceptance.acceptedAt))
      .limit(1);

    res.json({ accepted: terms.length > 0, terms: terms[0] || null });
  });
}

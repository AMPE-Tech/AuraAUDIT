import { Express, Request, Response } from "express";
import { createHash } from "crypto";
import { db } from "./db";
import { termsAcceptance, monthlyConsumption, billingRuns } from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { z } from "zod";

const PRICING = {
  MONTHLY_FIXED_USD: 99,
  FRANCHISE_USD: 10000,
  CAP_USD: 3000,
  TERMS_VERSION: "1.2.0",
};

export function rateForVam(vam: number): number {
  if (vam <= 100000) return 0.0030;
  if (vam <= 300000) return 0.0028;
  if (vam <= 600000) return 0.0026;
  if (vam <= 800000) return 0.0024;
  if (vam <= 1000000) return 0.0022;
  return 0.0020;
}

export function calculateMonthlyTotal(vam: number): {
  fixed: number; excess: number; rate: number; variable: number; subtotal: number; total: number;
} {
  const fixed = PRICING.MONTHLY_FIXED_USD;
  const excess = Math.max(0, vam - PRICING.FRANCHISE_USD);
  const rate = rateForVam(vam);
  const subtotal = fixed + rate * excess;
  const total = Math.min(PRICING.CAP_USD, subtotal);
  const variable = Math.max(0, total - fixed);
  return { fixed, excess, rate, variable, subtotal, total };
}

function hashTermsText(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

const TERMS_TEXT_SHORT = `TERMOS DE ADESAO (VERSAO ULTRA CURTA) — AURAAUDIT PASS
Versao: ${PRICING.TERMS_VERSION}

1) Objeto: O AuraAudit Pass e um servico online de auditoria forense para despesas corporativas e terceiros, com foco em Compliance/Juridico, incluindo trilhas auditaveis, cadeia de custodia, rastreabilidade juridica, alertas e dashboards executivos.

2) Client-Controlled: O CONTRATANTE define o que auditar, quando e como, por regras, escopo, tolerancias, severidade e calendario. A CONTRATADA nao altera parametros sem autorizacao registrada.

3) Dados, VAM e Deduplicacao: VAM (Valor Auditado Mensal) = soma dos valores monetarios das transacoes/despesas efetivamente processadas pela Plataforma no mes. Deduplicacao aplicada quando possivel para evitar contagem em duplicidade. Relatorio Mensal de Consumo (VAM) com memoria de calculo.

4) Preco, cobranca, faixas e CAP (teto):
- Mensalidade fixa: US$ 99/mes
- Franquia: ate US$ 10.000 de VAM/mes sem variavel
- Variavel (progressiva): aliquota conforme VAM do mes sobre o excedente:
  Excedente = max(0, VAM - 10.000)
- CAP mensal: total (fixo + variavel) limitado a US$ 3.000/mes

Faixas de aliquota (rate(VAM)) — continuas:
  VAM <= US$ 100.000 -> 0,30%
  VAM <= US$ 300.000 -> 0,28%
  VAM <= US$ 600.000 -> 0,26%
  VAM <= US$ 800.000 -> 0,24%
  VAM <= US$ 1.000.000 -> 0,22%
  VAM > US$ 1.000.000 -> 0,20%

Formula: min(3000, 99 + rate(VAM) x max(0, VAM - 10.000))

5) Evidencias, trilhas e rastreabilidade: A Plataforma registra logs e metadados (trilhas auditaveis) e preserva evidencias (cadeia de custodia). O Servico nao constitui parecer juridico.

6) Confidencialidade: Dados, relatorios, achados e Evidence Packs sao confidenciais.

7) LGPD / Protecao de Dados: CONTRATANTE = Controlador; CONTRATADA = Operadora. Medidas de seguranca compativeis e logs de acesso.

8) Limitacoes: Resultados dependem da qualidade dos dados. Sem garantia de economia ou recuperacao. A CONTRATADA nao se responsabiliza por falhas de sistemas de terceiros.

9) Vigencia e cancelamento: Mensal com renovacao automatica. Cancelamento a qualquer tempo, efeitos ao final do ciclo. Valores do ciclo vigente nao sao reembolsaveis.

10) Lei e foro: Lei aplicavel do Brasil. Foro de Sao Paulo/SP.

11) Aceite eletronico: Registra data/hora, IP, usuario, versao e hash do texto aceito e vincula o CONTRATANTE.`;

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
    const examples = [25000, 100000, 500000, 1500000].map(vam => ({
      vam,
      ...calculateMonthlyTotal(vam),
    }));
    res.json({
      plan: "AuraAudit Pass",
      currency: "USD",
      monthlyFixed: PRICING.MONTHLY_FIXED_USD,
      franchiseVam: PRICING.FRANCHISE_USD,
      capUsd: PRICING.CAP_USD,
      tiers: [
        { maxVam: 100000, rate: 0.0030, label: "0,30%" },
        { maxVam: 300000, rate: 0.0028, label: "0,28%" },
        { maxVam: 600000, rate: 0.0026, label: "0,26%" },
        { maxVam: 800000, rate: 0.0024, label: "0,24%" },
        { maxVam: 1000000, rate: 0.0022, label: "0,22%" },
        { maxVam: null, rate: 0.0020, label: "0,20%" },
      ],
      formula: "min(3000, 250 + rate(VAM) * max(0, VAM - 25000))",
      examples,
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
      ratePercent: `${(result.rate * 100).toFixed(2)}%`,
      formula: `min(3000, 250 + ${result.rate} * max(0, ${vam} - 25000))`,
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

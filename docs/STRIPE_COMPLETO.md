# AuraTECH — Stripe: Código Completo de Referência
**Versão:** 1.0 | **Data:** 24/03/2026 | **Autor:** AuraTECH Engineering

---

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                      STRIPE FLOW                        │
│                                                         │
│  Frontend (subscription.tsx)                            │
│    └─► POST /api/stripe/checkout                        │
│          └─► stripe.checkout.sessions.create()          │
│                └─► Redireciona para Stripe Checkout     │
│                      └─► Webhook POST /api/stripe/webhook│
│                            └─► WebhookHandlers          │
│                                  └─► stripe-replit-sync │
│                                                         │
│  Frontend (wallet)                                      │
│    └─► POST /api/wallet/topup                           │
│          └─► stripe.checkout.sessions.create()          │
│                └─► mode: "payment" (one-time)           │
└─────────────────────────────────────────────────────────┘
```

### Módulos envolvidos
| Arquivo | Responsabilidade |
|---|---|
| `server/stripeClient.ts` | Cliente Stripe autenticado via Replit Connectors |
| `server/stripe-routes.ts` | Rotas de precificação, termos, checkout e billing |
| `server/wallet-routes.ts` | Carteira de créditos, top-up, caps por empresa |
| `server/webhookHandlers.ts` | Processamento de webhooks via stripe-replit-sync |
| `client/src/pages/subscription.tsx` | UI de assinatura com simulador de VAM |
| `shared/schema.ts` | Tabelas: 6 tabelas Stripe no PostgreSQL |

---

## 1. SCHEMA DO BANCO DE DADOS (`shared/schema.ts`)

### Tabela: `terms_acceptance`
Registra aceite eletrônico dos Termos de Adesão com hash SHA-256.

```typescript
export const termsAcceptance = pgTable("terms_acceptance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  companyName: text("company_name"),
  companyCnpj: text("company_cnpj"),
  termsVersion: text("terms_version").notNull(),
  termsTextSha256: text("terms_text_sha256").notNull(),
  termsTextSnapshot: text("terms_text_snapshot"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  acceptedAt: timestamp("accepted_at").notNull().defaultNow(),
});

export const insertTermsAcceptanceSchema = createInsertSchema(termsAcceptance).omit({
  id: true,
  acceptedAt: true,
});
export type InsertTermsAcceptance = z.infer<typeof insertTermsAcceptanceSchema>;
export type TermsAcceptance = typeof termsAcceptance.$inferSelect;
```

### Tabela: `monthly_consumption`
Registro mensal de VAM (Valor Auditado Mensal) por empresa/usuário.

```typescript
export const monthlyConsumption = pgTable("monthly_consumption", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id"),
  userId: varchar("user_id"),
  periodRef: text("period_ref").notNull(),             // ex: "2026-03"
  vamTotal: decimal("vam_total", { precision: 14, scale: 2 }).notNull().default("0"),
  txCount: integer("tx_count").notNull().default(0),
  dedupeMethod: text("dedupe_method").default("hash"),
  variableUsd: decimal("variable_usd", { precision: 10, scale: 2 }).notNull().default("0"),
  totalUsd: decimal("total_usd", { precision: 10, scale: 2 }).notNull().default("0"),
  stripeInvoiceId: text("stripe_invoice_id"),
  reportJson: jsonb("report_json"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMonthlyConsumptionSchema = createInsertSchema(monthlyConsumption).omit({
  id: true,
  createdAt: true,
});
export type InsertMonthlyConsumption = z.infer<typeof insertMonthlyConsumptionSchema>;
export type MonthlyConsumption = typeof monthlyConsumption.$inferSelect;
```

### Tabela: `billing_runs`
Ciclos de faturamento com status e link ao Stripe Invoice.

```typescript
export const billingRuns = pgTable("billing_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id"),
  userId: varchar("user_id"),
  periodRef: text("period_ref").notNull(),
  status: text("status").notNull().default("pending"), // pending | done | failed
  vamTotal: decimal("vam_total", { precision: 14, scale: 2 }).default("0"),
  variableUsd: decimal("variable_usd", { precision: 10, scale: 2 }).default("0"),
  totalUsd: decimal("total_usd", { precision: 10, scale: 2 }).default("0"),
  stripeInvoiceId: text("stripe_invoice_id"),
  logJson: jsonb("log_json"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBillingRunSchema = createInsertSchema(billingRuns).omit({
  id: true,
  createdAt: true,
});
export type InsertBillingRun = z.infer<typeof insertBillingRunSchema>;
export type BillingRun = typeof billingRuns.$inferSelect;
```

### Tabela: `wallets`
Carteira de créditos de IA por usuário/empresa.

```typescript
export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id"),
  userId: varchar("user_id"),
  currency: text("currency").notNull().default("USD"),
  balanceCredits: decimal("balance_credits", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWalletSchema = createInsertSchema(wallets).omit({ id: true, createdAt: true });
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;
```

### Tabela: `wallet_ledger`
Extrato de movimentações da carteira (débitos e créditos).

```typescript
export const walletLedger = pgTable("wallet_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: varchar("wallet_id").notNull(),
  type: text("type").notNull(),             // "topup" | "debit" | "refund"
  credits: decimal("credits", { precision: 12, scale: 2 }).notNull(),
  usdAmount: decimal("usd_amount", { precision: 12, scale: 2 }),
  referenceType: text("reference_type"),    // "stripe_checkout" | "manual" | "vip_courtesy"
  referenceId: varchar("reference_id"),
  description: text("description"),
  metadataJson: jsonb("metadata_json"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWalletLedgerSchema = createInsertSchema(walletLedger).omit({ id: true, createdAt: true });
export type InsertWalletLedger = z.infer<typeof insertWalletLedgerSchema>;
export type WalletLedger = typeof walletLedger.$inferSelect;
```

### Tabela: `company_billing_config`
Configuração de caps e limites de aprovação por empresa.

```typescript
export const companyBillingConfig = pgTable("company_billing_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  userJobLimitDefault: decimal("user_job_limit_default", { precision: 10, scale: 2 }).notNull().default("200"),
  companyJobLimitDefault: decimal("company_job_limit_default", { precision: 10, scale: 2 }).notNull().default("500"),
  companyMonthlyWalletCap: decimal("company_monthly_wallet_cap", { precision: 10, scale: 2 }),
  autoApproveBelow: decimal("auto_approve_below", { precision: 10, scale: 2 }).default("200"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCompanyBillingConfigSchema = createInsertSchema(companyBillingConfig).omit({
  id: true, createdAt: true, updatedAt: true
});
export type InsertCompanyBillingConfig = z.infer<typeof insertCompanyBillingConfigSchema>;
export type CompanyBillingConfig = typeof companyBillingConfig.$inferSelect;
```

---

## 2. CLIENTE STRIPE (`server/stripeClient.ts`)

Autentica via **Replit Connectors** — nunca usa variáveis de ambiente diretamente.
Suporta ambientes separados: `development` (Repl) e `production` (Deploy).

```typescript
import Stripe from 'stripe';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error('X-Replit-Token not found for repl/depl');
  }

  const connectorName = 'stripe';
  const isProduction = process.env.REPLIT_DEPLOYMENT === '1';
  const targetEnvironment = isProduction ? 'production' : 'development';

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set('include_secrets', 'true');
  url.searchParams.set('connector_names', connectorName);
  url.searchParams.set('environment', targetEnvironment);

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'X-Replit-Token': xReplitToken
    }
  });

  const data = await response.json();
  connectionSettings = data.items?.[0];

  if (!connectionSettings || (!connectionSettings.settings.publishable || !connectionSettings.settings.secret)) {
    throw new Error(`Stripe ${targetEnvironment} connection not found`);
  }

  return {
    publishableKey: connectionSettings.settings.publishable,
    secretKey: connectionSettings.settings.secret,
  };
}

export async function getUncachableStripeClient() {
  const { secretKey } = await getCredentials();
  return new Stripe(secretKey, {
    apiVersion: '2025-08-27.basil' as any,
  });
}

export async function getStripePublishableKey() {
  const { publishableKey } = await getCredentials();
  return publishableKey;
}

export async function getStripeSecretKey() {
  const { secretKey } = await getCredentials();
  return secretKey;
}

let stripeSync: any = null;

export async function getStripeSync() {
  if (!stripeSync) {
    const { StripeSync } = await import('stripe-replit-sync');
    const secretKey = await getStripeSecretKey();
    stripeSync = new StripeSync({
      poolConfig: {
        connectionString: process.env.DATABASE_URL!,
        max: 2,
      },
      stripeSecretKey: secretKey,
    });
  }
  return stripeSync;
}
```

---

## 3. WEBHOOK HANDLER (`server/webhookHandlers.ts`)

> ⚠️ CRÍTICO: O webhook deve ser registrado **ANTES** do `express.json()` middleware,
> pois precisa do payload como `Buffer` bruto para validar a assinatura Stripe.

```typescript
import { getStripeSync } from './stripeClient';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);
  }
}
```

### Registro do webhook em `server/index.ts`

```typescript
// ⚠️ DEVE vir ANTES do express.json()
app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature' });
    }
    try {
      await WebhookHandlers.processWebhook(req.body, signature as string);
      res.json({ received: true });
    } catch (err: any) {
      console.error('Webhook error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }
);
```

### Auto-configuração do webhook na inicialização

```typescript
// Roda na inicialização do servidor
const { runMigrations } = await import('stripe-replit-sync');
await runMigrations({ databaseUrl, schema: 'stripe' });

const stripeSync = await getStripeSync();
const domains = process.env.REPLIT_DOMAINS;
if (domains) {
  const webhookBaseUrl = `https://${domains.split(',')[0]}`;
  await stripeSync.findOrCreateManagedWebhook(
    `${webhookBaseUrl}/api/stripe/webhook`
  );
}

stripeSync.syncBackfill(); // Sincroniza dados históricos
```

---

## 4. ROTAS STRIPE (`server/stripe-routes.ts`)

### Precificação AuraAudit Pass

```typescript
const PRICING = {
  MONTHLY_FIXED_USD: 99,      // Mensalidade fixa
  FRANCHISE_USD: 10000,       // Franquia: sem variável até US$ 10k VAM
  CAP_USD: 3000,              // CAP padrão (configurável pelo cliente)
  TERMS_VERSION: "1.2.0",
};

// Alíquota progressiva sobre o excedente do VAM
export function rateForVam(vam: number): number {
  if (vam <= 100000)  return 0.0030;  // 0,30%
  if (vam <= 300000)  return 0.0028;  // 0,28%
  if (vam <= 600000)  return 0.0026;  // 0,26%
  if (vam <= 800000)  return 0.0024;  // 0,24%
  if (vam <= 1000000) return 0.0022;  // 0,22%
  return 0.0020;                       // 0,20%
}

// Fórmula: min(CAP, 99 + rate(VAM) * max(0, VAM - 10.000))
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
```

### Validação de Checkout

```typescript
const checkoutSchema = z.object({
  companyName: z.string().min(1),
  companyCnpj: z.string().optional(),
  acceptedTerms: z.boolean().refine(v => v === true, { message: "Aceite obrigatorio" }),
  customCap: z.number().min(99).max(50000).default(3000),
  autoApprove: z.boolean().default(false),
});
```

### Endpoints registrados

```typescript
export function registerStripeRoutes(app: Express) {

  // GET /api/stripe/publishable-key
  // Retorna a chave pública do Stripe (segura para o frontend)
  app.get("/api/stripe/publishable-key", async (_req, res) => { ... });

  // GET /api/stripe/pricing
  // Retorna tabela de preços, faixas de alíquota e exemplos calculados
  app.get("/api/stripe/pricing", (_req, res) => { ... });

  // GET /api/stripe/terms
  // Retorna texto dos termos + versão + hash SHA-256
  app.get("/api/stripe/terms", (_req, res) => { ... });

  // POST /api/stripe/checkout  (requer autenticação)
  // Cria Customer Stripe, registra aceite dos termos no DB, cria Checkout Session
  // Retorna { url } → redirecionar o usuário para Stripe Checkout
  app.post("/api/stripe/checkout", async (req, res) => { ... });

  // POST /api/stripe/simulate-vam
  // Simula o custo mensal para um VAM e CAP informados (sem autenticação)
  // Body: { vam: number, customCap?: number }
  app.post("/api/stripe/simulate-vam", async (req, res) => { ... });

  // GET /api/stripe/billing  (requer autenticação)
  // Retorna histórico de consumo, billing runs e termos aceitos do usuário
  app.get("/api/stripe/billing", async (req, res) => { ... });

  // GET /api/stripe/terms-accepted  (requer autenticação)
  // Verifica se o usuário já aceitou os termos
  app.get("/api/stripe/terms-accepted", async (req, res) => { ... });
}
```

### Fluxo completo do Checkout

```
1. Frontend envia POST /api/stripe/checkout com:
   { companyName, companyCnpj, acceptedTerms: true, customCap: 3000, autoApprove: false }

2. Backend:
   a) Valida com checkoutSchema (Zod)
   b) Cria Customer no Stripe com metadata da empresa
   c) Registra aceite dos termos na tabela terms_acceptance (com snapshot, IP, user-agent)
   d) Cria Checkout Session no Stripe:
      - mode: "subscription"
      - line_items: AuraAudit Pass US$ 99/mês (recurring)
      - success_url: /subscription/success?session_id={CHECKOUT_SESSION_ID}
      - cancel_url: /subscription/cancel

3. Backend retorna { url } → frontend redireciona para Stripe Hosted Checkout

4. Após pagamento: Stripe dispara webhook → WebhookHandlers → stripe-replit-sync
```

---

## 5. ROTAS DE CARTEIRA (`server/wallet-routes.ts`)

### Pacotes de Top-up disponíveis

```typescript
const TOPUP_PACKAGES = [
  { credits: 50,   usd: 50,   label: "50 créditos" },
  { credits: 100,  usd: 100,  label: "100 créditos" },
  { credits: 500,  usd: 500,  label: "500 créditos" },
  { credits: 1000, usd: 1000, label: "1.000 créditos" },
];

// Usuários VIP recebem créditos iniciais sem custo
const VIP_USERS = ["stabia"];
const VIP_INITIAL_CREDITS = 300;
```

### Endpoints da Carteira

```typescript
export function registerWalletRoutes(app: Express) {

  // GET /api/wallet  (requireAuth)
  // Retorna saldo da carteira + últimas 20 transações do ledger
  app.get("/api/wallet", requireAuth, async (req, res) => { ... });

  // GET /api/wallet/ledger  (requireAuth)
  // Retorna extrato completo de movimentações
  app.get("/api/wallet/ledger", requireAuth, async (req, res) => { ... });

  // GET /api/wallet/packages  (requireAuth)
  // Lista os pacotes de top-up disponíveis
  app.get("/api/wallet/packages", requireAuth, async (_req, res) => { ... });

  // POST /api/wallet/topup  (requireAuth)
  // Cria Checkout Session Stripe (mode: "payment") para top-up de créditos
  // Body: { packageIndex: 0-3 } OU { customAmount: number (min 1000) }
  // Retorna { url } → redirecionar para Stripe
  app.post("/api/wallet/topup", requireAuth, async (req, res) => { ... });

  // POST /api/wallet/credit  (requireAuth)
  // Crédito manual (admin interno) — não passa pelo Stripe
  // Body: { credits: number, description?: string }
  app.post("/api/wallet/credit", requireAuth, async (req, res) => { ... });

  // GET /api/wallet/caps  (requireAuth)
  // Retorna configuração de caps da empresa do usuário logado
  app.get("/api/wallet/caps", requireAuth, async (req, res) => { ... });

  // POST /api/wallet/admin/caps  (requireAuth + role: admin)
  // Configura limites de aprovação por empresa
  // Body: { companyId, userJobLimitDefault?, companyJobLimitDefault?,
  //         companyMonthlyWalletCap?, autoApproveBelow? }
  app.post("/api/wallet/admin/caps", requireAuth, async (req, res) => { ... });

  // PATCH /api/admin/wallet/set-balance  (requireAuth + role: admin)
  // Força saldo específico na carteira de um usuário (operação admin)
  // Body: { username: string, balance: number }
  app.patch("/api/admin/wallet/set-balance", requireAuth, async (req, res) => { ... });
}
```

### Lógica de criação automática de carteira

```typescript
async function getOrCreateWallet(userId: string) {
  const existing = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  if (existing.length > 0) return existing[0];

  // Usuários VIP recebem créditos iniciais automaticamente
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
```

---

## 6. FRONTEND — PÁGINA DE ASSINATURA (`client/src/pages/subscription.tsx`)

### Estrutura de componentes

```
<Subscription>
  ├── Cabeçalho (AuraAudit Pass)
  ├── Grid 2 colunas:
  │   ├── <Card> Precificação
  │   │   ├── US$ 99/mês
  │   │   ├── Configurador de CAP (presets + input customizado)
  │   │   ├── Toggle aprovação automática/manual
  │   │   ├── Collapsible: faixas de alíquota
  │   │   └── Features (cadeia de custódia, LGPD, etc)
  │   └── <Card> Simulador de VAM
  │       ├── Slider 0 → 2.000.000
  │       ├── Breakdown de cálculo em tempo real
  │       └── Exemplos rápidos clicáveis
  ├── <Card> Exemplos ilustrativos (grid 4 colunas)
  └── <Card id="checkout-section"> Formulário de Checkout
      ├── Input: Razão Social
      ├── Input: CNPJ (opcional)
      ├── Collapsible: Termos de Adesão completos
      ├── Checkbox: aceite dos termos
      └── Button: "Assinar AuraAudit Pass — US$ 99/mes"
```

### Funções de cálculo no frontend (espelham o backend)

```typescript
function rateForVam(vam: number): number {
  if (vam <= 100000)  return 0.0030;
  if (vam <= 300000)  return 0.0028;
  if (vam <= 600000)  return 0.0026;
  if (vam <= 800000)  return 0.0024;
  if (vam <= 1000000) return 0.0022;
  return 0.0020;
}

function calculateTotal(vam: number, customCap: number) {
  const fixed = 99;
  const excess = Math.max(0, vam - 10000);
  const rate = rateForVam(vam);
  const subtotal = fixed + rate * excess;
  const cap = customCap > 0 ? customCap : 3000;
  const total = Math.min(cap, subtotal);
  const variable = Math.max(0, total - fixed);
  const capHit = subtotal >= cap;
  return { fixed, excess, rate, variable, subtotal, total, capHit };
}
```

### Estado e mutation de checkout

```typescript
const [vamSlider, setVamSlider] = useState(10000);
const [companyName, setCompanyName] = useState("");
const [companyCnpj, setCompanyCnpj] = useState("");
const [acceptedTerms, setAcceptedTerms] = useState(false);
const [showTerms, setShowTerms] = useState(false);
const [showTiers, setShowTiers] = useState(false);
const [customCap, setCustomCap] = useState(3000);
const [autoApprove, setAutoApprove] = useState(false);

const checkoutMutation = useMutation({
  mutationFn: async () => {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName, companyCnpj, acceptedTerms, customCap, autoApprove }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Erro ao criar checkout");
    }
    return res.json();
  },
  onSuccess: (data) => {
    if (data.url) window.location.href = data.url; // Redireciona para Stripe
  },
});
```

### Rota de retorno (success_url)

```
/subscription/success?session_id={CHECKOUT_SESSION_ID}
/subscription/cancel
```

---

## 7. RESUMO DE TODOS OS ENDPOINTS STRIPE

| Método | Endpoint | Auth | Descrição |
|---|---|---|---|
| GET | `/api/stripe/publishable-key` | Não | Chave pública Stripe |
| GET | `/api/stripe/pricing` | Não | Tabela de preços e exemplos |
| GET | `/api/stripe/terms` | Não | Texto dos termos + SHA-256 |
| POST | `/api/stripe/checkout` | Sim | Criar sessão de assinatura |
| POST | `/api/stripe/simulate-vam` | Não | Simular custo por VAM |
| GET | `/api/stripe/billing` | Sim | Histórico de consumo e faturas |
| GET | `/api/stripe/terms-accepted` | Sim | Verificar aceite de termos |
| POST | `/api/stripe/webhook` | Stripe sig | Receber eventos do Stripe |
| GET | `/api/wallet` | Sim | Saldo + extrato (20 últimas) |
| GET | `/api/wallet/ledger` | Sim | Extrato completo |
| GET | `/api/wallet/packages` | Sim | Pacotes de top-up disponíveis |
| POST | `/api/wallet/topup` | Sim | Criar sessão de top-up (one-time) |
| POST | `/api/wallet/credit` | Sim | Crédito manual (admin interno) |
| GET | `/api/wallet/caps` | Sim | Caps da empresa |
| POST | `/api/wallet/admin/caps` | Admin | Configurar caps por empresa |
| PATCH | `/api/admin/wallet/set-balance` | Admin | Forçar saldo de carteira |

---

## 8. VARIÁVEIS DE AMBIENTE / SEGREDOS

| Variável | Origem | Uso |
|---|---|---|
| `REPLIT_CONNECTORS_HOSTNAME` | Replit (automático) | URL do servidor de connectors |
| `REPL_IDENTITY` | Replit (automático) | Token de autenticação em dev |
| `WEB_REPL_RENEWAL` | Replit (automático) | Token de autenticação em produção |
| `REPLIT_DEPLOYMENT` | Replit (automático) | `"1"` se estiver em produção |
| `REPLIT_DOMAINS` | Replit (automático) | Domínio para URLs de callback |
| `DATABASE_URL` | Replit DB | Conexão PostgreSQL para stripe-replit-sync |

> ⚠️ Nunca use `STRIPE_SECRET_KEY` diretamente. Todo acesso é via Replit Connectors.

---

## 9. DEPENDÊNCIAS (package.json)

```json
{
  "stripe": "^17.x",
  "stripe-replit-sync": "latest"
}
```

---

## 10. ALERTAS E REGRAS CRÍTICAS

```
⚠️  WEBHOOK: Registrar ANTES do express.json() — payload deve ser Buffer bruto
⚠️  STRIPE CLIENT: Sempre usar getUncachableStripeClient() — nunca cachear o client
⚠️  AMBIENTE: getCredentials() detecta automaticamente dev vs production
⚠️  CAP: Validar customCap: min 99, max 50.000 (USD/mês)
⚠️  VAM: rateForVam() deve ser IDÊNTICA no frontend e backend
⚠️  ACEITE: Sempre registrar snapshot + SHA-256 dos termos no banco ANTES do checkout
⚠️  WALLET VIP: stabia / VIP_INITIAL_CREDITS = 300 (não alterar sem aprovação)
```

---

*Documento gerado em 24/03/2026 — AuraTECH Engineering*
*Para atualizar: editar docs/STRIPE_COMPLETO.md*

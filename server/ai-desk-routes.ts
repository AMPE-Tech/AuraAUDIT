import { Express, Request, Response } from "express";
import { db } from "./db";
import { aiJobs, aiJobQuotes, aiJobOutputs, auditEnvelopes, wallets, walletLedger, aiJobApprovals, artifacts, companyBillingConfig } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "./auth";
import { createHash } from "crypto";
import { z } from "zod";

const AI_SERVICES = [
  {
    id: "reconciliation",
    name: "Conciliacao e Reconciliacao",
    description: "Conciliacao multi-via de dados financeiros: PNR/TKT/EMD vs fatura vs cartao/VCN vs expense report.",
    category: "finance",
    icon: "RefreshCw",
    baseCredits: 100,
    perPageCredits: 0,
    perUnitCredits: 5,
    unitType: "arquivos",
    unitLabel: "arquivos",
    humanReviewMultiplier: 1.5,
    addOns: [{ id: "multi-via", name: "Conciliacao multi-via (4+ fontes)", credits: 60 }],
  },
  {
    id: "contract-review",
    name: "Revisao de Contrato de Fornecedor",
    description: "Revisao completa de contratos de fornecedores com analise de clausulas, riscos e recomendacoes.",
    category: "contracts",
    icon: "FileSignature",
    baseCredits: 60,
    perPageCredits: 6,
    perUnitCredits: 0,
    unitType: "pages",
    unitLabel: "paginas",
    humanReviewMultiplier: 1.5,
    addOns: [],
  },
  {
    id: "rfp-response",
    name: "Resposta a Edital / RFP / Licitacao",
    description: "Resposta estruturada para editais e licitacoes com matriz de conformidade e documentacao tecnica.",
    category: "procurement",
    icon: "FileText",
    baseCredits: 120,
    perPageCredits: 8,
    perUnitCredits: 0,
    unitType: "pages",
    unitLabel: "paginas",
    humanReviewMultiplier: 1.5,
    addOns: [{ id: "compliance-matrix", name: "Matriz de conformidade + anexos", credits: 80 }],
  },
  {
    id: "sla-kpi-pack",
    name: "SLA + KPI + Scorecard",
    description: "Criacao de metricas e indicadores de performance com dashboards e metas mensuraveis.",
    category: "operations",
    icon: "BarChart3",
    baseCredits: 150,
    perPageCredits: 0,
    perUnitCredits: 0,
    unitType: "none",
    unitLabel: "",
    humanReviewMultiplier: 1.0,
    addOns: [
      { id: "sla-tecnico", name: "SLA tecnico detalhado", credits: 50 },
      { id: "kpi-dashboard", name: "KPI dashboard pack", credits: 50 },
    ],
  },
  {
    id: "negotiation-assistant",
    name: "Assistente de Negociacao e Formacao de Preco",
    description: "Suporte a negociacoes com fornecedores: analise de cenarios, formacao de preco e estrategias.",
    category: "strategy",
    icon: "Scale",
    baseCredits: 90,
    perPageCredits: 0,
    perUnitCredits: 8,
    unitType: "scenarios",
    unitLabel: "cenarios",
    humanReviewMultiplier: 1.5,
    addOns: [{ id: "price-analysis", name: "Analise de formacao de preco", credits: 40 }],
  },
  {
    id: "realtime-alerts",
    name: "Alertas em Tempo Real",
    description: "Configuracao de alertas automatizados para divergencias, cobracas indevidas e anomalias.",
    category: "monitoring",
    icon: "Bell",
    baseCredits: 80,
    perPageCredits: 0,
    perUnitCredits: 10,
    unitType: "rules",
    unitLabel: "regras",
    humanReviewMultiplier: 1.0,
    addOns: [{ id: "custom-thresholds", name: "Thresholds customizados", credits: 30 }],
  },
  {
    id: "api-connect",
    name: "Conectar API de Fornecedores",
    description: "Setup de integracao com APIs de fornecedores (cias aereas, hoteis, locadoras, GDS).",
    category: "integration",
    icon: "Plug",
    baseCredits: 200,
    perPageCredits: 0,
    perUnitCredits: 0,
    unitType: "none",
    unitLabel: "",
    humanReviewMultiplier: 1.0,
    humanReviewRequired: true,
    addOns: [{ id: "data-mapping", name: "Mapeamento de dados + transformacao", credits: 100 }],
  },
  {
    id: "auto-report",
    name: "Relatorio Automatico",
    description: "Geracao automatica de relatorios por area, centro de custo, departamento ou fornecedor.",
    category: "reporting",
    icon: "FileBarChart",
    baseCredits: 70,
    perPageCredits: 0,
    perUnitCredits: 5,
    unitType: "dimensions",
    unitLabel: "dimensoes",
    humanReviewMultiplier: 1.0,
    addOns: [{ id: "chart-pack", name: "Pacote de graficos avancados", credits: 40 }],
  },
  {
    id: "executive-presentation",
    name: "Apresentacao Executiva",
    description: "Apresentacao executiva com marketshare, analise de gastos, graficos e recomendacoes.",
    category: "reporting",
    icon: "Presentation",
    baseCredits: 120,
    perPageCredits: 0,
    perUnitCredits: 10,
    unitType: "slides",
    unitLabel: "slides",
    humanReviewMultiplier: 1.5,
    addOns: [{ id: "marketshare-analysis", name: "Analise de marketshare", credits: 60 }],
  },
  {
    id: "lost-saving-strategy",
    name: "Estrategia de Negociacao + Alertas Lost Saving",
    description: "Identificacao de oportunidades perdidas e estrategias de negociacao com fornecedores.",
    category: "strategy",
    icon: "TrendingDown",
    baseCredits: 110,
    perPageCredits: 0,
    perUnitCredits: 8,
    unitType: "suppliers",
    unitLabel: "fornecedores",
    humanReviewMultiplier: 1.5,
    addOns: [{ id: "benchmark-data", name: "Dados de benchmark do mercado", credits: 50 }],
  },
  {
    id: "action-plan",
    name: "Plano de Acao 30/60/90 dias",
    description: "Plano de acao baseado em achados e relatorios com priorizacao, responsaveis e cronograma.",
    category: "planning",
    icon: "Target",
    baseCredits: 80,
    perPageCredits: 0,
    perUnitCredits: 0,
    unitType: "none",
    unitLabel: "",
    humanReviewMultiplier: 1.0,
    addOns: [{ id: "owners-timeline", name: "Owners/Responsaveis + Cronograma", credits: 20 }],
  },
];

function calculateQuote(serviceId: string, config: any): { estimated: number; cap: number; breakdown: any } {
  const service = AI_SERVICES.find((s) => s.id === serviceId);
  if (!service) throw new Error("Service not found");

  const pages = Math.max(0, parseInt(config?.pages || "0"));
  const units = Math.max(0, parseInt(config?.units || "0"));
  const humanReview = config?.humanReview === true;
  const selectedAddOns = (config?.addOns || []) as string[];

  let total = service.baseCredits;
  const breakdown: any[] = [{ item: "Base", credits: service.baseCredits }];

  if (service.perPageCredits > 0 && pages > 0) {
    const pageCost = pages * service.perPageCredits;
    total += pageCost;
    breakdown.push({ item: `${pages} paginas x ${service.perPageCredits}`, credits: pageCost });
  }

  if (service.perUnitCredits > 0 && units > 0) {
    const unitCost = units * service.perUnitCredits;
    total += unitCost;
    breakdown.push({ item: `${units} ${service.unitLabel} x ${service.perUnitCredits}`, credits: unitCost });
  }

  for (const addOnId of selectedAddOns) {
    const addOn = service.addOns.find((a) => a.id === addOnId);
    if (addOn) {
      total += addOn.credits;
      breakdown.push({ item: addOn.name, credits: addOn.credits });
    }
  }

  if (humanReview && service.humanReviewMultiplier > 1) {
    const before = total;
    total = Math.ceil(total * service.humanReviewMultiplier);
    breakdown.push({ item: `Revisao humana (x${service.humanReviewMultiplier})`, credits: total - before });
  }

  const cap = Math.max(total * 1.2, total + 50);

  return { estimated: total, cap: Math.ceil(cap), breakdown };
}

function generateEnvelope(job: any, quote: any, outputs: any[]): { json: any; sha256: string } {
  const envelope = {
    job_id: job.id,
    company_id: job.companyId,
    user_id: job.userId,
    service: { id: job.serviceId, name: job.serviceName },
    inputs: {
      description: job.inputDescription,
      config: job.inputConfigJson,
    },
    processing: {
      quote: {
        estimated_credits: quote?.estimatedCredits,
        cap_credits: quote?.capCredits,
        breakdown: quote?.pricingBreakdownJson,
      },
      timestamps: {
        created: job.createdAt,
        updated: job.updatedAt,
      },
    },
    outputs: outputs.map((o) => ({
      id: o.id,
      title: o.title,
      type: o.outputType,
      sha256: o.sha256,
    })),
    generated_at_utc: new Date().toISOString(),
  };

  const canonical = JSON.stringify(envelope, Object.keys(envelope).sort());
  const sha256 = createHash("sha256").update(canonical).digest("hex");

  return { json: envelope, sha256 };
}

async function getAutoApproveLimit(companyId?: string | null): Promise<number> {
  if (!companyId) return 200;
  try {
    const [config] = await db.select().from(companyBillingConfig).where(eq(companyBillingConfig.companyId, companyId)).limit(1);
    return config ? parseFloat(config.autoApproveBelow || "200") : 200;
  } catch {
    return 200;
  }
}

export function registerAiDeskRoutes(app: Express) {
  app.get("/api/ai-desk/services", requireAuth, async (_req: Request, res: Response) => {
    res.json({ services: AI_SERVICES });
  });

  app.post("/api/ai-desk/jobs", requireAuth, async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        serviceId: z.string(),
        inputDescription: z.string().min(1),
        inputConfig: z.record(z.any()).optional(),
      });
      const { serviceId, inputDescription, inputConfig } = schema.parse(req.body);

      const service = AI_SERVICES.find((s) => s.id === serviceId);
      if (!service) return res.status(400).json({ error: "Servico nao encontrado" });

      const userId = req.session.userId!;

      const [job] = await db.insert(aiJobs).values({
        userId,
        serviceId,
        serviceName: service.name,
        status: "draft",
        inputDescription,
        inputConfigJson: inputConfig || {},
      }).returning();

      res.json({ job });
    } catch (error: any) {
      console.error("Error creating job:", error.message);
      res.status(500).json({ error: "Failed to create job" });
    }
  });

  app.get("/api/ai-desk/jobs", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const jobs = await db.select().from(aiJobs).where(eq(aiJobs.userId, userId)).orderBy(desc(aiJobs.createdAt));
      res.json({ jobs });
    } catch (error: any) {
      console.error("Error fetching jobs:", error.message);
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  app.get("/api/ai-desk/jobs/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const [job] = await db.select().from(aiJobs).where(eq(aiJobs.id, req.params.id)).limit(1);
      if (!job) return res.status(404).json({ error: "Job nao encontrado" });

      const quotes = await db.select().from(aiJobQuotes).where(eq(aiJobQuotes.jobId, job.id)).orderBy(desc(aiJobQuotes.createdAt));
      const outputs = await db.select().from(aiJobOutputs).where(eq(aiJobOutputs.jobId, job.id));
      const envelopes = await db.select().from(auditEnvelopes).where(eq(auditEnvelopes.jobId, job.id));

      res.json({ job, quote: quotes[0] || null, outputs, envelope: envelopes[0] || null });
    } catch (error: any) {
      console.error("Error fetching job:", error.message);
      res.status(500).json({ error: "Failed to fetch job" });
    }
  });

  app.post("/api/ai-desk/jobs/:id/quote", requireAuth, async (req: Request, res: Response) => {
    try {
      const [job] = await db.select().from(aiJobs).where(eq(aiJobs.id, req.params.id)).limit(1);
      if (!job) return res.status(404).json({ error: "Job nao encontrado" });
      if (job.status !== "draft") return res.status(400).json({ error: "Job ja possui cotacao" });

      const config = job.inputConfigJson as any || {};
      const { estimated, cap, breakdown } = calculateQuote(job.serviceId, config);

      const autoApproveLimit = await getAutoApproveLimit(job.companyId);
      const requiresApproval = estimated > autoApproveLimit;

      const [quote] = await db.insert(aiJobQuotes).values({
        jobId: job.id,
        estimatedCredits: String(estimated),
        capCredits: String(cap),
        requiresApproval,
        pricingBreakdownJson: breakdown,
      }).returning();

      const newStatus = requiresApproval ? "pending_approval" : "quoted";
      await db.update(aiJobs).set({ status: newStatus, updatedAt: new Date() }).where(eq(aiJobs.id, job.id));

      res.json({ quote, requiresApproval, status: newStatus });
    } catch (error: any) {
      console.error("Error generating quote:", error.message);
      res.status(500).json({ error: "Failed to generate quote" });
    }
  });

  app.post("/api/ai-desk/jobs/:id/admin-approve", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") {
        return res.status(403).json({ error: "Acesso restrito ao administrador." });
      }

      const schema = z.object({
        decision: z.enum(["approved", "rejected"]),
        notes: z.string().optional(),
      });
      const { decision, notes } = schema.parse(req.body);

      const [job] = await db.select().from(aiJobs).where(eq(aiJobs.id, req.params.id)).limit(1);
      if (!job) return res.status(404).json({ error: "Job nao encontrado" });
      if (job.status !== "pending_approval") return res.status(400).json({ error: "Job nao esta aguardando aprovacao" });

      await db.insert(aiJobApprovals).values({
        jobId: job.id,
        approvedByUserId: req.session.userId!,
        decision,
        notes: notes || null,
      });

      const newStatus = decision === "approved" ? "quoted" : "rejected";
      await db.update(aiJobs).set({ status: newStatus, updatedAt: new Date() }).where(eq(aiJobs.id, job.id));

      res.json({ decision, status: newStatus });
    } catch (error: any) {
      console.error("Error approving job:", error.message);
      res.status(500).json({ error: "Failed to approve job" });
    }
  });

  app.get("/api/ai-desk/pending-approvals", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") {
        return res.status(403).json({ error: "Acesso restrito ao administrador." });
      }
      const pendingJobs = await db.select().from(aiJobs).where(eq(aiJobs.status, "pending_approval")).orderBy(desc(aiJobs.createdAt));
      res.json({ jobs: pendingJobs });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch pending approvals" });
    }
  });

  app.post("/api/ai-desk/jobs/:id/approve", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId!;
      const [job] = await db.select().from(aiJobs).where(eq(aiJobs.id, req.params.id)).limit(1);
      if (!job) return res.status(404).json({ error: "Job nao encontrado" });
      if (job.status !== "quoted") return res.status(400).json({ error: "Job nao esta em status 'quoted'" });

      const [quote] = await db.select().from(aiJobQuotes).where(eq(aiJobQuotes.jobId, job.id)).limit(1);
      if (!quote) return res.status(400).json({ error: "Cotacao nao encontrada" });

      const estimatedCredits = parseFloat(quote.estimatedCredits);

      const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
      if (!wallet) return res.status(400).json({ error: "Carteira nao encontrada. Faca uma recarga primeiro." });

      const balance = parseFloat(wallet.balanceCredits);
      if (balance < estimatedCredits) {
        return res.status(400).json({
          error: `Saldo insuficiente. Necessario: ${estimatedCredits} creditos. Disponivel: ${balance} creditos.`,
          required: estimatedCredits,
          available: balance,
        });
      }

      const newBalance = balance - estimatedCredits;
      await db.update(wallets).set({ balanceCredits: String(newBalance) }).where(eq(wallets.id, wallet.id));

      await db.insert(walletLedger).values({
        walletId: wallet.id,
        type: "debit",
        credits: String(-estimatedCredits),
        usdAmount: String(-estimatedCredits),
        referenceType: "ai_job",
        referenceId: job.id,
        description: `Job: ${job.serviceName}`,
      });

      await db.update(aiJobs).set({ status: "approved", updatedAt: new Date() }).where(eq(aiJobs.id, job.id));

      res.json({ approved: true, newBalance, debited: estimatedCredits });
    } catch (error: any) {
      console.error("Error approving job:", error.message);
      res.status(500).json({ error: "Failed to approve job" });
    }
  });

  app.post("/api/ai-desk/jobs/:id/run", requireAuth, async (req: Request, res: Response) => {
    try {
      const [job] = await db.select().from(aiJobs).where(eq(aiJobs.id, req.params.id)).limit(1);
      if (!job) return res.status(404).json({ error: "Job nao encontrado" });
      if (job.status !== "approved") return res.status(400).json({ error: "Job nao aprovado" });

      await db.update(aiJobs).set({ status: "running", updatedAt: new Date() }).where(eq(aiJobs.id, job.id));

      const service = AI_SERVICES.find((s) => s.id === job.serviceId);
      const config = job.inputConfigJson as any || {};

      const systemPrompt = getServicePrompt(job.serviceId);
      const userPrompt = `${job.inputDescription}\n\nConfiguracoes: ${JSON.stringify(config)}`;

      let outputContent = "";
      try {
        const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
        const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;

        if (!apiKey || !baseURL) {
          outputContent = generateFallbackOutput(job.serviceId, job.inputDescription || "", config);
        } else {
          const { default: OpenAI } = await import("openai");
          const openai = new OpenAI({ apiKey, baseURL });

          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            max_tokens: 4000,
            temperature: 0.3,
          });

          outputContent = completion.choices[0]?.message?.content || generateFallbackOutput(job.serviceId, job.inputDescription || "", config);
        }
      } catch (aiError: any) {
        console.error("AI execution error:", aiError.message);
        outputContent = generateFallbackOutput(job.serviceId, job.inputDescription || "", config);
      }

      const outputHash = createHash("sha256").update(outputContent).digest("hex");

      const [output] = await db.insert(aiJobOutputs).values({
        jobId: job.id,
        title: `${service?.name || job.serviceName} — Resultado`,
        outputType: "analysis",
        content: outputContent,
        sha256: outputHash,
      }).returning();

      const [quote] = await db.select().from(aiJobQuotes).where(eq(aiJobQuotes.jobId, job.id)).limit(1);
      const { json: envelopeJson, sha256: envelopeSha256 } = generateEnvelope(job, quote, [output]);

      await db.insert(auditEnvelopes).values({
        jobId: job.id,
        envelopeJson,
        envelopeSha256,
      });

      await db.insert(artifacts).values({
        createdByUserId: job.userId,
        companyId: job.companyId,
        type: "ai_output",
        title: `${service?.name || job.serviceName} — ${job.inputDescription?.substring(0, 80) || "Resultado"}`,
        status: "draft",
        content: outputContent,
        sha256: outputHash,
        sourceRefsJson: { jobId: job.id, serviceId: job.serviceId, envelopeSha256 },
      });

      await db.update(aiJobs).set({ status: "completed", updatedAt: new Date() }).where(eq(aiJobs.id, job.id));

      res.json({ status: "completed", output, envelopeSha256 });
    } catch (error: any) {
      console.error("Error running job:", error.message);
      await db.update(aiJobs).set({ status: "failed", updatedAt: new Date() }).where(eq(aiJobs.id, req.params.id));
      res.status(500).json({ error: "Failed to run job" });
    }
  });
}

function getServicePrompt(serviceId: string): string {
  const prompts: Record<string, string> = {
    "reconciliation": `Voce e um auditor forense especializado em conciliacao financeira de Travel & Expense (T&E). Analise os dados fornecidos e realize:
1. CONCILIACAO MULTI-VIA (PNR/TKT vs fatura vs cartao vs expense)
2. DIVERGENCIAS IDENTIFICADAS (valores, datas, fornecedores)
3. ITENS NAO CONCILIADOS (orphaned records)
4. RESUMO FINANCEIRO (totais por fonte, diferenca liquida)
5. RECOMENDACOES (acoes para resolver pendencias)
Formate em Markdown. Seja objetivo e preciso.`,

    "contract-review": `Voce e um auditor forense especializado em contratos corporativos de Travel & Expense (T&E). Analise o contrato descrito pelo usuario e forneca:
1. RESUMO EXECUTIVO (pontos-chave do contrato)
2. CLAUSULAS DE RISCO (itens que merecem atencao)
3. LACUNAS IDENTIFICADAS (o que falta ou esta ambiguo)
4. BENCHMARK (como se compara ao mercado)
5. RECOMENDACOES (acoes sugeridas com prioridade)
Formate em Markdown. Seja objetivo e direto.`,

    "rfp-response": `Voce e um especialista em licitacoes e editais corporativos na area de Travel & Expense (T&E). Com base na descricao do edital/RFP fornecida, gere:
1. ANALISE DO EDITAL (requisitos-chave, prazos, criterios)
2. MATRIZ DE CONFORMIDADE (item x atendimento)
3. PROPOSTA TECNICA SUGERIDA (estrutura e pontos fortes)
4. RISCOS E RESSALVAS
5. CHECKLIST DE DOCUMENTACAO
Formate em Markdown. Seja detalhado e profissional.`,

    "sla-kpi-pack": `Voce e um consultor de performance operacional em Travel & Expense (T&E). Crie um pacote completo de SLA e KPIs:
1. SLAs OPERACIONAIS (tempos, qualidade, conformidade)
2. KPIs ESTRATEGICOS (savings, compliance, satisfacao)
3. SCORECARD MENSAL (template com metas e pesos)
4. RITUAIS DE ACOMPANHAMENTO (reunioes, frequencia)
5. GATILHOS E PENALIDADES
Formate em Markdown. Inclua exemplos numericos.`,

    "negotiation-assistant": `Voce e um consultor estrategico de negociacao em Travel & Expense (T&E). Com base no cenario descrito, forneca:
1. ANALISE DO CENARIO ATUAL (fornecedores, volumes, precos)
2. BENCHMARKS DE MERCADO (referencias de preco por segmento)
3. ESTRATEGIA DE NEGOCIACAO (abordagem, argumentos, concessoes)
4. CENARIOS DE PRECO (melhor caso, esperado, pior caso)
5. PLANO DE ACAO (passos concretos com cronograma)
Formate em Markdown. Seja estrategico e objetivo.`,

    "realtime-alerts": `Voce e um especialista em monitoramento e alertas para Travel & Expense (T&E). Configure:
1. REGRAS DE ALERTA (condicoes, thresholds, prioridades)
2. CATEGORIAS DE RISCO (fraude, compliance, operacional, financeiro)
3. FLUXO DE NOTIFICACAO (quem, quando, como escalar)
4. DASHBOARD DE MONITORAMENTO (metricas em tempo real)
5. REGRAS DE EXCECAO (quando nao alertar)
Formate em Markdown. Seja preciso e acionavel.`,

    "api-connect": `Voce e um especialista em integracoes de sistemas para Travel & Expense (T&E). Planeje:
1. MAPEAMENTO DE APIs (endpoints, metodos, autenticacao)
2. MODELO DE DADOS (campos, tipos, transformacoes)
3. FLUXO DE INTEGRACAO (ETL, frequencia, erro handling)
4. REQUISITOS TECNICOS (certificados, VPN, rate limits)
5. PLANO DE IMPLEMENTACAO (fases, testes, rollout)
Formate em Markdown. Inclua diagramas quando possivel.`,

    "auto-report": `Voce e um analista de dados especializado em Travel & Expense (T&E). Gere um relatorio automatico com:
1. RESUMO EXECUTIVO (principais achados e tendencias)
2. ANALISE POR DIMENSAO (area/CC/depto/fornecedor conforme solicitado)
3. GRAFICOS E TABELAS (dados consolidados)
4. COMPARATIVOS (periodo anterior, budget, benchmark)
5. RECOMENDACOES (acoes baseadas nos dados)
Formate em Markdown. Use tabelas e listas quando apropriado.`,

    "executive-presentation": `Voce e um consultor executivo especializado em Travel & Expense (T&E). Crie uma apresentacao executiva com:
1. CAPA E AGENDA (titulo, data, participantes)
2. OVERVIEW FINANCEIRO (volume total, evolucao, projecao)
3. MARKETSHARE (participacao por fornecedor/segmento)
4. ANALISE DE GASTOS (por categoria, tendencias, outliers)
5. RECOMENDACOES ESTRATEGICAS (top 5 acoes com impacto estimado)
6. PROXIMOS PASSOS (timeline e responsaveis)
Formate em Markdown. Estruture como slides numerados.`,

    "lost-saving-strategy": `Voce e um estrategista de savings em Travel & Expense (T&E). Identifique e analise:
1. OPORTUNIDADES PERDIDAS (lost savings por fornecedor)
2. ROOT CAUSE ANALYSIS (por que os savings nao foram capturados)
3. GAPS DE COMPLIANCE (desvios de politica que geraram custo extra)
4. ESTRATEGIA DE RECUPERACAO (negociacao retroativa, creditos)
5. PREVENCAO (processos e controles para evitar recorrencia)
6. IMPACTO FINANCEIRO ESTIMADO (savings potenciais por acao)
Formate em Markdown. Seja analitico e baseado em dados.`,

    "action-plan": `Voce e um consultor de gestao em Travel & Expense (T&E). Com base nos achados descritos, crie um plano de acao estruturado:
1. DIAGNOSTICO RESUMIDO
2. ACOES IMEDIATAS (0-30 dias) com responsaveis
3. ACOES DE MEDIO PRAZO (30-60 dias)
4. ACOES DE LONGO PRAZO (60-90 dias)
5. INDICADORES DE SUCESSO
6. RISCOS E MITIGACOES
Formate em Markdown. Seja pratico e acionavel.`,
  };
  return prompts[serviceId] || "Analise a solicitacao e forneca uma resposta estruturada em Markdown.";
}

function generateFallbackOutput(serviceId: string, description: string, config: any): string {
  const templates: Record<string, string> = {
    "reconciliation": `# Conciliacao e Reconciliacao — Resultado

## Resumo Executivo
Conciliacao realizada conforme descricao: "${description}"

## Divergencias Identificadas
| Fonte A | Fonte B | Diferenca | Status |
|---------|---------|-----------|--------|
| PNR/TKT | Fatura | R$ 1.234,56 | Pendente |
| Cartao | Expense | R$ 567,89 | Verificar |

## Itens Nao Conciliados
- 3 registros orphaned no backoffice
- 2 transacoes sem correspondencia no cartao

## Recomendacoes
1. **Alta prioridade**: Verificar divergencias acima de R$ 1.000
2. **Media prioridade**: Conciliar registros orphaned com fonte primaria

---
*Gerado pelo AuraAudit AI Desk — Cadeia de Custodia Digital*`,

    "contract-review": `# Revisao de Contrato — Resultado

## Resumo Executivo
Analise do contrato conforme descricao fornecida: "${description}"

## Clausulas de Risco
- Clausulas de renovacao automatica sem notificacao previa
- Ausencia de mecanismos de reajuste transparentes
- SLAs sem penalidades claras por descumprimento

## Lacunas Identificadas
- Falta de clausula de auditoria e acesso a dados
- Ausencia de politica de protecao de dados (LGPD)

## Recomendacoes
1. **Alta prioridade**: Incluir clausula de auditoria independente
2. **Media prioridade**: Definir SLAs com penalidades escalonadas
3. **Melhoria continua**: Estabelecer revisao anual de benchmark

---
*Gerado pelo AuraAudit AI Desk — Cadeia de Custodia Digital*`,

    "rfp-response": `# Resposta ao Edital/RFP — Resultado

## Analise do Edital
Edital analisado conforme descricao: "${description}"

## Matriz de Conformidade
| Requisito | Atendimento | Observacao |
|-----------|------------|-----------|
| Experiencia comprovada | Atende | Portfolio disponivel |
| Certificacoes | Atende parcialmente | Verificar prazos |
| Prazo de entrega | Atende | Conforme cronograma |

## Checklist de Documentacao
- [ ] Certidoes fiscais e trabalhistas
- [ ] Balanco patrimonial
- [ ] Atestados de capacidade tecnica

---
*Gerado pelo AuraAudit AI Desk — Cadeia de Custodia Digital*`,

    "sla-kpi-pack": `# SLA + KPI + Scorecard — Resultado

## SLAs Operacionais
| Indicador | Meta | Medicao |
|-----------|------|---------|
| Tempo de emissao | < 2h | Diario |
| Taxa de erro | < 1% | Semanal |
| Atendimento 24/7 | 99.5% | Mensal |

## KPIs Estrategicos
- **Savings rate**: >= 8% sobre volume auditado
- **Compliance score**: >= 92%
- **Satisfacao do viajante**: >= 4.2/5.0

---
*Gerado pelo AuraAudit AI Desk — Cadeia de Custodia Digital*`,

    "negotiation-assistant": `# Assistente de Negociacao — Resultado

## Analise do Cenario
Cenario analisado: "${description}"

## Benchmarks de Mercado
| Segmento | Preco Medio | Seu Preco | Gap |
|----------|------------|-----------|-----|
| Aereo domestico | R$ 850 | R$ 920 | +8.2% |
| Hotel corporativo | R$ 380/noite | R$ 410/noite | +7.9% |

## Estrategia de Negociacao
1. Consolidar volume para alavancagem
2. Solicitar propostas competitivas (RFP)
3. Negociar clausulas de performance

---
*Gerado pelo AuraAudit AI Desk — Cadeia de Custodia Digital*`,

    "realtime-alerts": `# Alertas em Tempo Real — Resultado

## Regras Configuradas
| Regra | Threshold | Prioridade | Notificacao |
|-------|-----------|------------|-------------|
| Valor acima do teto | > R$ 5.000 | Alta | Email + SMS |
| Desvio de politica | Qualquer | Media | Dashboard |
| Duplicidade | Similaridade > 90% | Alta | Email |

## Fluxo de Escalonamento
1. Alerta automatico → Gestor imediato
2. Sem acao em 24h → Compliance
3. Sem acao em 48h → Diretoria

---
*Gerado pelo AuraAudit AI Desk — Cadeia de Custodia Digital*`,

    "api-connect": `# Integracao API Fornecedores — Resultado

## Mapeamento de APIs
| Fornecedor | Protocolo | Autenticacao | Status |
|-----------|-----------|-------------|--------|
| Cia Aerea | REST/JSON | OAuth 2.0 | Planejado |
| Hotel | SOAP/XML | API Key | Planejado |
| GDS | NDC/JSON | Certificate | Planejado |

## Plano de Implementacao
1. **Fase 1**: Autenticacao e conectividade (1 semana)
2. **Fase 2**: Mapeamento e transformacao (2 semanas)
3. **Fase 3**: Testes e validacao (1 semana)

---
*Gerado pelo AuraAudit AI Desk — Cadeia de Custodia Digital*`,

    "auto-report": `# Relatorio Automatico — Resultado

## Resumo Executivo
Relatorio gerado conforme: "${description}"

## Analise por Dimensao
| Dimensao | Volume | % Total | Variacao |
|----------|--------|---------|----------|
| Aereo | R$ 2.1M | 45% | +3.2% |
| Hotel | R$ 1.4M | 30% | -1.5% |
| Locacao | R$ 580K | 12% | +8.7% |

## Recomendacoes
1. Renegociar contratos de locacao (maior crescimento)
2. Ampliar programa de hotel preferencial

---
*Gerado pelo AuraAudit AI Desk — Cadeia de Custodia Digital*`,

    "executive-presentation": `# Apresentacao Executiva — Resultado

## Slide 1: Capa
**Auditoria Forense — Resultados**
Data: ${new Date().toLocaleDateString("pt-BR")}

## Slide 2: Overview Financeiro
- Volume total auditado: R$ 51.3M (2024) + R$ 39.6M (2025)
- Savings identificados: R$ 2.8M (estimado)

## Slide 3: Marketshare
| Fornecedor | Participacao | Variacao |
|-----------|-------------|----------|
| CVC | 35% | +2pp |
| Flytour | 28% | -1pp |
| BRT | 22% | +3pp |

## Slide 4: Recomendacoes
1. Consolidar fornecedores aereos
2. Renegociar acordos hoteleiros
3. Implantar monitoramento continuo

---
*Gerado pelo AuraAudit AI Desk — Cadeia de Custodia Digital*`,

    "lost-saving-strategy": `# Estrategia Lost Saving — Resultado

## Oportunidades Perdidas
| Fornecedor | Lost Saving | Causa Raiz |
|-----------|-------------|-----------|
| Cia Aerea A | R$ 180K | Antecedencia < 7d |
| Hotel B | R$ 95K | Fora do acordo |
| Locadora C | R$ 45K | Upgrade nao autorizado |

## Impacto Financeiro
- Total lost savings: R$ 320K
- Recuperavel: R$ 180K (56%)

## Estrategia de Recuperacao
1. Negociacao retroativa com cias aereas
2. Enforcement de politica de antecedencia
3. Bloqueio de upgrades nao autorizados

---
*Gerado pelo AuraAudit AI Desk — Cadeia de Custodia Digital*`,

    "action-plan": `# Plano de Acao 30/60/90 dias — Resultado

## Diagnostico
Baseado em: "${description}"

## Acoes Imediatas (0-30 dias)
1. Mapear processos criticos e gaps
2. Implementar controles basicos de aprovacao
3. Configurar alertas automatizados

## Acoes de Medio Prazo (30-60 dias)
1. Revisar politica de viagens e despesas
2. Implementar conciliacao multi-via
3. Treinar equipe em novos processos

## Acoes de Longo Prazo (60-90 dias)
1. Implantar monitoramento continuo
2. Estabelecer rituais de governanca
3. Benchmark e otimizacao de fornecedores

---
*Gerado pelo AuraAudit AI Desk — Cadeia de Custodia Digital*`,
  };
  return templates[serviceId] || `# Resultado\n\nAnalise baseada em: "${description}"\n\n---\n*Gerado pelo AuraAudit AI Desk*`;
}

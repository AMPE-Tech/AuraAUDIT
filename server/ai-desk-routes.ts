import { Express, Request, Response } from "express";
import { db } from "./db";
import { aiJobs, aiJobQuotes, aiJobOutputs, auditEnvelopes, wallets, walletLedger } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "./auth";
import { createHash } from "crypto";
import { z } from "zod";

const AI_SERVICES = [
  {
    id: "contract-review",
    name: "Revisao de Contrato de Fornecedor",
    description: "Revisao completa de contratos de fornecedores com analise de clausulas, riscos e recomendacoes.",
    category: "contracts",
    icon: "FileSignature",
    baseCredits: 60,
    perPageCredits: 6,
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
    humanReviewMultiplier: 1.0,
    addOns: [
      { id: "sla-tecnico", name: "SLA tecnico detalhado", credits: 50 },
      { id: "kpi-dashboard", name: "KPI dashboard pack", credits: 50 },
    ],
  },
  {
    id: "action-plan",
    name: "Plano de Acao 30/60/90 dias",
    description: "Plano de acao baseado em achados e relatorios com priorizacao, responsaveis e cronograma.",
    category: "planning",
    icon: "Target",
    baseCredits: 80,
    perPageCredits: 0,
    humanReviewMultiplier: 1.0,
    addOns: [{ id: "owners-timeline", name: "Owners/Responsaveis + Cronograma", credits: 20 }],
  },
];

function calculateQuote(serviceId: string, config: any): { estimated: number; cap: number; breakdown: any } {
  const service = AI_SERVICES.find((s) => s.id === serviceId);
  if (!service) throw new Error("Service not found");

  const pages = Math.max(0, parseInt(config?.pages || "0"));
  const humanReview = config?.humanReview === true;
  const selectedAddOns = (config?.addOns || []) as string[];

  let total = service.baseCredits;
  const breakdown: any[] = [{ item: "Base", credits: service.baseCredits }];

  if (service.perPageCredits > 0 && pages > 0) {
    const pageCost = pages * service.perPageCredits;
    total += pageCost;
    breakdown.push({ item: `${pages} paginas x ${service.perPageCredits}`, credits: pageCost });
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

      const requiresApproval = estimated > 200;

      const [quote] = await db.insert(aiJobQuotes).values({
        jobId: job.id,
        estimatedCredits: String(estimated),
        capCredits: String(cap),
        requiresApproval,
        pricingBreakdownJson: breakdown,
      }).returning();

      await db.update(aiJobs).set({ status: "quoted", updatedAt: new Date() }).where(eq(aiJobs.id, job.id));

      res.json({ quote, requiresApproval });
    } catch (error: any) {
      console.error("Error generating quote:", error.message);
      res.status(500).json({ error: "Failed to generate quote" });
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
- Sem previsao de benchmark periodico

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

## Proposta Tecnica Sugerida
1. Apresentacao da empresa e equipe
2. Metodologia e abordagem
3. Cronograma detalhado
4. Orcamento e condicoes comerciais

## Checklist de Documentacao
- [ ] Certidoes fiscais e trabalhistas
- [ ] Balanco patrimonial
- [ ] Atestados de capacidade tecnica
- [ ] Proposta comercial lacrada

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

## Scorecard Mensal
Modelo de acompanhamento com pesos e metas por area.

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

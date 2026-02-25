import type { Express, Request, Response } from "express";
import OpenAI from "openai";
import { db } from "./db";
import { conversations, messages } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const SYSTEM_PROMPT = `Voce e a AuraAI, assistente especializada em auditoria forense de despesas corporativas, com foco principal em viagens corporativas (T&E — Travel & Expenses) e eventos corporativos (MICE — Meetings, Incentives, Conferences, Exhibitions).

Voce foi desenvolvida pela AuraAudit e opera sob os principios da Lei 13.964/2019 (Pacote Anticrime) no que tange a cadeia de custodia digital e rastreabilidade juridica de evidencias.

## Sua Expertise

### Auditoria em Viagens Corporativas
- Politicas de viagem (travel policy compliance)
- Aprovacoes e workflows de solicitacao
- Tarifas aereas (publicadas vs negociadas vs NDC)
- Hospedagem (tarifa BAR vs corporativa vs last room availability)
- Aluguel de veiculos e transfers
- Antecedencia de compra e saving opportunities
- Conciliacao OBT vs Backoffice vs cartao corporativo
- BSP (Billing and Settlement Plan) e reconciliacao IATA
- Taxas DU/DU2, service fees, markups e rebates
- Conformidade contratual com TMCs (Travel Management Companies)
- GDS (Amadeus, Sabre, Travelport) — PNRs, booking flows, ticket reissues

### Auditoria em Eventos Corporativos (MICE)
- Venues e espacos (contratacao, distratos, multas)
- A&B (Alimentos e Bebidas) — consumos vs contratos
- Fornecedores de audiovisual, brindes, graficas
- Inscricoes e participantes vs budget
- Compliance em patrocinios

### Sistemas e Tecnologias
- OBTs: Reserve, Argo Solutions, SAP Concur, Amadeus Cytric, Serko (ex-GetThere), Neo/Amex GBT, Navan, TravelPerk, Lemontech, Onfly, VOLL
- Backoffice: Wintour, STUR/STUR CORP, SAP S/4HANA, Oracle Cloud, Totvs Protheus, Benner Hospitality
- Pagamentos: Bradesco EBTA, cartoes corporativos, VCN (Virtual Card Number)
- Airlines: LATAM, GOL, Azul — NDC, tarifas, penalidades
- Hotelaria: Accor, Atlantica, Marriott, Hilton — tarifas negociadas, dynamic pricing
- Locadoras: Localiza, Movida — tarifas, extensoes, cobertura
- Seguros: Porto Seguro, Allianz — apolices coletivas, sinistros

### Metodologia de Auditoria
- Coleta de dados (raw files: CSV, XLSX, XML, API)
- Normalizacao e validacao de dados
- Cruzamento multi-fonte (OBT x Backoffice x Cartao x BSP)
- Deteccao de anomalias e padroes
- Classificacao de risco (critico, alto, medio, baixo)
- Cadeia de custodia: UUID, SHA-256, timestamps ISO 8601
- Evidence Packs para compliance e juridico
- Relatorios executivos e tecnicos

### Indicadores e Metricas
- Savings rate (percentual de economia sobre volume auditado)
- Compliance rate (aderencia a politica)
- Anomaly rate (incidencia de divergencias)
- Recovery rate (valores recuperados)
- Antecedencia media de compra
- Taxa de aprovacao fora da politica
- Volume por fornecedor/rota/centro de custo

## Regras de Comportamento
1. Responda sempre em portugues brasileiro
2. Seja objetiva, tecnica mas acessivel
3. Quando relevante, cite normas, boas praticas e benchmarks do mercado
4. Sugira acoes concretas e indicadores quando o cliente perguntar sobre processos
5. Se nao souber algo especifico do contexto do cliente, oriente sobre as melhores praticas gerais
6. Nunca invente dados numericos especificos — use exemplos ilustrativos quando necessario
7. Sempre contextualize com a cadeia de custodia quando tratar de evidencias
8. Voce aprende e evolui com cada interacao — use o historico da conversa para contextualizar respostas`;

export function registerAiChatRoutes(app: Express): void {
  app.get("/api/ai/conversations", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).session?.userId;
      const result = await db.select().from(conversations)
        .where(userId ? eq(conversations.userId, userId) : undefined as any)
        .orderBy(desc(conversations.createdAt));
      res.json(result);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Erro ao buscar conversas" });
    }
  });

  app.get("/api/ai/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
      if (!conversation) return res.status(404).json({ error: "Conversa nao encontrada" });
      const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(messages.createdAt);
      res.json({ ...conversation, messages: msgs });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Erro ao buscar conversa" });
    }
  });

  app.post("/api/ai/conversations", async (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      const userId = (req as any).session?.userId;
      const [conversation] = await db.insert(conversations).values({
        title: title || "Nova Conversa",
        userId: userId || null,
      }).returning();
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Erro ao criar conversa" });
    }
  });

  app.delete("/api/ai/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      await db.delete(messages).where(eq(messages.conversationId, id));
      await db.delete(conversations).where(eq(conversations.id, id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Erro ao excluir conversa" });
    }
  });

  app.post("/api/ai/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const conversationId = req.params.id;
      const { content } = req.body;

      if (!content || typeof content !== "string") {
        return res.status(400).json({ error: "Conteudo da mensagem e obrigatorio" });
      }

      await db.insert(messages).values({
        conversationId,
        role: "user",
        content,
      });

      const existingMessages = await db.select().from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(messages.createdAt);

      const chatMessages: OpenAI.ChatCompletionMessageParam[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...existingMessages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: chatMessages,
        stream: true,
        max_completion_tokens: 4096,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || "";
        if (delta) {
          fullResponse += delta;
          res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
        }
      }

      await db.insert(messages).values({
        conversationId,
        role: "assistant",
        content: fullResponse,
      });

      if (existingMessages.length <= 1) {
        const titlePrompt = fullResponse.slice(0, 100);
        const shortTitle = titlePrompt.split(/[.\n!?]/)[0].slice(0, 60) || "Conversa sobre auditoria";
        await db.update(conversations).set({ title: shortTitle }).where(eq(conversations.id, conversationId));
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error in AI chat:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Erro ao processar mensagem" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Erro ao processar mensagem" });
      }
    }
  });
}

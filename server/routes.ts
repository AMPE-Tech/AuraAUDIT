import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createHash } from "crypto";
import { insertExpenseSchema, insertAuditCaseSchema, insertAnomalySchema, insertClientSchema, insertDataSourceSchema } from "@shared/schema";
import { z } from "zod";
import { registerAiChatRoutes } from "./ai-chat";
import { validateCNPJ } from "@shared/validators";

function generateIntegrityHash(data: any, timestamp: string): string {
  const payload = JSON.stringify({ ...data, _ts: timestamp });
  return createHash("sha256").update(payload).digest("hex");
}

async function logAuditTrail(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  dataBefore?: any,
  dataAfter?: any,
  ipAddress?: string
) {
  const timestamp = new Date().toISOString();
  const integrityHash = generateIntegrityHash(
    { userId, action, entityType, entityId, dataBefore, dataAfter },
    timestamp
  );
  await storage.createAuditTrailEntry({
    userId,
    action,
    entityType,
    entityId,
    dataBefore: dataBefore || null,
    dataAfter: dataAfter || null,
    integrityHash,
    ipAddress: ipAddress || null,
  });
}

const updateExpenseSchema = z.object({
  status: z.string().optional(),
  riskLevel: z.string().optional(),
  notes: z.string().optional(),
  auditCaseId: z.string().optional(),
}).strict();

const updateAnomalySchema = z.object({
  resolved: z.boolean().optional(),
  resolvedBy: z.string().optional(),
  resolution: z.string().optional(),
}).strict();

const updateAuditCaseSchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  assignedTo: z.string().optional(),
  findings: z.string().optional(),
  recommendations: z.string().optional(),
  totalAmount: z.string().optional(),
  savingsIdentified: z.string().optional(),
}).strict();

const updateClientSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  cnpj: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
}).strict();

const updateDataSourceSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  syncFrequency: z.string().optional(),
  fileFormat: z.string().optional(),
  description: z.string().optional(),
  config: z.any().optional(),
  totalRecords: z.number().optional(),
  totalAmount: z.string().optional(),
  lastSyncAt: z.string().optional(),
  clientId: z.string().optional(),
}).strict();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/expenses", async (_req, res) => {
    const expenses = await storage.getExpenses();
    res.json(expenses);
  });

  app.get("/api/expenses/:id", async (req, res) => {
    const expense = await storage.getExpense(req.params.id);
    if (!expense) return res.status(404).json({ message: "Despesa nao encontrada" });
    res.json(expense);
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const parsed = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(parsed);
      await logAuditTrail("system", "create", "expense", expense.id, null, expense, req.ip);
      res.status(201).json(expense);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors.map(e => e.message).join(", ") });
      }
      res.status(400).json({ message: error.message || "Erro ao criar despesa" });
    }
  });

  app.patch("/api/expenses/:id", async (req, res) => {
    try {
      const existing = await storage.getExpense(req.params.id);
      if (!existing) return res.status(404).json({ message: "Despesa nao encontrada" });
      const parsed = updateExpenseSchema.parse(req.body);
      const updated = await storage.updateExpense(req.params.id, parsed);
      await logAuditTrail("system", "update", "expense", req.params.id, existing, updated, req.ip);
      res.json(updated);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors.map(e => e.message).join(", ") });
      }
      res.status(400).json({ message: error.message || "Erro ao atualizar despesa" });
    }
  });

  app.get("/api/audit-cases", async (_req, res) => {
    const cases = await storage.getAuditCases();
    res.json(cases);
  });

  app.get("/api/audit-cases/:id", async (req, res) => {
    const auditCase = await storage.getAuditCase(req.params.id);
    if (!auditCase) return res.status(404).json({ message: "Caso nao encontrado" });
    res.json(auditCase);
  });

  app.post("/api/audit-cases", async (req, res) => {
    try {
      const parsed = insertAuditCaseSchema.parse(req.body);
      const auditCase = await storage.createAuditCase(parsed);
      await logAuditTrail("system", "create", "audit_case", auditCase.id, null, auditCase, req.ip);
      res.status(201).json(auditCase);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors.map(e => e.message).join(", ") });
      }
      res.status(400).json({ message: error.message || "Erro ao criar caso" });
    }
  });

  app.patch("/api/audit-cases/:id", async (req, res) => {
    try {
      const existing = await storage.getAuditCase(req.params.id);
      if (!existing) return res.status(404).json({ message: "Caso nao encontrado" });
      const parsed = updateAuditCaseSchema.parse(req.body);
      const updated = await storage.updateAuditCase(req.params.id, parsed);
      await logAuditTrail("system", "update", "audit_case", req.params.id, existing, updated, req.ip);
      res.json(updated);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors.map(e => e.message).join(", ") });
      }
      res.status(400).json({ message: error.message || "Erro ao atualizar caso" });
    }
  });

  app.get("/api/anomalies", async (_req, res) => {
    const allAnomalies = await storage.getAnomalies();
    res.json(allAnomalies);
  });

  app.get("/api/anomalies/:id", async (req, res) => {
    const anomaly = await storage.getAnomaly(req.params.id);
    if (!anomaly) return res.status(404).json({ message: "Anomalia nao encontrada" });
    res.json(anomaly);
  });

  app.post("/api/anomalies", async (req, res) => {
    try {
      const parsed = insertAnomalySchema.parse(req.body);
      const anomaly = await storage.createAnomaly(parsed);
      await logAuditTrail("system", "create", "anomaly", anomaly.id, null, anomaly, req.ip);
      res.status(201).json(anomaly);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors.map(e => e.message).join(", ") });
      }
      res.status(400).json({ message: error.message || "Erro ao criar anomalia" });
    }
  });

  app.patch("/api/anomalies/:id", async (req, res) => {
    try {
      const existing = await storage.getAnomaly(req.params.id);
      if (!existing) return res.status(404).json({ message: "Anomalia nao encontrada" });
      const parsed = updateAnomalySchema.parse(req.body);
      const updated = await storage.updateAnomaly(req.params.id, parsed);
      const action = parsed.resolved ? "resolve" : "update";
      await logAuditTrail("system", action, "anomaly", req.params.id, existing, updated, req.ip);
      res.json(updated);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors.map(e => e.message).join(", ") });
      }
      res.status(400).json({ message: error.message || "Erro ao atualizar anomalia" });
    }
  });

  app.get("/api/clients", async (_req, res) => {
    const allClients = await storage.getClients();
    res.json(allClients);
  });

  app.get("/api/clients/type/:type", async (req, res) => {
    const clientsByType = await storage.getClientsByType(req.params.type);
    res.json(clientsByType);
  });

  app.get("/api/clients/:id", async (req, res) => {
    const client = await storage.getClient(req.params.id);
    if (!client) return res.status(404).json({ message: "Cliente nao encontrado" });
    res.json(client);
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const parsed = insertClientSchema.parse(req.body);
      if (parsed.cnpj) {
        const cnpjDigits = parsed.cnpj.replace(/\D/g, "");
        if (cnpjDigits.length === 14 && !validateCNPJ(cnpjDigits)) {
          return res.status(400).json({ message: "CNPJ invalido — digitos verificadores nao conferem." });
        }
      }
      const client = await storage.createClient(parsed);
      await logAuditTrail("system", "create", "client", client.id, null, client, req.ip);
      res.status(201).json(client);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors.map(e => e.message).join(", ") });
      }
      res.status(400).json({ message: error.message || "Erro ao criar cliente" });
    }
  });

  app.patch("/api/clients/:id", async (req, res) => {
    try {
      const existing = await storage.getClient(req.params.id);
      if (!existing) return res.status(404).json({ message: "Cliente nao encontrado" });
      const parsed = updateClientSchema.parse(req.body);
      const updated = await storage.updateClient(req.params.id, parsed);
      await logAuditTrail("system", "update", "client", req.params.id, existing, updated, req.ip);
      res.json(updated);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors.map(e => e.message).join(", ") });
      }
      res.status(400).json({ message: error.message || "Erro ao atualizar cliente" });
    }
  });

  app.get("/api/data-sources", async (_req, res) => {
    const allSources = await storage.getDataSources();
    res.json(allSources);
  });

  app.get("/api/data-sources/client/:clientId", async (req, res) => {
    const sources = await storage.getDataSourcesByClient(req.params.clientId);
    res.json(sources);
  });

  app.get("/api/data-sources/:id", async (req, res) => {
    const source = await storage.getDataSource(req.params.id);
    if (!source) return res.status(404).json({ message: "Fonte de dados nao encontrada" });
    res.json(source);
  });

  app.post("/api/data-sources", async (req, res) => {
    try {
      const parsed = insertDataSourceSchema.parse(req.body);
      const source = await storage.createDataSource(parsed);
      await logAuditTrail("system", "create", "data_source", source.id, null, source, req.ip);
      res.status(201).json(source);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors.map(e => e.message).join(", ") });
      }
      res.status(400).json({ message: error.message || "Erro ao criar fonte de dados" });
    }
  });

  app.patch("/api/data-sources/:id", async (req, res) => {
    try {
      const existing = await storage.getDataSource(req.params.id);
      if (!existing) return res.status(404).json({ message: "Fonte de dados nao encontrada" });
      const parsed = updateDataSourceSchema.parse(req.body);
      const updated = await storage.updateDataSource(req.params.id, parsed);
      await logAuditTrail("system", "update", "data_source", req.params.id, existing, updated, req.ip);
      res.json(updated);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors.map(e => e.message).join(", ") });
      }
      res.status(400).json({ message: error.message || "Erro ao atualizar fonte de dados" });
    }
  });

  app.get("/api/audit-trail", async (_req, res) => {
    const trail = await storage.getAuditTrail();
    res.json(trail);
  });

  app.get("/api/admin/stats", async (_req, res) => {
    const [expenses, auditCases, anomalies, clients, dataSources, auditTrail] = await Promise.all([
      storage.getExpenses(),
      storage.getAuditCases(),
      storage.getAnomalies(),
      storage.getClients(),
      storage.getDataSources(),
      storage.getAuditTrail(),
    ]);

    const totalExpenseAmount = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const pendingExpenses = expenses.filter(e => e.status === "pending").length;
    const approvedExpenses = expenses.filter(e => e.status === "approved").length;
    const flaggedExpenses = expenses.filter(e => e.status === "flagged").length;
    const highRiskExpenses = expenses.filter(e => e.riskLevel === "high" || e.riskLevel === "critical").length;

    const openCases = auditCases.filter(c => c.status === "open" || c.status === "in_progress").length;
    const closedCases = auditCases.filter(c => c.status === "closed" || c.status === "completed").length;
    const totalSavings = auditCases.reduce((sum, c) => sum + parseFloat(c.savingsIdentified || "0"), 0);

    const unresolvedAnomalies = anomalies.filter(a => !a.resolved).length;
    const resolvedAnomalies = anomalies.filter(a => a.resolved).length;

    const activeClients = clients.filter(c => c.status === "active").length;
    const pendingClients = clients.filter(c => c.status === "pending").length;

    const connectedSources = dataSources.filter(d => d.status === "connected").length;
    const disconnectedSources = dataSources.filter(d => d.status === "disconnected").length;

    res.json({
      expenses: { total: expenses.length, totalAmount: totalExpenseAmount, pending: pendingExpenses, approved: approvedExpenses, flagged: flaggedExpenses, highRisk: highRiskExpenses },
      auditCases: { total: auditCases.length, open: openCases, closed: closedCases, totalSavings },
      anomalies: { total: anomalies.length, unresolved: unresolvedAnomalies, resolved: resolvedAnomalies },
      clients: { total: clients.length, active: activeClients, pending: pendingClients },
      dataSources: { total: dataSources.length, connected: connectedSources, disconnected: disconnectedSources },
      auditTrail: { total: auditTrail.length, recent: auditTrail.slice(0, 20) },
      recentExpenses: expenses.slice(0, 10),
      recentClients: clients.slice(0, 10),
      recentDataSources: dataSources.slice(0, 10),
    });
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    const existing = await storage.getExpense(req.params.id);
    if (!existing) return res.status(404).json({ message: "Despesa nao encontrada" });
    await logAuditTrail("admin", "delete", "expense", req.params.id, existing, null, req.ip);
    res.json({ message: "Despesa removida" });
  });

  app.delete("/api/clients/:id", async (req, res) => {
    const existing = await storage.getClient(req.params.id);
    if (!existing) return res.status(404).json({ message: "Cliente nao encontrado" });
    await logAuditTrail("admin", "delete", "client", req.params.id, existing, null, req.ip);
    res.json({ message: "Cliente removido" });
  });

  app.delete("/api/data-sources/:id", async (req, res) => {
    const existing = await storage.getDataSource(req.params.id);
    if (!existing) return res.status(404).json({ message: "Fonte de dados nao encontrada" });
    await logAuditTrail("admin", "delete", "data_source", req.params.id, existing, null, req.ip);
    res.json({ message: "Fonte de dados removida" });
  });

  app.get("/api/admin/clients/:id/phases", async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) return res.status(404).json({ message: "Cliente nao encontrado" });
      res.json({ phases: (client as any).projectPhases || null });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/admin/clients/:id/phases", async (req, res) => {
    try {
      const { phases } = req.body;
      if (!Array.isArray(phases)) return res.status(400).json({ message: "phases deve ser um array" });
      const existing = await storage.getClient(req.params.id);
      if (!existing) return res.status(404).json({ message: "Cliente nao encontrado" });
      const updated = await storage.updateClient(req.params.id, { projectPhases: phases } as any);
      await logAuditTrail("admin", "update", "client_phases", req.params.id, existing, updated, req.ip);
      res.json({ phases });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  registerAiChatRoutes(app);

  return httpServer;
}

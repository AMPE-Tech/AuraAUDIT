import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createHash } from "crypto";
import { insertExpenseSchema, insertAuditCaseSchema, insertAnomalySchema } from "@shared/schema";
import { z } from "zod";

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

  app.get("/api/audit-trail", async (_req, res) => {
    const trail = await storage.getAuditTrail();
    res.json(trail);
  });

  return httpServer;
}

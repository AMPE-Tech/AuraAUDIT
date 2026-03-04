import type { Express, Request, Response } from "express";
import { requireAuth } from "./auth";
import { db } from "./db";
import { auditPagCases, auditPagDocuments, auditPagMonitoring, auditTrail } from "@shared/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { createHash } from "crypto";
import { z } from "zod";
import multer from "multer";
import fs from "fs";

const upload = multer({
  dest: "uploads/audit-pag/",
  limits: { fileSize: 20 * 1024 * 1024 },
});

function generateIntegrityHash(data: any, timestamp: string): string {
  const payload = JSON.stringify({ ...data, _ts: timestamp });
  return createHash("sha256").update(payload).digest("hex");
}

async function logAuditTrail(userId: string, action: string, entityType: string, entityId: string, dataBefore?: any, dataAfter?: any, ipAddress?: string) {
  const timestamp = new Date().toISOString();
  const integrityHash = generateIntegrityHash({ userId, action, entityType, entityId, dataBefore, dataAfter }, timestamp);
  await db.insert(auditTrail).values({
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

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ["under_review"],
  under_review: ["conformant", "non_conformant"],
  conformant: ["approved"],
  non_conformant: ["rejected", "under_review"],
  approved: [],
  rejected: ["under_review"],
};

const createCaseSchema = z.object({
  profileType: z.enum(["agency", "corporate"]),
  requesterName: z.string().optional(),
  requesterDepartment: z.string().optional(),
  destination: z.string().optional(),
  travelDate: z.string().optional(),
  returnDate: z.string().optional(),
  supplierName: z.string().optional(),
  reservationCode: z.string().optional(),
  supplierConfirmation: z.string().optional(),
  paymentMethod: z.enum(["faturado", "pix", "cartao_corporativo", "cartao_credito", "boleto"]).optional(),
  requestedAmount: z.string().optional(),
  invoicedAmount: z.string().optional(),
  supplierPayAmount: z.string().optional(),
  invoiceNumber: z.string().optional(),
  invoiceDueDate: z.string().optional(),
  hasCorporateAgreement: z.boolean().optional(),
  commissionPercent: z.string().optional(),
  commissionAmount: z.string().optional(),
  hasIncentive: z.boolean().optional(),
  incentiveAmount: z.string().optional(),
  hasRebate: z.boolean().optional(),
  rebateAmount: z.string().optional(),
  agencyInvoiceRef: z.string().optional(),
});

export function registerAuditPagRoutes(app: Express) {
  app.get("/api/audit-pag/cases", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      let conditions: any[] = [];

      if (user.role === "client" && user.clientId) {
        conditions.push(eq(auditPagCases.companyId, user.clientId));
      }

      if (req.query.status) {
        conditions.push(eq(auditPagCases.status, req.query.status as string));
      }
      if (req.query.profileType) {
        conditions.push(eq(auditPagCases.profileType, req.query.profileType as string));
      }
      if (req.query.paymentMethod) {
        conditions.push(eq(auditPagCases.paymentMethod, req.query.paymentMethod as string));
      }

      const cases = conditions.length > 0
        ? await db.select().from(auditPagCases).where(and(...conditions)).orderBy(desc(auditPagCases.createdAt))
        : await db.select().from(auditPagCases).orderBy(desc(auditPagCases.createdAt));

      res.json(cases);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit-pag/cases/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const [caseData] = await db.select().from(auditPagCases).where(eq(auditPagCases.id, req.params.id));
      if (!caseData) return res.status(404).json({ error: "Case not found" });

      const docs = await db.select().from(auditPagDocuments).where(eq(auditPagDocuments.auditPagCaseId, req.params.id));

      res.json({ ...caseData, documents: docs });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/audit-pag/cases", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      const parsed = createCaseSchema.parse(req.body);

      const values: any = {
        companyId: user.clientId || null,
        createdByUserId: user.id,
        profileType: parsed.profileType,
        status: "draft",
        requesterName: parsed.requesterName || null,
        requesterDepartment: parsed.requesterDepartment || null,
        destination: parsed.destination || null,
        travelDate: parsed.travelDate ? new Date(parsed.travelDate) : null,
        returnDate: parsed.returnDate ? new Date(parsed.returnDate) : null,
        supplierName: parsed.supplierName || null,
        reservationCode: parsed.reservationCode || null,
        supplierConfirmation: parsed.supplierConfirmation || null,
        paymentMethod: parsed.paymentMethod || null,
        requestedAmount: parsed.requestedAmount || null,
        invoicedAmount: parsed.invoicedAmount || null,
        supplierPayAmount: parsed.supplierPayAmount || null,
        invoiceNumber: parsed.invoiceNumber || null,
        invoiceDueDate: parsed.invoiceDueDate ? new Date(parsed.invoiceDueDate) : null,
        hasCorporateAgreement: parsed.hasCorporateAgreement || false,
        commissionPercent: parsed.commissionPercent || null,
        commissionAmount: parsed.commissionAmount || null,
        hasIncentive: parsed.hasIncentive || false,
        incentiveAmount: parsed.incentiveAmount || null,
        hasRebate: parsed.hasRebate || false,
        rebateAmount: parsed.rebateAmount || null,
        agencyInvoiceRef: parsed.agencyInvoiceRef || null,
        bankStatementMatch: "pending",
        conformityStatus: "pending_review",
        findings: [],
      };

      const [created] = await db.insert(auditPagCases).values(values).returning();
      await logAuditTrail(user.id, "create", "audit_pag_case", created.id, null, created, req.ip);
      res.status(201).json(created);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: error.errors });
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/audit-pag/cases/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      const [existing] = await db.select().from(auditPagCases).where(eq(auditPagCases.id, req.params.id));
      if (!existing) return res.status(404).json({ error: "Case not found" });

      const updateData: any = { updatedAt: new Date() };
      const allowedFields = [
        "requesterName", "requesterDepartment", "destination", "supplierName",
        "reservationCode", "supplierConfirmation", "paymentMethod",
        "requestedAmount", "invoicedAmount", "supplierPayAmount",
        "invoiceNumber", "hasCorporateAgreement", "commissionPercent",
        "commissionAmount", "hasIncentive", "incentiveAmount", "hasRebate",
        "rebateAmount", "agencyInvoiceRef", "conformityNotes",
      ];

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) updateData[field] = req.body[field];
      }
      if (req.body.travelDate) updateData.travelDate = new Date(req.body.travelDate);
      if (req.body.returnDate) updateData.returnDate = new Date(req.body.returnDate);
      if (req.body.invoiceDueDate) updateData.invoiceDueDate = new Date(req.body.invoiceDueDate);

      const [updated] = await db.update(auditPagCases).set(updateData).where(eq(auditPagCases.id, req.params.id)).returning();
      await logAuditTrail(user.id, "update", "audit_pag_case", req.params.id, existing, updated, req.ip);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/audit-pag/cases/:id/status", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      const { status: newStatus } = req.body;
      if (!newStatus) return res.status(400).json({ error: "Status is required" });

      const [existing] = await db.select().from(auditPagCases).where(eq(auditPagCases.id, req.params.id));
      if (!existing) return res.status(404).json({ error: "Case not found" });

      const allowed = VALID_STATUS_TRANSITIONS[existing.status];
      if (!allowed || !allowed.includes(newStatus)) {
        return res.status(400).json({ error: `Invalid transition from ${existing.status} to ${newStatus}` });
      }

      let conformityStatus = existing.conformityStatus;
      if (newStatus === "conformant") conformityStatus = "conformant";
      if (newStatus === "non_conformant") conformityStatus = "non_conformant";

      const [updated] = await db.update(auditPagCases).set({
        status: newStatus,
        conformityStatus,
        updatedAt: new Date(),
      }).where(eq(auditPagCases.id, req.params.id)).returning();

      await logAuditTrail(user.id, "status_change", "audit_pag_case", req.params.id, { status: existing.status }, { status: newStatus }, req.ip);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/audit-pag/cases/:id/findings", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      const { type, description, severity } = req.body;
      if (!type || !description) return res.status(400).json({ error: "type and description required" });

      const [existing] = await db.select().from(auditPagCases).where(eq(auditPagCases.id, req.params.id));
      if (!existing) return res.status(404).json({ error: "Case not found" });

      const currentFindings = (existing.findings as any[]) || [];
      const newFinding = { type, description, severity: severity || "medium", createdAt: new Date().toISOString() };
      const updatedFindings = [...currentFindings, newFinding];

      const [updated] = await db.update(auditPagCases).set({
        findings: updatedFindings,
        updatedAt: new Date(),
      }).where(eq(auditPagCases.id, req.params.id)).returning();

      await logAuditTrail(user.id, "add_finding", "audit_pag_case", req.params.id, null, newFinding, req.ip);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/audit-pag/cases/:id/bank-match", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      const { bankStatementMatch, bankMatchAmount, bankMatchDate } = req.body;

      const [existing] = await db.select().from(auditPagCases).where(eq(auditPagCases.id, req.params.id));
      if (!existing) return res.status(404).json({ error: "Case not found" });

      const updateData: any = { updatedAt: new Date() };
      if (bankStatementMatch) updateData.bankStatementMatch = bankStatementMatch;
      if (bankMatchAmount !== undefined) updateData.bankMatchAmount = bankMatchAmount;
      if (bankMatchDate) updateData.bankMatchDate = new Date(bankMatchDate);

      const [updated] = await db.update(auditPagCases).set(updateData).where(eq(auditPagCases.id, req.params.id)).returning();
      await logAuditTrail(user.id, "bank_match", "audit_pag_case", req.params.id, { bankStatementMatch: existing.bankStatementMatch }, updateData, req.ip);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit-pag/documents/:caseId", requireAuth, async (req: Request, res: Response) => {
    try {
      const docs = await db.select().from(auditPagDocuments).where(eq(auditPagDocuments.auditPagCaseId, req.params.caseId));
      res.json(docs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/audit-pag/documents/:caseId/upload", requireAuth, upload.single("file"), async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      const file = req.file;
      if (!file) return res.status(400).json({ error: "No file uploaded" });

      const [caseData] = await db.select().from(auditPagCases).where(eq(auditPagCases.id, req.params.caseId));
      if (!caseData) return res.status(404).json({ error: "Case not found" });

      const fileBuffer = fs.readFileSync(file.path);
      const sha256 = createHash("sha256").update(fileBuffer).digest("hex");

      const documentType = req.body.documentType || "other";

      const [doc] = await db.insert(auditPagDocuments).values({
        auditPagCaseId: req.params.caseId,
        documentType,
        fileName: file.filename,
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype || null,
        sha256,
        status: "uploaded",
        notes: req.body.notes || null,
      }).returning();

      await logAuditTrail(user.id, "upload_document", "audit_pag_document", doc.id, null, { caseId: req.params.caseId, documentType, sha256 }, req.ip);
      res.status(201).json(doc);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit-pag/monitoring", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      let conditions: any[] = [];

      if (user.role === "client" && user.clientId) {
        conditions.push(eq(auditPagMonitoring.companyId, user.clientId));
      }

      if (req.query.from) {
        conditions.push(gte(auditPagMonitoring.monitorDate, new Date(req.query.from as string)));
      }
      if (req.query.to) {
        conditions.push(lte(auditPagMonitoring.monitorDate, new Date(req.query.to as string)));
      }

      const data = conditions.length > 0
        ? await db.select().from(auditPagMonitoring).where(and(...conditions)).orderBy(desc(auditPagMonitoring.monitorDate))
        : await db.select().from(auditPagMonitoring).orderBy(desc(auditPagMonitoring.monitorDate));

      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/audit-pag/monitoring/refresh", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      if (user.role === "client") return res.status(403).json({ error: "Admin only" });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const allCases = await db.select().from(auditPagCases);

      let totalInflows = 0;
      let totalOutflows = 0;
      let matchedCount = 0;
      let unmatchedCount = 0;
      let conformantCount = 0;
      let nonConformantCount = 0;

      for (const c of allCases) {
        const amount = parseFloat(c.requestedAmount || "0");
        totalInflows += amount;
        if (c.supplierPayAmount) totalOutflows += parseFloat(c.supplierPayAmount);
        if (c.bankStatementMatch === "matched") matchedCount++;
        else if (c.bankStatementMatch === "unmatched") unmatchedCount++;
        if (c.conformityStatus === "conformant") conformantCount++;
        if (c.conformityStatus === "non_conformant") nonConformantCount++;
      }

      const [entry] = await db.insert(auditPagMonitoring).values({
        companyId: null,
        monitorDate: today,
        totalInflows: totalInflows.toFixed(2),
        totalOutflows: totalOutflows.toFixed(2),
        matchedCount,
        unmatchedCount,
        conformantCount,
        nonConformantCount,
        summaryJson: { totalCases: allCases.length, computedAt: new Date().toISOString() },
      }).returning();

      res.json(entry);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit-pag/dashboard", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      let conditions: any[] = [];

      if (user.role === "client" && user.clientId) {
        conditions.push(eq(auditPagCases.companyId, user.clientId));
      }

      const allCases = conditions.length > 0
        ? await db.select().from(auditPagCases).where(and(...conditions))
        : await db.select().from(auditPagCases);

      const total = allCases.length;
      const conformant = allCases.filter(c => c.conformityStatus === "conformant").length;
      const nonConformant = allCases.filter(c => c.conformityStatus === "non_conformant").length;
      const pendingReview = allCases.filter(c => c.conformityStatus === "pending_review").length;
      const totalAudited = allCases.reduce((sum, c) => sum + parseFloat(c.requestedAmount || "0"), 0);

      const byStatus: Record<string, number> = {};
      const byPaymentMethod: Record<string, number> = {};
      const byProfileType: Record<string, number> = {};

      for (const c of allCases) {
        byStatus[c.status] = (byStatus[c.status] || 0) + 1;
        if (c.paymentMethod) byPaymentMethod[c.paymentMethod] = (byPaymentMethod[c.paymentMethod] || 0) + 1;
        byProfileType[c.profileType] = (byProfileType[c.profileType] || 0) + 1;
      }

      const conformityByPayment: Record<string, { conformant: number; nonConformant: number; pending: number }> = {};
      for (const c of allCases) {
        const pm = c.paymentMethod || "nao_definido";
        if (!conformityByPayment[pm]) conformityByPayment[pm] = { conformant: 0, nonConformant: 0, pending: 0 };
        if (c.conformityStatus === "conformant") conformityByPayment[pm].conformant++;
        else if (c.conformityStatus === "non_conformant") conformityByPayment[pm].nonConformant++;
        else conformityByPayment[pm].pending++;
      }

      res.json({
        total,
        conformant,
        nonConformant,
        pendingReview,
        totalAudited,
        conformantPercent: total > 0 ? ((conformant / total) * 100).toFixed(1) : "0.0",
        nonConformantPercent: total > 0 ? ((nonConformant / total) * 100).toFixed(1) : "0.0",
        byStatus,
        byPaymentMethod,
        byProfileType,
        conformityByPayment,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}

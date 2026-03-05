import type { Express, Request, Response } from "express";
import { requireAuth } from "./auth";
import { db } from "./db";
import {
  auditPagCases, auditPagDocuments, auditPagMonitoring, auditTrail,
  auditPagPolicies, auditPagPolicyItems, auditPagAlerts, auditPagAlertConfig,
  auditPagSuppliers, auditPagDataSources, auditPagServiceTypes,
  auditPagSupplierServices, auditPagFeeConfig, auditPagPaymentMethods,
  auditPagTransactions, auditPagReconciliationLog,
  auraTrustCertificates, auraTrustMetering,
} from "@shared/schema";
import { sql, eq, desc, and, gte, lte } from "drizzle-orm";
import { createHash } from "crypto";
import { z } from "zod";
import multer from "multer";
import fs from "fs";
import { sendEmail } from "./email-service";

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
  approvalReference: z.string().optional(),
  cardStatementRef: z.string().optional(),
  cardLastFour: z.string().optional(),
});

const ADMIN_ALERT_EMAIL = "nml.costa@gmail.com";

async function generateAlert(options: {
  companyId: string | null;
  caseId: string;
  alertType: string;
  severity: string;
  title: string;
  description: string;
  financialAmount?: number;
  userId?: string;
}) {
  try {
    const amount = options.financialAmount || 0;
    let config: any = null;
    if (options.companyId) {
      const [cfg] = await db.select().from(auditPagAlertConfig).where(eq(auditPagAlertConfig.companyId, options.companyId));
      config = cfg;
    }

    let severity = options.severity;
    if (config) {
      const highThreshold = parseFloat(config.highValueThreshold || "10000");
      const criticalThreshold = parseFloat(config.criticalValueThreshold || "50000");
      if (amount >= criticalThreshold) severity = "critical";
      else if (amount >= highThreshold && severity !== "critical") severity = "high";
    } else {
      if (amount >= 50000) severity = "critical";
      else if (amount >= 10000 && severity !== "critical") severity = "high";
    }

    const channels: string[] = [];
    if (!config || config.enablePlatformAlerts) channels.push("platform");
    if (config?.enableEmailAlerts) channels.push("email");
    if (config?.enableSmsAlerts) channels.push("sms");
    if (severity === "critical" || severity === "high") {
      if (!channels.includes("email")) channels.push("email");
    }
    const channel = channels.length > 1 ? "all" : channels[0] || "platform";

    const integrityTs = new Date().toISOString();
    const alertHash = generateIntegrityHash({ ...options, severity, channel, integrityTs }, integrityTs);

    const [alert] = await db.insert(auditPagAlerts).values({
      companyId: options.companyId,
      auditPagCaseId: options.caseId,
      alertType: options.alertType,
      severity,
      title: options.title,
      description: options.description,
      financialAmount: amount > 0 ? amount.toFixed(2) : null,
      channel,
      status: "pending",
      recipientUserId: options.userId || null,
      integrityHash: alertHash,
    }).returning();

    console.log(`ALERT [${severity.toUpperCase()}] ${options.alertType}: ${options.title} — R$ ${amount.toFixed(2)} — Hash: ${alertHash.substring(0, 16)}`);

    const emailRecipients: string[] = [];
    if (config?.enableEmailAlerts && config.emailRecipients) {
      emailRecipients.push(...config.emailRecipients.split(",").map((e: string) => e.trim()).filter(Boolean));
    }
    if ((severity === "critical" || severity === "high") && !emailRecipients.includes(ADMIN_ALERT_EMAIL)) {
      emailRecipients.push(ADMIN_ALERT_EMAIL);
    }

    for (const email of emailRecipients) {
      try {
        await sendEmail({
          to: email,
          subject: `[AuraTRUST ${severity.toUpperCase()}] ${options.title}`,
          html: generateAlertEmailHtml(options.title, options.description, severity, amount),
        });
        await db.update(auditPagAlerts).set({ status: "sent", sentAt: new Date(), recipientEmail: email }).where(eq(auditPagAlerts.id, alert.id));
      } catch (emailErr: any) {
        console.error("Alert email failed:", emailErr.message);
      }
    }

    await logAuditTrail(
      options.userId || "system",
      "alert_generated",
      "audit_pag_alert",
      alert.id,
      null,
      { alertType: options.alertType, severity, amount, channel, hash: alertHash },
      "system"
    );

    return alert;
  } catch (err: any) {
    console.error("generateAlert error:", err.message);
  }
}

function generateAlertEmailHtml(title: string, description: string, severity: string, amount: number): string {
  const severityColors: Record<string, string> = {
    low: "#3b82f6", medium: "#f59e0b", high: "#ef4444", critical: "#dc2626",
  };
  const color = severityColors[severity] || "#f59e0b";
  const amountStr = amount > 0 ? `R$ ${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "";
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#fff;border-radius:8px;overflow:hidden;">
      <div style="background:${color};padding:16px 24px;">
        <h2 style="margin:0;font-size:18px;">AuraTRUST — Alerta ${severity.toUpperCase()}</h2>
      </div>
      <div style="padding:24px;">
        <h3 style="margin:0 0 12px;font-size:16px;">${title}</h3>
        <p style="color:#ccc;line-height:1.6;">${description}</p>
        ${amountStr ? `<p style="margin-top:16px;font-size:20px;font-weight:bold;color:${color};">Valor: ${amountStr}</p>` : ""}
        <hr style="border:none;border-top:1px solid #333;margin:24px 0;" />
        <p style="color:#888;font-size:12px;">Este alerta foi gerado automaticamente pelo AuraTRUST — AuraAUDIT.</p>
      </div>
    </div>
  `;
}

const TEMPLATE_POLICY_ITEMS = [
  { category: "approval_flow", description: "Toda solicitação de viagem deve ter aprovação prévia do gestor direto", isMandatory: true, flagLevel: "critical", sortOrder: 1 },
  { category: "approval_flow", description: "Viagens internacionais requerem aprovação de nível gerencial ou superior", isMandatory: true, flagLevel: "critical", sortOrder: 2 },
  { category: "approval_flow", description: "Solicitações acima de R$ 5.000 requerem dupla aprovação (gestor + diretoria)", isMandatory: true, flagLevel: "critical", sortOrder: 3 },
  { category: "booking_rules", description: "Reservas aéreas devem ser feitas com mínimo de 7 dias de antecedência", isMandatory: false, flagLevel: "warning", sortOrder: 4 },
  { category: "booking_rules", description: "Classe executiva permitida apenas para voos acima de 4 horas", isMandatory: true, flagLevel: "warning", sortOrder: 5 },
  { category: "booking_rules", description: "Hospedagem em hotéis credenciados/conveniados preferencialmente", isMandatory: false, flagLevel: "info", sortOrder: 6 },
  { category: "booking_rules", description: "Locação de veículo: categoria econômica ou intermediária, salvo justificativa", isMandatory: false, flagLevel: "warning", sortOrder: 7 },
  { category: "payment_limits", description: "Teto diário para refeições: R$ 150,00 por pessoa", isMandatory: true, flagLevel: "warning", sortOrder: 8 },
  { category: "payment_limits", description: "Teto de diária de hotel: R$ 500,00 (capitais) / R$ 350,00 (interior)", isMandatory: true, flagLevel: "warning", sortOrder: 9 },
  { category: "payment_limits", description: "Despesas acima de R$ 250 requerem nota fiscal", isMandatory: true, flagLevel: "critical", sortOrder: 10 },
  { category: "supplier_selection", description: "Utilizar fornecedores homologados (lista atualizada semestralmente)", isMandatory: true, flagLevel: "warning", sortOrder: 11 },
  { category: "supplier_selection", description: "Cotação mínima de 3 fornecedores para serviços acima de R$ 10.000", isMandatory: true, flagLevel: "critical", sortOrder: 12 },
  { category: "expense_caps", description: "Reembolso de quilometragem: R$ 1,20/km com comprovante de trajeto", isMandatory: false, flagLevel: "info", sortOrder: 13 },
  { category: "expense_caps", description: "Adiantamentos devem ser prestados em até 5 dias úteis após o retorno", isMandatory: true, flagLevel: "critical", sortOrder: 14 },
  { category: "documentation", description: "Relatório de viagem obrigatório em até 48h após o retorno", isMandatory: true, flagLevel: "warning", sortOrder: 15 },
  { category: "documentation", description: "Boarding passes e comprovantes de hospedagem devem ser anexados", isMandatory: true, flagLevel: "warning", sortOrder: 16 },
  { category: "documentation", description: "NF/cupom fiscal obrigatório para todas as despesas reembolsáveis", isMandatory: true, flagLevel: "critical", sortOrder: 17 },
  { category: "compliance", description: "Proibido uso de cartão corporativo para despesas pessoais", isMandatory: true, flagLevel: "critical", sortOrder: 18 },
  { category: "compliance", description: "Despesas com entretenimento requerem justificativa de negócio", isMandatory: true, flagLevel: "warning", sortOrder: 19 },
  { category: "compliance", description: "Viagens em finais de semana/feriados requerem aprovação especial", isMandatory: false, flagLevel: "info", sortOrder: 20 },
  { category: "sla", description: "Agência deve emitir bilhete em até 24h após aprovação", isMandatory: true, flagLevel: "warning", sortOrder: 21 },
  { category: "sla", description: "Prazo de resposta da agência: até 2h em horário comercial", isMandatory: false, flagLevel: "info", sortOrder: 22 },
  { category: "sla", description: "Relatório mensal de gestão entregue até o 5º dia útil do mês seguinte", isMandatory: true, flagLevel: "warning", sortOrder: 23 },
  { category: "sla", description: "Faturamento consolidado com cruzamento de NF e extrato bancário", isMandatory: true, flagLevel: "critical", sortOrder: 24 },
];

async function seedPolicyTemplates() {
  const existing = await db.select().from(auditPagPolicies).where(eq(auditPagPolicies.isTemplate, true));
  if (existing.length > 0) return;

  const [policy] = await db.insert(auditPagPolicies).values({
    companyId: null,
    name: "Política Padrão de Viagens Corporativas (Modelo T&E)",
    policyType: "travel_purchase",
    isTemplate: true,
    isActive: true,
  }).returning();

  for (const item of TEMPLATE_POLICY_ITEMS) {
    await db.insert(auditPagPolicyItems).values({
      policyId: policy.id,
      ...item,
    });
  }
  console.log(`Seeded policy template with ${TEMPLATE_POLICY_ITEMS.length} items`);
}

export function registerAuditPagRoutes(app: Express) {
  seedPolicyTemplates().catch(err => console.error("Policy seed error:", err.message));

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
        approvalReference: parsed.approvalReference || null,
        cardStatementRef: parsed.cardStatementRef || null,
        cardLastFour: parsed.cardLastFour || null,
        bankStatementMatch: "pending",
        conformityStatus: "pending_review",
        findings: [],
      };

      if (parsed.profileType === "agency") {
        values.commissionPercent = parsed.commissionPercent || null;
        values.commissionAmount = parsed.commissionAmount || null;
        values.hasIncentive = parsed.hasIncentive || false;
        values.incentiveAmount = parsed.incentiveAmount || null;
        values.hasRebate = parsed.hasRebate || false;
        values.rebateAmount = parsed.rebateAmount || null;
        values.agencyInvoiceRef = parsed.agencyInvoiceRef || null;
      }

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
        "approvalReference", "cardStatementRef", "cardLastFour",
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

      if (newStatus === "non_conformant") {
        const amount = parseFloat(existing.requestedAmount || "0");
        await generateAlert({
          companyId: existing.companyId,
          caseId: req.params.id,
          alertType: "anomaly",
          severity: "high",
          title: "Caso marcado como Não Conforme",
          description: `O caso de ${existing.requesterName || "solicitante"} para ${existing.destination || "destino"} foi marcado como não conforme. Valor: R$ ${amount.toFixed(2)}`,
          financialAmount: amount,
          userId: user.id,
        });
      }

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

      const amount = parseFloat(existing.requestedAmount || "0");
      const findingSeverity = severity || "medium";
      if (findingSeverity === "high" || amount >= 10000) {
        await generateAlert({
          companyId: existing.companyId,
          caseId: req.params.id,
          alertType: "discrepancy",
          severity: findingSeverity,
          title: `Achado: ${type}`,
          description: `${description} — Caso: ${existing.requesterName || "N/A"}, Destino: ${existing.destination || "N/A"}`,
          financialAmount: amount,
          userId: user.id,
        });
      }

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

      if (bankStatementMatch === "unmatched" || bankStatementMatch === "partial") {
        const amount = parseFloat(existing.requestedAmount || "0");
        await generateAlert({
          companyId: existing.companyId,
          caseId: req.params.id,
          alertType: "bank_mismatch",
          severity: bankStatementMatch === "unmatched" ? "high" : "medium",
          title: `Conciliação bancária: ${bankStatementMatch === "unmatched" ? "Divergente" : "Parcial"}`,
          description: `Extrato bancário ${bankStatementMatch === "unmatched" ? "divergente" : "parcialmente conciliado"} para caso ${existing.requesterName || "N/A"}. Valor solicitado: R$ ${amount.toFixed(2)}`,
          financialAmount: amount,
          userId: user.id,
        });
      }

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

      const alertConditions: any[] = [];
      if (user.role === "client" && user.clientId) {
        alertConditions.push(eq(auditPagAlerts.companyId, user.clientId));
      }
      alertConditions.push(eq(auditPagAlerts.status, "pending"));
      const unreadAlerts = await db.select().from(auditPagAlerts).where(and(...alertConditions));

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
        unreadAlertCount: unreadAlerts.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit-pag/policies", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      let conditions: any[] = [];

      if (user.role === "client" && user.clientId) {
        const policies = await db.select().from(auditPagPolicies).where(
          and(
            eq(auditPagPolicies.isActive, true),
          )
        ).orderBy(desc(auditPagPolicies.createdAt));
        const filtered = policies.filter(p => p.isTemplate || p.companyId === user.clientId);
        return res.json(filtered);
      }

      const policies = await db.select().from(auditPagPolicies).orderBy(desc(auditPagPolicies.createdAt));
      res.json(policies);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit-pag/policies/:id/items", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      const [policy] = await db.select().from(auditPagPolicies).where(eq(auditPagPolicies.id, req.params.id));
      if (!policy) return res.status(404).json({ error: "Policy not found" });
      if (user.role === "client" && !policy.isTemplate && policy.companyId !== user.clientId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const items = await db.select().from(auditPagPolicyItems)
        .where(eq(auditPagPolicyItems.policyId, req.params.id))
        .orderBy(auditPagPolicyItems.sortOrder);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/audit-pag/policies", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      const { name, policyType, cloneFromTemplateId } = req.body;
      if (!name) return res.status(400).json({ error: "name is required" });

      const [policy] = await db.insert(auditPagPolicies).values({
        companyId: user.clientId || null,
        name,
        policyType: policyType || "travel_purchase",
        isTemplate: false,
        isActive: true,
      }).returning();

      if (cloneFromTemplateId) {
        const templateItems = await db.select().from(auditPagPolicyItems)
          .where(eq(auditPagPolicyItems.policyId, cloneFromTemplateId));
        for (const item of templateItems) {
          await db.insert(auditPagPolicyItems).values({
            policyId: policy.id,
            category: item.category,
            description: item.description,
            isMandatory: item.isMandatory,
            isEnabled: item.isEnabled,
            flagLevel: item.flagLevel,
            sortOrder: item.sortOrder,
          });
        }
      }

      await logAuditTrail(user.id, "create", "audit_pag_policy", policy.id, null, policy, req.ip);
      res.status(201).json(policy);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/audit-pag/policies/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      const [policy] = await db.select().from(auditPagPolicies).where(eq(auditPagPolicies.id, req.params.id));
      if (!policy) return res.status(404).json({ error: "Policy not found" });
      if (policy.isTemplate && user.role !== "admin") return res.status(403).json({ error: "Only admin can edit templates" });
      if (user.role === "client" && policy.companyId !== user.clientId) return res.status(403).json({ error: "Access denied" });

      const updateData: any = { updatedAt: new Date() };
      if (req.body.name !== undefined) updateData.name = req.body.name;
      if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;
      if (req.body.policyType !== undefined) updateData.policyType = req.body.policyType;

      const [updated] = await db.update(auditPagPolicies).set(updateData).where(eq(auditPagPolicies.id, req.params.id)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/audit-pag/policies/:id/items", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      const [policy] = await db.select().from(auditPagPolicies).where(eq(auditPagPolicies.id, req.params.id));
      if (!policy) return res.status(404).json({ error: "Policy not found" });
      if (policy.isTemplate && user.role !== "admin") return res.status(403).json({ error: "Cannot add items to templates" });
      if (user.role === "client" && policy.companyId !== user.clientId) return res.status(403).json({ error: "Access denied" });

      const { category, description, isMandatory, flagLevel, sortOrder } = req.body;
      if (!category || !description) return res.status(400).json({ error: "category and description required" });

      const [item] = await db.insert(auditPagPolicyItems).values({
        policyId: req.params.id,
        category,
        description,
        isMandatory: isMandatory ?? true,
        isEnabled: true,
        flagLevel: flagLevel || "warning",
        sortOrder: sortOrder || 0,
      }).returning();

      res.status(201).json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/audit-pag/policies/:id/items/:itemId", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      const [policy] = await db.select().from(auditPagPolicies).where(eq(auditPagPolicies.id, req.params.id));
      if (!policy) return res.status(404).json({ error: "Policy not found" });
      if (policy.isTemplate && user.role !== "admin") return res.status(403).json({ error: "Cannot edit template items" });
      if (user.role === "client" && policy.companyId !== user.clientId) return res.status(403).json({ error: "Access denied" });

      const updateData: any = {};
      if (req.body.isEnabled !== undefined) updateData.isEnabled = req.body.isEnabled;
      if (req.body.description !== undefined) updateData.description = req.body.description;
      if (req.body.flagLevel !== undefined) updateData.flagLevel = req.body.flagLevel;
      if (req.body.isMandatory !== undefined) updateData.isMandatory = req.body.isMandatory;

      const [updated] = await db.update(auditPagPolicyItems).set(updateData).where(eq(auditPagPolicyItems.id, req.params.itemId)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/audit-pag/policies/upload", requireAuth, upload.single("file"), async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      const file = req.file;
      if (!file) return res.status(400).json({ error: "No file uploaded" });

      const [policy] = await db.insert(auditPagPolicies).values({
        companyId: user.clientId || null,
        name: req.body.name || file.originalname,
        policyType: "custom",
        isTemplate: false,
        isActive: true,
        uploadedFileUrl: file.path,
        uploadedFileName: file.originalname,
      }).returning();

      await logAuditTrail(user.id, "upload_policy", "audit_pag_policy", policy.id, null, { fileName: file.originalname }, req.ip);
      res.status(201).json(policy);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit-pag/alerts", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      let conditions: any[] = [];

      if (user.role === "client" && user.clientId) {
        conditions.push(eq(auditPagAlerts.companyId, user.clientId));
      }

      const alerts = conditions.length > 0
        ? await db.select().from(auditPagAlerts).where(and(...conditions)).orderBy(desc(auditPagAlerts.createdAt))
        : await db.select().from(auditPagAlerts).orderBy(desc(auditPagAlerts.createdAt));

      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/audit-pag/alerts/:id/read", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      const [alert] = await db.select().from(auditPagAlerts).where(eq(auditPagAlerts.id, req.params.id));
      if (!alert) return res.status(404).json({ error: "Alert not found" });
      if (user.role === "client" && alert.companyId !== user.clientId) return res.status(403).json({ error: "Access denied" });

      const [updated] = await db.update(auditPagAlerts).set({
        status: "read",
        readAt: new Date(),
      }).where(eq(auditPagAlerts.id, req.params.id)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/audit-pag/alerts/:id/dismiss", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      const [alert] = await db.select().from(auditPagAlerts).where(eq(auditPagAlerts.id, req.params.id));
      if (!alert) return res.status(404).json({ error: "Alert not found" });
      if (user.role === "client" && alert.companyId !== user.clientId) return res.status(403).json({ error: "Access denied" });

      const [updated] = await db.update(auditPagAlerts).set({
        status: "dismissed",
      }).where(eq(auditPagAlerts.id, req.params.id)).returning();
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit-pag/alert-config", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      let companyId: string | null = null;
      if (user.role === "admin" && req.query.companyId) {
        companyId = req.query.companyId as string;
      } else {
        companyId = user.clientId || null;
      }
      if (!companyId) return res.json(null);

      const [config] = await db.select().from(auditPagAlertConfig).where(eq(auditPagAlertConfig.companyId, companyId));
      res.json(config || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/audit-pag/alert-config", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      let companyId: string | null = null;
      if (user.role === "admin" && req.body.companyId) {
        companyId = req.body.companyId;
      } else {
        companyId = user.clientId || null;
      }
      if (!companyId) return res.status(400).json({ error: "companyId required" });

      const [existing] = await db.select().from(auditPagAlertConfig).where(eq(auditPagAlertConfig.companyId, companyId));

      const configData: any = {
        enablePlatformAlerts: req.body.enablePlatformAlerts ?? true,
        enableEmailAlerts: req.body.enableEmailAlerts ?? true,
        enableSmsAlerts: req.body.enableSmsAlerts ?? false,
        emailRecipients: req.body.emailRecipients || null,
        smsRecipients: req.body.smsRecipients || null,
        highValueThreshold: req.body.highValueThreshold || "10000",
        criticalValueThreshold: req.body.criticalValueThreshold || "50000",
        alertOnDiscrepancy: req.body.alertOnDiscrepancy ?? true,
        alertOnPolicyViolation: req.body.alertOnPolicyViolation ?? true,
        alertOnBankMismatch: req.body.alertOnBankMismatch ?? true,
        dataSourcePreference: req.body.dataSourcePreference || "both",
        updatedAt: new Date(),
      };

      if (existing) {
        const [updated] = await db.update(auditPagAlertConfig).set(configData).where(eq(auditPagAlertConfig.id, existing.id)).returning();
        return res.json(updated);
      }

      const [created] = await db.insert(auditPagAlertConfig).values({
        companyId,
        ...configData,
      }).returning();
      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit-pag/health-check", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") return res.status(403).json({ error: "Admin only" });

      const { runCP01HealthCheck } = await import("./cp01-health-check");
      const result = await runCP01HealthCheck();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/audit-pag/remediate", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") return res.status(403).json({ error: "Admin only" });

      const { autoRemediateSeedData, runCP01HealthCheck } = await import("./cp01-health-check");
      const remediation = await autoRemediateSeedData();
      const healthCheck = await runCP01HealthCheck();

      await logAuditTrail(
        req.session.userId!,
        "cp01_remediation",
        "system",
        "manual",
        null,
        { remediation, healthCheck: { passed: healthCheck.passed, violations: healthCheck.violations } },
        req.ip
      );

      res.json({ remediation, healthCheck });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================
  // BLOCO A — FORNECEDORES PRE-AUTORIZADOS
  // ============================================================

  app.get("/api/audit-pag/suppliers", requireAuth, async (req: Request, res: Response) => {
    try {
      const conditions: any[] = [];
      if (req.session.role !== "admin" && req.session.clientId) {
        conditions.push(eq(auditPagSuppliers.companyId, req.session.clientId));
      }
      const suppliers = conditions.length > 0
        ? await db.select().from(auditPagSuppliers).where(and(...conditions)).orderBy(desc(auditPagSuppliers.createdAt))
        : await db.select().from(auditPagSuppliers).orderBy(desc(auditPagSuppliers.createdAt));
      res.json(suppliers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/audit-pag/suppliers", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") return res.status(403).json({ error: "Admin only" });
      const schema = z.object({
        cnpj: z.string().min(11),
        razaoSocial: z.string().min(1),
        nomeFantasia: z.string().optional(),
        segment: z.string().optional(),
        companyId: z.string().optional(),
        paysCommission: z.boolean().optional(),
        commissionType: z.string().optional(),
        commissionPercent: z.string().optional(),
        hasIncentive: z.boolean().optional(),
        incentiveType: z.string().optional(),
        incentiveValue: z.string().optional(),
        hasRebate: z.boolean().optional(),
        rebatePercent: z.string().optional(),
        contactName: z.string().optional(),
        contactEmail: z.string().optional(),
        contactPhone: z.string().optional(),
        notes: z.string().optional(),
      });
      const data = schema.parse(req.body);

      const cnpjClean = data.cnpj.replace(/\D/g, "");
      const existing = await db.select().from(auditPagSuppliers).where(eq(auditPagSuppliers.cnpj, data.cnpj));
      if (existing.length > 0) return res.status(409).json({ error: "CNPJ already registered" });

      let rfValidation = { checked: false, found: false, razaoSocial: "" };
      if (cnpjClean.length === 14) {
        try {
          const resp = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjClean}`);
          if (resp.ok) {
            const rfData = await resp.json() as any;
            rfValidation = { checked: true, found: true, razaoSocial: rfData.razao_social || "" };
            if (!data.razaoSocial || data.razaoSocial.trim() === "") {
              data.razaoSocial = rfData.razao_social || data.razaoSocial;
            }
            if (!data.nomeFantasia) {
              data.nomeFantasia = rfData.nome_fantasia || undefined;
            }
          } else {
            rfValidation = { checked: true, found: false, razaoSocial: "" };
          }
        } catch {
          rfValidation = { checked: false, found: false, razaoSocial: "" };
        }
      }

      const [supplier] = await db.insert(auditPagSuppliers).values(data as any).returning();

      await logAuditTrail(req.session.userId!, "supplier_created", "audit_pag_supplier", supplier.id, null, supplier, req.ip);
      res.status(201).json(supplier);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/audit-pag/suppliers/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") return res.status(403).json({ error: "Admin only" });
      const [existing] = await db.select().from(auditPagSuppliers).where(eq(auditPagSuppliers.id, req.params.id));
      if (!existing) return res.status(404).json({ error: "Supplier not found" });

      const [updated] = await db.update(auditPagSuppliers)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(auditPagSuppliers.id, req.params.id))
        .returning();

      await logAuditTrail(req.session.userId!, "supplier_updated", "audit_pag_supplier", req.params.id, existing, updated, req.ip);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/audit-pag/suppliers/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") return res.status(403).json({ error: "Admin only" });
      const [existing] = await db.select().from(auditPagSuppliers).where(eq(auditPagSuppliers.id, req.params.id));
      if (!existing) return res.status(404).json({ error: "Supplier not found" });

      const [deactivated] = await db.update(auditPagSuppliers)
        .set({ status: "blocked", updatedAt: new Date() })
        .where(eq(auditPagSuppliers.id, req.params.id))
        .returning();

      await logAuditTrail(req.session.userId!, "supplier_blocked", "audit_pag_supplier", req.params.id, existing, deactivated, req.ip);
      res.json(deactivated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/audit-pag/suppliers/validate-cnpj", requireAuth, async (req: Request, res: Response) => {
    try {
      const { cnpj } = req.body;
      if (!cnpj) return res.status(400).json({ error: "CNPJ required" });

      const cnpjClean = cnpj.replace(/\D/g, "");
      const suppliers = await db.select().from(auditPagSuppliers);
      const match = suppliers.find(s => s.cnpj.replace(/\D/g, "") === cnpjClean);

      if (!match) {
        const alertTitle = `Fornecedor NAO AUTORIZADO: CNPJ ${cnpj}`;
        const alertDesc = `Tentativa de transacao com fornecedor nao cadastrado na lista de pre-aprovados. CNPJ: ${cnpj}. Pagamento BLOQUEADO automaticamente.`;
        const timestamp = new Date().toISOString();
        const integrityHash = generateIntegrityHash({ alertType: "unauthorized_supplier", cnpj, severity: "critical" }, timestamp);

        await db.insert(auditPagAlerts).values({
          companyId: req.session.clientId || "system",
          alertType: "unauthorized_supplier",
          severity: "critical",
          title: alertTitle,
          description: alertDesc,
          channel: "platform",
          status: "pending",
          integrityHash,
        });

        const configs = await db.select().from(auditPagAlertConfig);
        if (configs.length > 0 && configs[0].enableEmailAlerts && configs[0].emailRecipients) {
          const recipients = configs[0].emailRecipients.split(",").map((e: string) => e.trim());
          for (const email of recipients) {
            try {
              await sendEmail(email, `[AuraTRUST CRITICAL] ${alertTitle}`, alertDesc);
            } catch { /* email best effort */ }
          }
        }

        return res.json({
          authorized: false,
          blocked: true,
          message: "Fornecedor NAO encontrado na lista de pre-aprovados. Pagamento BLOQUEADO.",
          cnpj,
        });
      }

      if (match.status === "blocked") {
        return res.json({
          authorized: false,
          blocked: true,
          message: "Fornecedor BLOQUEADO. Pagamento NAO autorizado.",
          supplier: { id: match.id, razaoSocial: match.razaoSocial, status: match.status },
        });
      }

      res.json({
        authorized: true,
        blocked: false,
        message: "Fornecedor pre-autorizado.",
        supplier: {
          id: match.id,
          razaoSocial: match.razaoSocial,
          nomeFantasia: match.nomeFantasia,
          segment: match.segment,
          paysCommission: match.paysCommission,
          hasIncentive: match.hasIncentive,
          hasRebate: match.hasRebate,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================
  // BLOCO B — FONTES DE DADOS PRE-APROVADAS
  // ============================================================

  app.get("/api/audit-pag/data-sources", requireAuth, async (req: Request, res: Response) => {
    try {
      const conditions: any[] = [];
      if (req.session.role !== "admin" && req.session.clientId) {
        conditions.push(eq(auditPagDataSources.companyId, req.session.clientId));
      }
      const sources = conditions.length > 0
        ? await db.select().from(auditPagDataSources).where(and(...conditions)).orderBy(desc(auditPagDataSources.createdAt))
        : await db.select().from(auditPagDataSources).orderBy(desc(auditPagDataSources.createdAt));
      res.json(sources);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/audit-pag/data-sources", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") return res.status(403).json({ error: "Admin only" });
      const schema = z.object({
        name: z.string().min(1),
        sourceType: z.enum(["obt", "gds", "erp", "email", "whatsapp", "bank", "approval_system", "other"]),
        connectionMethod: z.enum(["api", "sftp", "imap", "webhook", "ofx", "cnab", "manual_upload"]),
        endpointUrl: z.string().optional(),
        sftpHost: z.string().optional(),
        sftpPort: z.number().optional(),
        sftpDirectory: z.string().optional(),
        authType: z.string().optional(),
        credentialsRef: z.string().optional(),
        schedule: z.string().optional(),
        isTrusted: z.boolean().optional(),
        companyId: z.string().optional(),
        notes: z.string().optional(),
      });
      const data = schema.parse(req.body);
      const [source] = await db.insert(auditPagDataSources).values(data as any).returning();
      await logAuditTrail(req.session.userId!, "data_source_created", "audit_pag_data_source", source.id, null, source, req.ip);
      res.status(201).json(source);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/audit-pag/data-sources/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") return res.status(403).json({ error: "Admin only" });
      const [existing] = await db.select().from(auditPagDataSources).where(eq(auditPagDataSources.id, req.params.id));
      if (!existing) return res.status(404).json({ error: "Data source not found" });

      const [updated] = await db.update(auditPagDataSources)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(auditPagDataSources.id, req.params.id))
        .returning();

      await logAuditTrail(req.session.userId!, "data_source_updated", "audit_pag_data_source", req.params.id, existing, updated, req.ip);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/audit-pag/data-sources/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") return res.status(403).json({ error: "Admin only" });
      const [existing] = await db.select().from(auditPagDataSources).where(eq(auditPagDataSources.id, req.params.id));
      if (!existing) return res.status(404).json({ error: "Data source not found" });

      const [deactivated] = await db.update(auditPagDataSources)
        .set({ status: "inactive", updatedAt: new Date() })
        .where(eq(auditPagDataSources.id, req.params.id))
        .returning();

      await logAuditTrail(req.session.userId!, "data_source_deactivated", "audit_pag_data_source", req.params.id, existing, deactivated, req.ip);
      res.json(deactivated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================
  // BLOCO C — TIPOS DE SERVICO, TAXAS (FEE) E MEIOS DE PAGAMENTO
  // ============================================================

  app.get("/api/audit-pag/service-types", requireAuth, async (req: Request, res: Response) => {
    try {
      const conditions: any[] = [];
      if (req.session.role !== "admin" && req.session.clientId) {
        conditions.push(eq(auditPagServiceTypes.companyId, req.session.clientId));
      }
      const types = conditions.length > 0
        ? await db.select().from(auditPagServiceTypes).where(and(...conditions)).orderBy(auditPagServiceTypes.name)
        : await db.select().from(auditPagServiceTypes).orderBy(auditPagServiceTypes.name);
      res.json(types);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/audit-pag/service-types", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") return res.status(403).json({ error: "Admin only" });
      const schema = z.object({
        name: z.string().min(1),
        category: z.string().min(1),
        description: z.string().optional(),
        requiresCommissionCheck: z.boolean().optional(),
        requiresIncentiveCheck: z.boolean().optional(),
        companyId: z.string().optional(),
      });
      const data = schema.parse(req.body);
      const [serviceType] = await db.insert(auditPagServiceTypes).values(data as any).returning();
      await logAuditTrail(req.session.userId!, "service_type_created", "audit_pag_service_type", serviceType.id, null, serviceType, req.ip);
      res.status(201).json(serviceType);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/audit-pag/service-types/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") return res.status(403).json({ error: "Admin only" });
      const [existing] = await db.select().from(auditPagServiceTypes).where(eq(auditPagServiceTypes.id, req.params.id));
      if (!existing) return res.status(404).json({ error: "Service type not found" });

      const [updated] = await db.update(auditPagServiceTypes)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(auditPagServiceTypes.id, req.params.id))
        .returning();

      await logAuditTrail(req.session.userId!, "service_type_updated", "audit_pag_service_type", req.params.id, existing, updated, req.ip);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/audit-pag/service-types/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") return res.status(403).json({ error: "Admin only" });
      const [updated] = await db.update(auditPagServiceTypes)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(auditPagServiceTypes.id, req.params.id))
        .returning();
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit-pag/supplier-services/:supplierId", requireAuth, async (req: Request, res: Response) => {
    try {
      const links = await db.select().from(auditPagSupplierServices).where(eq(auditPagSupplierServices.supplierId, req.params.supplierId));
      res.json(links);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/audit-pag/supplier-services", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") return res.status(403).json({ error: "Admin only" });
      const { supplierId, serviceTypeId } = req.body;
      const [link] = await db.insert(auditPagSupplierServices).values({ supplierId, serviceTypeId }).returning();
      res.status(201).json(link);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/audit-pag/supplier-services/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") return res.status(403).json({ error: "Admin only" });
      await db.delete(auditPagSupplierServices).where(eq(auditPagSupplierServices.id, req.params.id));
      res.json({ deleted: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit-pag/fee-config", requireAuth, async (req: Request, res: Response) => {
    try {
      const conditions: any[] = [];
      if (req.session.role !== "admin" && req.session.clientId) {
        conditions.push(eq(auditPagFeeConfig.companyId, req.session.clientId));
      }
      const configs = conditions.length > 0
        ? await db.select().from(auditPagFeeConfig).where(and(...conditions)).orderBy(auditPagFeeConfig.feeName)
        : await db.select().from(auditPagFeeConfig).orderBy(auditPagFeeConfig.feeName);
      res.json(configs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/audit-pag/fee-config", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") return res.status(403).json({ error: "Admin only" });
      const schema = z.object({
        feeName: z.string().min(1),
        feeType: z.enum(["fixed", "percent"]),
        feeValue: z.string(),
        separateInvoice: z.boolean().optional(),
        billingDescription: z.string().optional(),
        appliesTo: z.string().optional(),
        companyId: z.string().optional(),
      });
      const data = schema.parse(req.body);
      const [config] = await db.insert(auditPagFeeConfig).values(data as any).returning();
      await logAuditTrail(req.session.userId!, "fee_config_created", "audit_pag_fee_config", config.id, null, config, req.ip);
      res.status(201).json(config);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/audit-pag/fee-config/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") return res.status(403).json({ error: "Admin only" });
      const [existing] = await db.select().from(auditPagFeeConfig).where(eq(auditPagFeeConfig.id, req.params.id));
      if (!existing) return res.status(404).json({ error: "Fee config not found" });

      const [updated] = await db.update(auditPagFeeConfig)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(auditPagFeeConfig.id, req.params.id))
        .returning();

      await logAuditTrail(req.session.userId!, "fee_config_updated", "audit_pag_fee_config", req.params.id, existing, updated, req.ip);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/audit-pag/fee-config/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") return res.status(403).json({ error: "Admin only" });
      const [updated] = await db.update(auditPagFeeConfig)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(auditPagFeeConfig.id, req.params.id))
        .returning();
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit-pag/payment-methods", requireAuth, async (req: Request, res: Response) => {
    try {
      const conditions: any[] = [];
      if (req.session.role !== "admin" && req.session.clientId) {
        conditions.push(eq(auditPagPaymentMethods.companyId, req.session.clientId));
      }
      const methods = conditions.length > 0
        ? await db.select().from(auditPagPaymentMethods).where(and(...conditions)).orderBy(auditPagPaymentMethods.name)
        : await db.select().from(auditPagPaymentMethods).orderBy(auditPagPaymentMethods.name);
      res.json(methods);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/audit-pag/payment-methods", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") return res.status(403).json({ error: "Admin only" });
      const schema = z.object({
        name: z.string().min(1),
        methodType: z.enum(["faturado", "pix", "deposito", "cartao", "boleto", "ted", "other"]),
        requiresBankReconciliation: z.boolean().optional(),
        companyId: z.string().optional(),
      });
      const data = schema.parse(req.body);
      const [method] = await db.insert(auditPagPaymentMethods).values(data as any).returning();
      res.status(201).json(method);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/audit-pag/payment-methods/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") return res.status(403).json({ error: "Admin only" });
      const [updated] = await db.update(auditPagPaymentMethods)
        .set({ ...req.body })
        .where(eq(auditPagPaymentMethods.id, req.params.id))
        .returning();
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/audit-pag/payment-methods/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      if (req.session.role !== "admin") return res.status(403).json({ error: "Admin only" });
      const [updated] = await db.update(auditPagPaymentMethods)
        .set({ isActive: false })
        .where(eq(auditPagPaymentMethods.id, req.params.id))
        .returning();
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ═══════════════════════════════════════════════════════════════════
  // BLOCO D — Pipeline de Reconciliação Automática (3 Camadas)
  // ═══════════════════════════════════════════════════════════════════

  const createTransactionSchema = z.object({
    referenceCode: z.string().min(1),
    supplierId: z.string().optional(),
    supplierCnpj: z.string().optional(),
    supplierName: z.string().optional(),
    serviceTypeId: z.string().optional(),
    serviceTypeName: z.string().optional(),
    feeConfigId: z.string().optional(),
    paymentMethodId: z.string().optional(),
    requestedAmount: z.string().optional(),
  });

  const layer1Schema = z.object({
    source: z.string().min(1),
    sourceId: z.string().optional(),
    requesterName: z.string().optional(),
    requesterDepartment: z.string().optional(),
    destination: z.string().optional(),
    travelDate: z.string().optional(),
    returnDate: z.string().optional(),
    reservationCode: z.string().optional(),
    supplierConfirmation: z.string().optional(),
    approvalReference: z.string().optional(),
    requestedAmount: z.string().optional(),
    paymentMethod: z.string().optional(),
    supplierCnpj: z.string().optional(),
    supplierName: z.string().optional(),
    additionalData: z.record(z.any()).optional(),
  });

  const layer2Schema = z.object({
    source: z.string().min(1),
    sourceId: z.string().optional(),
    invoiceNumber: z.string().optional(),
    invoiceDate: z.string().optional(),
    invoiceDueDate: z.string().optional(),
    invoicedAmount: z.string().optional(),
    supplierPaidAmount: z.string().optional(),
    clientPaidAmount: z.string().optional(),
    fiscalDocType: z.enum(["nf", "recibo", "fatura"]).optional(),
    fiscalDocNumber: z.string().optional(),
    fiscalDocAmount: z.string().optional(),
    feeAmount: z.string().optional(),
    commissionExpected: z.string().optional(),
    incentiveExpected: z.string().optional(),
    paymentMethodErp: z.string().optional(),
    additionalData: z.record(z.any()).optional(),
  });

  const layer3Schema = z.object({
    source: z.string().min(1),
    sourceId: z.string().optional(),
    type: z.enum(["conta_corrente", "cartao_credito", "cartao_virtual"]),
    bankConfirmedAmount: z.string().optional(),
    transactionDate: z.string().optional(),
    cardLastFour: z.string().optional(),
    bankReference: z.string().optional(),
    supplierPaidConfirmed: z.string().optional(),
    clientPaidConfirmed: z.string().optional(),
    commissionReceived: z.string().optional(),
    incentiveReceived: z.string().optional(),
    feeReceived: z.string().optional(),
    additionalData: z.record(z.any()).optional(),
  });

  async function logReconciliationStep(transactionId: string, step: string, result: string, details: any) {
    const timestamp = new Date().toISOString();
    const integrityHash = generateIntegrityHash({ transactionId, step, result, details }, timestamp);
    await db.insert(auditPagReconciliationLog).values({
      transactionId,
      step,
      result,
      details,
      integrityHash,
    });
  }

  async function generateTransactionAlert(companyId: string | null, transactionId: string, alertType: string, severity: string, title: string, description: string, financialAmount: number, userId: string) {
    await generateAlert({
      companyId,
      caseId: transactionId,
      alertType,
      severity,
      title,
      description,
      financialAmount,
      userId,
    });
  }

  app.post("/api/audit-pag/transactions", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      const parsed = createTransactionSchema.parse(req.body);

      let supplierBlocked = false;
      if (parsed.supplierCnpj && user.clientId) {
        const suppliers = await db.select().from(auditPagSuppliers).where(
          and(eq(auditPagSuppliers.companyId, user.clientId), eq(auditPagSuppliers.cnpj, parsed.supplierCnpj))
        );
        if (suppliers.length === 0) {
          supplierBlocked = true;
        } else if (!suppliers[0].isActive || suppliers[0].status === "blocked") {
          supplierBlocked = true;
        }
      }

      const [created] = await db.insert(auditPagTransactions).values({
        companyId: user.clientId || null,
        referenceCode: parsed.referenceCode,
        status: supplierBlocked ? "blocked" : "pending",
        supplierId: parsed.supplierId || null,
        supplierCnpj: parsed.supplierCnpj || null,
        supplierName: parsed.supplierName || null,
        serviceTypeId: parsed.serviceTypeId || null,
        serviceTypeName: parsed.serviceTypeName || null,
        feeConfigId: parsed.feeConfigId || null,
        paymentMethodId: parsed.paymentMethodId || null,
        requestedAmount: parsed.requestedAmount || null,
        createdByUserId: user.id,
      }).returning();

      await logAuditTrail(user.id, "create", "audit_pag_transaction", created.id, null, created, req.ip);

      if (supplierBlocked) {
        await generateTransactionAlert(user.clientId || null, created.id, "supplier_not_authorized", "critical",
          "Fornecedor não autorizado na transação",
          `Transação ${parsed.referenceCode}: fornecedor CNPJ ${parsed.supplierCnpj} não está autorizado. Pagamento BLOQUEADO.`,
          parseFloat(parsed.requestedAmount || "0"), user.id);
        await logReconciliationStep(created.id, "supplier_validation", "blocked", { reason: "supplier_not_authorized", cnpj: parsed.supplierCnpj });
      }

      res.status(201).json(created);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: error.errors });
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit-pag/transactions", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      const { status, reconciliationStatus, limit: limitParam } = req.query;
      const conditions: any[] = [];
      if (user.role !== "admin" && user.clientId) {
        conditions.push(eq(auditPagTransactions.companyId, user.clientId));
      }
      if (status) conditions.push(eq(auditPagTransactions.status, status as string));
      if (reconciliationStatus) conditions.push(eq(auditPagTransactions.reconciliationStatus, reconciliationStatus as string));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const rows = await db.select().from(auditPagTransactions)
        .where(whereClause)
        .orderBy(desc(auditPagTransactions.createdAt))
        .limit(parseInt(limitParam as string) || 100);
      res.json(rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit-pag/transactions/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const [tx] = await db.select().from(auditPagTransactions).where(eq(auditPagTransactions.id, req.params.id));
      if (!tx) return res.status(404).json({ error: "Transaction not found" });
      const logs = await db.select().from(auditPagReconciliationLog)
        .where(eq(auditPagReconciliationLog.transactionId, req.params.id))
        .orderBy(desc(auditPagReconciliationLog.createdAt));
      res.json({ ...tx, reconciliationLog: logs });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Camada 1: Ingestão do pedido do cliente (OBT/GDS/email/approval)
  app.post("/api/audit-pag/transactions/:id/layer1", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      const parsed = layer1Schema.parse(req.body);
      const [tx] = await db.select().from(auditPagTransactions).where(eq(auditPagTransactions.id, req.params.id));
      if (!tx) return res.status(404).json({ error: "Transaction not found" });

      let supplierBlocked = false;
      const cnpj = parsed.supplierCnpj || tx.supplierCnpj;
      if (cnpj && (user.clientId || tx.companyId)) {
        const compId = user.clientId || tx.companyId;
        const suppliers = await db.select().from(auditPagSuppliers).where(
          and(eq(auditPagSuppliers.companyId, compId!), eq(auditPagSuppliers.cnpj, cnpj))
        );
        if (suppliers.length === 0 || !suppliers[0].isActive || suppliers[0].status === "blocked") {
          supplierBlocked = true;
        }
      }

      const clientRequestData = {
        source: parsed.source,
        sourceId: parsed.sourceId,
        requesterName: parsed.requesterName,
        requesterDepartment: parsed.requesterDepartment,
        destination: parsed.destination,
        travelDate: parsed.travelDate,
        returnDate: parsed.returnDate,
        reservationCode: parsed.reservationCode,
        supplierConfirmation: parsed.supplierConfirmation,
        approvalReference: parsed.approvalReference,
        paymentMethod: parsed.paymentMethod,
        ...parsed.additionalData,
      };

      const updateData: any = {
        clientRequestData,
        layer1Source: parsed.source,
        layer1SourceId: parsed.sourceId || null,
        layer1At: new Date(),
        status: supplierBlocked ? "blocked" : "layer1",
        updatedAt: new Date(),
      };
      if (parsed.requestedAmount) updateData.requestedAmount = parsed.requestedAmount;
      if (parsed.supplierCnpj) updateData.supplierCnpj = parsed.supplierCnpj;
      if (parsed.supplierName) updateData.supplierName = parsed.supplierName;

      const [updated] = await db.update(auditPagTransactions).set(updateData)
        .where(eq(auditPagTransactions.id, req.params.id)).returning();

      await logAuditTrail(user.id, "layer1_ingestion", "audit_pag_transaction", req.params.id, { status: tx.status }, updateData, req.ip);
      await logReconciliationStep(req.params.id, "layer1_ingestion", supplierBlocked ? "blocked" : "match", {
        source: parsed.source,
        requestedAmount: parsed.requestedAmount,
        supplierCnpj: cnpj,
        supplierBlocked,
      });

      if (supplierBlocked) {
        await generateTransactionAlert(tx.companyId, req.params.id, "supplier_not_authorized", "critical",
          "Fornecedor não autorizado — Camada 1",
          `Camada 1: CNPJ ${cnpj} não autorizado. Transação ${tx.referenceCode} BLOQUEADA.`,
          parseFloat(parsed.requestedAmount || tx.requestedAmount || "0"), user.id);
      }

      res.json(updated);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: error.errors });
      res.status(500).json({ error: error.message });
    }
  });

  // Camada 2: Ingestão ERP (fatura/NF) + cruzamento com Camada 1
  app.post("/api/audit-pag/transactions/:id/layer2", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      const parsed = layer2Schema.parse(req.body);
      const [tx] = await db.select().from(auditPagTransactions).where(eq(auditPagTransactions.id, req.params.id));
      if (!tx) return res.status(404).json({ error: "Transaction not found" });

      const erpEntryData = {
        source: parsed.source,
        sourceId: parsed.sourceId,
        invoiceNumber: parsed.invoiceNumber,
        invoiceDate: parsed.invoiceDate,
        invoiceDueDate: parsed.invoiceDueDate,
        paymentMethodErp: parsed.paymentMethodErp,
        ...parsed.additionalData,
      };

      const updateData: any = {
        erpEntryData,
        layer2Source: parsed.source,
        layer2SourceId: parsed.sourceId || null,
        layer2At: new Date(),
        status: "layer2",
        updatedAt: new Date(),
      };
      if (parsed.invoicedAmount) updateData.invoicedAmount = parsed.invoicedAmount;
      if (parsed.supplierPaidAmount) updateData.supplierPaidAmount = parsed.supplierPaidAmount;
      if (parsed.clientPaidAmount) updateData.clientPaidAmount = parsed.clientPaidAmount;
      if (parsed.fiscalDocType) updateData.fiscalDocType = parsed.fiscalDocType;
      if (parsed.fiscalDocNumber) updateData.fiscalDocNumber = parsed.fiscalDocNumber;
      if (parsed.fiscalDocAmount) updateData.fiscalDocAmount = parsed.fiscalDocAmount;
      if (parsed.feeAmount) updateData.feeAmount = parsed.feeAmount;
      if (parsed.commissionExpected) updateData.commissionExpected = parsed.commissionExpected;
      if (parsed.incentiveExpected) updateData.incentiveExpected = parsed.incentiveExpected;

      const [updated] = await db.update(auditPagTransactions).set(updateData)
        .where(eq(auditPagTransactions.id, req.params.id)).returning();

      await logAuditTrail(user.id, "layer2_ingestion", "audit_pag_transaction", req.params.id, { status: tx.status }, updateData, req.ip);

      // Cross-match Layer 1 × Layer 2
      const crossMatchDetails: any = { source: parsed.source };
      let crossResult = "match";

      const reqAmt = parseFloat(tx.requestedAmount || "0");
      const invAmt = parseFloat(parsed.invoicedAmount || "0");
      if (reqAmt > 0 && invAmt > 0) {
        const diff = Math.abs(reqAmt - invAmt);
        const pctDiff = (diff / reqAmt) * 100;
        crossMatchDetails.requestedAmount = reqAmt;
        crossMatchDetails.invoicedAmount = invAmt;
        crossMatchDetails.difference = diff;
        crossMatchDetails.percentDiff = pctDiff.toFixed(2);
        if (pctDiff > 5) {
          crossResult = "divergent";
          await generateTransactionAlert(tx.companyId, req.params.id, "value_mismatch_l1_l2", "high",
            "Divergência Camada 1×2: valor solicitado ≠ faturado",
            `Transação ${tx.referenceCode}: solicitado R$ ${reqAmt.toFixed(2)}, faturado R$ ${invAmt.toFixed(2)} (${pctDiff.toFixed(1)}% diferença).`,
            diff, user.id);
        } else if (pctDiff > 1) {
          crossResult = "partial";
        }
      }

      const suppAmt = parseFloat(parsed.supplierPaidAmount || "0");
      const cliAmt = parseFloat(parsed.clientPaidAmount || invAmt.toString());
      if (suppAmt > 0 && cliAmt > 0 && suppAmt >= cliAmt) {
        crossMatchDetails.supplierPaidAmount = suppAmt;
        crossMatchDetails.clientPaidAmount = cliAmt;
        crossMatchDetails.invariantViolation = "supplier_paid >= client_paid";
        crossResult = "divergent";
        await generateTransactionAlert(tx.companyId, req.params.id, "invariant_violation", "critical",
          "Violação: valor fornecedor ≥ valor cliente",
          `Transação ${tx.referenceCode}: fornecedor R$ ${suppAmt.toFixed(2)} ≥ cliente R$ ${cliAmt.toFixed(2)}. Invariante violada (fornecedor deve ser < cliente).`,
          suppAmt, user.id);
      }

      await logReconciliationStep(req.params.id, "cross_match_1_2", crossResult, crossMatchDetails);

      res.json(updated);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: error.errors });
      res.status(500).json({ error: error.message });
    }
  });

  // Camada 3: Ingestão bancária (conta corrente/cartão crédito/cartão virtual) + cruzamento triplo
  app.post("/api/audit-pag/transactions/:id/layer3", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      const parsed = layer3Schema.parse(req.body);
      const [tx] = await db.select().from(auditPagTransactions).where(eq(auditPagTransactions.id, req.params.id));
      if (!tx) return res.status(404).json({ error: "Transaction not found" });

      const bankStatementData = {
        source: parsed.source,
        sourceId: parsed.sourceId,
        type: parsed.type,
        transactionDate: parsed.transactionDate,
        cardLastFour: parsed.cardLastFour,
        bankReference: parsed.bankReference,
        ...parsed.additionalData,
      };

      const updateData: any = {
        bankStatementData,
        layer3Source: parsed.source,
        layer3SourceId: parsed.sourceId || null,
        layer3Type: parsed.type,
        layer3At: new Date(),
        status: "layer3",
        updatedAt: new Date(),
      };
      if (parsed.bankConfirmedAmount) updateData.bankConfirmedAmount = parsed.bankConfirmedAmount;
      if (parsed.commissionReceived) updateData.commissionReceived = parsed.commissionReceived;
      if (parsed.incentiveReceived) updateData.incentiveReceived = parsed.incentiveReceived;
      if (parsed.supplierPaidConfirmed) updateData.supplierPaidAmount = parsed.supplierPaidConfirmed;
      if (parsed.clientPaidConfirmed) updateData.clientPaidAmount = parsed.clientPaidConfirmed;

      if (parsed.feeReceived) {
        const feeExpected = parseFloat(tx.feeAmount || "0");
        const feeActual = parseFloat(parsed.feeReceived);
        updateData.feeReconciled = Math.abs(feeExpected - feeActual) < 0.01;
      }

      const [updated] = await db.update(auditPagTransactions).set(updateData)
        .where(eq(auditPagTransactions.id, req.params.id)).returning();

      await logAuditTrail(user.id, "layer3_ingestion", "audit_pag_transaction", req.params.id, { status: tx.status }, updateData, req.ip);

      // Cross-match triplo: pedido × ERP × banco
      const tripleMatchDetails: any = { source: parsed.source, type: parsed.type };
      let tripleResult = "match";

      // 1. Confirma pagamento do cliente
      const clientPaid = parseFloat(parsed.clientPaidConfirmed || updated.clientPaidAmount || "0");
      const bankConfirmed = parseFloat(parsed.bankConfirmedAmount || "0");
      const invoiced = parseFloat(updated.invoicedAmount || "0");

      if (bankConfirmed > 0 && invoiced > 0) {
        const diff = Math.abs(bankConfirmed - invoiced);
        tripleMatchDetails.clientPaymentCheck = { bankConfirmed, invoiced, difference: diff };
        if (diff > 0.01) {
          tripleResult = "partial";
          if (diff / invoiced > 0.05) {
            tripleResult = "divergent";
            await generateTransactionAlert(tx.companyId, req.params.id, "payment_not_confirmed", "high",
              "Pagamento cliente não confirmado no banco",
              `Transação ${tx.referenceCode}: banco R$ ${bankConfirmed.toFixed(2)} ≠ fatura R$ ${invoiced.toFixed(2)}.`,
              diff, user.id);
          }
        }
      }

      // 2. Confirma pagamento ao fornecedor (fornecedor < cliente, invariante)
      const suppPaid = parseFloat(parsed.supplierPaidConfirmed || updated.supplierPaidAmount || "0");
      if (suppPaid > 0 && clientPaid > 0) {
        tripleMatchDetails.supplierPaymentCheck = { supplierPaid: suppPaid, clientPaid };
        if (suppPaid >= clientPaid) {
          tripleResult = "divergent";
          tripleMatchDetails.supplierPaymentCheck.invariantViolation = true;
          await generateTransactionAlert(tx.companyId, req.params.id, "invariant_violation_bank", "critical",
            "Violação bancária: fornecedor ≥ cliente",
            `Transação ${tx.referenceCode}: pagamento fornecedor R$ ${suppPaid.toFixed(2)} ≥ cliente R$ ${clientPaid.toFixed(2)}.`,
            suppPaid, user.id);
        }
      }

      // 3. Identifica comissões/incentivos recebidos
      const commExpected = parseFloat(updated.commissionExpected || "0");
      const commReceived = parseFloat(parsed.commissionReceived || "0");
      if (commExpected > 0) {
        tripleMatchDetails.commissionCheck = { expected: commExpected, received: commReceived };
        if (commReceived < commExpected * 0.95) {
          if (tripleResult !== "divergent") tripleResult = "partial";
          await generateTransactionAlert(tx.companyId, req.params.id, "commission_not_received", "medium",
            "Comissão não recebida integralmente",
            `Transação ${tx.referenceCode}: comissão esperada R$ ${commExpected.toFixed(2)}, recebida R$ ${commReceived.toFixed(2)}.`,
            commExpected - commReceived, user.id);
        }
      }

      const incExpected = parseFloat(updated.incentiveExpected || "0");
      const incReceived = parseFloat(parsed.incentiveReceived || "0");
      if (incExpected > 0) {
        tripleMatchDetails.incentiveCheck = { expected: incExpected, received: incReceived };
        if (incReceived < incExpected * 0.95) {
          if (tripleResult !== "divergent") tripleResult = "partial";
          await generateTransactionAlert(tx.companyId, req.params.id, "incentive_not_received", "medium",
            "Incentivo não recebido integralmente",
            `Transação ${tx.referenceCode}: incentivo esperado R$ ${incExpected.toFixed(2)}, recebido R$ ${incReceived.toFixed(2)}.`,
            incExpected - incReceived, user.id);
        }
      }

      // 4. Reconcilia FEE
      const feeExpected = parseFloat(updated.feeAmount || "0");
      const feeReceived = parseFloat(parsed.feeReceived || "0");
      if (feeExpected > 0) {
        tripleMatchDetails.feeCheck = { expected: feeExpected, received: feeReceived, reconciled: updated.feeReconciled };
        if (!updated.feeReconciled) {
          if (tripleResult !== "divergent") tripleResult = "partial";
          await generateTransactionAlert(tx.companyId, req.params.id, "fee_not_reconciled", "medium",
            "FEE não reconciliada",
            `Transação ${tx.referenceCode}: FEE esperada R$ ${feeExpected.toFixed(2)}, recebida R$ ${feeReceived.toFixed(2)}.`,
            Math.abs(feeExpected - feeReceived), user.id);
        }
      }

      // 5. Reconcilia documentos fiscais (NF/Recibo/Fatura)
      const fiscalAmt = parseFloat(updated.fiscalDocAmount || "0");
      if (fiscalAmt > 0 && bankConfirmed > 0) {
        const fiscalDiff = Math.abs(fiscalAmt - bankConfirmed);
        tripleMatchDetails.fiscalDocCheck = { docType: updated.fiscalDocType, docNumber: updated.fiscalDocNumber, docAmount: fiscalAmt, bankAmount: bankConfirmed, difference: fiscalDiff };
        if (fiscalDiff / fiscalAmt > 0.01) {
          if (tripleResult !== "divergent") tripleResult = "partial";
          await generateTransactionAlert(tx.companyId, req.params.id, "fiscal_doc_mismatch", "medium",
            `Divergência documento fiscal (${updated.fiscalDocType || "N/A"})`,
            `Transação ${tx.referenceCode}: ${updated.fiscalDocType} ${updated.fiscalDocNumber} R$ ${fiscalAmt.toFixed(2)} ≠ banco R$ ${bankConfirmed.toFixed(2)}.`,
            fiscalDiff, user.id);
        }
      }

      await logReconciliationStep(req.params.id, "cross_match_1_2_3", tripleResult, tripleMatchDetails);

      res.json(updated);
    } catch (error: any) {
      if (error.name === "ZodError") return res.status(400).json({ error: error.errors });
      res.status(500).json({ error: error.message });
    }
  });

  // Reconciliação completa — executa todos os checks em sequência
  app.post("/api/audit-pag/transactions/:id/reconcile", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      const [tx] = await db.select().from(auditPagTransactions).where(eq(auditPagTransactions.id, req.params.id));
      if (!tx) return res.status(404).json({ error: "Transaction not found" });
      if (tx.status === "blocked") return res.status(400).json({ error: "Transação bloqueada — fornecedor não autorizado" });

      const findings: string[] = [];
      let finalStatus = "matched";

      // Check 1: 3 camadas presentes
      if (!tx.layer1At) { findings.push("Camada 1 (pedido) não ingerida"); finalStatus = "divergent"; }
      if (!tx.layer2At) { findings.push("Camada 2 (ERP/fatura) não ingerida"); finalStatus = "divergent"; }
      if (!tx.layer3At) { findings.push("Camada 3 (banco) não ingerida"); finalStatus = "divergent"; }

      // Check 2: Valores cruzados
      const reqAmt = parseFloat(tx.requestedAmount || "0");
      const invAmt = parseFloat(tx.invoicedAmount || "0");
      const bankAmt = parseFloat(tx.bankConfirmedAmount || "0");
      const suppAmt = parseFloat(tx.supplierPaidAmount || "0");
      const cliAmt = parseFloat(tx.clientPaidAmount || "0");

      if (reqAmt > 0 && invAmt > 0 && Math.abs(reqAmt - invAmt) / reqAmt > 0.05) {
        findings.push(`Valor solicitado (R$ ${reqAmt.toFixed(2)}) diverge do faturado (R$ ${invAmt.toFixed(2)})`);
        finalStatus = "divergent";
      }
      if (invAmt > 0 && bankAmt > 0 && Math.abs(invAmt - bankAmt) / invAmt > 0.05) {
        findings.push(`Valor faturado (R$ ${invAmt.toFixed(2)}) diverge do banco (R$ ${bankAmt.toFixed(2)})`);
        finalStatus = "divergent";
      }
      if (suppAmt > 0 && cliAmt > 0 && suppAmt >= cliAmt) {
        findings.push(`INVARIANTE: fornecedor (R$ ${suppAmt.toFixed(2)}) ≥ cliente (R$ ${cliAmt.toFixed(2)})`);
        finalStatus = "divergent";
      }

      // Check 3: FEE
      const feeAmt = parseFloat(tx.feeAmount || "0");
      if (feeAmt > 0 && !tx.feeReconciled) {
        findings.push(`FEE R$ ${feeAmt.toFixed(2)} não reconciliada`);
        if (finalStatus === "matched") finalStatus = "partial";
      }

      // Check 4: Comissão
      const commExp = parseFloat(tx.commissionExpected || "0");
      const commRec = parseFloat(tx.commissionReceived || "0");
      if (commExp > 0 && commRec < commExp * 0.95) {
        findings.push(`Comissão: esperada R$ ${commExp.toFixed(2)}, recebida R$ ${commRec.toFixed(2)}`);
        if (finalStatus === "matched") finalStatus = "partial";
      }

      // Check 5: Incentivo
      const incExp = parseFloat(tx.incentiveExpected || "0");
      const incRec = parseFloat(tx.incentiveReceived || "0");
      if (incExp > 0 && incRec < incExp * 0.95) {
        findings.push(`Incentivo: esperado R$ ${incExp.toFixed(2)}, recebido R$ ${incRec.toFixed(2)}`);
        if (finalStatus === "matched") finalStatus = "partial";
      }

      // Check 6: Documento fiscal
      const fiscalAmt = parseFloat(tx.fiscalDocAmount || "0");
      if (fiscalAmt > 0 && bankAmt > 0 && Math.abs(fiscalAmt - bankAmt) / fiscalAmt > 0.01) {
        findings.push(`Doc fiscal (R$ ${fiscalAmt.toFixed(2)}) ≠ banco (R$ ${bankAmt.toFixed(2)})`);
        if (finalStatus === "matched") finalStatus = "partial";
      }

      const reconciliationNotes = findings.length > 0 ? findings.join(" | ") : "Todas as camadas reconciliadas com sucesso.";

      const [updated] = await db.update(auditPagTransactions).set({
        status: "reconciled",
        reconciliationStatus: finalStatus,
        reconciliationNotes,
        reconciliationAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(auditPagTransactions.id, req.params.id)).returning();

      await logAuditTrail(user.id, "reconcile", "audit_pag_transaction", req.params.id, { status: tx.status }, { reconciliationStatus: finalStatus, reconciliationNotes }, req.ip);
      await logReconciliationStep(req.params.id, "full_reconciliation", finalStatus, { findings, checks: 6 });

      if (finalStatus === "divergent") {
        await generateTransactionAlert(tx.companyId, req.params.id, "reconciliation_divergent", "high",
          "Reconciliação divergente",
          `Transação ${tx.referenceCode}: ${findings.length} divergência(s) encontrada(s). ${reconciliationNotes}`,
          Math.max(reqAmt, invAmt, bankAmt), user.id);
      }

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit-pag/transactions/:id/log", requireAuth, async (req: Request, res: Response) => {
    try {
      const logs = await db.select().from(auditPagReconciliationLog)
        .where(eq(auditPagReconciliationLog.transactionId, req.params.id))
        .orderBy(desc(auditPagReconciliationLog.createdAt));
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit-pag/reconciliation/summary", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = { id: req.session.userId!, role: req.session.role, clientId: req.session.clientId };
      const conditions: any[] = [];
      if (user.role !== "admin" && user.clientId) {
        conditions.push(eq(auditPagTransactions.companyId, user.clientId));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const allTx = await db.select().from(auditPagTransactions).where(whereClause);

      const summary = {
        total: allTx.length,
        pending: allTx.filter(t => t.reconciliationStatus === "pending").length,
        matched: allTx.filter(t => t.reconciliationStatus === "matched").length,
        partial: allTx.filter(t => t.reconciliationStatus === "partial").length,
        divergent: allTx.filter(t => t.reconciliationStatus === "divergent").length,
        blocked: allTx.filter(t => t.status === "blocked").length,
        byStatus: {
          pending: allTx.filter(t => t.status === "pending").length,
          layer1: allTx.filter(t => t.status === "layer1").length,
          layer2: allTx.filter(t => t.status === "layer2").length,
          layer3: allTx.filter(t => t.status === "layer3").length,
          reconciled: allTx.filter(t => t.status === "reconciled").length,
          blocked: allTx.filter(t => t.status === "blocked").length,
        },
        totalRequestedAmount: allTx.reduce((s, t) => s + parseFloat(t.requestedAmount || "0"), 0),
        totalInvoicedAmount: allTx.reduce((s, t) => s + parseFloat(t.invoicedAmount || "0"), 0),
        totalBankConfirmedAmount: allTx.reduce((s, t) => s + parseFloat(t.bankConfirmedAmount || "0"), 0),
        totalFeeAmount: allTx.reduce((s, t) => s + parseFloat(t.feeAmount || "0"), 0),
        feeReconciledCount: allTx.filter(t => t.feeReconciled).length,
        totalCommissionExpected: allTx.reduce((s, t) => s + parseFloat(t.commissionExpected || "0"), 0),
        totalCommissionReceived: allTx.reduce((s, t) => s + parseFloat(t.commissionReceived || "0"), 0),
        totalIncentiveExpected: allTx.reduce((s, t) => s + parseFloat(t.incentiveExpected || "0"), 0),
        totalIncentiveReceived: allTx.reduce((s, t) => s + parseFloat(t.incentiveReceived || "0"), 0),
      };
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const TRUST_PRICING_TIERS = [
    { from: 0, to: 500, rate: 0, label: "Incluído na mensalidade" },
    { from: 501, to: 2000, rate: 0.99, label: "US$ 0,99/tx" },
    { from: 2001, to: 5000, rate: 0.79, label: "US$ 0,79/tx" },
    { from: 5001, to: 10000, rate: 0.59, label: "US$ 0,59/tx" },
    { from: 10001, to: 25000, rate: 0.39, label: "US$ 0,39/tx" },
    { from: 25001, to: 50000, rate: 0.29, label: "US$ 0,29/tx" },
    { from: 50001, to: Infinity, rate: 0.19, label: "US$ 0,19/tx" },
  ];
  const TRUST_BASE_FEE = 149.00;
  const TRUST_INCLUDED_TX = 500;

  function calculateTrustBilling(totalTx: number): { baseFee: number; excessFee: number; totalFee: number; excessTx: number; tierBreakdown: any[] } {
    const excessTx = Math.max(0, totalTx - TRUST_INCLUDED_TX);
    if (excessTx === 0) return { baseFee: TRUST_BASE_FEE, excessFee: 0, totalFee: TRUST_BASE_FEE, excessTx: 0, tierBreakdown: [] };
    let remaining = excessTx;
    let excessFee = 0;
    const tierBreakdown: any[] = [];
    for (const tier of TRUST_PRICING_TIERS) {
      if (tier.rate === 0) continue;
      const tierSize = tier.to === Infinity ? remaining : Math.min(remaining, tier.to - tier.from + 1);
      if (tierSize <= 0) break;
      const tierCost = tierSize * tier.rate;
      excessFee += tierCost;
      tierBreakdown.push({ tier: `${tier.from}-${tier.to === Infinity ? "∞" : tier.to}`, qty: tierSize, rate: tier.rate, cost: Math.round(tierCost * 100) / 100 });
      remaining -= tierSize;
      if (remaining <= 0) break;
    }
    excessFee = Math.round(excessFee * 100) / 100;
    return { baseFee: TRUST_BASE_FEE, excessFee, totalFee: Math.round((TRUST_BASE_FEE + excessFee) * 100) / 100, excessTx, tierBreakdown };
  }

  function generateSealCode(companyId: string, type: string): string {
    const ts = Date.now().toString(36).toUpperCase();
    const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
    const prefix = type === "active_monitoring" ? "ATM" : "ATP";
    return `${prefix}-${ts}-${rnd}`;
  }

  app.get("/api/audit-pag/trust/pricing", requireAuth, async (_req: Request, res: Response) => {
    res.json({
      baseFee: TRUST_BASE_FEE,
      includedTransactions: TRUST_INCLUDED_TX,
      currency: "USD",
      tiers: TRUST_PRICING_TIERS.map(t => ({ from: t.from, to: t.to === Infinity ? null : t.to, rate: t.rate, label: t.label })),
      transactionDefinition: "1 transação = 1 linha conciliada por 2 ou 3 fontes (pedido × ERP × banco). Cruzamento de 2 ou 3 fontes para a mesma operação = 1 transação.",
    });
  });

  app.post("/api/audit-pag/trust/simulate-billing", requireAuth, async (req: Request, res: Response) => {
    try {
      const { totalTransactions } = req.body;
      if (!totalTransactions || totalTransactions < 0) return res.status(400).json({ error: "totalTransactions required" });
      const billing = calculateTrustBilling(totalTransactions);
      res.json(billing);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit-pag/trust/certificates", requireAuth, async (req: Request, res: Response) => {
    try {
      const companyId = req.query.companyId as string | undefined;
      const certs = companyId
        ? await db.select().from(auraTrustCertificates).where(eq(auraTrustCertificates.companyId, companyId)).orderBy(desc(auraTrustCertificates.issuedAt))
        : await db.select().from(auraTrustCertificates).orderBy(desc(auraTrustCertificates.issuedAt));
      res.json(certs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit-pag/trust/certificates/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const [cert] = await db.select().from(auraTrustCertificates).where(eq(auraTrustCertificates.id, req.params.id));
      if (!cert) return res.status(404).json({ error: "Certificate not found" });
      res.json(cert);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/audit-pag/trust/certificates", requireAuth, async (req: Request, res: Response) => {
    try {
      const { companyId, companyName, type } = req.body;
      if (!companyId || !companyName || !type) return res.status(400).json({ error: "companyId, companyName, type required" });
      if (!["active_monitoring", "period_validated"].includes(type)) return res.status(400).json({ error: "type must be active_monitoring or period_validated" });

      if (type === "active_monitoring") {
        const existingActive = await db.select().from(auraTrustCertificates).where(and(eq(auraTrustCertificates.companyId, companyId), eq(auraTrustCertificates.status, "active")));
        if (existingActive.length > 0) return res.status(400).json({ error: "Já existe um selo ativo para esta empresa. Revogue o selo atual antes de emitir um novo." });
      }

      const allTx = await db.select().from(auditPagTransactions).where(eq(auditPagTransactions.companyId, companyId));
      const reconciledTx = allTx.filter(t => t.reconciliationStatus === "matched");
      const divergentTx = allTx.filter(t => t.reconciliationStatus === "divergent");
      const totalVolume = allTx.reduce((s, t) => s + parseFloat(t.requestedAmount || "0"), 0);
      const alerts = await db.select().from(auditPagAlerts).where(eq(auditPagAlerts.companyId, companyId));
      const reconciliationRate = allTx.length > 0 ? Math.round((reconciledTx.length / allTx.length) * 10000) / 100 : 0;
      const complianceScore = allTx.length > 0 ? Math.round(((allTx.length - divergentTx.length) / allTx.length) * 10000) / 100 : 100;

      const previousCerts = await db.select().from(auraTrustCertificates).where(eq(auraTrustCertificates.companyId, companyId)).orderBy(desc(auraTrustCertificates.issuedAt)).limit(1);
      const previousHash = previousCerts.length > 0 ? previousCerts[0].integrityHash : null;

      const sealCode = generateSealCode(companyId, type);
      const now = new Date();
      const certData = {
        companyId,
        companyName,
        type,
        status: type === "active_monitoring" ? "active" : "issued",
        sealCode,
        periodStart: type === "period_validated" ? (allTx.length > 0 ? new Date(Math.min(...allTx.map(t => new Date(t.createdAt).getTime()))) : now) : now,
        periodEnd: type === "period_validated" ? now : null,
        totalTransactionsMonitored: allTx.length,
        totalVolumeMonitored: totalVolume.toFixed(2),
        totalAlertsGenerated: alerts.length,
        totalDivergencesFound: divergentTx.length,
        complianceScore: complianceScore.toFixed(2),
        reconciliationRate: reconciliationRate.toFixed(2),
        methodologyVersion: "1.0",
        issuedAt: now,
        previousCertificateHash: previousHash,
        integrityHash: "",
        metadata: {
          reconciledCount: reconciledTx.length,
          partialCount: allTx.filter(t => t.reconciliationStatus === "partial").length,
          blockedCount: allTx.filter(t => t.status === "blocked").length,
          criticalAlerts: alerts.filter(a => a.severity === "critical").length,
          highAlerts: alerts.filter(a => a.severity === "high").length,
        },
      };

      const integrityHash = generateIntegrityHash(certData, now.toISOString());
      certData.integrityHash = integrityHash;

      const [cert] = await db.insert(auraTrustCertificates).values(certData).returning();

      await logAuditTrail((req as any).user?.id || "system", "trust_certificate_issued", "aura_trust_certificate", cert.id, null, { type, sealCode, companyName });

      res.json(cert);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/audit-pag/trust/certificates/:id/revoke", requireAuth, async (req: Request, res: Response) => {
    try {
      const { reason } = req.body;
      const [cert] = await db.select().from(auraTrustCertificates).where(eq(auraTrustCertificates.id, req.params.id));
      if (!cert) return res.status(404).json({ error: "Certificate not found" });
      if (cert.status === "revoked") return res.status(400).json({ error: "Already revoked" });
      const now = new Date();
      const [updated] = await db.update(auraTrustCertificates).set({ status: "revoked", revokedAt: now, revocationReason: reason || "Monitoramento encerrado", updatedAt: now }).where(eq(auraTrustCertificates.id, req.params.id)).returning();
      await logAuditTrail((req as any).user?.id || "system", "trust_certificate_revoked", "aura_trust_certificate", cert.id, { status: cert.status }, { status: "revoked", reason });

      if (cert.type === "active_monitoring") {
        const allTx = await db.select().from(auditPagTransactions).where(eq(auditPagTransactions.companyId, cert.companyId));
        const reconciledTx = allTx.filter(t => t.reconciliationStatus === "matched");
        const divergentTx = allTx.filter(t => t.reconciliationStatus === "divergent");
        const totalVolume = allTx.reduce((s, t) => s + parseFloat(t.requestedAmount || "0"), 0);
        const alerts = await db.select().from(auditPagAlerts).where(eq(auditPagAlerts.companyId, cert.companyId));
        const reconciliationRate = allTx.length > 0 ? Math.round((reconciledTx.length / allTx.length) * 10000) / 100 : 0;
        const complianceScore = allTx.length > 0 ? Math.round(((allTx.length - divergentTx.length) / allTx.length) * 10000) / 100 : 100;
        const periodSealCode = generateSealCode(cert.companyId, "period_validated");
        const periodCertData = {
          companyId: cert.companyId,
          companyName: cert.companyName,
          type: "period_validated" as const,
          status: "issued",
          sealCode: periodSealCode,
          periodStart: cert.periodStart,
          periodEnd: now,
          totalTransactionsMonitored: allTx.length,
          totalVolumeMonitored: totalVolume.toFixed(2),
          totalAlertsGenerated: alerts.length,
          totalDivergencesFound: divergentTx.length,
          complianceScore: complianceScore.toFixed(2),
          reconciliationRate: reconciliationRate.toFixed(2),
          methodologyVersion: "1.0",
          issuedAt: now,
          previousCertificateHash: cert.integrityHash,
          integrityHash: "",
          metadata: { autoIssued: true, revokedSealCode: cert.sealCode, reconciledCount: reconciledTx.length },
        };
        periodCertData.integrityHash = generateIntegrityHash(periodCertData, now.toISOString());
        const [periodCert] = await db.insert(auraTrustCertificates).values(periodCertData).returning();
        await logAuditTrail((req as any).user?.id || "system", "trust_period_certificate_auto_issued", "aura_trust_certificate", periodCert.id, null, { autoIssued: true, revokedSealId: cert.id });
        return res.json({ revoked: updated, periodCertificate: periodCert });
      }

      res.json({ revoked: updated });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit-pag/trust/seal/:sealCode", async (req: Request, res: Response) => {
    try {
      const [cert] = await db.select().from(auraTrustCertificates).where(eq(auraTrustCertificates.sealCode, req.params.sealCode));
      if (!cert) return res.status(404).json({ error: "Seal not found", valid: false });
      const issuedAtStr = cert.issuedAt instanceof Date ? cert.issuedAt.toISOString() : new Date(cert.issuedAt).toISOString();
      const hashCheck = generateIntegrityHash({ ...cert, integrityHash: "" }, issuedAtStr);
      res.json({
        valid: cert.status !== "revoked",
        sealCode: cert.sealCode,
        companyName: cert.companyName,
        type: cert.type,
        status: cert.status,
        periodStart: cert.periodStart,
        periodEnd: cert.periodEnd,
        issuedAt: cert.issuedAt,
        complianceScore: cert.complianceScore,
        reconciliationRate: cert.reconciliationRate,
        totalTransactionsMonitored: cert.totalTransactionsMonitored,
        integrityVerified: hashCheck === cert.integrityHash,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit-pag/trust/metering", requireAuth, async (req: Request, res: Response) => {
    try {
      const companyId = req.query.companyId as string | undefined;
      const records = companyId
        ? await db.select().from(auraTrustMetering).where(eq(auraTrustMetering.companyId, companyId)).orderBy(desc(auraTrustMetering.billingPeriodStart))
        : await db.select().from(auraTrustMetering).orderBy(desc(auraTrustMetering.billingPeriodStart));
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/audit-pag/trust/metering/calculate", requireAuth, async (req: Request, res: Response) => {
    try {
      const { companyId, periodStart, periodEnd } = req.body;
      if (!companyId || !periodStart || !periodEnd) return res.status(400).json({ error: "companyId, periodStart, periodEnd required" });

      const start = new Date(periodStart);
      const end = new Date(periodEnd);

      const txInPeriod = await db.select().from(auditPagTransactions).where(
        and(
          eq(auditPagTransactions.companyId, companyId),
          gte(auditPagTransactions.createdAt, start),
          lte(auditPagTransactions.createdAt, end)
        )
      );

      const reconciledTx = txInPeriod.filter(t => ["matched", "partial"].includes(t.reconciliationStatus || ""));
      const totalTx = reconciledTx.length;

      const billing = calculateTrustBilling(totalTx);
      const now = new Date();
      const meteringData = {
        companyId,
        billingPeriodStart: start,
        billingPeriodEnd: end,
        totalTransactions: totalTx,
        includedTransactions: TRUST_INCLUDED_TX,
        excessTransactions: billing.excessTx,
        baseFee: billing.baseFee.toFixed(2),
        excessFee: billing.excessFee.toFixed(2),
        totalFee: billing.totalFee.toFixed(2),
        tierBreakdown: billing.tierBreakdown,
        status: "calculated",
        integrityHash: "",
      };
      meteringData.integrityHash = generateIntegrityHash(meteringData, now.toISOString());

      const [record] = await db.insert(auraTrustMetering).values(meteringData).returning();
      await logAuditTrail((req as any).user?.id || "system", "trust_metering_calculated", "aura_trust_metering", record.id, null, { totalTx, totalFee: billing.totalFee });

      res.json(record);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/audit-pag/trust/summary", requireAuth, async (req: Request, res: Response) => {
    try {
      const companyId = req.query.companyId as string | undefined;

      const allCerts = companyId
        ? await db.select().from(auraTrustCertificates).where(eq(auraTrustCertificates.companyId, companyId)).orderBy(desc(auraTrustCertificates.issuedAt))
        : await db.select().from(auraTrustCertificates).orderBy(desc(auraTrustCertificates.issuedAt));

      const activeCerts = allCerts.filter(c => c.status === "active");
      const issuedCerts = allCerts.filter(c => c.status === "issued");
      const revokedCerts = allCerts.filter(c => c.status === "revoked");

      const allMetering = companyId
        ? await db.select().from(auraTrustMetering).where(eq(auraTrustMetering.companyId, companyId)).orderBy(desc(auraTrustMetering.billingPeriodStart))
        : await db.select().from(auraTrustMetering).orderBy(desc(auraTrustMetering.billingPeriodStart));

      const totalBilled = allMetering.reduce((s, m) => s + parseFloat(m.totalFee || "0"), 0);

      res.json({
        totalCertificates: allCerts.length,
        activeSealCount: activeCerts.length,
        issuedCertificateCount: issuedCerts.length,
        revokedCount: revokedCerts.length,
        currentActiveSeal: activeCerts.length > 0 ? activeCerts[0] : null,
        latestCertificate: allCerts.length > 0 ? allCerts[0] : null,
        meteringRecords: allMetering.length,
        totalBilled: Math.round(totalBilled * 100) / 100,
        pricing: {
          baseFee: TRUST_BASE_FEE,
          includedTransactions: TRUST_INCLUDED_TX,
          tiers: TRUST_PRICING_TIERS.map(t => ({ from: t.from, to: t.to === Infinity ? null : t.to, rate: t.rate, label: t.label })),
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}

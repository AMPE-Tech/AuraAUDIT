import { Express, Request, Response } from "express";
import { requireAuth } from "./auth";
import { db } from "./db";
import { contractSignatures, clients } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { createHash } from "crypto";
import { z } from "zod";

const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  cnpj: z.string().min(11).optional(),
  contactName: z.string().min(2).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const CONTRACT_VERSION = "1.0.0";

function generateContractText(auditorData: any, clientData: any): string {
  const auditorName = auditorData?.name || "AuraAUDIT - AuraDue Tecnologia Ltda";
  const auditorCnpj = auditorData?.cnpj || "00.000.000/0001-00";
  const auditorEmail = auditorData?.contactEmail || "contato@auraaudit.com";
  const clientName = clientData?.name || "Cliente";
  const clientCnpj = clientData?.cnpj || "00.000.000/0000-00";
  const clientEmail = clientData?.contactEmail || "";

  return `CONTRATO DE PRESTACAO DE SERVICOS DE AUDITORIA FORENSE

Contrato n. AUR-2025-0042

CONTRATANTE: ${clientName}
CNPJ: ${clientCnpj}
Email: ${clientEmail}

CONTRATADA: ${auditorName}
CNPJ: ${auditorCnpj}
Email: ${auditorEmail}

OBJETO: Prestacao de servicos de auditoria forense independente em despesas de viagens corporativas e eventos, abrangendo os exercicios de 2024 (volume estimado de R$ 51,3 milhoes) e 2025 (volume estimado de R$ 39,6 milhoes).

1. ESCOPO DOS SERVICOS
1.1. Auditoria forense completa em despesas de viagens corporativas e eventos
1.2. Analise de conformidade com politicas internas de viagens
1.3. Reconciliacao entre sistemas OBT (Reserve, Argo) e Backoffice (Wintour, Stur)
1.4. Identificacao de anomalias, duplicidades e fraudes potenciais
1.5. Cruzamento de dados com fontes externas (companhias aereas, agencias, EBTA)
1.6. Avaliacao de eficiencia operacional e oportunidades de economia
1.7. Verificacao de aderencia a Lei 13.964/2019 e normas anticorrupcao

2. ENTREGAVEIS
2.1. Relatorio Executivo de Auditoria (a cada fase concluida)
2.2. Relatorio Tecnico Detalhado (ao final do projeto)
2.3. Matriz de Riscos e Anomalias (Fase 03)
2.4. Parecer de Conformidade Legal (Fase 04)
2.5. Plano de Recomendacoes e Acoes Corretivas (Fase 05)
2.6. Dashboard Interativo de Resultados (disponivel em tempo real)
2.7. Cadeia de Custodia Digital Completa (continuo)

3. SLA - ACORDO DE NIVEL DE SERVICO
3.1. Tempo de resposta a incidentes criticos: ate 4 horas uteis
3.2. Atualizacao de status do projeto: diariamente via dashboard
3.3. Entrega de relatorios parciais: ate 48 horas apos cada fase
3.4. Entrega do relatorio final: ate 5 dias uteis apos conclusao
3.5. Reunioes de alinhamento: semanalmente ou sob demanda
3.6. Disponibilidade da equipe: dias uteis, 08h as 18h

4. VIGENCIA
4.1. Inicio: 15/01/2025
4.2. Termino: 31/12/2025
4.3. Podendo ser prorrogado mediante termo aditivo

5. CONFIDENCIALIDADE
Todas as informacoes compartilhadas durante a auditoria sao tratadas como confidenciais e protegidas por NDA assinado entre as partes.

6. CADEIA DE CUSTODIA
Todos os dados e evidencias sao mantidos em cadeia de custodia digital certificada, garantindo integridade e rastreabilidade conforme a Lei 13.964/2019 (Pacote Anticrime).

7. PROPRIEDADE INTELECTUAL
Os relatorios e analises produzidos sao de propriedade do contratante. A metodologia e ferramentas de auditoria permanecem propriedade da ${auditorName}.

8. PROTECAO DE DADOS
O tratamento de dados pessoais segue rigorosamente a LGPD (Lei 13.709/2018), com medidas tecnicas e administrativas de seguranca.

9. INDEPENDENCIA
A equipe de auditoria mantem total independencia e imparcialidade durante todo o processo, sem vinculo com as areas auditadas.

10. RESCISAO
O contrato pode ser rescindido por qualquer das partes com aviso previo de 30 dias, resguardados os direitos sobre trabalhos ja realizados.

11. VALIDADE JURIDICA DA ASSINATURA ELETRONICA
Este contrato e assinado eletronicamente nos termos da Lei 14.063/2020 (assinatura eletronica simples) e da Medida Provisoria 2.200-2/2001. A integridade do documento e garantida por hash criptografico SHA-256, registrando IP, user-agent, timestamp e identificacao do signatario.

${auditorName}
Versao do contrato: ${CONTRACT_VERSION}`;
}

function hashContractText(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

async function getAuditorProfile() {
  const [auditor] = await db
    .select()
    .from(clients)
    .where(eq(clients.type, "auditor"))
    .limit(1);
  return auditor || null;
}

async function getClientProfile(userId: string) {
  const { users } = await import("@shared/schema");
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user?.clientId) return null;
  const [client] = await db.select().from(clients).where(eq(clients.id, user.clientId));
  return client || null;
}

export function registerContractRoutes(app: Express) {
  app.get("/api/contract/text", requireAuth, async (req: Request, res: Response) => {
    const userId = req.session.userId!;
    const auditor = await getAuditorProfile();
    const client = await getClientProfile(userId);
    const contractText = generateContractText(auditor, client);

    res.json({
      contractNumber: "AUR-2025-0042",
      version: CONTRACT_VERSION,
      text: contractText,
      sha256: hashContractText(contractText),
      auditor: auditor ? { name: auditor.name, cnpj: auditor.cnpj, email: auditor.contactEmail } : null,
      client: client ? { name: client.name, cnpj: client.cnpj, email: client.contactEmail } : null,
    });
  });

  app.get("/api/contract/signature", requireAuth, async (req: Request, res: Response) => {
    const userId = req.session.userId!;
    const signatures = await db
      .select()
      .from(contractSignatures)
      .where(eq(contractSignatures.userId, userId))
      .orderBy(desc(contractSignatures.signedAt));

    if (signatures.length === 0) {
      return res.json({ signed: false, signature: null });
    }
    return res.json({ signed: true, signature: signatures[0] });
  });

  app.get("/api/contract/signature/:contractNumber", requireAuth, async (req: Request, res: Response) => {
    const { contractNumber } = req.params;
    const signatures = await db
      .select()
      .from(contractSignatures)
      .where(eq(contractSignatures.contractNumber, contractNumber))
      .orderBy(desc(contractSignatures.signedAt));

    return res.json({ signatures });
  });

  app.post("/api/contract/sign", requireAuth, async (req: Request, res: Response) => {
    const userId = req.session.userId!;
    const fullName = req.session.fullName || "Unknown";

    const existing = await db
      .select()
      .from(contractSignatures)
      .where(eq(contractSignatures.userId, userId));

    if (existing.length > 0) {
      return res.status(400).json({ error: "Contrato ja assinado por este usuario." });
    }

    const { signerRole, companyName, companyCnpj } = req.body;

    if (!signerRole) {
      return res.status(400).json({ error: "Cargo/funcao do signatario e obrigatorio." });
    }

    const auditor = await getAuditorProfile();
    const client = await getClientProfile(userId);
    const contractText = generateContractText(auditor, client);
    const contractSha256 = hashContractText(contractText);
    const ipAddress = req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.socket.remoteAddress || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    const [signature] = await db
      .insert(contractSignatures)
      .values({
        contractNumber: "AUR-2025-0042",
        userId,
        signerName: fullName,
        signerRole,
        companyName: companyName || client?.name || null,
        companyCnpj: companyCnpj || client?.cnpj || null,
        contractTextSha256: contractSha256,
        contractVersion: CONTRACT_VERSION,
        ipAddress,
        userAgent,
      })
      .returning();

    return res.json({
      success: true,
      signature,
      proof: {
        contractSha256,
        ipAddress,
        userAgent,
        signedAt: signature.signedAt,
        legalBasis: "Lei 14.063/2020 (assinatura eletronica simples), MP 2.200-2/2001",
      },
    });
  });

  app.get("/api/company/auditor", requireAuth, async (_req: Request, res: Response) => {
    const auditor = await getAuditorProfile();
    return res.json({ profile: auditor });
  });

  app.patch("/api/company/auditor", requireAuth, async (req: Request, res: Response) => {
    if (req.session.role !== "admin") {
      return res.status(403).json({ error: "Acesso restrito ao administrador." });
    }
    const auditor = await getAuditorProfile();
    if (!auditor) {
      return res.status(404).json({ error: "Perfil da empresa auditora nao encontrado." });
    }
    const parsed = profileUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Dados invalidos.", details: parsed.error.flatten() });
    }
    const { name, cnpj, contactName, contactEmail, contactPhone, address, city, state, notes } = parsed.data;
    const [updated] = await db
      .update(clients)
      .set({
        name: name || auditor.name,
        cnpj: cnpj || auditor.cnpj,
        contactName: contactName || auditor.contactName,
        contactEmail: contactEmail || auditor.contactEmail,
        contactPhone: contactPhone !== undefined ? contactPhone : auditor.contactPhone,
        address: address !== undefined ? address : auditor.address,
        city: city !== undefined ? city : auditor.city,
        state: state !== undefined ? state : auditor.state,
        notes: notes !== undefined ? notes : auditor.notes,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, auditor.id))
      .returning();
    return res.json({ profile: updated });
  });

  app.get("/api/company/my-profile", requireAuth, async (req: Request, res: Response) => {
    const userId = req.session.userId!;
    const client = await getClientProfile(userId);
    return res.json({ profile: client });
  });

  app.patch("/api/company/my-profile", requireAuth, async (req: Request, res: Response) => {
    const userId = req.session.userId!;
    const client = await getClientProfile(userId);
    if (!client) {
      return res.status(404).json({ error: "Perfil do cliente nao encontrado." });
    }
    const parsed = profileUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Dados invalidos.", details: parsed.error.flatten() });
    }
    const { name, cnpj, contactName, contactEmail, contactPhone, address, city, state, notes } = parsed.data;
    const [updated] = await db
      .update(clients)
      .set({
        name: name || client.name,
        cnpj: cnpj || client.cnpj,
        contactName: contactName || client.contactName,
        contactEmail: contactEmail || client.contactEmail,
        contactPhone: contactPhone !== undefined ? contactPhone : client.contactPhone,
        address: address !== undefined ? address : client.address,
        city: city !== undefined ? city : client.city,
        state: state !== undefined ? state : client.state,
        notes: notes !== undefined ? notes : client.notes,
        updatedAt: new Date(),
      })
      .where(eq(clients.id, client.id))
      .returning();
    return res.json({ profile: updated });
  });

  app.get("/api/contract/whatsapp-link", requireAuth, async (req: Request, res: Response) => {
    const userId = req.session.userId!;
    const client = await getClientProfile(userId);
    const phone = client?.contactPhone?.replace(/\D/g, "") || "";
    const contractUrl = `${req.protocol}://${req.get("host")}/contract`;
    const message = `Prezado(a) ${client?.contactName || "Cliente"},\n\nSegue o link para visualizacao e assinatura digital do contrato de auditoria forense:\n\n${contractUrl}\n\nContrato: AUR-2025-0042\nEmpresa: ${client?.name || ""}\n\nA assinatura e feita digitalmente com validade juridica (Lei 14.063/2020).\n\nAtenciosamente,\nAuraAUDIT`;
    const whatsappUrl = `https://wa.me/${phone ? phone : ""}?text=${encodeURIComponent(message)}`;
    return res.json({ whatsappUrl, phone, message });
  });
}

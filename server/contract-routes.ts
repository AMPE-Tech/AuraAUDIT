import { Express, Request, Response } from "express";
import { requireAuth } from "./auth";
import { db } from "./db";
import { contractSignatures } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { createHash } from "crypto";

const CONTRACT_VERSION = "1.0.0";

const CONTRACT_TEXT = `CONTRATO DE PRESTACAO DE SERVICOS DE AUDITORIA FORENSE

Contrato n. AUR-2025-0042

CONTRATANTE: Grupo Stabia
CNPJ: 12.345.678/0001-90

CONTRATADA: AuraAUDIT - AuraDue Tecnologia Ltda
CNPJ: 98.765.432/0001-10

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
Os relatorios e analises produzidos sao de propriedade do contratante. A metodologia e ferramentas de auditoria permanecem propriedade da AuraAUDIT.

8. PROTECAO DE DADOS
O tratamento de dados pessoais segue rigorosamente a LGPD (Lei 13.709/2018), com medidas tecnicas e administrativas de seguranca.

9. INDEPENDENCIA
A equipe de auditoria mantem total independencia e imparcialidade durante todo o processo, sem vinculo com as areas auditadas.

10. RESCISAO
O contrato pode ser rescindido por qualquer das partes com aviso previo de 30 dias, resguardados os direitos sobre trabalhos ja realizados.

11. VALIDADE JURIDICA DA ASSINATURA ELETRONICA
Este contrato e assinado eletronicamente nos termos da Lei 14.063/2020 (assinatura eletronica simples) e da Medida Provisoria 2.200-2/2001. A integridade do documento e garantida por hash criptografico SHA-256, registrando IP, user-agent, timestamp e identificacao do signatario.

AuraAUDIT - AuraDue Tecnologia Ltda
Versao do contrato: ${CONTRACT_VERSION}`;

function hashContractText(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export function registerContractRoutes(app: Express) {
  app.get("/api/contract/text", requireAuth, (_req: Request, res: Response) => {
    res.json({
      contractNumber: "AUR-2025-0042",
      version: CONTRACT_VERSION,
      text: CONTRACT_TEXT,
      sha256: hashContractText(CONTRACT_TEXT),
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

    const contractSha256 = hashContractText(CONTRACT_TEXT);
    const ipAddress = req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.socket.remoteAddress || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";

    const [signature] = await db
      .insert(contractSignatures)
      .values({
        contractNumber: "AUR-2025-0042",
        userId,
        signerName: fullName,
        signerRole,
        companyName: companyName || null,
        companyCnpj: companyCnpj || null,
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
}

import { Express, Request, Response } from "express";
import { requireAuth } from "./auth";
import { db } from "./db";
import { contractSignatures, clients } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { createHash } from "crypto";
import { z } from "zod";
import { validateCNPJ, validateCPF, detectDocumentType } from "@shared/validators";

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

const CONTRACT_VERSION = "2.1.0";

function generateContractText(auditorData: any, clientData: any): string {
  const auditorName = auditorData?.name || "AuraAUDIT - AuraDue Tecnologia Ltda";
  const auditorCnpj = auditorData?.cnpj || "00.000.000/0001-00";
  const auditorEmail = auditorData?.contactEmail || "contato@auraaudit.com";
  const clientName = clientData?.name || "Cliente";
  const clientCnpj = clientData?.cnpj || "00.000.000/0000-00";
  const clientEmail = clientData?.contactEmail || "";

  return `CONTRATO TECNICO MASTER DE PRESTACAO DE SERVICOS DE AUDITORIA FORENSE

Contrato n. AUR-2025-0042 | Versao ${CONTRACT_VERSION}

CONTRATANTE: ${clientName}
CNPJ: ${clientCnpj}
Email: ${clientEmail}

CONTRATADA: ${auditorName}
CNPJ: ${auditorCnpj}
Email: ${auditorEmail}

OBJETO: Prestacao de servicos de auditoria forense independente, consultoria tecnica, monitoramento continuo, servicos de IA sob demanda e ferramentas digitais para gestao de despesas corporativas, viagens, eventos e contratos, conforme catalogo de servicos descrito neste instrumento.

--- PARTE I — CATALOGO DE SERVICOS ---

1. SERVICOS NIVEL P0 — CORE AURAAUDIT

1.1. REVISAO TECNICA / AUDITORIA FINANCEIRA
1.1.1. Auditoria financeira 100% online com conciliacao multi-vias
1.1.2. Conciliacao 4 vias: PNR/TKT/EMD + fatura + cartao/VCN + expense
1.1.3. Auditoria de taxas/fees/markups (cobrado vs contratado)
1.1.4. Auditoria de reembolsos/creditos, no-show, cancelamentos
1.1.5. Hotel Folio Audit (reserva vs folio vs politica vs acordo)
1.1.6. Auditoria de eventos (budget vs realizado + pagamentos + documentos)

1.2. MONITORAMENTO CONTINUO (ASSINATURA)
1.2.1. Compliance + Savings + Alertas em regime de assinatura recorrente
1.2.2. Auditoria recorrente (mensal/quinzenal/semanal/real-time)
1.2.3. Score de compliance + ranking de excecoes
1.2.4. Alertas de divergencia e cobranca indevida
1.2.5. Relatorios executivos + evidence packs

1.3. CADEIA DE CUSTODIA & RASTREABILIDADE JURIDICA
1.3.1. Evidence packs por caso/evento (raw + logs + versoes de regras)
1.3.2. Trilha de auditoria de alteracoes (client-controlled)
1.3.3. Dossie auditavel para Compliance, Juridico e auditoria externa
1.3.4. Conformidade com Lei 13.964/2019 (Pacote Anticrime)

2. SERVICOS NIVEL P1 — ALTA RELEVANCIA

2.1. CONSULTORIA DE CONTRATOS TECNICOS
2.1.1. Confeccao/revisao de contrato tecnico de agenciamento (TMC + fornecedores)
2.1.2. Matriz contratado vs executado + SLAs + faturamento analitico
2.1.3. Clausulas de evidencia, LGPD, governanca e dispute process

2.2. POLITICA DE VIAGENS & WORKFLOW DE EXCECOES
2.2.1. Ajuste/criacao da policy (classes, tetos, preferenciais, antecedencia)
2.2.2. Regras de excecao (alcadas, justificativas, evidencia obrigatoria)
2.2.3. Medicao continua e revisao trimestral

2.3. SLA & KPIS OPERACIONAIS
2.3.1. Definicao e mensuracao de SLAs (emissao, pos-venda, 24/7)
2.3.2. KPIs (FCR, TMA, backlog, reacomodacao, creditos)
2.3.3. Scorecards mensais com plano de acao

3. SERVICOS NIVEL P2 — RELEVANCIA MEDIA

3.1. EXECUCAO DE CONCORRENCIAS (RFP/RFQ)
3.1.1. RFP de TMC/OBT/hotel/locadora/eventos
3.1.2. Matriz comparativa + recomendacao
3.1.3. Apoio a negociacao (rodadas remotas)

3.2. ANTIFRAUDE & ANOMALIAS (AVANCADO)
3.2.1. Regras avancadas e deteccao de padroes
3.2.2. Segregacao de funcoes e alertas por risco
3.2.3. Investigacoes internas com evidence packs

3.3. TREINAMENTOS (EAD)
3.3.1. Treinamento de policy, uso do OBT, compliance de eventos, boas praticas
3.3.2. Trilhas por papel (viajante, aprovador, financeiro, eventos)

4. SERVICOS NIVEL P3 — VERTICAL PREMIUM

4.1. SUPORTE ADMINISTRATIVO HEALTH CARE
4.1.1. Fluxo end-to-end para eventos e viagens no setor farmaceutico/healthcare
4.1.2. Agendamento > cadastro > juridico/compliance > pre-evento > pos-evento > pagamento > fechamento > auditoria
4.1.3. Gestao documental e contratos com conformidade (FMV/legislacao)
4.1.4. Dossie para auditoria externa

--- PARTE II — MODULOS DIGITAIS & ADD-ONS ---

5. AURAAUDIT PASS (ASSINATURA DIGITAL)
5.1. Plano base: US$ 99/mes para auditoria de ate US$ 10.000/mes em VAM (Volume Auditado Mensal)
5.2. Taxa progressiva sobre excedente: 0,30% (ate US$ 100k), 0,28% (ate US$ 300k), 0,26% (ate US$ 600k), 0,24% (ate US$ 800k), 0,22% (ate US$ 1M), 0,20% (acima de US$ 1M)
5.3. CAP maximo mensal: US$ 3.000/mes
5.4. Inclui: dashboard interativo, trilha de auditoria, cadeia de custodia digital, relatorios automatizados
5.5. Checkout via Stripe com aceite de termos (SHA-256 hash, IP, user-agent registrados)

6. AI DESK — CATALOGO DE SERVICOS DE IA SOB DEMANDA
6.1. Modelo de consumo: creditos pre-pagos (1 credito = US$ 1)
6.2. Pacotes de recarga: 500, 1.500 ou 5.000 creditos
6.3. Fluxo obrigatorio: Criar Job > Gerar Cotacao > Aprovar > Executar > Resultado + Envelope de Auditoria
6.4. Servicos disponiveis:
  6.4.1. Revisao de Contrato — base 60 creditos + 6/pagina (revisao humana 1,5x)
  6.4.2. Resposta a Edital/RFP — base 120 creditos + 8/pagina (+80 matriz de compliance)
  6.4.3. SLA + KPI + Scorecard — base 150 creditos (+50 SLA tecnico, +50 KPI dashboard)
  6.4.4. Plano 30/60/90 — base 80 creditos (+20 owners/timeline)
6.5. Cada job gera envelope de auditoria com SHA-256 (inputs, processamento, outputs, timestamps)
6.6. Opcao de revisao humana disponivel para todos os servicos

7. WALLET DE CREDITOS
7.1. Carteira digital com saldo em creditos
7.2. Recarga via Stripe (pacotes de 500, 1.500 ou 5.000 creditos)
7.3. Ledger completo e auditavel (topup, debit, refund, adjustment)
7.4. Saldo verificado automaticamente antes da aprovacao de cada job
7.5. Transparencia: orcamento detalhado antes de cada execucao

--- PARTE III — DISPOSICOES GERAIS ---

8. ESCOPO ESPECIFICO DO PROJETO
8.1. Auditoria forense dos exercicios 2024 (R$ 51,3M) e 2025 (R$ 39,6M)
8.2. Reconciliacao OBT (Reserve, Argo) vs Backoffice (Wintour 2024, Stur 2025)
8.3. Cruzamento com fontes externas: cias aereas, agencias, EBTA Bradesco, GDS Sabre/Amadeus, BSPlink
8.4. Analise em 9 areas: conformidade, governanca, integridade, contratos, controles, falhas, vulnerabilidades, riscos, otimizacao

9. ENTREGAVEIS
9.1. Relatorio Executivo de Auditoria (a cada fase concluida)
9.2. Relatorio Tecnico Detalhado (ao final do projeto)
9.3. Matriz de Riscos e Anomalias
9.4. Parecer de Conformidade Legal
9.5. Plano de Recomendacoes e Acoes Corretivas
9.6. Dashboard Interativo de Resultados (tempo real)
9.7. Cadeia de Custodia Digital Completa (continuo)
9.8. Envelopes de auditoria para todos os servicos de IA executados

10. SLA — ACORDO DE NIVEL DE SERVICO
10.1. Tempo de resposta a incidentes criticos: ate 4 horas uteis
10.2. Atualizacao de status do projeto: diariamente via dashboard
10.3. Entrega de relatorios parciais: ate 48 horas apos cada fase
10.4. Entrega do relatorio final: ate 5 dias uteis apos conclusao
10.5. Reunioes de alinhamento: semanalmente ou sob demanda
10.6. Disponibilidade da equipe: dias uteis, 08h as 18h
10.7. AI Desk: cotacao em ate 2 minutos, execucao em ate 10 minutos por job

11. VIGENCIA
11.1. Inicio: 15/01/2025
11.2. Termino: 31/12/2025
11.3. Podendo ser prorrogado mediante termo aditivo

12. CADASTRO E VALIDACAO DE PARTES
12.1. CNPJ validado matematicamente (algoritmo de digitos verificadores) antes de qualquer operacao
12.2. Consulta a Receita Federal (BrasilAPI) para preenchimento automatico de dados cadastrais
12.3. CPF do representante legal validado matematicamente quando informado
12.4. Validacao aplicada em: cadastro de clientes, assinatura de contrato, perfis de empresa

13. CONFIDENCIALIDADE
Todas as informacoes compartilhadas sao tratadas como confidenciais e protegidas por NDA assinado entre as partes.

14. CADEIA DE CUSTODIA DIGITAL
14.1. Todos os dados e evidencias sao mantidos em cadeia de custodia digital certificada
14.2. Hashes SHA-256 deterministicos para cada registro, documento e artefato
14.3. Trilha de auditoria imutavel com integridade verificavel
14.4. Envelopes de auditoria para servicos de IA (inputs + processamento + outputs + SHA-256)
14.5. Conformidade com Lei 13.964/2019 (Pacote Anticrime)

15. SISTEMA ANTIREGRESSAO
15.1. Toda alteracao em dados auditados e registrada com estado anterior (dataBefore) e posterior (dataAfter)
15.2. Hash de integridade SHA-256 calculado para cada entrada da trilha de auditoria
15.3. Registros de auditoria sao imutaveis (append-only) — nao podem ser editados ou excluidos
15.4. Versionamento de contratos: cada versao gera novo SHA-256, versoes anteriores permanecem registradas
15.5. Ledger de creditos append-only: cada transacao e registrada individualmente sem alteracao de registros anteriores
15.6. Validacao matematica de documentos (CNPJ/CPF) impede regressao de dados cadastrais invalidos
15.7. Termos de servico versionados com SHA-256 — aceite vinculado a versao especifica

16. SISTEMA ANTIALUCINACAO (AI DESK)
16.1. Todos os outputs de IA sao acompanhados de envelope de auditoria com hash SHA-256
16.2. Inputs do usuario sao registrados e hasheados — garantia de que o resultado corresponde a solicitacao original
16.3. Cotacao obrigatoria antes da execucao — usuario ve o escopo antes de aprovar
16.4. Opcao de revisao humana disponivel para todos os servicos de IA
16.5. Outputs sao armazenados com hash individual — qualquer alteracao posterior e detectavel
16.6. Modelo de IA, versao e parametros de execucao registrados no envelope de auditoria
16.7. A IA sugere e gera, mas o usuario decide e aprova — controle humano em todas as etapas
16.8. Jobs cancelados ou com falha sao registrados com status e motivo para rastreabilidade

17. PROPRIEDADE INTELECTUAL
Os relatorios e analises produzidos sao de propriedade do contratante. A metodologia, ferramentas e modelos de IA permanecem propriedade da ${auditorName}.

18. PROTECAO DE DADOS
O tratamento de dados pessoais segue rigorosamente a LGPD (Lei 13.709/2018), com medidas tecnicas e administrativas de seguranca. Dados de CPF sao armazenados e exibidos com mascaramento parcial.

19. INDEPENDENCIA
A equipe de auditoria mantem total independencia e imparcialidade durante todo o processo, sem vinculo com as areas auditadas.

20. RESCISAO
O contrato pode ser rescindido por qualquer das partes com aviso previo de 30 dias, resguardados os direitos sobre trabalhos ja realizados e creditos nao utilizados.

21. VALIDADE JURIDICA DA ASSINATURA ELETRONICA
21.1. Este contrato e assinado eletronicamente nos termos da Lei 14.063/2020 (assinatura eletronica simples) e da Medida Provisoria 2.200-2/2001
21.2. Integridade garantida por hash criptografico SHA-256
21.3. Registrados: IP, user-agent, timestamp, identificacao do signatario e CPF (quando informado)
21.4. Cadeia de custodia da assinatura: contrato texto -> SHA-256 -> assinatura -> registro imutavel

22. CANAIS DE ASSINATURA E DISTRIBUICAO DO CONTRATO
22.1. Disponibilidade: o contrato esta disponivel para assinatura online (versao padrao via plataforma nativa AuraAUDIT) e offline (versao customizada para o cliente, gerada pela plataforma para impressao e assinatura manual)
22.2. Assinatura via plataforma: o contratante pode assinar digitalmente diretamente na plataforma AuraAUDIT, com registro automatico de SHA-256, IP, user-agent, timestamp e CPF (quando informado)
22.3. Envio por email: o contrato pode ser enviado por email ao contratante com link direto para visualizacao e assinatura digital na plataforma
22.4. Envio por WhatsApp: o contrato pode ser enviado via WhatsApp ao contratante com link para assinatura digital, facilitando acesso remoto e comunicacao direta
22.5. Painel administrativo: o administrador pode gerenciar o envio, verificar status de assinatura, reenviar por email ou WhatsApp, e copiar link do contrato a partir do painel de contratos da plataforma
22.6. Equivalencia juridica: a assinatura eletronica realizada em qualquer dos canais descritos possui a mesma validade juridica nos termos da Lei 14.063/2020 e MP 2.200-2/2001
22.7. Rastreabilidade de envio: cada envio por email ou WhatsApp e registrado na trilha de auditoria com timestamp, canal utilizado e destinatario

--- ANEXO I — EVIDENCIAS TECNICAS ---

E1. Cadastro padronizado: CNPJ/CPF com validacao matematica + consulta Receita Federal
E2. Contrato dinamico: texto gerado a partir de dados cadastrais verificados do contratante e contratada
E3. Assinatura digital: SHA-256 do texto integral, IP, user-agent, timestamp, CPF (quando informado, exibido mascarado)
E4. Trilha de auditoria: registros imutaveis com hash de integridade por entrada
E5. AI Desk: envelope de auditoria por job (inputs hasheados, modelo/versao, outputs hasheados, envelope SHA-256)
E6. Wallet: ledger append-only com referencia cruzada (job_id, tipo, creditos, valor USD)
E7. Antiregressao: dataBefore/dataAfter em cada mutacao, versionamento de contratos e termos
E8. Antialucinacao: cotacao previa, aprovacao humana, revisao opcional, envelope SHA-256 por output
E9. Assinatura online: plataforma nativa com formulario de assinatura digital, validacao de CPF/CNPJ, registro de prova (SHA-256, IP, user-agent, timestamp)
E10. Assinatura offline: contrato customizado para o cliente, gerado pela plataforma com dados cadastrais especificos do contratante, disponivel para impressao e assinatura manual (diferente da versao online padrao)
E11. Distribuicao por email: envio de contrato com link para assinatura via plataforma, registrado na trilha de auditoria
E12. Distribuicao por WhatsApp: envio de contrato via WhatsApp com link direto para assinatura digital, com numero do destinatario e mensagem registrados

--- ANEXO II — ADITIVO DE 26/02/2026 ---

ADITIVO CONTRATUAL — Versao 2.1.0

Objeto do aditivo: Inclusao da clausula 22 (Canais de Assinatura e Distribuicao do Contrato) e das evidencias E9 a E12 ao Contrato Tecnico Master.

Justificativa: Formalizar que o contrato esta disponivel para assinatura tanto offline quanto online via plataforma nativa AuraAUDIT, com opcao de envio por email e WhatsApp, garantindo flexibilidade, acessibilidade e rastreabilidade juridica em todos os canais.

Alteracoes realizadas:
A1. Adicionada clausula 22 — Canais de Assinatura e Distribuicao do Contrato (7 subcláusulas: 22.1 a 22.7)
A2. Adicionadas evidencias E9 (assinatura online), E10 (assinatura offline), E11 (distribuicao por email), E12 (distribuicao por WhatsApp)
A3. Versao do contrato atualizada de 2.0.0 para 2.1.0
A4. Hash SHA-256 recalculado para refletir o texto integral atualizado

Vigencia do aditivo: Este aditivo entra em vigor na data de sua publicacao e integra-se ao Contrato Tecnico Master AUR-2025-0042.

${auditorName}
Contrato Tecnico Master — Versao ${CONTRACT_VERSION}`;
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

  app.get("/api/admin/contracts", requireAuth, async (req: Request, res: Response) => {
    if (req.session.role !== "admin") {
      return res.status(403).json({ error: "Acesso restrito ao administrador." });
    }
    const { users } = await import("@shared/schema");
    const { ne } = await import("drizzle-orm");
    const allClients = await db.select().from(clients).where(ne(clients.type, "auditor")).orderBy(desc(clients.createdAt));
    const auditor = await getAuditorProfile();
    const allSignatures = await db.select().from(contractSignatures).orderBy(desc(contractSignatures.signedAt));

    const contracts = allClients.map((client) => {
      const sig = allSignatures.find((s) => s.companyCnpj === client.cnpj || s.companyName === client.name);
      const contractText = generateContractText(auditor, client);
      const sha256 = hashContractText(contractText);
      return {
        clientId: client.id,
        clientName: client.name,
        clientCnpj: client.cnpj,
        clientEmail: client.contactEmail,
        clientPhone: client.contactPhone,
        clientStatus: client.status,
        contractNumber: "AUR-2025-0042",
        contractVersion: CONTRACT_VERSION,
        contractSha256: sha256,
        signed: !!sig,
        signature: sig || null,
      };
    });

    return res.json({ contracts, auditor: auditor ? { name: auditor.name, cnpj: auditor.cnpj } : null });
  });

  app.get("/api/admin/contracts/:clientId/text", requireAuth, async (req: Request, res: Response) => {
    if (req.session.role !== "admin") {
      return res.status(403).json({ error: "Acesso restrito ao administrador." });
    }
    const { clientId } = req.params;
    const [client] = await db.select().from(clients).where(eq(clients.id, clientId));
    if (!client) return res.status(404).json({ error: "Cliente nao encontrado." });
    const auditor = await getAuditorProfile();
    const contractText = generateContractText(auditor, client);
    return res.json({
      contractNumber: "AUR-2025-0042",
      version: CONTRACT_VERSION,
      text: contractText,
      sha256: hashContractText(contractText),
      client: { name: client.name, cnpj: client.cnpj, email: client.contactEmail, phone: client.contactPhone },
      auditor: auditor ? { name: auditor.name, cnpj: auditor.cnpj } : null,
    });
  });

  app.get("/api/admin/contracts/:clientId/whatsapp", requireAuth, async (req: Request, res: Response) => {
    if (req.session.role !== "admin") {
      return res.status(403).json({ error: "Acesso restrito ao administrador." });
    }
    const { clientId } = req.params;
    const [client] = await db.select().from(clients).where(eq(clients.id, clientId));
    if (!client) return res.status(404).json({ error: "Cliente nao encontrado." });
    const phone = client.contactPhone?.replace(/\D/g, "") || "";
    const contractUrl = `${req.protocol}://${req.get("host")}/contract`;
    const message = `Prezado(a) ${client.contactName || "Cliente"},\n\nSegue o link para visualizacao e assinatura digital do Contrato Tecnico Master de Auditoria Forense:\n\n${contractUrl}\n\nContrato: AUR-2025-0042 (v${CONTRACT_VERSION})\nEmpresa: ${client.name || ""}\nCNPJ: ${client.cnpj || ""}\n\nA assinatura e feita digitalmente com validade juridica (Lei 14.063/2020).\n\nAtenciosamente,\nAuraAUDIT`;
    const whatsappUrl = `https://wa.me/${phone ? phone : ""}?text=${encodeURIComponent(message)}`;
    return res.json({ whatsappUrl, phone, message, clientName: client.name });
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

    const { signerRole, companyName, companyCnpj, signerCpf } = req.body;

    if (!signerRole) {
      return res.status(400).json({ error: "Cargo/funcao do signatario e obrigatorio." });
    }

    let cpfDigits: string | null = null;
    if (signerCpf) {
      cpfDigits = signerCpf.replace(/\D/g, "");
      if (!validateCPF(cpfDigits)) {
        return res.status(400).json({ error: "CPF do representante legal invalido — digitos verificadores nao conferem." });
      }
    }

    if (companyCnpj) {
      const cnpjDigits = companyCnpj.replace(/\D/g, "");
      const docType = detectDocumentType(cnpjDigits);
      if (docType === "cnpj" && !validateCNPJ(cnpjDigits)) {
        return res.status(400).json({ error: "CNPJ invalido — digitos verificadores nao conferem. Nao e possivel assinar com documento invalido." });
      }
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
        signerCpf: cpfDigits || null,
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

  app.get("/api/validate-document/:doc", requireAuth, async (req: Request, res: Response) => {
    const doc = req.params.doc.replace(/\D/g, "");
    const docType = detectDocumentType(doc);
    if (docType === "invalid") {
      return res.json({ valid: false, type: "invalid", error: "Documento deve ter 11 (CPF) ou 14 (CNPJ) digitos." });
    }
    const isValid = docType === "cnpj" ? validateCNPJ(doc) : validateCPF(doc);
    if (!isValid) {
      return res.json({
        valid: false,
        type: docType,
        error: `${docType.toUpperCase()} invalido — digitos verificadores nao conferem.`,
      });
    }
    return res.json({ valid: true, type: docType });
  });

  app.get("/api/cnpj/:cnpj", requireAuth, async (req: Request, res: Response) => {
    const cnpjDigits = req.params.cnpj.replace(/\D/g, "");
    if (cnpjDigits.length !== 14) {
      return res.status(400).json({ error: "CNPJ deve conter 14 digitos." });
    }
    if (!validateCNPJ(cnpjDigits)) {
      return res.status(400).json({ error: "CNPJ invalido — digitos verificadores nao conferem. Verifique o numero digitado." });
    }
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjDigits}`, {
        headers: { "User-Agent": "AuraAUDIT/1.0", "Accept": "application/json" },
      });
      if (!response.ok) {
        if (response.status === 404) {
          return res.status(404).json({ error: "CNPJ nao encontrado na Receita Federal." });
        }
        return res.status(502).json({ error: "Erro ao consultar a Receita Federal. Tente novamente." });
      }
      const data = await response.json() as Record<string, any>;
      const formatPhone = (ddd: string, tel: string) => {
        if (!ddd || !tel) return null;
        return `(${ddd}) ${tel}`;
      };
      const buildAddress = (logradouro: string, numero: string, complemento: string, bairro: string) => {
        const parts = [logradouro, numero, complemento, bairro].filter(Boolean);
        return parts.join(", ") || null;
      };
      const result = {
        razaoSocial: data.razao_social || "",
        nomeFantasia: data.nome_fantasia || "",
        cnpj: cnpjDigits,
        cnpjFormatado: `${cnpjDigits.slice(0, 2)}.${cnpjDigits.slice(2, 5)}.${cnpjDigits.slice(5, 8)}/${cnpjDigits.slice(8, 12)}-${cnpjDigits.slice(12, 14)}`,
        email: data.email || "",
        telefone: formatPhone(data.ddd_telefone_1?.substring(0, 2), data.ddd_telefone_1?.substring(2)) || "",
        endereco: buildAddress(data.logradouro, data.numero, data.complemento, data.bairro),
        cidade: data.municipio || "",
        uf: data.uf || "",
        cep: data.cep || "",
        situacao: data.descricao_situacao_cadastral || "",
        atividadePrincipal: data.cnae_fiscal_descricao || "",
        capitalSocial: data.capital_social || 0,
        porte: data.porte || "",
        naturezaJuridica: data.natureza_juridica || "",
        dataAbertura: data.data_inicio_atividade || "",
        socios: (data.qsa || []).map((s: any) => ({
          nome: s.nome_socio,
          qualificacao: s.qualificacao_socio,
        })),
      };
      return res.json(result);
    } catch (err) {
      console.error("CNPJ lookup error:", err);
      return res.status(502).json({ error: "Falha na comunicacao com a Receita Federal." });
    }
  });
}

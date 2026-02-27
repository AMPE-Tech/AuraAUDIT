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

const CONTRACT_VERSION = "4.0.0";

function generateContractText(auditorData: any, clientData: any): string {
  const auditorName = auditorData?.name || "CTS Brasil - Consultoria em Viagens Corporativas";
  const auditorCnpj = auditorData?.cnpj || "00.000.000/0001-00";
  const auditorEmail = auditorData?.contactEmail || "marcos@cts-brasil.com";
  const auditorPhone = auditorData?.contactPhone || "11 99103-6692";
  const auditorAddress = auditorData?.address || "Av. Paulista, 726 - 17 andar, sala 1707";
  const auditorCity = auditorData?.city || "Sao Paulo";
  const auditorState = auditorData?.state || "SP";
  const auditorContactName = auditorData?.contactName || "Marcos Costa";
  const clientName = clientData?.name || "Cliente";
  const clientCnpj = clientData?.cnpj || "00.000.000/0000-00";
  const clientEmail = clientData?.contactEmail || "";
  const clientAddress = clientData?.address || "";
  const clientCity = clientData?.city || "";
  const clientState = clientData?.state || "";
  const clientContactName = clientData?.contactName || "";

  return `CONTRATO DE PRESTACAO DE SERVICOS DE AUDITORIA E CONSULTORIA ESPECIALIZADA EM VIAGENS E EVENTOS CORPORATIVOS

Contrato n. AUR-2025-0042 | Versao ${CONTRACT_VERSION}
Data da Proposta: 11 de Fevereiro de 2026
Referencia: Proposta Comercial Ajustada

CONTRATANTE: ${clientName}
CNPJ: ${clientCnpj}
Endereco: ${clientAddress}${clientCity ? `, ${clientCity}` : ""}${clientState ? ` - ${clientState}` : ""}
Email: ${clientEmail}
Atencao: ${clientContactName}

CONTRATADA: ${auditorName}
CNPJ: ${auditorCnpj}
Endereco: ${auditorAddress}${auditorCity ? `, ${auditorCity}` : ""}${auditorState ? ` - ${auditorState}` : ""}
Email: ${auditorEmail}
Telefone: ${auditorPhone}
Responsavel: ${auditorContactName} — Chief Executive Officer

============================================================
PARTE I — PROPOSTA TECNICA
============================================================

1. OBJETO DO CONTRATO

1.1. Prestacao de servicos de auditoria completa e independente da gestao de viagens corporativas do ${clientName}, com escopo ampliado voltado a:
  a) Identificacao de falhas operacionais, financeiras, sistemicas e de conformidade
  b) Mapeamento de vulnerabilidades
  c) Proposicao de acoes corretivas e oportunidades de melhoria continua
1.2. A auditoria abrange os exercicios de 2024 e 2025, considerando o volume, a complexidade e a criticidade do ambiente operacional envolvido.
1.3. O ${clientName}, alinhado as melhores praticas de governanca corporativa, controle interno e eficiencia operacional, manifesta o interesse na realizacao de uma auditoria completa da gestao de viagens corporativas.

2. SOBRE A CONTRATADA

2.1. A ${auditorName} e pioneira no mercado brasileiro de auditoria em viagens e eventos corporativos, criada em 2007 para auxiliar empresas na gestao financeira de viagens e eventos corporativos atraves de servicos de revisao tecnica, consultoria, treinamento e suporte que visam principalmente a reducao de custos, apuracao e recuperacao de valores.
2.2. Principais resultados acumulados (2015-2025):
  - Mais de R$ 2,8 bilhoes em volume revisado
  - Mais de R$ 448 milhoes em economia e recuperacao de valores
  - Media de resultado superior a 16%
2.3. Principais inconsistencias identificadas nos projetos anteriores: fraude, retencoes, reembolsos, cobranca de fee e descumprimento de acordos corporativos.

3. ESCOPO DA AUDITORIA

3.1. Periodo Analisado:
  a) Exercicio de 2024
  b) Exercicio de 2025

3.2. Ambientes e Sistemas Envolvidos:
  a) OBT (Online Booking Tool): Reserve e Argo
  b) Backoffice: Wintour (2024) e Stur (2025)

3.3. Volume Financeiro Auditado:
  a) 2024: R$ 51.327.894,23
  b) 2025: R$ 39.639.788,66
  c) Volume total: R$ 90.967.682,89

3.4. Abrangencia Tecnica da Auditoria:
  a) Conformidade com politicas internas e melhores praticas de mercado
  b) Governanca dos processos de viagens corporativas
  c) Integridade e consistencia dos dados entre OBT, Backoffice e faturamento
  d) Aderencia contratual com fornecedores e parceiros
  e) Analise de controles, excecoes, aprovacoes e alcadas
  f) Identificacao de falhas operacionais recorrentes
  g) Mapeamento de vulnerabilidades financeiras e sistemicas
  h) Avaliacao de riscos de perdas, desperdicios ou exposicoes indevidas
  i) Oportunidades de otimizacao de processos e reducao de custos

4. METODOLOGIA DE TRABALHO

A metodologia aplicada segue padroes utilizados em projetos de auditoria corporativa de grande porte, estruturada nas seguintes etapas:

4.1. Diagnostico Inicial e Entendimento do Ambiente
4.2. Coleta, consolidacao e cruzamento de dados
4.3. Analise tecnica, financeira e operacional
4.4. Identificacao de falhas, riscos e vulnerabilidades
4.5. Validacao de achados com as areas envolvidas
4.6. Elaboracao de relatorio executivo e tecnico
4.7. Apresentacao dos resultados e recomendacoes

5. CRONOGRAMA DE REFERENCIA — 15 DIAS

Fase 01 | Dias 1-2  | Revisao de Escopo
Revisao final do escopo do projeto, alinhamento de objetivos, validacao das premissas, definicao dos criterios de auditoria e confirmacao dos acessos necessarios.

Fase 02 | Dias 3-5  | Coleta de Dados
Coleta estruturada das bases de dados, extracoes dos sistemas (OBT, Backoffice, relatorios financeiros e operacionais) e organizacao das informacoes para analise.

Fase 03 | Dias 6-10 | Reconciliacao
Cruzamento e reconciliacao das informacoes coletadas, identificacao de inconsistencias, falhas operacionais, vulnerabilidades financeiras e oportunidades de recuperacao ou economia.

Fase 04 | Dias 11-12 | Apresentacao dos Resultados
Consolidacao dos achados, validacao preliminar dos resultados e preparacao do material executivo com os valores, riscos e oportunidades identificadas.

Fase 05 | Dias 13-14 | Ajustes e Validacoes
Ajustes finais dos achados com base em validacoes junto as areas envolvidas, refinamento das analises e consolidacao das recomendacoes.

Fase 06 | Dia 15 | Entrega Final
Entrega do relatorio executivo e tecnico final, apresentacao formal dos resultados e encaminhamento das recomendacoes e proximos passos.

Observacao Importante: Os prazos acima consideram a disponibilizacao tempestiva dos acessos, bases de dados e documentos necessarios para execucao das atividades.

6. ENTREGAVEIS

6.1. Relatorio executivo consolidado
6.2. Relatorio tecnico detalhado com achados, evidencias e analises
6.3. Mapeamento de riscos e vulnerabilidades
6.4. Recomendacoes praticas para correcao e melhoria
6.5. Plano de acao sugerido, priorizado por impacto e risco
6.6. Dashboard Interativo de Resultados (tempo real via plataforma AuraAUDIT)
6.7. Cadeia de Custodia Digital Completa (continuo)

7. DOCUMENTACAO E ACESSOS NECESSARIOS

Para execucao das atividades, serao necessarios os seguintes documentos e acessos:

7.1. Contratos com prestadores e clientes
7.2. Back office da agencia
7.3. Administracao BSPLink, voeGol, voeAzul e demais cias integradas
7.4. Portais administrativos de redes hoteleiras, operadores e consolidadores
7.5. Todos os acordos corporativos (cias aereas, hotelaria, banco, etc.)
7.6. Sistema de OBTs e GDSs
7.7. Controle de reembolso e credito conciliados
7.8. Relatorios gerenciais de pagamentos realizados e pendentes
7.9. Relatorios gerenciais de receitas recebidas e pendentes
7.10. Extratos originais dos cartoes de credito utilizados
7.11. Reservas originais e faturas de hospedagens pagas
7.12. Relatorio de cobranca de FEE, Rebate, Comissoes e Incentivos

As atividades serao iniciadas somente apos confirmacao dos acessos e disponibilidade da documentacao.

============================================================
PARTE II — PROPOSTA COMERCIAL
============================================================

8. MODELO DE PRECIFICACAO

8.1. Modalidade: Honorarios por Hora + Taxa de Sucesso (Success Fee)
Esta modalidade combina um custo fixo por hora com uma Taxa de Sucesso atrelada aos resultados financeiros efetivamente obtidos.

8.2. Honorarios Fixos por Hora:

  Perfil Profissional: Auditor Senior
  Valor Hora: R$ 240,00
  Horas Estimadas: 52 horas
  Valor Estimado: R$ 12.500,00

  Subtotal Honorarios Fixos: R$ 12.500,00

8.3. Taxa de Sucesso (Success Fee):

  Percentual: 20%

  A Taxa de Sucesso incidira exclusivamente sobre os valores financeiros efetivamente reconhecidos, validados e implementados pelo contratante, decorrentes de:
  a) Recuperacao de valores pagos indevidamente
  b) Creditos aplicados ou compensados
  c) Perdas evitadas comprovadas
  d) Economias financeiras efetivamente implementadas

8.4. Condicoes Gerais de Precificacao:
  a) Os valores acima sao estimativas e poderao ser ajustados conforme o escopo final aprovado
  b) Nao estao inclusas despesas extraordinarias, viagens, hospedagem e locomocao da equipe. Qualquer despesa aplicavel devera ser previamente autorizada
  c) A proposta possui validade de 30 (trinta) dias a contar da data de emissao

============================================================
PARTE III — GOVERNANCA, CONFIDENCIALIDADE E INDEPENDENCIA
============================================================

9. GOVERNANCA E CONFIDENCIALIDADE

9.1. Confidencialidade: Todas as informacoes compartilhadas sao tratadas como confidenciais e protegidas por NDA assinado entre as partes. Nenhuma informacao sera divulgada a terceiros sem autorizacao expressa do contratante.
9.2. Independencia tecnica: A equipe de auditoria mantem total independencia e imparcialidade durante todo o processo, sem vinculo com as areas auditadas.
9.3. Rastreabilidade juridica: Todos os dados analisados sao mantidos em cadeia de custodia digital certificada, com hashes SHA-256 deterministicos.
9.4. Transparencia metodologica: A metodologia aplicada e documentada e disponibilizada ao contratante para verificacao.
9.5. Cadeia de Custodia: Conformidade com Lei 13.964/2019 (Pacote Anticrime) — todos os dados e evidencias seguem cadeia de custodia digital com trilha de auditoria imutavel.

10. PROTECAO DE DADOS

10.1. O tratamento de dados pessoais segue rigorosamente a LGPD (Lei 13.709/2018), com medidas tecnicas e administrativas de seguranca.
10.2. Dados de CPF sao armazenados e exibidos com mascaramento parcial.
10.3. Dados do contratante sao utilizados exclusivamente para os fins previstos neste contrato.

11. PROPRIEDADE INTELECTUAL

11.1. Os relatorios e analises produzidos sao de propriedade do contratante.
11.2. A metodologia, ferramentas, modelos de IA e plataforma tecnologica permanecem propriedade da ${auditorName}.

============================================================
PARTE IV — DISPOSICOES CONTRATUAIS
============================================================

12. SLA — ACORDO DE NIVEL DE SERVICO

12.1. Tempo de resposta a incidentes criticos: ate 4 horas uteis
12.2. Atualizacao de status do projeto: diariamente via dashboard
12.3. Entrega de relatorios parciais: ate 48 horas apos cada fase
12.4. Entrega do relatorio final: ate 5 dias uteis apos conclusao
12.5. Reunioes de alinhamento: semanalmente ou sob demanda
12.6. Disponibilidade da equipe: dias uteis, 08h as 18h

13. VIGENCIA

13.1. Inicio: na data de assinatura deste contrato
13.2. Prazo do projeto: 15 dias uteis apos confirmacao dos acessos e documentacao
13.3. Vigencia do contrato: ate 31/12/2026
13.4. Podendo ser prorrogado mediante termo aditivo

14. CADASTRO E VALIDACAO DE PARTES

14.1. CNPJ validado matematicamente (algoritmo de digitos verificadores) antes de qualquer operacao
14.2. Consulta a Receita Federal (BrasilAPI) para preenchimento automatico de dados cadastrais
14.3. CPF do representante legal validado matematicamente quando informado
14.4. Validacao aplicada em: cadastro de clientes, assinatura de contrato, perfis de empresa

15. CADEIA DE CUSTODIA DIGITAL

15.1. Todos os dados e evidencias sao mantidos em cadeia de custodia digital certificada
15.2. Hashes SHA-256 deterministicos para cada registro, documento e artefato
15.3. Trilha de auditoria imutavel com integridade verificavel
15.4. Conformidade com Lei 13.964/2019 (Pacote Anticrime)

16. SISTEMA ANTIREGRESSAO

16.1. Toda alteracao em dados auditados e registrada com estado anterior (dataBefore) e posterior (dataAfter)
16.2. Hash de integridade SHA-256 calculado para cada entrada da trilha de auditoria
16.3. Registros de auditoria sao imutaveis (append-only) — nao podem ser editados ou excluidos
16.4. Versionamento de contratos: cada versao gera novo SHA-256, versoes anteriores permanecem registradas
16.5. Validacao matematica de documentos (CNPJ/CPF) impede regressao de dados cadastrais invalidos

17. RESCISAO

17.1. O contrato pode ser rescindido por qualquer das partes com aviso previo de 30 dias, resguardados os direitos sobre trabalhos ja realizados.
17.2. Em caso de rescisao, os honorarios fixos serao devidos proporcionalmente as horas efetivamente trabalhadas.
17.3. A Taxa de Sucesso sera devida sobre resultados ja validados e implementados ate a data da rescisao.

18. VALIDADE JURIDICA DA ASSINATURA ELETRONICA

18.1. Este contrato e assinado eletronicamente nos termos da Lei 14.063/2020 (assinatura eletronica simples) e da Medida Provisoria 2.200-2/2001
18.2. Integridade garantida por hash criptografico SHA-256
18.3. Registrados: IP, user-agent, timestamp, identificacao do signatario e CPF (quando informado)
18.4. Cadeia de custodia da assinatura: contrato texto -> SHA-256 -> assinatura -> registro imutavel

19. CANAIS DE ASSINATURA E DISTRIBUICAO DO CONTRATO

19.1. Disponibilidade: o contrato esta disponivel para assinatura online (via plataforma AuraAUDIT) e offline (versao para impressao e assinatura manual)
19.2. Assinatura via plataforma: registro automatico de SHA-256, IP, user-agent, timestamp e CPF
19.3. Envio por email ou WhatsApp: com link direto para visualizacao e assinatura digital
19.4. Equivalencia juridica: a assinatura eletronica realizada em qualquer canal possui a mesma validade juridica nos termos da Lei 14.063/2020 e MP 2.200-2/2001

20. FORO

20.1. Fica eleito o Foro da Comarca de Sao Paulo - SP para dirimir quaisquer controversias oriundas deste contrato, com renuncia expressa a qualquer outro, por mais privilegiado que seja.

============================================================
ANEXO I — EVIDENCIAS TECNICAS DO PROJETO
============================================================

E1. Cadastro padronizado: CNPJ/CPF com validacao matematica + consulta Receita Federal
E2. Contrato dinamico: texto gerado a partir de dados cadastrais verificados do contratante e contratada
E3. Assinatura digital: SHA-256 do texto integral, IP, user-agent, timestamp, CPF (quando informado, exibido mascarado)
E4. Trilha de auditoria: registros imutaveis com hash de integridade por entrada
E5. Cadeia de custodia: conformidade com Lei 13.964/2019, hashes SHA-256 por registro
E6. Antiregressao: dataBefore/dataAfter em cada mutacao, versionamento de contratos
E7. Reconciliacao multi-via: cruzamento OBT vs Backoffice vs faturamento vs cartao/VCN
E8. Evidence packs: documentacao por caso/evento com raw data, logs e versoes de regras

============================================================
ANEXO II — PLATAFORMA AURAAUDIT: MODULOS COMPLEMENTARES
(Informativo — sem valores — disponivel para contratacao futura)
============================================================

A plataforma AuraAUDIT oferece modulos digitais complementares que podem potencializar os resultados da auditoria e estender a governanca de viagens corporativas do contratante. Abaixo, uma visao geral de cada modulo:

M1. AURAAUDIT PASS (Assinatura Digital de Monitoramento Continuo)
Plano de assinatura mensal que oferece auditoria continua com dashboard interativo, trilha de auditoria, cadeia de custodia digital e relatorios automatizados. Ideal para empresas que desejam monitoramento permanente apos a conclusao do projeto de auditoria pontual, garantindo compliance e savings recorrentes.

M2. AI DESK (11 Servicos de IA sob Demanda)
Mesa de servicos com 11 funcionalidades de inteligencia artificial especializadas em viagens corporativas:
  - Conciliacao e Reconciliacao: cruzamento automatizado de dados multi-via entre OBT, backoffice, faturamento e cartoes
  - Revisao de Contratos: analise de clausulas, SLAs e conformidade contratual com fornecedores
  - Resposta a Editais/RFP: montagem estruturada de propostas e licitacoes com matriz de compliance
  - SLA + KPI + Scorecard: criacao e monitoramento de indicadores operacionais para gestao de agencias e fornecedores
  - Assistente de Negociacao: formacao de preco e estrategia de negociacao com fornecedores, incluindo cenarios comparativos
  - Alertas em Tempo Real: monitoramento continuo com notificacoes de desvios de politica, cobrancas indevidas e anomalias
  - Conectar API de Fornecedores: integracao tecnica com sistemas de cias aereas, hoteis, locadoras e GDS
  - Relatorio Automatico: geracao de relatorios por area, centro de custo, departamento ou fornecedor
  - Apresentacao Executiva: slides com marketshare, gastos e graficos para apresentacao a diretoria
  - Estrategia Lost Saving: identificacao de economias perdidas e estrategia de recuperacao com benchmark de mercado
  - Plano de Acao 30/60/90: plano estruturado com responsaveis, prazos e acompanhamento de implementacao
Cada servico gera um envelope de auditoria com SHA-256, garantindo rastreabilidade e integridade dos resultados.

M3. WALLET DE CREDITOS
Carteira digital com creditos pre-pagos para consumo dos servicos do AI Desk. Permite controle de gastos por empresa, limites por job e cap mensal. Ledger completo e auditavel com transparencia total sobre o consumo.

M4. DASHBOARD STUDIO
Ferramenta para criacao de dashboards personalizados com widgets interativos (gastos por area, excecoes de politica, performance SLA, savings, mapa de riscos, ranking de fornecedores, volume mensal, score de compliance). Permite filtros globais, versionamento e publicacao de views para toda a empresa.

M5. BIBLIOTECA DE RELATORIOS E ARTEFATOS
Repositorio centralizado de todos os artefatos gerados pela plataforma, com workflow de status (rascunho > revisado > aprovado), hash SHA-256 individual por artefato e download com verificacao de integridade. Garante rastreabilidade completa de todos os outputs gerados.

M6. SISTEMA ANTIALUCINACAO (IA)
Mecanismo de controle que garante que todos os outputs de IA sejam acompanhados de envelope de auditoria, cotacao previa obrigatoria, aprovacao humana e registro de modelo/versao/parametros. A IA sugere e gera, mas o usuario decide e aprova em todas as etapas.

Para mais informacoes sobre qualquer modulo complementar, entre em contato com a equipe ${auditorName}.

============================================================
CONSIDERACOES FINAIS
============================================================

Esta proposta foi estruturada para apoiar o ${clientName} na elevacao do nivel de controle, governanca e eficiencia de sua gestao de viagens corporativas, fornecendo uma visao clara, tecnica e acionavel sobre o cenario atual e seus pontos de melhoria.

Certos de que nossa experiencia nos qualifica para atender plenamente o projeto, colocamo-nos a disposicao para quaisquer esclarecimentos.

"Cuidado com as pequenas despesas, um pequeno vazamento afundara um grande navio." — Benjamin Franklin

${auditorName}
Contrato de Auditoria e Consultoria — Versao ${CONTRACT_VERSION}
${auditorAddress}${auditorCity ? `, ${auditorCity}` : ""}${auditorState ? ` - ${auditorState}` : ""}
${auditorContactName} | Telefone: ${auditorPhone} | Email: ${auditorEmail}`;
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
    const auditor = await getAuditorProfile();
    const message = `Prezado(a) ${client.contactName || "Cliente"},\n\nSegue o link para visualizacao e assinatura digital do Contrato de Auditoria e Consultoria:\n\n${contractUrl}\n\nContrato: AUR-2025-0042 (v${CONTRACT_VERSION})\nEmpresa: ${client.name || ""}\nCNPJ: ${client.cnpj || ""}\n\nA assinatura e feita digitalmente com validade juridica (Lei 14.063/2020).\n\nAtenciosamente,\n${auditor?.name || "CTS Brasil"}`;
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
    const message = `Prezado(a) ${client?.contactName || "Cliente"},\n\nSegue o link para visualizacao e assinatura digital do contrato de auditoria:\n\n${contractUrl}\n\nContrato: AUR-2025-0042\nEmpresa: ${client?.name || ""}\n\nA assinatura e feita digitalmente com validade juridica (Lei 14.063/2020).\n\nAtenciosamente,\nAuraAUDIT`;
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

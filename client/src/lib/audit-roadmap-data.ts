/**
 * AUDIT_ROADMAP — Plano de Ação AuraDUE · Grupo Stabia
 * VERSÃO ATUALIZADA — Alinhado com plano aprovado (abril/2026)
 *
 * DESTINO NO REPLIT: client/src/lib/audit-roadmap-data.ts
 * (substituir o arquivo existente por este)
 *
 * Cronograma MVP 90 dias: 04/04/2026 – 03/07/2026
 * 4 Fases · 20 tarefas · 9 fontes de dados · 5 reconciliações · 7 entregáveis
 */

export type RoadmapStatus = "pending" | "in_progress" | "done" | "critical";

export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
  responsible: string;
  status: RoadmapStatus;
}

export interface RoadmapPhase {
  phase: string;
  title: string;
  dates: string;
  days: string;
  color: string;
  badgeClass: string;
  badgeLabel: string;
  tasks: RoadmapTask[];
}

export const ROADMAP_STATUS_META: Record<RoadmapStatus, { label: string; badgeClass: string }> = {
  critical:    { label: "Urgente",     badgeClass: "bg-red-500/20 text-red-400 border-red-500/30" },
  pending:     { label: "Aguardando",  badgeClass: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
  in_progress: { label: "Em curso",    badgeClass: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  done:        { label: "Concluído",   badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
};

export const AUDIT_ROADMAP: RoadmapPhase[] = [
  // ═══════════════════════════════════════════════════════════════════
  // FASE 1 — Coleta, Acesso e Integrações Críticas
  // ═══════════════════════════════════════════════════════════════════
  {
    phase: "Fase 1",
    title: "Coleta, Acesso e Integrações Críticas",
    dates: "04/04 – 18/04/2026",
    days: "Dias 1–15",
    color: "border-l-red-500",
    badgeClass: "bg-red-500/20 text-red-400 border-red-500/30",
    badgeLabel: "Fundação",
    tasks: [
      {
        id: "f1-t1",
        title: "Confirmação e ativação do Stur Web Full (FTP / Webhook)",
        description: "Confirmar versão Full com AGI Sistemas · Configurar exportação XML/JSON · Testar primeiro ciclo de envio",
        start: "04/04", end: "07/04",
        responsible: "TI",
        status: "critical",
      },
      {
        id: "f1-t2",
        title: "Integração bancária — Itaú e Bradesco",
        description: "Conexão via Open Finance / API · Leitura automática de extratos · Validação de formato e período",
        start: "04/04", end: "10/04",
        responsible: "TI",
        status: "critical",
      },
      {
        id: "f1-t3",
        title: "Integração Clara (Mastercard) — cartão corporativo",
        description: "Conexão API Clara · Importação de faturas mensais 2024 e 2025",
        start: "07/04", end: "11/04",
        responsible: "TI",
        status: "critical",
      },
      {
        id: "f1-t4",
        title: "Integração NFS-e ABRASF — Prefeitura de Curitiba",
        description: "Certificado digital · Homologação ABRASF · Importação de notas emitidas e recebidas 2025",
        start: "08/04", end: "14/04",
        responsible: "Contador",
        status: "critical",
      },
      {
        id: "f1-t5",
        title: "Coleta manual — BSPLink IATA, OBTs (Argo / Reserve / TravelPerk)",
        description: "Exportação de relatórios BSP e reservas 2024/2025 · Padronização de formato para ingestão",
        start: "10/04", end: "18/04",
        responsible: "Financeiro",
        status: "critical",
      },
      {
        id: "f1-t6",
        title: "Coleta manual — Fornecedores (Accor, Atlântica, Omnibees, CM.net, Localiza, Movida, AssistCard)",
        description: "Faturas, comissões e acordos BV/overcommission/DU/RAV · Upload via portal seguro",
        start: "10/04", end: "18/04",
        responsible: "Financeiro",
        status: "critical",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // FASE 2 — Ingestão, Normalização e Agente GUARDIAN
  // ═══════════════════════════════════════════════════════════════════
  {
    phase: "Fase 2",
    title: "Ingestão, Normalização e Agente GUARDIAN",
    dates: "19/04 – 18/05/2026",
    days: "Dias 16–45",
    color: "border-l-amber-500",
    badgeClass: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    badgeLabel: "Setup",
    tasks: [
      {
        id: "f2-t1",
        title: "AuraDATA — Ingestão e normalização multi-fonte",
        description: "Pipeline de ingestão: Stur Web + bancos + OBTs + fornecedores · Deduplicação e validação de integridade",
        start: "19/04", end: "25/04",
        responsible: "TI",
        status: "pending",
      },
      {
        id: "f2-t2",
        title: "Agente GUARDIAN — validação de bookings em tempo real",
        description: "Regras de campos mínimos · Alertas de lançamentos incompletos · Integração com Stur Web Full",
        start: "25/04", end: "05/05",
        responsible: "TI",
        status: "pending",
      },
      {
        id: "f2-t3",
        title: "Parametrização de contratos e acordos comerciais",
        description: "Cadastro de BV, overcommissions e DU/RAV na base de referência · Mapeamento por fornecedor",
        start: "25/04", end: "09/05",
        responsible: "Financeiro",
        status: "pending",
      },
      {
        id: "f2-t4",
        title: "Provisionamento GCP Cloud Run + PostgreSQL",
        description: "Ambiente de produção · Variáveis de ambiente seguras · CI/CD pipeline básico",
        start: "19/04", end: "28/04",
        responsible: "TI",
        status: "pending",
      },
      {
        id: "f2-t5",
        title: "Testes de integração — ciclo 1",
        description: "Validação end-to-end das integrações ativas · Correção de erros de parsing e mapeamento",
        start: "09/05", end: "18/05",
        responsible: "TI",
        status: "pending",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // FASE 3 — Reconciliação, LAUNCHER e CONCILIATOR
  // ═══════════════════════════════════════════════════════════════════
  {
    phase: "Fase 3",
    title: "Reconciliação, LAUNCHER e CONCILIATOR",
    dates: "19/05 – 17/06/2026",
    days: "Dias 46–75",
    color: "border-l-blue-500",
    badgeClass: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    badgeLabel: "Execução",
    tasks: [
      {
        id: "f3-t1",
        title: "Agente LAUNCHER — lançamentos financeiros automáticos",
        description: "Lançamentos no Stur Web · Emissão e cobrança bancária (Itaú / Bradesco / Clara) · Alertas de inadimplência",
        start: "19/05", end: "29/05",
        responsible: "TI",
        status: "pending",
      },
      {
        id: "f3-t2",
        title: "Agente CONCILIATOR — reconciliação contínua multi-fonte",
        description: "Cruzamento banco vs Stur vs OBTs · Detecção de overcharges e divergências · Alertas de remuneração",
        start: "26/05", end: "05/06",
        responsible: "TI",
        status: "pending",
      },
      {
        id: "f3-t3",
        title: "Reconciliação retroativa 2024 / 2025 — ciclo inicial",
        description: "Primeiro cruzamento: Itaú + Bradesco + Clara vs Stur Web · Levantamento de divergências",
        start: "29/05", end: "12/06",
        responsible: "Financeiro",
        status: "pending",
      },
      {
        id: "f3-t4",
        title: "AuraCERTIFIED — cadeia de custódia nas evidências",
        description: "UUID Registry + SHA-256 em todos os registros reconciliados · Registro imutável de evidência",
        start: "05/06", end: "17/06",
        responsible: "TI",
        status: "pending",
      },
      {
        id: "f3-t5",
        title: "Testes de integração — ciclo 2",
        description: "Validação dos agentes GUARDIAN + LAUNCHER + CONCILIATOR em conjunto · Ajustes de regras",
        start: "10/06", end: "17/06",
        responsible: "TI",
        status: "pending",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // FASE 4 — REPORTER, Validação e Go-live MVP
  // ═══════════════════════════════════════════════════════════════════
  {
    phase: "Fase 4",
    title: "REPORTER, Validação e Go-live MVP",
    dates: "18/06 – 03/07/2026",
    days: "Dias 76–90",
    color: "border-l-emerald-500",
    badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    badgeLabel: "Go-live",
    tasks: [
      {
        id: "f4-t1",
        title: "Agente REPORTER — briefings e dashboard",
        description: "Alertas diários via WhatsApp à Diretoria · Dashboard Metabase com painéis de reconciliação e due diligence",
        start: "18/06", end: "25/06",
        responsible: "TI",
        status: "pending",
      },
      {
        id: "f4-t2",
        title: "Validação funcional do MVP com equipe Stabia",
        description: "Testes com Financeiro e Diretoria · Aprovação dos fluxos de reconciliação e alertas",
        start: "23/06", end: "28/06",
        responsible: "Diretoria",
        status: "pending",
      },
      {
        id: "f4-t3",
        title: "Treinamento operacional das equipes",
        description: "Capacitação de Financeiro, Operações e Diretoria na plataforma · Documentação de uso",
        start: "28/06", end: "02/07",
        responsible: "Diretoria",
        status: "pending",
      },
      {
        id: "f4-t4",
        title: "Go-live MVP — ativação em produção",
        description: "4 agentes ativos · Integrações validadas · AuraCERTIFIED operacional · Monitoramento contínuo iniciado",
        start: "03/07", end: "03/07",
        responsible: "Diretoria",
        status: "pending",
      },
    ],
  },
];

export const KANBAN_COLUMNS: {
  status: RoadmapStatus;
  label: string;
  borderClass: string;
  headerClass: string;
}[] = [
  { status: "critical",    label: "🔴 Urgente",     borderClass: "border-red-500/40",     headerClass: "bg-red-500/10 text-red-400" },
  { status: "pending",     label: "⏳ Aguardando",  borderClass: "border-slate-500/40",   headerClass: "bg-slate-500/10 text-slate-400" },
  { status: "in_progress", label: "🔵 Em curso",    borderClass: "border-blue-500/40",    headerClass: "bg-blue-500/10 text-blue-400" },
  { status: "done",        label: "✅ Concluído",   borderClass: "border-emerald-500/40", headerClass: "bg-emerald-500/10 text-emerald-400" },
];

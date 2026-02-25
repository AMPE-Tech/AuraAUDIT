import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  ShieldCheck,
  Search,
  Scale,
  Database,
  TrendingUp,
  BarChart3,
  Award,
  Target,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  FileSignature,
  Upload,
  ListChecks,
  Presentation,
  Settings,
  Eye,
  Globe,
  Monitor,
  CreditCard,
  Hotel,
  CalendarDays,
  Network,
  Plane,
  Building2,
  Car,
  Phone,
  Heart,
  ShoppingCart,
  Briefcase,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Users,
  Zap,
  Receipt,
  ArrowRight,
  HelpCircle,
  MessageSquare,
  Layers,
  Handshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const DIFFERENTIALS = [
  { icon: Scale, title: "Independencia", description: "Atuacao imparcial — o proprio cliente habilita quem e o que sera auditado" },
  { icon: Database, title: "Base de Evidencias", description: "Toda analise fundamentada em dados concretos e rastreabilidade completa" },
  { icon: ShieldCheck, title: "Cadeia de Custodia", description: "Conformidade com Lei 13.964/2019 — integridade e admissibilidade juridica" },
  { icon: Search, title: "Metodologia Forense", description: "Cruzamento multi-sistema, deteccao de padroes e analise de anomalias" },
];

const CORPORATE_SERVICES = [
  {
    id: "financial",
    title: "Auditoria Financeira & Conciliacao",
    icon: Receipt,
    badge: "Nucleo",
    description: "Auditoria continua das despesas de viagens e eventos para identificar cobrancas indevidas, inconsistencias e oportunidades de economia.",
    auditItems: [
      "Conciliacao 4 vias: Reserva/PNR/TKT/EMD + Fatura TMC + Cartao/VCN + Reembolso/Expense",
      "Taxas e fees: emissao, remarcacao, cancelamento, service fee, markups e cobrancas acessorias",
      "Hotelaria: diarias, impostos, taxas, no-show, folios e cobrancas extras",
      "Locacao: categoria, seguros, extras, multas, combustivel e divergencias",
    ],
    deliverables: [
      "Relatorio de divergencias (classificado por tipo e severidade)",
      "Calculo de overcharge / valores recuperaveis",
      "Plano de correcao (processo + parametrizacao + comportamento)",
    ],
  },
  {
    id: "policy",
    title: "Auditoria de Politica (Policy Compliance)",
    icon: ClipboardCheck,
    badge: "Compliance",
    description: "Verificacao automatizada da aderencia a politica de viagens e eventos.",
    auditItems: [
      "Classe/teto/antecedencia/fornecedor preferencial",
      "Fluxo de aprovacao e alcadas",
      "Excecoes: justificativa, aprovador, reincidencia e impacto",
      "Leakage: compras fora do canal, fora do OBT, fora do acordo",
    ],
    deliverables: [
      "Score de compliance por area/centro de custo",
      "Heatmap de excecoes e reincidencias",
      "Recomendacoes de ajustes na politica e no fluxo",
    ],
  },
  {
    id: "contracts",
    title: "Auditoria de Contratos & Acordos Corporativos",
    icon: FileSignature,
    badge: "Contratos",
    description: "Validacao do que foi contratado versus o que esta sendo praticado.",
    auditItems: [
      "Contrato com agencia/TMC: SLAs, fee model, regras de faturamento, responsabilidades",
      "Acordos com cias aereas/hoteis/locadoras: descontos, metas, rebates, condicoes",
      "Riscos comerciais: conflitos de interesse e incentivos nao transparentes",
    ],
    deliverables: [
      "Matriz 'contratado vs executado'",
      "Nao conformidades contratuais e riscos",
      "Recomendacoes de renegociacao e governanca",
    ],
  },
  {
    id: "sla",
    title: "SLA, Qualidade Operacional & Dados",
    icon: BarChart3,
    badge: "Operacional",
    description: "Medicao de performance de atendimento e integridade de dados.",
    auditItems: [
      "SLA de emissao e pos-venda (trocas/cancelamentos/creditos)",
      "Atendimento 24/7, reacomodacao e tempo de resposta",
      "Qualidade dos dados (campos criticos, IDs, anexos, consistencia)",
    ],
    deliverables: [
      "Scorecard mensal de SLA e qualidade",
      "Ranking de causas raiz (processo, sistema, operacao)",
      "Checklist de padronizacao e melhoria continua",
    ],
  },
  {
    id: "antifraud",
    title: "Antifraude & Anomalias (Controles)",
    icon: AlertTriangle,
    badge: "Controles",
    description: "Deteccao de padroes atipicos e potenciais abusos.",
    auditItems: [
      "Duplicidades e cobrancas repetidas",
      "Tarifas acima do esperado / inconsistencias por rota e perfil",
      "Gastos fora do padrao por viajante/unidade",
      "Falhas de segregacao (solicita/aprova/emite/paga)",
    ],
    deliverables: [
      "Alertas classificados (baixo/medio/alto)",
      "Evidencia do caso e trilha de decisao",
      "Recomendacoes de controles internos",
    ],
  },
];

const TMC_SERVICES = [
  {
    id: "maturity",
    title: "Programa de Maturidade 'Audit-Ready'",
    icon: TrendingUp,
    description: "Diagnostico completo e roadmap para elevar padrao operacional e governanca.",
    items: [
      "Processos (emissao, pos-venda, faturamento, reembolsos)",
      "Dados e integracoes (OBT, GDS/NDC, ERP do cliente, VCN)",
      "Controles, compliance e rastreabilidade",
      "Qualidade do atendimento e SLAs",
    ],
    deliverables: [
      "Relatorio de maturidade + plano 30/60/90 dias",
      "Padronizacao de rotinas e checklists",
      "Modelo de indicadores (KPI/OKR) e rituais operacionais",
    ],
  },
  {
    id: "billing",
    title: "Billing Analitico & Conciliacao Padrao",
    icon: Receipt,
    description: "Implantacao do padrao de faturamento e conciliacao que grandes clientes exigem.",
    items: [
      "Fatura analitica 'linha a linha' por transacao/servico",
      "Regras de conciliacao e chaves de match (IDs)",
      "Gestao de excecoes e trilhas de auditoria",
    ],
    deliverables: [
      "Template de fatura analitica e regras de validacao",
      "Fluxo de conciliacao (operacional + financeiro)",
      "Indicadores de qualidade e reducao de retrabalho",
    ],
  },
  {
    id: "sla_tmc",
    title: "SLA & Atendimento (Operacao de Alta Performance)",
    icon: Zap,
    description: "Estruturacao de SLAs e melhoria de produtividade.",
    items: [
      "Organizacao de filas (queues) e prioridades",
      "Fluxo de urgencia, reacomodacao e 24/7",
      "Reducao de erros e tempo de ciclo (TMA/FCR)",
    ],
    deliverables: [
      "Scorecard de performance",
      "Playbook operacional e padroes de atendimento",
      "Relatorio de melhorias e ganhos",
    ],
  },
  {
    id: "lgpd",
    title: "LGPD & Governanca de Dados",
    icon: Lock,
    description: "Adequacao para atender corporacoes exigentes em privacidade e seguranca.",
    items: [
      "Politicas e controles de acesso",
      "Retencao e minimizacao de dados",
      "Trilha de auditoria de operacoes criticas",
      "Kit documental para contratos e auditorias",
    ],
    deliverables: [],
  },
];

const MICE_AUDIT_ITEMS = [
  "RFP e concorrencia (minimo de propostas e criterios)",
  "Orcamento vs realizado (variacoes, aditivos, extras)",
  "Contratos de venue, A/V, cenografia, A&B, hospedagem de grupo",
  "Conciliacao de faturas, notas, comprovantes e reembolsos",
];

const MICE_DELIVERABLES = [
  "Matriz comparativa de propostas com justificativas",
  "Trilha de aprovacoes e governanca",
  "Pacote de evidencias do evento (Evidence Pack)",
];

const METHODOLOGY_STAGES = [
  { step: 1, title: "Onboarding & Mapeamento", icon: FileSignature, description: "Sistemas, fornecedores, contratos e politica" },
  { step: 2, title: "Coleta / Integracao", icon: Upload, description: "Importacao por API, SFTP/CSV ou upload controlado" },
  { step: 3, title: "Cadeia de Custodia", icon: ShieldCheck, description: "Registro de origem, logs, evidencias raw e trilha de transformacao" },
  { step: 4, title: "Auditoria + Revisao Tecnica", icon: ListChecks, description: "Regras automatizadas + validacao humana onde necessario" },
  { step: 5, title: "Relatorios & Acoes", icon: Presentation, description: "Divergencias, recomendacoes e plano de correcao" },
  { step: 6, title: "Monitoramento Continuo", icon: Eye, description: "Indicadores, alertas e melhoria continua" },
];

const STANDARD_DELIVERABLES = [
  { title: "Dashboard executivo", description: "Custos, compliance, SLA, riscos" },
  { title: "Relatorio de divergencias", description: "Classificado por tipo e severidade" },
  { title: "Savings Report", description: "Oportunidades e recuperacoes com evidencia" },
  { title: "Plano de acao 30/60/90 dias", description: "Acoes priorizadas e responsaveis" },
  { title: "Evidence Packs", description: "Pacotes rastreáveis para Compliance e Juridico" },
];

const PRICING_MODELS = [
  { title: "Assinatura mensal", description: "Monitoramento continuo", badge: "Recorrente" },
  { title: "Projeto fechado", description: "Diagnostico e implantacao", badge: "Pontual" },
  { title: "Success fee", description: "Sobre valores recuperados, com regra clara e transparencia", badge: "Performance" },
  { title: "Por volume", description: "Por transacoes/PNRs/faturas/eventos", badge: "Escala" },
];

const FAQ_ITEMS = [
  {
    question: "Voces precisam acessar meus sistemas?",
    answer: "Preferencialmente via integracao (API/SFTP). Quando nao for possivel, trabalhamos com exportacoes (CSV) ou upload controlado.",
  },
  {
    question: "Isso atende demandas de Compliance e Juridico?",
    answer: "Sim. O AuraAudit mantem Cadeia de Custodia digital e organiza evidencias em Evidence Packs, facilitando auditorias, disputas, investigacoes internas e validacoes formais.",
  },
  {
    question: "Voces conseguem auditar multiplas moedas e paises?",
    answer: "Sim. O escopo inicial pode ser LATAM e expandir por entidade/pais.",
  },
];

const MAIN_CLIENTS = [
  "Novo Nordisk", "Natura", "Abbott", "BRF", "Samsung", "iFood",
  "Bayer", "Odebrecht", "Pirelli", "Boehringer Ingelheim", "Gerdau",
  "L'Oreal", "Lilly", "AstraZeneca", "Petrobras",
];

const LATAM_ECOSYSTEM_CATEGORIES = [
  { name: "GDS", icon: Network, description: "Global Distribution Systems" },
  { name: "OBT", icon: Monitor, description: "Online Booking Tool" },
  { name: "TMC", icon: Building2, description: "Travel Management Company" },
  { name: "Mid/Backoffice", icon: Database, description: "Midoffice e Backoffice" },
  { name: "Pagamentos", icon: CreditCard, description: "Pagamentos Corporativos" },
  { name: "Cias Aereas", icon: Plane, description: "Companhias Aereas" },
  { name: "Hotelaria", icon: Hotel, description: "Hotelaria Corporativa" },
  { name: "Car Rental", icon: Car, description: "Locadoras de Veiculos" },
  { name: "Seguros", icon: Shield, description: "Seguradoras e Assistencia" },
  { name: "MICE", icon: CalendarDays, description: "Eventos Corporativos" },
];

const LATAM_COUNTRIES = [
  { name: "Brasil", code: "BR" },
  { name: "Mexico", code: "MX" },
  { name: "Colombia", code: "CO" },
  { name: "Chile", code: "CL" },
  { name: "Argentina", code: "AR" },
  { name: "Peru", code: "PE" },
];

function ExpandableServiceCard({ service }: { service: typeof CORPORATE_SERVICES[0] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card data-testid={`card-service-${service.id}`}>
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
              <service.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">{service.title}</CardTitle>
                <Badge variant="secondary" className="text-[10px]">{service.badge}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0" data-testid={`button-expand-${service.id}`}>
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0 space-y-4">
          <Separator />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-medium">O que auditamos</p>
            <div className="space-y-1.5">
              {service.auditItems.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <span className="text-xs text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-medium">Entregas</p>
            <div className="space-y-1.5">
              {service.deliverables.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <FileText className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="text-xs text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function ExpandableTmcCard({ service }: { service: typeof TMC_SERVICES[0] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card data-testid={`card-tmc-${service.id}`}>
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-500/10 shrink-0">
              <service.icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-sm">{service.title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0" data-testid={`button-expand-tmc-${service.id}`}>
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0 space-y-4">
          <Separator />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-medium">
              {service.id === "lgpd" ? "O que implementamos" : service.id === "sla_tmc" ? "O que ajustamos" : service.id === "billing" ? "O que implementamos" : "Avaliacao"}
            </p>
            <div className="space-y-1.5">
              {service.items.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                  <span className="text-xs text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
          {service.deliverables.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-medium">Entregas</p>
              <div className="space-y-1.5">
                {service.deliverables.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <FileText className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="text-xs text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function Home() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="p-6 space-y-8 max-w-[1400px] mx-auto">

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">AuraAudit</h1>
            <p className="text-sm text-muted-foreground">Servicos de Auditoria em Viagens e Eventos Corporativos</p>
          </div>
        </div>
      </div>

      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold">O que fazemos</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
            O AuraAudit e uma solucao de <span className="font-medium text-foreground">auditoria online</span> para{" "}
            <span className="font-medium text-foreground">viagens corporativas (T&E)</span> e{" "}
            <span className="font-medium text-foreground">eventos corporativos (MICE)</span>. Atuamos com foco em{" "}
            reducao de custo, compliance, controle financeiro e rastreabilidade — com entregaveis claros,
            evidencias organizadas e indicadores executivos.
          </p>
        </CardContent>
      </Card>

      <Card className="border-amber-200 dark:border-amber-900/50 bg-gradient-to-r from-amber-50/50 via-transparent to-transparent dark:from-amber-950/20">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-base font-semibold">Cadeia de Custodia & Rastreabilidade Juridica</h2>
            <Badge variant="outline" className="text-[10px]">Compliance e Legal</Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
            Alem da auditoria operacional e financeira, o AuraAudit opera com{" "}
            <span className="font-medium text-foreground">Cadeia de Custodia digital</span>, garantindo{" "}
            rastreabilidade juridica das evidencias para suportar Compliance, Juridico, Auditoria Interna e Controles.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-background/60">
              <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span className="text-xs text-muted-foreground">Evidencias em formato <span className="font-medium">raw</span> (originais) e versoes normalizadas para auditoria</span>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-background/60">
              <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span className="text-xs text-muted-foreground"><span className="font-medium">Trilha completa</span>: origem → coleta → transformacao → analise → relatorio</span>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-background/60">
              <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span className="text-xs text-muted-foreground"><span className="font-medium">Identificacao unica</span> por caso/transacao e registro de eventos (logs)</span>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-background/60">
              <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span className="text-xs text-muted-foreground"><span className="font-medium">Evidence Packs</span> prontos para fiscalizacao, disputas e investigacoes internas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 dark:border-blue-900">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400" data-testid="stat-avg-result">16%</p>
            <p className="text-sm text-muted-foreground mt-1">Media de Resultado</p>
            <p className="text-xs text-muted-foreground">sobre o volume revisado</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 dark:border-emerald-900">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="stat-reviewed">+2,8 BI</p>
            <p className="text-sm text-muted-foreground mt-1">Revisados</p>
            <p className="text-xs text-muted-foreground">em volume financeiro total</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 dark:border-amber-900">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 mx-auto mb-3">
              <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400" data-testid="stat-recovered">+448 MI</p>
            <p className="text-sm text-muted-foreground mt-1">Recuperados</p>
            <p className="text-xs text-muted-foreground">em economia e recuperacao</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DIFFERENTIALS.map((item) => (
          <div key={item.title} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50" data-testid={`differential-${item.title.toLowerCase()}`}>
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/10 shrink-0">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Para Empresas (Cliente Corporativo)</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Servicos de auditoria para empresas que contratam viagens e eventos corporativos.
        </p>
        <div className="space-y-3">
          {CORPORATE_SERVICES.map((service) => (
            <ExpandableServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Handshake className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h2 className="text-lg font-semibold">Para Agencias / TMC (Evolucao para Primeira Linha)</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Programas de maturidade e padronizacao para agencias de viagens corporativas.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {TMC_SERVICES.map((service) => (
            <ExpandableTmcCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          <h2 className="text-lg font-semibold">Eventos Corporativos (MICE) — Auditoria Especializada</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Auditoria completa do ciclo de eventos: sourcing → contratacao → execucao → fechamento.
        </p>
        <Card>
          <CardContent className="p-5 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-medium">O que auditamos</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MICE_AUDIT_ITEMS.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-violet-600 mt-0.5 shrink-0" />
                    <span className="text-xs text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-medium">Entregas</p>
              <div className="space-y-1.5">
                {MICE_DELIVERABLES.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <FileText className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="text-xs text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            Como funciona (online)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {METHODOLOGY_STAGES.map((stage, index) => (
              <div key={stage.step} className="relative" data-testid={`stage-${stage.step}`}>
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                    <stage.icon className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono mb-1">{stage.step}</Badge>
                  <h4 className="text-sm font-semibold">{stage.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{stage.description}</p>
                </div>
                {index < METHODOLOGY_STAGES.length - 1 && index !== 2 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Entregaveis padrao (o que voce recebe)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {STANDARD_DELIVERABLES.map((item) => (
              <div key={item.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50" data-testid={`deliverable-${item.title.toLowerCase().replace(/\s/g, '-')}`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Modelos de contratacao
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRICING_MODELS.map((model) => (
              <div key={model.title} className="p-4 rounded-lg border bg-card text-center" data-testid={`pricing-${model.title.toLowerCase().replace(/\s/g, '-')}`}>
                <Badge variant="secondary" className="text-[10px] mb-2">{model.badge}</Badge>
                <p className="text-sm font-semibold">{model.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{model.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="space-y-4" data-testid="section-latam-reach">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Cobertura Nacional e LATAM</h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
          Cobertura completa do ecossistema corporativo de despesas, desde GDS e OBTs ate eventos corporativos (MICE), com atuacao em toda a America Latina.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {LATAM_ECOSYSTEM_CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
              data-testid={`latam-category-${cat.name.toLowerCase().replace(/[\s/]/g, '-')}`}
            >
              <cat.icon className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-medium">{cat.name}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-sm text-muted-foreground mr-1" data-testid="text-latam-countries-label">Atuacao LATAM:</span>
          {LATAM_COUNTRIES.map((country) => (
            <Badge key={country.code} variant="outline" className="text-xs" data-testid={`badge-country-${country.code.toLowerCase()}`}>
              {country.code} {country.name}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            Principais Cases
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Mais de R$ 448 milhoes em economia e recuperacao, de R$ 2,8 bilhoes revisados — media superior a 16%.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {MAIN_CLIENTS.map((client) => (
              <div
                key={client}
                className="flex items-center justify-center px-3 py-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                data-testid={`client-case-${client.toLowerCase().replace(/\s/g, '-')}`}
              >
                <span className="text-sm font-medium text-center">{client}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary" />
            FAQ (Perguntas frequentes)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {FAQ_ITEMS.map((faq, index) => (
            <div key={index} className="border rounded-lg" data-testid={`faq-${index}`}>
              <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                data-testid={`button-faq-${index}`}
              >
                <span className="text-sm font-medium">{faq.question}</span>
                {expandedFaq === index ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </button>
              {expandedFaq === index && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold" data-testid="text-cta-title">Quer ver o AuraAudit operando no seu cenario?</h3>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Solicite um diagnostico inicial com amostra de dados (faturas/PNRs/folios)
            e receba um relatorio com divergencias, oportunidades e evidencias rastreaveis.
          </p>
          <Button className="mt-2" data-testid="button-cta-contact">
            Solicitar Diagnostico
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex items-center justify-between text-xs text-muted-foreground pb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3" />
          <span>Cadeia de Custodia Digital - Lei 13.964/2019</span>
        </div>
        <span>AuraAUDIT - Auditoria Forense em Despesas</span>
      </div>
    </div>
  );
}

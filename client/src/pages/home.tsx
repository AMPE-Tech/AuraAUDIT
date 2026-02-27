import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
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
  Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const HERO_AREA_DATA = [
  { m: "Jan", v: 42, e: 5.8 },
  { m: "Fev", v: 38, e: 4.9 },
  { m: "Mar", v: 51, e: 8.2 },
  { m: "Abr", v: 47, e: 7.1 },
  { m: "Mai", v: 55, e: 9.8 },
  { m: "Jun", v: 49, e: 8.4 },
  { m: "Jul", v: 58, e: 11.2 },
  { m: "Ago", v: 53, e: 9.6 },
];

const HERO_BAR_DATA = [
  { cat: "Aereo", val: 38 },
  { cat: "Hotel", val: 24 },
  { cat: "Eventos", val: 15 },
  { cat: "Transp.", val: 12 },
  { cat: "Alim.", val: 11 },
];

const HERO_PIE_DATA = [
  { name: "Conforme", value: 68 },
  { name: "Excecao", value: 22 },
  { name: "Critico", value: 10 },
];
const HERO_PIE_COLORS = ["hsl(145, 65%, 42%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)"];

const HERO_RADAR_DATA = [
  { s: "Politica", v: 78 },
  { s: "Aprovacoes", v: 85 },
  { s: "Comprov.", v: 72 },
  { s: "Limites", v: 81 },
  { s: "Preferen.", v: 65 },
  { s: "Antecede.", v: 70 },
];

const DIFFERENTIALS = [
  { icon: Scale, title: "Independencia", description: "Atuacao imparcial — o algoritmo com IA generativa audita e apresenta o resultado, consultor e cliente monitoram entregaveis" },
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
    description: "Auditoria continua de despesas corporativas para identificar cobrancas indevidas, inconsistencias e oportunidades de economia.",
    auditItems: [
      "Conciliacao multi-via: requisicao + fatura + pagamento + comprovante",
      "Taxas e fees: cobrancas acessorias, markups, service fees e encargos nao previstos",
      "Valores acima do esperado por categoria, fornecedor e perfil",
      "Divergencias entre contratado, executado e faturado",
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
    description: "Verificacao automatizada da aderencia as politicas corporativas vigentes.",
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
      "Valores acima do esperado / inconsistencias por categoria e perfil",
      "Gastos fora do padrao por unidade/centro de custo",
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


const PRODUCT_CATALOG = [
  {
    id: "travel_events",
    title: "Viagens e Eventos",
    icon: Plane,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/50",
    description: "Passagens aereas, hospedagem, alimentacao, transporte terrestre, locacao de veiculos, seguros viagem e eventos corporativos (MICE).",
    highlights: ["Cruzamento multi-sistema (OBT, backoffice, GDS, BSPlink)", "Deteccao de fraudes e retencoes indevidas", "Reconciliacao com cartoes corporativos"],
  },
  {
    id: "corporate_expenses",
    title: "Despesas Corporativas",
    icon: Briefcase,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/50",
    description: "Cartoes corporativos, reembolsos, adiantamentos e despesas operacionais com foco em conformidade e recuperacao de valores.",
    highlights: ["Analise de cartoes corporativos", "Cruzamento com politicas internas", "Deteccao de despesas duplicadas"],
  },
  {
    id: "third_party_contracts",
    title: "Contratos com Terceiros",
    icon: FileText,
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-100 dark:bg-violet-900/50",
    description: "Contratos de servicos, fornecedores, SLAs e conformidade contratual — identificando desvios e oportunidades de economia.",
    highlights: ["Analise de SLAs e penalidades", "Deteccao de sobrepreco", "Benchmark de mercado"],
  },
  {
    id: "telecom",
    title: "Telecomunicacoes",
    icon: Phone,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/50",
    description: "Telefonia, dados, cloud, licencas de software e infraestrutura de TI — otimizando custos e identificando cobrancas indevidas.",
    highlights: ["Auditoria de faturas e licencas", "Otimizacao de planos e pacotes", "Deteccao de servicos inativos"],
  },
  {
    id: "fleet_logistics",
    title: "Frota e Logistica",
    icon: Car,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/50",
    description: "Frota propria, locacao de veiculos, combustivel e operacoes logisticas com foco em eficiencia e conformidade.",
    highlights: ["Analise de custos de frota", "Verificacao de consumo", "Otimizacao de rotas"],
  },
  {
    id: "benefits_hr",
    title: "Beneficios e RH",
    icon: Heart,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-100 dark:bg-rose-900/50",
    description: "Planos de saude, odontologico, seguro vida, vale transporte e refeicao — identificando inconsistencias e valores a recuperar.",
    highlights: ["Analise de sinistralidade", "Verificacao de elegibilidade", "Conformidade trabalhista"],
  },
  {
    id: "procurement",
    title: "Suprimentos e Compras",
    icon: ShoppingCart,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/50",
    description: "Processos de compras, cotacoes, licitacoes, gestao de estoque e relacionamento com fornecedores.",
    highlights: ["Auditoria de cotacoes e concorrencias", "Deteccao de conflitos de interesse", "Avaliacao de fornecedores"],
  },
  {
    id: "continuous_monitoring",
    title: "Monitoramento Continuo",
    icon: Eye,
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-100 dark:bg-teal-900/50",
    description: "Acompanhamento preventivo de transacoes e processos com alertas em tempo real e dashboards executivos.",
    highlights: ["Alertas em tempo real", "Dashboards personalizados", "Indicadores de risco e tendencias"],
  },
];

function ProductCatalogCard({ product }: { product: typeof PRODUCT_CATALOG[0] }) {
  const [expanded, setExpanded] = useState(false);
  const isTravel = product.id === "travel_events";
  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${isTravel ? "border-blue-300 dark:border-blue-800 ring-1 ring-blue-200 dark:ring-blue-900/50" : ""}`}
      onClick={() => setExpanded(!expanded)}
      data-testid={`product-card-${product.id}`}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${product.bgColor}`}>
            <product.icon className={`w-4 h-4 ${product.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-semibold leading-tight">{product.title}</h3>
            {isTravel && <Badge className="text-[9px] mt-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-0">Disponivel</Badge>}
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{product.description}</p>
        {expanded && (
          <div className="space-y-1 pt-1 border-t">
            {product.highlights.map((item) => (
              <div key={item} className="flex items-start gap-1.5">
                <CheckCircle2 className="w-2.5 h-2.5 text-primary mt-0.5 shrink-0" />
                <span className="text-[10px] text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
            data-testid={`product-expand-${product.id}`}
          >
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            {expanded ? "Recolher" : "Saiba mais"}
          </button>
          {isTravel && expanded && (
            <Button
              size="sm"
              className="text-[10px] h-6 px-2 ml-auto"
              onClick={(e) => { e.stopPropagation(); window.location.href = "/dashboard"; }}
              data-testid="button-access-travel-panel"
            >
              Acessar painel
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

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

const MAIN_SEGMENTS = [
  "Farmaceutica", "Cosmeticos", "Alimentos & Bebidas", "Tecnologia", "Servicos",
  "Energia & Oil & Gas", "Automotivo", "Siderurgia & Mineracao", "Quimica & Agro", "Bancos & Financeiro",
  "Varejo & E-commerce", "Saude & Hospitalar", "Engenharia & Construcao", "Seguros", "Telecomunicacoes",
];

const LATAM_ECOSYSTEM_CATEGORIES = [
  { name: "GDS", icon: Network, description: "Global Distribution Systems" },
  { name: "OBT", icon: Monitor, description: "Online Booking Tool" },
  { name: "TMC", icon: Building2, description: "Travel Management Company" },
  { name: "Midoffice / Backoffice", icon: Database, description: "Conciliacao e faturamento" },
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
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customForm, setCustomForm] = useState({ empresa: "", cnpj: "", nome: "", email: "", telefone: "", necessidade: "" });
  const { toast } = useToast();

  return (
    <div className="p-6 space-y-8 max-w-[1400px] mx-auto">

      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">O que fazemos</h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-4xl">
            Uma <span className="font-medium text-foreground">plataforma forense de auditoria online</span>, com{" "}
            <span className="font-medium text-foreground">IAs Generativas altamente treinadas</span> para que detecta desconformidades e desperdicios em{" "}
            <span className="font-medium text-foreground">despesas corporativas</span>, plataforma automatiza a coleta e a conciliacao de evidencias e entrega{" "}
            <span className="font-medium text-foreground">trilhas auditaveis</span>, alertas em tempo real,{" "}
            <span className="font-medium text-foreground">cadeia de custodia</span> e{" "}
            <span className="font-medium text-foreground">rastreabilidade juridica</span>, com{" "}
            <span className="font-medium text-foreground">dashboards executivos</span> e monitoramento continuo — no padrao que Compliance exige.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button variant="default" size="sm" className="text-xs" data-testid="button-how-it-works" onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}>
              Ver como funciona
            </Button>
            <Button variant="outline" size="sm" className="text-xs" data-testid="button-request-diagnostic" onClick={() => window.location.href = '/teste-agora'}>
              Teste agora
            </Button>
            <Button variant="outline" size="sm" className="text-xs" data-testid="button-monthly-subscription" onClick={() => window.location.href = '/subscription'}>
              Plano Basico $99 / Mes
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4" data-testid="section-products-catalog">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Categorias Auditaveis</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRODUCT_CATALOG.map((product) => (
            <ProductCatalogCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold" data-testid="text-performance-title">Performance</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-emerald-200 dark:border-emerald-900">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mx-auto mb-2">
                <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="stat-reviewed">+2,8 BI</p>
              <p className="text-xs text-muted-foreground mt-1">Revisados</p>
              <p className="text-xs text-muted-foreground">em volume financeiro total</p>
            </CardContent>
          </Card>
          <Card className="border-amber-200 dark:border-amber-900">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/50 mx-auto mb-2">
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400" data-testid="stat-recovered">+448 MI</p>
              <p className="text-xs text-muted-foreground mt-1">Economizados</p>
              <p className="text-xs text-muted-foreground">media do total revisado</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 dark:border-blue-900">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 mx-auto mb-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400" data-testid="stat-avg-result">16%</p>
              <p className="text-xs text-muted-foreground mt-1">Media da Economia</p>
              <p className="text-xs text-muted-foreground">sobre o volume revisado</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" data-testid="banner-dashboard-preview">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.08),transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(16,185,129,0.06),transparent_50%)]" />
        <div className="relative p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-500/20">
                <BarChart3 className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100">Dashboard AuraAudit</p>
                <p className="text-[10px] text-slate-400">Visao executiva em tempo real dos resultados da auditoria</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">Live</Badge>
              <Badge className="bg-slate-700/60 text-slate-300 border-slate-600/40 text-[10px]">Atualizado agora</Badge>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Volume Auditado</p>
              <p className="text-lg font-bold text-slate-100 mt-0.5">R$ 4,2M</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5"><TrendingUp className="w-3 h-3" /> +12% vs anterior</p>
            </div>
            <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Economia</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">R$ 672K</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5"><TrendingUp className="w-3 h-3" /> 16% savings rate</p>
            </div>
            <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Anomalias</p>
              <p className="text-lg font-bold text-amber-400 mt-0.5">23</p>
              <p className="text-[10px] text-slate-400 mt-0.5">5 criticas, 8 altas</p>
            </div>
            <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Compliance</p>
              <p className="text-lg font-bold text-blue-400 mt-0.5">78%</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Aderencia a politica</p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-5 rounded-lg bg-slate-800/40 border border-slate-700/30 p-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Evolucao Mensal — Despesas vs Economia</p>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={HERO_AREA_DATA}>
                  <defs>
                    <linearGradient id="heroGradV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="heroGradE" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="m" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Area type="monotone" dataKey="v" stroke="#3b82f6" fill="url(#heroGradV)" strokeWidth={2} />
                  <Area type="monotone" dataKey="e" stroke="#10b981" fill="url(#heroGradE)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-4 justify-center mt-1">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[9px] text-slate-400">Despesas (R$M)</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[9px] text-slate-400">Economia (R$M)</span></div>
              </div>
            </div>

            <div className="col-span-3 rounded-lg bg-slate-800/40 border border-slate-700/30 p-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Despesas por Categoria</p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={HERO_BAR_DATA} layout="vertical" barCategoryGap={4}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="cat" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={45} />
                  <Bar dataKey="val" radius={[0, 4, 4, 0]} barSize={14}>
                    {HERO_BAR_DATA.map((_, i) => (
                      <Cell key={`bar-${i}`} fill={i === 0 ? "#3b82f6" : i === 1 ? "#6366f1" : i === 2 ? "#8b5cf6" : i === 3 ? "#a78bfa" : "#c4b5fd"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[9px] text-slate-500 text-center mt-1">% do volume total</p>
            </div>

            <div className="col-span-2 rounded-lg bg-slate-800/40 border border-slate-700/30 p-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Status</p>
              <ResponsiveContainer width="100%" height={110}>
                <PieChart>
                  <Pie data={HERO_PIE_DATA} cx="50%" cy="50%" innerRadius={25} outerRadius={42} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {HERO_PIE_DATA.map((_, i) => (
                      <Cell key={`pie-${i}`} fill={HERO_PIE_COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-1">
                {HERO_PIE_DATA.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: HERO_PIE_COLORS[i] }} /><span className="text-[9px] text-slate-400">{item.name}</span></div>
                    <span className="text-[9px] text-slate-300 font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2 rounded-lg bg-slate-800/40 border border-slate-700/30 p-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Compliance</p>
              <ResponsiveContainer width="100%" height={120}>
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={HERO_RADAR_DATA}>
                  <PolarGrid stroke="rgba(148,163,184,0.15)" />
                  <PolarAngleAxis dataKey="s" tick={{ fontSize: 7, fill: "#94a3b8" }} />
                  <Radar dataKey="v" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={1.5} />
                </RadarChart>
              </ResponsiveContainer>
              <p className="text-[9px] text-slate-500 text-center">Radar de aderencia</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-[10px] text-slate-500">Dados ilustrativos — dashboard personalizado por projeto</p>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-slate-500" />
              <span className="text-[10px] text-slate-500">Cadeia de Custodia Digital</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 py-2">
        <p className="text-xs text-muted-foreground">Plano basico com <strong className="text-foreground">cadeia de custodia</strong> e <strong className="text-foreground">rastreabilidade juridica</strong></p>
        <Button variant="outline" size="sm" className="text-xs" onClick={() => window.location.href = '/subscription'} data-testid="button-cta-custody-plan">
          Ver plano
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" data-testid="banner-chain-custody">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(245,158,11,0.06),transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(16,185,129,0.04),transparent_50%)]" />
        <div className="relative p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-amber-500/20">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100">Cadeia de Custodia & Rastreabilidade Juridica</p>
                <p className="text-[10px] text-slate-400">Lei 13.964/2019 — Integridade e admissibilidade juridica das evidencias</p>
              </div>
            </div>
            <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px]">Compliance</Badge>
          </div>

          <div className="rounded-lg bg-slate-800/50 border border-slate-700/30 p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <p className="text-[11px] font-medium text-slate-200">Registro de Evidencia — Exemplo Ilustrativo</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <p className="text-[9px] text-slate-500 uppercase tracking-wider">UUID do Caso</p>
                <div className="font-mono text-[11px] text-blue-400 bg-slate-900/60 rounded px-2.5 py-1.5 border border-slate-700/40">
                  a3f8c2e1-7b4d-4e9a-b6f0-2d8e1c3a5f7b
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-[9px] text-slate-500 uppercase tracking-wider">Timestamp (ISO 8601)</p>
                <div className="font-mono text-[11px] text-emerald-400 bg-slate-900/60 rounded px-2.5 py-1.5 border border-slate-700/40">
                  2025-02-25T14:32:08.000Z
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[9px] text-slate-500 uppercase tracking-wider">Hash SHA-256 (Integridade)</p>
              <div className="font-mono text-[10px] text-amber-300 bg-slate-900/60 rounded px-2.5 py-1.5 border border-amber-500/20 break-all leading-relaxed">
                e3b0c44298fc1c149afbf4c8996fb924...27ae41e4649b934ca495991b7852b855
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <p className="text-[9px] text-slate-500 uppercase tracking-wider">Tipo</p>
                <div className="text-[10px] text-slate-300 bg-slate-900/60 rounded px-2 py-1 border border-slate-700/40">Fatura Cartao</div>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] text-slate-500 uppercase tracking-wider">Origem</p>
                <div className="text-[10px] text-slate-300 bg-slate-900/60 rounded px-2 py-1 border border-slate-700/40">Bradesco EBTA</div>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] text-slate-500 uppercase tracking-wider">Status</p>
                <div className="text-[10px] text-emerald-400 bg-emerald-500/10 rounded px-2 py-1 border border-emerald-500/20 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Integro</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-slate-800/30 border border-slate-700/20 p-3">
            <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-3">Trilha de Custodia</p>
            <div className="flex items-center gap-0">
              {[
                { label: "Coleta", sub: "Raw file", color: "text-blue-400", bg: "bg-blue-500/15 border-blue-500/30" },
                { label: "Registro", sub: "UUID + Hash", color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30" },
                { label: "Validacao", sub: "SHA-256", color: "text-purple-400", bg: "bg-purple-500/15 border-purple-500/30" },
                { label: "Analise", sub: "Cruzamento", color: "text-cyan-400", bg: "bg-cyan-500/15 border-cyan-500/30" },
                { label: "Relatorio", sub: "Evidence Pack", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30" },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center flex-1">
                  <div className={`flex-1 rounded-md border ${step.bg} p-2 text-center`}>
                    <p className={`text-[10px] font-medium ${step.color}`}>{step.label}</p>
                    <p className="text-[8px] text-slate-500 mt-0.5">{step.sub}</p>
                  </div>
                  {i < 4 && <ArrowRight className="w-3 h-3 text-slate-600 mx-1 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-slate-500 text-center">Cada evidencia recebe identificacao unica, hash de integridade e registro imutavel — admissivel para Compliance, Juridico e Auditoria Interna</p>
        </div>
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

      <div className="flex items-center justify-center gap-3 py-2">
        <p className="text-xs text-muted-foreground">A partir de <strong className="text-foreground">US$ 99/mes</strong> — sem pegadinhas, sem sustos.</p>
        <Button variant="outline" size="sm" className="text-xs" onClick={() => window.location.href = '/subscription'} data-testid="button-cta-pricing-inline-1">
          Ver plano
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Para Empresas</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Servicos de auditoria forense para empresas com despesas corporativas recorrentes.
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
          <Handshake className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h2 className="text-sm font-semibold">Para Fornecedores</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Programa para maturidade e padronizacao de fornecedores corporativos — diagnostico, governanca, billing e adequacao operacional.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {TMC_SERVICES.map((service) => (
            <ExpandableTmcCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      <Separator />

      <Card id="como-funciona">
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

      <Separator />

      <div className="space-y-4" data-testid="section-latam-reach">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Cobertura Nacional e LATAM</h2>
        </div>
        <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
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
            +300 cases em praticamente todos os segmentos — R$ 2,8 bilhoes revisados com media superior a 16% de resultado.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {MAIN_SEGMENTS.map((segment) => (
              <div
                key={segment}
                className="flex items-center justify-center px-3 py-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                data-testid={`segment-case-${segment.toLowerCase().replace(/[\s&/]/g, '-')}`}
              >
                <span className="text-sm font-medium text-center">{segment}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="space-y-4" data-testid="section-modules">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Plano fixo mensal + Modulos & Add-ons</h2>
        </div>
        <p className="text-xs text-muted-foreground max-w-3xl">
          O AuraAudit funciona em camadas: a assinatura base (Pass) garante auditoria continua, e voce adiciona servicos de IA sob demanda, pagando apenas pelo que usar.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/30" data-testid="card-module-pass">
            <CardContent className="p-4 space-y-2">
              <Badge className="text-[10px]">Base</Badge>
              <h3 className="text-sm font-semibold">AuraAudit Pass</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Auditoria forense continua com evidencias, dashboards, alertas e cadeia de custodia digital.
              </p>
              <div className="space-y-1 pt-1">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-primary" /> Dashboards e KPIs
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-primary" /> Trilhas auditaveis
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-primary" /> Evidence Packs
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2 text-xs" onClick={() => window.location.href = "/subscription"} data-testid="button-module-pass">
                Ver plano <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
          <Card className="border-amber-500/30" data-testid="card-module-aidesk">
            <CardContent className="p-4 space-y-2">
              <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Por consumo</Badge>
              <h3 className="text-sm font-semibold">AI Desk — 11 Servicos</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                11 servicos de IA sob demanda: conciliacao, contratos, editais, SLA/KPI, negociacao, alertas, APIs, relatorios, apresentacoes, lost saving e planos de acao.
              </p>
              <div className="space-y-1 pt-1">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Zap className="w-3 h-3 text-amber-600" /> Conciliacao + Contratos + RFP
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Zap className="w-3 h-3 text-amber-600" /> Alertas + APIs + Relatorios
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Zap className="w-3 h-3 text-amber-600" /> Negociacao + Lost Saving + Planos
                </div>
              </div>
              <Button size="sm" className="w-full mt-2 text-xs" onClick={() => window.location.href = "/ai-desk"} data-testid="button-module-aidesk">
                Ativar AI Desk <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
          <Card className="border-indigo-500/30" data-testid="card-module-studio">
            <CardContent className="p-4 space-y-2">
              <Badge variant="secondary" className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">Ativo</Badge>
              <h3 className="text-sm font-semibold">Dashboard Studio</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Customize seus dashboards com widgets interativos — views para CFO, Compliance, Agencia, com filtros e publicacao.
              </p>
              <div className="space-y-1 pt-1">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Settings className="w-3 h-3 text-indigo-600" /> 8 widgets disponiveis
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Settings className="w-3 h-3 text-indigo-600" /> Salvar e publicar views
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Settings className="w-3 h-3 text-indigo-600" /> Filtros globais
                </div>
              </div>
              <Button size="sm" className="w-full mt-2 text-xs" onClick={() => window.location.href = "/dashboard-studio"} data-testid="button-module-studio">
                Abrir Studio <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
          <Card className="border-violet-500/30" data-testid="card-module-custom">
            <CardContent className="p-4 space-y-2">
              <Badge variant="secondary" className="text-[10px] bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">Sob consulta</Badge>
              <h3 className="text-sm font-semibold">Servicos Customizados</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Projetos sob medida: auditoria pontual, implantacao de controles, success fee, treinamentos e consultoria especializada.
              </p>
              <div className="space-y-1 pt-1">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Handshake className="w-3 h-3 text-violet-600" /> Auditoria pontual / projeto fechado
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Handshake className="w-3 h-3 text-violet-600" /> Implantacao de politicas e controles
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Handshake className="w-3 h-3 text-violet-600" /> Success fee sobre recuperacoes
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Handshake className="w-3 h-3 text-violet-600" /> Treinamento e capacitacao
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Handshake className="w-3 h-3 text-violet-600" /> Consultoria em T&E e compliance
                </div>
              </div>
              <Button size="sm" className="w-full mt-2 text-xs bg-violet-600 hover:bg-violet-700 text-white" onClick={() => setShowCustomDialog(true)} data-testid="button-module-custom">
                <MessageSquare className="w-3 h-3 mr-1" />
                Falar com consultor
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Handshake className="w-5 h-5 text-violet-600" />
              Servicos Customizados
            </DialogTitle>
            <DialogDescription>
              Descreva sua necessidade e um consultor entrara em contato em ate 24h uteis.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="custom-empresa" className="text-xs">Empresa</Label>
                <Input id="custom-empresa" placeholder="Nome da empresa" value={customForm.empresa} onChange={(e) => setCustomForm(p => ({ ...p, empresa: e.target.value }))} data-testid="input-custom-empresa" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="custom-cnpj" className="text-xs">CNPJ</Label>
                <Input id="custom-cnpj" placeholder="00.000.000/0000-00" value={customForm.cnpj} onChange={(e) => setCustomForm(p => ({ ...p, cnpj: e.target.value }))} data-testid="input-custom-cnpj" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="custom-nome" className="text-xs">Nome completo</Label>
                <Input id="custom-nome" placeholder="Seu nome" value={customForm.nome} onChange={(e) => setCustomForm(p => ({ ...p, nome: e.target.value }))} data-testid="input-custom-nome" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="custom-email" className="text-xs">E-mail corporativo</Label>
                <Input id="custom-email" type="email" placeholder="voce@empresa.com" value={customForm.email} onChange={(e) => setCustomForm(p => ({ ...p, email: e.target.value }))} data-testid="input-custom-email" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="custom-telefone" className="text-xs">Telefone / WhatsApp</Label>
              <Input id="custom-telefone" placeholder="+55 (11) 99999-9999" value={customForm.telefone} onChange={(e) => setCustomForm(p => ({ ...p, telefone: e.target.value }))} data-testid="input-custom-telefone" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="custom-necessidade" className="text-xs">Descreva sua necessidade</Label>
              <Textarea id="custom-necessidade" placeholder="Ex: Precisamos de uma auditoria pontual nos contratos de hotelaria dos ultimos 2 anos, com foco em compliance e recuperacao de valores..." rows={4} value={customForm.necessidade} onChange={(e) => setCustomForm(p => ({ ...p, necessidade: e.target.value }))} data-testid="input-custom-necessidade" />
            </div>
            <Button
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
              disabled={!customForm.empresa || !customForm.nome || !customForm.email || !customForm.necessidade}
              onClick={() => {
                toast({ title: "Solicitacao enviada!", description: "Um consultor entrara em contato em ate 24h uteis." });
                setShowCustomDialog(false);
                setCustomForm({ empresa: "", cnpj: "", nome: "", email: "", telefone: "", necessidade: "" });
              }}
              data-testid="button-submit-custom"
            >
              Enviar solicitacao
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">
              Seus dados sao protegidos e usados apenas para contato comercial.
            </p>
          </div>
        </DialogContent>
      </Dialog>

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
          <h3 id="cta-diagnostico" className="text-sm font-semibold" data-testid="text-cta-title">Quer ver o AuraAudit no seu cenario?</h3>
          <p className="text-xs text-muted-foreground max-w-xl mx-auto">
            Envie uma amostra de dados e receba um diagnostico com divergencias, oportunidades e evidencias rastreaveis.
          </p>
          <Button className="mt-2" data-testid="button-cta-contact" onClick={() => window.location.href = '/teste-agora'}>
            Teste agora
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

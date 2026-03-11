import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Shield, ShieldCheck, Search, Database, Layers, Eye,
  CheckCircle2, AlertTriangle, BarChart3, ArrowRight, Globe,
  Leaf, Scale, Receipt, TrendingUp, Award,
  Briefcase, LogIn, Target, FileText, Activity, Menu, X
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";
import { SiInstagram, SiTiktok, SiLinkedin } from "react-icons/si";

const TRUST_AREA_DATA = [
  { m: "Jan", v: 120, e: 118 },
  { m: "Fev", v: 145, e: 142 },
  { m: "Mar", v: 168, e: 165 },
  { m: "Abr", v: 195, e: 190 },
  { m: "Mai", v: 230, e: 225 },
  { m: "Jun", v: 260, e: 258 },
  { m: "Jul", v: 310, e: 305 },
  { m: "Ago", v: 350, e: 348 },
];

const MODULE_BAR_DATA = [
  { cat: "AuraAUDIT", val: 42 },
  { cat: "AuraDUE", val: 28 },
  { cat: "AuraRISK", val: 18 },
  { cat: "AuraCARBO", val: 8 },
  { cat: "AuraTAX", val: 4 },
];

const TRUST_PIE_DATA = [
  { name: "AAA/AA", value: 62 },
  { name: "A", value: 25 },
  { name: "B/C", value: 13 },
];
const TRUST_PIE_COLORS = ["hsl(145, 65%, 42%)", "hsl(210, 85%, 50%)", "hsl(38, 92%, 50%)"];

const TRUST_RADAR_DATA = [
  { s: "Evidencia", v: 92 },
  { s: "Custodia", v: 88 },
  { s: "Compliance", v: 78 },
  { s: "Integridade", v: 95 },
  { s: "Cobertura", v: 72 },
  { s: "Validacao", v: 85 },
];

const ALL_MODULES = [
  {
    id: "trust",
    name: "AuraTRUST",
    tagline: "Evidence Tracking Infrastructure",
    description: "Camada transversal que certifica, valida e monitora cada processo do ecossistema. Cadeia de custodia SHA-256, monitoramento ativo de selos e emissao automatica de certificados.",
    icon: ShieldCheck,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/15",
    borderColor: "border-emerald-500/30",
    status: "active" as const,
    url: "/login",
    category: "infrastructure",
  },
  {
    id: "data",
    name: "AuraDATA",
    tagline: "Data Governance Hub",
    description: "Motor centralizado de ingestao, normalizacao e cruzamento de dados. Conciliacao multi-fonte com integridade criptografica e governanca automatizada em cada etapa.",
    icon: Database,
    color: "text-blue-500",
    bgColor: "bg-blue-500/15",
    borderColor: "border-blue-500/30",
    status: "coming_soon" as const,
    url: null,
    category: "infrastructure",
  },
  {
    id: "due",
    name: "AuraDUE",
    tagline: "Digital Due Diligence",
    description: "Coleta e verificacao automatizada de evidencias para transacoes corporativas, parcerias e submissoes regulatorias com rastreabilidade completa.",
    icon: Search,
    color: "text-violet-500",
    bgColor: "bg-violet-500/15",
    borderColor: "border-violet-500/30",
    status: "active" as const,
    url: "https://auradue.replit.app",
    category: "due_diligence",
  },
  {
    id: "legal",
    name: "AuraLEGAL",
    tagline: "Legal & Regulatory Compliance",
    description: "Gestao de conformidade juridica e regulatoria. Monitoramento de obrigacoes legais, prazos processuais e adequacao normativa com rastreabilidade completa.",
    icon: Scale,
    color: "text-rose-500",
    bgColor: "bg-rose-500/15",
    borderColor: "border-rose-500/30",
    status: "coming_soon" as const,
    url: null,
    category: "due_diligence",
  },
  {
    id: "tax",
    name: "AuraTAX",
    tagline: "Tax Credit Recovery",
    description: "Identificacao e validacao de creditos tributarios recuperaveis em estruturas corporativas e jurisdicoes complexas, com suporte documental auditavel.",
    icon: Receipt,
    color: "text-orange-500",
    bgColor: "bg-orange-500/15",
    borderColor: "border-orange-500/30",
    status: "coming_soon" as const,
    url: null,
    category: "due_diligence",
  },
  {
    id: "loa",
    name: "AuraLOA",
    tagline: "Precatory Research Validation",
    description: "Due diligence automatizada para precatorios judiciais — verificacao de origem, analise do devedor, cadeia de cessao e validacao de lastro juridico.",
    icon: FileText,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/15",
    borderColor: "border-indigo-500/30",
    status: "active" as const,
    url: "https://auraloa.replit.app",
    category: "asset_validation",
  },
  {
    id: "carbo",
    name: "AuraCARBO",
    tagline: "Carbon Project Validation",
    description: "Verificacao independente de projetos de credito de carbono — adicionalidade, permanencia, integridade de registro e conformidade com padroes internacionais.",
    icon: Leaf,
    color: "text-green-500",
    bgColor: "bg-green-500/15",
    borderColor: "border-green-500/30",
    status: "active" as const,
    url: "https://auracarbo.replit.app",
    category: "asset_validation",
  },
  {
    id: "risk",
    name: "AuraRISK",
    tagline: "Compliance Score Analysis",
    description: "Monitoramento continuo de compliance com scoring dinamico de risco. Acompanhamento de aderencia a politicas e escalacao automatica de alertas criticos.",
    icon: AlertTriangle,
    color: "text-red-500",
    bgColor: "bg-red-500/15",
    borderColor: "border-red-500/30",
    status: "active" as const,
    url: "https://aurarisk.replit.app",
    category: "asset_validation",
  },
  {
    id: "audit",
    name: "AuraAUDIT",
    tagline: "Corporate Expense Review",
    description: "Revisao forense de despesas corporativas com foco em viagens e eventos. Conciliacao automatizada entre NFS-e, ERP e extratos bancarios, deteccao de anomalias por IA, identificacao de duplicidades e recuperacao de overcharge com evidencias rastreadas.",
    icon: Receipt,
    color: "text-amber-500",
    bgColor: "bg-amber-500/15",
    borderColor: "border-amber-500/30",
    status: "active" as const,
    url: "/login",
    category: "audit_expense",
  },
  {
    id: "track",
    name: "AuraTRACK",
    tagline: "Audit Timeline Engine",
    description: "Motor de timeline de auditoria com rastreamento completo de fases, entregas e prazos. Visao cronologica de cada projeto com alertas automaticos, controle de SLA, gestao de responsaveis e historico detalhado de cada etapa do processo.",
    icon: Activity,
    color: "text-sky-500",
    bgColor: "bg-sky-500/15",
    borderColor: "border-sky-500/30",
    status: "active" as const,
    url: "/login",
    category: "audit_expense",
  },
  {
    id: "bid",
    name: "AuraBID",
    tagline: "Procurement & RFP Analysis",
    description: "Analise automatizada de editais, licitacoes e processos de compras. Validacao de conformidade documental, comparativo de propostas e deteccao de irregularidades.",
    icon: Briefcase,
    color: "text-teal-500",
    bgColor: "bg-teal-500/15",
    borderColor: "border-teal-500/30",
    status: "coming_soon" as const,
    url: null,
    category: "procurement",
  },
  {
    id: "market",
    name: "AuraMARKET",
    tagline: "Verified Asset Exchange",
    description: "Marketplace com trust score para ativos verificados — precatorios, creditos de carbono, creditos de ICMS e outros instrumentos validados com proveniencia completa.",
    icon: TrendingUp,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/15",
    borderColor: "border-cyan-500/30",
    status: "active" as const,
    url: "https://auradue.replit.app",
    category: "exchange",
  },
];

const MODULE_GROUPS = [
  {
    id: "core-infrastructure",
    title: "Core Infrastructure",
    subtitle: "Rastreabilidade, integridade e governanca de dados como base de todo o ecossistema.",
    category: "infrastructure",
  },
  {
    id: "due-diligence",
    title: "Due Diligence, Legal & Regulatory",
    subtitle: "Estruturacao documental e conformidade para decisoes criticas com seguranca e rastreabilidade.",
    category: "due_diligence",
  },
  {
    id: "asset-validation",
    title: "Asset Validation",
    subtitle: "Evidencias, integridade e prontidao para decisao na validacao de ativos criticos.",
    category: "asset_validation",
  },
  {
    id: "audit-expense",
    title: "Audit & Expense Review",
    subtitle: "Controle de despesas e acompanhamento da execucao com visao analitica e cronologica.",
    category: "audit_expense",
  },
  {
    id: "procurement",
    title: "Procurement & RFP Control",
    subtitle: "Validacao documental e analise comparativa com suporte a decisao rastreavel.",
    category: "procurement",
    note: "Camada complementar: a validacao dos fornecedores e suportada pelo AuraTRUST. Para avaliacoes mais amplas, AuraDUE e AuraTRACK podem compor uma visao 360° do processo.",
  },
  {
    id: "exchange",
    title: "Exchange & Transactions",
    subtitle: "Negociacao de ativos validados com proveniencia, lastro e seguranca transacional.",
    category: "exchange",
    note: "Somente compradores autorizados, vendedores qualificados e ativos certificados poderao acessar e negociar.",
  },
];

const TRUST_INDEX_LEVELS = [
  { level: "AAA", label: "Maximum Trust", range: "95–100", color: "bg-emerald-500/15 border-emerald-500/30", textColor: "text-emerald-400", barColor: "bg-emerald-500" },
  { level: "AA", label: "High Trust", range: "80–94", color: "bg-green-500/15 border-green-500/30", textColor: "text-green-400", barColor: "bg-green-500" },
  { level: "A", label: "Adequate Trust", range: "65–79", color: "bg-blue-500/15 border-blue-500/30", textColor: "text-blue-400", barColor: "bg-blue-500" },
  { level: "B", label: "Under Review", range: "40–64", color: "bg-amber-500/15 border-amber-500/30", textColor: "text-amber-400", barColor: "bg-amber-500" },
  { level: "C", label: "Insufficient", range: "0–39", color: "bg-red-500/15 border-red-500/30", textColor: "text-red-400", barColor: "bg-red-500" },
];

const CUSTODY_STEPS = [
  { label: "Coleta", sub: "Raw data", color: "text-blue-400", bg: "bg-blue-500/15 border-blue-500/30" },
  { label: "Registro", sub: "UUID + Hash", color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30" },
  { label: "Validacao", sub: "SHA-256", color: "text-purple-400", bg: "bg-purple-500/15 border-purple-500/30" },
  { label: "Certificacao", sub: "Trust Seal", color: "text-cyan-400", bg: "bg-cyan-500/15 border-cyan-500/30" },
  { label: "Monitoramento", sub: "Active Watch", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30" },
];

const INFRASTRUCTURE_FEATURES = [
  {
    id: "trust",
    name: "AuraTRUST",
    tagline: "Evidence Tracking Infrastructure",
    description: "Camada transversal que certifica, valida e monitora cada processo do ecossistema. Cadeia de custodia SHA-256, monitoramento ativo de selos e emissao automatica de certificados.",
    icon: ShieldCheck,
    color: "text-emerald-400",
    bgIcon: "bg-emerald-500/20",
    features: ["Cadeia de custodia (Lei 13.964/2019)", "Trust Seal com monitoramento ativo", "Certificados periodicos automaticos", "Endpoint publico de validacao"],
  },
  {
    id: "data",
    name: "AuraDATA",
    tagline: "Data Governance Hub",
    description: "Motor centralizado de ingestao, normalizacao e cruzamento de dados. Conciliacao multi-fonte com integridade criptografica em cada etapa.",
    icon: Database,
    color: "text-blue-400",
    bgIcon: "bg-blue-500/20",
    features: ["Ingestao multi-fonte de dados", "Motor de normalizacao de schema", "Matching por referencia cruzada", "Integridade criptografica dos dados"],
  },
];

const MARKET_SECTORS = [
  { name: "Corporate Travel & Events", desc: "Auditoria forense de despesas, conciliacao multi-sistema, deteccao de anomalias.", status: "Ativo" },
  { name: "Creditos de Carbono", desc: "Verificacao independente de projetos REDD+ e creditos voluntarios.", status: "Ativo" },
  { name: "Precatorios Judiciais", desc: "Due diligence automatizada para cessao e validacao de precatorios.", status: "Ativo" },
  { name: "Due Diligence Corporativa", desc: "Coleta e verificacao de evidencias para transacoes e parcerias.", status: "Ativo" },
  { name: "Compliance & Risco", desc: "Scoring dinamico e monitoramento continuo de conformidade.", status: "Ativo" },
  { name: "Marketplace de Ativos", desc: "Certificacao e trust score para ativos verificados.", status: "Ativo" },
];

function ModuleCard({ mod }: { mod: typeof ALL_MODULES[0] }) {
  const isActive = mod.status === "active";
  const isExternal = mod.url?.startsWith("http");
  return (
    <Card
      className={`hover:shadow-md transition-shadow border ${mod.borderColor}`}
      data-testid={`module-card-${mod.id}`}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${mod.bgColor}`}>
            <mod.icon className={`w-4 h-4 ${mod.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-semibold leading-tight">{mod.name}</h3>
              {isActive && <Badge className="text-[8px] px-1 py-0 bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Ativo</Badge>}
            </div>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">{mod.tagline}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{mod.description}</p>
        {isActive && mod.url && (
          <a
            href={mod.url}
            target={isExternal ? "_blank" : "_self"}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            data-testid={`module-access-${mod.id}`}
          >
            <LogIn className="w-3 h-3" />
            Entrar
          </a>
        )}
        {!isActive && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-md bg-muted text-muted-foreground opacity-50 cursor-not-allowed">
            <LogIn className="w-3 h-3" />
            Entrar
          </span>
        )}
      </CardContent>
    </Card>
  );
}

export default function LandingPageTest() {
  const [, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<"pt" | "en">("pt");

  useEffect(() => {
    document.title = "AuraTECH — Trust Infrastructure Platform";
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", "AuraTECH - Plataforma de infraestrutura de confiança baseada em evidências.");
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")} data-testid="logo-auratech">
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">AuraTECH</h1>
              <p className="text-[10px] text-muted-foreground">Trust Infrastructure Platform</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
            <button onClick={() => scrollTo('sobre-nos')} className="hover:text-foreground transition-colors">Sobre Nós</button>
            <button onClick={() => scrollTo('modulos')} className="hover:text-foreground transition-colors">Módulos</button>
            <button onClick={() => scrollTo('performance')} className="hover:text-foreground transition-colors">Performance</button>
            <button onClick={() => scrollTo('trust-index')} className="hover:text-foreground transition-colors">Trust Index</button>
            <button onClick={() => scrollTo('contato')} className="hover:text-foreground transition-colors">Contato</button>
          </nav>

          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs font-medium text-muted-foreground hover:text-foreground h-8 px-2" 
              onClick={() => setLang(lang === "pt" ? "en" : "pt")}
              data-testid="button-lang-toggle"
            >
              <Globe className="w-3.5 h-3.5 mr-1.5" />
              {lang === "pt" ? "EN" : "PT"}
            </Button>
            <Button size="sm" className="h-8 text-xs font-medium hidden sm:inline-flex" onClick={() => navigate("/login")} data-testid="button-nav-login">
              Acessar Plataforma
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 p-4 space-y-4 text-sm font-medium">
            <button onClick={() => scrollTo('sobre-nos')} className="block w-full text-left text-muted-foreground hover:text-foreground">Sobre Nós</button>
            <button onClick={() => scrollTo('modulos')} className="block w-full text-left text-muted-foreground hover:text-foreground">Módulos</button>
            <button onClick={() => scrollTo('performance')} className="block w-full text-left text-muted-foreground hover:text-foreground">Performance</button>
            <button onClick={() => scrollTo('trust-index')} className="block w-full text-left text-muted-foreground hover:text-foreground">Trust Index</button>
            <button onClick={() => scrollTo('contato')} className="block w-full text-left text-muted-foreground hover:text-foreground">Contato</button>
            <Button size="sm" className="w-full mt-4 h-8 text-xs font-medium" onClick={() => navigate("/login")}>Acessar Plataforma</Button>
          </div>
        )}
      </header>

      <div className="p-6 space-y-8 max-w-[1400px] mx-auto">

        {/* SECTION 1: Hero */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-transparent" data-testid="section-hero">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">Trust Infrastructure for Evidence-Based Verification</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-4xl">
              A plataforma <span className="font-medium text-foreground">estrutura evidencias</span>, mantem{" "}
              <span className="font-medium text-foreground">cadeia de custodia digital verificavel</span> e aplica{" "}
              <span className="font-medium text-foreground">monitoramento continuo</span> para gerar{" "}
              <span className="font-medium text-foreground">scores dinamicos de conformidade</span>.{" "}
              Cada organizacao pode configurar <span className="font-medium text-foreground">frameworks de verificacao personalizados</span>, definindo exatamente quais processos, documentos ou operacoes devem ser auditados e a Plataforma garante a{" "}
              <span className="font-medium text-foreground">preservacao intacta das evidencias de origem</span>, com{" "}
              <span className="font-medium text-foreground">rastreabilidade juridica</span>,{" "}
              <span className="font-medium text-foreground">registro imutavel</span> e{" "}
              <span className="font-medium text-foreground">integridade dos dados</span>.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button variant="default" size="sm" className="text-xs" onClick={() => navigate("/trial")} data-testid="button-hero-explore">
                Teste Agora
              </Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/subscription")} data-testid="button-hero-plans">
                Conhecer Planos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: Core Infrastructure — AuraTRUST + AuraDATA */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" data-testid="section-core-infrastructure">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(16,185,129,0.06),transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(59,130,246,0.04),transparent_50%)]" />
          <div className="relative p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-emerald-500/20">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-100">Infraestrutura Central</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Camada transversal que certifica, valida e monitora todos os modulos AuraTECH</p>
                </div>
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">Core</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INFRASTRUCTURE_FEATURES.map((infra) => (
                <div key={infra.id} className="rounded-lg bg-slate-800/50 border border-slate-700/30 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${infra.bgIcon}`}>
                      <infra.icon className={`w-4 h-4 ${infra.color}`} />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-200">{infra.name}</p>
                      <p className="text-[9px] text-slate-500">{infra.tagline}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{infra.description}</p>
                  <div className="space-y-1.5">
                    {infra.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className={`w-3 h-3 ${infra.color} shrink-0`} />
                        <span className="text-[10px] text-slate-500">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-slate-800/30 border border-slate-700/20 p-3">
              <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-3">Trilha de Custodia AuraTRUST</p>
              <div className="flex items-center gap-0">
                {CUSTODY_STEPS.map((step, i) => (
                  <div key={step.label} className="flex items-center flex-1">
                    <div className={`flex-1 rounded-md border ${step.bg} p-2 text-center`}>
                      <p className={`text-[10px] font-medium ${step.color}`}>{step.label}</p>
                      <p className="text-[8px] text-slate-500 mt-0.5">{step.sub}</p>
                    </div>
                    {i < CUSTODY_STEPS.length - 1 && <ArrowRight className="w-3 h-3 text-slate-600 mx-1 shrink-0" />}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-slate-500 text-center">Cada evidencia recebe identificacao unica, hash de integridade e registro imutavel — admissivel para Compliance, Juridico e Auditoria Interna</p>
          </div>
        </div>

        {/* SECTION 3: All 12 Modules — Grouped by Category */}
        <div id="modulos" className="space-y-6" data-testid="section-modules-catalog">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Modulos do Ecossistema</h2>
            <Badge variant="secondary" className="text-[10px]">12 modulos</Badge>
          </div>
          {MODULE_GROUPS.filter((g) => g.category !== "procurement" && g.category !== "exchange").map((group, idx) => {
            const groupModules = ALL_MODULES.filter((m) => m.category === group.category);
            return (
              <div key={group.id} className="space-y-3" data-testid={`module-group-${group.id}`}>
                {idx > 0 && <div className="border-t border-border/40" />}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xs font-semibold">{group.title}</h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{group.subtitle}</p>
                </div>
                <div className={`grid gap-4 ${groupModules.length === 1 ? 'grid-cols-1 max-w-md' : groupModules.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                  {groupModules.map((mod) => (
                    <ModuleCard key={mod.id} mod={mod} />
                  ))}
                </div>
              </div>
            );
          })}
          <div className="border-t border-border/40" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {MODULE_GROUPS.filter((g) => g.category === "procurement" || g.category === "exchange").map((group) => {
              const groupModules = ALL_MODULES.filter((m) => m.category === group.category);
              return (
                <div key={group.id} className="space-y-3" data-testid={`module-group-${group.id}`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xs font-semibold">{group.title}</h3>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{group.subtitle}</p>
                  </div>
                  {groupModules.map((mod) => (
                    <ModuleCard key={mod.id} mod={mod} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: Performance Dashboard */}
        <div id="performance" className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold" data-testid="text-performance-title">Performance da Infraestrutura</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-emerald-200 dark:border-emerald-900">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mx-auto mb-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="stat-verified">+2,8 BI</p>
                <p className="text-xs text-muted-foreground mt-1">Verificados</p>
                <p className="text-xs text-muted-foreground">em volume total processado</p>
              </CardContent>
            </Card>
            <Card className="border-amber-200 dark:border-amber-900">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/50 mx-auto mb-2">
                  <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400" data-testid="stat-certified">+350K</p>
                <p className="text-xs text-muted-foreground mt-1">Evidencias Certificadas</p>
                <p className="text-xs text-muted-foreground">com cadeia de custodia</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200 dark:border-blue-900">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 mx-auto mb-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400" data-testid="stat-trust-score">92%</p>
                <p className="text-xs text-muted-foreground mt-1">Trust Score Medio</p>
                <p className="text-xs text-muted-foreground">Aura Trust Index™</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SECTION 5: Dashboard Preview with Charts */}
        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" data-testid="banner-dashboard-preview">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.08),transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.06),transparent_50%)]" />
          <div className="relative p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-emerald-500/20">
                  <Shield className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-100">Dashboard AuraTECH</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Visao executiva da infraestrutura de confianca</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">Live</Badge>
                <Badge className="bg-slate-700/60 text-slate-300 border-slate-600/40 text-[10px]">Atualizado agora</Badge>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Evidencias Ativas</p>
                <p className="text-lg font-bold text-slate-100 mt-0.5">12.847</p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5"><TrendingUp className="w-3 h-3" /> +18% vs anterior</p>
              </div>
              <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Trust Seals</p>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">247</p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5"><ShieldCheck className="w-3 h-3" /> 98% ativos</p>
              </div>
              <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Anomalias</p>
                <p className="text-lg font-bold text-amber-400 mt-0.5">23</p>
                <p className="text-[10px] text-slate-400 mt-0.5">5 criticas, 8 altas</p>
              </div>
              <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Trust Index</p>
                <p className="text-lg font-bold text-blue-400 mt-0.5">AA</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Score 88/100</p>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-5 rounded-lg bg-slate-800/40 border border-slate-700/30 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Evolucao — Verificacoes vs Certificacoes</p>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={TRUST_AREA_DATA}>
                    <defs>
                      <linearGradient id="trustGradV" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="trustGradE" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                    <XAxis dataKey="m" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Area type="monotone" dataKey="v" stroke="#3b82f6" fill="url(#trustGradV)" strokeWidth={2} />
                    <Area type="monotone" dataKey="e" stroke="#10b981" fill="url(#trustGradE)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex gap-4 justify-center mt-1">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[9px] text-slate-400">Verificacoes</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[9px] text-slate-400">Certificacoes</span></div>
                </div>
              </div>

              <div className="col-span-3 rounded-lg bg-slate-800/40 border border-slate-700/30 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Verificacoes por Modulo</p>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={MODULE_BAR_DATA} layout="vertical" barCategoryGap={4}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="cat" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={65} />
                    <Bar dataKey="val" radius={[0, 4, 4, 0]} barSize={14}>
                      {MODULE_BAR_DATA.map((_, i) => (
                        <Cell key={`bar-${i}`} fill={i === 0 ? "#f59e0b" : i === 1 ? "#8b5cf6" : i === 2 ? "#ef4444" : i === 3 ? "#22c55e" : "#f97316"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[9px] text-slate-500 text-center mt-1">% do volume total</p>
              </div>

              <div className="col-span-2 rounded-lg bg-slate-800/40 border border-slate-700/30 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Trust Index</p>
                <ResponsiveContainer width="100%" height={110}>
                  <PieChart>
                    <Pie data={TRUST_PIE_DATA} cx="50%" cy="50%" innerRadius={25} outerRadius={42} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {TRUST_PIE_DATA.map((_, i) => (
                        <Cell key={`pie-${i}`} fill={TRUST_PIE_COLORS[i]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 mt-1">
                  {TRUST_PIE_DATA.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TRUST_PIE_COLORS[i] }} /><span className="text-[9px] text-slate-400">{item.name}</span></div>
                      <span className="text-[9px] text-slate-300 font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-2 rounded-lg bg-slate-800/40 border border-slate-700/30 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Cobertura</p>
                <ResponsiveContainer width="100%" height={120}>
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={TRUST_RADAR_DATA}>
                    <PolarGrid stroke="rgba(148,163,184,0.15)" />
                    <PolarAngleAxis dataKey="s" tick={{ fontSize: 7, fill: "#94a3b8" }} />
                    <Radar dataKey="v" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={1.5} />
                  </RadarChart>
                </ResponsiveContainer>
                <p className="text-[9px] text-slate-500 text-center">Radar de cobertura</p>
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

        {/* SECTION 6: Aura Trust Index */}
        <div id="trust-index" className="relative overflow-hidden rounded-xl border border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" data-testid="section-trust-index">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.06),transparent_50%)]" />
          <div className="relative p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-500/20">
                  <Award className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-100">Aura Trust Index™</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Score composto derivado de certificacao, evidencias, compliance e anomalias</p>
                </div>
              </div>
              <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 text-[10px]">Dynamic Model</Badge>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {TRUST_INDEX_LEVELS.map((lvl) => (
                <div key={lvl.level} className={`rounded-md border ${lvl.color} p-3 text-center`}>
                  <div className={`w-full h-1.5 rounded-full ${lvl.barColor} mb-2`} />
                  <p className={`text-lg font-bold ${lvl.textColor}`}>{lvl.level}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{lvl.label}</p>
                  <p className="text-[9px] text-slate-500">{lvl.range}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-slate-800/40 border border-slate-700/30 p-3 text-center space-y-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto" />
                <p className="text-[10px] text-slate-300 font-medium">Certification Status</p>
                <p className="text-[9px] text-slate-500">Selos ativos, certificados validos</p>
              </div>
              <div className="rounded-lg bg-slate-800/40 border border-slate-700/30 p-3 text-center space-y-1">
                <Eye className="w-4 h-4 text-blue-400 mx-auto" />
                <p className="text-[10px] text-slate-300 font-medium">Evidence Completeness</p>
                <p className="text-[9px] text-slate-500">Cobertura de dados, diversidade de fontes</p>
              </div>
              <div className="rounded-lg bg-slate-800/40 border border-slate-700/30 p-3 text-center space-y-1">
                <Layers className="w-4 h-4 text-amber-400 mx-auto" />
                <p className="text-[10px] text-slate-300 font-medium">Compliance History</p>
                <p className="text-[9px] text-slate-500">Taxa de anomalias, velocidade de resolucao</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 7: Market Application */}
        <div className="space-y-4" data-testid="section-market-application">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Aplicacao de Mercado</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            A mesma infraestrutura de confianca aplicada em verticais onde verificacao baseada em evidencias e necessaria.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MARKET_SECTORS.map((sector) => (
              <Card key={sector.name} data-testid={`card-sector-${sector.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardContent className="p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold">{sector.name}</h3>
                    <Badge className="text-[8px] px-1 py-0 bg-emerald-500/15 text-emerald-400 border-emerald-500/30">{sector.status}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{sector.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* SECTION 8: Quem Somos */}
        <div id="sobre-nos" className="space-y-6" data-testid="section-about">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">Quem Somos</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A AuraTECH é a principal infraestrutura de confiança baseada em evidências. Fornecemos as ferramentas necessárias para empresas validarem dados, garantirem compliance e manterem uma cadeia de custódia inquebrável, protegendo operações e assegurando integridade jurídica.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-muted/50 border-muted">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <Scale className="w-5 h-5 text-muted-foreground" />
                <div>
                  <h3 className="text-[11px] font-semibold">Lei 13.964/2019</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Aderência jurídica total</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/50 border-muted">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <Database className="w-5 h-5 text-muted-foreground" />
                <div>
                  <h3 className="text-[11px] font-semibold">SHA-256 Custody</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Integridade criptográfica</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/50 border-muted">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <Target className="w-5 h-5 text-muted-foreground" />
                <div>
                  <h3 className="text-[11px] font-semibold">AI-Powered</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Detecção de anomalias</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/50 border-muted">
              <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <Layers className="w-5 h-5 text-muted-foreground" />
                <div>
                  <h3 className="text-[11px] font-semibold">Multi-module</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Ecossistema integrado</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SECTION 9: CTA */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-transparent mt-8" data-testid="section-cta">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-sm font-semibold text-foreground">Pronto para elevar a confiança da sua operação?</h2>
              <p className="text-xs text-muted-foreground max-w-xl">
                Inicie agora e construa sua própria infraestrutura de verificação e compliance em poucos minutos.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button onClick={() => navigate("/trial")} data-testid="button-cta-trial" size="sm" className="text-xs">
                Teste Agora
              </Button>
              <Button onClick={() => {
                const el = document.getElementById('contato');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }} variant="outline" size="sm" className="text-xs" data-testid="button-cta-contact">
                Fale Conosco
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 10: Enhanced Footer */}
        <footer id="contato" className="pt-8 pb-6 border-t border-border/40 mt-12" data-testid="section-footer">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary">
                  <Shield className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-semibold tracking-tight">AuraTECH</span>
              </div>
              <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
                Infrastructure for Evidence-Based Trust. A plataforma definitiva para estruturação de evidências e auditoria com cadeia de custódia digital.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-social-instagram">
                  <SiInstagram className="w-4 h-4" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-social-tiktok">
                  <SiTiktok className="w-4 h-4" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-social-linkedin">
                  <SiLinkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-semibold mb-3">Links Rápidos</h4>
              <ul className="space-y-2 text-[11px] text-muted-foreground">
                <li><button onClick={() => { const el = document.getElementById('modulos'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-foreground transition-colors">Plataforma e Módulos</button></li>
                <li><button onClick={() => { const el = document.getElementById('performance'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-foreground transition-colors">Performance</button></li>
                <li><button onClick={() => { const el = document.getElementById('trust-index'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-foreground transition-colors">Aura Trust Index</button></li>
                <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth'})} className="hover:text-foreground transition-colors">Voltar ao topo</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold mb-3">Legal & Compliance</h4>
              <ul className="space-y-2 text-[11px] text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Conformidade LGPD</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-border/40">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <Shield className="w-3 h-3" />
              <span>Cadeia de Custódia Digital - Lei 13.964/2019</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              © 2025 AuraTECH. Todos os direitos reservados.
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}

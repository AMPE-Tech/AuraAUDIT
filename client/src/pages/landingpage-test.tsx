import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Shield, ShieldCheck, Search, Database, Lock, Layers, Eye,
  Upload, FileText, Trash2, ArrowRight, ArrowDown, CheckCircle2,
  Loader2, AlertTriangle, Zap, Globe, Hash, Ban, BarChart3,
  Leaf, Scale, Receipt, TrendingUp, Network, Award, Building2,
  Plane, Briefcase, ChevronRight, ChevronDown, LogIn, Target
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

interface FileDetail {
  originalName: string;
  size: number;
  format: string;
  sha256: string;
}

interface AuditEnvelope {
  envelopeId: string;
  type: string;
  inputs: {
    files: FileDetail[];
    description: string;
    descriptionHash: string;
  };
  processing: {
    model: string;
    startedAt: string;
    completedAt: string;
  };
  output: {
    reportHash: string;
  };
  envelopeSha256: string;
}

interface TrialStatus {
  used: number;
  remaining: number;
  limit: number;
}

interface AnalysisResult {
  report: string;
  envelope: AuditEnvelope;
  files: FileDetail[];
  trialStatus?: TrialStatus;
}

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

const CORE_INFRASTRUCTURE = [
  {
    id: "trust",
    name: "AuraTRUST",
    tagline: "Evidence Tracking Infrastructure",
    description: "Camada transversal que certifica, valida e monitora cada processo do ecossistema. Cadeia de custodia SHA-256, monitoramento ativo de selos e emissao automatica de certificados.",
    icon: ShieldCheck,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/50",
    borderColor: "border-emerald-200 dark:border-emerald-900",
    features: ["Cadeia de custodia (Lei 13.964/2019)", "Trust Seal com monitoramento ativo", "Certificados periodicos automaticos", "Endpoint publico de validacao"],
  },
  {
    id: "data",
    name: "AuraDATA",
    tagline: "Data Governance Hub",
    description: "Motor centralizado de ingestao, normalizacao e cruzamento de dados. Conciliacao multi-fonte com integridade criptografica em cada etapa.",
    icon: Database,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/50",
    borderColor: "border-blue-200 dark:border-blue-900",
    features: ["Ingestao multi-fonte de dados", "Motor de normalizacao de schema", "Matching por referencia cruzada", "Integridade criptografica dos dados"],
  },
];

const VERIFICATION_MODULES = [
  {
    id: "due",
    name: "AuraDUE",
    tagline: "Digital Due Diligence",
    description: "Coleta e verificacao automatizada de evidencias para transacoes corporativas, parcerias e submissoes regulatorias.",
    icon: Search,
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-100 dark:bg-violet-900/50",
    borderColor: "border-violet-200 dark:border-violet-900",
  },
  {
    id: "audit",
    name: "AuraAUDIT",
    tagline: "Corporate Expense Review",
    description: "Analise forense de despesas corporativas de viagens e eventos. Conciliacao multi-sistema, deteccao de anomalias e recuperacao de overcharge.",
    icon: Receipt,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/50",
    borderColor: "border-amber-200 dark:border-amber-900",
  },
  {
    id: "risk",
    name: "AuraRISK",
    tagline: "Compliance Score Analysis",
    description: "Monitoramento continuo de compliance com scoring dinamico de risco. Acompanhamento de aderencia a politicas e escalacao automatica de alertas.",
    icon: AlertTriangle,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/50",
    borderColor: "border-red-200 dark:border-red-900",
  },
];

const SPECIALIZED_MODULES = [
  {
    id: "carbo",
    name: "AuraCARBO",
    tagline: "Carbon Project Validation",
    description: "Verificacao independente de projetos de credito de carbono — adicionalidade, permanencia e integridade de registro.",
    icon: Leaf,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/50",
  },
  {
    id: "loa",
    name: "AuraLOA",
    tagline: "Precatory Research Validation",
    description: "Due diligence automatizada para precatorios judiciais — verificacao de origem, analise do devedor e cadeia de cessao.",
    icon: Scale,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/50",
  },
  {
    id: "tax",
    name: "AuraTAX",
    tagline: "Tax Credit Recovery",
    description: "Identificacao e validacao de creditos tributarios recuperaveis em estruturas corporativas e jurisdicoes complexas.",
    icon: Receipt,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/50",
  },
  {
    id: "market",
    name: "AuraMARKET",
    tagline: "Verified Asset Exchange",
    description: "Marketplace com trust score para ativos verificados — certificados, creditos e instrumentos validados com proveniencia completa.",
    icon: TrendingUp,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/50",
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

function ModuleCard({ mod }: { mod: typeof VERIFICATION_MODULES[0] }) {
  const [expanded, setExpanded] = useState(false);
  const isAudit = mod.id === "audit";
  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${isAudit ? "border-amber-300 dark:border-amber-800 ring-1 ring-amber-200 dark:ring-amber-900/50" : ""}`}
      onClick={() => setExpanded(!expanded)}
      data-testid={`module-card-${mod.id}`}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${mod.bgColor}`}>
            <mod.icon className={`w-4 h-4 ${mod.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-semibold leading-tight">{mod.name}</h3>
            {isAudit && <Badge className="text-[9px] mt-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0">Ativo</Badge>}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">{mod.tagline}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{mod.description}</p>
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-1 text-xs text-primary font-medium hover:underline" data-testid={`module-expand-${mod.id}`}>
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            {expanded ? "Recolher" : "Saiba mais"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LandingPageTest() {
  const [, navigate] = useLocation();
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const trialRef = useRef<HTMLDivElement>(null);

  const { data: trialStatus, refetch: refetchStatus } = useQuery<TrialStatus>({
    queryKey: ["/api/trial/status"],
  });

  const remaining = trialStatus?.remaining ?? 3;
  const used = trialStatus?.used ?? 0;
  const limit = trialStatus?.limit ?? 3;
  const isBlocked = remaining <= 0;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const total = files.length + selected.length;
    if (total > 3) {
      setError("Maximo de 3 arquivos permitidos no teste gratuito.");
      return;
    }
    setFiles((prev) => [...prev, ...selected].slice(0, 3));
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError("Envie pelo menos 1 arquivo.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Descreva o que deseja analisar (minimo 10 caracteres).");
      return;
    }
    setIsAnalyzing(true);
    setError("");
    setResult(null);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      formData.append("description", description);
      const response = await fetch("/api/trial/analyze", { method: "POST", body: formData });
      if (!response.ok) {
        const errData = await response.json();
        if (response.status === 429) refetchStatus();
        throw new Error(errData.error || "Erro ao processar.");
      }
      const data = await response.json();
      setResult(data);
      refetchStatus();
    } catch (err: any) {
      setError(err.message || "Erro ao processar analise.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const scrollToTrial = () => {
    trialRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">AuraTECH</h1>
              <p className="text-[10px] text-muted-foreground">Trust Infrastructure Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={() => navigate("/login")} data-testid="button-nav-login">
              Acessar Plataforma
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-8 max-w-[1400px] mx-auto">

        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-transparent" data-testid="section-hero">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold">O que fazemos</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-4xl">
              Uma <span className="font-medium text-foreground">infraestrutura modular de confianca</span> para{" "}
              <span className="font-medium text-foreground">verificacao baseada em evidencias</span>. Plataforma que{" "}
              <span className="font-medium text-foreground">certifica, valida e pontua</span> processos com{" "}
              <span className="font-medium text-foreground">cadeia de custodia digital</span>,{" "}
              <span className="font-medium text-foreground">rastreabilidade juridica</span> e{" "}
              <span className="font-medium text-foreground">monitoramento continuo</span> — no padrao que Compliance exige.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button variant="default" size="sm" className="text-xs" onClick={scrollToTrial} data-testid="button-hero-explore">
                Teste Agora
              </Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/subscription")} data-testid="button-hero-plans">
                Conhecer Planos
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4" data-testid="section-modules-catalog">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Modulos do Ecossistema</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...VERIFICATION_MODULES, ...SPECIALIZED_MODULES].map((mod) => (
              <ModuleCard key={mod.id} mod={mod} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
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

        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" data-testid="banner-dashboard-preview">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.08),transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.06),transparent_50%)]" />
          <div className="relative p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-emerald-500/20">
                  <Shield className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">Dashboard AuraTECH</p>
                  <p className="text-[10px] text-slate-400">Visao executiva da infraestrutura de confianca</p>
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

        <div className="flex items-center justify-center gap-3 py-2">
          <p className="text-xs text-muted-foreground">Infraestrutura com <strong className="text-foreground">cadeia de custodia</strong> e <strong className="text-foreground">rastreabilidade juridica</strong></p>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/subscription")} data-testid="button-cta-plan">
            Ver plano
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" data-testid="section-trust-layer">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(16,185,129,0.06),transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(59,130,246,0.04),transparent_50%)]" />
          <div className="relative p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-emerald-500/20">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">AuraTRUST Evidence Tracking Infrastructure</p>
                  <p className="text-[10px] text-slate-400">Camada transversal que certifica, valida e monitora todos os modulos AuraTECH</p>
                </div>
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">Core</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CORE_INFRASTRUCTURE.map((infra) => (
                <div key={infra.id} className="rounded-lg bg-slate-800/50 border border-slate-700/30 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${infra.id === "trust" ? "bg-emerald-500/20" : "bg-blue-500/20"}`}>
                      <infra.icon className={`w-4 h-4 ${infra.id === "trust" ? "text-emerald-400" : "text-blue-400"}`} />
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
                        <CheckCircle2 className={`w-3 h-3 ${infra.id === "trust" ? "text-emerald-500" : "text-blue-500"} shrink-0`} />
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

        <Separator />

        <div className="space-y-4" data-testid="section-verification">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Modulos de Verificacao & Analise</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Motores de verificacao baseados em evidencias, cada um cobrindo um dominio distinto de compliance.
          </p>
          <div className="space-y-3">
            {VERIFICATION_MODULES.map((mod) => (
              <Card key={mod.id} className={mod.borderColor} data-testid={`card-verification-${mod.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${mod.bgColor} shrink-0`}>
                      <mod.icon className={`w-5 h-5 ${mod.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm">{mod.name}</CardTitle>
                        <Badge variant="secondary" className="text-[10px]">{mod.tagline}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{mod.description}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-4" data-testid="section-specialized">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Modulos Especializados de Validacao</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Verticais especificas por industria — a mesma infraestrutura de confianca aplicada onde verificacao baseada em evidencias e necessaria.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SPECIALIZED_MODULES.map((mod) => (
              <Card key={mod.id} data-testid={`card-specialized-${mod.id}`}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${mod.bgColor}`}>
                      <mod.icon className={`w-4 h-4 ${mod.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold">{mod.name}</h3>
                      <p className="text-[10px] text-muted-foreground">{mod.tagline}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{mod.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        <div className="relative overflow-hidden rounded-xl border border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" data-testid="section-trust-index">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.06),transparent_50%)]" />
          <div className="relative p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-500/20">
                  <Award className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">Aura Trust Index™</p>
                  <p className="text-[10px] text-slate-400">Score composto derivado de certificacao, evidencias, compliance e anomalias</p>
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

        <Separator />

        <div className="space-y-4" data-testid="section-market">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Aplicacao Inicial de Mercado</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-amber-200 dark:border-amber-900/50">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 shrink-0">
                    <Plane className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm">Corporate Travel & Events</CardTitle>
                      <Badge className="text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0">Ativo</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">R$ 51M+ em volume analisado. Conciliacao multi-sistema, analise forense e recuperacao de overcharge.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-1.5">
                {[
                  "Pipeline de conciliacao 4 vias",
                  "Deteccao de anomalias com IA",
                  "Cadeia de custodia (Lei 13.964/2019)",
                  "Recuperacao de overcharge baseada em evidencias",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <span className="text-xs text-muted-foreground">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted shrink-0">
                    <Network className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm">Setores em Expansao</CardTitle>
                      <Badge variant="outline" className="text-[9px]">Roadmap</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">A mesma infraestrutura de confianca para qualquer dominio que exija verificacao baseada em evidencias.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-1.5">
                {[
                  "Validacao de creditos de carbono (AuraCARBO)",
                  "Due diligence de precatorios (AuraLOA)",
                  "Recuperacao de creditos tributarios (AuraTAX)",
                  "Marketplace de ativos verificados (AuraMARKET)",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-xs text-muted-foreground">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        <div ref={trialRef} className="space-y-6" data-testid="section-trial">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">Teste Gratuito — Diagnostico com Cadeia de Custodia</h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-3xl">
            Envie ate 3 arquivos e descreva o que deseja analisar. Nossa IA gera um relatorio de diagnostico com cadeia de custodia digital — SHA-256, timestamps e rastreabilidade completa.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Dados nao armazenados</span>
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Cadeia de custodia inclusa</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Resultado em segundos</span>
          </div>

          {isBlocked && !result ? (
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <Ban className="w-12 h-12 text-muted-foreground mx-auto" />
                <h3 className="text-base font-semibold" data-testid="text-trial-blocked">Seus testes gratuitos acabaram</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Voce utilizou todos os {limit} diagnosticos gratuitos disponiveis. Ative a plataforma completa para continuar.
                </p>
              </div>
              <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
                <CardContent className="pt-6 space-y-4">
                  <h3 className="text-sm font-semibold text-center">Continue com a Plataforma AuraTECH</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <Globe className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium">Integracao API em Tempo Real</p>
                        <p className="text-[10px] text-muted-foreground">OBT, Backoffice, GDS, BSP, cartoes corporativos</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <BarChart3 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium">Dashboard Interativo</p>
                        <p className="text-[10px] text-muted-foreground">KPIs, alertas e controles em tempo real</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium">Conciliacao Multi-vias</p>
                        <p className="text-[10px] text-muted-foreground">PNR/TKT/EMD + fatura + cartao + expense</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium">Cadeia de Custodia Certificada</p>
                        <p className="text-[10px] text-muted-foreground">SHA-256, Lei 13.964/2019</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                    <Button onClick={() => navigate("/subscription")} data-testid="button-blocked-subscribe">
                      Plataforma Completa — US$ 99/mes
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/login")} data-testid="button-blocked-login">
                      Ja tenho conta — Entrar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : !result ? (
            <div className="space-y-4">
              {trialStatus && (
                <Card className={remaining === 1 ? "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20" : ""}>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium" data-testid="text-trial-counter">
                        {remaining === 1
                          ? "Ultimo teste gratuito disponivel"
                          : `${remaining} de ${limit} testes restantes`}
                      </span>
                      <Badge variant={remaining === 1 ? "destructive" : "secondary"} className="text-[10px]">
                        {used}/{limit} usados
                      </Badge>
                    </div>
                    <Progress value={(used / limit) * 100} className="h-1.5" />
                    {remaining === 1 && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2">
                        Aproveite! Apos este teste, continue com a plataforma AuraTECH completa.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    1. Envie seus arquivos
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Ate 3 arquivos (CSV, XLSX, PDF, TXT, JSON, XML) — max 10 MB cada
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="dropzone-files"
                  >
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Clique para selecionar arquivos</p>
                    <p className="text-xs text-muted-foreground mt-1">ou arraste e solte aqui</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".csv,.xlsx,.xls,.pdf,.txt,.json,.xml"
                      onChange={handleFileSelect}
                      className="hidden"
                      data-testid="input-files"
                    />
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-2">
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium" data-testid={`text-filename-${i}`}>{f.name}</span>
                            <span className="text-xs text-muted-foreground">({formatFileSize(f.size)})</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(i)} data-testid={`button-remove-file-${i}`}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground">{files.length}/3 arquivos selecionados</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    2. Descreva sua intencao
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Explique o que voce quer analisar, conciliar ou verificar com esses arquivos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Ex: Quero conciliar os bilhetes aereos emitidos pela agencia com as faturas do cartao corporativo para identificar divergencias de valores e possiveis cobrancas duplicadas no periodo de outubro a dezembro de 2025..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="text-sm"
                    data-testid="input-description"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{description.length} caracteres</p>
                </CardContent>
              </Card>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2" data-testid="text-error">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleAnalyze}
                disabled={isAnalyzing || files.length === 0 || description.trim().length < 10}
                data-testid="button-analyze"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando com IA... aguarde
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Gerar Diagnostico Gratuito
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {result.trialStatus && (
                <Card className={result.trialStatus.remaining === 0 ? "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20" : ""}>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium" data-testid="text-trial-result-counter">
                        {result.trialStatus.remaining === 0
                          ? "Voce utilizou todos os seus testes gratuitos"
                          : result.trialStatus.remaining === 1
                            ? "Voce ainda tem 1 teste gratuito restante"
                            : `Voce ainda tem ${result.trialStatus.remaining} testes gratuitos restantes`}
                      </span>
                      <Badge variant={result.trialStatus.remaining === 0 ? "destructive" : "secondary"} className="text-[10px]">
                        {result.trialStatus.used}/{result.trialStatus.limit}
                      </Badge>
                    </div>
                    <Progress value={(result.trialStatus.used / result.trialStatus.limit) * 100} className="h-1.5" />
                  </CardContent>
                </Card>
              )}

              <Card className="border-primary/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      Relatorio de Diagnostico
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">Teste Gratuito</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none text-sm"
                    data-testid="text-report"
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(result.report) }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Cadeia de Custodia Digital
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Rastreabilidade completa conforme Lei 13.964/2019 (Pacote Anticrime)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-md p-3 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Envelope ID</p>
                      <p className="text-xs font-mono" data-testid="text-envelope-id">{result.envelope.envelopeId}</p>
                    </div>
                    <div className="bg-muted/50 rounded-md p-3 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Modelo IA</p>
                      <p className="text-xs font-mono">{result.envelope.processing.model}</p>
                    </div>
                    <div className="bg-muted/50 rounded-md p-3 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Inicio</p>
                      <p className="text-xs font-mono">{result.envelope.processing.startedAt}</p>
                    </div>
                    <div className="bg-muted/50 rounded-md p-3 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Conclusao</p>
                      <p className="text-xs font-mono">{result.envelope.processing.completedAt}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-xs font-medium">Arquivos analisados (SHA-256)</p>
                    {result.files.map((f, i) => (
                      <div key={i} className="bg-muted/50 rounded-md p-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3 h-3 text-primary" />
                          <span className="text-xs font-medium">{f.originalName}</span>
                          <Badge variant="outline" className="text-[10px]">{f.format.toUpperCase()}</Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Hash className="w-3 h-3 text-muted-foreground" />
                          <code className="text-[10px] text-muted-foreground font-mono break-all" data-testid={`text-file-hash-${i}`}>
                            {f.sha256}
                          </code>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="bg-muted/50 rounded-md p-2 space-y-1">
                      <p className="text-xs font-medium">Hash do Relatorio (SHA-256)</p>
                      <code className="text-[10px] text-muted-foreground font-mono break-all" data-testid="text-report-hash">
                        {result.envelope.output.reportHash}
                      </code>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded-md p-2 space-y-1">
                      <p className="text-xs font-medium text-primary">Envelope SHA-256</p>
                      <code className="text-[10px] font-mono break-all" data-testid="text-envelope-hash">
                        {result.envelope.envelopeSha256}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
                <CardContent className="pt-6 space-y-4">
                  <h3 className="text-sm font-semibold text-center">
                    {result.trialStatus?.remaining === 0
                      ? "Seus testes gratuitos acabaram — continue com o plano completo"
                      : "Quer ir alem do diagnostico?"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                      <Globe className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium">Integracao API em Tempo Real</p>
                        <p className="text-[10px] text-muted-foreground">Conecte OBT, Backoffice, GDS, BSP e cartoes corporativos</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <BarChart3 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium">Dashboard Interativo</p>
                        <p className="text-[10px] text-muted-foreground">KPIs, alertas, cronograma e controles em tempo real</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium">Conciliacao Multi-vias</p>
                        <p className="text-[10px] text-muted-foreground">PNR/TKT/EMD + fatura + cartao/VCN + expense — automatizado com IA</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium">Cadeia de Custodia Certificada</p>
                        <p className="text-[10px] text-muted-foreground">SHA-256, trilha imutavel, Lei 13.964/2019</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                    <Button onClick={() => navigate("/subscription")} data-testid="button-trial-subscribe">
                      AuraTECH Pass — US$ 99/mes
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/login")} data-testid="button-trial-login">
                      Acessar Plataforma
                    </Button>
                    {result.trialStatus && result.trialStatus.remaining > 0 && (
                      <Button variant="ghost" onClick={() => { setResult(null); setFiles([]); setDescription(""); }} data-testid="button-trial-new">
                        Novo Teste ({result.trialStatus.remaining} restante{result.trialStatus.remaining > 1 ? "s" : ""})
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex items-center justify-between text-xs text-muted-foreground pb-4" data-testid="section-footer">
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3" />
            <span>Cadeia de Custodia Digital - Lei 13.964/2019</span>
          </div>
          <span>AuraTECH — Trust Infrastructure Platform</span>
        </div>

      </div>
    </div>
  );
}

function formatMarkdown(text: string): string {
  return text
    .replace(/^### (.*$)/gm, '<h3 class="text-sm font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-base font-semibold mt-5 mb-2">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-lg font-bold mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gm, '<li class="ml-4 text-sm">$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 text-sm">$1. $2</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

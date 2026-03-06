import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Leaf, Shield, ShieldCheck, Target, Layers, TrendingUp,
  BarChart3, Award, Satellite, FileSearch, Globe, TreePine,
  AlertTriangle, CheckCircle2, ArrowRight, Zap,
  Eye, Lock, Database, ChevronRight
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

const VERIFICATION_PILLARS = [
  {
    id: "additionality",
    name: "Adicionalidade",
    tagline: "Additionality Verification",
    description: "Verificacao se o projeto de carbono so existe por causa do incentivo financeiro dos creditos. Analise de cenario baseline, barreiras economicas e teste de investimento.",
    icon: Target,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/50",
  },
  {
    id: "permanence",
    name: "Permanencia",
    tagline: "Permanence Assessment",
    description: "Avaliacao da durabilidade do sequestro de carbono. Analise de risco de reversao, buffer pool, compromissos de longo prazo e mecanismos de protecao do estoque.",
    icon: Lock,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/50",
  },
  {
    id: "leakage",
    name: "Vazamento (Leakage)",
    tagline: "Leakage Detection",
    description: "Deteccao de deslocamento de emissoes para fora da area do projeto. Monitoramento de areas adjacentes e analise de efeito cascata com dados satelitais.",
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/50",
  },
  {
    id: "mrv",
    name: "MRV",
    tagline: "Measurement, Reporting & Verification",
    description: "Validacao dos protocolos de medicao, relato e verificacao. Conformidade com metodologias aprovadas (VCS, Gold Standard, MDL/UNFCCC) e integridade dos dados reportados.",
    icon: FileSearch,
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-100 dark:bg-violet-900/50",
  },
  {
    id: "registry",
    name: "Registro e Rastreio",
    tagline: "Registry Integrity",
    description: "Verificacao cruzada com registros publicos (Verra/VCS, Gold Standard, UNFCCC CDM). Deteccao de dupla contagem, creditos aposentados e integridade de serial numbers.",
    icon: Database,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/50",
  },
  {
    id: "custody",
    name: "Cadeia de Custodia",
    tagline: "SHA-256 Chain of Custody",
    description: "Cada evidencia coletada recebe hash SHA-256 encadeado via AuraTRUST. Rastreabilidade juridica completa conforme Lei 13.964/2019 (Pacote Anticrime).",
    icon: ShieldCheck,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/50",
  },
];

const SATELLITE_SOURCES = [
  {
    id: "sentinel2",
    name: "Sentinel-2",
    provider: "ESA (Agencia Espacial Europeia)",
    type: "Optico multibanda",
    resolution: "10m",
    revisit: "5 dias",
    use: "Monitoramento de cobertura vegetal, NDVI, deteccao de desmatamento",
    status: "active" as const,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/50",
  },
  {
    id: "landsat",
    name: "Landsat 8/9",
    provider: "NASA / USGS",
    type: "Optico",
    resolution: "30m",
    revisit: "16 dias",
    use: "Analise historica de uso do solo (40+ anos de dados), baseline temporal",
    status: "active" as const,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/50",
  },
  {
    id: "sentinel1",
    name: "Sentinel-1",
    provider: "ESA",
    type: "Radar SAR",
    resolution: "10m",
    revisit: "6 dias",
    use: "Funciona com cobertura de nuvens, deteccao de mudancas em florestas tropicais",
    status: "active" as const,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/50",
  },
  {
    id: "firms",
    name: "FIRMS / VIIRS",
    provider: "NASA",
    type: "Infravermelho termico",
    resolution: "375m",
    revisit: "Tempo real",
    use: "Deteccao de focos de incendio ativos em tempo real na area do projeto",
    status: "active" as const,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/50",
  },
  {
    id: "planet",
    name: "Planet (PlanetScope)",
    provider: "Planet Labs",
    type: "Optico alta resolucao",
    resolution: "3-5m",
    revisit: "Diario",
    use: "Monitoramento diario de parcelas especificas, micro-desmatamento, queimadas",
    status: "planned" as const,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/50",
  },
  {
    id: "lidar",
    name: "LiDAR / GEDI",
    provider: "NASA (orbital)",
    type: "Laser orbital",
    resolution: "25m footprint",
    revisit: "Variavel",
    use: "Estimativa 3D de biomassa e estoque de carbono acima do solo",
    status: "planned" as const,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/50",
  },
];

const DATA_PLATFORMS = [
  { name: "Google Earth Engine", desc: "Processamento em nuvem de petabytes de dados satelitais", status: "planned" },
  { name: "MapBiomas", desc: "Mapeamento anual de uso do solo no Brasil (dados abertos)", status: "active" },
  { name: "PRODES / DETER (INPE)", desc: "Deteccao de desmatamento na Amazonia em tempo real", status: "active" },
  { name: "Verra / VCS Registry", desc: "Registro publico de creditos de carbono verificados", status: "active" },
  { name: "Gold Standard Registry", desc: "Registro de projetos com co-beneficios sociais e ambientais", status: "active" },
  { name: "UNFCCC CDM Registry", desc: "Mecanismo de Desenvolvimento Limpo das Nacoes Unidas", status: "active" },
];

const TRUST_INDEX_LEVELS = [
  { level: "AAA", label: "Credito Verificado", range: "95–100", color: "bg-emerald-500/15 border-emerald-500/30", textColor: "text-emerald-400", barColor: "bg-emerald-500" },
  { level: "AA", label: "Alta Confianca", range: "80–94", color: "bg-green-500/15 border-green-500/30", textColor: "text-green-400", barColor: "bg-green-500" },
  { level: "A", label: "Confianca Adequada", range: "65–79", color: "bg-blue-500/15 border-blue-500/30", textColor: "text-blue-400", barColor: "bg-blue-500" },
  { level: "B", label: "Em Revisao", range: "40–64", color: "bg-amber-500/15 border-amber-500/30", textColor: "text-amber-400", barColor: "bg-amber-500" },
  { level: "C", label: "Risco Elevado", range: "0–39", color: "bg-red-500/15 border-red-500/30", textColor: "text-red-400", barColor: "bg-red-500" },
];

const BENEFITS = [
  { icon: Shield, title: "Reducao de Risco", desc: "Identifica projetos fraudulentos ou com documentacao fragil antes de qualquer investimento ou transacao." },
  { icon: Zap, title: "Velocidade", desc: "Pre-analise automatizada em horas substitui semanas de due diligence manual tradicional." },
  { icon: Eye, title: "Protecao Reputacional", desc: "Evita associacao com creditos sem lastro real — protege contra acusacoes de greenwashing." },
  { icon: TrendingUp, title: "Precificacao Justa", desc: "Trust score AuraCARBO ajuda a precificar creditos com base na qualidade real e verificavel do projeto." },
  { icon: Globe, title: "Conformidade Regulatoria", desc: "Antecipa exigencias de mercados regulados: EU ETS, CORSIA, Artigo 6 do Acordo de Paris, SBCE." },
  { icon: Lock, title: "Rastreabilidade Juridica", desc: "Cadeia de custodia SHA-256 com conformidade Lei 13.964/2019 e preservacao de evidencias digitais." },
];

const chartProjectTypes = [
  { name: "REDD+", value: 35, fill: "#10b981" },
  { name: "ARR", value: 25, fill: "#3b82f6" },
  { name: "IFM", value: 15, fill: "#8b5cf6" },
  { name: "ALM", value: 12, fill: "#f59e0b" },
  { name: "Energia", value: 13, fill: "#06b6d4" },
];

const chartRiskTrend = [
  { month: "Jan", score: 72 },
  { month: "Fev", score: 75 },
  { month: "Mar", score: 78 },
  { month: "Abr", score: 74 },
  { month: "Mai", score: 82 },
  { month: "Jun", score: 85 },
  { month: "Jul", score: 88 },
  { month: "Ago", score: 86 },
  { month: "Set", score: 91 },
  { month: "Out", score: 89 },
  { month: "Nov", score: 93 },
  { month: "Dez", score: 95 },
];

const chartVerification = [
  { name: "Adicionalidade", score: 88 },
  { name: "Permanencia", score: 92 },
  { name: "Leakage", score: 85 },
  { name: "MRV", score: 90 },
  { name: "Registro", score: 95 },
  { name: "Custodia", score: 98 },
];

const chartMonthlyVolume = [
  { month: "Jul", creditos: 12400 },
  { month: "Ago", creditos: 18600 },
  { month: "Set", creditos: 15200 },
  { month: "Out", creditos: 22800 },
  { month: "Nov", creditos: 28400 },
  { month: "Dez", creditos: 35100 },
];

export default function AuraCarboHome() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/50">
              <Leaf className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">AuraCARBO</h1>
              <p className="text-[10px] text-muted-foreground">Carbon Project Validation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30 text-[10px]" data-testid="badge-ecosystem">
              AuraTECH Ecosystem
            </Badge>
            <Button variant="outline" size="sm" className="text-xs" data-testid="button-header-login">
              Entrar
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-8 max-w-[1400px] mx-auto">

        <Card className="border-green-200/50 dark:border-green-900/50 bg-gradient-to-r from-green-50/50 via-transparent to-transparent dark:from-green-950/20" data-testid="section-hero">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
              <h2 className="text-sm font-semibold">O que fazemos</h2>
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed max-w-4xl space-y-2">
              <p>
                Plataforma de <span className="font-medium text-foreground">pre-analise e validacao independente de projetos de credito de carbono</span>, com{" "}
                <span className="font-medium text-foreground">IAs Generativas supervisionadas por humanos</span> e{" "}
                <span className="font-medium text-foreground">dados geoespaciais de sensoriamento remoto</span>.
              </p>
              <p>
                Automatiza a verificacao de <span className="font-medium text-foreground">adicionalidade, permanencia, leakage e integridade de registro</span> antes de qualquer transacao — com{" "}
                <span className="font-medium text-foreground">cadeia de custodia SHA-256</span>,{" "}
                <span className="font-medium text-foreground">rastreabilidade juridica</span> e{" "}
                <span className="font-medium text-foreground">conformidade com Lei 13.964/2019</span>.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button variant="default" size="sm" className="text-xs bg-green-600 hover:bg-green-700" data-testid="button-hero-analyze">
                Analisar Projeto
              </Button>
              <Button variant="outline" size="sm" className="text-xs" data-testid="button-hero-plans">
                Conhecer Planos
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4" data-testid="section-verification-pillars">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-green-600 dark:text-green-400" />
            <h2 className="text-sm font-semibold">Pilares de Verificacao</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VERIFICATION_PILLARS.map((pillar) => (
              <Card key={pillar.id} className="hover:shadow-md transition-shadow" data-testid={`pillar-card-${pillar.id}`}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${pillar.bgColor}`}>
                      <pillar.icon className={`w-4 h-4 ${pillar.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold leading-tight">{pillar.name}</h3>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{pillar.tagline}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{pillar.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            <h2 className="text-sm font-semibold" data-testid="text-performance-title">Performance da Plataforma</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-emerald-200 dark:border-emerald-900">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mx-auto mb-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="stat-projects">+1.200</p>
                <p className="text-xs text-muted-foreground mt-1">Projetos Analisados</p>
                <p className="text-xs text-muted-foreground">em pre-validacao automatizada</p>
              </CardContent>
            </Card>
            <Card className="border-amber-200 dark:border-amber-900">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/50 mx-auto mb-2">
                  <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400" data-testid="stat-credits">+8,5 MI</p>
                <p className="text-xs text-muted-foreground mt-1">Creditos Verificados</p>
                <p className="text-xs text-muted-foreground">tCO2e em volume total</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200 dark:border-blue-900">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 mx-auto mb-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400" data-testid="stat-fraud-detected">23%</p>
                <p className="text-xs text-muted-foreground mt-1">Inconsistencias Detectadas</p>
                <p className="text-xs text-muted-foreground">em projetos pre-analisados</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" data-testid="banner-dashboard-preview">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.08),transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(34,197,94,0.06),transparent_50%)]" />
          <div className="relative p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-green-500/20">
                  <Leaf className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">Dashboard AuraCARBO</p>
                  <p className="text-[10px] text-slate-400">Validacao de projetos de credito de carbono</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-[10px]">Live</Badge>
                <Badge className="bg-slate-700/60 text-slate-300 border-slate-600/40 text-[10px]">Atualizado agora</Badge>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Projetos Ativos</p>
                <p className="text-lg font-bold text-slate-100 mt-0.5">847</p>
                <p className="text-[10px] text-green-400">+12% vs mes anterior</p>
              </div>
              <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">tCO2e Verificadas</p>
                <p className="text-lg font-bold text-slate-100 mt-0.5">2.4M</p>
                <p className="text-[10px] text-emerald-400">este trimestre</p>
              </div>
              <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Trust Score Medio</p>
                <p className="text-lg font-bold text-slate-100 mt-0.5">87.4</p>
                <p className="text-[10px] text-blue-400">nivel AA</p>
              </div>
              <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Alertas Ativos</p>
                <p className="text-lg font-bold text-slate-100 mt-0.5">14</p>
                <p className="text-[10px] text-amber-400">3 critical</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Tipos de Projeto</p>
                <div className="h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartProjectTypes} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={2} dataKey="value">
                        {chartProjectTypes.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "10px", color: "#e2e8f0" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                  {chartProjectTypes.map((t) => (
                    <span key={t.name} className="text-[9px] text-slate-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.fill }} />
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Trust Score (12 meses)</p>
                <div className="h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartRiskTrend}>
                      <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[60, 100]} tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={25} />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "10px", color: "#e2e8f0" }} />
                      <Area type="monotone" dataKey="score" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Pilares de Verificacao</p>
                <div className="h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={chartVerification} cx="50%" cy="50%" outerRadius={50}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 8, fill: "#94a3b8" }} />
                      <Radar dataKey="score" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Volume Mensal (tCO2e)</p>
                <div className="h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartMonthlyVolume}>
                      <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={30} />
                      <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "10px", color: "#e2e8f0" }} />
                      <Bar dataKey="creditos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4" data-testid="section-satellite-tech">
          <div className="flex items-center gap-2">
            <Satellite className="w-4 h-4 text-green-600 dark:text-green-400" />
            <h2 className="text-sm font-semibold">Tecnologia Satelital e Sensoriamento Remoto</h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-3xl">
            A AuraCARBO integra dados de multiplas fontes satelitais para verificacao geoespacial independente dos projetos de carbono — comparando o que esta documentado com o que realmente existe no terreno.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SATELLITE_SOURCES.map((sat) => (
              <Card key={sat.id} className="hover:shadow-md transition-shadow" data-testid={`satellite-card-${sat.id}`}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${sat.bgColor}`}>
                      <Satellite className={`w-4 h-4 ${sat.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-semibold leading-tight">{sat.name}</h3>
                        {sat.status === "active" && <Badge className="text-[8px] px-1 py-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0">Ativo</Badge>}
                        {sat.status === "planned" && <Badge className="text-[8px] px-1 py-0 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0">Roadmap</Badge>}
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{sat.provider} — {sat.type}</p>
                  <div className="flex gap-3 text-[10px]">
                    <span className="text-muted-foreground">Resolucao: <span className="font-medium text-foreground">{sat.resolution}</span></span>
                    <span className="text-muted-foreground">Revisita: <span className="font-medium text-foreground">{sat.revisit}</span></span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{sat.use}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4" data-testid="section-data-platforms">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-green-600 dark:text-green-400" />
            <h2 className="text-sm font-semibold">Plataformas de Dados Integradas</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DATA_PLATFORMS.map((plat) => (
              <div key={plat.name} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${plat.status === "active" ? "text-green-500" : "text-amber-500"}`} />
                <div>
                  <p className="text-xs font-semibold">{plat.name}</p>
                  <p className="text-[11px] text-muted-foreground">{plat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card className="border-green-200/50 dark:border-green-900/50" data-testid="section-trust-layer">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
              <h2 className="text-sm font-semibold">AuraTRUST — Camada de Certificacao</h2>
            </div>
            <p className="text-xs text-muted-foreground max-w-3xl">
              Cada evidencia coletada pela AuraCARBO — documental, satelital ou de registro publico — recebe hash SHA-256 encadeado via AuraTRUST. A cadeia de custodia garante integridade juridica e preservacao de provas conforme Lei 13.964/2019.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {["Coleta", "Hash SHA-256", "Validacao IA", "Verificacao Satelital", "Certificacao"].map((step, i) => (
                <span key={step} className="flex items-center gap-1">
                  <span className="px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-[10px] text-green-600 dark:text-green-400 font-medium">{step}</span>
                  {i < 4 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4" data-testid="section-trust-index">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
            <h2 className="text-sm font-semibold">AuraCARBO Trust Index™</h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-3xl">
            Score dinamico de confianca calculado a partir dos 6 pilares de verificacao, dados satelitais e integridade de registro. Cada credito de carbono recebe uma classificacao transparente.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {TRUST_INDEX_LEVELS.map((level) => (
              <Card key={level.level} className={`${level.color} border`} data-testid={`trust-level-${level.level}`}>
                <CardContent className="p-3 text-center space-y-1">
                  <p className={`text-xl font-bold ${level.textColor}`}>{level.level}</p>
                  <p className="text-[10px] text-slate-300 font-medium">{level.label}</p>
                  <div className={`h-1 rounded-full ${level.barColor} mx-auto`} style={{ width: `${parseInt(level.range.split("–")[1]) || 100}%` }} />
                  <p className="text-[9px] text-slate-400">{level.range} pts</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4" data-testid="section-benefits">
          <div className="flex items-center gap-2">
            <TreePine className="w-4 h-4 text-green-600 dark:text-green-400" />
            <h2 className="text-sm font-semibold">Beneficios da Pre-Analise</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((benefit) => (
              <Card key={benefit.title} className="hover:shadow-md transition-shadow" data-testid={`benefit-card-${benefit.title.toLowerCase().replace(/\s/g, "-")}`}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/50">
                      <benefit.icon className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xs font-semibold">{benefit.title}</h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{benefit.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" data-testid="section-market-application">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(34,197,94,0.08),transparent_50%)]" />
          <div className="relative p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-green-400" />
              <h2 className="text-sm font-semibold text-slate-100">Aplicacao de Mercado</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <TreePine className="w-4 h-4 text-green-400" />
                  <h3 className="text-xs font-semibold text-slate-200">Mercado Voluntario</h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">Projetos REDD+, ARR, IFM e ALM. Validacao pre-compra para investidores, fundos ESG e corporacoes com compromissos net-zero.</p>
                <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-[9px]">Ativo</Badge>
              </div>
              <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-semibold text-slate-200">Mercado Regulado</h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">Conformidade EU ETS, CORSIA (aviacao), Artigo 6 do Acordo de Paris. Pre-analise para submissao em registros regulados.</p>
                <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 text-[9px]">Roadmap</Badge>
              </div>
              <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-semibold text-slate-200">SBCE Brasil</h3>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">Sistema Brasileiro de Comercio de Emissoes. Preparacao para o mercado regulado brasileiro com validacao de projetos nacionais.</p>
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[9px]">Roadmap</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center py-6 space-y-3" data-testid="section-footer">
          <div className="flex items-center justify-center gap-2">
            <Leaf className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-sm font-semibold">Infraestrutura para Confianca Baseada em Evidencias</p>
          </div>
          <p className="text-xs text-muted-foreground max-w-xl mx-auto">
            AuraCARBO — validacao independente de projetos de credito de carbono com IA supervisionada, dados satelitais e cadeia de custodia juridica.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2 text-[10px] text-muted-foreground">
            <span>AuraTECH Ecosystem</span>
            <span>•</span>
            <span>SHA-256 Chain of Custody</span>
            <span>•</span>
            <span>Lei 13.964/2019</span>
          </div>
        </div>

      </div>
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AuraTechShell } from "@/components/auratech-shell";
import {
  Shield, ShieldCheck, Search, Database, Lock, Layers, Eye,
  AlertTriangle, Zap, BarChart3, Award, Globe, Leaf, Scale,
  Receipt, TrendingUp, Briefcase, Target, Satellite, TreePine,
  CheckCircle2, ArrowRight
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

const SPACING_TOKENS = [
  { name: "space-1", value: "4px", class: "p-1" },
  { name: "space-2", value: "8px", class: "p-2" },
  { name: "space-3", value: "12px", class: "p-3" },
  { name: "space-4", value: "16px", class: "p-4" },
  { name: "space-5", value: "20px", class: "p-5" },
  { name: "space-6", value: "24px", class: "p-6" },
  { name: "space-8", value: "32px", class: "p-8" },
  { name: "space-10", value: "40px", class: "p-10" },
  { name: "space-12", value: "48px", class: "p-12" },
  { name: "space-16", value: "64px", class: "p-16" },
];

const TYPOGRAPHY_SCALE = [
  { name: "Hero Title", size: "text-sm", weight: "font-semibold", tracking: "tracking-tight", example: "AuraTECH — Trust Infrastructure Platform" },
  { name: "Section Title", size: "text-sm", weight: "font-semibold", tracking: "", example: "Modulos do Ecossistema" },
  { name: "Card Title", size: "text-xs", weight: "font-semibold", tracking: "", example: "AuraAUDIT — Corporate Expense Review" },
  { name: "Tagline", size: "text-[10px]", weight: "font-normal", tracking: "", example: "Trust Infrastructure Platform" },
  { name: "Body", size: "text-[11px]", weight: "font-normal", tracking: "", example: "Analise forense de despesas corporativas de viagens e eventos." },
  { name: "Caption", size: "text-[10px]", weight: "font-normal", tracking: "uppercase tracking-wider", example: "EVIDENCIAS ATIVAS" },
  { name: "Micro", size: "text-[9px]", weight: "font-normal", tracking: "", example: "Atualizado agora" },
  { name: "Badge", size: "text-[8px]", weight: "font-medium", tracking: "", example: "Ativo" },
];

const COLOR_TOKENS = [
  { name: "Primary", desc: "Acoes principais, CTAs, links", light: "bg-primary", dark: "bg-primary", text: "text-primary" },
  { name: "Emerald", desc: "AuraTRUST, sucesso, verificado", light: "bg-emerald-500", dark: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  { name: "Green", desc: "AuraCARBO, sustentabilidade", light: "bg-green-500", dark: "bg-green-500", text: "text-green-600 dark:text-green-400" },
  { name: "Blue", desc: "AuraDATA, informacao, neutral trust", light: "bg-blue-500", dark: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
  { name: "Amber", desc: "AuraAUDIT, atencao, warnings", light: "bg-amber-500", dark: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  { name: "Violet", desc: "AuraDUE, investigacao", light: "bg-violet-500", dark: "bg-violet-500", text: "text-violet-600 dark:text-violet-400" },
  { name: "Red", desc: "AuraRISK, alertas criticos", light: "bg-red-500", dark: "bg-red-500", text: "text-red-600 dark:text-red-400" },
  { name: "Indigo", desc: "AuraLOA, juridico", light: "bg-indigo-500", dark: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400" },
  { name: "Orange", desc: "AuraTAX, fiscal", light: "bg-orange-500", dark: "bg-orange-500", text: "text-orange-600 dark:text-orange-400" },
  { name: "Cyan", desc: "AuraMARKET, marketplace", light: "bg-cyan-500", dark: "bg-cyan-500", text: "text-cyan-600 dark:text-cyan-400" },
  { name: "Teal", desc: "AuraBID, procurement", light: "bg-teal-500", dark: "bg-teal-500", text: "text-teal-600 dark:text-teal-400" },
  { name: "Rose", desc: "AuraLEGAL, compliance", light: "bg-rose-500", dark: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
  { name: "Sky", desc: "AuraTRACK, timeline", light: "bg-sky-500", dark: "bg-sky-500", text: "text-sky-600 dark:text-sky-400" },
];

const MODULE_REGISTRY = [
  { id: "trust", name: "AuraTRUST", tagline: "Evidence Tracking Infrastructure", icon: ShieldCheck, color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-100 dark:bg-emerald-900/50", tier: "core" },
  { id: "data", name: "AuraDATA", tagline: "Data Governance Hub", icon: Database, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/50", tier: "core" },
  { id: "audit", name: "AuraAUDIT", tagline: "Corporate Expense Review", icon: Receipt, color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-900/50", tier: "module" },
  { id: "due", name: "AuraDUE", tagline: "Digital Due Diligence", icon: Search, color: "text-violet-600 dark:text-violet-400", bgColor: "bg-violet-100 dark:bg-violet-900/50", tier: "module" },
  { id: "risk", name: "AuraRISK", tagline: "Compliance Score Analysis", icon: AlertTriangle, color: "text-red-600 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/50", tier: "module" },
  { id: "carbo", name: "AuraCARBO", tagline: "Carbon Project Validation", icon: Leaf, color: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/50", tier: "module" },
  { id: "loa", name: "AuraLOA", tagline: "Precatory Research Validation", icon: Scale, color: "text-indigo-600 dark:text-indigo-400", bgColor: "bg-indigo-100 dark:bg-indigo-900/50", tier: "module" },
  { id: "tax", name: "AuraTAX", tagline: "Tax Credit Recovery", icon: Receipt, color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-100 dark:bg-orange-900/50", tier: "module" },
  { id: "market", name: "AuraMARKET", tagline: "Verified Asset Exchange", icon: TrendingUp, color: "text-cyan-600 dark:text-cyan-400", bgColor: "bg-cyan-100 dark:bg-cyan-900/50", tier: "module" },
  { id: "track", name: "AuraTRACK", tagline: "Audit Timeline Engine", icon: Eye, color: "text-sky-600 dark:text-sky-400", bgColor: "bg-sky-100 dark:bg-sky-900/50", tier: "module" },
  { id: "legal", name: "AuraLEGAL", tagline: "Legal & Regulatory Compliance", icon: Scale, color: "text-rose-600 dark:text-rose-400", bgColor: "bg-rose-100 dark:bg-rose-900/50", tier: "module" },
  { id: "bid", name: "AuraBID", tagline: "Procurement & RFP Analysis", icon: Briefcase, color: "text-teal-600 dark:text-teal-400", bgColor: "bg-teal-100 dark:bg-teal-900/50", tier: "module" },
];

const sampleChartData = [
  { month: "Jul", value: 72 },
  { month: "Ago", value: 78 },
  { month: "Set", value: 82 },
  { month: "Out", value: 85 },
  { month: "Nov", value: 88 },
  { month: "Dez", value: 92 },
];

const samplePieData = [
  { name: "Verificado", value: 65, fill: "#10b981" },
  { name: "Em analise", value: 25, fill: "#3b82f6" },
  { name: "Pendente", value: 10, fill: "#f59e0b" },
];

const sampleRadarData = [
  { name: "Integridade", score: 95 },
  { name: "Custodia", score: 92 },
  { name: "Rastreio", score: 88 },
  { name: "Validacao", score: 90 },
  { name: "Certificacao", score: 94 },
];

export default function DesignSystemPage() {
  return (
    <AuraTechShell
      onLogoClick={() => window.location.href = "/teste-agora"}
      onLoginClick={() => window.location.href = "/login"}
    >
      <div className="space-y-2 pb-2">
        <h1 className="text-lg font-bold tracking-tight" data-testid="ds-title">AuraTECH Design System</h1>
        <p className="text-xs text-muted-foreground max-w-2xl">
          Referencia visual padronizada para todos os modulos do ecossistema AuraTECH. Shell institucional unico com topbar, container central e footer obrigatorios. Estetica enterprise minimalista com foco em confianca, rastreabilidade e clareza executiva.
        </p>
      </div>

      <Separator />

      <section className="space-y-4" data-testid="ds-section-shell">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">1. Shell Global</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="text-xs font-semibold">Topbar</h3>
              <ul className="text-[11px] text-muted-foreground space-y-1">
                <li>• Sticky top, z-50, backdrop-blur</li>
                <li>• Logo AuraTECH 36x36 rounded-md bg-primary</li>
                <li>• Modulo nome opcional (breadcrumb "/")</li>
                <li>• Badge "AuraTECH Ecosystem" (hidden sm:inline)</li>
                <li>• Botao "Acessar Plataforma" (size sm)</li>
                <li>• Altura: py-3 (48px total)</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="text-xs font-semibold">Container Central</h3>
              <ul className="text-[11px] text-muted-foreground space-y-1">
                <li>• max-w-[1400px] mx-auto</li>
                <li>• Padding: p-6 (24px)</li>
                <li>• Gap entre secoes: space-y-8 (32px)</li>
                <li>• flex-1 para ocupar altura disponivel</li>
                <li>• Background: bg-background</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 space-y-2">
              <h3 className="text-xs font-semibold">Footer</h3>
              <ul className="text-[11px] text-muted-foreground space-y-1">
                <li>• Border-t, bg-background</li>
                <li>• Logo AuraTECH 32x32</li>
                <li>• Badges: SHA-256 + Lei 13.964/2019</li>
                <li>• Copyright dinamico (ano atual)</li>
                <li>• Links: Termos, Privacidade, LGPD</li>
                <li>• Padding: px-6 py-6</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        <Card className="border-amber-200 dark:border-amber-900">
          <CardContent className="p-4">
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              Regra: Topbar e Footer sao componentes globais obrigatorios e nao podem variar por modulo, salvo contexto autenticado da area logada.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="space-y-4" data-testid="ds-section-grid">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">2. Grid System</h2>
        </div>
        <p className="text-[11px] text-muted-foreground">Grid responsivo baseado em Tailwind CSS com breakpoints padronizados.</p>
        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">4 colunas (lg) — Modulos / Cards</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-16 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-primary">Col {n}/4</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">3 colunas (md) — KPIs / Stats</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-16 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Col {n}/3</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">2 colunas (sm) — Content pairs</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-16 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">Col {n}/2</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Dashboard banner — 4 colunas (dark slate)</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Metrica {n}</p>
                  <p className="text-lg font-bold text-slate-100 mt-0.5">0,000</p>
                  <p className="text-[10px] text-emerald-400">+0% vs anterior</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-4" data-testid="ds-section-typography">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">3. Tipografia</h2>
        </div>
        <p className="text-[11px] text-muted-foreground">Familia: system-ui (Inter quando disponivel). Hierarquia fixa em todos os modulos.</p>
        <div className="space-y-2">
          {TYPOGRAPHY_SCALE.map((t) => (
            <div key={t.name} className="flex items-center gap-4 p-3 rounded-lg border">
              <div className="w-28 shrink-0">
                <p className="text-[10px] font-medium text-primary">{t.name}</p>
                <p className="text-[9px] text-muted-foreground">{t.size} {t.weight}</p>
              </div>
              <div className="flex-1">
                <p className={`${t.size} ${t.weight} ${t.tracking} text-foreground`}>{t.example}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-4" data-testid="ds-section-spacing">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">4. Tokens de Espacamento</h2>
        </div>
        <p className="text-[11px] text-muted-foreground">Base 4px. Uso padronizado em todos os modulos.</p>
        <div className="flex flex-wrap gap-3">
          {SPACING_TOKENS.map((token) => (
            <div key={token.name} className="flex items-end gap-2">
              <div className={`${token.class} bg-primary/20 border border-primary/30 rounded`}>
                <div className="w-2 h-2 bg-primary rounded-sm" />
              </div>
              <div>
                <p className="text-[10px] font-medium">{token.name}</p>
                <p className="text-[9px] text-muted-foreground">{token.value}</p>
              </div>
            </div>
          ))}
        </div>
        <Card className="border-primary/20">
          <CardContent className="p-4 space-y-2">
            <h3 className="text-xs font-semibold">Uso Padronizado</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground">
              <div>• Card padding: <span className="font-medium text-foreground">p-3</span> (12px) — cards de modulo</div>
              <div>• Card padding: <span className="font-medium text-foreground">p-4</span> (16px) — cards de conteudo</div>
              <div>• Card padding: <span className="font-medium text-foreground">p-5</span> (20px) — banner dark</div>
              <div>• Card padding: <span className="font-medium text-foreground">p-6</span> (24px) — hero / destaque</div>
              <div>• Section gap: <span className="font-medium text-foreground">space-y-8</span> (32px)</div>
              <div>• Internal gap: <span className="font-medium text-foreground">space-y-2</span> (8px) a <span className="font-medium text-foreground">space-y-4</span> (16px)</div>
              <div>• Grid gap: <span className="font-medium text-foreground">gap-4</span> (16px) padrao</div>
              <div>• Grid gap: <span className="font-medium text-foreground">gap-2</span> (8px) a <span className="font-medium text-foreground">gap-3</span> (12px) — dashboard</div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="space-y-4" data-testid="ds-section-colors">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">5. Paleta de Cores por Modulo</h2>
        </div>
        <p className="text-[11px] text-muted-foreground">Cada modulo tem cor primaria fixa. Uso: icones, badges, bordas, backgrounds sutis.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {COLOR_TOKENS.map((c) => (
            <div key={c.name} className="flex items-center gap-3 p-3 rounded-lg border">
              <div className={`w-8 h-8 rounded-lg ${c.light}`} />
              <div>
                <p className="text-xs font-semibold">{c.name}</p>
                <p className="text-[10px] text-muted-foreground">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-4" data-testid="ds-section-components">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">6. Componentes Padrao</h2>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold">6.1 Hero Card ("O que fazemos")</h3>
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold">O que fazemos</h2>
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed max-w-4xl space-y-2">
                <p>
                  Descricao do modulo com <span className="font-medium text-foreground">termos-chave destacados</span> usando font-medium text-foreground. Cada modulo descreve sua proposta de valor em 2-3 linhas com <span className="font-medium text-foreground">IAs supervisionadas por humanos</span>.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                <Button variant="default" size="sm" className="text-xs">Acao Principal</Button>
                <Button variant="outline" size="sm" className="text-xs">Acao Secundaria</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold">6.2 Module Card</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MODULE_REGISTRY.slice(0, 4).map((mod) => (
              <Card key={mod.id} className={`hover:shadow-md transition-shadow ${mod.tier === "core" ? "ring-1 ring-primary/20" : ""}`}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${mod.bgColor}`}>
                      <mod.icon className={`w-4 h-4 ${mod.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-semibold leading-tight">{mod.name}</h3>
                        {mod.tier === "core" && <Badge className="text-[8px] px-1 py-0 bg-primary/10 text-primary border-0">Core</Badge>}
                        <Badge className="text-[8px] px-1 py-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0">Ativo</Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{mod.tagline}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold">6.3 KPI Cards (3 colunas)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-emerald-200 dark:border-emerald-900">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mx-auto mb-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">+0,000</p>
                <p className="text-xs text-muted-foreground mt-1">Metrica Principal</p>
                <p className="text-xs text-muted-foreground">descricao complementar</p>
              </CardContent>
            </Card>
            <Card className="border-amber-200 dark:border-amber-900">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/50 mx-auto mb-2">
                  <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">+0,000</p>
                <p className="text-xs text-muted-foreground mt-1">Metrica Secundaria</p>
                <p className="text-xs text-muted-foreground">descricao complementar</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200 dark:border-blue-900">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 mx-auto mb-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">00%</p>
                <p className="text-xs text-muted-foreground mt-1">Trust Score</p>
                <p className="text-xs text-muted-foreground">Aura Trust Index™</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold">6.4 Dashboard Banner (Dark Slate)</h3>
          <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.08),transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(59,130,246,0.06),transparent_50%)]" />
            <div className="relative p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-7 h-7 rounded-md bg-emerald-500/20">
                    <Shield className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-100">Dashboard [Modulo]</p>
                    <p className="text-[10px] text-slate-400">Descricao do dashboard</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">Live</Badge>
                  <Badge className="bg-slate-700/60 text-slate-300 border-slate-600/40 text-[10px]">Atualizado agora</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Recharts Area</p>
                  <div className="h-[80px] mt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sampleChartData}>
                        <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Recharts Bar</p>
                  <div className="h-[80px] mt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sampleChartData}>
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Recharts Pie</p>
                  <div className="h-[80px] mt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={samplePieData} cx="50%" cy="50%" innerRadius={18} outerRadius={32} paddingAngle={2} dataKey="value">
                          {samplePieData.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-800/60 border border-slate-700/40 p-3">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Recharts Radar</p>
                  <div className="h-[80px] mt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={sampleRadarData} cx="50%" cy="50%" outerRadius={30}>
                        <PolarGrid stroke="#334155" />
                        <Radar dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold">6.5 Trust Chain (Cadeia de Custodia)</h3>
          <Card className="border-emerald-200/50 dark:border-emerald-900/50">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                {["Coleta", "Hash SHA-256", "Validacao IA", "Certificacao", "Monitoramento"].map((step, i) => (
                  <span key={step} className="flex items-center gap-1">
                    <span className="px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">{step}</span>
                    {i < 4 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold">6.6 Trust Index (5 niveis)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              { level: "AAA", label: "Maximo", color: "bg-emerald-500/15 border-emerald-500/30", textColor: "text-emerald-400", barColor: "bg-emerald-500" },
              { level: "AA", label: "Alto", color: "bg-green-500/15 border-green-500/30", textColor: "text-green-400", barColor: "bg-green-500" },
              { level: "A", label: "Adequado", color: "bg-blue-500/15 border-blue-500/30", textColor: "text-blue-400", barColor: "bg-blue-500" },
              { level: "B", label: "Em Revisao", color: "bg-amber-500/15 border-amber-500/30", textColor: "text-amber-400", barColor: "bg-amber-500" },
              { level: "C", label: "Insuficiente", color: "bg-red-500/15 border-red-500/30", textColor: "text-red-400", barColor: "bg-red-500" },
            ].map((l) => (
              <Card key={l.level} className={`${l.color} border`}>
                <CardContent className="p-3 text-center space-y-1">
                  <p className={`text-xl font-bold ${l.textColor}`}>{l.level}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{l.label}</p>
                  <div className={`h-1 rounded-full ${l.barColor} mx-auto w-3/4`} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold">6.7 Badges & Status</h3>
          <div className="flex flex-wrap gap-2">
            <Badge className="text-[8px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0">Ativo</Badge>
            <Badge className="text-[8px] px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-0">Roadmap</Badge>
            <Badge className="text-[8px] px-1.5 py-0.5 bg-primary/10 text-primary border-0">Core</Badge>
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">Live</Badge>
            <Badge className="bg-slate-700/60 text-slate-300 border-slate-600/40 text-[10px]">Atualizado agora</Badge>
            <Badge className="text-[8px] px-1.5 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-0">Critical</Badge>
            <Badge className="text-[8px] px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-0">Info</Badge>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold">6.8 Buttons</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="default" size="sm" className="text-xs">Primary (sm)</Button>
            <Button variant="outline" size="sm" className="text-xs">Outline (sm)</Button>
            <Button variant="default" size="sm" className="text-xs bg-green-600 hover:bg-green-700">Modulo CTA</Button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 opacity-50 cursor-not-allowed">Desabilitado</span>
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-4" data-testid="ds-section-modules">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">7. Registro de Modulos</h2>
        </div>
        <p className="text-[11px] text-muted-foreground">Todos os modulos do ecossistema com cores, icones e hierarquia (Core vs Module).</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MODULE_REGISTRY.map((mod) => (
            <div key={mod.id} className={`flex items-center gap-3 p-3 rounded-lg border ${mod.tier === "core" ? "ring-1 ring-primary/20 bg-primary/5" : ""}`}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${mod.bgColor}`}>
                <mod.icon className={`w-4 h-4 ${mod.color}`} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-semibold truncate">{mod.name}</p>
                  {mod.tier === "core" && <Badge className="text-[7px] px-1 py-0 bg-primary/10 text-primary border-0">Core</Badge>}
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{mod.tagline}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-4" data-testid="ds-section-rules">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">8. Regras Globais</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-emerald-200 dark:border-emerald-900">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Obrigatorio</h3>
              </div>
              <ul className="text-[11px] text-muted-foreground space-y-1">
                <li>• Shell global (Topbar + Container + Footer) em toda pagina publica</li>
                <li>• max-w-[1400px] mx-auto em todos os containers</li>
                <li>• Mesma paleta de cores por modulo (sem variacoes)</li>
                <li>• Tipografia padronizada (text-sm para titulos, text-xs para cards)</li>
                <li>• Badges SHA-256 e Lei 13.964/2019 no footer</li>
                <li>• AuraTRUST e AuraDATA com destaque "Core"</li>
                <li>• data-testid em todos os elementos interativos</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="border-red-200 dark:border-red-900">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="text-xs font-semibold text-red-600 dark:text-red-400">Proibido</h3>
              </div>
              <ul className="text-[11px] text-muted-foreground space-y-1">
                <li>• Criar micro-sites com identidade visual propria</li>
                <li>• Alterar Topbar ou Footer por modulo (exceto area logada)</li>
                <li>• Usar fontes ou tamanhos fora da escala definida</li>
                <li>• Criar layouts com largura diferente de 1400px</li>
                <li>• Omitir badges de compliance no footer</li>
                <li>• Usar cores de modulo diferente do registro</li>
                <li>• Dashboard banners sem o padrao slate-950</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

    </AuraTechShell>
  );
}

# AuraAUDIT — Dashboard: Design System Completo
**Versão:** 1.0 | **Data:** 24/03/2026 | **Escopo:** Dashboard Admin + Dashboard Cliente

---

## 1. TIPOGRAFIA

### Família de Fonte
```
font-sans: Open Sans, sans-serif   ← fonte principal (definida no CSS)
font-serif: Georgia, serif
font-mono: Menlo, monospace        ← usado em badges de código, SHA-256, etc.
antialiased: sempre aplicado no <body>
```

### Hierarquia tipográfica (escala fixa — usar em todos os módulos)

| Nível | Classe Tailwind | Peso | Exemplo de uso |
|---|---|---|---|
| Hero Title | `text-sm font-semibold tracking-tight` | semibold | Título principal de seção |
| Section Title | `text-sm font-semibold` | semibold | Títulos de módulos |
| Card Title | `text-xs font-semibold` | semibold | `<CardTitle>` |
| Tagline | `text-[10px] font-normal` | normal | Subtítulo de logo |
| Body | `text-[11px] font-normal` | normal | Parágrafos descritivos |
| Caption | `text-[10px] uppercase tracking-wider` | normal | Labels de métricas |
| Micro | `text-[9px] font-normal` | normal | "Atualizado agora" |
| Badge | `text-[8px] font-medium` | medium | Badges pequeníssimos |
| Dashboard H1 | `text-2xl font-bold tracking-tight` | bold | Título da página do dashboard |
| Dashboard H2 | `text-xl font-bold` | bold | Subseções maiores |
| Stat value grande | `text-3xl font-bold` | bold | KPIs de destaque (16%, +2,8 BI) |
| Stat value médio | `text-2xl font-bold` | bold | `<StatCard>` principal |
| Stat value pequeno | `text-xl font-bold` | bold | Cards secundários |
| Descrição muted | `text-sm text-muted-foreground` | normal | Subtítulo abaixo do H1 |
| Lista / item | `text-xs` | normal | Itens de lista, scope items |
| Detalhe de fase | `text-[11px] text-muted-foreground` | normal | Descrição das fases do projeto |
| Detalhe micro | `text-[10px]` | normal | Texto complementar mínimo |

---

## 2. PALETA DE CORES

### Cores da interface (CSS variables — Light Mode)

```css
:root {
  --background:       210 20% 98%;    /* Quase branco azulado */
  --foreground:       210 20% 12%;    /* Quase preto azulado */
  --border:           210 15% 88%;    /* Borda sutil */
  --card:             210 20% 96%;    /* Fundo de card */
  --card-foreground:  210 20% 12%;
  --muted:            210 16% 90%;    /* Fundo muted (bg-muted) */
  --muted-foreground: 210 16% 28%;    /* Texto muted */
  --primary:          210 85% 42%;    /* Azul AuraTECH */
  --primary-foreground: 210 20% 98%;  /* Texto sobre primary */
  --secondary:        210 18% 86%;
  --destructive:      0 72% 38%;      /* Vermelho de alerta */
  --ring:             210 85% 42%;
  /* Charts */
  --chart-1: 210 85% 42%;  --chart-2: 195 75% 38%;
  --chart-3: 225 70% 35%;  --chart-4: 180 65% 32%;
  --chart-5: 240 60% 38%;
  --radius: .5rem;                    /* border-radius padrão */
  --font-sans: Open Sans, sans-serif;
}
```

### Cores da interface (Dark Mode)

```css
.dark {
  --background:       210 18% 8%;     /* Fundo escuro azulado */
  --foreground:       210 18% 92%;
  --border:           210 15% 18%;
  --card:             210 18% 10%;
  --muted:            210 14% 16%;
  --muted-foreground: 210 14% 72%;
  --primary:          210 85% 45%;    /* Azul levemente mais claro no dark */
  --destructive:      0 72% 42%;
  /* Charts — mais claros no dark */
  --chart-1: 210 85% 65%;  --chart-2: 195 75% 68%;
  --chart-3: 225 70% 72%;  --chart-4: 180 65% 75%;
  --chart-5: 240 60% 70%;
}
```

### Cores por Módulo (invariantes — não mudam entre light/dark)

| Módulo | Cor primária | Tailwind (ícone) | Tailwind (fundo) | Tailwind (borda) |
|---|---|---|---|---|
| **AuraTECH** | Azul | `text-primary` | `bg-primary/10` | `border-primary/20` |
| **AuraAUDIT** | Âmbar | `text-amber-600 dark:text-amber-400` | `bg-amber-100 dark:bg-amber-900/50` | `border-amber-200 dark:border-amber-900` |
| **AuraTRUST** | Emerald | `text-emerald-600 dark:text-emerald-400` | `bg-emerald-100 dark:bg-emerald-900/50` | `border-emerald-200 dark:border-emerald-900` |
| **AuraDUE** | Violet | `text-violet-600 dark:text-violet-400` | `bg-violet-100 dark:bg-violet-900/50` | — |
| **AuraCARBO** | Green | `text-green-600 dark:text-green-400` | `bg-green-100 dark:bg-green-900/50` | — |
| **AuraLOA** | Indigo | `text-indigo-600 dark:text-indigo-400` | `bg-indigo-100 dark:bg-indigo-900/50` | — |
| **AuraRISK** | Red | `text-red-600 dark:text-red-400` | `bg-red-100 dark:bg-red-900/50` | — |
| **AuraMARKET** | Cyan | `text-cyan-600 dark:text-cyan-400` | `bg-cyan-100 dark:bg-cyan-900/50` | — |
| **AuraTRACK** | Sky | `text-sky-600 dark:text-sky-400` | `bg-sky-100 dark:bg-sky-900/50` | — |

### Cores semânticas no dashboard

| Semântica | Light | Dark | Uso |
|---|---|---|---|
| Sucesso / Concluído | `text-emerald-600` | `text-emerald-400` | Fases completadas, savings |
| Atenção / Em andamento | `text-amber-600` | `text-amber-400` | Status pendente, avisos |
| Crítico / Erro | `text-red-600` | `text-red-400` | Alertas, bloqueios, anomalias críticas |
| Info / Neutro | `text-blue-600` | `text-blue-400` | Informações de performance |
| Bloqueado | `text-muted-foreground opacity-50` | idem | Fases bloqueadas |

### Cores específicas dos gráficos

```typescript
// Gráfico de barras e pizza
const CHART_COLORS = [
  "hsl(210, 85%, 42%)",   // primary blue
  "hsl(195, 75%, 38%)",   // teal blue
  "hsl(225, 70%, 35%)",   // indigo
  "hsl(180, 65%, 32%)",   // cyan dark
  "hsl(240, 60%, 38%)",   // violet
];

// Barras de inconsistência
const INCONSISTENCY_COLORS = {
  "Fraude":              "bg-red-500",
  "Retencoes":           "bg-blue-500",
  "Reembolso":           "bg-emerald-500",
  "Cobranca Fee":        "bg-amber-500",
  "Acordos Corporativos": "bg-violet-500",
};
```

---

## 3. LAYOUT E GRID

### Container padrão do dashboard

```tsx
<div className="p-6 space-y-6 max-w-[1400px] mx-auto">
  {/* conteúdo aqui */}
</div>
```

| Propriedade | Valor | Descrição |
|---|---|---|
| Max width | `max-w-[1400px]` | 1400px |
| Padding | `p-6` | 24px em todos os lados |
| Gap entre seções | `space-y-6` | 24px (dashboard usa 6, páginas públicas usam 8) |
| Background | `bg-background` | via CSS variable |

### Grids usados no dashboard

```
grid-cols-1 md:grid-cols-3              → KPI destaque (3 cols)
grid-cols-2 md:grid-cols-3 lg:grid-cols-5 → StatCards (5 cols)
grid-cols-1 lg:grid-cols-3              → Gráfico largo (2/3) + card lateral (1/3)
grid-cols-1 lg:grid-cols-2             → Pares de cards
grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 → Fases do projeto
grid-cols-2 md:grid-cols-4              → Mini stat cards (bloqueados)
grid-cols-2 lg:grid-cols-4             → Steps de processo
```

### Gaps

```
gap-4    → padrão entre cards (16px)
gap-3    → cards compactos de dashboard (12px)
gap-2    → itens internos de lista (8px)
gap-6    → gap entre seções maiores (24px)
```

---

## 4. COMPONENTES DO DASHBOARD ADMIN (`dashboard.tsx`)

### Header da Página

```tsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-bold tracking-tight">Dashboard de Auditoria</h1>
    <p className="text-sm text-muted-foreground mt-1">AuraAUDIT — Due Diligence Platform</p>
  </div>
  <Badge variant="outline" className="text-xs gap-1">
    <Shield className="w-3 h-3" />
    Lei 13.964/2019
  </Badge>
</div>
```

### KPI Cards de Destaque (3 colunas coloridas)

```tsx
// Padrão: border colorida + gradient sutil + ícone em círculo
<Card className="border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/30 dark:to-transparent">
  <CardContent className="p-5 text-center">
    <div className="flex items-center justify-center w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/50 mx-auto mb-2">
      <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
    </div>
    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">16%</p>
    <p className="text-sm font-medium mt-1">Media de Resultado</p>
    <p className="text-xs text-muted-foreground">sobre o volume revisado</p>
  </CardContent>
</Card>
```

### StatCard (genérico reutilizável)

```tsx
// Título uppercase + valor grande + trend + ícone quadrado
<Card>
  <CardContent className="p-5">
    <div className="flex items-start justify-between gap-2">
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <div className="flex items-center gap-1.5">
          {trend && (
            <span className={`flex items-center text-xs font-medium ${
              trend === "down" ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
            }`}>
              {trend === "down" ? <ArrowDownRight /> : <ArrowUpRight />}
              {trendValue}
            </span>
          )}
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        </div>
      </div>
      <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
        <Icon className="w-5 h-5 text-primary" />
      </div>
    </div>
  </CardContent>
</Card>
```

### Gráfico de Barras (Recharts)

```tsx
<ResponsiveContainer width="100%" height={250}>
  <BarChart data={categoryData} margin={{ bottom: 20 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
    <XAxis
      dataKey="name"
      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
      axisLine={{ stroke: "hsl(var(--border))" }}
      interval={0}
      angle={-25}
      textAnchor="end"
    />
    <YAxis
      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
      axisLine={{ stroke: "hsl(var(--border))" }}
      tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
    />
    <Tooltip
      contentStyle={{
        backgroundColor: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "6px",
        fontSize: "12px",
      }}
    />
    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

### Gráfico de Pizza (Recharts)

```tsx
<ResponsiveContainer width="100%" height={180}>
  <RechartsPie>
    <Pie
      data={data}
      cx="50%"
      cy="50%"
      innerRadius={45}     /* donut */
      outerRadius={72}
      paddingAngle={4}
      dataKey="value"
    >
      {data.map((_, index) => (
        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
      ))}
    </Pie>
    <Tooltip contentStyle={{
      backgroundColor: "hsl(var(--card))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "6px",
      fontSize: "12px",
    }} />
  </RechartsPie>
</ResponsiveContainer>
```

### Progress Bars de Inconsistência

```tsx
// Barra de progresso com label e percentual
<div className="space-y-1">
  <div className="flex items-center justify-between text-xs">
    <span className="text-muted-foreground">{name}</span>
    <span className="font-semibold">{percentage}%</span>
  </div>
  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
    <div
      className={`h-full rounded-full ${color} transition-all duration-500`}
      style={{ width: `${percentage}%` }}
    />
  </div>
</div>
```

### Card de Item Sinalizado (despesas/anomalias)

```tsx
<div className="flex items-center justify-between gap-3 p-3 rounded-md bg-background">
  <div className="flex items-center gap-3 min-w-0">
    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-destructive/10 shrink-0">
      <ShieldAlert className="w-4 h-4 text-destructive" />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-medium truncate">{title}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  </div>
  <div className="text-right shrink-0">
    <p className="text-sm font-semibold">{value}</p>
    <Badge variant="destructive" className="text-[10px]">Critico</Badge>
  </div>
</div>
```

### Steps de Processo (linha do tempo)

```tsx
<div className="relative">
  {/* Linha conectora */}
  <div className="absolute top-6 left-[calc(12.5%+16px)] right-[calc(12.5%+16px)] h-0.5 bg-primary/20 hidden lg:block" />
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {steps.map((step) => (
      <div className="relative flex flex-col items-center text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/30 mb-3 relative z-10 bg-card">
          <step.icon className="w-5 h-5 text-primary" />
        </div>
        <Badge variant="secondary" className="text-[10px] font-mono mb-1.5">{step.time}</Badge>
        <p className="text-sm font-semibold leading-tight">{step.title}</p>
        <p className="text-[11px] text-muted-foreground mt-1">{step.description}</p>
      </div>
    ))}
  </div>
</div>
```

---

## 5. COMPONENTES DO DASHBOARD CLIENTE (`client-dashboard.tsx`)

### Banner de Status (variantes: blocking / warning / info)

```tsx
// BLOCKING — contrato não assinado
<Card className="border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
  <CardContent className="p-4">
    <div className="flex items-start gap-3">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/40 shrink-0 mt-0.5">
        <PenTool className="w-5 h-5 text-red-600 dark:text-red-400" />
      </div>
      <div className="space-y-2 flex-1">
        <p className="text-sm font-semibold text-red-800 dark:text-red-300">Contrato pendente</p>
        <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">Descrição...</p>
        <Button size="sm" variant="destructive" className="text-xs gap-1.5 mt-1">
          <PenTool className="w-3.5 h-3.5" />
          Assinar Contrato Agora
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  </CardContent>
</Card>

// WARNING — contrato assinado, aguardando dados
<Card className="border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
  ...mesma estrutura, cor amber, ícone Info...
</Card>
```

### Volumes do Projeto (hero card com gradient)

```tsx
<Card className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-primary/20">
  <CardContent className="p-6">
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="p-3 rounded-md bg-background/60 text-center">
        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{volume}</p>
        <p className="text-[11px] text-muted-foreground">Volume Ano 1</p>
        <Badge variant="outline" className="text-[9px] mt-1">Proposta</Badge>
      </div>
      {/* repetir para Ano 2, Total, Período, Sistemas */}
    </div>
  </CardContent>
</Card>
```

### Cards de Fases do Projeto

```typescript
// Status → estilo do card
function getPhaseStyle(status: string) {
  switch (status) {
    case "completed":  return "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900";
    case "in_progress": return "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900";
    case "blocking":   return "bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-900";
    case "locked":     return "bg-muted/30 opacity-50";
    default:           return "bg-muted/50";
  }
}

// Status → ícone
// completed   → <CheckCircle2 className="w-3 h-3 text-emerald-600" />
// in_progress → <Clock className="w-3 h-3 text-amber-600" />
// blocking    → <AlertTriangle className="w-3 h-3 text-red-600" />
// locked      → <Lock className="w-3 h-3 text-muted-foreground" />
// pending     → <Circle className="w-3 h-3 text-muted-foreground" />

// Status → badge
// completed   → <Badge className="text-[10px] bg-emerald-600">Concluido</Badge>
// in_progress → <Badge className="text-[10px] bg-amber-100 text-amber-700">Em Andamento</Badge>
// blocking    → <Badge variant="destructive" className="text-[10px]">Bloqueando</Badge>
// locked      → <Badge variant="outline" className="text-[10px] opacity-60">Bloqueado</Badge>
// pending     → <Badge variant="outline" className="text-[10px]">Pendente</Badge>
```

### Fase individual (card)

```tsx
<div className={`p-3 rounded-md ${getPhaseStyle(status)} ${
  status === "blocking" ? "ring-1 ring-red-400 dark:ring-red-700" : ""
}`}>
  <div className="flex items-center justify-between gap-2 mb-1.5">
    <Badge variant="outline" className="text-[10px] font-mono">{phase}</Badge>
    <div className="flex items-center gap-1">
      {getPhaseIcon(status)}
      {getPhaseBadge(status)}
    </div>
  </div>
  <p className="text-sm font-medium">{title}</p>
  <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
  <p className={`text-[10px] font-medium mt-1.5 italic ${
    status === "completed"  ? "text-emerald-700 dark:text-emerald-400" :
    status === "in_progress" ? "text-amber-700 dark:text-amber-400" :
    status === "blocking"   ? "text-red-700 dark:text-red-400" :
    "text-muted-foreground"
  }`}>{detail}</p>
</div>
```

### Mini Stat Card (bloqueado — sem dados)

```tsx
<Card className="opacity-60">
  <CardContent className="p-5">
    <div className="flex items-center gap-2 mb-2">
      <Lock className="w-4 h-4 text-muted-foreground" />
      <p className="text-xs text-muted-foreground uppercase">Analisado</p>
    </div>
    <p className="text-xl font-bold text-muted-foreground">—</p>
    <p className="text-[10px] text-muted-foreground mt-1">Aguardando dados</p>
  </CardContent>
</Card>
```

### Item de Fonte de Dados

```tsx
<div className="flex items-center justify-between gap-3 p-2.5 rounded-md bg-muted/50">
  <div className="flex items-center gap-2.5 min-w-0">
    <div className="flex items-center justify-center w-7 h-7 rounded-md bg-muted shrink-0">
      <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium truncate">{source}</p>
      <p className="text-[10px] text-muted-foreground">{type}</p>
    </div>
  </div>
  <Badge variant="outline" className="text-[10px] shrink-0 gap-1">
    <AlertCircle className="w-2.5 h-2.5" />
    Pendente
  </Badge>
</div>
```

### Info Banner azul (instrução/dica)

```tsx
<div className="mt-3 p-3 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
  <p className="text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed">
    <strong>Como enviar:</strong> descrição...
  </p>
</div>
```

---

## 6. TAMANHOS DE ÍCONES (padrão)

| Contexto | Classe | Tamanho |
|---|---|---|
| Header / Logo do módulo | `w-5 h-5` | 20px |
| CardTitle / Header de seção | `w-4 h-4` | 16px |
| StatCard / KPI | `w-5 h-5` em container `w-10 h-10` | 20px |
| KPI destaque | `w-5 h-5` em container `w-11 h-11 rounded-full` | 20px |
| Item de lista | `w-3.5 h-3.5` | 14px |
| Badge / micro | `w-3 h-3` | 12px |
| Step do processo | `w-5 h-5` em container `w-12 h-12 rounded-full` | 20px |
| Fase (status icon) | `w-3 h-3` | 12px |
| Fonte de dados | `w-3.5 h-3.5` em container `w-7 h-7 rounded-md` | 14px |
| Alerta / flag item | `w-4 h-4` em container `w-8 h-8 rounded-md` | 16px |

---

## 7. TOKENS DE ESPAÇAMENTO

| Token | Valor | Uso |
|---|---|---|
| `p-3` | 12px | Cards de módulo/fase compactos |
| `p-4` | 16px | Cards de conteúdo, banner |
| `p-5` | 20px | StatCards |
| `p-6` | 24px | Hero card, container principal |
| `space-y-2` | 8px | Itens internos de lista |
| `space-y-4` | 16px | Conteúdo interno do card |
| `space-y-6` | 24px | Gap entre seções no dashboard |
| `space-y-8` | 32px | Gap entre seções nas páginas públicas |
| `gap-2` | 8px | Itens mini / badges |
| `gap-3` | 12px | Dashboard cards compactos |
| `gap-4` | 16px | Grid padrão |
| `gap-6` | 24px | Grid de seções maiores |

---

## 8. SKELETON / LOADING

```tsx
// StatCard skeleton
<Card>
  <CardContent className="p-5">
    <div className="flex items-start justify-between gap-2">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="w-10 h-10 rounded-md" />
    </div>
  </CardContent>
</Card>

// Lista skeleton
<div className="space-y-3">
  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
</div>

// Gráfico skeleton
<Skeleton className="h-[220px] w-full" />

// Loading spinner (client-dashboard)
<Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
```

---

## 9. IDENTIFICADOR VISUAL DO AuraAUDIT

O AuraAUDIT usa âmbar como cor de identidade em todos os pontos de contato:

```tsx
// Logo / ícone identificador
<div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50">
  <Receipt className="w-4 h-4 text-amber-600 dark:text-amber-400" />
</div>

// Badge de módulo
<Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
  AuraAUDIT
</Badge>

// Borda de card AuraAUDIT
<Card className="border-amber-200 dark:border-amber-900 bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-950/30 dark:to-transparent">
```

---

## 10. ESTRUTURA VISUAL COMPLETA

### Dashboard Admin — blocos na ordem

```
1. [Header] — Título + Badge Lei 13.964
2. [Grid 3 cols] — KPI destaque: Resultado / Revisados / Recuperados
3. [Grid 5 cols] — StatCards: Revisados / Economia / Anomalias / Casos / Fontes
4. [Grid 3 cols] — Gráfico de barras (2/3) + Inconsistências (1/3)
5. [Grid 2 cols] — Despesas sinalizadas + Anomalias ativas
6. [Grid 3 cols] — Distribuição de risco (1/3) + Steps do processo (2/3)
7. [Grid 1 col]  — Clientes conectados
8. [Grid 2 cols] — Fontes de dados + Escopo
```

### Dashboard Cliente — blocos na ordem

```
1. [Header] — Título + Badge Lei 13.964
2. [Banner]  — Status do contrato (blocking / in_progress / signed)
3. [Hero]    — Volumes do projeto (5 métricas em grid)
4. [Grid 4 cols] — Mini stats bloqueados (Analisado / Economia / Anomalias / Casos)
5. [Card]    — Andamento do Projeto (7 fases em grid responsivo)
6. [Grid 2 cols] — Dados esperados + Escopo da auditoria
7. [Card]    — Acompanhamento de Entregáveis
8. [Card]    — Documentação / Contrato
```

---

## 11. DADOS DE REFERÊNCIA — AURAAUDIT

### Fases do Projeto (7 fases padrão)

```
Fase 01 — Proposta Comercial         → status: completed
Fase 02 — Assinatura do Contrato     → status: completed|blocking
Fase 03 — Onboarding & Acessos       → status: in_progress|locked
Fase 04 — Coleta de Dados            → status: pending|locked
Fase 05 — Reconciliação & Análise    → status: pending|locked
Fase 06 — Apresentação dos Resultados → status: pending|locked
Fase 07 — Entrega Final              → status: pending|locked
```

### Fontes de Dados Esperadas (8 padrão)

```
OBT (Online Booking Tool)   → Reservas e PNRs
Backoffice / ERP             → Emissões e faturamento
Cartões Corporativos         → Extratos e conciliação
GDS (Sabre / Amadeus)        → Dados de PNR
BSPlink                      → Faturamento IATA e settlement
Agências de Viagens          → Management files
Contratos e Acordos          → Documentação contratual
Relatórios Gerenciais        → Pagamentos e receitas
```

### Escopo da Auditoria (9 itens)

```
Conformidade com políticas internas
Governança e controles
Integridade de dados entre sistemas
Conformidade contratual com fornecedores
Controles, aprovações e alçadas
Falhas operacionais recorrentes
Vulnerabilidades financeiras e sistêmicas
Avaliação de riscos e exposições
Oportunidades de otimização e economia
```

### Reconciliações previstas

```
OBT vs Backoffice | Cartões vs Reservas | BSP vs Cias Aéreas
Hotel vs Faturas  | Fees e Rebates
```

---

## 12. REGRAS IMUTÁVEIS

```
⚠️  Logo AuraTECH = bg-primary (azul) — nunca mudar
⚠️  Logo AuraAUDIT = bg-amber-500 — nunca mudar
⚠️  Container = max-w-[1400px] mx-auto p-6 — invariante
⚠️  Dashboard usa space-y-6, páginas públicas usam space-y-8
⚠️  Fonte: Open Sans (system-ui fallback) — nunca usar outra família
⚠️  Sempre incluir data-testid em elementos interativos e de dados
⚠️  CardTitle usa sempre text-sm font-medium (não text-base ou text-lg)
⚠️  Badges de status usam text-[10px], nunca text-xs
⚠️  Gráficos sempre usam CSS variables: hsl(var(--border)), hsl(var(--card)), etc.
⚠️  Skeleton height de listas: h-14; de gráficos: h-[220px] ou similar
```

---

*Documento gerado em 24/03/2026 — AuraTECH Engineering*
*Arquivos de referência: `client/src/pages/dashboard.tsx`, `client-dashboard.tsx`, `design-system.tsx`, `client/src/index.css`*

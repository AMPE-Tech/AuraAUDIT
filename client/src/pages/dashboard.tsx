import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Receipt,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  FolderSearch,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  CheckCircle,
  Database,
  FileCheck,
  Scale,
  Search,
  ShieldCheck,
  Workflow,
  CalendarDays,
  Shield,
  BarChart3,
  Award,
  Plug,
  Users,
  PieChart,
  Upload,
  ListChecks,
  Zap,
  FileBarChart,
} from "lucide-react";
import { formatCurrency, formatDate, getCategoryLabel, getSeverityLabel, getAnomalyTypeLabel } from "@/lib/formatters";
import type { Expense, AuditCase, Anomaly, Client, DataSource } from "@shared/schema";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from "recharts";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  accentColor,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  trend?: "up" | "down";
  trendValue?: string;
  accentColor?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <p className={`text-2xl font-bold tracking-tight ${accentColor || ""}`}>{value}</p>
            <div className="flex items-center gap-1.5">
              {trend && (
                <span
                  className={`flex items-center text-xs font-medium ${
                    trend === "down"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {trend === "down" ? (
                    <ArrowDownRight className="w-3 h-3" />
                  ) : (
                    <ArrowUpRight className="w-3 h-3" />
                  )}
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
  );
}

function StatCardSkeleton() {
  return (
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
  );
}

const CHART_COLORS = [
  "hsl(210, 85%, 42%)",
  "hsl(195, 75%, 38%)",
  "hsl(225, 70%, 35%)",
  "hsl(180, 65%, 32%)",
  "hsl(240, 60%, 38%)",
];

const INCONSISTENCY_COLORS: Record<string, string> = {
  "Fraude": "bg-red-500",
  "Retencoes": "bg-blue-500",
  "Reembolso": "bg-emerald-500",
  "Cobranca Fee": "bg-amber-500",
  "Acordos Corporativos": "bg-violet-500",
};

const INCONSISTENCY_TYPES = [
  { name: "Cobranca Fee", percentage: 30 },
  { name: "Retencoes", percentage: 25 },
  { name: "Reembolso", percentage: 20 },
  { name: "Acordos Corporativos", percentage: 17 },
  { name: "Fraude", percentage: 8 },
];

const AUDIT_STEPS = [
  { step: 1, icon: Upload, title: "Upload dos Dados", time: "~10 min", description: "Cliente faz upload dos arquivos ou conecta via API" },
  { step: 2, icon: ListChecks, title: "Selecao do Escopo", time: "~5 min", description: "Escolha das categorias e itens a reconciliar" },
  { step: 3, icon: Zap, title: "Processamento", time: "~30 min", description: "Cruzamento automatizado e deteccao de anomalias" },
  { step: 4, icon: FileBarChart, title: "Resultados", time: "Imediato", description: "Relatorio executivo com achados e recomendacoes" },
];

const AUDIT_SCOPE_ITEMS = [
  { icon: FileCheck, label: "Conformidade com politicas internas" },
  { icon: Workflow, label: "Governanca dos processos" },
  { icon: Database, label: "Integridade dos dados OBT/Backoffice" },
  { icon: Scale, label: "Aderencia contratual" },
  { icon: ShieldCheck, label: "Controles e aprovacoes" },
  { icon: Search, label: "Falhas operacionais" },
  { icon: ShieldAlert, label: "Vulnerabilidades financeiras" },
  { icon: AlertTriangle, label: "Riscos e exposicoes" },
  { icon: TrendingDown, label: "Oportunidades de otimizacao" },
];

export default function Dashboard() {
  const { data: expenses, isLoading: loadingExpenses } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: cases, isLoading: loadingCases } = useQuery<AuditCase[]>({
    queryKey: ["/api/audit-cases"],
  });

  const { data: anomalies, isLoading: loadingAnomalies } = useQuery<Anomaly[]>({
    queryKey: ["/api/anomalies"],
  });

  const { data: clientsData } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: dataSourcesData } = useQuery<DataSource[]>({
    queryKey: ["/api/data-sources"],
  });

  const isLoading = loadingExpenses || loadingCases || loadingAnomalies;

  const totalExpenses = expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;
  const flaggedExpenses = expenses?.filter((e) => e.status === "flagged" || e.riskLevel === "high" || e.riskLevel === "critical") || [];
  const totalSavings = cases?.reduce((sum, c) => sum + parseFloat(c.savingsIdentified || "0"), 0) || 0;
  const openCases = cases?.filter((c) => c.status !== "closed") || [];
  const unresolvedAnomalies = anomalies?.filter((a) => !a.resolved) || [];
  const connectedSources = dataSourcesData?.filter((s) => s.status === "connected") || [];
  const activeClients = clientsData?.filter((c) => c.status === "active") || [];

  const categoryData = [
    { name: "Passagem Aerea", value: 94635 },
    { name: "Hospedagem", value: 72044 },
    { name: "Alimentacao", value: 53527 },
    { name: "Transporte", value: 37854 },
    { name: "Evento", value: 34936 },
    { name: "Outros", value: 22455 },
  ];

  const riskDistribution = expenses
    ? Object.entries(
        expenses.reduce((acc, e) => {
          acc[e.riskLevel] = (acc[e.riskLevel] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([name, value]) => ({
        name: name === "low" ? "Baixo" : name === "medium" ? "Medio" : name === "high" ? "Alto" : "Critico",
        value,
      }))
    : [];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-dashboard-title">
            Dashboard de Auditoria
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AuraAUDIT - Auditoria Forense em Despesas | Grupo Stabia
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1">
            <Shield className="w-3 h-3" />
            Lei 13.964/2019
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/30 dark:to-transparent">
          <CardContent className="p-5 text-center">
            <div className="flex items-center justify-center w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/50 mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400" data-testid="stat-avg-result">16%</p>
            <p className="text-sm font-medium mt-1">Media de Resultado</p>
            <p className="text-xs text-muted-foreground">sobre o volume revisado</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-950/30 dark:to-transparent">
          <CardContent className="p-5 text-center">
            <div className="flex items-center justify-center w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mx-auto mb-2">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="stat-reviewed">+2,8 BI</p>
            <p className="text-sm font-medium mt-1">Revisados</p>
            <p className="text-xs text-muted-foreground">em volume financeiro total</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 dark:border-amber-900 bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-950/30 dark:to-transparent">
          <CardContent className="p-5 text-center">
            <div className="flex items-center justify-center w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-900/50 mx-auto mb-2">
              <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400" data-testid="stat-recovered">+448 MI</p>
            <p className="text-sm font-medium mt-1">Recuperados</p>
            <p className="text-xs text-muted-foreground">em economia e recuperacao</p>
          </CardContent>
        </Card>
      </div>


      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Revisados"
              value="R$ 315.451"
              subtitle="amostra auditada"
              icon={Receipt}
            />
            <StatCard
              title="Economia"
              value="R$ 88.326"
              subtitle="savings"
              icon={TrendingDown}
              trend="down"
            />
            <StatCard
              title="Anomalias"
              value="30"
              subtitle="de 47 total"
              icon={AlertTriangle}
              trend="up"
              trendValue="ativas"
            />
            <StatCard
              title="Casos"
              value="3"
              subtitle="de 3 total"
              icon={FolderSearch}
            />
            <StatCard
              title="Fontes"
              value="14"
              subtitle="de 22 conectadas"
              icon={Plug}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[220px] w-full" />
            ) : categoryData.length > 0 ? (
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
                    formatter={(value: number) => [formatCurrency(value), "Valor"]}
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
            ) : (
              <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                Nenhum dado disponivel
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieChart className="w-4 h-4 text-primary" />
              Principais Inconsistencias
            </CardTitle>
            <p className="text-xs text-muted-foreground">Tipos identificados historicamente</p>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {INCONSISTENCY_TYPES.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-semibold">{item.percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${INCONSISTENCY_COLORS[item.name]} transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-destructive" />
              Despesas Sinalizadas
            </CardTitle>
            <Badge variant="destructive" className="text-xs">{flaggedExpenses.length}</Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : flaggedExpenses.length > 0 ? (
              <div className="space-y-2">
                {flaggedExpenses.slice(0, 5).map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-md bg-background"
                    data-testid={`card-flagged-expense-${expense.id}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-destructive/10 shrink-0">
                        <ShieldAlert className="w-4 h-4 text-destructive" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{expense.description}</p>
                        <p className="text-xs text-muted-foreground">{expense.employee} - {formatDate(expense.date)}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">{formatCurrency(expense.amount)}</p>
                      <Badge variant="destructive" className="text-[10px]">
                        {expense.riskLevel === "critical" ? "Critico" : "Alto"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-muted-foreground">
                <CheckCircle className="w-8 h-8 mb-2 text-green-500" />
                <p className="text-sm">Nenhuma despesa sinalizada</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              Anomalias Ativas
            </CardTitle>
            <Badge variant="secondary" className="text-xs">{unresolvedAnomalies.length}</Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : unresolvedAnomalies.length > 0 ? (
              <div className="space-y-2">
                {unresolvedAnomalies.slice(0, 5).map((anomaly) => (
                  <div
                    key={anomaly.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-md bg-background"
                    data-testid={`card-anomaly-${anomaly.id}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-yellow-500/10 shrink-0">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{anomaly.description}</p>
                        <p className="text-xs text-muted-foreground">{getAnomalyTypeLabel(anomaly.type)}</p>
                      </div>
                    </div>
                    <Badge
                      variant={anomaly.severity === "critical" || anomaly.severity === "high" ? "destructive" : "secondary"}
                      className="text-[10px] shrink-0"
                    >
                      {getSeverityLabel(anomaly.severity)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-muted-foreground">
                <CheckCircle className="w-8 h-8 mb-2 text-green-500" />
                <p className="text-sm">Nenhuma anomalia pendente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              Distribuicao de Risco
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : riskDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <RechartsPie>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={72}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {riskDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-1">
                  {riskDistribution.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-xs text-muted-foreground">{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                Nenhum dado disponivel
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Auditoria Online — Do Upload ao Resultado
            </CardTitle>
            <p className="text-xs text-muted-foreground">Processo completo em menos de 1 hora</p>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute top-6 left-[calc(12.5%+16px)] right-[calc(12.5%+16px)] h-0.5 bg-primary/20 hidden lg:block" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {AUDIT_STEPS.map((item, index) => (
                  <div key={item.step} className="relative flex flex-col items-center text-center" data-testid={`audit-step-${item.step}`}>
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/30 mb-3 relative z-10 bg-card">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-mono mb-1.5">{item.time}</Badge>
                    <p className="text-sm font-semibold leading-tight">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 p-3 rounded-md bg-primary/5 border border-primary/10">
              <p className="text-[11px] text-muted-foreground text-center">
                <span className="font-semibold text-primary">Tempo total estimado: ~45 minutos</span> — o processamento e automatizado e os resultados ficam disponiveis imediatamente apos a analise.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            Abrangencia Tecnica da Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {AUDIT_SCOPE_ITEMS.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-md bg-background" data-testid={`scope-item-${i}`}>
                <item.icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-xs text-muted-foreground leading-relaxed">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3" />
          <span>Cadeia de Custodia Digital - AuraDue</span>
        </div>
        <span>AuraAUDIT - Auditoria Forense em Despesas</span>
      </div>
    </div>
  );
}

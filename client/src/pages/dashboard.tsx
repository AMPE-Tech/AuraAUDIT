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
  Clock,
  Monitor,
  Database,
  CreditCard,
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
  Plane,
  PieChart,
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

const CHRONOGRAM = [
  { phase: "Fase 01", days: "Dias 1-2", title: "Revisao de Escopo", description: "Alinhamento de objetivos, validacao de premissas, definicao dos criterios", status: "completed" },
  { phase: "Fase 02", days: "Dias 3-5", title: "Coleta de Dados", description: "Extracoes dos sistemas OBT, Backoffice e relatorios gerenciais", status: "completed" },
  { phase: "Fase 03", days: "Dias 6-10", title: "Reconciliacao", description: "Cruzamento e reconciliacao, identificacao de inconsistencias", status: "in_progress" },
  { phase: "Fase 04", days: "Dias 11-12", title: "Apresentacao", description: "Consolidacao dos achados e material executivo", status: "pending" },
  { phase: "Fase 05", days: "Dias 13-14", title: "Ajustes", description: "Refinamento e consolidacao das recomendacoes", status: "pending" },
  { phase: "Fase 06", days: "Dia 15", title: "Entrega Final", description: "Relatorio executivo e tecnico final", status: "pending" },
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

  const categoryData = expenses
    ? Object.entries(
        expenses.reduce((acc, e) => {
          const cat = getCategoryLabel(e.category);
          acc[cat] = (acc[cat] || 0) + parseFloat(e.amount);
          return acc;
        }, {} as Record<string, number>)
      ).map(([name, value]) => ({ name, value: Math.round(value) }))
    : [];

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

      <Card className="border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Plane className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-semibold" data-testid="text-project-overview">Projeto Atual - Grupo Stabia</h2>
            <Badge variant="secondary" className="text-[10px]">Viagens e Eventos</Badge>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-3 rounded-md bg-muted/50">
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400" data-testid="text-volume-2024">R$ 51,3 MI</p>
              <p className="text-[11px] text-muted-foreground">Volume 2024</p>
            </div>
            <div className="p-3 rounded-md bg-muted/50">
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400" data-testid="text-volume-2025">R$ 39,6 MI</p>
              <p className="text-[11px] text-muted-foreground">Volume 2025</p>
            </div>
            <div className="p-3 rounded-md bg-muted/50">
              <p className="text-lg font-bold text-violet-600 dark:text-violet-400" data-testid="text-volume-total">R$ 90,9 MI</p>
              <p className="text-[11px] text-muted-foreground">Volume Total</p>
            </div>
            <div className="p-3 rounded-md bg-muted/50">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">OBT</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-[10px]">Reserve</Badge>
                <Badge variant="outline" className="text-[10px]">Argo</Badge>
              </div>
            </div>
            <div className="p-3 rounded-md bg-muted/50">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Backoffice</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-[10px]">Wintour (2024)</Badge>
                <Badge variant="outline" className="text-[10px]">Stur (2025)</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Analisado"
              value={formatCurrency(totalExpenses)}
              subtitle="amostra auditada"
              icon={Receipt}
            />
            <StatCard
              title="Economia"
              value={formatCurrency(totalSavings)}
              subtitle="identificada"
              icon={TrendingDown}
              trend="down"
              trendValue="savings"
            />
            <StatCard
              title="Anomalias"
              value={String(unresolvedAnomalies.length)}
              subtitle={`de ${anomalies?.length || 0} total`}
              icon={AlertTriangle}
              trend="up"
              trendValue="ativas"
            />
            <StatCard
              title="Casos"
              value={String(openCases.length)}
              subtitle={`de ${cases?.length || 0} total`}
              icon={FolderSearch}
            />
            <StatCard
              title="Fontes"
              value={String(connectedSources.length)}
              subtitle={`de ${dataSourcesData?.length || 0} conectadas`}
              icon={Plug}
            />
            <StatCard
              title="Clientes"
              value={String(activeClients.length)}
              subtitle={`de ${clientsData?.length || 0} ativos`}
              icon={Users}
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
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
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
              <CalendarDays className="w-4 h-4 text-primary" />
              Cronograma - 15 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {CHRONOGRAM.map((item) => (
                <div key={item.phase} className="p-3 rounded-md bg-background" data-testid={`card-phase-${item.phase.replace(" ", "-").toLowerCase()}`}>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono">{item.phase}</Badge>
                      <span className="text-[11px] text-muted-foreground">{item.days}</span>
                    </div>
                    <Badge
                      variant={item.status === "completed" ? "default" : item.status === "in_progress" ? "secondary" : "outline"}
                      className="text-[10px]"
                    >
                      {item.status === "completed" ? "OK" : item.status === "in_progress" ? "Andamento" : "Pendente"}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                </div>
              ))}
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

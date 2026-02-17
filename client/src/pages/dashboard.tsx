import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Receipt,
  AlertTriangle,
  TrendingDown,
  FolderSearch,
  Plane,
  Hotel,
  Utensils,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  CheckCircle,
  Clock,
} from "lucide-react";
import { formatCurrency, formatDate, getStatusLabel, getCategoryLabel, getSeverityLabel, getAnomalyTypeLabel } from "@/lib/formatters";
import type { Expense, AuditCase, Anomaly } from "@shared/schema";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  trend?: "up" | "down";
  trendValue?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
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

  const isLoading = loadingExpenses || loadingCases || loadingAnomalies;

  const totalExpenses = expenses?.reduce(
    (sum, e) => sum + parseFloat(e.amount),
    0
  ) || 0;

  const flaggedExpenses = expenses?.filter(
    (e) => e.status === "flagged" || e.riskLevel === "high" || e.riskLevel === "critical"
  ) || [];

  const totalSavings = cases?.reduce(
    (sum, c) => sum + parseFloat(c.savingsIdentified || "0"),
    0
  ) || 0;

  const openCases = cases?.filter((c) => c.status !== "closed") || [];
  const unresolvedAnomalies = anomalies?.filter((a) => !a.resolved) || [];

  const categoryData = expenses
    ? Object.entries(
        expenses.reduce((acc, e) => {
          const cat = getCategoryLabel(e.category);
          acc[cat] = (acc[cat] || 0) + parseFloat(e.amount);
          return acc;
        }, {} as Record<string, number>)
      ).map(([name, value]) => ({ name, value: Math.round(value) }))
    : [];

  const monthlyData = expenses
    ? Object.entries(
        expenses.reduce((acc, e) => {
          const month = new Date(e.date).toLocaleDateString("pt-BR", {
            month: "short",
          });
          acc[month] = (acc[month] || 0) + parseFloat(e.amount);
          return acc;
        }, {} as Record<string, number>)
      ).map(([month, total]) => ({ month, total: Math.round(total) }))
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-dashboard-title">
          Dashboard de Auditoria
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visao geral das despesas corporativas e indicadores de auditoria forense
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Despesas"
              value={formatCurrency(totalExpenses)}
              subtitle="ultimo trimestre"
              icon={Receipt}
              trend="up"
              trendValue="12%"
            />
            <StatCard
              title="Anomalias Detectadas"
              value={String(unresolvedAnomalies.length)}
              subtitle="nao resolvidas"
              icon={AlertTriangle}
              trend="up"
              trendValue={`${anomalies?.length || 0} total`}
            />
            <StatCard
              title="Economia Identificada"
              value={formatCurrency(totalSavings)}
              subtitle="oportunidades"
              icon={TrendingDown}
              trend="down"
              trendValue="potencial"
            />
            <StatCard
              title="Casos Abertos"
              value={String(openCases.length)}
              subtitle={`de ${cases?.length || 0} total`}
              icon={FolderSearch}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
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
              <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
                Nenhum dado disponivel
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distribuicao de Risco</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : riskDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {riskDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
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
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
                Nenhum dado disponivel
              </div>
            )}
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {riskDistribution.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Sinalizadas</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {flaggedExpenses.length}
            </Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : flaggedExpenses.length > 0 ? (
              <div className="space-y-2">
                {flaggedExpenses.slice(0, 5).map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-md bg-background hover-elevate"
                    data-testid={`card-flagged-expense-${expense.id}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-destructive/10 shrink-0">
                        <ShieldAlert className="w-4 h-4 text-destructive" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{expense.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {expense.employee} - {formatDate(expense.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">
                        {formatCurrency(expense.amount)}
                      </p>
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
            <CardTitle className="text-sm font-medium">Anomalias Recentes</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {unresolvedAnomalies.length}
            </Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : unresolvedAnomalies.length > 0 ? (
              <div className="space-y-2">
                {unresolvedAnomalies.slice(0, 5).map((anomaly) => (
                  <div
                    key={anomaly.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-md bg-background hover-elevate"
                    data-testid={`card-anomaly-${anomaly.id}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-yellow-500/10 shrink-0">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{anomaly.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {getAnomalyTypeLabel(anomaly.type)}
                        </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tendencia Mensal de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Total"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                Nenhum dado disponivel
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Casos de Auditoria</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : cases && cases.length > 0 ? (
              <div className="space-y-2">
                {cases.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-md bg-background hover-elevate"
                    data-testid={`card-case-${c.id}`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground">
                          {formatDate(c.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={c.status === "open" ? "default" : c.status === "in_progress" ? "secondary" : "outline"}
                      className="text-[10px] shrink-0"
                    >
                      {getStatusLabel(c.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-muted-foreground">
                <FolderSearch className="w-8 h-8 mb-2" />
                <p className="text-sm">Nenhum caso encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

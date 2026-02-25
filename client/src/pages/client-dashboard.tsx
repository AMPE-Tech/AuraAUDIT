import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Plane,
  CalendarDays,
  TrendingUp,
  BarChart3,
  Award,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  Receipt,
  TrendingDown,
  FolderSearch,
  Monitor,
} from "lucide-react";
import { formatCurrency, formatDate, getSeverityLabel, getAnomalyTypeLabel } from "@/lib/formatters";
import { useAuth } from "@/lib/auth";
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
} from "recharts";

const CHART_COLORS = [
  "hsl(210, 85%, 42%)",
  "hsl(195, 75%, 38%)",
  "hsl(225, 70%, 35%)",
  "hsl(180, 65%, 32%)",
  "hsl(240, 60%, 38%)",
];

const CHRONOGRAM = [
  { phase: "Fase 01", days: "Dias 1-2", title: "Revisao de Escopo", description: "Revisao final do escopo, alinhamento de objetivos, validacao das premissas, definicao dos criterios de auditoria e confirmacao dos acessos.", status: "completed" },
  { phase: "Fase 02", days: "Dias 3-5", title: "Coleta de Dados", description: "Coleta estruturada das bases de dados, extracoes dos sistemas (OBT, Backoffice, relatorios financeiros e operacionais).", status: "completed" },
  { phase: "Fase 03", days: "Dias 6-10", title: "Reconciliacao", description: "Cruzamento e reconciliacao das informacoes, identificacao de inconsistencias, falhas operacionais e vulnerabilidades financeiras.", status: "in_progress" },
  { phase: "Fase 04", days: "Dias 11-12", title: "Apresentacao dos Resultados", description: "Consolidacao dos achados, validacao preliminar e preparacao do material executivo.", status: "pending" },
  { phase: "Fase 05", days: "Dias 13-14", title: "Ajustes e Validacoes", description: "Ajustes finais com base em validacoes junto as areas envolvidas, refinamento das analises.", status: "pending" },
  { phase: "Fase 06", days: "Dia 15", title: "Entrega Final", description: "Entrega do relatorio executivo e tecnico final, apresentacao formal e recomendacoes.", status: "pending" },
];

export default function ClientDashboard() {
  const { user } = useAuth();

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

  const totalExpenses = expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0) || 0;
  const flaggedExpenses = expenses?.filter((e) => e.status === "flagged" || e.riskLevel === "high" || e.riskLevel === "critical") || [];
  const totalSavings = cases?.reduce((sum, c) => sum + parseFloat(c.savingsIdentified || "0"), 0) || 0;
  const openCases = cases?.filter((c) => c.status !== "closed") || [];
  const unresolvedAnomalies = anomalies?.filter((a) => !a.resolved) || [];

  const categoryData = expenses
    ? Object.entries(
        expenses.reduce((acc, e) => {
          const cat = e.category === "airfare" ? "Aereo" : e.category === "hotel" ? "Hotel" : e.category === "meals" ? "Alimentacao" : e.category === "transport" ? "Transporte" : e.category === "event" ? "Eventos" : e.category;
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
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-client-dashboard-title">
            Painel do Projeto
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AuraAUDIT - Auditoria Forense em Despesas | {user?.fullName}
          </p>
        </div>
        <Badge variant="outline" className="text-xs gap-1">
          <Shield className="w-3 h-3" />
          Lei 13.964/2019
        </Badge>
      </div>

      <Card className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Plane className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-semibold" data-testid="text-project-name">Projeto - {user?.fullName}</h2>
            <Badge variant="secondary" className="text-[10px]">Viagens e Eventos</Badge>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-3 rounded-md bg-background/60 text-center">
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-volume-2024">R$ 51,3 MI</p>
              <p className="text-[11px] text-muted-foreground">Volume 2024</p>
            </div>
            <div className="p-3 rounded-md bg-background/60 text-center">
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="text-volume-2025">R$ 39,6 MI</p>
              <p className="text-[11px] text-muted-foreground">Volume 2025</p>
            </div>
            <div className="p-3 rounded-md bg-background/60 text-center">
              <p className="text-xl font-bold text-violet-600 dark:text-violet-400" data-testid="text-volume-total">R$ 90,9 MI</p>
              <p className="text-[11px] text-muted-foreground">Volume Total</p>
            </div>
            <div className="p-3 rounded-md bg-background/60">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">OBT</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-[10px]">Reserve</Badge>
                <Badge variant="outline" className="text-[10px]">Argo</Badge>
              </div>
            </div>
            <div className="p-3 rounded-md bg-background/60">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Backoffice</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-[10px]">Wintour (2024)</Badge>
                <Badge variant="outline" className="text-[10px]">Stur (2025)</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground uppercase">Analisado</p>
                </div>
                <p className="text-xl font-bold">{formatCurrency(totalExpenses)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-muted-foreground uppercase">Economia</p>
                </div>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalSavings)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <p className="text-xs text-muted-foreground uppercase">Anomalias</p>
                </div>
                <p className="text-xl font-bold">{unresolvedAnomalies.length} <span className="text-sm font-normal text-muted-foreground">de {anomalies?.length || 0}</span></p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FolderSearch className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground uppercase">Casos</p>
                </div>
                <p className="text-xl font-bold">{openCases.length} <span className="text-sm font-normal text-muted-foreground">de {cases?.length || 0}</span></p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            Cronograma de Referencia - 15 Dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {CHRONOGRAM.map((item) => (
              <div key={item.phase} className="p-3 rounded-md bg-muted/50" data-testid={`card-phase-${item.phase.replace(" ", "-").toLowerCase()}`}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">{item.phase}</Badge>
                    <span className="text-[11px] text-muted-foreground">{item.days}</span>
                  </div>
                  <Badge
                    variant={item.status === "completed" ? "default" : item.status === "in_progress" ? "secondary" : "outline"}
                    className="text-[10px]"
                  >
                    {item.status === "completed" ? "Concluido" : item.status === "in_progress" ? "Em Andamento" : "Pendente"}
                  </Badge>
                </div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
            <p className="text-[11px] text-muted-foreground">
              <span className="font-semibold">Observacao Importante:</span> Os prazos acima consideram a disponibilizacao tempestiva dos acessos, bases de dados e documentos necessarios para execucao das atividades.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[200px] w-full" />
            ) : categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), "Valor"]} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">Nenhum dado disponivel</div>
            )}
          </CardContent>
        </Card>

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
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                      {riskDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "12px" }} />
                  </PieChart>
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
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">Nenhum dado disponivel</div>
            )}
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
              <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : flaggedExpenses.length > 0 ? (
              <div className="space-y-2">
                {flaggedExpenses.slice(0, 5).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between gap-3 p-3 rounded-md bg-muted/50" data-testid={`card-flagged-${expense.id}`}>
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
                      <Badge variant="destructive" className="text-[10px]">{expense.riskLevel === "critical" ? "Critico" : "Alto"}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-24 flex flex-col items-center justify-center text-muted-foreground">
                <CheckCircle className="w-6 h-6 mb-1 text-green-500" />
                <p className="text-sm">Nenhuma despesa sinalizada</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              Anomalias Ativas
            </CardTitle>
            <Badge variant="secondary" className="text-xs">{unresolvedAnomalies.length}</Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : unresolvedAnomalies.length > 0 ? (
              <div className="space-y-2">
                {unresolvedAnomalies.slice(0, 5).map((anomaly) => (
                  <div key={anomaly.id} className="flex items-center justify-between gap-3 p-3 rounded-md bg-muted/50" data-testid={`card-anomaly-${anomaly.id}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-yellow-500/10 shrink-0">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{anomaly.description}</p>
                        <p className="text-xs text-muted-foreground">{getAnomalyTypeLabel(anomaly.type)}</p>
                      </div>
                    </div>
                    <Badge variant={anomaly.severity === "critical" || anomaly.severity === "high" ? "destructive" : "secondary"} className="text-[10px] shrink-0">
                      {getSeverityLabel(anomaly.severity)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-24 flex flex-col items-center justify-center text-muted-foreground">
                <CheckCircle className="w-6 h-6 mb-1 text-green-500" />
                <p className="text-sm">Nenhuma anomalia pendente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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

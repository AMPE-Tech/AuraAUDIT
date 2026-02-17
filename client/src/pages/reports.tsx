import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  FileBarChart,
  Download,
  Printer,
  Shield,
  Calendar,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Receipt,
  FolderSearch,
} from "lucide-react";
import { formatCurrency, formatDate, getCategoryLabel, getStatusLabel, getAnomalyTypeLabel, getSeverityLabel } from "@/lib/formatters";
import type { Expense, AuditCase, Anomaly, AuditTrail } from "@shared/schema";

export default function Reports() {
  const { data: expenses, isLoading: loadingExpenses } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });
  const { data: cases, isLoading: loadingCases } = useQuery<AuditCase[]>({
    queryKey: ["/api/audit-cases"],
  });
  const { data: anomalies, isLoading: loadingAnomalies } = useQuery<Anomaly[]>({
    queryKey: ["/api/anomalies"],
  });
  const { data: trail, isLoading: loadingTrail } = useQuery<AuditTrail[]>({
    queryKey: ["/api/audit-trail"],
  });

  const isLoading = loadingExpenses || loadingCases || loadingAnomalies || loadingTrail;

  const totalExpenses = expenses?.reduce((s, e) => s + parseFloat(e.amount), 0) || 0;
  const totalSavings = cases?.reduce((s, c) => s + parseFloat(c.savingsIdentified || "0"), 0) || 0;
  const unresolvedAnomalies = anomalies?.filter((a) => !a.resolved).length || 0;
  const flaggedExpenses = expenses?.filter((e) => e.status === "flagged" || e.riskLevel === "high" || e.riskLevel === "critical") || [];

  const categoryBreakdown = expenses
    ? Object.entries(
        expenses.reduce((acc, e) => {
          const cat = getCategoryLabel(e.category);
          if (!acc[cat]) acc[cat] = { total: 0, count: 0 };
          acc[cat].total += parseFloat(e.amount);
          acc[cat].count += 1;
          return acc;
        }, {} as Record<string, { total: number; count: number }>)
      )
    : [];

  const departmentBreakdown = expenses
    ? Object.entries(
        expenses.reduce((acc, e) => {
          if (!acc[e.department]) acc[e.department] = { total: 0, count: 0 };
          acc[e.department].total += parseFloat(e.amount);
          acc[e.department].count += 1;
          return acc;
        }, {} as Record<string, { total: number; count: number }>)
      ).sort((a, b) => b[1].total - a[1].total)
    : [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-reports-title">
            Relatorio de Auditoria
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Relatorio consolidado seguindo metodologia estruturada
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} data-testid="button-print-report">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4 print:space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="text-lg font-bold">Aura Audit - Relatorio de Auditoria Forense</h2>
                  <p className="text-xs text-muted-foreground">
                    Despesas Corporativas - Viagens e Eventos
                  </p>
                </div>
              </div>
              <Separator className="mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Data do Relatorio</p>
                  <p className="text-sm font-medium">{formatDate(new Date())}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Despesas Analisadas</p>
                  <p className="text-sm font-medium">{expenses?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Casos de Auditoria</p>
                  <p className="text-sm font-medium">{cases?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Registros na Trilha</p>
                  <p className="text-sm font-medium">{trail?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileBarChart className="w-5 h-5 text-primary" />
                1. Sumario Executivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Este relatorio apresenta os resultados da auditoria forense realizada sobre as despesas corporativas
                de viagens e eventos, conforme metodologia estruturada e em conformidade com a Lei 13.964/2019
                (Pacote Anticrime) para preservacao da cadeia de custodia digital.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-md bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="w-4 h-4 text-primary" />
                    <p className="text-xs font-medium uppercase tracking-wide">Total Analisado</p>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(totalExpenses)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{expenses?.length || 0} despesas</p>
                </div>
                <div className="p-4 rounded-md bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <p className="text-xs font-medium uppercase tracking-wide">Economia Identificada</p>
                  </div>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(totalSavings)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">oportunidades de savings</p>
                </div>
                <div className="p-4 rounded-md bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    <p className="text-xs font-medium uppercase tracking-wide">Anomalias Pendentes</p>
                  </div>
                  <p className="text-xl font-bold">{unresolvedAnomalies}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    de {anomalies?.length || 0} detectadas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                2. Analise por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              {categoryBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {categoryBreakdown.map(([cat, data]) => (
                    <div key={cat} className="flex items-center justify-between gap-3 p-3 rounded-md bg-background">
                      <div>
                        <p className="text-sm font-medium">{cat}</p>
                        <p className="text-xs text-muted-foreground">{data.count} despesas</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(data.total)}</p>
                        <p className="text-xs text-muted-foreground">
                          {((data.total / totalExpenses) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum dado disponivel</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                3. Analise por Departamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {departmentBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {departmentBreakdown.map(([dept, data]) => (
                    <div key={dept} className="flex items-center justify-between gap-3 p-3 rounded-md bg-background">
                      <div>
                        <p className="text-sm font-medium">{dept}</p>
                        <p className="text-xs text-muted-foreground">{data.count} despesas</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(data.total)}</p>
                        <p className="text-xs text-muted-foreground">
                          {((data.total / totalExpenses) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum dado disponivel</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                4. Despesas Sinalizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {flaggedExpenses.length > 0 ? (
                <div className="space-y-3">
                  {flaggedExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between gap-3 p-3 rounded-md bg-background">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{expense.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {expense.employee} | {expense.vendor} | {formatDate(expense.date)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">{formatCurrency(expense.amount)}</p>
                        <Badge variant="destructive" className="text-[10px]">
                          {expense.riskLevel === "critical" ? "Critico" : "Alto Risco"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Nenhuma despesa sinalizada neste periodo
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FolderSearch className="w-5 h-5 text-primary" />
                5. Casos de Auditoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cases && cases.length > 0 ? (
                <div className="space-y-3">
                  {cases.map((c) => (
                    <div key={c.id} className="p-3 rounded-md bg-background">
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <p className="text-sm font-medium">{c.title}</p>
                        <Badge variant={c.status === "open" ? "default" : "secondary"} className="text-[10px]">
                          {getStatusLabel(c.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                      {parseFloat(c.savingsIdentified || "0") > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <TrendingDown className="w-3 h-3 text-green-600 dark:text-green-400" />
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">
                            Economia: {formatCurrency(c.savingsIdentified || "0")}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum caso registrado</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold">Conformidade Legal</h3>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>
                  Este relatorio foi gerado em conformidade com a Lei 13.964/2019 (Pacote Anticrime),
                  observando os principios da Cadeia de Custodia Digital.
                </p>
                <p>
                  Todas as operacoes foram registradas na trilha de auditoria com hash de integridade
                  SHA-256, garantindo a preservacao probatoria e rastreabilidade completa.
                </p>
                <p>
                  O relatorio segue metodologia estruturada incluindo: escopo da analise, fontes
                  consultadas, evidencias coletadas, conclusoes e recomendacoes, em formato
                  compativel com utilizacao em procedimentos administrativos e judiciais.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

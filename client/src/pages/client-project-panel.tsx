import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Target,
  Layers,
  FileSearch,
  Zap,
  DollarSign,
  Building2,
  Lock,
  Database,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
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
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = {
  primary: "hsl(210, 85%, 42%)",
  success: "hsl(145, 65%, 38%)",
  warning: "hsl(38, 92%, 50%)",
  danger: "hsl(0, 72%, 51%)",
  info: "hsl(195, 75%, 38%)",
  violet: "hsl(262, 60%, 50%)",
  slate: "hsl(215, 20%, 65%)",
};

function AwaitingDataCard({ title, icon: Icon, description, testId }: { title: string; icon: any; description: string; testId?: string }) {
  const id = testId || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return (
    <Card data-testid={`card-awaiting-${id}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex flex-col items-center justify-center gap-3 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
            <Lock className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground" data-testid={`text-awaiting-${id}`}>Aguardando dados</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">{description}</p>
          </div>
          <Badge variant="outline" className="text-[10px]" data-testid={`badge-awaiting-${id}`}>
            <Database className="w-3 h-3 mr-1" />
            Sera preenchido apos upload dos dados
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function AwaitingMetricCard({ icon: Icon, label, color, testId }: { icon: any; label: string; color: string; testId?: string }) {
  return (
    <Card data-testid={testId || `metric-awaiting-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: `${color}15` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <Lock className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <div className="mt-3">
          <p className="text-sm font-medium text-muted-foreground">Aguardando dados</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({ icon: Icon, label, value, subValue, color }: {
  icon: any;
  label: string;
  value: string;
  subValue?: string;
  color: string;
}) {
  return (
    <Card data-testid={`metric-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: `${color}15` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          {subValue && <p className="text-[11px] text-muted-foreground mt-0.5">{subValue}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClientProjectPanel() {
  const { user } = useAuth();

  const { data: projectOverview, isLoading: loadingOverview } = useQuery<any>({
    queryKey: ["/api/client/project-overview"],
  });

  const { data: expenses, isLoading: loadingExpenses } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: cases, isLoading: loadingCases } = useQuery<AuditCase[]>({
    queryKey: ["/api/audit-cases"],
  });

  const { data: anomalies, isLoading: loadingAnomalies } = useQuery<Anomaly[]>({
    queryKey: ["/api/anomalies"],
  });

  const isLoading = loadingExpenses || loadingCases || loadingAnomalies || loadingOverview;

  const hasRealExpenseData = expenses && expenses.length > 0;
  const hasRealAnomalyData = anomalies && anomalies.length > 0;
  const hasRealCaseData = cases && cases.length > 0;
  const hasAnyRealData = hasRealExpenseData || hasRealAnomalyData || hasRealCaseData;

  const estimatedVolume = projectOverview?.volumes?.total || null;

  const totalExpenses = hasRealExpenseData ? expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0) : 0;
  const totalSavings = hasRealCaseData ? cases.reduce((sum, c) => sum + parseFloat(c.savingsIdentified || "0"), 0) : 0;
  const savingsPercent = totalExpenses > 0 ? ((totalSavings / totalExpenses) * 100).toFixed(1) : "0";
  const unresolvedAnomalies = hasRealAnomalyData ? anomalies.filter((a) => !a.resolved) : [];
  const resolvedAnomalies = hasRealAnomalyData ? anomalies.filter((a) => a.resolved) : [];

  const categoryBreakdown = hasRealExpenseData
    ? Object.entries(
        expenses.reduce((acc, e) => {
          const cat = e.category === "airfare" ? "Aereo" : e.category === "hotel" ? "Hotel" : e.category === "meals" ? "Alimentacao" : e.category === "transport" ? "Transporte" : e.category === "event" ? "Eventos" : e.category;
          acc[cat] = (acc[cat] || 0) + parseFloat(e.amount);
          return acc;
        }, {} as Record<string, number>)
      ).map(([name, value]) => ({ name, value: Math.round(value) }))
    : [];

  const statusBreakdown = hasRealExpenseData
    ? Object.entries(
        expenses.reduce((acc, e) => {
          const label = e.status === "approved" ? "Aprovado" : e.status === "flagged" ? "Sinalizado" : e.status === "pending" ? "Pendente" : e.status;
          acc[label] = (acc[label] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([name, value]) => ({ name, value }))
    : [];

  const statusColors = ["hsl(145, 65%, 38%)", "hsl(0, 72%, 51%)", "hsl(38, 92%, 50%)"];

  const severityData = hasRealAnomalyData
    ? Object.entries(
        anomalies.reduce((acc, a) => {
          const label = a.severity === "critical" ? "Critico" : a.severity === "high" ? "Alto" : a.severity === "medium" ? "Medio" : "Baixo";
          acc[label] = (acc[label] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([name, value]) => ({ name, value }))
    : [];

  const severityColors = [COLORS.danger, COLORS.warning, COLORS.info, COLORS.slate];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-project-panel-title">
            Painel do Projeto
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visao consolidada dos resultados da auditoria forense | {user?.fullName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1">
            <Activity className="w-3 h-3" />
            Atualizado agora
          </Badge>
          <Badge variant="outline" className="text-xs gap-1">
            <Shield className="w-3 h-3" />
            Lei 13.964/2019
          </Badge>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}><CardContent className="p-5"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {estimatedVolume ? (
            <MetricCard
              icon={DollarSign}
              label="Volume Total Estimado"
              value={estimatedVolume}
              subValue={projectOverview?.period ? `Periodo: ${projectOverview.period}` : undefined}
              color={COLORS.primary}
            />
          ) : (
            <AwaitingMetricCard icon={DollarSign} label="Volume Total Estimado" color={COLORS.primary} testId="metric-volume-awaiting" />
          )}

          {hasRealExpenseData ? (
            <MetricCard
              icon={TrendingDown}
              label="Economia Identificada"
              value={formatCurrency(totalSavings)}
              subValue={`${savingsPercent}% do volume`}
              color={COLORS.success}
            />
          ) : (
            <AwaitingMetricCard icon={TrendingDown} label="Economia Identificada" color={COLORS.success} testId="metric-economia-awaiting" />
          )}

          {hasRealAnomalyData ? (
            <MetricCard
              icon={AlertTriangle}
              label="Anomalias Abertas"
              value={`${unresolvedAnomalies.length}`}
              subValue={`de ${anomalies.length} detectadas`}
              color={COLORS.warning}
            />
          ) : (
            <AwaitingMetricCard icon={AlertTriangle} label="Anomalias Abertas" color={COLORS.warning} testId="metric-anomalias-abertas-awaiting" />
          )}

          {hasRealAnomalyData ? (
            <MetricCard
              icon={CheckCircle2}
              label="Anomalias Resolvidas"
              value={`${resolvedAnomalies.length}`}
              subValue={`${((resolvedAnomalies.length / anomalies.length) * 100).toFixed(0)}% resolucao`}
              color={COLORS.success}
            />
          ) : (
            <AwaitingMetricCard icon={CheckCircle2} label="Anomalias Resolvidas" color={COLORS.success} testId="metric-anomalias-resolvidas-awaiting" />
          )}

          {hasRealCaseData ? (
            <MetricCard
              icon={FileSearch}
              label="Casos Ativos"
              value={`${cases.filter(c => c.status !== "closed").length}`}
              subValue={`de ${cases.length} casos`}
              color={COLORS.violet}
            />
          ) : (
            <AwaitingMetricCard icon={FileSearch} label="Casos Ativos" color={COLORS.violet} testId="metric-casos-awaiting" />
          )}

          {hasRealExpenseData ? (
            <MetricCard
              icon={Target}
              label="Savings Rate"
              value={`${savingsPercent}%`}
              subValue="economia / volume"
              color={COLORS.info}
            />
          ) : (
            <AwaitingMetricCard icon={Target} label="Savings Rate" color={COLORS.info} testId="metric-savings-awaiting" />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {hasRealExpenseData && categoryBreakdown.length > 0 ? (
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Despesas por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={80} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), "Valor"]} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="value" fill={COLORS.primary} radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <div className="lg:col-span-2">
            <AwaitingDataCard
              title="Despesas por Categoria"
              icon={TrendingUp}
              description="Os graficos de despesas por categoria serao exibidos apos o envio e processamento dos dados do cliente."
            />
          </div>
        )}

        {hasRealExpenseData && statusBreakdown.length > 0 ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-primary" />
                Status das Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {statusBreakdown.map((_, i) => (
                      <Cell key={`cell-status-${i}`} fill={statusColors[i % statusColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center">
                {statusBreakdown.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColors[i % statusColors.length] }} />
                    <span className="text-xs text-muted-foreground">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <AwaitingDataCard
            title="Status das Despesas"
            icon={PieChartIcon}
            description="O grafico de status das despesas sera exibido apos o envio dos dados do cliente."
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AwaitingDataCard
          title="Radar de Conformidade"
          icon={Zap}
          description="O radar de aderencia por dimensao da politica corporativa sera calculado a partir dos dados reais do cliente."
        />

        <AwaitingDataCard
          title="Economia por Area"
          icon={TrendingDown}
          description="A economia identificada por area sera calculada apos a analise forense dos dados enviados pelo cliente."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AwaitingDataCard
          title="Progresso da Auditoria por Area"
          icon={Layers}
          description="O progresso detalhado por area sera preenchido conforme a auditoria avanca com os dados reais do cliente."
        />

        {hasRealAnomalyData && severityData.length > 0 ? (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  Anomalias por Severidade
                </CardTitle>
                <Badge variant="secondary" className="text-[10px]">{anomalies.length} total</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={severityData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                      {severityData.map((_, i) => (
                        <Cell key={`sev-${i}`} fill={severityColors[i % severityColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {severityData.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: severityColors[i % severityColors.length] }} />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <AwaitingDataCard
            title="Anomalias por Severidade"
            icon={AlertTriangle}
            description="O grafico de anomalias por severidade sera exibido apos a deteccao de anomalias nos dados do cliente."
          />
        )}
      </div>

      <AwaitingDataCard
        title="Principais Fornecedores Auditados"
        icon={Building2}
        description="O ranking de fornecedores sera populado automaticamente a partir dos dados de despesas enviados pelo cliente."
      />

      <Separator />

      <div className="flex items-center justify-between text-xs text-muted-foreground pb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3" />
          <span>Cadeia de Custodia Digital - AuraDue - Lei 13.964/2019</span>
        </div>
        <span>AuraAUDIT - Auditoria Forense em Despesas</span>
      </div>
    </div>
  );
}

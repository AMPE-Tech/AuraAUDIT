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
  Clock,
  Target,
  Layers,
  FileSearch,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap,
  Eye,
  FileText,
  DollarSign,
  Users,
  Building2,
  Plane,
  Hotel,
  Car,
  Receipt,
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
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
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

const MONTHLY_EVOLUTION = [
  { month: "Jul", despesas: 42500, economia: 6800, anomalias: 3 },
  { month: "Ago", despesas: 38200, economia: 5100, anomalias: 2 },
  { month: "Set", despesas: 51800, economia: 9200, anomalias: 5 },
  { month: "Out", despesas: 47300, economia: 7600, anomalias: 4 },
  { month: "Nov", despesas: 55100, economia: 12400, anomalias: 7 },
  { month: "Dez", despesas: 49200, economia: 8900, anomalias: 4 },
];

const SAVINGS_BY_AREA = [
  { area: "Aereo", valor: 18500, percent: 12.4 },
  { area: "Hotel", valor: 14200, percent: 9.8 },
  { area: "Eventos", valor: 8900, percent: 15.2 },
  { area: "Transporte", valor: 4300, percent: 7.1 },
  { area: "Alimentacao", valor: 3200, percent: 6.5 },
];

const COMPLIANCE_RADAR = [
  { subject: "Politica", A: 72, fullMark: 100 },
  { subject: "Aprovacoes", A: 85, fullMark: 100 },
  { subject: "Comprovantes", A: 68, fullMark: 100 },
  { subject: "Limites", A: 78, fullMark: 100 },
  { subject: "Preferenciais", A: 55, fullMark: 100 },
  { subject: "Antecedencia", A: 63, fullMark: 100 },
];

const TOP_VENDORS = [
  { name: "LATAM Airlines", total: 28450, txns: 12, status: "ok" },
  { name: "GOL Linhas Aereas", total: 18920, txns: 8, status: "ok" },
  { name: "Accor Hotels", total: 15600, txns: 6, status: "alert" },
  { name: "Localiza Hertz", total: 9800, txns: 5, status: "ok" },
  { name: "Copacabana Palace", total: 12500, txns: 1, status: "critical" },
  { name: "Restaurante Fasano", total: 4500, txns: 1, status: "alert" },
];

const AUDIT_PROGRESS = [
  { area: "Passagens Aereas", total: 45, revisados: 38, anomalias: 4 },
  { area: "Hospedagem", total: 32, revisados: 28, anomalias: 3 },
  { area: "Alimentacao", total: 28, revisados: 22, anomalias: 1 },
  { area: "Transporte Terrestre", total: 18, revisados: 15, anomalias: 1 },
  { area: "Eventos/MICE", total: 12, revisados: 10, anomalias: 0 },
];

function MetricCard({ icon: Icon, label, value, subValue, trend, color }: {
  icon: any;
  label: string;
  value: string;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  color: string;
}) {
  return (
    <Card data-testid={`metric-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: `${color}15` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          {trend && (
            <div className={`flex items-center gap-0.5 text-xs font-medium ${
              trend === "up" ? "text-green-600" : trend === "down" ? "text-red-500" : "text-muted-foreground"
            }`}>
              {trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5" /> :
               trend === "down" ? <ArrowDownRight className="w-3.5 h-3.5" /> :
               <Minus className="w-3.5 h-3.5" />}
            </div>
          )}
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
  const totalSavings = cases?.reduce((sum, c) => sum + parseFloat(c.savingsIdentified || "0"), 0) || 0;
  const savingsPercent = totalExpenses > 0 ? ((totalSavings / totalExpenses) * 100).toFixed(1) : "0";
  const unresolvedAnomalies = anomalies?.filter((a) => !a.resolved) || [];
  const resolvedAnomalies = anomalies?.filter((a) => a.resolved) || [];
  const totalItems = expenses?.length || 0;

  const categoryBreakdown = expenses
    ? Object.entries(
        expenses.reduce((acc, e) => {
          const cat = e.category === "airfare" ? "Aereo" : e.category === "hotel" ? "Hotel" : e.category === "meals" ? "Alimentacao" : e.category === "transport" ? "Transporte" : e.category === "event" ? "Eventos" : e.category;
          acc[cat] = (acc[cat] || 0) + parseFloat(e.amount);
          return acc;
        }, {} as Record<string, number>)
      ).map(([name, value]) => ({ name, value: Math.round(value) }))
    : [];

  const statusBreakdown = expenses
    ? Object.entries(
        expenses.reduce((acc, e) => {
          const label = e.status === "approved" ? "Aprovado" : e.status === "flagged" ? "Sinalizado" : e.status === "pending" ? "Pendente" : e.status;
          acc[label] = (acc[label] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([name, value]) => ({ name, value }))
    : [];

  const statusColors = ["hsl(145, 65%, 38%)", "hsl(0, 72%, 51%)", "hsl(38, 92%, 50%)"];

  const severityData = anomalies
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
          <MetricCard
            icon={DollarSign}
            label="Volume Analisado"
            value={formatCurrency(totalExpenses)}
            subValue={`${totalItems} transacoes`}
            color={COLORS.primary}
          />
          <MetricCard
            icon={TrendingDown}
            label="Economia Identificada"
            value={formatCurrency(totalSavings)}
            subValue={`${savingsPercent}% do volume`}
            trend="up"
            color={COLORS.success}
          />
          <MetricCard
            icon={AlertTriangle}
            label="Anomalias Abertas"
            value={`${unresolvedAnomalies.length}`}
            subValue={`de ${anomalies?.length || 0} detectadas`}
            trend={unresolvedAnomalies.length > 3 ? "down" : "up"}
            color={COLORS.warning}
          />
          <MetricCard
            icon={CheckCircle2}
            label="Anomalias Resolvidas"
            value={`${resolvedAnomalies.length}`}
            subValue={`${anomalies?.length ? ((resolvedAnomalies.length / anomalies.length) * 100).toFixed(0) : 0}% resolucao`}
            trend="up"
            color={COLORS.success}
          />
          <MetricCard
            icon={FileSearch}
            label="Casos Ativos"
            value={`${cases?.filter(c => c.status !== "closed").length || 0}`}
            subValue={`de ${cases?.length || 0} casos`}
            color={COLORS.violet}
          />
          <MetricCard
            icon={Target}
            label="Savings Rate"
            value={`${savingsPercent}%`}
            subValue="economia / volume"
            trend="up"
            color={COLORS.info}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Evolucao Mensal — Despesas vs. Economia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={MONTHLY_EVOLUTION}>
                <defs>
                  <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEconomia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number, name: string) => [formatCurrency(value), name === "despesas" ? "Despesas" : "Economia"]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="despesas" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorDespesas)" strokeWidth={2} name="despesas" />
                <Area type="monotone" dataKey="economia" stroke={COLORS.success} fillOpacity={1} fill="url(#colorEconomia)" strokeWidth={2} name="economia" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-6 justify-center mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.primary }} />
                <span className="text-xs text-muted-foreground">Despesas Auditadas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.success }} />
                <span className="text-xs text-muted-foreground">Economia Identificada</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-primary" />
              Status das Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusBreakdown.length > 0 ? (
              <>
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
              </>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">Sem dados</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={categoryBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={80} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), "Valor"]} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                  <Bar dataKey="value" fill={COLORS.primary} radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">Sem dados</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Radar de Conformidade
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">Aderencia por dimensao da politica corporativa</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={COMPLIANCE_RADAR}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <Radar name="Aderencia %" dataKey="A" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-green-600" />
                Economia por Area
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">{SAVINGS_BY_AREA.length} areas</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {SAVINGS_BY_AREA.map((item) => (
                <div key={item.area} className="space-y-1.5" data-testid={`saving-area-${item.area.toLowerCase()}`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.area}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-green-600 dark:text-green-400 font-semibold">{formatCurrency(item.valor)}</span>
                      <Badge variant="outline" className="text-[10px]">{item.percent}%</Badge>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(item.percent * 5, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                Anomalias por Severidade
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">{anomalies?.length || 0} total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {severityData.length > 0 ? (
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
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">Sem dados</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Progresso da Auditoria por Area
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              {AUDIT_PROGRESS.reduce((s, a) => s + a.revisados, 0)} / {AUDIT_PROGRESS.reduce((s, a) => s + a.total, 0)} itens
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {AUDIT_PROGRESS.map((item) => {
              const pct = Math.round((item.revisados / item.total) * 100);
              return (
                <div key={item.area} className="space-y-1.5" data-testid={`progress-${item.area.toLowerCase().replace(/\s/g, '-')}`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.area}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{item.revisados}/{item.total} revisados</span>
                      {item.anomalias > 0 && (
                        <Badge variant="destructive" className="text-[10px]">{item.anomalias} anomalias</Badge>
                      )}
                      <span className="text-xs font-semibold w-10 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct >= 80 ? COLORS.success : pct >= 50 ? COLORS.info : COLORS.warning,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Principais Fornecedores Auditados
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">{TOP_VENDORS.length} fornecedores</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {TOP_VENDORS.map((vendor) => (
              <div
                key={vendor.name}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                data-testid={`vendor-${vendor.name.toLowerCase().replace(/\s/g, '-')}`}
              >
                <div>
                  <p className="text-sm font-medium">{vendor.name}</p>
                  <p className="text-xs text-muted-foreground">{vendor.txns} transacoes</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(vendor.total)}</p>
                  <Badge
                    variant={vendor.status === "critical" ? "destructive" : vendor.status === "alert" ? "secondary" : "outline"}
                    className="text-[10px]"
                  >
                    {vendor.status === "critical" ? "Critico" : vendor.status === "alert" ? "Atencao" : "Regular"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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

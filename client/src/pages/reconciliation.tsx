import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  ArrowRightLeft,
  Database,
  Monitor,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileWarning,
  Receipt,
  Building2,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const RECONCILIATION_SOURCES = [
  {
    name: "OBT - Reserve",
    system: "Online Booking Tool",
    icon: Monitor,
    year: 2024,
    records: 12847,
    totalAmount: 28945621.45,
    matched: 12103,
    unmatched: 744,
    status: "completed",
  },
  {
    name: "OBT - Argo",
    system: "Online Booking Tool",
    icon: Monitor,
    year: 2025,
    records: 9823,
    totalAmount: 21478932.18,
    matched: 9145,
    unmatched: 678,
    status: "completed",
  },
  {
    name: "Wintour (Backoffice 2024)",
    system: "Backoffice",
    icon: Database,
    year: 2024,
    records: 13102,
    totalAmount: 29156847.92,
    matched: 12103,
    unmatched: 999,
    status: "completed",
  },
  {
    name: "Stur (Backoffice 2025)",
    system: "Backoffice",
    icon: Database,
    year: 2025,
    records: 10295,
    totalAmount: 22871455.33,
    matched: 9145,
    unmatched: 1150,
    status: "in_progress",
  },
  {
    name: "Cartoes Virtuais",
    system: "Pagamentos",
    icon: CreditCard,
    year: 2024,
    records: 8956,
    totalAmount: 19782345.67,
    matched: 8421,
    unmatched: 535,
    status: "completed",
  },
  {
    name: "Cartoes Virtuais",
    system: "Pagamentos",
    icon: CreditCard,
    year: 2025,
    records: 7234,
    totalAmount: 15893241.89,
    matched: 6752,
    unmatched: 482,
    status: "in_progress",
  },
];

const DISCREPANCY_TYPES = [
  { type: "OBT vs Backoffice", count: 1743, amount: 2134567.89, severity: "high" },
  { type: "Backoffice vs Faturamento", count: 892, amount: 1456234.12, severity: "critical" },
  { type: "Cartao vs Reserva", count: 1017, amount: 987654.33, severity: "high" },
  { type: "BSP vs Companhia Aerea", count: 234, amount: 345678.90, severity: "medium" },
  { type: "Hotel vs Fatura", count: 156, amount: 234567.45, severity: "medium" },
  { type: "Fee/Rebate Divergente", count: 89, amount: 178234.56, severity: "low" },
];

const CREDIT_CARD_RECONCILIATION = [
  { cardType: "Visa Corporativo", transactions: 4521, reconciled: 4234, pending: 287, amount: 12345678.90 },
  { cardType: "Mastercard Virtual", transactions: 3892, reconciled: 3601, pending: 291, amount: 10234567.45 },
  { cardType: "Amex Corporativo", transactions: 2156, reconciled: 2023, pending: 133, amount: 8765432.10 },
  { cardType: "Diners Virtual", transactions: 1234, reconciled: 1178, pending: 56, amount: 4567890.12 },
];

const CHART_COLORS = [
  "hsl(210, 85%, 42%)",
  "hsl(0, 70%, 50%)",
  "hsl(45, 85%, 45%)",
  "hsl(195, 75%, 38%)",
  "hsl(225, 70%, 35%)",
  "hsl(130, 60%, 38%)",
];

export default function Reconciliation() {
  const totalOBTRecords = RECONCILIATION_SOURCES.filter((s) => s.system === "Online Booking Tool").reduce((sum, s) => sum + s.records, 0);
  const totalBackofficeRecords = RECONCILIATION_SOURCES.filter((s) => s.system === "Backoffice").reduce((sum, s) => sum + s.records, 0);
  const totalCardRecords = RECONCILIATION_SOURCES.filter((s) => s.system === "Pagamentos").reduce((sum, s) => sum + s.records, 0);
  const totalDiscrepancies = DISCREPANCY_TYPES.reduce((sum, d) => sum + d.count, 0);
  const totalDiscrepancyAmount = DISCREPANCY_TYPES.reduce((sum, d) => sum + d.amount, 0);

  const discrepancyChartData = DISCREPANCY_TYPES.map((d) => ({
    name: d.type,
    value: d.count,
  }));

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" data-testid="text-reconciliation-title">
          Reconciliacao de Dados
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cruzamento entre OBT, Backoffice, Faturamento e Cartoes de Credito Virtuais
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Registros OBT
                </p>
                <p className="text-2xl font-bold tracking-tight" data-testid="text-obt-records">
                  {totalOBTRecords.toLocaleString("pt-BR")}
                </p>
                <span className="text-xs text-muted-foreground">Reserve + Argo</span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
                <Monitor className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Registros Backoffice
                </p>
                <p className="text-2xl font-bold tracking-tight" data-testid="text-backoffice-records">
                  {totalBackofficeRecords.toLocaleString("pt-BR")}
                </p>
                <span className="text-xs text-muted-foreground">Wintour + Stur</span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
                <Database className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Transacoes Cartao
                </p>
                <p className="text-2xl font-bold tracking-tight" data-testid="text-card-records">
                  {totalCardRecords.toLocaleString("pt-BR")}
                </p>
                <span className="text-xs text-muted-foreground">cartoes virtuais</span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Divergencias
                </p>
                <p className="text-2xl font-bold tracking-tight text-destructive" data-testid="text-discrepancies">
                  {totalDiscrepancies.toLocaleString("pt-BR")}
                </p>
                <span className="text-xs text-muted-foreground">{formatCurrency(totalDiscrepancyAmount)}</span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-primary" />
            Fontes de Dados - Status de Reconciliacao
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {RECONCILIATION_SOURCES.map((source, i) => (
              <div
                key={`${source.name}-${source.year}`}
                className="flex items-center justify-between gap-4 p-4 rounded-md bg-background"
                data-testid={`reconciliation-source-${i}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/10 shrink-0">
                    <source.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{source.name}</p>
                      <Badge variant="outline" className="text-[10px]">{source.year}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {source.records.toLocaleString("pt-BR")} registros | {formatCurrency(source.totalAmount)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        {source.matched.toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-destructive" />
                      <span className="text-xs font-medium text-destructive">
                        {source.unmatched.toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={source.status === "completed" ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {source.status === "completed" ? "Concluido" : "Em Andamento"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileWarning className="w-4 h-4 text-primary" />
              Divergencias por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {DISCREPANCY_TYPES.map((disc, i) => (
                <div
                  key={disc.type}
                  className="flex items-center justify-between gap-3 p-3 rounded-md bg-background"
                  data-testid={`discrepancy-${i}`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{disc.type}</p>
                    <p className="text-xs text-muted-foreground">{disc.count.toLocaleString("pt-BR")} ocorrencias</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-sm font-semibold">{formatCurrency(disc.amount)}</p>
                    <Badge
                      variant={disc.severity === "critical" ? "destructive" : disc.severity === "high" ? "destructive" : "secondary"}
                      className="text-[10px]"
                    >
                      {disc.severity === "critical" ? "Critico" : disc.severity === "high" ? "Alto" : disc.severity === "medium" ? "Medio" : "Baixo"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Divergencias por Fonte</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={discrepancyChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <Tooltip
                  formatter={(value: number) => [value.toLocaleString("pt-BR"), "Divergencias"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {discrepancyChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Conciliacao de Cartoes de Credito Virtuais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {CREDIT_CARD_RECONCILIATION.map((card, i) => {
              const reconciledPct = ((card.reconciled / card.transactions) * 100).toFixed(1);
              return (
                <div
                  key={card.cardType}
                  className="p-4 rounded-md bg-background"
                  data-testid={`card-reconciliation-${i}`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium">{card.cardType}</p>
                    </div>
                    <p className="text-sm font-semibold">{formatCurrency(card.amount)}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Receipt className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {card.transactions.toLocaleString("pt-BR")} transacoes
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                      <span className="text-xs text-green-600 dark:text-green-400">
                        {card.reconciled.toLocaleString("pt-BR")} conciliados ({reconciledPct}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-xs text-yellow-600 dark:text-yellow-400">
                        {card.pending.toLocaleString("pt-BR")} pendentes
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-600 dark:bg-green-400"
                      style={{ width: `${reconciledPct}%` }}
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
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Documentacao e Acessos Necessarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "Contrato com Prestadores e Clientes",
              "Back office agencia",
              "Adm BSPLink, voeGol, voeAzul e demais cias integradas",
              "Portais adm redes hoteleiras, operadores e consolidadores",
              "Acordos corporativos (cias, hotelaria, banco)",
              "Sistema de OBTs e GDSs",
              "Controle de Reembolso e credito conciliados",
              "Relatorios gerenciais de pagamentos realizados e pendentes",
              "Relatorios gerenciais de receitas recebidas e pendentes",
              "Extratos originais dos Cartoes de Creditos utilizados",
              "Reservas originais e faturas de hospedagens pagas",
              "Relatorio de cobranca FEE, Rebate, Comissoes e Incentivos",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-md bg-background">
                <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <span className="text-xs text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

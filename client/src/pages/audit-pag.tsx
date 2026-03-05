import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShieldCheck, Plus, FileText, DollarSign, AlertTriangle, CheckCircle2,
  XCircle, Clock, TrendingUp, ArrowUpDown, Upload,
  Building2, User, MapPin, Calendar, CreditCard, FileBarChart, Eye,
  Landmark, ArrowRight, RefreshCw, Bell, BellRing, Settings, FileCheck,
  Copy, ToggleLeft, Info, AlertCircle, Shield, CreditCard as CardIcon, Wrench,
} from "lucide-react";
import AuditPagConfigPanel from "./audit-pag-config";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area, Legend,
} from "recharts";

const CONFORMITY_COLORS: Record<string, string> = {
  conformant: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  non_conformant: "bg-red-500/20 text-red-400 border-red-500/30",
  pending_review: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-500/20 text-slate-400",
  under_review: "bg-blue-500/20 text-blue-400",
  conformant: "bg-emerald-500/20 text-emerald-400",
  non_conformant: "bg-red-500/20 text-red-400",
  approved: "bg-green-500/20 text-green-300",
  rejected: "bg-red-600/20 text-red-300",
};

const BANK_MATCH_COLORS: Record<string, string> = {
  pending: "bg-slate-500/20 text-slate-400",
  matched: "bg-emerald-500/20 text-emerald-400",
  unmatched: "bg-red-500/20 text-red-400",
  partial: "bg-amber-500/20 text-amber-400",
};

const PAYMENT_LABELS: Record<string, string> = {
  faturado: "Faturado",
  pix: "Pix",
  cartao_corporativo: "Cartão Corporativo",
  cartao_credito: "Cartão de Crédito",
  boleto: "Boleto",
};

const PIE_COLORS = ["#10b981", "#ef4444", "#f59e0b", "#6366f1", "#8b5cf6"];

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  under_review: "Em Análise",
  conformant: "Conforme",
  non_conformant: "Não Conforme",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

const CONFORMITY_LABELS: Record<string, string> = {
  conformant: "Conforme",
  non_conformant: "Não Conforme",
  pending_review: "Pendente",
};

const BANK_LABELS: Record<string, string> = {
  pending: "Pendente",
  matched: "Conciliado",
  unmatched: "Divergente",
  partial: "Parcial",
};

const ALERT_TYPE_LABELS: Record<string, string> = {
  discrepancy: "Discrepância",
  anomaly: "Anomalia",
  policy_violation: "Violação de Política",
  high_value: "Alto Valor",
  bank_mismatch: "Divergência Bancária",
};

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-blue-500/20 text-blue-400",
  medium: "bg-amber-500/20 text-amber-400",
  high: "bg-red-500/20 text-red-400",
  critical: "bg-red-600/30 text-red-300 animate-pulse",
};

const CATEGORY_LABELS: Record<string, string> = {
  approval_flow: "Fluxo de Aprovação",
  booking_rules: "Regras de Reserva",
  payment_limits: "Limites de Pagamento",
  supplier_selection: "Seleção de Fornecedores",
  expense_caps: "Tetos de Despesa",
  documentation: "Documentação",
  compliance: "Compliance",
  sla: "SLA",
};

const FLAG_COLORS: Record<string, string> = {
  info: "bg-blue-500/20 text-blue-400",
  warning: "bg-amber-500/20 text-amber-400",
  critical: "bg-red-500/20 text-red-400",
};

export default function AuditPag() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newCaseOpen, setNewCaseOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [findingOpen, setFindingOpen] = useState(false);
  const [bankMatchOpen, setBankMatchOpen] = useState(false);
  const [alertConfigOpen, setAlertConfigOpen] = useState(false);

  const dashboardQuery = useQuery({ queryKey: ["/api/audit-pag/dashboard"] });
  const casesQuery = useQuery({ queryKey: ["/api/audit-pag/cases"] });
  const monitoringQuery = useQuery({ queryKey: ["/api/audit-pag/monitoring"] });
  const alertsQuery = useQuery({ queryKey: ["/api/audit-pag/alerts"] });
  const policiesQuery = useQuery({ queryKey: ["/api/audit-pag/policies"] });

  const createCaseMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/audit-pag/cases", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/cases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/dashboard"] });
      setNewCaseOpen(false);
      toast({ title: "Caso criado com sucesso" });
    },
    onError: (err: any) => toast({ title: "Erro ao criar caso", description: err.message, variant: "destructive" }),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PUT", `/api/audit-pag/cases/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/cases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/alerts"] });
      toast({ title: "Status atualizado" });
    },
    onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  const findingMutation = useMutation({
    mutationFn: async ({ id, finding }: { id: string; finding: any }) => {
      const res = await apiRequest("POST", `/api/audit-pag/cases/${id}/findings`, finding);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/cases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/alerts"] });
      setSelectedCase(data);
      setFindingOpen(false);
      toast({ title: "Achado registrado" });
    },
    onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  const bankMatchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("POST", `/api/audit-pag/cases/${id}/bank-match`, data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/cases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/alerts"] });
      setSelectedCase(data);
      setBankMatchOpen(false);
      toast({ title: "Conciliação bancária atualizada" });
    },
    onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  const alertReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PUT", `/api/audit-pag/alerts/${id}/read`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/dashboard"] });
    },
  });

  const alertDismissMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PUT", `/api/audit-pag/alerts/${id}/dismiss`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/dashboard"] });
    },
  });

  const dashboard = dashboardQuery.data as any;
  const cases = (casesQuery.data as any[]) || [];
  const monitoring = (monitoringQuery.data as any[]) || [];
  const alerts = (alertsQuery.data as any[]) || [];
  const policies = (policiesQuery.data as any[]) || [];

  const filteredCases = statusFilter === "all" ? cases : cases.filter((c: any) => c.status === statusFilter);
  const unreadAlertCount = alerts.filter((a: any) => a.status === "pending" || a.status === "sent").length;

  const formatBRL = (val: string | number | null | undefined) => {
    if (!val) return "R$ 0,00";
    return `R$ ${parseFloat(String(val)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="p-6 space-y-6" data-testid="audit-pag-page">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">AuditPag</h1>
            <p className="text-sm text-muted-foreground">Auditoria Pré-Aprovação de Pagamentos</p>
          </div>
          {unreadAlertCount > 0 && (
            <Badge variant="destructive" className="ml-2 animate-pulse" data-testid="badge-unread-alerts">
              <BellRing className="w-3 h-3 mr-1" />
              {unreadAlertCount} alerta{unreadAlertCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setAlertConfigOpen(true)} data-testid="button-alert-config">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
          <Button onClick={() => setNewCaseOpen(true)} data-testid="button-new-case">
            <Plus className="w-4 h-4 mr-2" />
            Novo Caso
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-audit-pag">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="cases" data-testid="tab-cases">Casos</TabsTrigger>
          <TabsTrigger value="policies" data-testid="tab-policies">
            <FileCheck className="w-4 h-4 mr-1" />
            Políticas
          </TabsTrigger>
          <TabsTrigger value="alerts" data-testid="tab-alerts" className="relative">
            <Bell className="w-4 h-4 mr-1" />
            Alertas
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {unreadAlertCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="monitoring" data-testid="tab-monitoring">Monitoramento</TabsTrigger>
          <TabsTrigger value="config" data-testid="tab-config">
            <Wrench className="w-4 h-4 mr-1" />
            Integrações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {dashboardQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28" />)}
            </div>
          ) : dashboard ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card data-testid="kpi-total-cases">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <FileBarChart className="w-4 h-4" />
                      Total de Casos
                    </div>
                    <p className="text-2xl font-bold">{dashboard.total}</p>
                  </CardContent>
                </Card>
                <Card data-testid="kpi-conformant">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Conformes
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">{dashboard.conformantPercent}%</p>
                    <p className="text-xs text-muted-foreground">{dashboard.conformant} casos</p>
                  </CardContent>
                </Card>
                <Card data-testid="kpi-non-conformant">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-red-400 text-xs mb-1">
                      <XCircle className="w-4 h-4" />
                      Não Conformes
                    </div>
                    <p className="text-2xl font-bold text-red-400">{dashboard.nonConformantPercent}%</p>
                    <p className="text-xs text-muted-foreground">{dashboard.nonConformant} casos</p>
                  </CardContent>
                </Card>
                <Card data-testid="kpi-pending">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-amber-400 text-xs mb-1">
                      <Clock className="w-4 h-4" />
                      Pendentes
                    </div>
                    <p className="text-2xl font-bold text-amber-400">{dashboard.pendingReview}</p>
                  </CardContent>
                </Card>
                <Card data-testid="kpi-total-audited">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                      <DollarSign className="w-4 h-4" />
                      Total Auditado
                    </div>
                    <p className="text-2xl font-bold">{formatBRL(dashboard.totalAudited)}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Conformidade por Meio de Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(dashboard.conformityByPayment || {}).length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={Object.entries(dashboard.conformityByPayment).map(([key, val]: any) => ({
                              name: PAYMENT_LABELS[key] || key,
                              value: val.conformant + val.nonConformant + val.pending,
                            }))}
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {Object.entries(dashboard.conformityByPayment).map((_: any, i: number) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                        Aguardando dados
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Distribuição por Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(dashboard.byStatus || {}).length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={Object.entries(dashboard.byStatus).map(([key, val]) => ({
                          name: STATUS_LABELS[key] || key,
                          count: val as number,
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="name" fontSize={11} tick={{ fill: "#999" }} />
                          <YAxis fontSize={11} tick={{ fill: "#999" }} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                        Aguardando dados
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-12">Aguardando dados</div>
          )}
        </TabsContent>

        <TabsContent value="cases" className="space-y-4">
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="select-status-filter">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="under_review">Em Análise</SelectItem>
                <SelectItem value="conformant">Conforme</SelectItem>
                <SelectItem value="non_conformant">Não Conforme</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">{filteredCases.length} caso(s)</span>
          </div>

          {casesQuery.isLoading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
          ) : filteredCases.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <ShieldCheck className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm">Nenhum caso de auditoria encontrado</p>
                <Button variant="outline" className="mt-4" onClick={() => setNewCaseOpen(true)} data-testid="button-new-case-empty">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeiro caso
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredCases.map((c: any) => (
                <Card
                  key={c.id}
                  className="cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => { setSelectedCase(c); setDetailOpen(true); }}
                  data-testid={`case-card-${c.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{c.requesterName || "Sem solicitante"}</span>
                            <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[c.status] || ""}`}>
                              {STATUS_LABELS[c.status] || c.status}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {c.profileType === "agency" ? "Agência" : "Corporativo"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {c.destination && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />{c.destination}
                              </span>
                            )}
                            {c.supplierName && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />{c.supplierName}
                              </span>
                            )}
                            {c.paymentMethod && (
                              <span className="flex items-center gap-1">
                                <CreditCard className="w-3 h-3" />{PAYMENT_LABELS[c.paymentMethod] || c.paymentMethod}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-sm">{formatBRL(c.requestedAmount)}</p>
                          <Badge variant="outline" className={`text-[10px] ${CONFORMITY_COLORS[c.conformityStatus] || ""}`}>
                            {CONFORMITY_LABELS[c.conformityStatus] || c.conformityStatus}
                          </Badge>
                        </div>
                        <Badge variant="outline" className={`text-[10px] ${BANK_MATCH_COLORS[c.bankStatementMatch] || ""}`}>
                          {BANK_LABELS[c.bankStatementMatch] || c.bankStatementMatch}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <PoliciesTab policies={policies} toast={toast} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <AlertsTab
            alerts={alerts}
            onRead={(id: string) => alertReadMutation.mutate(id)}
            onDismiss={(id: string) => alertDismissMutation.mutate(id)}
            formatBRL={formatBRL}
          />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          {user?.role !== "client" && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await apiRequest("POST", "/api/audit-pag/monitoring/refresh");
                    queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/monitoring"] });
                    toast({ title: "Monitoramento atualizado" });
                  } catch { toast({ title: "Erro ao atualizar", variant: "destructive" }); }
                }}
                data-testid="button-refresh-monitoring"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          )}

          {monitoringQuery.isLoading ? (
            <Skeleton className="h-64" />
          ) : monitoring.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <ArrowUpDown className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm">Nenhum registro de monitoramento</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Fluxo Diário — Entradas e Saídas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monitoring.slice().reverse().map((m: any) => ({
                      date: new Date(m.monitorDate).toLocaleDateString("pt-BR"),
                      entradas: parseFloat(m.totalInflows || "0"),
                      saidas: parseFloat(m.totalOutflows || "0"),
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" fontSize={11} tick={{ fill: "#999" }} />
                      <YAxis fontSize={11} tick={{ fill: "#999" }} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="entradas" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="saidas" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {monitoring.slice(0, 7).map((m: any, i: number) => (
                  <Card key={m.id || i} data-testid={`monitoring-card-${i}`}>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-2">
                        {new Date(m.monitorDate).toLocaleDateString("pt-BR")}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-emerald-400">Entradas</span>
                          <p className="font-medium">{formatBRL(m.totalInflows)}</p>
                        </div>
                        <div>
                          <span className="text-red-400">Saídas</span>
                          <p className="font-medium">{formatBRL(m.totalOutflows)}</p>
                        </div>
                        <div>
                          <span className="text-blue-400">Conciliados</span>
                          <p className="font-medium">{m.matchedCount}</p>
                        </div>
                        <div>
                          <span className="text-amber-400">Divergentes</span>
                          <p className="font-medium">{m.unmatchedCount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <AuditPagConfigPanel toast={toast} />
        </TabsContent>
      </Tabs>

      <NewCaseDialog open={newCaseOpen} onOpenChange={setNewCaseOpen} onSubmit={(data: any) => createCaseMutation.mutate(data)} isPending={createCaseMutation.isPending} />

      <CaseDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        caseData={selectedCase}
        onStatusChange={(id: string, status: string) => statusMutation.mutate({ id, status })}
        onAddFinding={(id: string, finding: any) => findingMutation.mutate({ id, finding })}
        onBankMatch={(id: string, data: any) => bankMatchMutation.mutate({ id, data })}
        findingOpen={findingOpen}
        setFindingOpen={setFindingOpen}
        bankMatchOpen={bankMatchOpen}
        setBankMatchOpen={setBankMatchOpen}
        userRole={user?.role || ""}
        formatBRL={formatBRL}
      />

      <AlertConfigDialog open={alertConfigOpen} onOpenChange={setAlertConfigOpen} toast={toast} />
    </div>
  );
}

function PoliciesTab({ policies, toast }: any) {
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);

  const policyItemsQuery = useQuery({
    queryKey: ["/api/audit-pag/policies", selectedPolicy?.id, "items"],
    queryFn: async () => {
      if (!selectedPolicy) return [];
      const res = await fetch(`/api/audit-pag/policies/${selectedPolicy.id}/items`);
      return res.json();
    },
    enabled: !!selectedPolicy,
  });

  const cloneMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const res = await apiRequest("POST", "/api/audit-pag/policies", {
        name: "Política Customizada — " + new Date().toLocaleDateString("pt-BR"),
        policyType: "travel_purchase",
        cloneFromTemplateId: templateId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/policies"] });
      toast({ title: "Política clonada com sucesso" });
    },
    onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  const toggleItemMutation = useMutation({
    mutationFn: async ({ policyId, itemId, isEnabled }: { policyId: string; itemId: string; isEnabled: boolean }) => {
      const res = await apiRequest("PUT", `/api/audit-pag/policies/${policyId}/items/${itemId}`, { isEnabled });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/policies", selectedPolicy?.id, "items"] });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/audit-pag/policies/upload", {
        method: "POST",
        body: formData,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/policies"] });
      toast({ title: "Política carregada com sucesso" });
    },
    onError: (err: any) => toast({ title: "Erro ao enviar", description: err.message, variant: "destructive" }),
  });

  const items = (policyItemsQuery.data as any[]) || [];
  const groupedItems = items.reduce((acc: Record<string, any[]>, item: any) => {
    const cat = item.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Políticas de compra, pagamento e compliance. Use modelos prontos ou envie sua própria política.
        </p>
        <label className="cursor-pointer" data-testid="button-upload-policy">
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.xlsx,.txt"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const fd = new FormData();
                fd.append("file", file);
                fd.append("name", file.name);
                uploadMutation.mutate(fd);
              }
            }}
          />
          <Button variant="outline" size="sm" asChild>
            <span><Upload className="w-4 h-4 mr-2" />Enviar Política</span>
          </Button>
        </label>
      </div>

      {policies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <FileCheck className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm">Nenhuma política configurada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((p: any) => (
            <Card key={p.id} className="hover:border-primary/30 transition-colors" data-testid={`policy-card-${p.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileCheck className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px]">
                        {p.isTemplate ? "Modelo" : "Customizada"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {p.policyType === "custom" ? "Upload" : p.policyType}
                      </Badge>
                      {p.uploadedFileName && (
                        <Badge variant="outline" className="text-[10px] text-blue-400">
                          {p.uploadedFileName}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {p.isTemplate && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cloneMutation.mutate(p.id)}
                        disabled={cloneMutation.isPending}
                        data-testid={`button-clone-${p.id}`}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Aplicar Modelo
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setSelectedPolicy(p); setItemsDialogOpen(true); }}
                      data-testid={`button-view-items-${p.id}`}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Itens
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={itemsDialogOpen} onOpenChange={setItemsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              {selectedPolicy?.name || "Checklist da Política"}
            </DialogTitle>
          </DialogHeader>

          {policyItemsQuery.isLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Nenhum item de checklist</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([category, catItems]: [string, any[]]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    {CATEGORY_LABELS[category] || category}
                  </h3>
                  <div className="space-y-2">
                    {catItems.map((item: any) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${item.isEnabled ? "bg-muted/20" : "bg-muted/5 opacity-60"}`}
                        data-testid={`policy-item-${item.id}`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Switch
                            checked={item.isEnabled}
                            onCheckedChange={(checked) => {
                              if (!selectedPolicy?.isTemplate) {
                                toggleItemMutation.mutate({ policyId: selectedPolicy.id, itemId: item.id, isEnabled: checked });
                              }
                            }}
                            disabled={selectedPolicy?.isTemplate}
                            data-testid={`toggle-item-${item.id}`}
                          />
                          <div className="flex-1">
                            <p className="text-sm">{item.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {item.isMandatory && (
                                <Badge variant="outline" className="text-[9px] bg-red-500/10 text-red-400">
                                  Obrigatório
                                </Badge>
                              )}
                              <Badge variant="outline" className={`text-[9px] ${FLAG_COLORS[item.flagLevel] || ""}`}>
                                {item.flagLevel === "info" ? "Info" : item.flagLevel === "warning" ? "Alerta" : "Crítico"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AlertsTab({ alerts, onRead, onDismiss, formatBRL }: any) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Bell className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-sm">Nenhum alerta registrado</p>
          <p className="text-xs mt-2">Alertas são gerados automaticamente quando discrepâncias ou anomalias são detectadas.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((a: any) => (
        <Card
          key={a.id}
          className={`transition-colors ${a.status === "pending" || a.status === "sent" ? "border-l-4 border-l-red-500" : "opacity-70"}`}
          data-testid={`alert-card-${a.id}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={`text-[10px] ${SEVERITY_COLORS[a.severity] || ""}`}>
                    {a.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {ALERT_TYPE_LABELS[a.alertType] || a.alertType}
                  </Badge>
                  {a.status === "read" && (
                    <Badge variant="outline" className="text-[10px] bg-slate-500/20 text-slate-400">Lido</Badge>
                  )}
                  {a.status === "dismissed" && (
                    <Badge variant="outline" className="text-[10px] bg-slate-500/20 text-slate-400">Dispensado</Badge>
                  )}
                </div>
                <h4 className="font-medium text-sm">{a.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  {a.financialAmount && (
                    <span className="font-medium text-amber-400">{formatBRL(a.financialAmount)}</span>
                  )}
                  <span>{new Date(a.createdAt).toLocaleString("pt-BR")}</span>
                  {a.channel !== "platform" && (
                    <Badge variant="outline" className="text-[9px]">{a.channel}</Badge>
                  )}
                </div>
              </div>
              {(a.status === "pending" || a.status === "sent") && (
                <div className="flex gap-1 ml-2">
                  <Button variant="ghost" size="sm" onClick={() => onRead(a.id)} data-testid={`button-read-alert-${a.id}`}>
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDismiss(a.id)} data-testid={`button-dismiss-alert-${a.id}`}>
                    <XCircle className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AlertConfigDialog({ open, onOpenChange, toast }: any) {
  const { user } = useAuth();
  const configQuery = useQuery({ queryKey: ["/api/audit-pag/alert-config"] });
  const config = configQuery.data as any;

  const [form, setForm] = useState<any>({
    enablePlatformAlerts: true,
    enableEmailAlerts: true,
    enableSmsAlerts: false,
    emailRecipients: "",
    smsRecipients: "",
    highValueThreshold: "10000",
    criticalValueThreshold: "50000",
    alertOnDiscrepancy: true,
    alertOnPolicyViolation: true,
    alertOnBankMismatch: true,
    dataSourcePreference: "both",
  });

  const loaded = config !== undefined;
  if (loaded && config && !form._loaded) {
    setForm({
      enablePlatformAlerts: config.enablePlatformAlerts ?? true,
      enableEmailAlerts: config.enableEmailAlerts ?? true,
      enableSmsAlerts: config.enableSmsAlerts ?? false,
      emailRecipients: config.emailRecipients || "",
      smsRecipients: config.smsRecipients || "",
      highValueThreshold: config.highValueThreshold || "10000",
      criticalValueThreshold: config.criticalValueThreshold || "50000",
      alertOnDiscrepancy: config.alertOnDiscrepancy ?? true,
      alertOnPolicyViolation: config.alertOnPolicyViolation ?? true,
      alertOnBankMismatch: config.alertOnBankMismatch ?? true,
      dataSourcePreference: config.dataSourcePreference || "both",
      _loaded: true,
    });
  }

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", "/api/audit-pag/alert-config", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/alert-config"] });
      toast({ title: "Configurações salvas" });
      onOpenChange(false);
    },
    onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações de Alertas e Dados
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-3">Canais de Alerta</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Alertas na Plataforma</Label>
                <Switch checked={form.enablePlatformAlerts} onCheckedChange={(v) => setForm((p: any) => ({ ...p, enablePlatformAlerts: v }))} data-testid="toggle-platform-alerts" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Alertas por E-mail</Label>
                <Switch checked={form.enableEmailAlerts} onCheckedChange={(v) => setForm((p: any) => ({ ...p, enableEmailAlerts: v }))} data-testid="toggle-email-alerts" />
              </div>
              {form.enableEmailAlerts && (
                <div>
                  <Label className="text-xs">Destinatários (separados por vírgula)</Label>
                  <Input
                    value={form.emailRecipients}
                    onChange={(e) => setForm((p: any) => ({ ...p, emailRecipients: e.target.value }))}
                    placeholder="email1@empresa.com, email2@empresa.com"
                    data-testid="input-email-recipients"
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label className="text-sm">Alertas por SMS/Celular</Label>
                <Switch checked={form.enableSmsAlerts} onCheckedChange={(v) => setForm((p: any) => ({ ...p, enableSmsAlerts: v }))} data-testid="toggle-sms-alerts" />
              </div>
              {form.enableSmsAlerts && (
                <div>
                  <Label className="text-xs">Números (separados por vírgula)</Label>
                  <Input
                    value={form.smsRecipients}
                    onChange={(e) => setForm((p: any) => ({ ...p, smsRecipients: e.target.value }))}
                    placeholder="+55 11 99999-9999"
                    data-testid="input-sms-recipients"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Limites Financeiros</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Valor Alto (R$)</Label>
                <Input
                  type="number"
                  value={form.highValueThreshold}
                  onChange={(e) => setForm((p: any) => ({ ...p, highValueThreshold: e.target.value }))}
                  data-testid="input-high-threshold"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Acima deste valor: alerta de severidade alta</p>
              </div>
              <div>
                <Label className="text-xs">Valor Crítico (R$)</Label>
                <Input
                  type="number"
                  value={form.criticalValueThreshold}
                  onChange={(e) => setForm((p: any) => ({ ...p, criticalValueThreshold: e.target.value }))}
                  data-testid="input-critical-threshold"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Acima deste valor: alerta crítico imediato</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Tipos de Alerta</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Discrepâncias de valor</Label>
                <Switch checked={form.alertOnDiscrepancy} onCheckedChange={(v) => setForm((p: any) => ({ ...p, alertOnDiscrepancy: v }))} data-testid="toggle-alert-discrepancy" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Violações de política</Label>
                <Switch checked={form.alertOnPolicyViolation} onCheckedChange={(v) => setForm((p: any) => ({ ...p, alertOnPolicyViolation: v }))} data-testid="toggle-alert-policy" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Divergência bancária</Label>
                <Switch checked={form.alertOnBankMismatch} onCheckedChange={(v) => setForm((p: any) => ({ ...p, alertOnBankMismatch: v }))} data-testid="toggle-alert-bank" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Fonte de Dados — Extrato Bancário</h3>
            <Select value={form.dataSourcePreference} onValueChange={(v) => setForm((p: any) => ({ ...p, dataSourcePreference: v }))}>
              <SelectTrigger data-testid="select-data-source">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="api">Via API (automático)</SelectItem>
                <SelectItem value="upload">Via Upload de Arquivo</SelectItem>
                <SelectItem value="both">Ambos (API + Upload)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground mt-1">
              Configure como o extrato bancário será consumido: integração via API bancária, upload manual de arquivo, ou ambos.
            </p>
          </div>

          <Button
            className="w-full"
            onClick={() => {
              const { _loaded, ...data } = form;
              saveMutation.mutate(data);
            }}
            disabled={saveMutation.isPending}
            data-testid="button-save-config"
          >
            {saveMutation.isPending ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NewCaseDialog({ open, onOpenChange, onSubmit, isPending }: any) {
  const [profileType, setProfileType] = useState<"agency" | "corporate">("agency");
  const [form, setForm] = useState<any>({});

  const handleSubmit = () => {
    onSubmit({
      profileType,
      ...form,
      travelDate: form.travelDate || undefined,
      returnDate: form.returnDate || undefined,
      invoiceDueDate: form.invoiceDueDate || undefined,
    });
  };

  const updateField = (field: string, value: any) => setForm((prev: any) => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Novo Caso — AuditPag
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Perfil do Cliente</Label>
            <div className="flex gap-3">
              <Button
                variant={profileType === "agency" ? "default" : "outline"}
                size="sm"
                onClick={() => setProfileType("agency")}
                data-testid="button-profile-agency"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Agência
              </Button>
              <Button
                variant={profileType === "corporate" ? "default" : "outline"}
                size="sm"
                onClick={() => setProfileType("corporate")}
                data-testid="button-profile-corporate"
              >
                <Landmark className="w-4 h-4 mr-2" />
                Corporativo
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <User className="w-4 h-4" /> Solicitação
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Solicitante</Label>
                <Input placeholder="Nome do solicitante" onChange={(e) => updateField("requesterName", e.target.value)} data-testid="input-requester-name" />
              </div>
              <div>
                <Label className="text-xs">Departamento</Label>
                <Input placeholder="Departamento" onChange={(e) => updateField("requesterDepartment", e.target.value)} data-testid="input-requester-dept" />
              </div>
              <div>
                <Label className="text-xs">Destino</Label>
                <Input placeholder="Cidade/País" onChange={(e) => updateField("destination", e.target.value)} data-testid="input-destination" />
              </div>
              <div>
                <Label className="text-xs">Data Embarque</Label>
                <Input type="date" onChange={(e) => updateField("travelDate", e.target.value)} data-testid="input-travel-date" />
              </div>
              <div>
                <Label className="text-xs">Data Retorno</Label>
                <Input type="date" onChange={(e) => updateField("returnDate", e.target.value)} data-testid="input-return-date" />
              </div>
              {profileType === "corporate" && (
                <div>
                  <Label className="text-xs">Ref. Aprovação</Label>
                  <Input placeholder="Nº da aprovação interna" onChange={(e) => updateField("approvalReference", e.target.value)} data-testid="input-approval-reference" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4" /> Reserva e Fornecedor
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Fornecedor</Label>
                <Input placeholder="Nome do fornecedor" onChange={(e) => updateField("supplierName", e.target.value)} data-testid="input-supplier-name" />
              </div>
              <div>
                <Label className="text-xs">Código Reserva</Label>
                <Input placeholder="PNR / Confirmação" onChange={(e) => updateField("reservationCode", e.target.value)} data-testid="input-reservation-code" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Confirmação do Fornecedor</Label>
                <Input placeholder="Referência de confirmação" onChange={(e) => updateField("supplierConfirmation", e.target.value)} data-testid="input-supplier-confirmation" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Financeiro
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Meio de Pagamento</Label>
                <Select onValueChange={(v) => updateField("paymentMethod", v)}>
                  <SelectTrigger data-testid="select-payment-method">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="faturado">Faturado</SelectItem>
                    <SelectItem value="pix">Pix</SelectItem>
                    <SelectItem value="cartao_corporativo">Cartão Corporativo</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Valor Solicitado (R$)</Label>
                <Input type="number" step="0.01" placeholder="0.00" onChange={(e) => updateField("requestedAmount", e.target.value)} data-testid="input-requested-amount" />
              </div>
              <div>
                <Label className="text-xs">Valor Faturado (R$)</Label>
                <Input type="number" step="0.01" placeholder="0.00" onChange={(e) => updateField("invoicedAmount", e.target.value)} data-testid="input-invoiced-amount" />
              </div>
              <div>
                <Label className="text-xs">Valor Fornecedor (R$)</Label>
                <Input type="number" step="0.01" placeholder="0.00" onChange={(e) => updateField("supplierPayAmount", e.target.value)} data-testid="input-supplier-pay-amount" />
              </div>
              <div>
                <Label className="text-xs">Nº Fatura</Label>
                <Input placeholder="Número da fatura" onChange={(e) => updateField("invoiceNumber", e.target.value)} data-testid="input-invoice-number" />
              </div>
              <div>
                <Label className="text-xs">Vencimento</Label>
                <Input type="date" onChange={(e) => updateField("invoiceDueDate", e.target.value)} data-testid="input-invoice-due-date" />
              </div>
            </div>
          </div>

          {profileType === "corporate" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <CardIcon className="w-4 h-4" /> Fatura da Agência vs Extrato Cartão Corporativo
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Ref. Extrato Cartão</Label>
                  <Input placeholder="Referência no extrato" onChange={(e) => updateField("cardStatementRef", e.target.value)} data-testid="input-card-statement-ref" />
                </div>
                <div>
                  <Label className="text-xs">Últimos 4 dígitos do Cartão</Label>
                  <Input placeholder="0000" maxLength={4} onChange={(e) => updateField("cardLastFour", e.target.value)} data-testid="input-card-last-four" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Ref. NF da Agência</Label>
                  <Input placeholder="Referência da nota fiscal da agência" onChange={(e) => updateField("agencyInvoiceRef", e.target.value)} data-testid="input-agency-invoice-ref-corp" />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    onChange={(e) => updateField("hasCorporateAgreement", e.target.checked)}
                    data-testid="checkbox-corporate-agreement"
                  />
                  <Label className="text-xs">Acordo Corporativo vigente</Label>
                </div>
              </div>
            </div>
          )}

          {profileType === "agency" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Acordos e Comissões
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    onChange={(e) => updateField("hasCorporateAgreement", e.target.checked)}
                    data-testid="checkbox-corporate-agreement"
                  />
                  <Label className="text-xs">Acordo Corporativo</Label>
                </div>
                <div>
                  <Label className="text-xs">Comissão (%)</Label>
                  <Input type="number" step="0.01" placeholder="0.00" onChange={(e) => updateField("commissionPercent", e.target.value)} data-testid="input-commission-percent" />
                </div>
                <div>
                  <Label className="text-xs">Valor Comissão (R$)</Label>
                  <Input type="number" step="0.01" placeholder="0.00" onChange={(e) => updateField("commissionAmount", e.target.value)} data-testid="input-commission-amount" />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    onChange={(e) => updateField("hasIncentive", e.target.checked)}
                    data-testid="checkbox-incentive"
                  />
                  <Label className="text-xs">Incentivo do Fornecedor</Label>
                </div>
                <div>
                  <Label className="text-xs">Valor Incentivo (R$)</Label>
                  <Input type="number" step="0.01" placeholder="0.00" onChange={(e) => updateField("incentiveAmount", e.target.value)} data-testid="input-incentive-amount" />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    onChange={(e) => updateField("hasRebate", e.target.checked)}
                    data-testid="checkbox-rebate"
                  />
                  <Label className="text-xs">Rebate/Repasse</Label>
                </div>
                <div>
                  <Label className="text-xs">Valor Rebate (R$)</Label>
                  <Input type="number" step="0.01" placeholder="0.00" onChange={(e) => updateField("rebateAmount", e.target.value)} data-testid="input-rebate-amount" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">NF da Agência</Label>
                  <Input placeholder="Referência NF" onChange={(e) => updateField("agencyInvoiceRef", e.target.value)} data-testid="input-agency-invoice-ref" />
                </div>
              </div>
            </div>
          )}

          <Button onClick={handleSubmit} disabled={isPending} className="w-full" data-testid="button-submit-case">
            {isPending ? "Criando..." : "Criar Caso de Auditoria"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CaseDetailDialog({
  open, onOpenChange, caseData, onStatusChange, onAddFinding, onBankMatch,
  findingOpen, setFindingOpen, bankMatchOpen, setBankMatchOpen, userRole, formatBRL,
}: any) {
  const [findingForm, setFindingForm] = useState({ type: "", description: "", severity: "medium" });
  const [bankForm, setBankForm] = useState({ bankStatementMatch: "", bankMatchAmount: "", bankMatchDate: "" });

  if (!caseData) return null;

  const findings = (caseData.findings as any[]) || [];
  const nextStatuses = {
    draft: [{ value: "under_review", label: "Enviar para Análise" }],
    under_review: [
      { value: "conformant", label: "Marcar Conforme" },
      { value: "non_conformant", label: "Marcar Não Conforme" },
    ],
    conformant: [{ value: "approved", label: "Aprovar" }],
    non_conformant: [
      { value: "rejected", label: "Rejeitar" },
      { value: "under_review", label: "Reabrir Análise" },
    ],
    rejected: [{ value: "under_review", label: "Reabrir Análise" }],
    approved: [],
  } as Record<string, { value: string; label: string }[]>;

  const availableTransitions = nextStatuses[caseData.status] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Detalhe do Caso
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`${STATUS_COLORS[caseData.status] || ""}`} data-testid="badge-status">
              {STATUS_LABELS[caseData.status] || caseData.status}
            </Badge>
            <Badge variant="outline" className={`${CONFORMITY_COLORS[caseData.conformityStatus] || ""}`} data-testid="badge-conformity">
              {CONFORMITY_LABELS[caseData.conformityStatus] || caseData.conformityStatus}
            </Badge>
            <Badge variant="outline" className={`${BANK_MATCH_COLORS[caseData.bankStatementMatch] || ""}`} data-testid="badge-bank-match">
              Banco: {BANK_LABELS[caseData.bankStatementMatch] || caseData.bankStatementMatch}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {caseData.profileType === "agency" ? "Agência" : "Corporativo"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-muted-foreground">Solicitante</span>
              <p className="font-medium">{caseData.requesterName || "—"}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Departamento</span>
              <p className="font-medium">{caseData.requesterDepartment || "—"}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Destino</span>
              <p className="font-medium">{caseData.destination || "—"}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Fornecedor</span>
              <p className="font-medium">{caseData.supplierName || "—"}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Código Reserva</span>
              <p className="font-medium">{caseData.reservationCode || "—"}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Meio de Pagamento</span>
              <p className="font-medium">{PAYMENT_LABELS[caseData.paymentMethod] || caseData.paymentMethod || "—"}</p>
            </div>
            {caseData.profileType === "corporate" && caseData.approvalReference && (
              <div>
                <span className="text-xs text-muted-foreground">Ref. Aprovação</span>
                <p className="font-medium">{caseData.approvalReference}</p>
              </div>
            )}
            <div>
              <span className="text-xs text-muted-foreground">Data Embarque</span>
              <p className="font-medium">{caseData.travelDate ? new Date(caseData.travelDate).toLocaleDateString("pt-BR") : "—"}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground">Valor Solicitado</span>
                <p className="font-bold text-sm">{formatBRL(caseData.requestedAmount)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground">Valor Faturado</span>
                <p className="font-bold text-sm">{formatBRL(caseData.invoicedAmount)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <span className="text-xs text-muted-foreground">Valor Fornecedor</span>
                <p className="font-bold text-sm">{formatBRL(caseData.supplierPayAmount)}</p>
              </CardContent>
            </Card>
          </div>

          {caseData.profileType === "corporate" && (caseData.cardStatementRef || caseData.cardLastFour) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Fatura Agência vs Extrato Cartão</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Ref. Extrato Cartão</span>
                  <p>{caseData.cardStatementRef || "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Cartão (últimos 4)</span>
                  <p>{caseData.cardLastFour ? `****${caseData.cardLastFour}` : "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Acordo Corporativo</span>
                  <p>{caseData.hasCorporateAgreement ? "Sim" : "Não"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">NF Agência</span>
                  <p>{caseData.agencyInvoiceRef || "—"}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {caseData.profileType === "agency" && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Acordos e Comissões</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Acordo Corporativo</span>
                  <p>{caseData.hasCorporateAgreement ? "Sim" : "Não"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Comissão</span>
                  <p>{caseData.commissionPercent ? `${caseData.commissionPercent}% — ${formatBRL(caseData.commissionAmount)}` : "—"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Incentivo</span>
                  <p>{caseData.hasIncentive ? formatBRL(caseData.incentiveAmount) : "Não"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Rebate</span>
                  <p>{caseData.hasRebate ? formatBRL(caseData.rebateAmount) : "Não"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">NF Agência</span>
                  <p>{caseData.agencyInvoiceRef || "—"}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Achados ({findings.length})</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setFindingOpen(true)} data-testid="button-add-finding">
                <Plus className="w-3 h-3 mr-1" /> Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              {findings.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhum achado registrado</p>
              ) : (
                <div className="space-y-2">
                  {findings.map((f: any, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-muted/30 text-sm">
                      <Badge variant="outline" className={`text-[10px] ${f.severity === "high" ? "text-red-400" : f.severity === "medium" ? "text-amber-400" : "text-blue-400"}`}>
                        {f.severity}
                      </Badge>
                      <div>
                        <span className="font-medium text-xs">{f.type}</span>
                        <p className="text-xs text-muted-foreground">{f.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Conciliação Bancária</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setBankMatchOpen(true)} data-testid="button-update-bank-match">
                <Landmark className="w-3 h-3 mr-1" /> Atualizar
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground">Status</span>
                <p className="font-medium">{BANK_LABELS[caseData.bankStatementMatch] || caseData.bankStatementMatch}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Valor Conciliado</span>
                <p className="font-medium">{formatBRL(caseData.bankMatchAmount)}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Data</span>
                <p className="font-medium">{caseData.bankMatchDate ? new Date(caseData.bankMatchDate).toLocaleDateString("pt-BR") : "—"}</p>
              </div>
            </CardContent>
          </Card>

          {availableTransitions.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {availableTransitions.map((t) => (
                <Button
                  key={t.value}
                  size="sm"
                  variant={t.value === "rejected" || t.value === "non_conformant" ? "destructive" : "default"}
                  onClick={() => onStatusChange(caseData.id, t.value)}
                  data-testid={`button-status-${t.value}`}
                >
                  <ArrowRight className="w-3 h-3 mr-1" />
                  {t.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        <Dialog open={findingOpen} onOpenChange={setFindingOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Achado</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Tipo</Label>
                <Select onValueChange={(v) => setFindingForm((prev) => ({ ...prev, type: v }))}>
                  <SelectTrigger data-testid="select-finding-type">
                    <SelectValue placeholder="Tipo do achado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="valor_divergente">Valor Divergente</SelectItem>
                    <SelectItem value="documento_ausente">Documento Ausente</SelectItem>
                    <SelectItem value="reserva_incompativel">Reserva Incompatível</SelectItem>
                    <SelectItem value="pagamento_duplicado">Pagamento Duplicado</SelectItem>
                    <SelectItem value="comissao_irregular">Comissão Irregular</SelectItem>
                    <SelectItem value="sem_aprovacao">Sem Aprovação</SelectItem>
                    <SelectItem value="fora_politica">Fora da Política</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Descrição</Label>
                <Textarea placeholder="Descreva o achado..." onChange={(e) => setFindingForm((prev) => ({ ...prev, description: e.target.value }))} data-testid="textarea-finding-description" />
              </div>
              <div>
                <Label className="text-xs">Severidade</Label>
                <Select value={findingForm.severity} onValueChange={(v) => setFindingForm((prev) => ({ ...prev, severity: v }))}>
                  <SelectTrigger data-testid="select-finding-severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => onAddFinding(caseData.id, findingForm)} data-testid="button-submit-finding">
                Registrar Achado
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={bankMatchOpen} onOpenChange={setBankMatchOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Atualizar Conciliação Bancária</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Status</Label>
                <Select onValueChange={(v) => setBankForm((prev) => ({ ...prev, bankStatementMatch: v }))}>
                  <SelectTrigger data-testid="select-bank-status">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="matched">Conciliado</SelectItem>
                    <SelectItem value="unmatched">Divergente</SelectItem>
                    <SelectItem value="partial">Parcial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Valor (R$)</Label>
                <Input type="number" step="0.01" placeholder="0.00" onChange={(e) => setBankForm((prev) => ({ ...prev, bankMatchAmount: e.target.value }))} data-testid="input-bank-amount" />
              </div>
              <div>
                <Label className="text-xs">Data</Label>
                <Input type="date" onChange={(e) => setBankForm((prev) => ({ ...prev, bankMatchDate: e.target.value }))} data-testid="input-bank-date" />
              </div>
              <Button className="w-full" onClick={() => onBankMatch(caseData.id, bankForm)} data-testid="button-submit-bank-match">
                Atualizar Conciliação
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

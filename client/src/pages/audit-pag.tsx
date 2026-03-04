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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShieldCheck, Plus, FileText, DollarSign, AlertTriangle, CheckCircle2,
  XCircle, Clock, TrendingUp, TrendingDown, ArrowUpDown, Upload,
  Building2, User, MapPin, Calendar, CreditCard, FileBarChart, Eye,
  Landmark, ArrowRight, RefreshCw,
} from "lucide-react";
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

  const dashboardQuery = useQuery({ queryKey: ["/api/audit-pag/dashboard"] });
  const casesQuery = useQuery({ queryKey: ["/api/audit-pag/cases"] });
  const monitoringQuery = useQuery({ queryKey: ["/api/audit-pag/monitoring"] });

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
      setSelectedCase(data);
      setBankMatchOpen(false);
      toast({ title: "Conciliação bancária atualizada" });
    },
    onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  const dashboard = dashboardQuery.data as any;
  const cases = (casesQuery.data as any[]) || [];
  const monitoring = (monitoringQuery.data as any[]) || [];

  const filteredCases = statusFilter === "all" ? cases : cases.filter((c: any) => c.status === statusFilter);

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
        </div>
        <Button onClick={() => setNewCaseOpen(true)} data-testid="button-new-case">
          <Plus className="w-4 h-4 mr-2" />
          Novo Caso
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-audit-pag">
          <TabsTrigger value="dashboard" data-testid="tab-dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="cases" data-testid="tab-cases">Casos</TabsTrigger>
          <TabsTrigger value="monitoring" data-testid="tab-monitoring">Monitoramento</TabsTrigger>
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
      />
    </div>
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
  findingOpen, setFindingOpen, bankMatchOpen, setBankMatchOpen, userRole,
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
              <span className="text-xs text-muted-foreground">Confirmação Fornecedor</span>
              <p className="font-medium">{caseData.supplierConfirmation || "—"}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Meio de Pagamento</span>
              <p className="font-medium">{PAYMENT_LABELS[caseData.paymentMethod] || caseData.paymentMethod || "—"}</p>
            </div>
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
                <Input type="number" step="0.01" onChange={(e) => setBankForm((prev) => ({ ...prev, bankMatchAmount: e.target.value }))} data-testid="input-bank-match-amount" />
              </div>
              <div>
                <Label className="text-xs">Data</Label>
                <Input type="date" onChange={(e) => setBankForm((prev) => ({ ...prev, bankMatchDate: e.target.value }))} data-testid="input-bank-match-date" />
              </div>
              <Button className="w-full" onClick={() => onBankMatch(caseData.id, bankForm)} data-testid="button-submit-bank-match">
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

function formatBRL(val: string | number | null | undefined) {
  if (!val) return "R$ 0,00";
  return `R$ ${parseFloat(String(val)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

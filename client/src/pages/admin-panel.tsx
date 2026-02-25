import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Receipt,
  Users,
  FolderSearch,
  AlertTriangle,
  Plug,
  ScrollText,
  DollarSign,
  CheckCircle2,
  Clock,
  Flag,
  ShieldAlert,
  TrendingUp,
  Activity,
  Eye,
  Trash2,
  ChevronRight,
  RefreshCw,
  CircleDot,
  XCircle,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "wouter";

interface AdminStats {
  expenses: { total: number; totalAmount: number; pending: number; approved: number; flagged: number; highRisk: number };
  auditCases: { total: number; open: number; closed: number; totalSavings: number };
  anomalies: { total: number; unresolved: number; resolved: number };
  clients: { total: number; active: number; pending: number };
  dataSources: { total: number; connected: number; disconnected: number };
  auditTrail: { total: number; recent: any[] };
  recentExpenses: any[];
  recentClients: any[];
  recentDataSources: any[];
}

function StatCard({ title, value, subtitle, icon: Icon, color, link }: {
  title: string; value: string | number; subtitle?: string; icon: typeof Receipt; color: string; link?: string;
}) {
  const content = (
    <Card className="hover:shadow-md transition-shadow" data-testid={`stat-${title.toLowerCase().replace(/\s/g, '-')}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          <div className={`p-2 rounded-lg bg-muted/50`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
  if (link) return <Link href={link}>{content}</Link>;
  return content;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    approved: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    flagged: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    active: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    connected: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    disconnected: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
    open: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    closed: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
    in_progress: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    completed: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  };
  return (
    <Badge variant="outline" className={`text-[10px] ${colors[status] || ""}`}>
      {status}
    </Badge>
  );
}

type TabKey = "overview" | "expenses" | "clients" | "integrations" | "activity";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const { toast } = useToast();

  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: allExpenses = [] } = useQuery<any[]>({
    queryKey: ["/api/expenses"],
    enabled: activeTab === "expenses",
  });

  const { data: allClients = [] } = useQuery<any[]>({
    queryKey: ["/api/clients"],
    enabled: activeTab === "clients",
  });

  const { data: allDataSources = [] } = useQuery<any[]>({
    queryKey: ["/api/data-sources"],
    enabled: activeTab === "integrations",
  });

  const { data: auditTrail = [] } = useQuery<any[]>({
    queryKey: ["/api/audit-trail"],
    enabled: activeTab === "activity",
  });

  const updateExpense = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/expenses/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Despesa atualizada" });
    },
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/clients/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Cliente atualizado" });
    },
  });

  const updateDataSource = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/data-sources/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-sources"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Integracao atualizada" });
    },
  });

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: "Visao Geral" },
    { key: "expenses", label: "Despesas" },
    { key: "clients", label: "Clientes" },
    { key: "integrations", label: "Integracoes" },
    { key: "activity", label: "Atividades" },
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="admin-panel-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" data-testid="text-admin-title">Painel Administrativo</h1>
          <p className="text-sm text-muted-foreground">Gestao centralizada da plataforma AuraAudit</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] })}
          data-testid="button-admin-refresh"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === tab.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid={`tab-${tab.key}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="Total Despesas" value={stats.expenses.total} subtitle={formatCurrency(stats.expenses.totalAmount)} icon={Receipt} color="text-blue-600 dark:text-blue-400" link="/expenses" />
            <StatCard title="Pendentes" value={stats.expenses.pending} subtitle="Aguardando revisao" icon={Clock} color="text-yellow-600 dark:text-yellow-400" />
            <StatCard title="Aprovadas" value={stats.expenses.approved} subtitle="Revisadas e aceitas" icon={CheckCircle2} color="text-green-600 dark:text-green-400" />
            <StatCard title="Sinalizadas" value={stats.expenses.flagged} subtitle={`${stats.expenses.highRisk} alto risco`} icon={Flag} color="text-red-600 dark:text-red-400" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="Casos Auditoria" value={stats.auditCases.total} subtitle={`${stats.auditCases.open} abertos`} icon={FolderSearch} color="text-indigo-600 dark:text-indigo-400" link="/cases" />
            <StatCard title="Anomalias" value={stats.anomalies.total} subtitle={`${stats.anomalies.unresolved} pendentes`} icon={AlertTriangle} color="text-orange-600 dark:text-orange-400" link="/anomalies" />
            <StatCard title="Clientes" value={stats.clients.total} subtitle={`${stats.clients.active} ativos`} icon={Users} color="text-teal-600 dark:text-teal-400" link="/clients" />
            <StatCard title="Integracoes" value={stats.dataSources.total} subtitle={`${stats.dataSources.connected} conectadas`} icon={Plug} color="text-purple-600 dark:text-purple-400" link="/integrations" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard title="Savings Identificados" value={formatCurrency(stats.auditCases.totalSavings)} icon={TrendingUp} color="text-emerald-600 dark:text-emerald-400" />
            <StatCard title="Trilha de Auditoria" value={stats.auditTrail.total} subtitle="Registros imutaveis" icon={ScrollText} color="text-slate-600 dark:text-slate-400" link="/audit-trail" />
            <StatCard title="Alto Risco" value={stats.expenses.highRisk} subtitle="Requerem atencao" icon={ShieldAlert} color="text-red-600 dark:text-red-400" />
          </div>

          <Separator />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2"><Activity className="w-4 h-4" /> Atividade Recente</span>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActiveTab("activity")} data-testid="link-view-all-activity">
                    Ver tudo <ArrowUpRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-auto">
                  {stats.auditTrail.recent.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">Nenhuma atividade registrada</p>
                  ) : (
                    stats.auditTrail.recent.slice(0, 8).map((entry: any, i: number) => (
                      <div key={entry.id || i} className="flex items-center gap-3 py-1.5 border-b last:border-0" data-testid={`activity-item-${i}`}>
                        <CircleDot className="w-3 h-3 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs truncate">
                            <span className="font-medium">{entry.userId}</span>
                            {" "}<span className="text-muted-foreground">{entry.action}</span>
                            {" "}<span className="font-medium">{entry.entityType}</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground">{formatDate(entry.timestamp)}</p>
                        </div>
                        <Badge variant="outline" className="text-[9px] shrink-0">{entry.action}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> Despesas Recentes</span>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActiveTab("expenses")} data-testid="link-view-all-expenses">
                    Ver tudo <ArrowUpRight className="w-3 h-3 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-auto">
                  {(stats.recentExpenses || []).slice(0, 8).map((exp: any, i: number) => (
                    <div key={exp.id} className="flex items-center justify-between py-1.5 border-b last:border-0" data-testid={`recent-expense-${i}`}>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{exp.description}</p>
                        <p className="text-[10px] text-muted-foreground">{exp.vendor} · {exp.employee}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-xs font-medium">{formatCurrency(parseFloat(exp.amount))}</span>
                        <StatusBadge status={exp.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "expenses" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Gestao de Despesas ({allExpenses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-3">Descricao</th>
                    <th className="pb-2 pr-3">Fornecedor</th>
                    <th className="pb-2 pr-3">Funcionario</th>
                    <th className="pb-2 pr-3">Valor</th>
                    <th className="pb-2 pr-3">Risco</th>
                    <th className="pb-2 pr-3">Status</th>
                    <th className="pb-2">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {allExpenses.map((exp: any) => (
                    <tr key={exp.id} className="border-b last:border-0 hover:bg-muted/30" data-testid={`expense-row-${exp.id}`}>
                      <td className="py-2 pr-3 max-w-[200px] truncate">{exp.description}</td>
                      <td className="py-2 pr-3">{exp.vendor}</td>
                      <td className="py-2 pr-3">{exp.employee}</td>
                      <td className="py-2 pr-3 font-medium">{formatCurrency(parseFloat(exp.amount))}</td>
                      <td className="py-2 pr-3"><StatusBadge status={exp.riskLevel} /></td>
                      <td className="py-2 pr-3"><StatusBadge status={exp.status} /></td>
                      <td className="py-2">
                        <div className="flex items-center gap-1">
                          {exp.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateExpense.mutate({ id: exp.id, data: { status: "approved" } })}
                                disabled={updateExpense.isPending}
                                data-testid={`button-approve-expense-${exp.id}`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateExpense.mutate({ id: exp.id, data: { status: "flagged" } })}
                                disabled={updateExpense.isPending}
                                data-testid={`button-flag-expense-${exp.id}`}
                              >
                                <Flag className="w-3.5 h-3.5 text-red-600" />
                              </Button>
                            </>
                          )}
                          {exp.status === "flagged" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateExpense.mutate({ id: exp.id, data: { status: "approved" } })}
                              disabled={updateExpense.isPending}
                              data-testid={`button-resolve-expense-${exp.id}`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                            </Button>
                          )}
                          <Link href="/expenses">
                            <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`button-view-expense-${exp.id}`}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allExpenses.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">Nenhuma despesa cadastrada</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "clients" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Gestao de Clientes ({allClients.length})</span>
              <Link href="/clients">
                <Button variant="outline" size="sm" className="text-xs" data-testid="button-go-clients">
                  Abrir Cadastro <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-3">Nome</th>
                    <th className="pb-2 pr-3">Tipo</th>
                    <th className="pb-2 pr-3">CNPJ</th>
                    <th className="pb-2 pr-3">Contato</th>
                    <th className="pb-2 pr-3">Status</th>
                    <th className="pb-2">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {allClients.map((client: any) => (
                    <tr key={client.id} className="border-b last:border-0 hover:bg-muted/30" data-testid={`client-row-${client.id}`}>
                      <td className="py-2 pr-3 font-medium">{client.name}</td>
                      <td className="py-2 pr-3"><Badge variant="outline" className="text-[10px]">{client.type}</Badge></td>
                      <td className="py-2 pr-3 font-mono text-[10px]">{client.cnpj}</td>
                      <td className="py-2 pr-3">{client.contactName}</td>
                      <td className="py-2 pr-3"><StatusBadge status={client.status} /></td>
                      <td className="py-2">
                        <div className="flex items-center gap-1">
                          {client.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateClient.mutate({ id: client.id, data: { status: "active" } })}
                              disabled={updateClient.isPending}
                              data-testid={`button-activate-client-${client.id}`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                            </Button>
                          )}
                          {client.status === "active" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateClient.mutate({ id: client.id, data: { status: "inactive" } })}
                              disabled={updateClient.isPending}
                              data-testid={`button-deactivate-client-${client.id}`}
                            >
                              <XCircle className="w-3.5 h-3.5 text-red-600" />
                            </Button>
                          )}
                          <Link href="/clients">
                            <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`button-view-client-${client.id}`}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allClients.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">Nenhum cliente cadastrado</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "integrations" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2"><Plug className="w-4 h-4" /> Gestao de Integracoes ({allDataSources.length})</span>
              <Link href="/integrations">
                <Button variant="outline" size="sm" className="text-xs" data-testid="button-go-integrations">
                  Abrir Hub <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-3">Nome</th>
                    <th className="pb-2 pr-3">Tipo</th>
                    <th className="pb-2 pr-3">Formato</th>
                    <th className="pb-2 pr-3">Frequencia</th>
                    <th className="pb-2 pr-3">Registros</th>
                    <th className="pb-2 pr-3">Status</th>
                    <th className="pb-2">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {allDataSources.map((ds: any) => (
                    <tr key={ds.id} className="border-b last:border-0 hover:bg-muted/30" data-testid={`ds-row-${ds.id}`}>
                      <td className="py-2 pr-3 font-medium">{ds.name}</td>
                      <td className="py-2 pr-3"><Badge variant="outline" className="text-[10px]">{ds.type}</Badge></td>
                      <td className="py-2 pr-3">{ds.fileFormat}</td>
                      <td className="py-2 pr-3">{ds.syncFrequency}</td>
                      <td className="py-2 pr-3">{ds.totalRecords?.toLocaleString("pt-BR") || 0}</td>
                      <td className="py-2 pr-3"><StatusBadge status={ds.status} /></td>
                      <td className="py-2">
                        <div className="flex items-center gap-1">
                          {ds.status === "disconnected" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateDataSource.mutate({ id: ds.id, data: { status: "connected" } })}
                              disabled={updateDataSource.isPending}
                              data-testid={`button-connect-ds-${ds.id}`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                            </Button>
                          )}
                          {ds.status === "connected" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateDataSource.mutate({ id: ds.id, data: { status: "disconnected" } })}
                              disabled={updateDataSource.isPending}
                              data-testid={`button-disconnect-ds-${ds.id}`}
                            >
                              <XCircle className="w-3.5 h-3.5 text-red-600" />
                            </Button>
                          )}
                          <Link href="/integrations">
                            <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`button-view-ds-${ds.id}`}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allDataSources.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">Nenhuma integracao cadastrada</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "activity" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2"><ScrollText className="w-4 h-4" /> Trilha de Atividades ({auditTrail.length})</span>
              <Link href="/audit-trail">
                <Button variant="outline" size="sm" className="text-xs" data-testid="button-go-audit-trail">
                  Trilha Completa <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-auto">
              {auditTrail.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">Nenhuma atividade registrada</p>
              ) : (
                auditTrail.map((entry: any, i: number) => (
                  <div key={entry.id || i} className="flex items-start gap-3 py-2 border-b last:border-0" data-testid={`trail-item-${i}`}>
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-muted shrink-0 mt-0.5">
                      <CircleDot className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium">{entry.userId}</span>
                        <Badge variant="outline" className="text-[9px]">{entry.action}</Badge>
                        <Badge variant="secondary" className="text-[9px]">{entry.entityType}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        ID: <span className="font-mono">{entry.entityId?.slice(0, 12)}...</span>
                        {" · "}{formatDate(entry.timestamp)}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">
                        Hash: {entry.integrityHash?.slice(0, 32)}...
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

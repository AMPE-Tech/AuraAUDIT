import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  CreditCard,
  Plane,
  Hotel,
  Car,
  Shield,
  Globe,
  Database,
  Link2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { DataSource, Client } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const DATA_SOURCE_TYPE_CONFIG: Record<string, { label: string; icon: any; description: string }> = {
  bradesco_ebta: {
    label: "Cartao Corporativo (EBTA)",
    icon: CreditCard,
    description: "Extrato Bancario de Transacoes Aereas — cartao de credito corporativo",
  },
  travel_agency: {
    label: "Agencias de Viagens",
    icon: Briefcase,
    description: "Dados de agencias de viagens e consolidadores",
  },
  airline: {
    label: "Cias Aereas",
    icon: Plane,
    description: "Companhias aereas - bilhetes, tarifas e fees",
  },
  hotel_chain: {
    label: "Redes Hoteleiras",
    icon: Hotel,
    description: "Redes hoteleiras - reservas, diarias e faturas",
  },
  car_rental: {
    label: "Locadoras",
    icon: Car,
    description: "Locadoras de veiculos - contratos e faturas",
  },
  insurer: {
    label: "Seguradoras",
    icon: Shield,
    description: "Seguros viagem - apolices e sinistros",
  },
  gds_sabre: {
    label: "GDS Sabre",
    icon: Globe,
    description: "Global Distribution System Sabre - reservas e PNRs",
  },
  gds_amadeus: {
    label: "GDS Amadeus",
    icon: Globe,
    description: "Global Distribution System Amadeus - reservas e PNRs",
  },
  bsplink: {
    label: "BSPlink",
    icon: Database,
    description: "Billing and Settlement Plan - conciliacao IATA",
  },
};

const STATUS_CONFIG: Record<string, { label: string; icon: any; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  connected: { label: "Conectado", icon: CheckCircle, variant: "default" },
  disconnected: { label: "Desconectado", icon: XCircle, variant: "secondary" },
  pending: { label: "Pendente", icon: Clock, variant: "outline" },
  error: { label: "Erro", icon: AlertTriangle, variant: "destructive" },
};

const dataSourceFormSchema = z.object({
  name: z.string().min(2, "Nome obrigatorio"),
  type: z.string().min(1, "Tipo obrigatorio"),
  clientId: z.string().optional(),
  syncFrequency: z.string().default("monthly"),
  fileFormat: z.string().default("csv"),
  description: z.string().optional(),
});

type DataSourceFormData = z.infer<typeof dataSourceFormSchema>;

export default function Integrations() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const { toast } = useToast();

  const { data: dataSources, isLoading } = useQuery<DataSource[]>({
    queryKey: ["/api/data-sources"],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const form = useForm<DataSourceFormData>({
    resolver: zodResolver(dataSourceFormSchema),
    defaultValues: {
      name: "",
      type: "",
      clientId: "",
      syncFrequency: "monthly",
      fileFormat: "csv",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: DataSourceFormData) => {
      const payload: any = {
        name: data.name,
        type: data.type,
        syncFrequency: data.syncFrequency,
        fileFormat: data.fileFormat,
        description: data.description || null,
        status: "pending",
        clientId: data.clientId || null,
      };
      const res = await apiRequest("POST", "/api/data-sources", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/data-sources"] });
      toast({ title: "Fonte de dados cadastrada com sucesso" });
      setDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Erro ao cadastrar fonte de dados", variant: "destructive" });
    },
  });

  const filtered = dataSources?.filter((ds) => {
    return typeFilter === "all" || ds.type === typeFilter;
  });

  const grouped = filtered?.reduce<Record<string, DataSource[]>>((acc, ds) => {
    const key = ds.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(ds);
    return acc;
  }, {}) || {};

  const totalSources = dataSources?.length || 0;
  const connectedCount = dataSources?.filter((ds) => ds.status === "connected").length || 0;
  const errorCount = dataSources?.filter((ds) => ds.status === "error").length || 0;
  const totalRecords = dataSources?.reduce((sum, ds) => sum + (ds.totalRecords || 0), 0) || 0;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-integrations-title">
            Integracoes e Fontes de Dados
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestao de conexoes com sistemas externos e ingestao de dados
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-datasource">
              <Plus className="w-4 h-4 mr-2" />
              Nova Fonte de Dados
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Fonte de Dados</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome da fonte de dados" data-testid="input-datasource-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-datasource-type">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(DATA_SOURCE_TYPE_CONFIG).map(([key, cfg]) => (
                            <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente (opcional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-datasource-client">
                            <SelectValue placeholder="Selecione o cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {clients?.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="syncFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequencia de Sync</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-datasource-frequency">
                              <SelectValue placeholder="Frequencia" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Diario</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="monthly">Mensal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fileFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Formato</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-datasource-format">
                              <SelectValue placeholder="Formato" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="csv">CSV</SelectItem>
                            <SelectItem value="xlsx">XLSX</SelectItem>
                            <SelectItem value="xml">XML</SelectItem>
                            <SelectItem value="api">API</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descricao</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Descricao da fonte de dados" data-testid="input-datasource-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-datasource">
                  {createMutation.isPending ? "Cadastrando..." : "Cadastrar Fonte de Dados"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Fontes de Dados
                </p>
                <p className="text-2xl font-bold tracking-tight" data-testid="text-total-sources">
                  {totalSources}
                </p>
                <span className="text-xs text-muted-foreground">cadastradas</span>
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
                  Conectadas
                </p>
                <p className="text-2xl font-bold tracking-tight text-green-600 dark:text-green-400" data-testid="text-connected-count">
                  {connectedCount}
                </p>
                <span className="text-xs text-muted-foreground">ativas</span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-green-600/10 dark:bg-green-400/10">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Com Erro
                </p>
                <p className="text-2xl font-bold tracking-tight text-destructive" data-testid="text-error-count">
                  {errorCount}
                </p>
                <span className="text-xs text-muted-foreground">necessitam atencao</span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Total Registros
                </p>
                <p className="text-2xl font-bold tracking-tight" data-testid="text-total-records">
                  {totalRecords.toLocaleString("pt-BR")}
                </p>
                <span className="text-xs text-muted-foreground">ingeridos</span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[240px]" data-testid="select-filter-type">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            {Object.entries(DATA_SOURCE_TYPE_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <Card>
          <CardContent className="h-48 flex flex-col items-center justify-center text-muted-foreground">
            <Link2 className="w-10 h-10 mb-3" />
            <p className="text-sm font-medium">Nenhuma fonte de dados encontrada</p>
            <p className="text-xs mt-1">Cadastre uma nova fonte de dados para iniciar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([type, sources]) => {
            const config = DATA_SOURCE_TYPE_CONFIG[type] || {
              label: type,
              icon: Database,
              description: "",
            };
            const TypeIcon = config.icon;
            return (
              <Card key={type}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TypeIcon className="w-4 h-4 text-primary" />
                    {config.label}
                    <Badge variant="outline" className="text-[10px] ml-1">
                      {sources.length}
                    </Badge>
                  </CardTitle>
                  {config.description && (
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sources.map((ds) => {
                      const statusCfg = STATUS_CONFIG[ds.status] || STATUS_CONFIG.disconnected;
                      const StatusIcon = statusCfg.icon;
                      return (
                        <div
                          key={ds.id}
                          className="flex items-center justify-between gap-4 p-4 rounded-md bg-background"
                          data-testid={`datasource-card-${ds.id}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/10 shrink-0">
                              <TypeIcon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-medium" data-testid={`text-datasource-name-${ds.id}`}>
                                  {ds.name}
                                </p>
                                <Badge variant="outline" className="text-[10px]">
                                  {ds.fileFormat?.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className="text-[10px]">
                                  {ds.syncFrequency === "daily" ? "Diario" : ds.syncFrequency === "weekly" ? "Semanal" : "Mensal"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                {ds.totalRecords != null && ds.totalRecords > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    {ds.totalRecords.toLocaleString("pt-BR")} registros
                                  </span>
                                )}
                                {ds.totalAmount && parseFloat(ds.totalAmount) > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatCurrency(ds.totalAmount)}
                                  </span>
                                )}
                                {ds.lastSyncAt && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3" />
                                    {formatDateTime(ds.lastSyncAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              variant={statusCfg.variant}
                              className="text-[10px]"
                              data-testid={`badge-status-${ds.id}`}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusCfg.label}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Cadeia de Custodia e Governanca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">
            Todas as integracoes seguem os padroes de governanca da Lei 13.964/2019 (Pacote Anticrime) e normas AuraDue de cadeia de custodia digital.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              "Hash de integridade SHA-256 em cada registro ingerido",
              "Trilha de auditoria completa para todas as operacoes",
              "Controle de acesso baseado em perfil (RBAC)",
              "Registro de IP e timestamp em cada acao",
              "Backup e retencao conforme politica de dados",
              "Validacao de formato e consistencia na ingestao",
              "Rastreabilidade ponta a ponta dos dados",
              "Conformidade com LGPD e normas contabeis",
              "Verificacao de duplicidade automatica na importacao",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-md bg-background">
                <ShieldCheck className="w-3 h-3 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <span className="text-xs text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" />
            Tipos de Integracao Disponiveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(DATA_SOURCE_TYPE_CONFIG).map(([key, cfg]) => {
              const Icon = cfg.icon;
              const count = dataSources?.filter((ds) => ds.type === key).length || 0;
              const connCount = dataSources?.filter((ds) => ds.type === key && ds.status === "connected").length || 0;
              return (
                <div
                  key={key}
                  className="flex items-start gap-3 p-4 rounded-md bg-background"
                  data-testid={`integration-type-${key}`}
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary/10 shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{cfg.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{cfg.description}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">
                        {count} cadastradas
                      </Badge>
                      {connCount > 0 && (
                        <Badge variant="default" className="text-[10px]">
                          {connCount} ativas
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

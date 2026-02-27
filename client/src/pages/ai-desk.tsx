import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  FileSignature,
  FileText,
  BarChart3,
  Target,
  Briefcase,
  Zap,
  Shield,
  Info,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Eye,
  ChevronRight,
  Coins,
  RefreshCw,
  Scale,
  Bell,
  Plug,
  FileBarChart,
  Presentation,
  TrendingDown,
  ShieldCheck,
  XCircle,
} from "lucide-react";

const ICON_MAP: Record<string, any> = {
  RefreshCw,
  FileSignature,
  FileText,
  BarChart3,
  Scale,
  Bell,
  Plug,
  FileBarChart,
  Presentation,
  TrendingDown,
  Target,
};

const SERVICE_ICON_MAP: Record<string, any> = {
  "reconciliation": RefreshCw,
  "contract-review": FileSignature,
  "rfp-response": FileText,
  "sla-kpi-pack": BarChart3,
  "negotiation-assistant": Scale,
  "realtime-alerts": Bell,
  "api-connect": Plug,
  "auto-report": FileBarChart,
  "executive-presentation": Presentation,
  "lost-saving-strategy": TrendingDown,
  "action-plan": Target,
};

const UNIT_TYPE_LABELS: Record<string, { label: string; placeholder: string }> = {
  pages: { label: "Numero estimado de paginas", placeholder: "5" },
  arquivos: { label: "Numero de arquivos", placeholder: "3" },
  scenarios: { label: "Numero de cenarios", placeholder: "2" },
  rules: { label: "Numero de regras", placeholder: "5" },
  dimensions: { label: "Numero de dimensoes", placeholder: "4" },
  slides: { label: "Numero de slides", placeholder: "10" },
  suppliers: { label: "Numero de fornecedores", placeholder: "3" },
};

const CATEGORY_LABELS: Record<string, string> = {
  finance: "Financeiro",
  contracts: "Contratos",
  procurement: "Compras",
  operations: "Operacoes",
  strategy: "Estrategia",
  monitoring: "Monitoramento",
  integration: "Integracao",
  reporting: "Relatorios",
  planning: "Planejamento",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: "Rascunho", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", icon: Clock },
  quoted: { label: "Cotado", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Coins },
  pending_approval: { label: "Aguardando Aprovacao", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock },
  approved: { label: "Aprovado", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2 },
  running: { label: "Executando", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Loader2 },
  completed: { label: "Concluido", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle2 },
  failed: { label: "Falhou", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: AlertCircle },
  cancelled: { label: "Cancelado", color: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400", icon: AlertCircle },
  rejected: { label: "Rejeitado", color: "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const Icon = config.icon;
  return (
    <Badge className={`text-[10px] gap-1 ${config.color}`} variant="outline" data-testid={`badge-status-${status}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

function getServiceIcon(service: any): any {
  if (service.icon && ICON_MAP[service.icon]) {
    return ICON_MAP[service.icon];
  }
  return SERVICE_ICON_MAP[service.id] || Briefcase;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export default function AiDeskPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [selectedService, setSelectedService] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewJobId, setViewJobId] = useState<string | null>(null);
  const [inputDescription, setInputDescription] = useState("");
  const [inputPages, setInputPages] = useState("5");
  const [inputUnits, setInputUnits] = useState("3");
  const [humanReview, setHumanReview] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("catalog");

  const { data: servicesData, isLoading: servicesLoading } = useQuery<{ services: any[] }>({
    queryKey: ["/api/ai-desk/services"],
  });

  const { data: jobsData, isLoading: jobsLoading } = useQuery<{ jobs: any[] }>({
    queryKey: ["/api/ai-desk/jobs"],
  });

  const { data: jobDetail } = useQuery<{ job: any; quote: any; outputs: any[]; envelope: any }>({
    queryKey: ["/api/ai-desk/jobs", viewJobId],
    enabled: !!viewJobId,
  });

  const { data: walletData } = useQuery<{ wallet: any }>({
    queryKey: ["/api/wallet"],
  });

  const { data: pendingData, isLoading: pendingLoading } = useQuery<{ jobs: any[] }>({
    queryKey: ["/api/ai-desk/pending-approvals"],
    enabled: isAdmin,
  });

  const createJobMutation = useMutation({
    mutationFn: async () => {
      const config: any = {
        humanReview,
        addOns: selectedAddOns,
      };
      if (selectedService?.perPageCredits > 0) {
        config.pages = parseInt(inputPages) || 0;
      }
      if (selectedService?.perUnitCredits > 0 && selectedService?.unitType !== "pages") {
        config.units = parseInt(inputUnits) || 0;
      }
      const res = await apiRequest("POST", "/api/ai-desk/jobs", {
        serviceId: selectedService.id,
        inputDescription,
        inputConfig: config,
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-desk/jobs"] });
      setCreateDialogOpen(false);
      setInputDescription("");
      setInputPages("5");
      setInputUnits("3");
      setHumanReview(false);
      setSelectedAddOns([]);
      setViewJobId(data.job.id);
      toast({ title: "Job criado", description: "Agora gere a cotacao para continuar" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao criar job", variant: "destructive" });
    },
  });

  const quoteMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const res = await apiRequest("POST", `/api/ai-desk/jobs/${jobId}/quote`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-desk/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-desk/jobs", viewJobId] });
      toast({ title: "Cotacao gerada", description: "Revise e aprove para executar" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao gerar cotacao", variant: "destructive" });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const res = await apiRequest("POST", `/api/ai-desk/jobs/${jobId}/approve`, {});
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-desk/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-desk/jobs", viewJobId] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      toast({ title: "Job aprovado", description: `${data.debited} creditos debitados. Saldo: ${data.newBalance}` });
    },
    onError: (error: any) => {
      const msg = error?.message || "Saldo insuficiente ou erro na aprovacao";
      toast({ title: "Erro na aprovacao", description: msg, variant: "destructive" });
    },
  });

  const runMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const res = await apiRequest("POST", `/api/ai-desk/jobs/${jobId}/run`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-desk/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-desk/jobs", viewJobId] });
      toast({ title: "Job concluido", description: "Resultado disponivel para visualizacao" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao executar job", variant: "destructive" });
    },
  });

  const adminApproveMutation = useMutation({
    mutationFn: async ({ jobId, decision }: { jobId: string; decision: "approved" | "rejected" }) => {
      const res = await apiRequest("POST", `/api/ai-desk/jobs/${jobId}/admin-approve`, { decision });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-desk/pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-desk/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-desk/jobs", viewJobId] });
      const msg = data.decision === "approved" ? "Job aprovado pelo admin" : "Job rejeitado pelo admin";
      toast({ title: msg });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha na aprovacao admin", variant: "destructive" });
    },
  });

  const services = servicesData?.services || [];
  const jobs = jobsData?.jobs || [];
  const pendingJobs = pendingData?.jobs || [];
  const balance = walletData?.wallet ? parseFloat(walletData.wallet.balanceCredits) : 0;

  const groupedServices = services.reduce((acc: Record<string, any[]>, service: any) => {
    const cat = service.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(service);
    return acc;
  }, {});

  if (servicesLoading) {
    return (
      <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold tracking-tight" data-testid="text-ai-desk-title">AI Desk</h1>
          <p className="text-xs text-muted-foreground mt-1">Catalogo de 11 Servicos de IA — escolha, veja o custo e execute</p>
        </div>
        <Badge variant="outline" className="text-xs gap-1.5" data-testid="badge-wallet-balance">
          <Coins className="w-3 h-3" />
          {balance.toLocaleString("pt-BR")} creditos
        </Badge>
      </div>

      <Card className="bg-muted/30" data-testid="card-trust-banner">
        <CardContent className="p-4 flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] text-muted-foreground">Voce vera o custo antes de executar</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] text-muted-foreground">A IA sugere, voce decide</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] text-muted-foreground">Caps e aprovacoes evitam surpresas</span>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-ai-desk">
          <TabsTrigger value="catalog" data-testid="tab-catalog">Catalogo</TabsTrigger>
          <TabsTrigger value="jobs" data-testid="tab-jobs">Meus Jobs ({jobs.length})</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="approvals" data-testid="tab-approvals">
              Aprovacoes ({pendingJobs.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="catalog" className="space-y-6 mt-4">
          {Object.entries(groupedServices).map(([category, categoryServices]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-[10px]" data-testid={`badge-category-${category}`}>
                  {CATEGORY_LABELS[category] || category}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryServices.map((service: any) => {
                  const Icon = getServiceIcon(service);
                  return (
                    <Card
                      key={service.id}
                      className="cursor-pointer hover-elevate"
                      onClick={() => {
                        setSelectedService(service);
                        setCreateDialogOpen(true);
                        setSelectedAddOns([]);
                        setHumanReview(false);
                        setInputUnits("3");
                        setInputPages("5");
                      }}
                      data-testid={`card-service-${service.id}`}
                    >
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold" data-testid={`text-service-name-${service.id}`}>{service.name}</h3>
                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{service.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-[10px]" data-testid={`badge-credits-${service.id}`}>
                            A partir de {service.baseCredits} creditos
                          </Badge>
                          <Button variant="ghost" size="sm" className="text-xs gap-1" data-testid={`button-create-${service.id}`}>
                            Criar Job <ChevronRight className="w-3 h-3" />
                          </Button>
                        </div>
                        {service.addOns && service.addOns.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {service.addOns.map((addon: any) => (
                              <Badge key={addon.id} variant="outline" className="text-[10px]">
                                +{addon.credits} {addon.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {service.humanReviewRequired && (
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">Revisao humana obrigatoria</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold" data-testid="text-jobs-title">Meus Jobs</h2>
            <Badge variant="secondary" className="text-[10px]">{jobs.length}</Badge>
          </div>

          {jobsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : jobs.length === 0 ? (
            <Card data-testid="card-jobs-empty">
              <CardContent className="p-8 text-center">
                <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Nenhum job ainda</p>
                <p className="text-xs text-muted-foreground mt-1">Escolha um servico do catalogo para comecar</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {jobs.map((job: any) => {
                const Icon = SERVICE_ICON_MAP[job.serviceId] || Briefcase;
                return (
                  <Card
                    key={job.id}
                    className="cursor-pointer hover-elevate"
                    onClick={() => setViewJobId(job.id)}
                    data-testid={`card-job-${job.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-sm font-medium">{job.serviceName}</p>
                            <p className="text-[11px] text-muted-foreground">{formatDate(job.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={job.status} />
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {isAdmin && (
          <TabsContent value="approvals" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold" data-testid="text-approvals-title">Jobs Aguardando Aprovacao</h2>
              <Badge variant="secondary" className="text-[10px]">{pendingJobs.length}</Badge>
            </div>

            {pendingLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <Skeleton key={i} className="h-20" />)}
              </div>
            ) : pendingJobs.length === 0 ? (
              <Card data-testid="card-approvals-empty">
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhum job pendente de aprovacao</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingJobs.map((job: any) => {
                  const Icon = SERVICE_ICON_MAP[job.serviceId] || Briefcase;
                  return (
                    <Card key={job.id} data-testid={`card-pending-${job.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium">{job.serviceName}</p>
                              <p className="text-[11px] text-muted-foreground">
                                User: {job.userId} — {formatDate(job.createdAt)}
                              </p>
                              {job.inputDescription && (
                                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                                  {job.inputDescription}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={job.status} />
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => adminApproveMutation.mutate({ jobId: job.id, decision: "approved" })}
                              disabled={adminApproveMutation.isPending}
                              data-testid={`button-admin-approve-${job.id}`}
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => adminApproveMutation.mutate({ jobId: job.id, decision: "rejected" })}
                              disabled={adminApproveMutation.isPending}
                              data-testid={`button-admin-reject-${job.id}`}
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Rejeitar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg" data-testid="dialog-create-job">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              {selectedService && (() => {
                const Icon = getServiceIcon(selectedService);
                return <Icon className="w-4 h-4 text-primary" />;
              })()}
              {selectedService?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Descricao do escopo / contexto</Label>
              <Textarea
                placeholder="Descreva o que voce precisa analisar..."
                value={inputDescription}
                onChange={(e) => setInputDescription(e.target.value)}
                className="mt-1.5 text-sm"
                rows={4}
                data-testid="input-description"
              />
            </div>

            {selectedService?.perPageCredits > 0 && (
              <div>
                <Label className="text-xs">Numero estimado de paginas</Label>
                <Input
                  type="number"
                  min="1"
                  value={inputPages}
                  onChange={(e) => setInputPages(e.target.value)}
                  className="mt-1.5 w-32"
                  data-testid="input-pages"
                />
                <p className="text-[10px] text-muted-foreground mt-1">+{selectedService.perPageCredits} creditos por pagina</p>
              </div>
            )}

            {selectedService?.perUnitCredits > 0 && selectedService?.unitType !== "pages" && selectedService?.unitType !== "none" && (
              <div>
                <Label className="text-xs">
                  {UNIT_TYPE_LABELS[selectedService.unitType]?.label || `Numero de ${selectedService.unitLabel}`}
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={inputUnits}
                  onChange={(e) => setInputUnits(e.target.value)}
                  className="mt-1.5 w-32"
                  data-testid="input-units"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  +{selectedService.perUnitCredits} creditos por {selectedService.unitLabel || "unidade"}
                </p>
              </div>
            )}

            {selectedService?.humanReviewMultiplier > 1 && !selectedService?.humanReviewRequired && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="human-review"
                  checked={humanReview}
                  onCheckedChange={(c) => setHumanReview(c === true)}
                  data-testid="checkbox-human-review"
                />
                <Label htmlFor="human-review" className="text-xs">
                  Incluir revisao humana (x{selectedService.humanReviewMultiplier})
                </Label>
              </div>
            )}

            {selectedService?.humanReviewRequired && (
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span className="text-[11px] text-muted-foreground">
                  Este servico inclui revisao humana obrigatoria
                </span>
              </div>
            )}

            {selectedService?.addOns?.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs">Add-ons</Label>
                {selectedService.addOns.map((addon: any) => (
                  <div key={addon.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`addon-${addon.id}`}
                      checked={selectedAddOns.includes(addon.id)}
                      onCheckedChange={(c) => {
                        if (c) setSelectedAddOns([...selectedAddOns, addon.id]);
                        else setSelectedAddOns(selectedAddOns.filter((id) => id !== addon.id));
                      }}
                      data-testid={`checkbox-addon-${addon.id}`}
                    />
                    <Label htmlFor={`addon-${addon.id}`} className="text-xs">
                      {addon.name} (+{addon.credits} creditos)
                    </Label>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-[11px] text-muted-foreground">
                <Info className="w-3 h-3 inline mr-1" />
                Ao criar o job, voce recebera uma cotacao detalhada antes de qualquer cobranca.
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => createJobMutation.mutate()}
              disabled={!inputDescription.trim() || createJobMutation.isPending}
              data-testid="button-submit-job"
            >
              {createJobMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
              Criar Job e Gerar Cotacao
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewJobId} onOpenChange={(open) => { if (!open) setViewJobId(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-job-detail">
          <DialogHeader>
            <DialogTitle className="text-sm">Detalhes do Job</DialogTitle>
          </DialogHeader>
          {jobDetail?.job && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = SERVICE_ICON_MAP[jobDetail.job.serviceId] || Briefcase;
                    return <Icon className="w-4 h-4 text-primary" />;
                  })()}
                  <span className="text-sm font-medium">{jobDetail.job.serviceName}</span>
                </div>
                <StatusBadge status={jobDetail.job.status} />
              </div>

              <Card className="bg-muted/30">
                <CardContent className="p-3">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Escopo</p>
                  <p className="text-xs">{jobDetail.job.inputDescription}</p>
                </CardContent>
              </Card>

              {jobDetail.job.status === "pending_approval" && (
                <Card className="border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300" data-testid="text-pending-approval-message">
                        Aguardando Aprovacao
                      </p>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400">
                        Este job excede o limite de auto-aprovacao e requer aprovacao de um administrador.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {jobDetail.job.status === "rejected" && (
                <Card className="border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10">
                  <CardContent className="p-4 flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-300">Job Rejeitado</p>
                      <p className="text-[11px] text-red-600 dark:text-red-400">
                        Este job foi rejeitado por um administrador.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {jobDetail.job.status === "draft" && (
                <Button
                  onClick={() => quoteMutation.mutate(jobDetail.job.id)}
                  disabled={quoteMutation.isPending}
                  className="w-full"
                  data-testid="button-generate-quote"
                >
                  {quoteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Coins className="w-4 h-4 mr-2" />}
                  Gerar Cotacao
                </Button>
              )}

              {jobDetail.quote && (
                <Card data-testid="card-quote">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs flex items-center gap-2">
                      <Coins className="w-4 h-4 text-primary" />
                      Cotacao
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1.5">
                      {(jobDetail.quote.pricingBreakdownJson as any[])?.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between gap-2 text-xs">
                          <span className="text-muted-foreground">{item.item}</span>
                          <span className="font-medium">{item.credits} creditos</span>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">Total estimado</span>
                      <span className="text-sm font-bold text-primary" data-testid="text-estimated-credits">
                        {parseFloat(jobDetail.quote.estimatedCredits).toLocaleString("pt-BR")} creditos
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>CAP maximo</span>
                      <span>{parseFloat(jobDetail.quote.capCredits).toLocaleString("pt-BR")} creditos</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Seu saldo: <span className="font-medium text-foreground">{balance.toLocaleString("pt-BR")} creditos</span>
                    </div>
                    {jobDetail.quote.requiresApproval && (
                      <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/10 rounded-lg p-2">
                        <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <span className="text-[11px] text-amber-700 dark:text-amber-400">Requer aprovacao administrativa</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {jobDetail.job.status === "quoted" && (
                <Button
                  onClick={() => approveMutation.mutate(jobDetail.job.id)}
                  disabled={approveMutation.isPending}
                  className="w-full"
                  data-testid="button-approve-job"
                >
                  {approveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Aprovar e Debitar Creditos
                </Button>
              )}

              {jobDetail.job.status === "approved" && (
                <Button
                  onClick={() => runMutation.mutate(jobDetail.job.id)}
                  disabled={runMutation.isPending}
                  className="w-full"
                  data-testid="button-run-job"
                >
                  {runMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                  Executar Job
                </Button>
              )}

              {jobDetail.outputs && jobDetail.outputs.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-semibold">Resultado</h3>
                  </div>
                  {jobDetail.outputs.map((output: any) => (
                    <Card key={output.id} data-testid={`card-output-${output.id}`}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-medium">{output.title}</span>
                          <Badge variant="outline" className="text-[10px]">{output.outputType}</Badge>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-4 prose prose-sm dark:prose-invert max-w-none">
                          <pre className="whitespace-pre-wrap text-xs font-sans">{output.content}</pre>
                        </div>
                        {output.sha256 && (
                          <p className="text-[10px] text-muted-foreground font-mono truncate">
                            SHA-256: {output.sha256}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {jobDetail.envelope && (
                <Card className="bg-muted/30" data-testid="card-audit-envelope">
                  <CardContent className="p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3 text-primary" />
                      <span className="text-[11px] font-medium">Audit Envelope</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">
                      SHA-256: {jobDetail.envelope.envelopeSha256}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground pb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3" />
          <span>Cadeia de Custodia Digital — AuraDue</span>
        </div>
        <span>AuraAUDIT — AI Desk</span>
      </div>
    </div>
  );
}

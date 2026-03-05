import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Clock, Timer, Cpu, Users, CheckCircle2, AlertTriangle, XCircle,
  Circle, Plus, Trash2, Activity, BarChart3, CalendarDays, TrendingUp,
  Shield, ArrowRight, Zap
} from "lucide-react";
import type { TrackerProject, TrackerPhase, TrackerTimeEntry } from "@shared/schema";

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2; bg: string }> = {
  completed: { label: "Concluido", color: "text-emerald-600 dark:text-emerald-400", icon: CheckCircle2, bg: "bg-emerald-500" },
  in_progress: { label: "Em andamento", color: "text-amber-600 dark:text-amber-400", icon: Clock, bg: "bg-amber-500" },
  delayed: { label: "Atrasado", color: "text-red-600 dark:text-red-400", icon: XCircle, bg: "bg-red-500" },
  not_started: { label: "Nao iniciado", color: "text-muted-foreground", icon: Circle, bg: "bg-muted-foreground" },
};

const healthConfig: Record<string, { label: string; color: string; badge: string; icon: typeof CheckCircle2 }> = {
  on_track: { label: "On Track", color: "text-emerald-600", badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle2 },
  attention: { label: "Attention", color: "text-amber-600", badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400", icon: AlertTriangle },
  critical: { label: "Critical", color: "text-red-600", badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
};

interface PhaseScheduleItem {
  phaseId: string;
  name: string;
  calculatedStart: string;
  calculatedEnd: string;
  estimatedDays: number;
  calendarDays: number;
}

interface DashboardData {
  project: TrackerProject;
  phases: TrackerPhase[];
  phaseSchedule: PhaseScheduleItem[];
  summary: {
    totalPhases: number;
    completedPhases: number;
    inProgressPhases: number;
    delayedPhases: number;
    notStartedPhases: number;
    totalEstimatedDays: number;
    daysPerWeek: number;
    gracePeriodDays: number;
    contractSignedAt: string | null;
    effectiveStartDate: string;
    projectedEndDate: string;
    businessDaysElapsed: number;
    effectiveWorkDaysConsumed: number;
    progressPercent: number;
    healthScore: string;
  };
  timeBreakdown: {
    clientResponseHours: number;
    auditAnalysisHours: number;
    systemProcessingHours: number;
    totalHours: number;
    clientPercent: number;
    auditPercent: number;
    systemPercent: number;
  };
}

function ProjectSelector({
  projects,
  selectedId,
  onSelect,
}: {
  projects: TrackerProject[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [totalDays, setTotalDays] = useState("60");
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/tracker/projects", data);
      return res.json();
    },
    onSuccess: (project: TrackerProject) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracker/projects"] });
      onSelect(project.id);
      setShowCreate(false);
      setName("");
      setDescription("");
      toast({ title: "Projeto criado com sucesso" });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" data-testid="text-projects-heading">Projetos</h2>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-create-project">
              <Plus className="w-4 h-4 mr-1" /> Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Projeto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Nome</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do projeto" data-testid="input-project-name" />
              </div>
              <div>
                <Label>Descricao</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descricao" data-testid="input-project-description" />
              </div>
              <div>
                <Label>Dias estimados</Label>
                <Input type="number" value={totalDays} onChange={(e) => setTotalDays(e.target.value)} data-testid="input-project-days" />
              </div>
              <Button
                className="w-full"
                disabled={!name || createMutation.isPending}
                onClick={() => createMutation.mutate({ name, description, totalEstimatedDays: parseInt(totalDays), startDate: new Date().toISOString() })}
                data-testid="button-submit-project"
              >
                {createMutation.isPending ? "Criando..." : "Criar Projeto"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-2">
        {projects.map((p) => {
          const health = healthConfig[p.healthScore] || healthConfig.on_track;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedId === p.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
              data-testid={`button-select-project-${p.id}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{p.name}</span>
                <Badge className={`text-[10px] ${health.badge}`}>{health.label}</Badge>
              </div>
              {p.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{p.description}</p>}
            </button>
          );
        })}
        {projects.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4" data-testid="text-no-projects">
            Nenhum projeto criado
          </p>
        )}
      </div>
    </div>
  );
}

function TimelineView({ dashboard }: { dashboard: DashboardData }) {
  const { phases, summary, phaseSchedule } = dashboard;
  const scheduleMap = new Map(phaseSchedule?.map(s => [s.phaseId, s]) || []);

  return (
    <div className="space-y-6">
      {summary.contractSignedAt && (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-6 text-xs text-muted-foreground flex-wrap">
              <span>Contrato: <strong className="text-foreground">{new Date(summary.contractSignedAt).toLocaleDateString("pt-BR")}</strong></span>
              <span>Grace: <strong className="text-foreground">{summary.gracePeriodDays}d uteis</strong></span>
              <span>Inicio: <strong className="text-foreground">{new Date(summary.effectiveStartDate).toLocaleDateString("pt-BR")}</strong></span>
              <span>Dedicacao: <strong className="text-foreground">{summary.daysPerWeek}d/semana</strong></span>
              <span>Conclusao: <strong className="text-foreground">{new Date(summary.projectedEndDate).toLocaleDateString("pt-BR")}</strong></span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <CalendarDays className="w-4 h-4" />
              <span>Tempo Estimado</span>
            </div>
            <p className="text-2xl font-bold" data-testid="text-estimated-days">{summary.totalEstimatedDays} dias</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Timer className="w-4 h-4" />
              <span>Dias Efetivos ({summary.daysPerWeek}d/sem)</span>
            </div>
            <p className="text-2xl font-bold" data-testid="text-consumed-days">{summary.effectiveWorkDaysConsumed} dias</p>
            <p className="text-[10px] text-muted-foreground">{summary.businessDaysElapsed} dias uteis decorridos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Progresso</span>
            </div>
            <p className="text-2xl font-bold" data-testid="text-progress-percent">{summary.progressPercent}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Activity className="w-4 h-4" />
              <span>Health</span>
            </div>
            <div className="flex items-center gap-2">
              {(() => {
                const h = healthConfig[summary.healthScore] || healthConfig.on_track;
                const Icon = h.icon;
                return (
                  <>
                    <Icon className={`w-5 h-5 ${h.color}`} />
                    <span className={`text-lg font-bold ${h.color}`} data-testid="text-health-score">{h.label}</span>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-4 pb-3 px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progresso Geral</span>
            <span className="text-sm font-medium">{summary.progressPercent}%</span>
          </div>
          <Progress value={summary.progressPercent} className="h-3" data-testid="progress-bar-overall" />
        </CardContent>
      </Card>

      <div className="space-y-1">
        {phases.map((phase, index) => {
          const config = statusConfig[phase.status] || statusConfig.not_started;
          const Icon = config.icon;
          return (
            <div key={phase.id} className="relative" data-testid={`timeline-phase-${phase.id}`}>
              {index < phases.length - 1 && (
                <div className="absolute left-[18px] top-[40px] bottom-0 w-[2px] bg-border" />
              )}
              <div className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 shrink-0 ${phase.status === "completed" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : phase.status === "in_progress" ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20" : phase.status === "delayed" ? "border-red-500 bg-red-50 dark:bg-red-900/20" : "border-muted-foreground/30 bg-muted"}`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">Fase {phase.orderIndex + 1} — {phase.name}</span>
                    <Badge variant="outline" className={`text-[10px] ${config.color}`}>{config.label}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span>{phase.estimatedDays}d projeto{(() => { const s = scheduleMap.get(phase.id); return s ? ` (${s.calendarDays}d calendario)` : ""; })()}</span>
                    {(() => {
                      const s = scheduleMap.get(phase.id);
                      if (s) return <span>{new Date(s.calculatedStart).toLocaleDateString("pt-BR")} <ArrowRight className="w-3 h-3 inline" /> {new Date(s.calculatedEnd).toLocaleDateString("pt-BR")}</span>;
                      if (phase.startDate) return <span>Inicio: {new Date(phase.startDate).toLocaleDateString("pt-BR")}</span>;
                      return null;
                    })()}
                    {phase.actualEndDate && <span>Concluido: {new Date(phase.actualEndDate).toLocaleDateString("pt-BR")}</span>}
                  </div>
                  {phase.deliverables && (
                    <p className="text-xs text-muted-foreground mt-1">{phase.deliverables}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {phases.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8" data-testid="text-no-phases">
            Nenhuma fase cadastrada
          </p>
        )}
      </div>
    </div>
  );
}

function StatusDashboard({ dashboard }: { dashboard: DashboardData }) {
  const { summary, timeBreakdown, project } = dashboard;
  const health = healthConfig[summary.healthScore] || healthConfig.on_track;
  const HealthIcon = health.icon;

  return (
    <div className="space-y-6">
      <Card className={`border-2 ${summary.healthScore === "on_track" ? "border-emerald-200 dark:border-emerald-800" : summary.healthScore === "attention" ? "border-amber-200 dark:border-amber-800" : "border-red-200 dark:border-red-800"}`}>
        <CardContent className="pt-6 pb-4 px-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-muted-foreground uppercase tracking-wider">Project Health Score</h3>
              <div className="flex items-center gap-3 mt-2">
                <HealthIcon className={`w-8 h-8 ${health.color}`} />
                <span className={`text-3xl font-bold ${health.color}`} data-testid="text-health-label">{health.label}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Progresso</p>
              <p className="text-3xl font-bold" data-testid="text-progress-value">{summary.progressPercent}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 px-4 text-center">
            <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500 mb-2" />
            <p className="text-2xl font-bold" data-testid="text-completed-count">{summary.completedPhases}</p>
            <p className="text-xs text-muted-foreground">Concluidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4 text-center">
            <Clock className="w-6 h-6 mx-auto text-amber-500 mb-2" />
            <p className="text-2xl font-bold" data-testid="text-inprogress-count">{summary.inProgressPhases}</p>
            <p className="text-xs text-muted-foreground">Em andamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4 text-center">
            <XCircle className="w-6 h-6 mx-auto text-red-500 mb-2" />
            <p className="text-2xl font-bold" data-testid="text-delayed-count">{summary.delayedPhases}</p>
            <p className="text-xs text-muted-foreground">Atrasadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4 text-center">
            <Circle className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-bold" data-testid="text-notstarted-count">{summary.notStartedPhases}</p>
            <p className="text-xs text-muted-foreground">Nao iniciadas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Audit Efficiency Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Users className="w-5 h-5 mx-auto text-blue-500 mb-1" />
              <p className="text-lg font-bold text-blue-700 dark:text-blue-400" data-testid="text-client-percent">{timeBreakdown.clientPercent}%</p>
              <p className="text-[11px] text-muted-foreground">Client Delay Impact</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <BarChart3 className="w-5 h-5 mx-auto text-purple-500 mb-1" />
              <p className="text-lg font-bold text-purple-700 dark:text-purple-400" data-testid="text-audit-percent">{timeBreakdown.auditPercent}%</p>
              <p className="text-[11px] text-muted-foreground">Audit Team Time</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/20">
              <Cpu className="w-5 h-5 mx-auto text-cyan-500 mb-1" />
              <p className="text-lg font-bold text-cyan-700 dark:text-cyan-400" data-testid="text-system-percent">{timeBreakdown.systemPercent}%</p>
              <p className="text-[11px] text-muted-foreground">System Processing</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Resumo Executivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Projeto</span>
              <span className="font-medium">{project.name}</span>
            </div>
            {summary.contractSignedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contrato assinado em</span>
                <span className="font-medium">{new Date(summary.contractSignedAt).toLocaleDateString("pt-BR")}</span>
              </div>
            )}
            {summary.contractSignedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Grace period</span>
                <span className="font-medium">{summary.gracePeriodDays} dias uteis apos assinatura</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Inicio efetivo do projeto</span>
              <span className="font-medium">{new Date(summary.effectiveStartDate).toLocaleDateString("pt-BR")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dedicacao ao projeto</span>
              <span className="font-medium">{summary.daysPerWeek} dias/semana</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tempo estimado (projeto)</span>
              <span className="font-medium">{summary.totalEstimatedDays} dias de trabalho</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Conclusao projetada</span>
              <span className="font-medium">{new Date(summary.projectedEndDate).toLocaleDateString("pt-BR")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dias efetivos consumidos</span>
              <span className="font-medium">{summary.effectiveWorkDaysConsumed} de {summary.totalEstimatedDays} dias</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saldo</span>
              <span className={`font-medium ${summary.effectiveWorkDaysConsumed > summary.totalEstimatedDays ? "text-red-500" : "text-emerald-500"}`}>
                {summary.effectiveWorkDaysConsumed <= summary.totalEstimatedDays
                  ? `${summary.totalEstimatedDays - summary.effectiveWorkDaysConsumed} dias restantes`
                  : `${summary.effectiveWorkDaysConsumed - summary.totalEstimatedDays} dias excedidos`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Horas operacionais totais</span>
              <span className="font-medium">{timeBreakdown.totalHours.toFixed(1)}h</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TimesheetPanel({ dashboard, projectId }: { dashboard: DashboardData; projectId: string }) {
  const { timeBreakdown } = dashboard;
  const [showAdd, setShowAdd] = useState(false);
  const [category, setCategory] = useState("audit_analysis");
  const [hours, setHours] = useState("");
  const [desc, setDesc] = useState("");
  const { toast } = useToast();

  const { data: timeEntries = [] } = useQuery<TrackerTimeEntry[]>({
    queryKey: ["/api/tracker/projects", projectId, "time-entries"],
  });

  const addMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", `/api/tracker/projects/${projectId}/time-entries`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracker/projects", projectId, "time-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tracker/projects", projectId, "dashboard"] });
      setShowAdd(false);
      setHours("");
      setDesc("");
      toast({ title: "Registro adicionado" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tracker/time-entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracker/projects", projectId, "time-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tracker/projects", projectId, "dashboard"] });
    },
  });

  const categoryLabels: Record<string, { label: string; color: string; icon: typeof Users }> = {
    client_response: { label: "Client Response Time", color: "text-blue-600", icon: Users },
    audit_analysis: { label: "Audit Analysis Time", color: "text-purple-600", icon: BarChart3 },
    system_processing: { label: "System Processing Time", color: "text-cyan-600", icon: Cpu },
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Timer className="w-4 h-4" />
            Operational Time Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Users className="w-5 h-5 text-blue-500" />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Client Response Time</span>
                  <span className="text-sm font-bold text-blue-700 dark:text-blue-400" data-testid="text-client-hours">
                    {timeBreakdown.clientResponseHours.toFixed(1)}h
                  </span>
                </div>
                <Progress value={timeBreakdown.clientPercent} className="h-2 mt-1" />
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Audit Analysis Time</span>
                  <span className="text-sm font-bold text-purple-700 dark:text-purple-400" data-testid="text-audit-hours">
                    {timeBreakdown.auditAnalysisHours.toFixed(1)}h
                  </span>
                </div>
                <Progress value={timeBreakdown.auditPercent} className="h-2 mt-1" />
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/20">
              <Cpu className="w-5 h-5 text-cyan-500" />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">System Processing Time</span>
                  <span className="text-sm font-bold text-cyan-700 dark:text-cyan-400" data-testid="text-system-hours">
                    {timeBreakdown.systemProcessingHours.toFixed(1)}h
                  </span>
                </div>
                <Progress value={timeBreakdown.systemPercent} className="h-2 mt-1" />
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed">
              <Zap className="w-5 h-5 text-primary" />
              <div className="flex-1 flex justify-between items-center">
                <span className="text-sm font-semibold">Total Project Time</span>
                <span className="text-lg font-bold" data-testid="text-total-hours">{timeBreakdown.totalHours.toFixed(1)}h</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Registro de Horas</CardTitle>
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" data-testid="button-add-time-entry">
                  <Plus className="w-4 h-4 mr-1" /> Registrar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Tempo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label>Categoria</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger data-testid="select-time-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client_response">Client Response Time</SelectItem>
                        <SelectItem value="audit_analysis">Audit Analysis Time</SelectItem>
                        <SelectItem value="system_processing">System Processing Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Horas</Label>
                    <Input type="number" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Ex: 2.5" data-testid="input-time-hours" />
                  </div>
                  <div>
                    <Label>Descricao</Label>
                    <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descricao da atividade" data-testid="input-time-description" />
                  </div>
                  <Button
                    className="w-full"
                    disabled={!hours || addMutation.isPending}
                    onClick={() => addMutation.mutate({ category, hours: parseFloat(hours), description: desc })}
                    data-testid="button-submit-time-entry"
                  >
                    {addMutation.isPending ? "Registrando..." : "Registrar"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {timeEntries.map((entry) => {
              const cat = categoryLabels[entry.category] || categoryLabels.audit_analysis;
              const CatIcon = cat.icon;
              return (
                <div key={entry.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 text-sm" data-testid={`time-entry-${entry.id}`}>
                  <CatIcon className={`w-4 h-4 shrink-0 ${cat.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${cat.color}`}>{cat.label}</span>
                      <span className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString("pt-BR")}</span>
                    </div>
                    {entry.description && <p className="text-xs text-muted-foreground truncate">{entry.description}</p>}
                  </div>
                  <span className="font-medium text-sm shrink-0">{parseFloat(entry.hours).toFixed(1)}h</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0"
                    onClick={() => deleteMutation.mutate(entry.id)}
                    data-testid={`button-delete-time-${entry.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
            {timeEntries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4" data-testid="text-no-time-entries">
                Nenhum registro de tempo
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PhaseManager({ projectId, phases }: { projectId: string; phases: TrackerPhase[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("5");
  const [deliverables, setDeliverables] = useState("");
  const { toast } = useToast();

  const addMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", `/api/tracker/projects/${projectId}/phases`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracker/projects", projectId, "dashboard"] });
      setShowAdd(false);
      setName("");
      setDeliverables("");
      toast({ title: "Fase adicionada" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const body: any = { status };
      if (status === "completed") body.actualEndDate = new Date().toISOString();
      if (status === "in_progress" && !phases.find(p => p.id === id)?.startDate) {
        body.startDate = new Date().toISOString();
      }
      const res = await apiRequest("PUT", `/api/tracker/phases/${id}`, body);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracker/projects", projectId, "dashboard"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/tracker/phases/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracker/projects", projectId, "dashboard"] });
    },
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Gerenciar Fases</CardTitle>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" data-testid="button-add-phase">
                <Plus className="w-4 h-4 mr-1" /> Fase
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Fase</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Nome</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da fase" data-testid="input-phase-name" />
                </div>
                <div>
                  <Label>Dias estimados</Label>
                  <Input type="number" value={estimatedDays} onChange={(e) => setEstimatedDays(e.target.value)} data-testid="input-phase-days" />
                </div>
                <div>
                  <Label>Entregaveis</Label>
                  <Textarea value={deliverables} onChange={(e) => setDeliverables(e.target.value)} placeholder="Entregaveis da fase" data-testid="input-phase-deliverables" />
                </div>
                <Button
                  className="w-full"
                  disabled={!name || addMutation.isPending}
                  onClick={() => addMutation.mutate({ name, estimatedDays: parseInt(estimatedDays), deliverables, orderIndex: phases.length })}
                  data-testid="button-submit-phase"
                >
                  {addMutation.isPending ? "Adicionando..." : "Adicionar Fase"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {phases.map((phase) => {
            const config = statusConfig[phase.status] || statusConfig.not_started;
            return (
              <div key={phase.id} className="flex items-center gap-3 p-2 rounded-md border" data-testid={`phase-manage-${phase.id}`}>
                <span className="text-xs text-muted-foreground w-5">{phase.orderIndex + 1}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{phase.name}</span>
                </div>
                <Select
                  value={phase.status}
                  onValueChange={(status) => updateStatusMutation.mutate({ id: phase.id, status })}
                >
                  <SelectTrigger className="w-[140px] h-8 text-xs" data-testid={`select-phase-status-${phase.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Nao iniciado</SelectItem>
                    <SelectItem value="in_progress">Em andamento</SelectItem>
                    <SelectItem value="completed">Concluido</SelectItem>
                    <SelectItem value="delayed">Atrasado</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 shrink-0"
                  onClick={() => deleteMutation.mutate(phase.id)}
                  data-testid={`button-delete-phase-${phase.id}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AuraTracker() {
  const { user } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const { data: projects = [], isLoading: loadingProjects } = useQuery<TrackerProject[]>({
    queryKey: ["/api/tracker/projects"],
  });

  const { data: dashboard, isLoading: loadingDashboard } = useQuery<DashboardData>({
    queryKey: ["/api/tracker/projects", selectedProjectId, "dashboard"],
    enabled: !!selectedProjectId,
  });

  const isAdmin = user?.role === "admin";

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
          <Activity className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight" data-testid="text-page-title">AuraTRACK</h1>
          <p className="text-sm text-muted-foreground">Audit Timeline Engine — Transparencia Operacional</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          {loadingProjects ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <ProjectSelector
              projects={projects}
              selectedId={selectedProjectId}
              onSelect={setSelectedProjectId}
            />
          )}
        </div>

        <div className="lg:col-span-3">
          {!selectedProjectId ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Activity className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">Selecione um projeto</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Escolha um projeto para visualizar a timeline, status e timesheet operacional
                </p>
              </CardContent>
            </Card>
          ) : loadingDashboard ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : dashboard ? (
            <div className="space-y-6">
              <Tabs defaultValue="timeline">
                <TabsList className="grid w-full grid-cols-3" data-testid="tabs-tracker-views">
                  <TabsTrigger value="timeline" data-testid="tab-timeline">
                    <ArrowRight className="w-4 h-4 mr-1" /> Timeline
                  </TabsTrigger>
                  <TabsTrigger value="status" data-testid="tab-status">
                    <Activity className="w-4 h-4 mr-1" /> Status
                  </TabsTrigger>
                  <TabsTrigger value="timesheet" data-testid="tab-timesheet">
                    <Timer className="w-4 h-4 mr-1" /> Timesheet
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="timeline" className="mt-4">
                  <TimelineView dashboard={dashboard} />
                </TabsContent>
                <TabsContent value="status" className="mt-4">
                  <StatusDashboard dashboard={dashboard} />
                </TabsContent>
                <TabsContent value="timesheet" className="mt-4">
                  <TimesheetPanel dashboard={dashboard} projectId={selectedProjectId} />
                </TabsContent>
              </Tabs>

              {isAdmin && (
                <PhaseManager projectId={selectedProjectId} phases={dashboard.phases} />
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

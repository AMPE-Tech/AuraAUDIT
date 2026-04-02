import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Database, CreditCard, Globe, Building2, FileCheck, BarChart3,
  CheckCircle2, Clock, AlertTriangle, Upload, Shield, Calendar,
  ChevronDown, ChevronUp, Landmark, FileBarChart, Award,
  LayoutGrid, List, User, FileText, ExternalLink, Send,
  PanelRightOpen, PanelRightClose, Download,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AUDIT_ROADMAP, KANBAN_COLUMNS, type RoadmapStatus } from "@/lib/audit-roadmap-data";

// ── Types ─────────────────────────────────────────────────────────────
type DataStatus = "pending" | "received" | "partial" | "processing";

const DATA_STATUS_META: Record<DataStatus, { label: string; class: string; icon: React.ReactNode }> = {
  pending:    { label: "Pendente",    class: "bg-slate-500/20 text-slate-400 border-slate-500/30",     icon: <Clock className="w-3 h-3" /> },
  received:   { label: "Recebido",    class: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: <CheckCircle2 className="w-3 h-3" /> },
  partial:    { label: "Parcial",     class: "bg-amber-500/20 text-amber-400 border-amber-500/30",     icon: <AlertTriangle className="w-3 h-3" /> },
  processing: { label: "Processando", class: "bg-blue-500/20 text-blue-400 border-blue-500/30",        icon: <Clock className="w-3 h-3 animate-spin" /> },
};

const ROADMAP_STATUS: Record<RoadmapStatus, { label: string; class: string; icon: React.ReactNode }> = {
  pending:     { label: "Aguardando", class: "bg-slate-500/20 text-slate-400 border-slate-500/30",     icon: <Clock className="w-3 h-3" /> },
  in_progress: { label: "Em curso",   class: "bg-blue-500/20 text-blue-400 border-blue-500/30",        icon: <Clock className="w-3 h-3" /> },
  done:        { label: "Concluído",  class: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: <CheckCircle2 className="w-3 h-3" /> },
  critical:    { label: "Urgente",    class: "bg-red-500/20 text-red-400 border-red-500/30",           icon: <AlertTriangle className="w-3 h-3" /> },
};

type DeliverableStatus = "pending" | "in_progress" | "delivered" | "approved";
type ReconciliationStatus = "pending" | "in_progress" | "done" | "divergent";

const DELIVERABLE_STATUS: Record<DeliverableStatus, { label: string; class: string }> = {
  pending:     { label: "Aguardando dados", class: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
  in_progress: { label: "Em elaboração",    class: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  delivered:   { label: "Entregue",         class: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  approved:    { label: "Aprovado",         class: "bg-green-500/20 text-green-300 border-green-500/30" },
};

const RECONCILIATION_STATUS: Record<ReconciliationStatus, { label: string; class: string }> = {
  pending:     { label: "Pendente",    class: "bg-slate-500/20 text-slate-400" },
  in_progress: { label: "Em curso",    class: "bg-blue-500/20 text-blue-400" },
  done:        { label: "Concluído",   class: "bg-emerald-500/20 text-emerald-400" },
  divergent:   { label: "Divergência", class: "bg-red-500/20 text-red-400" },
};

// ── Data Sources (9 fontes do plano aprovado) ─────────────────────────
const DATA_SOURCES = [
  {
    id: "cards",
    icon: <CreditCard className="w-5 h-5 text-emerald-400" />,
    title: "Extratos Bancários",
    subtitle: "Itaú e Bradesco",
    description: "Extratos completos dos exercícios 2024 e 2025 em formato OFX ou XLSX.",
    format: "OFX / XLSX",
    period: "Jan/2024 – Dez/2025",
    status: "pending" as DataStatus,
    deadline: "14/04/2026",
  },
  {
    id: "clara",
    icon: <CreditCard className="w-5 h-5 text-purple-400" />,
    title: "Fatura Clara (Mastercard)",
    subtitle: "Cartão corporativo",
    description: "Faturas mensais do cartão corporativo Clara — exercícios 2024 e 2025.",
    format: "CSV / PDF",
    period: "Jan/2024 – Dez/2025",
    status: "pending" as DataStatus,
    deadline: "11/04/2026",
  },
  {
    id: "erp",
    icon: <Database className="w-5 h-5 text-blue-400" />,
    title: "Exportação Stur Web",
    subtitle: "Lançamentos financeiros",
    description: "Exportação completa de lançamentos financeiros do Stur Web (versão Full) via FTP ou Webhook.",
    format: "XML / JSON / FTP",
    period: "Jan/2024 – Dez/2025",
    status: "pending" as DataStatus,
    deadline: "07/04/2026",
  },
  {
    id: "reports",
    icon: <FileBarChart className="w-5 h-5 text-amber-400" />,
    title: "Notas Fiscais 2025",
    subtitle: "NFS-e ABRASF",
    description: "Notas fiscais de serviço emitidas e recebidas — Prefeitura de Curitiba.",
    format: "XML ABRASF",
    period: "Jan/2025 – Dez/2025",
    status: "pending" as DataStatus,
    deadline: "14/04/2026",
  },
  {
    id: "bsp",
    icon: <Landmark className="w-5 h-5 text-red-400" />,
    title: "BSPLink IATA",
    subtitle: "Bilhetes e reconciliações",
    description: "Relatórios BSP quinzenais — bilhetes emitidos, ADMs, refunds e settlement.",
    format: "TXT BSP / Portal IATA",
    period: "Jan/2024 – Dez/2025",
    status: "pending" as DataStatus,
    deadline: "18/04/2026",
  },
  {
    id: "obt",
    icon: <Globe className="w-5 h-5 text-blue-400" />,
    title: "OBTs (Argo / Reserve / TravelPerk)",
    subtitle: "Reservas e PNRs",
    description: "Exportação de reservas, PNRs emitidos, cancelamentos e alterações dos períodos 2024 e 2025.",
    format: "CSV / API / SFTP",
    period: "Jan/2024 – Dez/2025",
    status: "pending" as DataStatus,
    deadline: "18/04/2026",
  },
  {
    id: "agencies",
    icon: <Building2 className="w-5 h-5 text-pink-400" />,
    title: "Fornecedores de Hospedagem",
    subtitle: "Accor, Atlântica, Omnibees, CM.net",
    description: "Faturas, comissionamentos e acordos comerciais com redes hoteleiras.",
    format: "XLSX / CSV / PDF",
    period: "Jan/2024 – Dez/2025",
    status: "pending" as DataStatus,
    deadline: "18/04/2026",
  },
  {
    id: "vehicles",
    icon: <Globe className="w-5 h-5 text-teal-400" />,
    title: "Locadoras e Seguros",
    subtitle: "Localiza, Movida, AssistCard",
    description: "Faturas e comissões de locadoras de veículos e seguros viagem.",
    format: "XLSX / PDF",
    period: "Jan/2024 – Dez/2025",
    status: "pending" as DataStatus,
    deadline: "18/04/2026",
  },
  {
    id: "contracts",
    icon: <FileCheck className="w-5 h-5 text-teal-400" />,
    title: "Contratos e Acordos Comerciais",
    subtitle: "BV, overcommissions, DU/RAV",
    description: "Contratos vigentes com fornecedores, acordos de BV, DU/RAV, overcommission e incentivos.",
    format: "PDF / DOCX",
    period: "Vigência 2024/2025",
    status: "pending" as DataStatus,
    deadline: "11/04/2026",
  },
];

// ── Reconciliations ───────────────────────────────────────────────────
const RECONCILIATIONS = [
  { id: "obt-erp", title: "OBT vs Backoffice", description: "Cruzamento de reservas OBT com emissões e faturamento no Stur Web.", status: "pending" as ReconciliationStatus, sources: ["OBT", "Stur Web"] },
  { id: "cards-reservations", title: "Cartões vs Reservas", description: "Conciliação de lançamentos nos extratos de cartão com reservas confirmadas.", status: "pending" as ReconciliationStatus, sources: ["Clara", "Itaú", "Bradesco", "OBTs"] },
  { id: "bsp-airlines", title: "BSP vs Cias Aéreas", description: "Validação do settlement BSP contra bilhetes emitidos e comissões.", status: "pending" as ReconciliationStatus, sources: ["BSPLink", "GDS"] },
  { id: "hotel-invoices", title: "Hotel vs Faturas", description: "Comparação entre vouchers hoteleiros e faturas das redes.", status: "pending" as ReconciliationStatus, sources: ["Accor", "Atlântica", "Omnibees"] },
  { id: "fees-rebates", title: "Fees e Rebates", description: "Auditoria de taxas de serviço, BV, DU/RAV, overcommission.", status: "pending" as ReconciliationStatus, sources: ["Stur Web", "Contratos", "BSPLink"] },
];

// ── Deliverables ──────────────────────────────────────────────────────
const DELIVERABLES = [
  { id: "exec-report", icon: <FileText className="w-4 h-4 text-blue-400" />, title: "Relatório Executivo de Auditoria", status: "pending" as DeliverableStatus },
  { id: "tech-report", icon: <FileBarChart className="w-4 h-4 text-purple-400" />, title: "Relatório Técnico Detalhado", status: "pending" as DeliverableStatus },
  { id: "risk-matrix", icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, title: "Matriz de Riscos e Anomalias", status: "pending" as DeliverableStatus },
  { id: "legal-opinion", icon: <Shield className="w-4 h-4 text-red-400" />, title: "Parecer de Conformidade Legal", status: "pending" as DeliverableStatus },
  { id: "action-plan", icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, title: "Plano de Ações Corretivas", status: "pending" as DeliverableStatus },
  { id: "dashboard", icon: <BarChart3 className="w-4 h-4 text-indigo-400" />, title: "Dashboard Interativo de Resultados", status: "pending" as DeliverableStatus },
  { id: "custody-chain", icon: <Award className="w-4 h-4 text-teal-400" />, title: "Cadeia de Custódia Digital AuraCERTIFIED", status: "pending" as DeliverableStatus },
];

// ══════════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════════
export default function AuraAuditStabiaPanel() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dataSources, setDataSources] = useState(DATA_SOURCES);
  const [uploading, setUploading] = useState(false);
  const [uploadSourceId, setUploadSourceId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("cronograma");
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(["Fase 1"]));
  const [roadmapView, setRoadmapView] = useState<"list" | "kanban">("kanban");

  const receivedCount = dataSources.filter((s) => s.status === "received").length;
  const pendingCount = dataSources.length - receivedCount;

  // ── Upload logic ────────────────────────────────────────────────────
  const handleUploadClick = (sourceId: string) => {
    setUploadSourceId(sourceId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !uploadSourceId) return;

    setUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }
      formData.append("clientId", "stabia");
      formData.append("sourceId", uploadSourceId);
      formData.append("category", "audit-data-source");

      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload falhou");

      // Atualizar state local
      setDataSources((prev) =>
        prev.map((s) => s.id === uploadSourceId ? { ...s, status: "received" as DataStatus } : s)
      );

      // Persistir no servidor
      await fetch("/api/stabia/source-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: uploadSourceId, status: "received" }),
      });

      toast({ title: "Arquivo enviado com sucesso", description: `Fonte marcada como recebida` });
    } catch {
      toast({ title: "Erro no upload", description: "Tente novamente ou use o WeTransfer", variant: "destructive" });
    } finally {
      setUploading(false);
      setUploadSourceId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const togglePhase = (phase: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      next.has(phase) ? next.delete(phase) : next.add(phase);
      return next;
    });
  };

  const handleExportCSV = () => {
    const rows = [
      ["Fase", "Tarefa", "Início", "Fim", "Responsável", "Status"],
      ...AUDIT_ROADMAP.flatMap((phase) =>
        phase.tasks.map((task) => [phase.phase, task.title, task.start, task.end, task.responsible, ROADMAP_STATUS[task.status]?.label || task.status])
      ),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "AuraAUDIT_Cronograma_Stabia.csv"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Cronograma exportado" });
  };

  const handleExportICS = () => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const toICSDate = (ddmm: string) => { const [d, m] = ddmm.split("/").map(Number); return `2026${pad(m)}${pad(d)}`; };
    const lines: string[] = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//AuraAUDIT//Stabia//PT",
      "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:AuraAUDIT – Grupo Stabia",
    ];
    AUDIT_ROADMAP.forEach((phase) => {
      phase.tasks.forEach((task) => {
        lines.push("BEGIN:VEVENT", `UID:${task.id}@auraaudit.com`,
          `SUMMARY:[${phase.phase}] ${task.title}`, `DTSTART;VALUE=DATE:${toICSDate(task.start)}`,
          `DTEND;VALUE=DATE:${toICSDate(task.end)}`,
          `DESCRIPTION:Responsável: ${task.responsible}\\nFase: ${phase.title}`,
          "END:VEVENT");
      });
    });
    lines.push("END:VCALENDAR");
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "AuraAUDIT_Stabia.ics"; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Calendário exportado", description: "Abra o .ics no Outlook, Google Calendar ou Apple Calendar" });
  };

  const allTasks = AUDIT_ROADMAP.flatMap((phase) =>
    phase.tasks.map((task) => ({ ...task, phaseName: phase.phase, phaseTitle: phase.title, badgeClass: phase.badgeClass }))
  );

  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════
  return (
    <div className="flex gap-0 relative" data-testid="auraaudit-stabia-panel">
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" multiple accept=".csv,.xlsx,.xls,.ofx,.xml,.json,.pdf,.txt,.docx,.zip" className="hidden" onChange={handleFileChange} />

      {/* ══════════ MAIN CONTENT — Visão do Cliente ══════════ */}
      <div className={`flex-1 space-y-6 transition-all ${sidebarOpen ? "pr-4" : ""}`}>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">AUDITORIA RETROATIVA</Badge>
              <Badge variant="outline" className="bg-slate-500/20 text-slate-400 border-slate-500/30 text-xs">2024 / 2025</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Auditoria de despesas corporativas — Grupo Stabia · Prazo: <strong className="text-amber-400">04/07/2026</strong>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="gap-2">
            {sidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            {sidebarOpen ? "Fechar detalhes" : "Ver detalhes"}
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Database className="w-4 h-4" />Fontes de Dados</div>
              <p className="text-2xl font-bold">{receivedCount}<span className="text-sm text-muted-foreground font-normal">/{dataSources.length}</span></p>
              <p className="text-xs text-muted-foreground">recebidas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-amber-400 text-xs mb-1"><AlertTriangle className="w-4 h-4" />Pendentes</div>
              <p className="text-2xl font-bold text-amber-400">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">aguardando envio</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Calendar className="w-4 h-4" />Prazo Fase 1</div>
              <p className="text-2xl font-bold text-red-400">18/04</p>
              <p className="text-xs text-muted-foreground">coleta de dados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1"><Calendar className="w-4 h-4" />Entrega Final</div>
              <p className="text-2xl font-bold text-emerald-400">04/07</p>
              <p className="text-xs text-muted-foreground">relatório + custódia</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerta de dados pendentes */}
        {pendingCount > 0 && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-400">Aguardando envio de {pendingCount} fonte{pendingCount > 1 ? "s" : ""} de dados</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Envie os dados pelo <strong>upload direto</strong> abaixo ou via <strong>WeTransfer</strong> para <strong>marcos@auratech.com.br</strong>.
                    Quanto antes recebermos, mais rápido iniciamos a auditoria.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <a href="https://wetransfer.com" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-2 text-xs">
                        <ExternalLink className="w-3 h-3" />WeTransfer
                      </Button>
                    </a>
                    <a href="mailto:marcos@auratech.com.br?subject=Dados%20Auditoria%20Grupo%20Stabia">
                      <Button variant="outline" size="sm" className="gap-2 text-xs">
                        <Send className="w-3 h-3" />Email
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-medium">Progresso da coleta de dados</span>
            <span className="text-xs text-muted-foreground">{Math.round((receivedCount / dataSources.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${(receivedCount / dataSources.length) * 100}%` }}
            />
          </div>
        </div>

        {/* ── Lista de Fontes de Dados ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              Fontes de Dados Requeridas
            </h3>
            <span className="text-xs text-muted-foreground">{receivedCount}/{dataSources.length} recebidas</span>
          </div>

          <div className="space-y-3">
            {dataSources.map((source) => {
              const meta = DATA_STATUS_META[source.status];
              return (
                <Card key={source.id} className={source.status === "received" ? "border-emerald-500/20 opacity-75" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-0.5">{source.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-sm">{source.title}</span>
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">{source.subtitle}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{source.description}</p>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                            <span>Formato: <strong>{source.format}</strong></span>
                            <span>·</span>
                            <span>Período: {source.period}</span>
                            <span>·</span>
                            <span>Prazo: <strong className="text-amber-400">{source.deadline}</strong></span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <Badge variant="outline" className={`text-[10px] flex items-center gap-1 ${meta.class}`}>
                          {meta.icon}{meta.label}
                        </Badge>
                        {source.status === "pending" && (
                          <Button
                            variant="outline" size="sm" className="text-[11px] h-7 gap-1"
                            onClick={() => handleUploadClick(source.id)}
                            disabled={uploading}
                          >
                            <Upload className="w-3 h-3" />
                            {uploading && uploadSourceId === source.id ? "Enviando..." : "Enviar arquivo"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Credenciais Prefeitura de Curitiba */}
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-400">Credenciais necessárias — Prefeitura de Curitiba</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Para integrarmos e baixarmos as <strong>Notas Fiscais de Serviço (NFS-e)</strong> diretamente do sistema da Prefeitura de Curitiba,
                  precisamos receber as <strong>credenciais de acesso ao portal NFS-e ABRASF</strong> e o <strong>certificado digital A1 (arquivo .pfx + senha)</strong> da empresa.
                </p>
                <div className="mt-2 p-2 rounded-md bg-red-500/5 border border-red-500/15 text-[11px] text-muted-foreground space-y-1">
                  <p>• <strong className="text-red-400">Login e senha</strong> do portal NFS-e da Prefeitura de Curitiba</p>
                  <p>• <strong className="text-red-400">Certificado digital A1</strong> (.pfx) com a respectiva senha</p>
                  <p>• <strong className="text-red-400">CNPJ</strong> da empresa emitente</p>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Envie via canal seguro (email criptografado ou upload direto na plataforma). Sem essas credenciais, a integração fiscal ficará pendente.
                </p>
                <a href="mailto:marcos@auratech.com.br?subject=Credenciais%20NFS-e%20Prefeitura%20Curitiba%20-%20Grupo%20Stabia">
                  <Button variant="outline" size="sm" className="gap-2 text-xs mt-2 border-red-500/30 text-red-400 hover:bg-red-500/10">
                    <Send className="w-3 h-3" />Enviar credenciais por email seguro
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alternativa WeTransfer */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-400">Prefere enviar por WeTransfer?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Envie para <strong>marcos@auratech.com.br</strong> indicando o nome da fonte no assunto.
                  Marcaremos como recebido assim que validarmos o arquivo.
                </p>
                <a href="https://wetransfer.com" target="_blank" rel="noopener noreferrer" className="inline-block mt-2">
                  <Button variant="outline" size="sm" className="gap-2 text-xs">
                    <ExternalLink className="w-3 h-3" />Abrir WeTransfer
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ══════════ SIDEBAR — Detalhes Técnicos (oculto por padrão) ══════════ */}
      {sidebarOpen && (
        <div className="w-[480px] border-l border-border pl-4 space-y-4 overflow-y-auto max-h-[calc(100vh-120px)] flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Detalhes do Projeto</h3>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <PanelRightClose className="w-4 h-4" />
            </Button>
          </div>

          <Tabs value={sidebarTab} onValueChange={setSidebarTab}>
            <TabsList className="w-full">
              <TabsTrigger value="cronograma" className="flex-1 text-xs">Cronograma</TabsTrigger>
              <TabsTrigger value="reconciliacoes" className="flex-1 text-xs">Reconciliações</TabsTrigger>
              <TabsTrigger value="entregaveis" className="flex-1 text-xs">Entregáveis</TabsTrigger>
            </TabsList>

            {/* ── Cronograma ── */}
            <TabsContent value="cronograma" className="space-y-3 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{AUDIT_ROADMAP.reduce((a, p) => a + p.tasks.length, 0)} tarefas · 4 fases · 90 dias</span>
                <div className="flex gap-1">
                  <div className="flex items-center rounded-md border bg-muted/30 p-0.5">
                    <button onClick={() => setRoadmapView("kanban")} className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${roadmapView === "kanban" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}>
                      <LayoutGrid className="w-3 h-3" />Kanban
                    </button>
                    <button onClick={() => setRoadmapView("list")} className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${roadmapView === "list" ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}>
                      <List className="w-3 h-3" />Lista
                    </button>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportICS} className="h-7 text-[10px] px-2">
                    <Calendar className="w-3 h-3 mr-1" />.ics
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-7 text-[10px] px-2">
                    <Download className="w-3 h-3 mr-1" />CSV
                  </Button>
                </div>
              </div>

              {/* Kanban */}
              {roadmapView === "kanban" && (
                <div className="grid grid-cols-2 gap-3">
                  {KANBAN_COLUMNS.map((col) => {
                    const tasks = allTasks.filter((t) => t.status === col.status);
                    return (
                      <div key={col.status} className={`rounded-lg border ${col.borderClass} flex flex-col`}>
                        <div className={`flex items-center justify-between px-2 py-1.5 rounded-t-lg ${col.headerClass} border-b ${col.borderClass}`}>
                          <span className="text-[10px] font-semibold">{col.label}</span>
                          <span className="text-[10px] bg-background/40 rounded-full px-1.5 font-bold">{tasks.length}</span>
                        </div>
                        <div className="flex flex-col gap-1.5 p-1.5 flex-1 min-h-[60px]">
                          {tasks.length === 0 && <div className="text-center py-4 text-[10px] text-muted-foreground">Nenhuma</div>}
                          {tasks.map((task) => (
                            <div key={task.id} className="bg-background rounded border border-border p-2 space-y-1">
                              <Badge variant="outline" className={`text-[8px] ${task.badgeClass}`}>{task.phaseName}</Badge>
                              <p className="text-[10px] font-medium leading-snug">{task.title}</p>
                              <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                                <span>{task.start}–{task.end}</span>
                                <span>{task.responsible.split(" / ")[0]}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* List */}
              {roadmapView === "list" && AUDIT_ROADMAP.map((phase) => {
                const isOpen = expandedPhases.has(phase.phase);
                return (
                  <Card key={phase.phase} className={`border-l-4 ${phase.color} overflow-hidden`}>
                    <button className="w-full text-left p-3 bg-muted/10 flex items-center justify-between hover:bg-muted/20 transition-colors" onClick={() => togglePhase(phase.phase)}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] ${phase.badgeClass}`}>{phase.phase}</Badge>
                        <div>
                          <p className="font-medium text-xs">{phase.title}</p>
                          <p className="text-[10px] text-muted-foreground">{phase.dates}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">{phase.tasks.length}</span>
                        {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="divide-y divide-border">
                        {phase.tasks.map((task) => {
                          const cfg = ROADMAP_STATUS[task.status];
                          return (
                            <div key={task.id} className="px-3 py-2 text-xs hover:bg-muted/10">
                              <div className="flex items-start justify-between gap-2">
                                <p className="leading-snug flex-1">{task.title}</p>
                                <Badge variant="outline" className={`text-[8px] flex items-center gap-0.5 shrink-0 ${cfg.class}`}>{cfg.icon}{cfg.label}</Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                                <span>{task.start}–{task.end}</span>
                                <span>{task.responsible}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                );
              })}
            </TabsContent>

            {/* ── Reconciliações ── */}
            <TabsContent value="reconciliacoes" className="space-y-2 mt-3">
              <p className="text-xs text-muted-foreground">5 reconciliações previstas — iniciadas após recebimento das fontes.</p>
              {RECONCILIATIONS.map((r) => (
                <Card key={r.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{r.title}</span>
                      <Badge variant="outline" className={`text-[9px] ${RECONCILIATION_STATUS[r.status].class}`}>{RECONCILIATION_STATUS[r.status].label}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-1.5">{r.description}</p>
                    <div className="flex gap-1 flex-wrap">{r.sources.map((s) => <Badge key={s} variant="outline" className="text-[8px]">{s}</Badge>)}</div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* ── Entregáveis ── */}
            <TabsContent value="entregaveis" className="space-y-2 mt-3">
              <p className="text-xs text-muted-foreground">7 entregáveis acordados — disponibilizados progressivamente.</p>
              {DELIVERABLES.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-2 rounded-md bg-muted/20">
                  <div className="flex items-center gap-2">
                    {d.icon}
                    <span className="text-xs">{d.title}</span>
                  </div>
                  <Badge variant="outline" className={`text-[9px] ${DELIVERABLE_STATUS[d.status].class}`}>{DELIVERABLE_STATUS[d.status].label}</Badge>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

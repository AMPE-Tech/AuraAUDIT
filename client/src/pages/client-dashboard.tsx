import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  Shield,
  Plane,
  CalendarDays,
  Clock,
  FileText,
  Upload,
  CheckCircle2,
  Circle,
  AlertCircle,
  Database,
  Monitor,
  ArrowRight,
  Info,
  Lock,
  ListChecks,
  PenTool,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";

const SCOPE_ITEMS = [
  "Conformidade com politicas de viagens",
  "Governanca e controles",
  "Integridade de dados",
  "Conformidade contratual",
  "Controles e aprovacoes",
  "Falhas operacionais",
  "Vulnerabilidades financeiras",
  "Avaliacao de riscos",
  "Oportunidades de otimizacao",
];

const EXPECTED_DATA = [
  { source: "OBT Reserve", type: "Reservas e PNRs", status: "pending" },
  { source: "OBT Argo", type: "Reservas e PNRs", status: "pending" },
  { source: "Backoffice Wintour", type: "Emissoes e faturamento 2024", status: "pending" },
  { source: "Backoffice Stur", type: "Emissoes e faturamento 2025", status: "pending" },
  { source: "Cartoes Corporativos", type: "Extratos Bradesco EBTA", status: "pending" },
  { source: "GDS Sabre / Amadeus", type: "Dados de PNR", status: "pending" },
  { source: "BSPlink", type: "Faturamento e settlement", status: "pending" },
  { source: "Agencias (CVC, Flytour, BRT)", type: "Management files", status: "pending" },
];

export default function ClientDashboard() {
  const { user } = useAuth();

  const { data: signatureData, isLoading: isLoadingSignature } = useQuery<{
    signed: boolean;
    signature: {
      signerName: string;
      signedAt: string;
    } | null;
  }>({
    queryKey: ["/api/contract/signature"],
  });

  const contractSigned = signatureData?.signed === true;

  const PROJECT_PHASES = [
    {
      phase: "Fase 00",
      title: "Contrato Assinado",
      description: "Assinatura digital do contrato com registro de IP, SHA-256 e timestamp conforme Lei 14.063/2020.",
      status: contractSigned ? ("completed" as const) : ("blocking" as const),
      detail: contractSigned
        ? `Assinado por ${signatureData?.signature?.signerName} em ${new Date(signatureData?.signature?.signedAt || "").toLocaleDateString("pt-BR")}`
        : "Pendente — assine o contrato para iniciar o projeto",
    },
    {
      phase: "Fase 01",
      title: "Proposta Comercial",
      description: "Apresentacao da proposta, definicao de escopo, volumes, sistemas e entregaveis.",
      status: "completed" as const,
      detail: "Proposta aceita pelo cliente",
    },
    {
      phase: "Fase 02",
      title: "Onboarding & Acessos",
      description: "Cadastro do cliente na plataforma, definicao de acessos, alinhamento de expectativas e prazos.",
      status: contractSigned ? ("in_progress" as const) : ("locked" as const),
      detail: contractSigned
        ? "Acesso ao portal concedido — aguardando envio de dados"
        : "Bloqueado — requer assinatura do contrato",
    },
    {
      phase: "Fase 03",
      title: "Coleta de Dados",
      description: "Recebimento das bases de dados dos sistemas (OBT, Backoffice, cartoes, GDS, BSP) para inicio das analises.",
      status: contractSigned ? ("pending" as const) : ("locked" as const),
      detail: contractSigned
        ? "Aguardando envio pelo cliente"
        : "Bloqueado — requer assinatura do contrato",
    },
    {
      phase: "Fase 04",
      title: "Reconciliacao & Analise",
      description: "Cruzamento e reconciliacao das informacoes, identificacao de inconsistencias, falhas e vulnerabilidades.",
      status: contractSigned ? ("pending" as const) : ("locked" as const),
      detail: contractSigned
        ? "Inicia apos recebimento dos dados"
        : "Bloqueado — requer assinatura do contrato",
    },
    {
      phase: "Fase 05",
      title: "Apresentacao dos Resultados",
      description: "Consolidacao dos achados, dashboards executivos, relatorio tecnico e plano de acao.",
      status: contractSigned ? ("pending" as const) : ("locked" as const),
      detail: contractSigned
        ? "Inicia apos conclusao das analises"
        : "Bloqueado — requer assinatura do contrato",
    },
    {
      phase: "Fase 06",
      title: "Entrega Final",
      description: "Entrega do relatorio executivo e tecnico final, evidence packs e recomendacoes.",
      status: contractSigned ? ("pending" as const) : ("locked" as const),
      detail: contractSigned
        ? "Etapa final do projeto"
        : "Bloqueado — requer assinatura do contrato",
    },
  ];

  function getPhaseStyle(status: string) {
    switch (status) {
      case "completed":
        return "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900";
      case "in_progress":
        return "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900";
      case "blocking":
        return "bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-900";
      case "locked":
        return "bg-muted/30 opacity-50";
      default:
        return "bg-muted/50";
    }
  }

  function getPhaseIcon(status: string) {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-3 h-3 text-emerald-600" />;
      case "in_progress":
        return <Clock className="w-3 h-3 text-amber-600" />;
      case "blocking":
        return <AlertTriangle className="w-3 h-3 text-red-600" />;
      case "locked":
        return <Lock className="w-3 h-3 text-muted-foreground" />;
      default:
        return <Circle className="w-3 h-3 text-muted-foreground" />;
    }
  }

  function getPhaseBadge(status: string) {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="text-[10px] bg-emerald-600">Concluido</Badge>;
      case "in_progress":
        return <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">Em Andamento</Badge>;
      case "blocking":
        return <Badge variant="destructive" className="text-[10px]">Bloqueando</Badge>;
      case "locked":
        return <Badge variant="outline" className="text-[10px] opacity-60">Bloqueado</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">Pendente</Badge>;
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-client-dashboard-title">
            Painel do Projeto
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Auditoria Forense Financeira | {user?.fullName}
          </p>
        </div>
        <Badge variant="outline" className="text-xs gap-1">
          <Shield className="w-3 h-3" />
          Lei 13.964/2019
        </Badge>
      </div>

      {isLoadingSignature ? (
        <Card>
          <CardContent className="p-6 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : !contractSigned ? (
        <Card className="border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/40 shrink-0 mt-0.5">
                <PenTool className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-2 flex-1">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300" data-testid="text-contract-blocking-alert">
                  Contrato pendente de assinatura — Pipeline bloqueado
                </p>
                <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
                  O contrato de prestacao de servicos precisa ser assinado digitalmente para que o projeto inicie formalmente.
                  Todas as fases subsequentes estao bloqueadas ate a assinatura ser concluida.
                </p>
                <Button
                  size="sm"
                  variant="destructive"
                  className="text-xs gap-1.5 mt-1"
                  onClick={() => window.location.href = "/contract"}
                  data-testid="button-go-sign-contract"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  Assinar Contrato Agora
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/40 shrink-0 mt-0.5">
                <Info className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300" data-testid="text-status-banner">
                  Status: Contrato Assinado — Aguardando Dados
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  O contrato foi assinado e o acesso ao portal foi concedido. Os dados abaixo sao os <strong>dados macro informados na proposta</strong>.
                  As analises reais serao iniciadas apos o recebimento dos dados dos sistemas (OBT, Backoffice, GDS, cartoes corporativos).
                  Nenhum dado operacional foi recebido ate o momento.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <Plane className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-semibold" data-testid="text-project-name">Projeto — {user?.fullName}</h2>
            <Badge variant="secondary" className="text-[10px]">Viagens e Eventos</Badge>
          </div>
          <p className="text-[11px] text-muted-foreground mb-4">Dados macro conforme proposta comercial aceita</p>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-3 rounded-md bg-background/60 text-center">
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-volume-2024">R$ 51,3 MI</p>
              <p className="text-[11px] text-muted-foreground">Volume 2024</p>
              <Badge variant="outline" className="text-[9px] mt-1">Proposta</Badge>
            </div>
            <div className="p-3 rounded-md bg-background/60 text-center">
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="text-volume-2025">R$ 39,6 MI</p>
              <p className="text-[11px] text-muted-foreground">Volume 2025</p>
              <Badge variant="outline" className="text-[9px] mt-1">Proposta</Badge>
            </div>
            <div className="p-3 rounded-md bg-background/60 text-center">
              <p className="text-xl font-bold text-violet-600 dark:text-violet-400" data-testid="text-volume-total">R$ 90,9 MI</p>
              <p className="text-[11px] text-muted-foreground">Volume Total</p>
              <Badge variant="outline" className="text-[9px] mt-1">Estimado</Badge>
            </div>
            <div className="p-3 rounded-md bg-background/60 text-center">
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">2024–2025</p>
              <p className="text-[11px] text-muted-foreground">Periodo</p>
              <Badge variant="outline" className="text-[9px] mt-1">Proposta</Badge>
            </div>
            <div className="p-3 rounded-md bg-background/60 text-center">
              <p className="text-xl font-bold text-slate-600 dark:text-slate-400">4</p>
              <p className="text-[11px] text-muted-foreground">Sistemas</p>
              <Badge variant="outline" className="text-[9px] mt-1 cursor-pointer" onClick={() => window.location.href = '/systems'}>Ver sistemas</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="opacity-60">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase">Analisado</p>
            </div>
            <p className="text-xl font-bold text-muted-foreground">—</p>
            <p className="text-[10px] text-muted-foreground mt-1">Aguardando dados</p>
          </CardContent>
        </Card>
        <Card className="opacity-60">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase">Economia</p>
            </div>
            <p className="text-xl font-bold text-muted-foreground">—</p>
            <p className="text-[10px] text-muted-foreground mt-1">Aguardando analises</p>
          </CardContent>
        </Card>
        <Card className="opacity-60">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase">Anomalias</p>
            </div>
            <p className="text-xl font-bold text-muted-foreground">—</p>
            <p className="text-[10px] text-muted-foreground mt-1">Aguardando analises</p>
          </CardContent>
        </Card>
        <Card className="opacity-60">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase">Casos</p>
            </div>
            <p className="text-xl font-bold text-muted-foreground">—</p>
            <p className="text-[10px] text-muted-foreground mt-1">Aguardando analises</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            Andamento do Projeto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {PROJECT_PHASES.map((item) => (
              <div
                key={item.phase}
                className={`p-3 rounded-md ${getPhaseStyle(item.status)} ${item.status === "blocking" ? "ring-1 ring-red-400 dark:ring-red-700" : ""}`}
                data-testid={`card-phase-${item.phase.replace(" ", "-").toLowerCase()}`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <Badge variant="outline" className="text-[10px] font-mono">{item.phase}</Badge>
                  <div className="flex items-center gap-1">
                    {getPhaseIcon(item.status)}
                    {getPhaseBadge(item.status)}
                  </div>
                </div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
                <p className={`text-[10px] font-medium mt-1.5 italic ${
                  item.status === "completed" ? "text-emerald-700 dark:text-emerald-400" :
                  item.status === "in_progress" ? "text-amber-700 dark:text-amber-400" :
                  item.status === "blocking" ? "text-red-700 dark:text-red-400" :
                  "text-muted-foreground"
                }`}>{item.detail}</p>
                {item.status === "blocking" && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="text-[10px] h-6 mt-2 w-full gap-1"
                    onClick={() => window.location.href = "/contract"}
                    data-testid="button-phase-sign-contract"
                  >
                    <PenTool className="w-3 h-3" />
                    Assinar Contrato
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              Dados Esperados
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">Fontes de dados a serem enviadas para inicio das analises</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {EXPECTED_DATA.map((item) => (
                <div key={item.source} className="flex items-center justify-between gap-3 p-2.5 rounded-md bg-muted/50" data-testid={`data-source-${item.source.toLowerCase().replace(/\s/g, '-')}`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex items-center justify-center w-7 h-7 rounded-md bg-muted shrink-0">
                      <Monitor className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{item.source}</p>
                      <p className="text-[10px] text-muted-foreground">{item.type}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0 gap-1">
                    <AlertCircle className="w-2.5 h-2.5" />
                    Pendente
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
              <p className="text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed">
                <strong>Como enviar:</strong> Os dados podem ser enviados via integracao (API/SFTP), upload controlado na plataforma ou exportacao em CSV/XLSX.
                Entre em contato com seu consultor para alinhar o formato e o canal de envio.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Escopo da Auditoria
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">Areas de analise definidas na proposta comercial</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {SCOPE_ITEMS.map((item) => (
                <div key={item} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                  <p className="text-xs">{item}</p>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="space-y-2">
              <p className="text-[11px] font-medium">Reconciliacoes previstas:</p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[10px]">OBT vs Backoffice</Badge>
                <Badge variant="outline" className="text-[10px]">Cartoes vs Reservas</Badge>
                <Badge variant="outline" className="text-[10px]">BSP vs Cias Aereas</Badge>
                <Badge variant="outline" className="text-[10px]">Hotel vs Faturas</Badge>
                <Badge variant="outline" className="text-[10px]">Fees e Rebates</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-primary" />
              Acompanhamento de Entregaveis
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => window.location.href = "/documents"} data-testid="button-go-documents">
              Ver documentos
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">Visao resumida do que foi combinado, entregue e auditado</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {[
              "Relatorio Executivo de Auditoria",
              "Relatorio Tecnico Detalhado",
              "Matriz de Riscos e Anomalias",
              "Parecer de Conformidade Legal",
              "Plano de Recomendacoes e Acoes Corretivas",
              "Dashboard Interativo de Resultados",
              "Cadeia de Custodia Digital Completa",
            ].map((item) => (
              <div key={item} className="flex items-center justify-between gap-3 p-2 rounded-md bg-muted/50">
                <div className="flex items-center gap-2 min-w-0">
                  <Circle className="w-3 h-3 text-muted-foreground shrink-0" />
                  <p className="text-xs truncate">{item}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-[9px]">Aguardando dados</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 dark:border-blue-900">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 shrink-0">
                {contractSigned ? (
                  <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <PenTool className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold" data-testid="text-next-step">
                  {contractSigned ? "Proximo passo: Envio dos dados" : "Proximo passo: Assinar o contrato"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {contractSigned
                    ? "Envie os dados dos sistemas listados acima para iniciarmos as analises reais do projeto."
                    : "Assine o contrato digitalmente para desbloquear o pipeline e iniciar o projeto."}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="text-xs shrink-0"
              onClick={() => window.location.href = contractSigned ? "/integrations" : "/contract"}
              data-testid={contractSigned ? "button-go-integrations" : "button-go-contract"}
            >
              {contractSigned ? "Ver integracoes" : "Assinar contrato"}
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3" />
          <span>Cadeia de Custodia Digital — AuraDue</span>
        </div>
        <span>AuraAUDIT — Auditoria Forense Independente</span>
      </div>
    </div>
  );
}

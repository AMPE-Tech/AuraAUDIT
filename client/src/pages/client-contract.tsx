import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  FileText,
  Shield,
  CalendarDays,
  CheckCircle,
  Clock,
  Target,
  Scale,
  PenTool,
  Lock,
  AlertTriangle,
  ListChecks,
  FileCheck,
  Loader2,
  Hash,
  Globe,
  Monitor,
  MessageCircle,
  Send,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { validateCPF, formatCPF } from "@shared/validators";

const CONTRACT_DATA = {
  number: "AUR-2025-0042",
  client: "Grupo Stabia",
  startDate: "2025-01-15",
  endDate: "2025-12-31",
  type: "Auditoria Forense em Viagens e Eventos",
  scope: [
    "Auditoria forense completa em despesas de viagens corporativas e eventos",
    "Analise de conformidade com politicas internas de viagens",
    "Reconciliacao entre sistemas OBT (Reserve, Argo) e Backoffice (Wintour, Stur)",
    "Identificacao de anomalias, duplicidades e fraudes potenciais",
    "Cruzamento de dados com fontes externas (companhias aereas, agencias, EBTA)",
    "Avaliacao de eficiencia operacional e oportunidades de economia",
    "Verificacao de aderencia a Lei 13.964/2019 e normas anticorrupcao",
  ],
  deliverables: [
    { name: "Relatorio Executivo de Auditoria", deadline: "A cada fase concluida", status: "pendente" },
    { name: "Relatorio Tecnico Detalhado", deadline: "Ao final do projeto", status: "pendente" },
    { name: "Matriz de Riscos e Anomalias", deadline: "Fase 03 — Reconciliacao", status: "pendente" },
    { name: "Parecer de Conformidade Legal", deadline: "Fase 04 — Apresentacao", status: "pendente" },
    { name: "Plano de Recomendacoes e Acoes Corretivas", deadline: "Fase 05 — Ajustes", status: "pendente" },
    { name: "Dashboard Interativo de Resultados", deadline: "Disponivel em tempo real", status: "pendente" },
    { name: "Cadeia de Custodia Digital Completa", deadline: "Continuo durante o projeto", status: "pendente" },
  ],
  sla: [
    { metric: "Tempo de Resposta a Incidentes Criticos", value: "Ate 4 horas uteis" },
    { metric: "Atualizacao de Status do Projeto", value: "Diariamente via dashboard" },
    { metric: "Entrega de Relatorios Parciais", value: "Ate 48 horas apos cada fase" },
    { metric: "Entrega do Relatorio Final", value: "Ate 5 dias uteis apos conclusao" },
    { metric: "Reunioes de Alinhamento", value: "Semanalmente ou sob demanda" },
    { metric: "Disponibilidade da Equipe", value: "Dias uteis, 08h as 18h" },
  ],
  terms: [
    { title: "Confidencialidade", description: "Todas as informacoes compartilhadas durante a auditoria sao tratadas como confidenciais e protegidas por NDA assinado entre as partes." },
    { title: "Cadeia de Custodia", description: "Todos os dados e evidencias sao mantidos em cadeia de custodia digital certificada, garantindo integridade e rastreabilidade conforme a Lei 13.964/2019." },
    { title: "Propriedade Intelectual", description: "Os relatorios e analises produzidos sao de propriedade do contratante. A metodologia e ferramentas de auditoria permanecem propriedade da AuraAUDIT." },
    { title: "Protecao de Dados", description: "O tratamento de dados pessoais segue rigorosamente a LGPD (Lei 13.709/2018), com medidas tecnicas e administrativas de seguranca." },
    { title: "Independencia", description: "A equipe de auditoria mantem total independencia e imparcialidade durante todo o processo, sem vinculo com as areas auditadas." },
    { title: "Rescisao", description: "O contrato pode ser rescindido por qualquer das partes com aviso previo de 30 dias, resguardados os direitos sobre trabalhos ja realizados." },
  ],
};

function getDeliverableStatusBadge(status: string) {
  switch (status) {
    case "concluido":
      return <Badge variant="default" className="text-[10px]">Concluido</Badge>;
    case "em_andamento":
      return <Badge variant="secondary" className="text-[10px]">Em Andamento</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px]">Pendente</Badge>;
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ClientContract() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [signerRole, setSignerRole] = useState("");
  const [signerCpf, setSignerCpf] = useState("");
  const [cpfValid, setCpfValid] = useState<boolean | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [companyCnpj, setCompanyCnpj] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [readContract, setReadContract] = useState(false);
  const [showContractText, setShowContractText] = useState(false);

  const { data: contractText } = useQuery<{
    contractNumber: string;
    version: string;
    text: string;
    sha256: string;
    auditor: { name: string; cnpj: string; email: string } | null;
    client: { name: string; cnpj: string; email: string } | null;
  }>({
    queryKey: ["/api/contract/text"],
  });

  const { data: whatsappData } = useQuery<{
    whatsappUrl: string;
    phone: string;
    message: string;
  }>({
    queryKey: ["/api/contract/whatsapp-link"],
  });

  const clientData = contractText?.client;
  const auditorData = contractText?.auditor;

  useEffect(() => {
    if (clientData) {
      setCompanyName(clientData.name);
      setCompanyCnpj(clientData.cnpj);
    }
  }, [clientData]);

  const { data: signatureData, isLoading: isLoadingSignature } = useQuery<{
    signed: boolean;
    signature: {
      id: string;
      contractNumber: string;
      signerName: string;
      signerRole: string;
      signerCpf: string | null;
      companyName: string | null;
      companyCnpj: string | null;
      contractTextSha256: string;
      contractVersion: string;
      ipAddress: string | null;
      userAgent: string | null;
      signedAt: string;
    } | null;
  }>({
    queryKey: ["/api/contract/signature"],
  });

  const signMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/contract/sign", {
        signerRole,
        signerCpf,
        companyName,
        companyCnpj,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Contrato assinado com sucesso",
        description: "Sua assinatura digital foi registrada com validade juridica.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contract/signature"] });
    },
    onError: (err: any) => {
      toast({
        title: "Erro ao assinar",
        description: err.message || "Erro inesperado",
        variant: "destructive",
      });
    },
  });

  const isSigned = signatureData?.signed === true;
  const sig = signatureData?.signature;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-contract-title">
            Contrato
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Detalhes do contrato de auditoria entre {auditorData?.name || "AuraAUDIT"} e {clientData?.name || user?.fullName || CONTRACT_DATA.client}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {whatsappData?.whatsappUrl && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 text-green-700 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/30"
              onClick={() => window.open(whatsappData.whatsappUrl, "_blank")}
              data-testid="button-share-whatsapp"
              title={whatsappData.phone ? `Enviar para ${whatsappData.phone}` : "Compartilhar via WhatsApp (numero nao cadastrado — sera solicitado)"}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Enviar via WhatsApp
            </Button>
          )}
          {isSigned ? (
            <Badge variant="default" className="text-xs gap-1 bg-emerald-600">
              <CheckCircle className="w-3 h-3" />
              Contrato Assinado
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-xs gap-1">
              <AlertTriangle className="w-3 h-3" />
              Pendente de Assinatura
            </Badge>
          )}
          <Badge variant="outline" className="text-xs gap-1">
            <Shield className="w-3 h-3" />
            Lei 13.964/2019
          </Badge>
        </div>
      </div>

      {!isSigned && !isLoadingSignature && (
        <Card className="border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/40 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300" data-testid="text-contract-alert">
                  Contrato pendente de assinatura digital
                </p>
                <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
                  O projeto so pode iniciar apos a assinatura digital do contrato. Leia atentamente os termos abaixo
                  e assine eletronicamente para desbloquear as proximas fases do pipeline.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-semibold" data-testid="text-contract-number">Contrato {CONTRACT_DATA.number}</h2>
            {isSigned ? (
              <Badge variant="default" className="text-[10px] bg-emerald-600" data-testid="badge-contract-status">Assinado</Badge>
            ) : (
              <Badge variant="destructive" className="text-[10px]" data-testid="badge-contract-status">Pendente</Badge>
            )}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 rounded-md bg-background/60">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Cliente</p>
              <p className="text-sm font-medium" data-testid="text-contract-client">{CONTRACT_DATA.client}</p>
            </div>
            <div className="p-3 rounded-md bg-background/60">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Tipo de Servico</p>
              <p className="text-sm font-medium" data-testid="text-contract-type">{CONTRACT_DATA.type}</p>
            </div>
            <div className="p-3 rounded-md bg-background/60">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Inicio</p>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-sm font-medium" data-testid="text-contract-start">15/01/2025</p>
              </div>
            </div>
            <div className="p-3 rounded-md bg-background/60">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Termino</p>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-sm font-medium" data-testid="text-contract-end">31/12/2025</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Escopo do Contrato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {CONTRACT_DATA.scope.map((item, index) => (
                <div key={index} className="flex items-start gap-2.5 p-2.5 rounded-md bg-muted/50" data-testid={`text-scope-item-${index}`}>
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-primary" />
              Entregaveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {CONTRACT_DATA.deliverables.map((item, index) => (
                <div key={index} className="flex items-center justify-between gap-3 p-2.5 rounded-md bg-muted/50" data-testid={`card-deliverable-${index}`}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.deadline}</p>
                  </div>
                  {getDeliverableStatusBadge(item.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            SLA - Acordo de Nivel de Servico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {CONTRACT_DATA.sla.map((item, index) => (
              <div key={index} className="p-3 rounded-md bg-muted/50" data-testid={`card-sla-${index}`}>
                <p className="text-xs text-muted-foreground mb-1">{item.metric}</p>
                <p className="text-sm font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            Termos e Condicoes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CONTRACT_DATA.terms.map((term, index) => (
              <div key={index} className="p-3 rounded-md bg-muted/50" data-testid={`card-term-${index}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary shrink-0" />
                  <p className="text-sm font-semibold">{term.title}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{term.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <PenTool className="w-4 h-4 text-primary" />
            Assinatura Digital
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingSignature ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : isSigned && sig ? (
            <div className="space-y-4" data-testid="section-signature-confirmed">
              <div className="p-4 rounded-md bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                <div className="flex items-center gap-2 mb-3">
                  <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                    Contrato assinado digitalmente
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-md bg-background/60">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Representante Legal</p>
                    <p className="text-sm font-medium" data-testid="text-signer-name">{sig.signerName}</p>
                    <p className="text-xs text-muted-foreground">{sig.signerRole}</p>
                    {sig.signerCpf && (
                      <div className="flex items-center gap-1 mt-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <p className="text-xs font-mono text-muted-foreground" data-testid="text-signer-cpf">
                          CPF: {sig.signerCpf.length === 11
                            ? `***.${sig.signerCpf.slice(3, 6)}.${sig.signerCpf.slice(6, 9)}-**`
                            : sig.signerCpf
                          }
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 rounded-md bg-background/60">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Empresa</p>
                    <p className="text-sm font-medium" data-testid="text-signer-company">{sig.companyName || "—"}</p>
                    <p className="text-xs text-muted-foreground">{sig.companyCnpj || "—"}</p>
                  </div>
                  <div className="p-3 rounded-md bg-background/60">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Data da Assinatura</p>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                      <p className="text-sm font-medium" data-testid="text-signed-date">{formatDate(sig.signedAt)}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-background/60">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Versao do Contrato</p>
                    <p className="text-sm font-medium" data-testid="text-contract-version">v{sig.contractVersion}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-md bg-muted/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Prova Criptografica</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Hash className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">SHA-256 do contrato</p>
                      <p className="text-xs font-mono break-all" data-testid="text-contract-sha256">{sig.contractTextSha256}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Globe className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">IP do signatario</p>
                      <p className="text-xs font-mono" data-testid="text-signer-ip">{sig.ipAddress || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Monitor className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">User-Agent</p>
                      <p className="text-xs font-mono break-all" data-testid="text-signer-ua">{sig.userAgent || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <span className="font-semibold">Base legal:</span> Assinatura eletronica simples nos termos da Lei 14.063/2020 e Medida Provisoria 2.200-2/2001.
                    A integridade do documento e garantida por hash criptografico SHA-256 com registro de IP, user-agent e timestamp.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5" data-testid="section-sign-contract">
              <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <span className="font-semibold">Importante:</span> Ao assinar, voce concorda com todos os termos e condicoes descritos acima.
                    A assinatura sera registrada com seu IP, user-agent e um hash SHA-256 do texto integral do contrato,
                    conforme Lei 14.063/2020 (assinatura eletronica simples).
                  </p>
                </div>
              </div>

              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs mb-3"
                  onClick={() => setShowContractText(!showContractText)}
                  data-testid="button-toggle-contract-text"
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  {showContractText ? "Ocultar texto integral" : "Ver texto integral do contrato"}
                </Button>
                {showContractText && contractText && (
                  <div className="p-4 rounded-md bg-muted/50 border max-h-[400px] overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed" data-testid="text-full-contract">
                      {contractText.text}
                    </pre>
                    <Separator className="my-3" />
                    <div className="flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                      <p className="text-[10px] font-mono text-muted-foreground">SHA-256: {contractText.sha256}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 mb-1">
                <div className="flex items-start gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <span className="font-semibold">Representante Legal:</span> Informe o CPF de quem assina o contrato.
                    O CPF e validado matematicamente para garantir a autenticidade do signatario.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signerName" className="text-xs">Nome do Signatario</Label>
                  <Input
                    id="signerName"
                    value={user?.fullName || ""}
                    disabled
                    className="text-sm"
                    data-testid="input-signer-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signerRole" className="text-xs">Cargo / Funcao *</Label>
                  <Input
                    id="signerRole"
                    value={signerRole}
                    onChange={(e) => setSignerRole(e.target.value)}
                    placeholder="Ex: Diretor Financeiro"
                    className="text-sm"
                    data-testid="input-signer-role"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signerCpf" className="text-xs">CPF do Representante Legal *</Label>
                  <Input
                    id="signerCpf"
                    value={signerCpf}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSignerCpf(val);
                      const digits = val.replace(/\D/g, "");
                      if (digits.length === 11) {
                        setCpfValid(validateCPF(digits));
                      } else {
                        setCpfValid(null);
                      }
                    }}
                    placeholder="000.000.000-00"
                    className={`text-sm font-mono ${cpfValid === false ? "border-red-400 focus-visible:ring-red-400" : cpfValid === true ? "border-emerald-400 focus-visible:ring-emerald-400" : ""}`}
                    data-testid="input-signer-cpf"
                  />
                  {cpfValid === false && (
                    <p className="text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      CPF invalido — digitos verificadores nao conferem
                    </p>
                  )}
                  {cpfValid === true && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      CPF validado com sucesso
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-xs">Empresa</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="text-sm"
                    data-testid="input-company-name"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="readContract"
                    checked={readContract}
                    onCheckedChange={(v) => setReadContract(v === true)}
                    data-testid="checkbox-read-contract"
                  />
                  <label htmlFor="readContract" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    Declaro que li e compreendi o texto integral do contrato, incluindo escopo, entregaveis, SLA e termos e condicoes.
                  </label>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={acceptedTerms}
                    onCheckedChange={(v) => setAcceptedTerms(v === true)}
                    data-testid="checkbox-accept-terms"
                  />
                  <label htmlFor="acceptTerms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    Concordo com os termos e condicoes e autorizo o registro da minha assinatura eletronica conforme Lei 14.063/2020.
                  </label>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full gap-2"
                disabled={!acceptedTerms || !readContract || !signerRole || !signerCpf || cpfValid !== true || signMutation.isPending}
                onClick={() => signMutation.mutate()}
                data-testid="button-sign-contract"
              >
                {signMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <PenTool className="w-4 h-4" />
                )}
                {signMutation.isPending ? "Registrando assinatura..." : "Assinar Contrato Digitalmente"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3" />
          <span>Cadeia de Custodia Digital - AuraDue</span>
        </div>
        <span>AuraAUDIT - Auditoria Forense em Despesas</span>
      </div>
    </div>
  );
}

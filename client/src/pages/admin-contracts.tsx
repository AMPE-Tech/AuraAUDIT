import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  FileText,
  Shield,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Hash,
  MessageCircle,
  Send,
  Building2,
  Mail,
  Phone,
  Eye,
  CalendarDays,
  Globe,
  Monitor,
  ShieldCheck,
  Copy,
  ExternalLink,
  FileSignature,
  PenLine,
  CircleDot,
  XCircle,
} from "lucide-react";

interface SignatureData {
  id: string;
  signerName: string;
  signerRole: string;
  signerType?: string;
  signerCpf: string | null;
  companyName: string | null;
  companyCnpj: string | null;
  contractTextSha256: string;
  contractVersion: string;
  contractType?: string;
  ipAddress: string | null;
  userAgent: string | null;
  signedAt: string;
}

interface ContractItem {
  clientId: string;
  clientName: string;
  clientCnpj: string;
  clientEmail: string;
  clientPhone: string | null;
  clientStatus: string;
  contractNumber: string;
  contractVersion: string;
  contractSha256: string;
  signed: boolean;
  signature: SignatureData | null;
  contractorSigned: boolean;
  contractorSignature: SignatureData | null;
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

function maskCpf(cpf: string) {
  if (cpf.length === 11) {
    return `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**`;
  }
  return cpf;
}

function SignatureStatusBadge({ signed, label }: { signed: boolean; label: string }) {
  if (signed) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-800">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">{label}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-800">
      <CircleDot className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
      <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">{label}</span>
    </div>
  );
}

function SignatureDetail({ sig, title }: { sig: SignatureData; title: string }) {
  return (
    <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">{title}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">Signatario:</span>{" "}
          <span className="font-medium">{sig.signerName}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Cargo:</span>{" "}
          <span className="font-medium">{sig.signerRole}</span>
        </div>
        {sig.signerCpf && (
          <div>
            <span className="text-muted-foreground">CPF:</span>{" "}
            <span className="font-medium font-mono">{maskCpf(sig.signerCpf)}</span>
          </div>
        )}
        <div>
          <span className="text-muted-foreground">Data:</span>{" "}
          <span className="font-medium">{formatDate(sig.signedAt)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">IP:</span>{" "}
          <span className="font-mono">{sig.ipAddress || "—"}</span>
        </div>
        <div>
          <span className="text-muted-foreground">User-Agent:</span>{" "}
          <span className="font-mono text-[10px] break-all">{sig.userAgent || "—"}</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminContracts() {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [showContractText, setShowContractText] = useState(false);
  const [showSignDialog, setShowSignDialog] = useState<string | null>(null);
  const [signerCpf, setSignerCpf] = useState("");

  const { data, isLoading } = useQuery<{
    contracts: ContractItem[];
    auditor: { name: string; cnpj: string } | null;
  }>({
    queryKey: ["/api/admin/contracts"],
  });

  const { data: contractDetail } = useQuery<{
    contractNumber: string;
    version: string;
    text: string;
    sha256: string;
    client: { name: string; cnpj: string; email: string; phone: string | null };
    auditor: { name: string; cnpj: string } | null;
  }>({
    queryKey: ["/api/admin/contracts", selectedClient, "text"],
    enabled: !!selectedClient,
  });

  const contractorSignMutation = useMutation({
    mutationFn: async ({ clientId, signerCpf }: { clientId: string; signerCpf: string }) => {
      const res = await apiRequest("POST", `/api/admin/contracts/${clientId}/contractor-sign`, { signerCpf });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Contrato assinado pela contratada",
        description: `SHA-256: ${data.proof?.contractSha256?.substring(0, 16)}...`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contracts"] });
      setShowSignDialog(null);
      setSignerCpf("");
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message || "Falha ao assinar contrato", variant: "destructive" });
    },
  });

  const contracts = data?.contracts || [];
  const signedCount = contracts.filter((c) => c.signed).length;
  const pendingCount = contracts.filter((c) => !c.signed).length;
  const contractorPendingCount = contracts.filter((c) => !c.contractorSigned).length;

  const handleWhatsApp = async (clientId: string) => {
    try {
      const res = await fetch(`/api/admin/contracts/${clientId}/whatsapp`, { credentials: "include" });
      const data = await res.json();
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank");
        toast({
          title: "Link do WhatsApp aberto",
          description: `Contrato enviado para ${data.clientName}`,
        });
      }
    } catch {
      toast({ title: "Erro", description: "Falha ao gerar link do WhatsApp", variant: "destructive" });
    }
  };

  const handleRequestSignature = async (clientId: string) => {
    try {
      const res = await fetch(`/api/admin/contracts/${clientId}/request-signature`, { credentials: "include" });
      const data = await res.json();
      if (data.mailtoUrl) {
        window.open(data.mailtoUrl, "_blank");
        toast({
          title: "Email de solicitacao preparado",
          description: `Solicitacao de assinatura para ${data.clientName}`,
        });
      }
    } catch {
      toast({ title: "Erro", description: "Falha ao preparar solicitacao de assinatura", variant: "destructive" });
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/contract`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copiado", description: "Link do contrato copiado para a area de transferencia" });
  };

  const selectedContract = contracts.find((c) => c.clientId === selectedClient);
  const signDialogContract = contracts.find((c) => c.clientId === showSignDialog);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-admin-contracts-title">
            Gestao de Contratos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize, assine e envie contratos para seus clientes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1">
            <FileSignature className="w-3 h-3" />
            v{contracts[0]?.contractVersion || "4.0.0"}
          </Badge>
          <Badge variant="outline" className="text-xs gap-1">
            <Shield className="w-3 h-3" />
            Lei 13.964/2019
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Total Contratos</p>
            <p className="text-2xl font-bold" data-testid="text-total-contracts">{contracts.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-emerald-500/5 to-transparent">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Cliente Assinou</p>
            <p className="text-2xl font-bold text-emerald-600" data-testid="text-signed-count">{signedCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-amber-500/5 to-transparent">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Cliente Pendente</p>
            <p className="text-2xl font-bold text-amber-600" data-testid="text-pending-count">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card className={`bg-gradient-to-r ${contractorPendingCount > 0 ? "from-red-500/5 border-red-200 dark:border-red-900" : "from-emerald-500/5"} to-transparent`}>
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Minha Assinatura</p>
            <p className={`text-2xl font-bold ${contractorPendingCount > 0 ? "text-red-600" : "text-emerald-600"}`} data-testid="text-contractor-pending">
              {contractorPendingCount > 0 ? `${contractorPendingCount} pendente${contractorPendingCount > 1 ? "s" : ""}` : "Todos"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5"
              onClick={handleCopyLink}
              data-testid="button-copy-contract-link"
            >
              <Copy className="w-3.5 h-3.5" />
              Copiar Link
            </Button>
            <p className="text-[11px] text-muted-foreground">/contract</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {contracts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado</p>
              <p className="text-xs text-muted-foreground mt-1">Cadastre clientes em "Clientes" para gerar contratos</p>
            </CardContent>
          </Card>
        ) : (
          contracts.map((contract) => (
            <Card
              key={contract.clientId}
              className={`transition-all hover:shadow-md ${
                contract.signed && contract.contractorSigned
                  ? "border-emerald-200 dark:border-emerald-900"
                  : !contract.contractorSigned
                  ? "border-red-200 dark:border-red-900"
                  : "border-amber-200 dark:border-amber-900"
              }`}
              data-testid={`card-contract-${contract.clientId}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${
                      contract.signed && contract.contractorSigned
                        ? "bg-emerald-100 dark:bg-emerald-900/40"
                        : !contract.contractorSigned
                        ? "bg-red-100 dark:bg-red-900/40"
                        : "bg-amber-100 dark:bg-amber-900/40"
                    }`}>
                      {contract.signed && contract.contractorSigned ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : !contract.contractorSigned ? (
                        <PenLine className="w-5 h-5 text-red-600 dark:text-red-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold" data-testid={`text-client-name-${contract.clientId}`}>{contract.clientName}</p>
                        <Badge variant="outline" className="text-[10px]">{contract.clientStatus}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 flex-wrap">
                        {contract.clientCnpj && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> {contract.clientCnpj}
                          </span>
                        )}
                        {contract.clientEmail && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {contract.clientEmail}
                          </span>
                        )}
                        {contract.clientPhone && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {contract.clientPhone}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <SignatureStatusBadge signed={contract.contractorSigned} label={contract.contractorSigned ? "Contratada: Assinado" : "Contratada: Pendente"} />
                        <SignatureStatusBadge signed={contract.signed} label={contract.signed ? "Cliente: Assinado" : "Cliente: Pendente"} />
                      </div>
                      {contract.signed && contract.signature && (
                        <div className="mt-2 p-2 rounded bg-muted/50 space-y-1">
                          <div className="flex items-center gap-4 flex-wrap text-xs">
                            <span className="text-muted-foreground">
                              Cliente: <span className="font-medium text-foreground">{contract.signature.signerName}</span> ({contract.signature.signerRole})
                            </span>
                            {contract.signature.signerCpf && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                CPF: {maskCpf(contract.signature.signerCpf)}
                              </span>
                            )}
                            <span className="text-muted-foreground">
                              <CalendarDays className="w-3 h-3 inline mr-1" />
                              {formatDate(contract.signature.signedAt)}
                            </span>
                          </div>
                        </div>
                      )}
                      {contract.contractorSigned && contract.contractorSignature && (
                        <div className="mt-1 p-2 rounded bg-muted/50 space-y-1">
                          <div className="flex items-center gap-4 flex-wrap text-xs">
                            <span className="text-muted-foreground">
                              Contratada: <span className="font-medium text-foreground">{contract.contractorSignature.signerName}</span>
                            </span>
                            {contract.contractorSignature.signerCpf && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                CPF: {maskCpf(contract.contractorSignature.signerCpf)}
                              </span>
                            )}
                            <span className="text-muted-foreground">
                              <CalendarDays className="w-3 h-3 inline mr-1" />
                              {formatDate(contract.contractorSignature.signedAt)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5"
                      onClick={() => {
                        setSelectedClient(contract.clientId);
                        setShowContractText(false);
                      }}
                      data-testid={`button-view-contract-${contract.clientId}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Ver
                    </Button>
                    {!contract.contractorSigned && (
                      <Button
                        size="sm"
                        className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700"
                        onClick={() => setShowSignDialog(contract.clientId)}
                        data-testid={`button-contractor-sign-${contract.clientId}`}
                      >
                        <PenLine className="w-3.5 h-3.5" />
                        Assinar
                      </Button>
                    )}
                    {!contract.signed && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1.5"
                        onClick={() => handleRequestSignature(contract.clientId)}
                        data-testid={`button-request-signature-${contract.clientId}`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        Solicitar
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5 text-green-700 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/30"
                      onClick={() => handleWhatsApp(contract.clientId)}
                      data-testid={`button-whatsapp-${contract.clientId}`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!selectedClient} onOpenChange={(open) => { if (!open) setSelectedClient(null); }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Contrato — {selectedContract?.clientName}
            </DialogTitle>
            <DialogDescription>
              Detalhes do contrato, assinaturas e texto integral
            </DialogDescription>
          </DialogHeader>

          {contractDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-md bg-muted/50">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Contratante</p>
                  <p className="text-sm font-medium">{contractDetail.client.name}</p>
                  <p className="text-xs text-muted-foreground">{contractDetail.client.cnpj}</p>
                </div>
                <div className="p-3 rounded-md bg-muted/50">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Contratada</p>
                  <p className="text-sm font-medium">{contractDetail.auditor?.name || "AuraAUDIT"}</p>
                  <p className="text-xs text-muted-foreground">{contractDetail.auditor?.cnpj || ""}</p>
                </div>
              </div>

              <div className="p-3 rounded-md bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="w-3.5 h-3.5 text-primary" />
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Integridade do Contrato</p>
                </div>
                <p className="text-xs font-mono break-all" data-testid="text-contract-detail-sha256">{contractDetail.sha256}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Versao {contractDetail.version} | {contractDetail.contractNumber}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-md border ${selectedContract?.contractorSigned ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900" : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {selectedContract?.contractorSigned ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                    <p className={`text-xs font-semibold ${selectedContract?.contractorSigned ? "text-emerald-800 dark:text-emerald-300" : "text-red-800 dark:text-red-300"}`}>
                      Contratada
                    </p>
                  </div>
                  {selectedContract?.contractorSigned && selectedContract.contractorSignature ? (
                    <p className="text-[11px] text-muted-foreground">
                      {selectedContract.contractorSignature.signerName} — {formatDate(selectedContract.contractorSignature.signedAt)}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[11px] text-red-700 dark:text-red-400">Aguardando sua assinatura</p>
                      <Button
                        size="sm"
                        className="text-[11px] gap-1 bg-blue-600 hover:bg-blue-700 h-7"
                        onClick={() => selectedContract && setShowSignDialog(selectedContract.clientId)}
                        data-testid="button-dialog-contractor-sign"
                      >
                        <PenLine className="w-3 h-3" />
                        Assinar agora
                      </Button>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-md border ${selectedContract?.signed ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900" : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {selectedContract?.signed ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    )}
                    <p className={`text-xs font-semibold ${selectedContract?.signed ? "text-emerald-800 dark:text-emerald-300" : "text-amber-800 dark:text-amber-300"}`}>
                      Contratante (Cliente)
                    </p>
                  </div>
                  {selectedContract?.signed && selectedContract.signature ? (
                    <p className="text-[11px] text-muted-foreground">
                      {selectedContract.signature.signerName} — {formatDate(selectedContract.signature.signedAt)}
                    </p>
                  ) : (
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">Aguardando assinatura do cliente</p>
                  )}
                </div>
              </div>

              {selectedContract?.contractorSigned && selectedContract.contractorSignature && (
                <SignatureDetail sig={selectedContract.contractorSignature} title="Assinatura da Contratada" />
              )}

              {selectedContract?.signed && selectedContract.signature && (
                <SignatureDetail sig={selectedContract.signature} title="Assinatura do Contratante" />
              )}

              {!selectedContract?.signed && (
                <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Solicitar Assinatura do Cliente</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Envie a solicitacao de assinatura por email, WhatsApp ou copie o link.</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Button
                      size="sm"
                      className="text-xs gap-1.5 bg-primary hover:bg-primary/90"
                      onClick={() => selectedContract && handleRequestSignature(selectedContract.clientId)}
                      data-testid="button-dialog-request-signature"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Solicitar por Email
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="text-xs gap-1.5 bg-green-600 hover:bg-green-700"
                      onClick={() => selectedContract && handleWhatsApp(selectedContract.clientId)}
                      data-testid="button-dialog-whatsapp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Enviar via WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5"
                      onClick={handleCopyLink}
                      data-testid="button-dialog-copy-link"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copiar Link
                    </Button>
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs mb-3"
                  onClick={() => setShowContractText(!showContractText)}
                  data-testid="button-toggle-full-text"
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  {showContractText ? "Ocultar texto integral" : "Ver texto integral do contrato"}
                </Button>
                {showContractText && (
                  <pre className="p-4 rounded-md bg-muted/50 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto" data-testid="text-full-contract-admin">
                    {contractDetail.text}
                  </pre>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!showSignDialog} onOpenChange={(open) => { if (!open) { setShowSignDialog(null); setSignerCpf(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenLine className="w-5 h-5 text-blue-600" />
              Assinar Contrato — Contratada
            </DialogTitle>
            <DialogDescription>
              Assinatura digital do representante legal da contratada para o contrato de {signDialogContract?.clientName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                Voce esta assinando como representante legal da contratada ({data?.auditor?.name || "CTS Brasil"}) para o contrato com <span className="font-semibold">{signDialogContract?.clientName}</span>.
              </p>
              <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-1">
                SHA-256: {signDialogContract?.contractSha256?.substring(0, 32)}...
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signer-cpf" className="text-xs">CPF do Representante Legal (opcional)</Label>
              <Input
                id="signer-cpf"
                placeholder="000.000.000-00"
                value={signerCpf}
                onChange={(e) => setSignerCpf(e.target.value)}
                data-testid="input-contractor-cpf"
              />
              <p className="text-[10px] text-muted-foreground">Sera exibido com mascaramento parcial. Validacao matematica sera aplicada.</p>
            </div>

            <div className="p-3 rounded-md bg-muted/50 text-[11px] text-muted-foreground space-y-1">
              <p>Ao assinar, serao registrados:</p>
              <p>- Hash SHA-256 do texto integral do contrato</p>
              <p>- IP, user-agent e timestamp da assinatura</p>
              <p>- Validade juridica: Lei 14.063/2020 e MP 2.200-2/2001</p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setShowSignDialog(null); setSignerCpf(""); }}
                data-testid="button-cancel-sign"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="gap-1.5 bg-blue-600 hover:bg-blue-700"
                onClick={() => showSignDialog && contractorSignMutation.mutate({ clientId: showSignDialog, signerCpf })}
                disabled={contractorSignMutation.isPending}
                data-testid="button-confirm-sign"
              >
                {contractorSignMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <PenLine className="w-3.5 h-3.5" />
                )}
                Confirmar Assinatura
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

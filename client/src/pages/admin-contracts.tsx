import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";

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
  signature: {
    id: string;
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

export default function AdminContracts() {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [showContractText, setShowContractText] = useState(false);

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

  const contracts = data?.contracts || [];
  const signedCount = contracts.filter((c) => c.signed).length;
  const pendingCount = contracts.filter((c) => !c.signed).length;

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
            Visualize, verifique e envie contratos para seus clientes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1">
            <FileSignature className="w-3 h-3" />
            v{contracts[0]?.contractVersion || "2.0.0"}
          </Badge>
          <Badge variant="outline" className="text-xs gap-1">
            <Shield className="w-3 h-3" />
            Lei 13.964/2019
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Total Contratos</p>
            <p className="text-2xl font-bold" data-testid="text-total-contracts">{contracts.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-emerald-500/5 to-transparent">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Assinados</p>
            <p className="text-2xl font-bold text-emerald-600" data-testid="text-signed-count">{signedCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-amber-500/5 to-transparent">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Pendentes</p>
            <p className="text-2xl font-bold text-amber-600" data-testid="text-pending-count">{pendingCount}</p>
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
              className={`transition-all hover:shadow-md ${contract.signed ? "border-emerald-200 dark:border-emerald-900" : "border-amber-200 dark:border-amber-900"}`}
              data-testid={`card-contract-${contract.clientId}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${contract.signed ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-amber-100 dark:bg-amber-900/40"}`}>
                      {contract.signed ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold" data-testid={`text-client-name-${contract.clientId}`}>{contract.clientName}</p>
                        {contract.signed ? (
                          <Badge variant="default" className="text-[10px] bg-emerald-600">Assinado</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px]">Pendente</Badge>
                        )}
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
                      {contract.signed && contract.signature && (
                        <div className="mt-2 p-2 rounded bg-muted/50 space-y-1">
                          <div className="flex items-center gap-4 flex-wrap text-xs">
                            <span className="text-muted-foreground">
                              Assinado por: <span className="font-medium text-foreground">{contract.signature.signerName}</span> ({contract.signature.signerRole})
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
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                            <Hash className="w-3 h-3 shrink-0" />
                            SHA-256: {contract.signature.contractTextSha256.substring(0, 32)}...
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
                      Ver Contrato
                    </Button>
                    {!contract.signed && (
                      <Button
                        size="sm"
                        className="text-xs gap-1.5 bg-primary hover:bg-primary/90"
                        onClick={() => handleRequestSignature(contract.clientId)}
                        data-testid={`button-request-signature-${contract.clientId}`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        Solicitar Assinatura
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
                      WhatsApp
                    </Button>
                    {contract.signed && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-800">
                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Assinado</span>
                      </div>
                    )}
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

              {selectedContract?.signed && selectedContract.signature && (
                <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Contrato Assinado</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Signatario:</span>{" "}
                      <span className="font-medium">{selectedContract.signature.signerName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cargo:</span>{" "}
                      <span className="font-medium">{selectedContract.signature.signerRole}</span>
                    </div>
                    {selectedContract.signature.signerCpf && (
                      <div>
                        <span className="text-muted-foreground">CPF:</span>{" "}
                        <span className="font-medium font-mono">{maskCpf(selectedContract.signature.signerCpf)}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Data:</span>{" "}
                      <span className="font-medium">{formatDate(selectedContract.signature.signedAt)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">IP:</span>{" "}
                      <span className="font-mono">{selectedContract.signature.ipAddress || "—"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">User-Agent:</span>{" "}
                      <span className="font-mono text-[10px] break-all">{selectedContract.signature.userAgent || "—"}</span>
                    </div>
                  </div>
                </div>
              )}

              {!selectedContract?.signed && (
                <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Pendente de Assinatura</p>
                  </div>
                  <p className="text-xs text-muted-foreground">O cliente ainda nao assinou este contrato. Solicite a assinatura por email, WhatsApp ou copie o link.</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Button
                      size="sm"
                      className="text-xs gap-1.5 bg-primary hover:bg-primary/90"
                      onClick={() => selectedContract && handleRequestSignature(selectedContract.clientId)}
                      data-testid="button-dialog-request-signature"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Solicitar Assinatura por Email
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
    </div>
  );
}

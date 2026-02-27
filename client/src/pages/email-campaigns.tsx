import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Mail,
  Send,
  Plus,
  Trash2,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  TestTube,
  Upload,
  AlertCircle,
} from "lucide-react";

interface Recipient {
  email: string;
  name?: string;
  company?: string;
}

interface Campaign {
  id: string;
  subject: string;
  body: string;
  fromEmail: string;
  fromName: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  status: string;
  createdAt: string;
  sentAt: string | null;
  recipients?: any[];
}

export default function EmailCampaigns() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [showTest, setShowTest] = useState(false);

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState(
    `Gostaríamos de apresentar a plataforma AuraAUDIT — uma solução de Due Diligence para auditoria forense de despesas corporativas.\n\nCom inteligência artificial generativa, a plataforma automatiza a conciliação de evidências, detecta anomalias e entrega trilhas auditáveis com cadeia de custódia digital.\n\nConvidamos você a conhecer a plataforma e explorar como podemos apoiar sua operação.\n\nClique no botão abaixo para acessar:`
  );
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [testEmail, setTestEmail] = useState("");

  const campaignsQuery = useQuery<Campaign[]>({
    queryKey: ["/api/email/campaigns"],
  });

  const detailQuery = useQuery<Campaign>({
    queryKey: ["/api/email/campaigns", showDetail],
    enabled: !!showDetail,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/email/campaigns", {
        subject,
        body,
        recipients,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Campanha criada", description: "Pronta para envio." });
      queryClient.invalidateQueries({ queryKey: ["/api/email/campaigns"] });
      setShowCreate(false);
      setSubject("");
      setRecipients([]);
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const res = await apiRequest("POST", `/api/email/campaigns/${campaignId}/send`);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Campanha enviada!",
        description: `${data.sentCount} enviados, ${data.failedCount} falhas de ${data.total} total.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/email/campaigns"] });
    },
    onError: (err: any) => {
      toast({ title: "Erro no envio", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      await apiRequest("DELETE", `/api/email/campaigns/${campaignId}`);
    },
    onSuccess: () => {
      toast({ title: "Campanha excluida" });
      queryClient.invalidateQueries({ queryKey: ["/api/email/campaigns"] });
    },
  });

  const testMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/email/test", {
        to: testEmail,
        subject: "Teste — AuraAUDIT Due Diligence Platform",
        body,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Email de teste enviado!", description: `Verifique a caixa de ${testEmail}` });
      setShowTest(false);
    },
    onError: (err: any) => {
      toast({ title: "Erro no teste", description: err.message, variant: "destructive" });
    },
  });

  function addRecipient() {
    if (!newEmail || !newEmail.includes("@")) return;
    if (recipients.find((r) => r.email === newEmail)) return;
    setRecipients([...recipients, { email: newEmail, name: newName || undefined, company: newCompany || undefined }]);
    setNewEmail("");
    setNewName("");
    setNewCompany("");
  }

  function removeRecipient(email: string) {
    setRecipients(recipients.filter((r) => r.email !== email));
  }

  function parseBulkInput() {
    const lines = bulkInput.split("\n").filter((l) => l.trim());
    const parsed: Recipient[] = [];
    for (const line of lines) {
      const parts = line.split(/[;,\t]/).map((p) => p.trim());
      if (parts[0] && parts[0].includes("@")) {
        parsed.push({
          email: parts[0],
          name: parts[1] || undefined,
          company: parts[2] || undefined,
        });
      }
    }
    const existing = new Set(recipients.map((r) => r.email));
    const newOnes = parsed.filter((p) => !existing.has(p.email));
    setRecipients([...recipients, ...newOnes]);
    setBulkInput("");
    toast({ title: `${newOnes.length} destinatarios adicionados` });
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  if ((user as any)?.role !== "admin") {
    return <div className="p-6 text-center text-muted-foreground">Acesso restrito a administradores.</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2" data-testid="text-email-title">
            <Mail className="w-5 h-5 text-primary" />
            Email Marketing
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Envie convites e comunicados para sua lista de clientes</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showTest} onOpenChange={setShowTest}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs" data-testid="button-test-email">
                <TestTube className="w-3 h-3 mr-1" />
                Enviar Teste
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Enviar Email de Teste</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder="Email de destino"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  data-testid="input-test-email"
                />
                <Button
                  onClick={() => testMutation.mutate()}
                  disabled={testMutation.isPending || !testEmail}
                  className="w-full text-xs"
                  data-testid="button-send-test"
                >
                  {testMutation.isPending ? "Enviando..." : "Enviar Teste"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button size="sm" className="text-xs" data-testid="button-new-campaign">
                <Plus className="w-3 h-3 mr-1" />
                Nova Campanha
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Campanha de Email</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Assunto</label>
                  <Input
                    placeholder="Ex: Convite — Plataforma AuraAUDIT"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    data-testid="input-campaign-subject"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Corpo do Email</label>
                  <textarea
                    className="w-full min-h-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    data-testid="input-campaign-body"
                  />
                </div>

                <Separator />

                <div>
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Destinatarios ({recipients.length})
                  </label>

                  <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 mt-2">
                    <Input
                      placeholder="Email *"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addRecipient()}
                      data-testid="input-recipient-email"
                    />
                    <Input
                      placeholder="Nome"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addRecipient()}
                      data-testid="input-recipient-name"
                    />
                    <Input
                      placeholder="Empresa"
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addRecipient()}
                      data-testid="input-recipient-company"
                    />
                    <Button size="sm" variant="outline" onClick={addRecipient} data-testid="button-add-recipient">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="mt-3">
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      Importar em lote (email; nome; empresa — um por linha)
                    </label>
                    <textarea
                      className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-xs mt-1 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
                      placeholder={"joao@empresa.com; Joao Silva; Empresa SA\nmaria@corp.com; Maria; Corp Ltd"}
                      value={bulkInput}
                      onChange={(e) => setBulkInput(e.target.value)}
                      data-testid="input-bulk-recipients"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs mt-1"
                      onClick={parseBulkInput}
                      disabled={!bulkInput.trim()}
                      data-testid="button-parse-bulk"
                    >
                      Importar Lista
                    </Button>
                  </div>

                  {recipients.length > 0 && (
                    <div className="mt-3 max-h-[200px] overflow-y-auto space-y-1">
                      {recipients.map((r, i) => (
                        <div key={i} className="flex items-center justify-between text-xs bg-muted/30 rounded px-2 py-1.5">
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <span className="font-medium">{r.email}</span>
                            {r.name && <span className="text-muted-foreground">— {r.name}</span>}
                            {r.company && <Badge variant="outline" className="text-[10px] ml-1">{r.company}</Badge>}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0"
                            onClick={() => removeRecipient(r.email)}
                            data-testid={`button-remove-recipient-${i}`}
                          >
                            <XCircle className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || !subject || !body || recipients.length === 0}
                  className="w-full text-xs"
                  data-testid="button-create-campaign"
                >
                  {createMutation.isPending ? "Criando..." : `Criar Campanha (${recipients.length} destinatarios)`}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {campaignsQuery.isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !campaignsQuery.data?.length ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Mail className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">Nenhuma campanha criada</p>
            <p className="text-xs text-muted-foreground mt-1">Crie sua primeira campanha para enviar convites aos clientes</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaignsQuery.data.map((campaign) => (
            <Card key={campaign.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium" data-testid={`text-campaign-subject-${campaign.id}`}>{campaign.subject}</h3>
                      {campaign.status === "draft" && (
                        <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
                          <Clock className="w-2.5 h-2.5 mr-0.5" />
                          Rascunho
                        </Badge>
                      )}
                      {campaign.status === "sent" && (
                        <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                          <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                          Enviada
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {campaign.recipientCount} destinatarios
                      </span>
                      {campaign.status === "sent" && (
                        <>
                          <span className="text-[11px] text-emerald-500">{campaign.sentCount} enviados</span>
                          {campaign.failedCount > 0 && (
                            <span className="text-[11px] text-red-500">{campaign.failedCount} falhas</span>
                          )}
                        </>
                      )}
                      <span className="text-[11px] text-muted-foreground">{formatDate(campaign.createdAt)}</span>
                      {campaign.sentAt && <span className="text-[11px] text-muted-foreground">Enviada: {formatDate(campaign.sentAt)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                      onClick={() => setShowDetail(showDetail === campaign.id ? null : campaign.id)}
                      data-testid={`button-view-campaign-${campaign.id}`}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    {campaign.status === "draft" && (
                      <>
                        <Button
                          size="sm"
                          className="text-xs bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => sendMutation.mutate(campaign.id)}
                          disabled={sendMutation.isPending}
                          data-testid={`button-send-campaign-${campaign.id}`}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          {sendMutation.isPending ? "Enviando..." : "Enviar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-destructive"
                          onClick={() => deleteMutation.mutate(campaign.id)}
                          data-testid={`button-delete-campaign-${campaign.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {showDetail === campaign.id && detailQuery.data && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground mb-1">Corpo do email:</p>
                      <p className="text-xs bg-muted/30 rounded p-3 whitespace-pre-wrap">{detailQuery.data.body}</p>
                    </div>
                    {detailQuery.data.recipients && detailQuery.data.recipients.length > 0 && (
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground mb-1">Destinatarios:</p>
                        <div className="max-h-[200px] overflow-y-auto space-y-1">
                          {detailQuery.data.recipients.map((r: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-xs bg-muted/20 rounded px-2 py-1.5">
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                <span>{r.email}</span>
                                {r.name && <span className="text-muted-foreground">— {r.name}</span>}
                                {r.company && <Badge variant="outline" className="text-[10px]">{r.company}</Badge>}
                              </div>
                              <div>
                                {r.status === "sent" && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                                {r.status === "failed" && (
                                  <div className="flex items-center gap-1">
                                    <XCircle className="w-3 h-3 text-red-500" />
                                    {r.error && <span className="text-[10px] text-red-400">{r.error}</span>}
                                  </div>
                                )}
                                {r.status === "pending" && <Clock className="w-3 h-3 text-amber-500" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-dashed bg-muted/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs font-medium">Dicas de envio</p>
              <ul className="text-[11px] text-muted-foreground mt-1 space-y-0.5">
                <li>• Envie um email de teste antes de disparar a campanha</li>
                <li>• Use a importacao em lote para adicionar varios destinatarios de uma vez</li>
                <li>• Formato: email; nome; empresa (separados por ponto e virgula, um por linha)</li>
                <li>• Remetente: contato@auradue.com</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

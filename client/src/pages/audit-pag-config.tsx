import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2, Plus, Trash2, Edit, ShieldCheck, ShieldAlert, Database,
  Server, Wifi, CreditCard, Tag, DollarSign, Check, X, Search, Upload,
  Globe, HardDrive, Mail, MessageSquare, Landmark, FileText, Package,
} from "lucide-react";

interface AuditPagConfigPanelProps {
  toast: any;
}

export default function AuditPagConfigPanel({ toast }: AuditPagConfigPanelProps) {
  const [configTab, setConfigTab] = useState("suppliers");

  return (
    <div className="space-y-4">
      <Tabs value={configTab} onValueChange={setConfigTab}>
        <TabsList className="grid w-full grid-cols-5" data-testid="tabs-config">
          <TabsTrigger value="suppliers" data-testid="tab-config-suppliers">
            <Building2 className="w-4 h-4 mr-1" />
            Fornecedores
          </TabsTrigger>
          <TabsTrigger value="datasources" data-testid="tab-config-datasources">
            <Database className="w-4 h-4 mr-1" />
            Fontes de Dados
          </TabsTrigger>
          <TabsTrigger value="services" data-testid="tab-config-services">
            <Package className="w-4 h-4 mr-1" />
            Serviços
          </TabsTrigger>
          <TabsTrigger value="fees" data-testid="tab-config-fees">
            <DollarSign className="w-4 h-4 mr-1" />
            Taxas (FEE)
          </TabsTrigger>
          <TabsTrigger value="payments" data-testid="tab-config-payments">
            <CreditCard className="w-4 h-4 mr-1" />
            Pagamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers">
          <SuppliersTab toast={toast} />
        </TabsContent>
        <TabsContent value="datasources">
          <DataSourcesTab toast={toast} />
        </TabsContent>
        <TabsContent value="services">
          <ServiceTypesTab toast={toast} />
        </TabsContent>
        <TabsContent value="fees">
          <FeeConfigTab toast={toast} />
        </TabsContent>
        <TabsContent value="payments">
          <PaymentMethodsTab toast={toast} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SuppliersTab({ toast }: { toast: any }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [cnpjSearch, setCnpjSearch] = useState("");
  const [validateResult, setValidateResult] = useState<any>(null);

  const { data: suppliers = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/audit-pag/suppliers"] });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/audit-pag/suppliers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/suppliers"] });
      toast({ title: "Fornecedor bloqueado" });
    },
  });

  const validateMutation = useMutation({
    mutationFn: (cnpj: string) => apiRequest("POST", "/api/audit-pag/suppliers/validate-cnpj", { cnpj }),
    onSuccess: async (res) => {
      const data = await res.json();
      setValidateResult(data);
    },
  });

  const filtered = suppliers.filter((s: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.razaoSocial?.toLowerCase().includes(q) || s.cnpj?.includes(q) || s.nomeFantasia?.toLowerCase().includes(q);
  });

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              Fornecedores Pré-Autorizados ({suppliers.length})
            </CardTitle>
            <Button size="sm" onClick={() => setAddOpen(true)} data-testid="button-add-supplier">
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por CNPJ, razão social..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-supplier" />
            </div>
          </div>

          <Card className="border-dashed">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Validar CNPJ</span>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Digite o CNPJ para validar" value={cnpjSearch} onChange={e => setCnpjSearch(e.target.value)} data-testid="input-validate-cnpj" />
                <Button size="sm" variant="outline" onClick={() => validateMutation.mutate(cnpjSearch)} disabled={validateMutation.isPending || !cnpjSearch} data-testid="button-validate-cnpj">
                  {validateMutation.isPending ? "Validando..." : "Validar"}
                </Button>
              </div>
              {validateResult && (
                <div className={`mt-2 p-2 rounded text-sm ${validateResult.authorized ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"}`} data-testid="text-validate-result">
                  {validateResult.authorized ? <Check className="w-4 h-4 inline mr-1" /> : <X className="w-4 h-4 inline mr-1" />}
                  {validateResult.message}
                  {validateResult.supplier && <span className="ml-2 font-medium">({validateResult.supplier.razaoSocial})</span>}
                </div>
              )}
            </CardContent>
          </Card>

          {filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-suppliers">
              <Building2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Nenhum fornecedor cadastrado</p>
              <p className="text-xs mt-1">Adicione fornecedores pré-autorizados para validação automática</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((supplier: any) => (
                <div key={supplier.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors" data-testid={`card-supplier-${supplier.id}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm" data-testid={`text-supplier-name-${supplier.id}`}>{supplier.razaoSocial}</span>
                      <Badge variant={supplier.status === "active" ? "default" : "destructive"} className="text-[10px]" data-testid={`badge-supplier-status-${supplier.id}`}>
                        {supplier.status === "active" ? "Ativo" : "Bloqueado"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>CNPJ: {supplier.cnpj}</span>
                      {supplier.nomeFantasia && <span>• {supplier.nomeFantasia}</span>}
                      {supplier.segment && <span>• {supplier.segment}</span>}
                    </div>
                    <div className="flex gap-2 mt-1">
                      {supplier.paysCommission && <Badge variant="outline" className="text-[9px]">Comissão</Badge>}
                      {supplier.hasIncentive && <Badge variant="outline" className="text-[9px]">Incentivo</Badge>}
                      {supplier.hasRebate && <Badge variant="outline" className="text-[9px]">Rebate</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingSupplier(supplier); setEditOpen(true); }} data-testid={`button-edit-supplier-${supplier.id}`}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(supplier.id)} data-testid={`button-block-supplier-${supplier.id}`}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SupplierFormDialog open={addOpen} onOpenChange={setAddOpen} toast={toast} />
      {editingSupplier && (
        <SupplierFormDialog open={editOpen} onOpenChange={(o: boolean) => { setEditOpen(o); if (!o) setEditingSupplier(null); }} toast={toast} supplier={editingSupplier} />
      )}
    </div>
  );
}

function SupplierFormDialog({ open, onOpenChange, toast, supplier }: { open: boolean; onOpenChange: (o: boolean) => void; toast: any; supplier?: any }) {
  const isEdit = !!supplier;
  const [form, setForm] = useState({
    cnpj: supplier?.cnpj || "",
    razaoSocial: supplier?.razaoSocial || "",
    nomeFantasia: supplier?.nomeFantasia || "",
    segment: supplier?.segment || "",
    paysCommission: supplier?.paysCommission || false,
    commissionType: supplier?.commissionType || "",
    commissionPercent: supplier?.commissionPercent || "",
    hasIncentive: supplier?.hasIncentive || false,
    incentiveType: supplier?.incentiveType || "",
    incentiveValue: supplier?.incentiveValue || "",
    hasRebate: supplier?.hasRebate || false,
    rebatePercent: supplier?.rebatePercent || "",
    contactName: supplier?.contactName || "",
    contactEmail: supplier?.contactEmail || "",
    contactPhone: supplier?.contactPhone || "",
    notes: supplier?.notes || "",
  });

  const mutation = useMutation({
    mutationFn: () => isEdit
      ? apiRequest("PUT", `/api/audit-pag/suppliers/${supplier.id}`, form)
      : apiRequest("POST", "/api/audit-pag/suppliers", form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/suppliers"] });
      toast({ title: isEdit ? "Fornecedor atualizado" : "Fornecedor cadastrado" });
      onOpenChange(false);
    },
    onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {isEdit ? "Editar Fornecedor" : "Novo Fornecedor Pré-Autorizado"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>CNPJ *</Label>
              <Input value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0001-00" data-testid="input-supplier-cnpj" />
            </div>
            <div>
              <Label>Segmento</Label>
              <Input value={form.segment} onChange={e => setForm({ ...form, segment: e.target.value })} placeholder="Ex: Aéreo, Hotelaria, Tecnologia, etc." data-testid="input-supplier-segment" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Razão Social *</Label>
              <Input value={form.razaoSocial} onChange={e => setForm({ ...form, razaoSocial: e.target.value })} data-testid="input-supplier-razao" />
            </div>
            <div>
              <Label>Nome Fantasia</Label>
              <Input value={form.nomeFantasia} onChange={e => setForm({ ...form, nomeFantasia: e.target.value })} data-testid="input-supplier-fantasia" />
            </div>
          </div>

          <div className="border rounded-lg p-3 space-y-3">
            <p className="text-sm font-medium">Comissões e Incentivos</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <Switch checked={form.paysCommission} onCheckedChange={v => setForm({ ...form, paysCommission: v })} data-testid="switch-commission" />
                <Label className="text-xs">Paga Comissão</Label>
              </div>
              {form.paysCommission && (
                <>
                  <div>
                    <Label className="text-xs">Tipo</Label>
                    <Select value={form.commissionType} onValueChange={v => setForm({ ...form, commissionType: v })}>
                      <SelectTrigger data-testid="select-commission-type"><SelectValue placeholder="Tipo" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Percentual</SelectItem>
                        <SelectItem value="fixed">Valor Fixo</SelectItem>
                        <SelectItem value="variable">Variável</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">% Comissão</Label>
                    <Input type="number" value={form.commissionPercent} onChange={e => setForm({ ...form, commissionPercent: e.target.value })} placeholder="0.00" data-testid="input-commission-percent" />
                  </div>
                </>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <Switch checked={form.hasIncentive} onCheckedChange={v => setForm({ ...form, hasIncentive: v })} data-testid="switch-incentive" />
                <Label className="text-xs">Incentivo</Label>
              </div>
              {form.hasIncentive && (
                <>
                  <div>
                    <Label className="text-xs">Tipo</Label>
                    <Input value={form.incentiveType} onChange={e => setForm({ ...form, incentiveType: e.target.value })} placeholder="Over commission, etc." data-testid="input-incentive-type" />
                  </div>
                  <div>
                    <Label className="text-xs">Valor</Label>
                    <Input type="number" value={form.incentiveValue} onChange={e => setForm({ ...form, incentiveValue: e.target.value })} placeholder="0.00" data-testid="input-incentive-value" />
                  </div>
                </>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <Switch checked={form.hasRebate} onCheckedChange={v => setForm({ ...form, hasRebate: v })} data-testid="switch-rebate" />
                <Label className="text-xs">Rebate</Label>
              </div>
              {form.hasRebate && (
                <div>
                  <Label className="text-xs">% Rebate</Label>
                  <Input type="number" value={form.rebatePercent} onChange={e => setForm({ ...form, rebatePercent: e.target.value })} placeholder="0.00" data-testid="input-rebate-percent" />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Contato</Label>
              <Input value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} placeholder="Nome do contato" data-testid="input-supplier-contact" />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} placeholder="email@fornecedor.com" data-testid="input-supplier-email" />
            </div>
            <div>
              <Label className="text-xs">Telefone</Label>
              <Input value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} placeholder="(11) 99999-0000" data-testid="input-supplier-phone" />
            </div>
          </div>

          <div>
            <Label className="text-xs">Observações</Label>
            <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} data-testid="input-supplier-notes" />
          </div>

          <Button className="w-full" onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.cnpj || !form.razaoSocial} data-testid="button-save-supplier">
            {mutation.isPending ? "Salvando..." : isEdit ? "Atualizar Fornecedor" : "Cadastrar Fornecedor"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DataSourcesTab({ toast }: { toast: any }) {
  const [addOpen, setAddOpen] = useState(false);
  const { data: sources = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/audit-pag/data-sources"] });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/audit-pag/data-sources/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/data-sources"] });
      toast({ title: "Fonte desativada" });
    },
  });

  const sourceTypeIcons: Record<string, any> = {
    obt: Globe, gds: Server, erp: HardDrive, email: Mail, whatsapp: MessageSquare,
    bank: Landmark, approval_system: ShieldCheck, other: Database,
  };

  const sourceTypeLabels: Record<string, string> = {
    obt: "OBT (Online Booking Tool)", gds: "GDS (Global Distribution System)", erp: "ERP / Sistema Financeiro",
    email: "Email Corporativo", whatsapp: "WhatsApp Business", bank: "Banco / Open Banking",
    approval_system: "Sistema de Aprovação", other: "Outro",
  };

  const methodLabels: Record<string, string> = {
    api: "API REST", sftp: "SFTP", imap: "IMAP/POP3", webhook: "Webhook",
    ofx: "OFX (Open Financial Exchange)", cnab: "CNAB (Febraban)", manual_upload: "Upload Manual",
  };

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Fontes de Dados Pré-Aprovadas ({sources.length})
            </CardTitle>
            <Button size="sm" onClick={() => setAddOpen(true)} data-testid="button-add-datasource">
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Fonte
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Apenas dados de fontes pré-aprovadas são aceitos no pipeline de reconciliação. Conexão via API ou SFTP — sem interferência humana.
          </p>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-datasources">
              <Database className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Nenhuma fonte de dados configurada</p>
              <p className="text-xs mt-1">Configure OBT, GDS, ERP, Email ou Banco para ingestão automática</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sources.map((source: any) => {
                const Icon = sourceTypeIcons[source.sourceType] || Database;
                return (
                  <div key={source.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors" data-testid={`card-datasource-${source.id}`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm" data-testid={`text-datasource-name-${source.id}`}>{source.name}</span>
                          <Badge variant={source.status === "active" ? "default" : "secondary"} className="text-[10px]">
                            {source.status === "active" ? "Ativo" : "Inativo"}
                          </Badge>
                          {source.isTrusted && <Badge variant="outline" className="text-[9px] text-green-600">Confiável</Badge>}
                        </div>
                        <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                          <span>{sourceTypeLabels[source.sourceType] || source.sourceType}</span>
                          <span>• {methodLabels[source.connectionMethod] || source.connectionMethod}</span>
                          {source.schedule && <span>• Agenda: {source.schedule}</span>}
                        </div>
                        {source.endpointUrl && <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{source.endpointUrl}</p>}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(source.id)} data-testid={`button-delete-datasource-${source.id}`}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <DataSourceFormDialog open={addOpen} onOpenChange={setAddOpen} toast={toast} />
    </div>
  );
}

function DataSourceFormDialog({ open, onOpenChange, toast }: { open: boolean; onOpenChange: (o: boolean) => void; toast: any }) {
  const [form, setForm] = useState({
    name: "", sourceType: "", connectionMethod: "", endpointUrl: "",
    sftpHost: "", sftpPort: 22, sftpDirectory: "", authType: "",
    schedule: "", isTrusted: true, notes: "",
  });

  const mutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/audit-pag/data-sources", form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/data-sources"] });
      toast({ title: "Fonte de dados cadastrada" });
      onOpenChange(false);
    },
    onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Nova Fonte de Dados
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nome *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Reserve OBT, Stur ERP" data-testid="input-datasource-name" />
            </div>
            <div>
              <Label>Tipo de Fonte *</Label>
              <Select value={form.sourceType} onValueChange={v => setForm({ ...form, sourceType: v })}>
                <SelectTrigger data-testid="select-datasource-type"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="obt">OBT (Online Booking Tool)</SelectItem>
                  <SelectItem value="gds">GDS (Global Distribution System)</SelectItem>
                  <SelectItem value="erp">ERP / Sistema Financeiro</SelectItem>
                  <SelectItem value="email">Email Corporativo</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp Business</SelectItem>
                  <SelectItem value="bank">Banco / Open Banking</SelectItem>
                  <SelectItem value="approval_system">Sistema de Aprovação</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Método de Conexão *</Label>
              <Select value={form.connectionMethod} onValueChange={v => setForm({ ...form, connectionMethod: v })}>
                <SelectTrigger data-testid="select-connection-method"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="api">API REST</SelectItem>
                  <SelectItem value="sftp">SFTP</SelectItem>
                  <SelectItem value="imap">IMAP / POP3 (Email)</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="ofx">OFX (Open Financial Exchange)</SelectItem>
                  <SelectItem value="cnab">CNAB (Febraban)</SelectItem>
                  <SelectItem value="manual_upload">Upload Manual (fallback)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Autenticação</Label>
              <Select value={form.authType} onValueChange={v => setForm({ ...form, authType: v })}>
                <SelectTrigger data-testid="select-auth-type"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="api_key">API Key</SelectItem>
                  <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                  <SelectItem value="basic">Basic Auth</SelectItem>
                  <SelectItem value="certificate">Certificado Digital</SelectItem>
                  <SelectItem value="ssh_key">SSH Key (SFTP)</SelectItem>
                  <SelectItem value="none">Sem Autenticação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(form.connectionMethod === "api" || form.connectionMethod === "webhook") && (
            <div>
              <Label>URL do Endpoint</Label>
              <Input value={form.endpointUrl} onChange={e => setForm({ ...form, endpointUrl: e.target.value })} placeholder="https://api.example.com/v1/" data-testid="input-endpoint-url" />
            </div>
          )}

          {form.connectionMethod === "sftp" && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Host SFTP</Label>
                <Input value={form.sftpHost} onChange={e => setForm({ ...form, sftpHost: e.target.value })} placeholder="sftp.example.com" data-testid="input-sftp-host" />
              </div>
              <div>
                <Label>Porta</Label>
                <Input type="number" value={form.sftpPort} onChange={e => setForm({ ...form, sftpPort: parseInt(e.target.value) || 22 })} data-testid="input-sftp-port" />
              </div>
              <div>
                <Label>Diretório</Label>
                <Input value={form.sftpDirectory} onChange={e => setForm({ ...form, sftpDirectory: e.target.value })} placeholder="/data/export/" data-testid="input-sftp-dir" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Agenda de Coleta</Label>
              <Select value={form.schedule} onValueChange={v => setForm({ ...form, schedule: v })}>
                <SelectTrigger data-testid="select-schedule"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Tempo Real (Webhook)</SelectItem>
                  <SelectItem value="hourly">A cada hora</SelectItem>
                  <SelectItem value="daily_morning">Diário (manhã)</SelectItem>
                  <SelectItem value="daily_evening">Diário (noite)</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="on_demand">Sob Demanda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch checked={form.isTrusted} onCheckedChange={v => setForm({ ...form, isTrusted: v })} data-testid="switch-trusted" />
              <Label className="text-sm">Fonte Confiável (dados aceitos sem revisão manual)</Label>
            </div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} data-testid="input-datasource-notes" />
          </div>

          <Button className="w-full" onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.name || !form.sourceType || !form.connectionMethod} data-testid="button-save-datasource">
            {mutation.isPending ? "Salvando..." : "Cadastrar Fonte de Dados"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ServiceTypesTab({ toast }: { toast: any }) {
  const [addOpen, setAddOpen] = useState(false);
  const { data: types = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/audit-pag/service-types"] });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/audit-pag/service-types/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/service-types"] });
      toast({ title: "Tipo de serviço desativado" });
    },
  });

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Tipos de Serviço ({types.length})
            </CardTitle>
            <Button size="sm" onClick={() => setAddOpen(true)} data-testid="button-add-service">
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Serviço
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Configure os tipos de serviço prestados. O sistema identifica automaticamente qual fornecedor foi utilizado e se há comissão/incentivo.
          </p>
        </CardHeader>
        <CardContent>
          {types.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-services">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Nenhum tipo de serviço cadastrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {types.map((type: any) => (
                <div key={type.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`card-service-${type.id}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{type.name}</span>
                      <Badge variant="outline" className="text-[9px]">{type.category}</Badge>
                      {!type.isActive && <Badge variant="destructive" className="text-[9px]">Inativo</Badge>}
                    </div>
                    {type.description && <p className="text-xs text-muted-foreground mt-1">{type.description}</p>}
                    <div className="flex gap-2 mt-1">
                      {type.requiresCommissionCheck && <Badge variant="outline" className="text-[9px] text-orange-600">Verifica Comissão</Badge>}
                      {type.requiresIncentiveCheck && <Badge variant="outline" className="text-[9px] text-blue-600">Verifica Incentivo</Badge>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(type.id)} data-testid={`button-delete-service-${type.id}`}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ServiceFormDialog open={addOpen} onOpenChange={setAddOpen} toast={toast} />
    </div>
  );
}

function ServiceFormDialog({ open, onOpenChange, toast }: { open: boolean; onOpenChange: (o: boolean) => void; toast: any }) {
  const [form, setForm] = useState({
    name: "", category: "", description: "",
    requiresCommissionCheck: false, requiresIncentiveCheck: false,
  });

  const mutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/audit-pag/service-types", form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/service-types"] });
      toast({ title: "Tipo de serviço cadastrado" });
      onOpenChange(false);
    },
    onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Novo Tipo de Serviço
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome do Serviço *</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Passagem Aérea, Hospedagem, Locação de Veículo" data-testid="input-service-name" />
          </div>
          <div>
            <Label>Categoria *</Label>
            <Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Ex: Transporte, Hospedagem, Tecnologia, etc." data-testid="input-service-category" />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} data-testid="input-service-desc" />
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={form.requiresCommissionCheck} onCheckedChange={v => setForm({ ...form, requiresCommissionCheck: v })} data-testid="switch-requires-commission" />
              <Label className="text-sm">Verificar Comissão</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.requiresIncentiveCheck} onCheckedChange={v => setForm({ ...form, requiresIncentiveCheck: v })} data-testid="switch-requires-incentive" />
              <Label className="text-sm">Verificar Incentivo</Label>
            </div>
          </div>
          <Button className="w-full" onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.name || !form.category} data-testid="button-save-service">
            {mutation.isPending ? "Salvando..." : "Cadastrar Serviço"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FeeConfigTab({ toast }: { toast: any }) {
  const [addOpen, setAddOpen] = useState(false);
  const { data: configs = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/audit-pag/fee-config"] });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/audit-pag/fee-config/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/fee-config"] });
      toast({ title: "Taxa desativada" });
    },
  });

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Configuração de Taxas de Serviço — FEE ({configs.length})
            </CardTitle>
            <Button size="sm" onClick={() => setAddOpen(true)} data-testid="button-add-fee">
              <Plus className="w-4 h-4 mr-1" />
              Nova Taxa
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            A taxa de serviço (FEE) é cobrada do cliente em fatura SEPARADA da fatura do serviço. O AuraTRUST inclui o FEE na reconciliação de recebimentos.
          </p>
        </CardHeader>
        <CardContent>
          {configs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-fees">
              <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Nenhuma taxa configurada</p>
            </div>
          ) : (
            <div className="space-y-2">
              {configs.map((config: any) => (
                <div key={config.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`card-fee-${config.id}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{config.feeName}</span>
                      <Badge variant="outline" className="text-[9px]">
                        {config.feeType === "percent" ? `${config.feeValue}%` : `R$ ${parseFloat(config.feeValue).toFixed(2)}`}
                      </Badge>
                      {config.separateInvoice && <Badge variant="outline" className="text-[9px] text-blue-600">Fatura Separada</Badge>}
                      {!config.isActive && <Badge variant="destructive" className="text-[9px]">Inativa</Badge>}
                    </div>
                    {config.billingDescription && <p className="text-xs text-muted-foreground mt-1">{config.billingDescription}</p>}
                    {config.appliesTo && <p className="text-[10px] text-muted-foreground">Aplica-se a: {config.appliesTo}</p>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(config.id)} data-testid={`button-delete-fee-${config.id}`}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FeeFormDialog open={addOpen} onOpenChange={setAddOpen} toast={toast} />
    </div>
  );
}

function FeeFormDialog({ open, onOpenChange, toast }: { open: boolean; onOpenChange: (o: boolean) => void; toast: any }) {
  const [form, setForm] = useState({
    feeName: "", feeType: "fixed", feeValue: "",
    separateInvoice: true, billingDescription: "", appliesTo: "",
  });

  const mutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/audit-pag/fee-config", form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/fee-config"] });
      toast({ title: "Taxa cadastrada" });
      onOpenChange(false);
    },
    onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Nova Taxa de Serviço (FEE)
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome da Taxa *</Label>
            <Input value={form.feeName} onChange={e => setForm({ ...form, feeName: e.target.value })} placeholder="Ex: FEE Aéreo, FEE Hotel, FEE Administrativo" data-testid="input-fee-name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo *</Label>
              <Select value={form.feeType} onValueChange={v => setForm({ ...form, feeType: v })}>
                <SelectTrigger data-testid="select-fee-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                  <SelectItem value="percent">Percentual (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{form.feeType === "percent" ? "Percentual (%)" : "Valor (R$)"}</Label>
              <Input type="number" value={form.feeValue} onChange={e => setForm({ ...form, feeValue: e.target.value })} placeholder="0.00" data-testid="input-fee-value" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.separateInvoice} onCheckedChange={v => setForm({ ...form, separateInvoice: v })} data-testid="switch-separate-invoice" />
            <Label className="text-sm">Fatura separada do serviço (padrão agências)</Label>
          </div>
          <div>
            <Label>Descrição de Cobrança</Label>
            <Input value={form.billingDescription} onChange={e => setForm({ ...form, billingDescription: e.target.value })} placeholder="Descrição na fatura" data-testid="input-fee-billing-desc" />
          </div>
          <div>
            <Label>Aplica-se a (tipos de serviço)</Label>
            <Input value={form.appliesTo} onChange={e => setForm({ ...form, appliesTo: e.target.value })} placeholder="Todos, Aéreo, Hotel, etc." data-testid="input-fee-applies" />
          </div>
          <Button className="w-full" onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.feeName || !form.feeValue} data-testid="button-save-fee">
            {mutation.isPending ? "Salvando..." : "Cadastrar Taxa"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PaymentMethodsTab({ toast }: { toast: any }) {
  const [addOpen, setAddOpen] = useState(false);
  const { data: methods = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/audit-pag/payment-methods"] });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/audit-pag/payment-methods/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/payment-methods"] });
      toast({ title: "Método desativado" });
    },
  });

  const methodIcons: Record<string, any> = {
    faturado: FileText, pix: Wifi, deposito: Landmark, cartao: CreditCard,
    boleto: FileText, ted: Landmark, other: CreditCard,
  };

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Meios de Pagamento Aceitos ({methods.length})
            </CardTitle>
            <Button size="sm" onClick={() => setAddOpen(true)} data-testid="button-add-payment">
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Método
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Configure os meios de pagamento aceitos do cliente e para o fornecedor. Meios com reconciliação bancária serão cruzados automaticamente com o extrato.
          </p>
        </CardHeader>
        <CardContent>
          {methods.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-no-payments">
              <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Nenhum meio de pagamento configurado</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {methods.map((method: any) => {
                const Icon = methodIcons[method.methodType] || CreditCard;
                return (
                  <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`card-payment-${method.id}`}>
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-indigo-600" />
                      <div>
                        <span className="font-medium text-sm">{method.name}</span>
                        <div className="flex gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[9px]">{method.methodType}</Badge>
                          {method.requiresBankReconciliation && <Badge variant="outline" className="text-[9px] text-green-600">Reconciliação Bancária</Badge>}
                          {!method.isActive && <Badge variant="destructive" className="text-[9px]">Inativo</Badge>}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(method.id)} data-testid={`button-delete-payment-${method.id}`}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <PaymentFormDialog open={addOpen} onOpenChange={setAddOpen} toast={toast} />
    </div>
  );
}

function PaymentFormDialog({ open, onOpenChange, toast }: { open: boolean; onOpenChange: (o: boolean) => void; toast: any }) {
  const [form, setForm] = useState({
    name: "", methodType: "", requiresBankReconciliation: true,
  });

  const mutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/audit-pag/payment-methods", form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-pag/payment-methods"] });
      toast({ title: "Método de pagamento cadastrado" });
      onOpenChange(false);
    },
    onError: (err: any) => toast({ title: "Erro", description: err.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Novo Meio de Pagamento
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome *</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Faturado 30dd, PIX, Cartão Corporativo" data-testid="input-payment-name" />
          </div>
          <div>
            <Label>Tipo *</Label>
            <Select value={form.methodType} onValueChange={v => setForm({ ...form, methodType: v })}>
              <SelectTrigger data-testid="select-payment-type"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="faturado">Faturado (Boleto/NF)</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="deposito">Depósito Bancário</SelectItem>
                <SelectItem value="cartao">Cartão de Crédito/Débito</SelectItem>
                <SelectItem value="boleto">Boleto Bancário</SelectItem>
                <SelectItem value="ted">TED / Transferência</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.requiresBankReconciliation} onCheckedChange={v => setForm({ ...form, requiresBankReconciliation: v })} data-testid="switch-bank-reconciliation" />
            <Label className="text-sm">Requer reconciliação bancária (cruzar com extrato)</Label>
          </div>
          <Button className="w-full" onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.name || !form.methodType} data-testid="button-save-payment">
            {mutation.isPending ? "Salvando..." : "Cadastrar Método"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

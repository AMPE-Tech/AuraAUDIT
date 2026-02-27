import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Building2,
  Shield,
  Save,
  Loader2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Users,
  Hash,
  Send,
  MessageCircle,
  Sparkles,
  CheckCircle,
} from "lucide-react";

type CompanyProfile = {
  id: string;
  name: string;
  type: string;
  cnpj: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  status: string;
  notes: string | null;
};

export default function CompanyProfile() {
  const { toast } = useToast();
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);
  const [form, setForm] = useState({
    name: "",
    cnpj: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    city: "",
    state: "",
    notes: "",
  });

  const { data, isLoading } = useQuery<{ profile: CompanyProfile | null }>({
    queryKey: ["/api/company/auditor"],
  });

  useEffect(() => {
    if (data?.profile) {
      setForm({
        name: data.profile.name || "",
        cnpj: data.profile.cnpj || "",
        contactName: data.profile.contactName || "",
        contactEmail: data.profile.contactEmail || "",
        contactPhone: data.profile.contactPhone || "",
        address: data.profile.address || "",
        city: data.profile.city || "",
        state: data.profile.state || "",
        notes: data.profile.notes || "",
      });
    }
  }, [data]);

  async function handleCnpjLookup() {
    const digits = form.cnpj.replace(/\D/g, "");
    if (digits.length !== 14) {
      toast({ title: "CNPJ deve ter 14 digitos", variant: "destructive" });
      return;
    }
    const { validateCNPJ } = await import("@shared/validators");
    if (!validateCNPJ(digits)) {
      toast({ title: "CNPJ invalido", description: "Digitos verificadores nao conferem.", variant: "destructive" });
      return;
    }
    setIsLookingUp(true);
    try {
      const res = await fetch(`/api/cnpj/${digits}`, { credentials: "include" });
      if (!res.ok) {
        const err = await res.json();
        toast({ title: err.error || "CNPJ nao encontrado", variant: "destructive" });
        return;
      }
      const data = await res.json();
      setForm((f) => ({
        ...f,
        name: data.nomeFantasia || data.razaoSocial || f.name,
        cnpj: data.cnpjFormatado || f.cnpj,
        contactEmail: data.email?.toLowerCase() || f.contactEmail,
        contactPhone: data.telefone || f.contactPhone,
        address: data.endereco || f.address,
        city: data.cidade || f.city,
        state: data.uf || f.state,
        contactName: data.socios?.[0]?.nome || f.contactName,
      }));
      setLookupDone(true);
      toast({ title: `Dados de "${data.nomeFantasia || data.razaoSocial}" carregados da Receita Federal` });
    } catch {
      toast({ title: "Erro ao consultar a Receita Federal", variant: "destructive" });
    } finally {
      setIsLookingUp(false);
    }
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/company/auditor", form);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Dados salvos", description: "Perfil da empresa atualizado com sucesso." });
      queryClient.invalidateQueries({ queryKey: ["/api/company/auditor"] });
    },
    onError: () => {
      toast({ title: "Erro", description: "Nao foi possivel salvar os dados.", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1000px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-company-profile-title">
            Cadastro da Empresa
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dados da AuraAUDIT que aparecem nos contratos, relatorios e comunicacoes
          </p>
        </div>
        <Badge variant="outline" className="text-xs gap-1">
          <Building2 className="w-3 h-3" />
          Empresa Auditora
        </Badge>
      </div>

      <Card className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 shrink-0 mt-0.5">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                Estes dados alimentam automaticamente o contrato
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                O nome, CNPJ e email cadastrados aqui aparecem como "Contratada" no contrato digital
                e sao utilizados para gerar o link de envio via WhatsApp e comunicacoes com o cliente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Dados da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs">Razao Social / Nome *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="AuraAUDIT - AuraDue Tecnologia Ltda"
                data-testid="input-company-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj" className="text-xs">CNPJ *</Label>
              <div className="flex gap-2">
                <Input
                  id="cnpj"
                  value={form.cnpj}
                  onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                  placeholder="00.000.000/0001-00"
                  data-testid="input-company-cnpj"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="shrink-0 gap-1.5 px-3"
                  onClick={handleCnpjLookup}
                  disabled={isLookingUp}
                  data-testid="button-company-cnpj-lookup"
                >
                  {isLookingUp ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {isLookingUp ? "Buscando..." : "Buscar"}
                </Button>
              </div>
              {lookupDone && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs">
                  <CheckCircle className="w-3 h-3" />
                  Dados carregados da Receita Federal
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Contato Principal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactName" className="text-xs">Nome do Responsavel *</Label>
              <Input
                id="contactName"
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                placeholder="Nome completo"
                data-testid="input-contact-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="text-xs flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email *
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                placeholder="contato@empresa.com"
                data-testid="input-contact-email"
              />
              <p className="text-[10px] text-muted-foreground">Utilizado para envio de contratos e comunicacoes</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone" className="text-xs flex items-center gap-1">
                <Phone className="w-3 h-3" /> Telefone / WhatsApp
              </Label>
              <Input
                id="contactPhone"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                placeholder="(11) 99999-0000"
                data-testid="input-contact-phone"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Endereco
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="address" className="text-xs">Logradouro</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Rua, Av., etc."
                data-testid="input-address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-xs">Cidade</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Cidade"
                data-testid="input-city"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="text-xs">Estado</Label>
              <Input
                id="state"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="UF"
                data-testid="input-state"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs">Observacoes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Informacoes adicionais sobre a empresa..."
              rows={3}
              data-testid="input-notes"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button
          size="lg"
          className="gap-2"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || !form.name || !form.cnpj || !form.contactEmail}
          data-testid="button-save-company"
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Salvar Cadastro
        </Button>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3" />
          <span>Cadeia de Custodia Digital — AuraDue</span>
        </div>
        <span>AuraAUDIT — Due Diligence Platform</span>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Filter,
  Building2,
  Briefcase,
  Pencil,
  ShieldCheck,
  Users,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Client } from "@shared/schema";
import { insertClientSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const clientFormSchema = insertClientSchema.extend({
  name: z.string().min(2, "Nome obrigatorio"),
  type: z.string().min(1, "Tipo obrigatorio"),
  cnpj: z.string().min(14, "CNPJ invalido"),
  contactName: z.string().min(2, "Nome do contato obrigatorio"),
  contactEmail: z.string().email("Email invalido"),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

function formatCNPJ(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return cnpj;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

function getClientTypeLabel(type: string): string {
  switch (type) {
    case "travel_agency": return "Agencia de Viagens";
    case "corporate_company": return "Empresa Corporativa";
    default: return type;
  }
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active": return "default";
    case "inactive": return "destructive";
    case "pending": return "secondary";
    default: return "outline";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "active": return "Ativo";
    case "inactive": return "Inativo";
    case "pending": return "Pendente";
    default: return status;
  }
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "active":
      return <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />;
    case "inactive":
      return <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />;
    default:
      return <Clock className="w-3.5 h-3.5 text-muted-foreground" />;
  }
}

function ClientFormFields({ form }: { form: ReturnType<typeof useForm<ClientFormData>> }) {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Nome da empresa" data-testid="input-client-name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-client-type">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="travel_agency">Agencia de Viagens</SelectItem>
                  <SelectItem value="corporate_company">Empresa Corporativa</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cnpj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CNPJ</FormLabel>
              <FormControl>
                <Input {...field} placeholder="00.000.000/0000-00" data-testid="input-client-cnpj" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="contactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contato</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nome do contato" data-testid="input-client-contact-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="email@empresa.com" data-testid="input-client-contact-email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="contactPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone</FormLabel>
            <FormControl>
              <Input {...field} value={field.value || ""} placeholder="(11) 99999-0000" data-testid="input-client-phone" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-3 gap-3">
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormLabel>Endereco</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} placeholder="Endereco" data-testid="input-client-address" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cidade</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} placeholder="Cidade" data-testid="input-client-city" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>UF</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} placeholder="SP" maxLength={2} data-testid="input-client-state" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || "pending"}>
              <FormControl>
                <SelectTrigger data-testid="select-client-status">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observacoes</FormLabel>
            <FormControl>
              <Textarea {...field} value={field.value || ""} placeholder="Observacoes adicionais" data-testid="input-client-notes" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const { toast } = useToast();

  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const createForm = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      type: "",
      cnpj: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      city: "",
      state: "",
      status: "pending",
      notes: "",
    },
  });

  const editForm = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      type: "",
      cnpj: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      city: "",
      state: "",
      status: "pending",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const res = await apiRequest("POST", "/api/clients", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({ title: "Cliente cadastrado com sucesso" });
      setCreateDialogOpen(false);
      createForm.reset();
    },
    onError: () => {
      toast({ title: "Erro ao cadastrar cliente", variant: "destructive" });
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ClientFormData> }) => {
      const res = await apiRequest("PATCH", `/api/clients/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({ title: "Cliente atualizado com sucesso" });
      setEditingClient(null);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar cliente", variant: "destructive" });
    },
  });

  function openEditDialog(client: Client) {
    setEditingClient(client);
    editForm.reset({
      name: client.name,
      type: client.type,
      cnpj: client.cnpj,
      contactName: client.contactName,
      contactEmail: client.contactEmail,
      contactPhone: client.contactPhone || "",
      address: client.address || "",
      city: client.city || "",
      state: client.state || "",
      status: client.status,
      notes: client.notes || "",
    });
  }

  const filtered = clients?.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cnpj.includes(searchTerm) ||
      c.contactName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === "all" || c.type === typeFilter;
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const activeCount = clients?.filter((c) => c.status === "active").length || 0;
  const agencyCount = clients?.filter((c) => c.type === "travel_agency").length || 0;
  const corporateCount = clients?.filter((c) => c.type === "corporate_company").length || 0;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-clients-title">
            Cadastro de Clientes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestao de agencias de viagens e empresas corporativas
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-client">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Cliente</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form
                onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))}
                className="space-y-4"
              >
                <ClientFormFields form={createForm} />
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-client">
                  {createMutation.isPending ? "Cadastrando..." : "Cadastrar Cliente"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Clientes</p>
              <p className="text-xl font-bold" data-testid="text-total-clients">{clients?.length || 0}</p>
              <p className="text-[11px] text-muted-foreground">{activeCount} ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-blue-500/10">
              <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Agencias de Viagens</p>
              <p className="text-xl font-bold" data-testid="text-agency-count">{agencyCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-green-500/10">
              <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Empresas Corporativas</p>
              <p className="text-xl font-bold" data-testid="text-corporate-count">{corporateCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-clients"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-filter-type">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="travel_agency">Agencia de Viagens</SelectItem>
            <SelectItem value="corporate_company">Empresa Corporativa</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-filter-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-sm font-medium">
            {filtered?.length || 0} clientes encontrados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered && filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Cidade/UF</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Custodia</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((client) => {
                    const TypeIcon = client.type === "travel_agency" ? Briefcase : Building2;
                    return (
                      <TableRow key={client.id} data-testid={`row-client-${client.id}`}>
                        <TableCell>
                          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                            <TypeIcon className="w-4 h-4 text-primary" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium" data-testid={`text-client-name-${client.id}`}>{client.name}</p>
                          <p className="text-xs text-muted-foreground">{client.contactEmail}</p>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-mono" data-testid={`text-client-cnpj-${client.id}`}>
                            {formatCNPJ(client.cnpj)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px]">
                            {getClientTypeLabel(client.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{client.contactName}</p>
                          {client.contactPhone && (
                            <p className="text-xs text-muted-foreground">{client.contactPhone}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {client.city && client.state
                            ? `${client.city}/${client.state}`
                            : client.city || client.state || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <StatusIcon status={client.status} />
                            <Badge
                              variant={getStatusBadgeVariant(client.status)}
                              className="text-[10px]"
                              data-testid={`badge-client-status-${client.id}`}
                            >
                              {getStatusLabel(client.status)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Lei 13.964
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEditDialog(client)}
                            data-testid={`button-edit-client-${client.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-muted-foreground">
              <Users className="w-10 h-10 mb-3" />
              <p className="text-sm font-medium">Nenhum cliente encontrado</p>
              <p className="text-xs mt-1">Ajuste os filtros ou cadastre um novo cliente</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          {editingClient && (
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit((data) =>
                  editMutation.mutate({ id: editingClient.id, data })
                )}
                className="space-y-4"
              >
                <ClientFormFields form={editForm} />
                <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Cadeia de custodia: Todas as alteracoes sao registradas conforme Lei 13.964/2019
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={editMutation.isPending} data-testid="button-update-client">
                  {editMutation.isPending ? "Atualizando..." : "Atualizar Cliente"}
                </Button>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

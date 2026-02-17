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
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  FolderSearch,
  Clock,
  TrendingDown,
  FileText,
} from "lucide-react";
import { formatCurrency, formatDate, getStatusLabel } from "@/lib/formatters";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AuditCase } from "@shared/schema";
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

const caseFormSchema = z.object({
  title: z.string().min(3, "Titulo obrigatorio"),
  description: z.string().min(10, "Descricao obrigatoria"),
  priority: z.string().min(1, "Prioridade obrigatoria"),
  assignedTo: z.string().optional(),
  methodology: z.string().optional(),
  scope: z.string().optional(),
});

type CaseFormData = z.infer<typeof caseFormSchema>;

export default function AuditCases() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<AuditCase | null>(null);
  const { toast } = useToast();

  const { data: cases, isLoading } = useQuery<AuditCase[]>({
    queryKey: ["/api/audit-cases"],
  });

  const form = useForm<CaseFormData>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      assignedTo: "",
      methodology: "",
      scope: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CaseFormData) => {
      const res = await apiRequest("POST", "/api/audit-cases", {
        ...data,
        status: "open",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audit-cases"] });
      toast({ title: "Caso de auditoria criado com sucesso" });
      setDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Erro ao criar caso", variant: "destructive" });
    },
  });

  const filtered = cases?.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const priorityColor = (p: string) => {
    switch (p) {
      case "critical": return "destructive" as const;
      case "high": return "destructive" as const;
      case "medium": return "secondary" as const;
      case "low": return "outline" as const;
      default: return "outline" as const;
    }
  };

  const priorityLabel = (p: string) => {
    switch (p) {
      case "critical": return "Critico";
      case "high": return "Alta";
      case "medium": return "Media";
      case "low": return "Baixa";
      default: return p;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-cases-title">
            Casos de Auditoria
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Investigacoes e analises de conformidade
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-case">
              <Plus className="w-4 h-4 mr-2" />
              Novo Caso
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Caso de Auditoria</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titulo</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Titulo do caso" data-testid="input-case-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descricao</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Descricao detalhada do caso" data-testid="input-case-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-case-priority">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="critical">Critica</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsavel</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome do auditor responsavel" data-testid="input-case-assigned" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="methodology"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Metodologia</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Metodologia de auditoria aplicada" data-testid="input-case-methodology" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="scope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Escopo</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Escopo da investigacao" data-testid="input-case-scope" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-case">
                  {createMutation.isPending ? "Criando..." : "Criar Caso"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar casos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-cases"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-filter-case-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="open">Aberto</SelectItem>
            <SelectItem value="in_progress">Em Andamento</SelectItem>
            <SelectItem value="closed">Encerrado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <Card
              key={c.id}
              className="hover-elevate cursor-pointer"
              onClick={() => setSelectedCase(c)}
              data-testid={`card-case-${c.id}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 shrink-0">
                      <FolderSearch className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold truncate">{c.title}</h3>
                  </div>
                  <Badge variant={priorityColor(c.priority)} className="text-[10px] shrink-0">
                    {priorityLabel(c.priority)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                  {c.description}
                </p>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={c.status === "open" ? "default" : c.status === "in_progress" ? "secondary" : "outline"}
                      className="text-[10px]"
                    >
                      {getStatusLabel(c.status)}
                    </Badge>
                    {c.assignedTo && (
                      <span className="text-xs text-muted-foreground">{c.assignedTo}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {parseFloat(c.savingsIdentified || "0") > 0 && (
                      <div className="flex items-center gap-1">
                        <TrendingDown className="w-3 h-3 text-green-600 dark:text-green-400" />
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(c.savingsIdentified || "0")}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">
                        {formatDate(c.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="h-48 flex flex-col items-center justify-center text-muted-foreground">
            <FolderSearch className="w-10 h-10 mb-3" />
            <p className="text-sm font-medium">Nenhum caso encontrado</p>
            <p className="text-xs mt-1">Crie um novo caso de auditoria para comecar</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedCase && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FolderSearch className="w-5 h-5 text-primary" />
                  {selectedCase.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedCase.status === "open" ? "default" : selectedCase.status === "in_progress" ? "secondary" : "outline"}
                  >
                    {getStatusLabel(selectedCase.status)}
                  </Badge>
                  <Badge variant={priorityColor(selectedCase.priority)}>
                    Prioridade: {priorityLabel(selectedCase.priority)}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Descricao</h4>
                  <p className="text-sm">{selectedCase.description}</p>
                </div>
                {selectedCase.scope && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Escopo</h4>
                    <p className="text-sm">{selectedCase.scope}</p>
                  </div>
                )}
                {selectedCase.methodology && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Metodologia</h4>
                    <p className="text-sm">{selectedCase.methodology}</p>
                  </div>
                )}
                {selectedCase.findings && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Achados</h4>
                    <p className="text-sm">{selectedCase.findings}</p>
                  </div>
                )}
                {selectedCase.recommendations && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Recomendacoes</h4>
                    <p className="text-sm">{selectedCase.recommendations}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Valor Total Analisado</p>
                    <p className="text-sm font-semibold">{formatCurrency(selectedCase.totalAmount || "0")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Economia Identificada</p>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(selectedCase.savingsIdentified || "0")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t">
                  {selectedCase.assignedTo && (
                    <p className="text-xs text-muted-foreground">
                      Responsavel: <span className="font-medium text-foreground">{selectedCase.assignedTo}</span>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Criado em: {formatDate(selectedCase.createdAt)}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

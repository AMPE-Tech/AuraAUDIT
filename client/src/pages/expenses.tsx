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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Filter,
  Plane,
  Hotel,
  Utensils,
  Car,
  Calendar,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Receipt,
} from "lucide-react";
import { formatCurrency, formatDate, getStatusLabel, getCategoryLabel, getRiskBadgeVariant, getSeverityLabel } from "@/lib/formatters";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Expense } from "@shared/schema";
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

const categoryIcons: Record<string, any> = {
  airfare: Plane,
  hotel: Hotel,
  meals: Utensils,
  transport: Car,
  event: Calendar,
  other: Package,
};

const expenseFormSchema = z.object({
  type: z.string().min(1, "Tipo obrigatorio"),
  category: z.string().min(1, "Categoria obrigatoria"),
  description: z.string().min(3, "Descricao obrigatoria"),
  amount: z.string().min(1, "Valor obrigatorio"),
  currency: z.string().default("BRL"),
  date: z.string().min(1, "Data obrigatoria"),
  vendor: z.string().min(1, "Fornecedor obrigatorio"),
  department: z.string().min(1, "Departamento obrigatorio"),
  employee: z.string().min(1, "Funcionario obrigatorio"),
  origin: z.string().optional(),
  destination: z.string().optional(),
  notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "flagged":
      return <AlertTriangle className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />;
    case "approved":
      return <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />;
    case "rejected":
      return <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />;
    default:
      return <Clock className="w-3.5 h-3.5 text-muted-foreground" />;
  }
}

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: expenses, isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      type: "travel",
      category: "",
      description: "",
      amount: "",
      currency: "BRL",
      date: "",
      vendor: "",
      department: "",
      employee: "",
      origin: "",
      destination: "",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      const res = await apiRequest("POST", "/api/expenses", {
        ...data,
        amount: data.amount,
        date: new Date(data.date).toISOString(),
        status: "pending",
        riskLevel: "low",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({ title: "Despesa registrada com sucesso" });
      setDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Erro ao registrar despesa", variant: "destructive" });
    },
  });

  const filtered = expenses?.filter((e) => {
    const matchSearch =
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = categoryFilter === "all" || e.category === categoryFilter;
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  const totalAmount = filtered?.reduce((s, e) => s + parseFloat(e.amount), 0) || 0;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-expenses-title">
            Despesas Corporativas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestao e revisao de despesas de viagens e eventos
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-expense">
              <Plus className="w-4 h-4 mr-2" />
              Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Despesa</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-expense-type">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="travel">Viagem</SelectItem>
                            <SelectItem value="event">Evento</SelectItem>
                            <SelectItem value="accommodation">Hospedagem</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-expense-category">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="airfare">Passagem Aerea</SelectItem>
                            <SelectItem value="hotel">Hospedagem</SelectItem>
                            <SelectItem value="meals">Alimentacao</SelectItem>
                            <SelectItem value="transport">Transporte</SelectItem>
                            <SelectItem value="event">Evento</SelectItem>
                            <SelectItem value="other">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descricao</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Descricao da despesa" data-testid="input-expense-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor (R$)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="0,00" data-testid="input-expense-amount" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" data-testid="input-expense-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fornecedor</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome do fornecedor" data-testid="input-expense-vendor" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departamento</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Departamento" data-testid="input-expense-department" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Funcionario</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome do funcionario" data-testid="input-expense-employee" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="origin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origem</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Cidade origem" data-testid="input-expense-origin" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destino</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Cidade destino" data-testid="input-expense-destination" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observacoes</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Observacoes adicionais" data-testid="input-expense-notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-expense">
                  {createMutation.isPending ? "Registrando..." : "Registrar Despesa"}
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
            placeholder="Buscar despesas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-expenses"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-filter-category">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            <SelectItem value="airfare">Passagem Aerea</SelectItem>
            <SelectItem value="hotel">Hospedagem</SelectItem>
            <SelectItem value="meals">Alimentacao</SelectItem>
            <SelectItem value="transport">Transporte</SelectItem>
            <SelectItem value="event">Evento</SelectItem>
            <SelectItem value="other">Outros</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-filter-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="approved">Aprovado</SelectItem>
            <SelectItem value="rejected">Rejeitado</SelectItem>
            <SelectItem value="flagged">Sinalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-sm font-medium">
            {filtered?.length || 0} despesas encontradas
          </CardTitle>
          <span className="text-sm font-semibold text-primary" data-testid="text-total-amount">
            Total: {formatCurrency(totalAmount)}
          </span>
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
                    <TableHead>Descricao</TableHead>
                    <TableHead>Funcionario</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Risco</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((expense) => {
                    const CatIcon = categoryIcons[expense.category] || Receipt;
                    return (
                      <TableRow key={expense.id} data-testid={`row-expense-${expense.id}`}>
                        <TableCell>
                          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                            <CatIcon className="w-4 h-4 text-primary" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium">{expense.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {getCategoryLabel(expense.category)}
                            {expense.origin && expense.destination && (
                              <> | {expense.origin} → {expense.destination}</>
                            )}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm">{expense.employee}</TableCell>
                        <TableCell className="text-sm">{expense.vendor}</TableCell>
                        <TableCell className="text-sm">{formatDate(expense.date)}</TableCell>
                        <TableCell className="text-right text-sm font-semibold">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getRiskBadgeVariant(expense.riskLevel)}
                            className="text-[10px]"
                          >
                            {expense.riskLevel === "low" ? "Baixo" : expense.riskLevel === "medium" ? "Medio" : expense.riskLevel === "high" ? "Alto" : "Critico"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <StatusIcon status={expense.status} />
                            <span className="text-xs">{getStatusLabel(expense.status)}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-muted-foreground">
              <Receipt className="w-10 h-10 mb-3" />
              <p className="text-sm font-medium">Nenhuma despesa encontrada</p>
              <p className="text-xs mt-1">Ajuste os filtros ou registre uma nova despesa</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

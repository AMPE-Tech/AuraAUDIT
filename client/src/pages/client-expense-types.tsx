import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Plane,
  Briefcase,
  FileText,
  Building2,
  Phone,
  Car,
  Heart,
  ShoppingCart,
  Receipt,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

interface ExpenseType {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  contracted: boolean;
}

const ALL_EXPENSE_TYPES: ExpenseType[] = [
  {
    id: "travel_events",
    title: "Viagens e Eventos",
    description: "Passagens aereas, hospedagem, alimentacao, transporte e eventos corporativos.",
    icon: Plane,
    color: "bg-blue-500",
    contracted: true,
  },
  {
    id: "corporate_expenses",
    title: "Despesas Corporativas",
    description: "Despesas operacionais, cartoes corporativos, reembolsos e adiantamentos.",
    icon: Briefcase,
    color: "bg-emerald-500",
    contracted: false,
  },
  {
    id: "third_party_contracts",
    title: "Contratos com Terceiros",
    description: "Contratos de servicos, fornecedores, SLAs e conformidade contratual.",
    icon: FileText,
    color: "bg-violet-500",
    contracted: false,
  },
  {
    id: "travel_agencies",
    title: "Agencias de Viagens",
    description: "Fees, rebates, acordos comerciais e gestao de agencias corporativas.",
    icon: Building2,
    color: "bg-amber-500",
    contracted: false,
  },
  {
    id: "telecom",
    title: "Telecomunicacoes",
    description: "Telefonia, dados, cloud, licencas de software e infraestrutura de TI.",
    icon: Phone,
    color: "bg-cyan-500",
    contracted: false,
  },
  {
    id: "fleet_logistics",
    title: "Frota e Logistica",
    description: "Frota propria, locacao de veiculos, combustivel e logistica.",
    icon: Car,
    color: "bg-orange-500",
    contracted: false,
  },
  {
    id: "benefits_hr",
    title: "Beneficios",
    description: "Saude, odonto, vida, folha de pagamento e conformidade trabalhista.",
    icon: Heart,
    color: "bg-rose-500",
    contracted: false,
  },
  {
    id: "procurement",
    title: "Suprimentos e Compras",
    description: "Compras, cotacoes, licitacoes, estoque e gestao de fornecedores.",
    icon: ShoppingCart,
    color: "bg-indigo-500",
    contracted: false,
  },
];

function ExpenseTypeCard({ type, showStatus }: { type: ExpenseType; showStatus: "contracted" | "available" }) {
  const isContracted = showStatus === "contracted";

  return (
    <Card
      data-testid={`card-expense-type-${type.id}`}
      className={isContracted ? "ring-1 ring-emerald-500/30" : ""}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-md ${type.color} shrink-0`}>
            <type.icon className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-sm font-semibold">{type.title}</h3>
              {isContracted ? (
                <Badge variant="default" className="text-[10px] bg-emerald-600 hover:bg-emerald-700" data-testid={`badge-ativo-${type.id}`}>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Ativo
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px]" data-testid={`badge-disponivel-${type.id}`}>
                  Disponivel
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClientExpenseTypes() {
  const offeredTypes = ALL_EXPENSE_TYPES.filter((t) => !t.contracted);
  const contractedTypes = ALL_EXPENSE_TYPES.filter((t) => t.contracted);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight" data-testid="text-expense-types-title">
            Tipos de Despesas
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Categorias de despesas auditadas pela AuraAUDIT e tipos contratados neste projeto.
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base" data-testid="text-offered-title">
                Tipos de Despesas Oferecidos
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Todas as {ALL_EXPENSE_TYPES.length} categorias que a AuraAUDIT audita
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {offeredTypes.map((type) => (
                <ExpenseTypeCard key={type.id} type={type} showStatus="available" />
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base" data-testid="text-contracted-title">
                Tipos Contratados neste Projeto
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Categorias ativas na auditoria do cliente
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {contractedTypes.length > 0 ? (
                contractedTypes.map((type) => (
                  <ExpenseTypeCard key={type.id} type={type} showStatus="contracted" />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum tipo contratado ainda.
                </p>
              )}

              <Separator className="my-4" />

              <div className="rounded-md bg-muted/50 p-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Deseja expandir o escopo da auditoria para outras categorias de despesas?
                  Entre em contato com seu gestor de conta para conhecer as opcoes disponiveis
                  e solicitar uma proposta personalizada.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Plane,
  Briefcase,
  FileText,
  Phone,
  Car,
  Heart,
  ShoppingCart,
  Eye,
  Shield,
  CheckCircle2,
  Star,
  Clock,
} from "lucide-react";

const PRODUCTS = [
  {
    id: "travel_events",
    name: "Auditoria Forense em Viagens e Eventos",
    description:
      "Analise forense completa de despesas com passagens aereas, hospedagem, alimentacao, transporte terrestre, locacao de veiculos, seguros viagem e eventos corporativos.",
    icon: Plane,
    color: "bg-blue-500",
    pricing: "Sob consulta",
    contracted: true,
    features: [
      "Cruzamento multi-sistema (OBT, backoffice, GDS, BSPlink)",
      "Deteccao de fraudes e retencoes indevidas",
      "Analise de fees e acordos corporativos",
      "Reconciliacao com cartoes corporativos",
      "Relatorio executivo com recomendacoes",
    ],
  },
  {
    id: "corporate_expenses",
    name: "Auditoria Forense em Despesas Corporativas",
    description:
      "Revisao detalhada de despesas operacionais, cartoes corporativos, reembolsos e adiantamentos com foco em conformidade e recuperacao de valores.",
    icon: Briefcase,
    color: "bg-emerald-500",
    pricing: "Sob consulta",
    contracted: false,
    features: [
      "Analise de cartoes corporativos",
      "Verificacao de reembolsos e adiantamentos",
      "Cruzamento com politicas internas",
      "Deteccao de despesas duplicadas",
      "Monitoramento de limites e alcadas",
    ],
  },
  {
    id: "third_party_contracts",
    name: "Auditoria Forense em Contratos com Terceiros",
    description:
      "Avaliacao forense de contratos de servicos, fornecedores, SLAs e conformidade contratual, identificando desvios e oportunidades de economia.",
    icon: FileText,
    color: "bg-violet-500",
    pricing: "A partir de R$ 15.000/mes",
    contracted: false,
    features: [
      "Analise de SLAs e penalidades",
      "Verificacao de conformidade contratual",
      "Deteccao de sobrepreco e duplicidades",
      "Auditoria de aditivos contratuais",
      "Benchmark de mercado",
    ],
  },
  {
    id: "telecom",
    name: "Auditoria Forense em Telecomunicacoes",
    description:
      "Auditoria especializada em telefonia, dados, cloud, licencas de software e infraestrutura de TI, otimizando custos e identificando cobranças indevidas.",
    icon: Phone,
    color: "bg-cyan-500",
    pricing: "Sob consulta",
    contracted: false,
    features: [
      "Analise de faturas de telefonia e dados",
      "Auditoria de licencas de software",
      "Verificacao de contratos de cloud",
      "Otimizacao de planos e pacotes",
      "Deteccao de linhas e servicos inativos",
    ],
  },
  {
    id: "fleet_logistics",
    name: "Auditoria Forense em Frota e Logistica",
    description:
      "Revisao forense de custos com frota propria, locacao de veiculos, combustivel e operacoes logisticas, garantindo eficiencia e conformidade.",
    icon: Car,
    color: "bg-orange-500",
    pricing: "A partir de R$ 12.000/mes",
    contracted: false,
    features: [
      "Analise de custos de frota propria",
      "Auditoria de locacao de veiculos",
      "Verificacao de consumo de combustivel",
      "Deteccao de uso indevido de veiculos",
      "Otimizacao de rotas e logistica",
    ],
  },
  {
    id: "benefits_hr",
    name: "Auditoria Forense em Beneficios",
    description:
      "Auditoria de planos de saude, odontologico, seguro vida, folha de pagamento e conformidade trabalhista, identificando inconsistencias e valores a recuperar.",
    icon: Heart,
    color: "bg-rose-500",
    pricing: "Sob consulta",
    contracted: false,
    features: [
      "Analise de sinistralidade de planos",
      "Verificacao de elegibilidade de beneficiarios",
      "Auditoria de folha de pagamento",
      "Deteccao de cobranças indevidas",
      "Conformidade com legislacao trabalhista",
    ],
  },
  {
    id: "procurement",
    name: "Auditoria Forense em Suprimentos e Compras",
    description:
      "Revisao forense de processos de compras, cotacoes, licitacoes, gestao de estoque e relacionamento com fornecedores.",
    icon: ShoppingCart,
    color: "bg-indigo-500",
    pricing: "A partir de R$ 18.000/mes",
    contracted: false,
    features: [
      "Analise de processos de cotacao",
      "Auditoria de licitacoes e concorrencias",
      "Verificacao de gestao de estoque",
      "Deteccao de conflitos de interesse",
      "Avaliacao de fornecedores e compliance",
    ],
  },
  {
    id: "continuous_monitoring",
    name: "Monitoramento Continuo",
    description:
      "Acompanhamento continuo e preventivo de transacoes e processos, com alertas em tempo real e dashboards executivos para tomada de decisao.",
    icon: Eye,
    color: "bg-teal-500",
    pricing: "A partir de R$ 8.000/mes",
    contracted: false,
    features: [
      "Alertas em tempo real de anomalias",
      "Dashboards executivos personalizados",
      "Integracao continua com sistemas do cliente",
      "Relatorios periodicos automatizados",
      "Indicadores de risco e tendencias",
    ],
  },
  {
    id: "aura_tracker",
    name: "AuraTRACK — Audit Timeline Engine",
    description:
      "Transparencia operacional completa do projeto de auditoria com timeline, status dashboard e timesheet. Demonstra ao cliente o andamento real, tempo investido e eficiencia da equipe.",
    icon: Clock,
    color: "bg-sky-500",
    pricing: "Incluso no projeto",
    contracted: true,
    features: [
      "Timeline linear com semaforo de fases (verde/amarelo/vermelho/cinza)",
      "Project Health Score auto-calculado (On Track / Attention / Critical)",
      "Decomposicao de tempo operacional (Client Response / Audit Analysis / System Processing)",
      "Audit Efficiency Score com percentuais por categoria",
      "Timesheet operacional com registro detalhado de horas",
    ],
  },
];

export default function ClientProducts() {
  const contractedProducts = PRODUCTS.filter((p) => p.contracted);
  const availableProducts = PRODUCTS.filter((p) => !p.contracted);

  return (
    <div className="p-6 space-y-8 max-w-[1400px] mx-auto">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
            <Package className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">
              Produtos e Servicos
            </h1>
            <p className="text-sm text-muted-foreground">
              Catalogo de servicos AuraAUDIT e produtos contratados
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold" data-testid="text-contracted-section">
            Produtos Contratados
          </h2>
          <Badge variant="default" data-testid="badge-contracted-count">
            {contractedProducts.length} ativo{contractedProducts.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Servicos atualmente ativos no seu projeto de auditoria.
        </p>

        <div className="grid grid-cols-1 gap-4">
          {contractedProducts.map((product) => (
            <Card
              key={product.id}
              className="ring-2 ring-primary/20"
              data-testid={`card-product-contracted-${product.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-lg ${product.color} shrink-0`}
                    >
                      <product.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{product.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {product.pricing}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="default"
                    className="bg-emerald-600 hover:bg-emerald-600 shrink-0"
                    data-testid={`badge-status-${product.id}`}
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Contratado
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{product.description}</p>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Incluso neste servico
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-sm"
                        data-testid={`feature-${product.id}-${idx}`}
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold" data-testid="text-available-section">
            Catalogo de Servicos
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Outros servicos de auditoria forense disponiveis para contratacao.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableProducts.map((product) => (
            <Card
              key={product.id}
              data-testid={`card-product-available-${product.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-lg ${product.color} shrink-0`}
                    >
                      <product.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{product.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {product.pricing}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="shrink-0"
                    data-testid={`badge-status-${product.id}`}
                  >
                    Disponivel
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{product.description}</p>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Principais entregas
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {product.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                        data-testid={`feature-${product.id}-${idx}`}
                      >
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 opacity-40" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-between text-xs text-muted-foreground pb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3" />
          <span>Cadeia de Custodia Digital - Lei 13.964/2019</span>
        </div>
        <span>AuraAUDIT - Auditoria Forense em Despesas</span>
      </div>
    </div>
  );
}

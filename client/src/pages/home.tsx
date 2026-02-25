import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLocation } from "wouter";
import {
  Plane,
  FileText,
  Building2,
  Phone,
  Car,
  Heart,
  ShoppingCart,
  Briefcase,
  TrendingUp,
  Shield,
  Search,
  ArrowRight,
  BarChart3,
  PieChart,
  Target,
  Award,
  ChevronRight,
  ClipboardCheck,
  Database,
  Presentation,
  FileSignature,
  Upload,
  ListChecks,
  Settings,
  Eye,
} from "lucide-react";

const AUDIT_CATEGORIES = [
  {
    id: "travel_events",
    title: "Viagens e Eventos",
    description: "Passagens aereas, hospedagem, alimentacao, transporte e eventos corporativos.",
    icon: Plane,
    color: "bg-blue-500",
    active: true,
  },
  {
    id: "corporate_expenses",
    title: "Despesas Corporativas",
    description: "Despesas operacionais, cartoes corporativos, reembolsos e adiantamentos.",
    icon: Briefcase,
    color: "bg-emerald-500",
    active: false,
  },
  {
    id: "third_party_contracts",
    title: "Contratos com Terceiros",
    description: "Contratos de servicos, fornecedores, SLAs e conformidade contratual.",
    icon: FileText,
    color: "bg-violet-500",
    active: false,
  },
  {
    id: "travel_agencies",
    title: "Agencias de Viagens",
    description: "Fees, rebates, acordos comerciais e gestao de agencias corporativas.",
    icon: Building2,
    color: "bg-amber-500",
    active: false,
  },
  {
    id: "telecom",
    title: "Telecomunicacoes",
    description: "Telefonia, dados, cloud, licencas de software e infraestrutura de TI.",
    icon: Phone,
    color: "bg-cyan-500",
    active: false,
  },
  {
    id: "fleet_logistics",
    title: "Frota e Logistica",
    description: "Frota propria, locacao de veiculos, combustivel e logistica.",
    icon: Car,
    color: "bg-orange-500",
    active: false,
  },
  {
    id: "benefits_hr",
    title: "Beneficios",
    description: "Saude, odonto, vida, folha de pagamento e conformidade trabalhista.",
    icon: Heart,
    color: "bg-rose-500",
    active: false,
  },
  {
    id: "procurement",
    title: "Suprimentos e Compras",
    description: "Compras, cotacoes, licitacoes, estoque e gestao de fornecedores.",
    icon: ShoppingCart,
    color: "bg-indigo-500",
    active: false,
  },
];

const MAIN_CLIENTS = [
  "Novo Nordisk", "Natura", "Abbott", "BRF", "Samsung", "iFood",
  "Bayer", "Odebrecht", "Pirelli", "Boehringer Ingelheim", "Gerdau",
  "L'Oreal", "Lilly", "AstraZeneca", "Petrobras",
];

const INCONSISTENCY_TYPES = [
  { name: "Fraude", percentage: 8, color: "bg-red-500" },
  { name: "Retencoes", percentage: 25, color: "bg-blue-500" },
  { name: "Reembolso", percentage: 20, color: "bg-emerald-500" },
  { name: "Cobranca Fee", percentage: 30, color: "bg-amber-500" },
  { name: "Acordos Corporativos", percentage: 17, color: "bg-violet-500" },
];

const METHODOLOGY_STAGES = [
  { step: 1, title: "Contratacao do Servico", icon: FileSignature, description: "Contratacao online com formalizacao do escopo, prazos e entregaveis" },
  { step: 2, title: "Coleta de Dados", icon: Upload, description: "Upload dos dados e/ou conexao via API com multiplas fontes e sistemas" },
  { step: 3, title: "Reconciliacao AuraAudit", icon: ListChecks, description: "Cruzamento e analise forense dos dados — o cliente seleciona os itens a conciliar" },
  { step: 4, title: "Apresentacao dos Resultados", icon: Presentation, description: "Relatorio executivo com achados, recomendacoes e cronograma do projeto" },
  { step: 5, title: "Ajustes", icon: Settings, description: "Refinamento das analises e consolidacao das recomendacoes com as areas envolvidas" },
  { step: 6, title: "Monitoramento", icon: Eye, description: "Acompanhamento continuo da implementacao das recomendacoes e acoes corretivas" },
];

const YEARLY_PERFORMANCE = [
  { year: "2015", value: 45 },
  { year: "2016", value: 68 },
  { year: "2017", value: 95 },
  { year: "2018", value: 120 },
  { year: "2019", value: 230 },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>("travel_events");
  const [, setLocation] = useLocation();

  const activeCategory = AUDIT_CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className="p-6 space-y-8 max-w-[1400px] mx-auto">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" data-testid="text-page-title">AuraAUDIT</h1>
            <p className="text-sm text-muted-foreground">Auditoria Forense em Despesas</p>
          </div>
        </div>
        <p className="text-muted-foreground max-w-3xl mt-3">
          Especialistas em auditoria forense com foco em identificacao de inconsistencias, recuperacao de valores
          e otimizacao de processos corporativos. Atuacao independente, tecnica, estruturada e baseada em evidencias.
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Areas de Auditoria</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Selecione uma area para conhecer detalhes sobre a metodologia, resultados e cases.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AUDIT_CATEGORIES.map((category) => (
            <Card
              key={category.id}
              data-testid={`card-audit-category-${category.id}`}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedCategory === category.id
                  ? "ring-2 ring-primary shadow-md"
                  : "hover:border-primary/50"
              }`}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${category.color} shrink-0`}>
                    <category.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold leading-tight">{category.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  {category.active ? (
                    <Badge variant="default" className="text-[10px]" data-testid={`badge-active-${category.id}`}>Ativo</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]" data-testid={`badge-available-${category.id}`}>Disponivel</Badge>
                  )}
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${
                    selectedCategory === category.id ? "rotate-90" : ""
                  }`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedCategory === "travel_events" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold">Viagens e Eventos Corporativos</h2>
            </div>
            <button
              onClick={() => setLocation("/dashboard")}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
              data-testid="link-go-to-dashboard"
            >
              Acessar Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                A auditoria de viagens e eventos corporativos e conduzida de forma independente, tecnica,
                estruturada e baseada em evidencias. O trabalho contempla a analise forense de despesas com
                passagens aereas, hospedagem, alimentacao, transporte terrestre, locacao de veiculos, seguros
                viagem e eventos corporativos. A metodologia inclui cruzamento de dados entre sistemas OBT
                (Online Booking Tool), backoffice das agencias, companhias aereas, redes hoteleiras, locadoras,
                GDS (Sabre/Amadeus), BSPlink e cartoes corporativos, identificando inconsistencias como fraudes,
                retencoes indevidas, reembolsos incorretos, cobrancas de fees nao autorizadas e descumprimento
                de acordos corporativos.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-blue-200 dark:border-blue-900">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400" data-testid="stat-avg-result">16%</p>
                <p className="text-sm text-muted-foreground mt-1">Media de Resultado</p>
                <p className="text-xs text-muted-foreground">sobre o volume revisado</p>
              </CardContent>
            </Card>
            <Card className="border-emerald-200 dark:border-emerald-900">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400" data-testid="stat-reviewed">+2,8 BI</p>
                <p className="text-sm text-muted-foreground mt-1">Revisados</p>
                <p className="text-xs text-muted-foreground">em volume financeiro total</p>
              </CardContent>
            </Card>
            <Card className="border-amber-200 dark:border-amber-900">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 mx-auto mb-3">
                  <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400" data-testid="stat-recovered">+448 MI</p>
                <p className="text-sm text-muted-foreground mt-1">Recuperados</p>
                <p className="text-xs text-muted-foreground">em economia e recuperacao</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-primary" />
                  Principais Inconsistencias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {INCONSISTENCY_TYPES.map((item) => (
                  <div key={item.name} className="space-y-1" data-testid={`inconsistency-${item.name.toLowerCase().replace(/\s/g, '-')}`}>
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.name}</span>
                      <span className="font-medium">{item.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Performance Historica (Pre-Pandemia)
                </CardTitle>
                <p className="text-xs text-muted-foreground">Valores revisados em milhoes R$</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3 h-40">
                  {YEARLY_PERFORMANCE.map((item) => {
                    const maxVal = Math.max(...YEARLY_PERFORMANCE.map(y => y.value));
                    const heightPct = (item.value / maxVal) * 100;
                    return (
                      <div key={item.year} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-medium text-muted-foreground">{item.value}</span>
                        <div className="w-full relative" style={{ height: `${heightPct}%` }}>
                          <div className="absolute inset-0 bg-primary/80 rounded-t-md" />
                        </div>
                        <span className="text-xs text-muted-foreground">{item.year}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-primary" />
                Principais Etapas do AuraAUDIT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {METHODOLOGY_STAGES.map((stage, index) => (
                  <div key={stage.step} className="relative" data-testid={`stage-${stage.step}`}>
                    <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                        <stage.icon className="w-6 h-6 text-primary" />
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono mb-1">{stage.step}</Badge>
                      <h4 className="text-sm font-semibold">{stage.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{stage.description}</p>
                    </div>
                    {index < METHODOLOGY_STAGES.length - 1 && index !== 2 && (
                      <div className="hidden lg:flex absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                Principais Cases
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Mais de R$ 448 milhoes em economia e recuperacao, de R$ 2,8 bilhoes revisados — media superior a 16%.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {MAIN_CLIENTS.map((client) => (
                  <div
                    key={client}
                    className="flex items-center justify-center px-3 py-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    data-testid={`client-case-${client.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    <span className="text-sm font-medium text-center">{client}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedCategory && selectedCategory !== "travel_events" && (
        <div className="animate-in fade-in duration-300">
          <Separator className="mb-6" />
          <Card>
            <CardContent className="p-8 text-center">
              <div className={`flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4 ${activeCategory?.color}/10`}>
                {activeCategory && <activeCategory.icon className={`w-8 h-8 ${activeCategory.color.replace('bg-', 'text-')}`} />}
              </div>
              <h3 className="text-lg font-semibold mb-2">{activeCategory?.title}</h3>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-4">{activeCategory?.description}</p>
              <Badge variant="outline">Em breve</Badge>
              <p className="text-xs text-muted-foreground mt-3">
                Esta area de auditoria sera habilitada em breve com dados, metodologia e resultados especificos.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Separator />

      <div className="flex items-center justify-between text-xs text-muted-foreground pb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3" />
          <span>Cadeia de Custodia Digital - Lei 13.964/2019</span>
        </div>
        <span>AuraAUDIT - Auditoria Forense em Despesas</span>
      </div>
    </div>
  );
}

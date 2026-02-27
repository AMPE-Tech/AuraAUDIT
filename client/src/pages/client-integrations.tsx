import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Plane,
  Hotel,
  Car,
  Shield,
  Globe,
  Database,
  Briefcase,
  CheckCircle,
  Circle,
  RefreshCw,
  Plug,
  ShieldCheck,
  Lock,
  Upload,
} from "lucide-react";

interface IntegrationType {
  key: string;
  label: string;
  icon: any;
  description: string;
}

const ALL_INTEGRATIONS: IntegrationType[] = [
  {
    key: "bradesco_ebta",
    label: "Banco Bradesco (EBTA)",
    icon: CreditCard,
    description: "Cartao de credito corporativo - Extrato Bancario de Transacoes Aereas",
  },
  {
    key: "travel_agency",
    label: "Agencias de Viagens",
    icon: Briefcase,
    description: "Dados de agencias de viagens e consolidadores",
  },
  {
    key: "airline",
    label: "Cias Aereas",
    icon: Plane,
    description: "Companhias aereas - bilhetes, tarifas e fees",
  },
  {
    key: "hotel_chain",
    label: "Redes Hoteleiras",
    icon: Hotel,
    description: "Redes hoteleiras - reservas, diarias e faturas",
  },
  {
    key: "car_rental",
    label: "Locadoras",
    icon: Car,
    description: "Locadoras de veiculos - contratos e faturas",
  },
  {
    key: "insurer",
    label: "Seguradoras",
    icon: Shield,
    description: "Seguros viagem - apolices e sinistros",
  },
  {
    key: "gds_sabre",
    label: "GDS Sabre",
    icon: Globe,
    description: "Global Distribution System Sabre - reservas e PNRs",
  },
  {
    key: "gds_amadeus",
    label: "GDS Amadeus",
    icon: Globe,
    description: "Global Distribution System Amadeus - reservas e PNRs",
  },
  {
    key: "bsplink",
    label: "BSPlink",
    icon: Database,
    description: "Billing and Settlement Plan - conciliacao IATA",
  },
];

export default function ClientIntegrations() {
  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          data-testid="text-client-integrations-title"
        >
          Integracoes
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Conexoes com sistemas externos e fontes de dados do seu projeto
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Conectadas
                </p>
                <p
                  className="text-2xl font-bold tracking-tight text-muted-foreground"
                  data-testid="text-connected-integrations"
                >
                  0
                </p>
                <span className="text-xs text-muted-foreground">
                  nenhuma integracao ativa
                </span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-muted">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Disponiveis
                </p>
                <p
                  className="text-2xl font-bold tracking-tight"
                  data-testid="text-available-integrations"
                >
                  {ALL_INTEGRATIONS.length}
                </p>
                <span className="text-xs text-muted-foreground">
                  para ativacao
                </span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
                <Plug className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Registros Ingeridos
                </p>
                <p
                  className="text-2xl font-bold tracking-tight text-muted-foreground"
                  data-testid="text-total-records"
                >
                  0
                </p>
                <span className="text-xs text-muted-foreground">
                  aguardando dados
                </span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-muted">
                <Database className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-project-integrations">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            Integracoes deste Projeto
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Nenhuma integracao ativa — configure apos o envio dos dados
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-muted">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground" data-testid="text-awaiting-integrations">
              Aguardando envio de dados
            </p>
            <p className="text-xs text-muted-foreground max-w-md">
              As integracoes serao ativadas conforme os arquivos do cliente forem enviados e processados pela plataforma.
              Cada fonte de dados sera conectada individualmente com validacao de formato e registro de custodia.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Plug className="w-4 h-4 text-muted-foreground" />
            Integracoes Disponiveis
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Fontes de dados suportadas pela plataforma AuraAUDIT
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ALL_INTEGRATIONS.map((integration) => {
              const Icon = integration.icon;
              return (
                <div
                  key={integration.key}
                  className="flex items-center justify-between gap-4 p-4 rounded-md bg-background"
                  data-testid={`integration-available-${integration.key}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-9 h-9 rounded-md bg-muted shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-sm font-medium"
                        data-testid={`text-integration-name-${integration.key}`}
                      >
                        {integration.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    data-testid={`badge-status-${integration.key}`}
                  >
                    <Circle className="w-3 h-3 mr-1" />
                    Disponivel
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Governanca de Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">
            Todas as integracoes seguem os padroes de cadeia de custodia digital
            conforme Lei 13.964/2019 e normas AuraDue.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              "Hash SHA-256 em cada registro ingerido",
              "Trilha de auditoria completa",
              "Controle de acesso RBAC",
              "Validacao de formato na ingestao",
              "Verificacao de duplicidade automatica",
              "Conformidade com LGPD",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-2.5 rounded-md bg-background"
              >
                <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <span className="text-xs text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
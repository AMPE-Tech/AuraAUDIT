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
} from "lucide-react";

interface IntegrationType {
  key: string;
  label: string;
  icon: any;
  description: string;
}

interface ProjectIntegration {
  key: string;
  label: string;
  icon: any;
  description: string;
  status: "connected" | "available";
  lastSync?: string;
  totalRecords?: number;
  fileFormat?: string;
  syncFrequency?: string;
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

const PROJECT_INTEGRATIONS: ProjectIntegration[] = [
  {
    key: "bradesco_ebta",
    label: "Banco Bradesco (EBTA)",
    icon: CreditCard,
    description: "Extratos EBTA - contas 131882, 131883, 131884",
    status: "connected",
    lastSync: "22/02/2026 14:30",
    totalRecords: 45230,
    fileFormat: "XLSX",
    syncFrequency: "Mensal",
  },
  {
    key: "travel_agency",
    label: "Agencia Stabia Viagens",
    icon: Briefcase,
    description: "Base geral da agencia - aereo e terrestre",
    status: "connected",
    lastSync: "20/02/2026 09:15",
    totalRecords: 128450,
    fileFormat: "XLSX",
    syncFrequency: "Mensal",
  },
  {
    key: "airline",
    label: "Cias Aereas (via Agencia)",
    icon: Plane,
    description: "Bilhetes aereos emitidos via agencia e OBT",
    status: "connected",
    lastSync: "20/02/2026 09:15",
    totalRecords: 89200,
    fileFormat: "CSV",
    syncFrequency: "Mensal",
  },
  {
    key: "gds_sabre",
    label: "GDS Sabre",
    icon: Globe,
    description: "PNRs e reservas via Sabre - sistema Reserve",
    status: "connected",
    lastSync: "18/02/2026 16:45",
    totalRecords: 67800,
    fileFormat: "XML",
    syncFrequency: "Semanal",
  },
];

const activeKeys = new Set(PROJECT_INTEGRATIONS.map((p) => p.key));

const AVAILABLE_INTEGRATIONS = ALL_INTEGRATIONS.filter(
  (i) => !activeKeys.has(i.key)
);

export default function ClientIntegrations() {
  const connectedCount = PROJECT_INTEGRATIONS.filter(
    (i) => i.status === "connected"
  ).length;
  const totalRecords = PROJECT_INTEGRATIONS.reduce(
    (sum, i) => sum + (i.totalRecords || 0),
    0
  );

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
                  className="text-2xl font-bold tracking-tight text-green-600 dark:text-green-400"
                  data-testid="text-connected-integrations"
                >
                  {connectedCount}
                </p>
                <span className="text-xs text-muted-foreground">
                  integracoes ativas
                </span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-green-600/10 dark:bg-green-400/10">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
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
                  {AVAILABLE_INTEGRATIONS.length}
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
                  className="text-2xl font-bold tracking-tight"
                  data-testid="text-total-records"
                >
                  {totalRecords.toLocaleString("pt-BR")}
                </p>
                <span className="text-xs text-muted-foreground">
                  total processados
                </span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
                <Database className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            Integracoes deste Projeto
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Fontes de dados conectadas e ativas para a auditoria Grupo Stabia
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {PROJECT_INTEGRATIONS.map((integration) => {
              const Icon = integration.icon;
              return (
                <div
                  key={integration.key}
                  className="flex items-center justify-between gap-4 p-4 rounded-md bg-background"
                  data-testid={`integration-active-${integration.key}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-9 h-9 rounded-md bg-green-600/10 dark:bg-green-400/10 shrink-0">
                      <Icon className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className="text-sm font-medium"
                          data-testid={`text-integration-name-${integration.key}`}
                        >
                          {integration.label}
                        </p>
                        {integration.fileFormat && (
                          <Badge variant="outline" className="text-[10px]">
                            {integration.fileFormat}
                          </Badge>
                        )}
                        {integration.syncFrequency && (
                          <Badge variant="outline" className="text-[10px]">
                            {integration.syncFrequency}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {integration.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {integration.totalRecords != null && (
                          <span className="text-xs text-muted-foreground">
                            {integration.totalRecords.toLocaleString("pt-BR")}{" "}
                            registros
                          </span>
                        )}
                        {integration.lastSync && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" />
                            {integration.lastSync}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="default"
                    data-testid={`badge-status-${integration.key}`}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Conectado
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
            <Plug className="w-4 h-4 text-muted-foreground" />
            Integracoes Disponiveis
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Fontes de dados adicionais suportadas pela plataforma AuraAUDIT
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {AVAILABLE_INTEGRATIONS.map((integration) => {
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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Monitor,
  Globe,
  Server,
  Database,
  CheckCircle,
  Clock,
  Shield,
  Plane,
  FileSpreadsheet,
  CreditCard,
  Building2,
} from "lucide-react";

const OBT_SYSTEMS = [
  {
    id: "reserve",
    name: "Reserve",
    description: "Sistema OBT (Online Booking Tool) para reservas aereas, hoteleiras e locacao de veiculos. Plataforma utilizada pelos viajantes para solicitacao e emissao de bilhetes.",
    status: "active",
    year: "2024-2025",
    features: ["Reservas aereas", "Reservas hoteleiras", "Locacao de veiculos", "Gestao de aprovacoes"],
  },
  {
    id: "argo",
    name: "Argo",
    description: "Sistema OBT complementar para gestao de viagens corporativas, utilizado em conjunto com o Reserve para cobertura completa das operacoes de booking.",
    status: "active",
    year: "2024-2025",
    features: ["Booking corporativo", "Politica de viagens", "Relatorios operacionais", "Integracao GDS"],
  },
];

const BACKOFFICE_SYSTEMS = [
  {
    id: "wintour",
    name: "Wintour",
    description: "Sistema backoffice utilizado para gestao financeira e operacional das transacoes de viagens. Base principal para o periodo de 2024.",
    status: "migrated",
    year: "2024",
    features: ["Gestao financeira", "Emissao de bilhetes", "Faturamento", "Relatorios contabeis"],
  },
  {
    id: "stur",
    name: "Stur",
    description: "Novo sistema backoffice adotado a partir de 2025, substituindo o Wintour. Plataforma atualizada com recursos aprimorados de gestao e integracao.",
    status: "active",
    year: "2025",
    features: ["Gestao integrada", "Automacao de processos", "APIs modernas", "Dashboard operacional"],
  },
];

const DATA_SOURCES = [
  {
    id: "base-aerea",
    name: "Base Geral Agencia - Aereo",
    description: "Base de dados completa de transacoes aereas da agencia, cobrindo o periodo de 01/01/2018 a 26/08/2020.",
    type: "Excel",
    records: "~150.000 registros",
    icon: FileSpreadsheet,
  },
  {
    id: "base-2021",
    name: "Base Geral Agencia 2021",
    description: "Base de dados consolidada das operacoes da agencia para o ano de 2021.",
    type: "Excel",
    records: "~45.000 registros",
    icon: FileSpreadsheet,
  },
  {
    id: "ebta-131882",
    name: "Relatorio EBTA 131882",
    description: "Relatorio de transacoes bancarias Bradesco EBTA - conta 131882. Extratos e movimentacoes financeiras.",
    type: "Excel",
    records: "Transacoes bancarias",
    icon: CreditCard,
  },
  {
    id: "ebta-131883",
    name: "Relatorio EBTA 131883",
    description: "Relatorio de transacoes bancarias Bradesco EBTA - conta 131883. Extratos e movimentacoes financeiras.",
    type: "Excel",
    records: "Transacoes bancarias",
    icon: CreditCard,
  },
  {
    id: "ebta-131884",
    name: "Relatorio EBTA 131884",
    description: "Relatorio de transacoes bancarias Bradesco EBTA - conta 131884. Extratos e movimentacoes financeiras.",
    type: "Excel",
    records: "Transacoes bancarias",
    icon: CreditCard,
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return (
        <Badge variant="default" className="text-[10px] gap-1" data-testid="badge-status-active">
          <CheckCircle className="w-3 h-3" />
          Ativo
        </Badge>
      );
    case "migrated":
      return (
        <Badge variant="secondary" className="text-[10px] gap-1" data-testid="badge-status-migrated">
          <Clock className="w-3 h-3" />
          Migrado
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-[10px]">
          {status}
        </Badge>
      );
  }
}

export default function ClientSystems() {
  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-systems-title">
            Sistemas do Projeto
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sistemas utilizados na auditoria e fontes de dados conectadas
          </p>
        </div>
        <Badge variant="outline" className="text-xs gap-1">
          <Shield className="w-3 h-3" />
          Lei 13.964/2019
        </Badge>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold" data-testid="text-obt-section-title">Sistemas OBT (Online Booking Tool)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OBT_SYSTEMS.map((system) => (
              <Card key={system.id} data-testid={`card-system-${system.id}`}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 shrink-0">
                      <Monitor className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base" data-testid={`text-system-name-${system.id}`}>{system.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{system.year}</p>
                    </div>
                  </div>
                  {getStatusBadge(system.status)}
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground" data-testid={`text-system-desc-${system.id}`}>{system.description}</p>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Funcionalidades</p>
                    <div className="flex flex-wrap gap-1.5">
                      {system.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-[10px]">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold" data-testid="text-backoffice-section-title">Sistemas Backoffice</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BACKOFFICE_SYSTEMS.map((system) => (
              <Card key={system.id} data-testid={`card-system-${system.id}`}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-md bg-violet-500/10 shrink-0">
                      <Building2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base" data-testid={`text-system-name-${system.id}`}>{system.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{system.year}</p>
                    </div>
                  </div>
                  {getStatusBadge(system.status)}
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground" data-testid={`text-system-desc-${system.id}`}>{system.description}</p>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Funcionalidades</p>
                    <div className="flex flex-wrap gap-1.5">
                      {system.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-[10px]">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-gradient-to-r from-amber-500/5 via-amber-500/3 to-transparent border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">Transicao de Sistemas</p>
                <p className="text-xs text-muted-foreground mt-1">
                  O projeto contempla a migracao do sistema backoffice Wintour (utilizado em 2024) para o Stur (adotado em 2025). A auditoria considera os dados de ambos os sistemas para garantir a continuidade e integridade das analises durante o periodo de transicao.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold" data-testid="text-data-sources-title">Fontes de Dados Conectadas</h2>
          <Badge variant="secondary" className="text-xs">{DATA_SOURCES.length} fontes</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DATA_SOURCES.map((source) => (
            <Card key={source.id} data-testid={`card-source-${source.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-md bg-muted shrink-0">
                    <source.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" data-testid={`text-source-name-${source.id}`}>{source.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{source.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-[10px]">{source.type}</Badge>
                      <span className="text-[10px] text-muted-foreground">{source.records}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3" />
          <span>Cadeia de Custodia Digital - AuraDue</span>
        </div>
        <span>AuraAUDIT - Auditoria Forense em Despesas</span>
      </div>
    </div>
  );
}

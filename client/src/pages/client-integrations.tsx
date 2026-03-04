import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Plug,
  ShieldCheck,
  Lock,
  Upload,
  ChevronDown,
  ChevronRight,
  Search,
  Ticket,
  Building2,
  Banknote,
  CalendarDays,
  Wifi,
  Users,
} from "lucide-react";

interface Platform {
  name: string;
  type: "api" | "gds" | "file" | "portal";
}

interface EcosystemSegment {
  id: string;
  name: string;
  subtitle: string;
  icon: any;
  iconColor: string;
  platforms: Platform[];
  integrationMethods: string[];
}

const ECOSYSTEM: EcosystemSegment[] = [
  {
    id: "gds",
    name: "GDS e APIs Globais",
    subtitle: "Global Distribution Systems",
    icon: Globe,
    iconColor: "text-blue-500",
    platforms: [
      { name: "Amadeus", type: "api" },
      { name: "Sabre", type: "api" },
      { name: "Travelport", type: "api" },
      { name: "Amadeus NDC API", type: "api" },
      { name: "Sabre NDC", type: "api" },
      { name: "Travelport Universal API", type: "api" },
    ],
    integrationMethods: ["API REST", "PNR/EDIFACT", "NDC XML", "CSV/XLSX"],
  },
  {
    id: "ndc",
    name: "NDC Airlines",
    subtitle: "New Distribution Capability (IATA)",
    icon: Plane,
    iconColor: "text-sky-500",
    platforms: [
      { name: "LATAM NDC", type: "api" },
      { name: "GOL", type: "api" },
      { name: "Azul", type: "api" },
      { name: "American Airlines NDC", type: "api" },
      { name: "Lufthansa Group NDC", type: "api" },
      { name: "Air France / KLM NDC", type: "api" },
      { name: "Emirates NDC", type: "api" },
      { name: "Qatar Airways NDC", type: "api" },
      { name: "British Airways NDC", type: "api" },
      { name: "Iberia NDC", type: "api" },
    ],
    integrationMethods: ["NDC API", "GDS", "BSP", "Fatura direta"],
  },
  {
    id: "iata-bsp",
    name: "IATA e BSP",
    subtitle: "Billing and Settlement Plan",
    icon: Database,
    iconColor: "text-indigo-500",
    platforms: [
      { name: "BSPLink", type: "portal" },
      { name: "IATA Billing and Settlement Plan", type: "file" },
      { name: "IATA Financial Gateway", type: "portal" },
      { name: "IATA EasyPay", type: "portal" },
      { name: "ARC (Airlines Reporting Corporation)", type: "portal" },
    ],
    integrationMethods: ["Arquivos BSP", "GDS", "Integracao contabil", "Portal"],
  },
  {
    id: "hotels-global",
    name: "Hotelaria Global",
    subtitle: "Redes internacionais e distribuicao",
    icon: Hotel,
    iconColor: "text-amber-500",
    platforms: [
      { name: "Marriott International", type: "api" },
      { name: "Hilton Hotels", type: "api" },
      { name: "Accor Hotels", type: "api" },
      { name: "IHG (InterContinental)", type: "api" },
      { name: "Hyatt Hotels", type: "api" },
      { name: "Wyndham Hotels", type: "api" },
      { name: "Choice Hotels", type: "api" },
      { name: "Best Western", type: "api" },
      { name: "Radisson Hotel Group", type: "api" },
      { name: "Mandarin Oriental", type: "api" },
      { name: "Four Seasons", type: "api" },
      { name: "Minor Hotels (Anantara/Tivoli)", type: "api" },
      { name: "NH Hotel Group", type: "api" },
      { name: "Melia Hotels", type: "api" },
      { name: "Rosewood Hotels", type: "api" },
      { name: "Omnibees API", type: "api" },
      { name: "Hotelbeds API", type: "api" },
      { name: "Booking.com API", type: "api" },
      { name: "Expedia Rapid API", type: "api" },
      { name: "SiteMinder", type: "api" },
      { name: "Cloudbeds", type: "api" },
    ],
    integrationMethods: ["API", "Amadeus/Sabre/Travelport", "Omnibees", "SiteMinder"],
  },
  {
    id: "hotels-brazil",
    name: "Hotelaria Brasil (FOHB)",
    subtitle: "Forum de Operadores Hoteleiros do Brasil",
    icon: Building2,
    iconColor: "text-emerald-500",
    platforms: [
      { name: "Atlantica Hospitality", type: "api" },
      { name: "Bourbon Hoteis & Resorts", type: "api" },
      { name: "Blue Tree Hotels", type: "api" },
      { name: "Deville Hoteis", type: "api" },
      { name: "Intercity Hotels", type: "api" },
      { name: "Slaviero Hoteis", type: "api" },
      { name: "Taua Resorts", type: "api" },
      { name: "Wish Hotels", type: "api" },
      { name: "Vila Gale Brasil", type: "api" },
      { name: "Nobile Hoteis", type: "api" },
      { name: "Transamerica Hospitality", type: "api" },
      { name: "BHG (Brazil Hospitality Group)", type: "api" },
      { name: "Hoteis Othon", type: "api" },
      { name: "Bristol Hotels", type: "api" },
      { name: "Laghetto Hoteis", type: "api" },
    ],
    integrationMethods: ["Omnibees", "SiteMinder", "TravelClick", "Cloudbeds"],
  },
  {
    id: "car-rental",
    name: "Locadoras de Veiculos",
    subtitle: "Globais e Brasil",
    icon: Car,
    iconColor: "text-orange-500",
    platforms: [
      { name: "Localiza", type: "api" },
      { name: "Movida", type: "api" },
      { name: "Unidas", type: "api" },
      { name: "Ouro Verde", type: "api" },
      { name: "Foco Rent a Car", type: "api" },
      { name: "Hertz", type: "api" },
      { name: "Avis", type: "api" },
      { name: "Budget", type: "api" },
      { name: "Enterprise", type: "api" },
      { name: "National Car Rental", type: "api" },
      { name: "Alamo", type: "api" },
      { name: "Sixt", type: "api" },
      { name: "Europcar", type: "api" },
    ],
    integrationMethods: ["API", "GDS", "Plataformas corporativas", "CSV/XLSX"],
  },
  {
    id: "consolidators",
    name: "Consolidadoras",
    subtitle: "Essenciais para agencias corporativas",
    icon: Briefcase,
    iconColor: "text-violet-500",
    platforms: [
      { name: "RexturAdvance", type: "api" },
      { name: "Ancoradouro", type: "api" },
      { name: "Flytour Consolidadora", type: "api" },
      { name: "BRT Operadora", type: "api" },
      { name: "Trend Operadora", type: "api" },
      { name: "Sakura", type: "api" },
      { name: "Confianca", type: "api" },
      { name: "New Age", type: "api" },
      { name: "Diversa Turismo", type: "api" },
    ],
    integrationMethods: ["API", "XML", "GDS", "Arquivo mensal"],
  },
  {
    id: "tour-operators",
    name: "Operadoras de Turismo",
    subtitle: "Principais operadoras LATAM",
    icon: Ticket,
    iconColor: "text-pink-500",
    platforms: [
      { name: "CVC Corp", type: "api" },
      { name: "Visual Turismo", type: "api" },
      { name: "Agaxtur", type: "api" },
      { name: "Teresa Perez", type: "api" },
      { name: "Queensberry", type: "api" },
      { name: "Schultz", type: "api" },
      { name: "Diversa Turismo", type: "api" },
      { name: "Orinter", type: "api" },
      { name: "Lusanova", type: "api" },
      { name: "Europamundo", type: "api" },
    ],
    integrationMethods: ["API", "Portal", "Arquivo mensal", "GDS"],
  },
  {
    id: "insurance",
    name: "Seguros Viagem",
    subtitle: "Principais seguradoras travel",
    icon: Shield,
    iconColor: "text-green-500",
    platforms: [
      { name: "Assist Card", type: "api" },
      { name: "GTA Seguro Viagem", type: "api" },
      { name: "Coris", type: "api" },
      { name: "Allianz Travel", type: "api" },
      { name: "Travel Ace", type: "api" },
      { name: "April Brasil", type: "api" },
      { name: "Intermac", type: "api" },
      { name: "Universal Assistance", type: "api" },
      { name: "Porto Seguro", type: "api" },
    ],
    integrationMethods: ["API", "Portal", "Arquivo de apolices", "CSV"],
  },
  {
    id: "payments",
    name: "Pagamentos Corporativos",
    subtitle: "Cartoes e meios de pagamento travel",
    icon: CreditCard,
    iconColor: "text-teal-500",
    platforms: [
      { name: "EBTA (Bradesco Corporate)", type: "api" },
      { name: "Itau Purchase", type: "api" },
      { name: "Santander Corporate Card", type: "api" },
      { name: "Banco do Brasil Corporate", type: "api" },
      { name: "Mastercard Corporate Travel", type: "api" },
      { name: "Visa Corporate", type: "api" },
      { name: "Hotelcard", type: "api" },
      { name: "AirPlus", type: "api" },
      { name: "WEX Travel", type: "api" },
      { name: "ETTC", type: "api" },
    ],
    integrationMethods: ["API", "Extrato bancario", "CSV/XLSX", "Portal corporativo"],
  },
  {
    id: "tmc",
    name: "Gestao de Viagens (TMC/OBT)",
    subtitle: "Travel Management Companies e Online Booking Tools",
    icon: Users,
    iconColor: "text-cyan-500",
    platforms: [
      { name: "SAP Concur", type: "api" },
      { name: "Argo Solutions", type: "api" },
      { name: "Lemontech", type: "api" },
      { name: "Reserve", type: "api" },
      { name: "Paytrack", type: "api" },
      { name: "Onfly", type: "api" },
      { name: "ExpenseOn", type: "api" },
      { name: "Wooba", type: "api" },
      { name: "TMS Travel", type: "api" },
      { name: "Egencia (Amex GBT)", type: "api" },
    ],
    integrationMethods: ["API REST", "Webhooks", "CSV/XLSX", "SFTP"],
  },
  {
    id: "events",
    name: "Sistemas de Eventos",
    subtitle: "MICE — Meetings, Incentives, Conferences, Exhibitions",
    icon: CalendarDays,
    iconColor: "text-rose-500",
    platforms: [
      { name: "Sympla API", type: "api" },
      { name: "Eventbrite API", type: "api" },
      { name: "Cvent", type: "api" },
      { name: "Bizzabo", type: "api" },
      { name: "Even3", type: "api" },
      { name: "Ticket360", type: "api" },
    ],
    integrationMethods: ["API REST", "Webhooks", "Portal", "CSV"],
  },
];

const totalPlatforms = ECOSYSTEM.reduce((sum, seg) => sum + seg.platforms.length, 0);

export default function ClientIntegrations() {
  const [expandedSegments, setExpandedSegments] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSegment = (id: string) => {
    setExpandedSegments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSegments(new Set(ECOSYSTEM.map((s) => s.id)));
  };

  const collapseAll = () => {
    setExpandedSegments(new Set());
  };

  const filteredEcosystem = searchTerm.trim()
    ? ECOSYSTEM.map((seg) => ({
        ...seg,
        platforms: seg.platforms.filter((p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      })).filter((seg) => seg.platforms.length > 0)
    : ECOSYSTEM;

  const filteredTotal = filteredEcosystem.reduce((sum, seg) => sum + seg.platforms.length, 0);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          data-testid="text-client-integrations-title"
        >
          Ecossistema de Integracoes
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Capacidade tecnica de conexao com os principais players do mercado de viagens corporativas e eventos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Plataformas Mapeadas
                </p>
                <p className="text-2xl font-bold tracking-tight" data-testid="text-total-platforms">
                  {totalPlatforms}+
                </p>
                <span className="text-xs text-muted-foreground">
                  no ecossistema global
                </span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
                <Globe className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Segmentos
                </p>
                <p className="text-2xl font-bold tracking-tight" data-testid="text-total-segments">
                  {ECOSYSTEM.length}
                </p>
                <span className="text-xs text-muted-foreground">
                  categorias de fornecedores
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
                  Conectadas
                </p>
                <p
                  className="text-2xl font-bold tracking-tight text-muted-foreground"
                  data-testid="text-connected-integrations"
                >
                  0
                </p>
                <span className="text-xs text-muted-foreground">
                  aguardando ativacao
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
            Integracoes Ativas deste Projeto
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Nenhuma integracao ativa — configure apos o envio dos dados
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-muted">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground" data-testid="text-awaiting-integrations">
              Aguardando envio de dados
            </p>
            <p className="text-xs text-muted-foreground max-w-md">
              As integracoes serao ativadas conforme os arquivos do cliente forem enviados e processados. Cada fonte sera conectada com validacao de formato e cadeia de custodia.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-ecosystem">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wifi className="w-4 h-4 text-primary" />
                Ecossistema de Integracao AuraAUDIT
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {totalPlatforms}+ plataformas em {ECOSYSTEM.length} segmentos — capacidade tecnica comprovada
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={expandAll} data-testid="button-expand-all">
                Expandir Todos
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll} data-testid="button-collapse-all">
                Recolher
              </Button>
            </div>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar plataforma (ex: Amadeus, Localiza, Concur...)"
              className="pl-9 text-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value.trim()) expandAll();
              }}
              data-testid="input-search-platforms"
            />
          </div>
          {searchTerm.trim() && (
            <p className="text-xs text-muted-foreground mt-1">
              {filteredTotal} plataforma{filteredTotal !== 1 ? "s" : ""} encontrada{filteredTotal !== 1 ? "s" : ""}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredEcosystem.map((segment) => {
            const Icon = segment.icon;
            const isExpanded = expandedSegments.has(segment.id);
            return (
              <div
                key={segment.id}
                className="border rounded-lg overflow-hidden"
                data-testid={`segment-${segment.id}`}
              >
                <button
                  onClick={() => toggleSegment(segment.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
                  data-testid={`button-toggle-${segment.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-9 h-9 rounded-md bg-muted shrink-0`}>
                      <Icon className={`w-4 h-4 ${segment.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{segment.name}</p>
                      <p className="text-xs text-muted-foreground">{segment.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs">
                      {segment.platforms.length} plataformas
                    </Badge>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {segment.platforms.map((platform) => (
                        <Badge
                          key={platform.name}
                          variant="outline"
                          className="text-xs py-1 px-2.5"
                          data-testid={`platform-${platform.name.toLowerCase().replace(/[\s\/()]+/g, "-")}`}
                        >
                          <Circle className="w-2 h-2 mr-1.5 text-primary fill-primary" />
                          {platform.name}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                        Metodos de integracao:
                      </span>
                      {segment.integrationMethods.map((method) => (
                        <Badge key={method} variant="secondary" className="text-[10px] py-0.5">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Governanca de Dados e Integracao
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">
            Todas as integracoes seguem os padroes de cadeia de custodia digital conforme Lei 13.964/2019 e normas AuraAUDIT.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              "Hash SHA-256 em cada registro ingerido",
              "Trilha de auditoria completa",
              "Controle de acesso RBAC",
              "Validacao de formato na ingestao",
              "Verificacao de duplicidade automatica",
              "Conformidade com LGPD",
              "Suporte a APIs REST, XML, SFTP",
              "Processamento CSV, XLSX, PDF, JSON",
              "Cadeia de custodia por registro",
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

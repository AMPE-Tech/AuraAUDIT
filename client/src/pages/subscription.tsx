import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, Check, ArrowRight, Calculator, FileText,
  DollarSign, TrendingUp, Lock, ChevronDown, ChevronRight,
  AlertTriangle, Zap, BarChart3, Globe, ShieldCheck, Eye
} from "lucide-react";

function formatUSD(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function rateForVam(vam: number): number {
  if (vam <= 100000) return 0.0030;
  if (vam <= 300000) return 0.0028;
  if (vam <= 600000) return 0.0026;
  if (vam <= 800000) return 0.0024;
  if (vam <= 1000000) return 0.0022;
  return 0.0020;
}

function calculateTotal(vam: number): { fixed: number; excess: number; rate: number; variable: number; subtotal: number; total: number } {
  const fixed = 99;
  const excess = Math.max(0, vam - 10000);
  const rate = rateForVam(vam);
  const subtotal = fixed + rate * excess;
  const total = Math.min(3000, subtotal);
  const variable = Math.max(0, total - fixed);
  return { fixed, excess, rate, variable, subtotal, total };
}

const RATE_TIERS = [
  { label: "Ate US$ 100.000", rate: "0,30%", value: 0.003 },
  { label: "Ate US$ 300.000", rate: "0,28%", value: 0.0028 },
  { label: "Ate US$ 600.000", rate: "0,26%", value: 0.0026 },
  { label: "Ate US$ 800.000", rate: "0,24%", value: 0.0024 },
  { label: "Ate US$ 1.000.000", rate: "0,22%", value: 0.0022 },
  { label: "Acima de US$ 1.000.000", rate: "0,20%", value: 0.002 },
];

export default function Subscription() {
  const { toast } = useToast();
  const [vamSlider, setVamSlider] = useState(10000);
  const [companyName, setCompanyName] = useState("");
  const [companyCnpj, setCompanyCnpj] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showTiers, setShowTiers] = useState(false);

  const termsQuery = useQuery({
    queryKey: ["/api/stripe/terms"],
  });

  const pricingQuery = useQuery({
    queryKey: ["/api/stripe/pricing"],
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, companyCnpj, acceptedTerms }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar checkout");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const simulated = calculateTotal(vamSlider);

  const examples = [
    { vam: 10000, label: "US$ 10k" },
    { vam: 100000, label: "US$ 100k" },
    { vam: 500000, label: "US$ 500k" },
    { vam: 1000000, label: "US$ 1M" },
    { vam: 1500000, label: "US$ 1,5M" },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold" data-testid="text-subscription-title">AuraAudit Pass</h1>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Auditoria forense online com trilhas auditaveis, cadeia de custodia, rastreabilidade juridica e dashboards executivos.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-primary/30" data-testid="card-pricing">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Preco previsivel. Escala justa.
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold" data-testid="text-price">US$ 99</span>
                <span className="text-sm text-muted-foreground">/mes</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Para auditar ate <strong>US$ 10.000/mes</strong>. Acima disso, taxa progressiva sobre o excedente.
              </p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300" data-testid="text-cap-guarantee">
                  Sem sustos: o total mensal nunca passa de <strong>US$ 3.000</strong>.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                className="flex items-center gap-2 text-xs text-primary font-medium hover:underline"
                onClick={() => setShowTiers(!showTiers)}
                data-testid="button-view-tiers"
              >
                {showTiers ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Ver faixas de aliquota
              </button>
              {showTiers && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-1" data-testid="section-tiers">
                  <p className="text-[10px] text-muted-foreground mb-2">
                    A aliquota incide sobre o excedente acima de US$ 10.000 (VAM - 10.000), conforme o VAM do mes:
                  </p>
                  {RATE_TIERS.map((tier) => (
                    <div key={tier.label} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{tier.label}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">{tier.rate}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Shield className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <span>Cadeia de custodia digital (SHA-256)</span>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <span>Trilhas auditaveis imutaveis</span>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <span>Alertas em tempo real</span>
              </div>
              <div className="flex items-start gap-2">
                <BarChart3 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <span>Dashboards executivos e relatorios</span>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <span>Cobertura LATAM (6 paises)</span>
              </div>
              <div className="flex items-start gap-2">
                <Eye className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <span>Client-controlled: voce define escopo, regras e calendario</span>
              </div>
            </div>

            <Button
              className="w-full"
              size="sm"
              onClick={() => document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="button-cta-subscribe-top"
            >
              Assinar AuraAudit Pass
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card data-testid="card-simulator">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary" />
              Simular meu custo mensal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">
                Valor Auditado Mensal (VAM)
              </Label>
              <div className="mt-2">
                <Slider
                  value={[vamSlider]}
                  onValueChange={(v) => setVamSlider(v[0])}
                  min={0}
                  max={2000000}
                  step={5000}
                  data-testid="slider-vam"
                />
              </div>
              <p className="text-lg font-semibold mt-1" data-testid="text-vam-value">
                {formatUSD(vamSlider)}
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Mensalidade fixa</span>
                <span className="font-medium">{formatUSD(simulated.fixed)}</span>
              </div>
              <div className="flex justify-between">
                <span>Aliquota aplicada</span>
                <span className="font-medium font-mono">{(simulated.rate * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Excedente (VAM - 25k)</span>
                <span className="font-medium">{formatUSD(simulated.excess)}</span>
              </div>
              <div className="flex justify-between">
                <span>Variavel</span>
                <span className="font-medium">{formatUSD(simulated.variable)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-bold">
                <span>Total mensal</span>
                <span className="text-primary" data-testid="text-simulated-total">{formatUSD(simulated.total)}</span>
              </div>
              {simulated.total >= 3000 && (
                <Badge variant="outline" className="text-[10px]">
                  <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                  CAP atingido — US$ 3.000/mes
                </Badge>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground font-medium">Exemplos rapidos:</p>
              <div className="grid grid-cols-5 gap-1">
                {examples.map((ex) => {
                  const calc = calculateTotal(ex.vam);
                  return (
                    <button
                      key={ex.vam}
                      onClick={() => setVamSlider(ex.vam)}
                      className="text-[10px] px-1.5 py-1 rounded border hover:bg-muted/50 transition-colors text-center"
                      data-testid={`button-example-${ex.vam}`}
                    >
                      <div className="font-medium">{ex.label}</div>
                      <div className="text-muted-foreground">{formatUSD(calc.total)}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-muted/30 rounded p-2 text-[10px] text-muted-foreground">
              <strong>Formula:</strong> min(3.000, 99 + rate(VAM) x max(0, VAM - 10.000))
            </div>

            <Button
              variant="outline"
              className="w-full"
              size="sm"
              onClick={() => document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth' })}
              data-testid="button-cta-simulate-subscribe"
            >
              Assinar agora
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/30 border-dashed" data-testid="card-examples">
        <CardContent className="p-5">
          <p className="text-xs font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            Exemplos ilustrativos
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { vam: 10000, desc: "Franquia" },
              { vam: 100000, desc: "0,30%" },
              { vam: 500000, desc: "0,26%" },
              { vam: 1500000, desc: "CAP aplica" },
            ].map((ex) => {
              const calc = calculateTotal(ex.vam);
              return (
                <div key={ex.vam} className="bg-background rounded-lg border p-3 text-center" data-testid={`example-card-${ex.vam}`}>
                  <p className="text-[10px] text-muted-foreground">VAM = {formatUSD(ex.vam)}</p>
                  <p className="text-sm font-bold text-primary mt-0.5">{formatUSD(calc.total)}/mes</p>
                  <p className="text-[10px] text-muted-foreground">{ex.desc}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card id="checkout-section" data-testid="card-checkout">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            Assinar AuraAudit Pass
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName" className="text-xs">Razao Social / Empresa</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Nome da empresa"
                data-testid="input-company-name"
              />
            </div>
            <div>
              <Label htmlFor="companyCnpj" className="text-xs">CNPJ / Tax ID (opcional)</Label>
              <Input
                id="companyCnpj"
                value={companyCnpj}
                onChange={(e) => setCompanyCnpj(e.target.value)}
                placeholder="00.000.000/0000-00"
                data-testid="input-company-cnpj"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <button
              className="flex items-center gap-2 text-xs text-primary font-medium hover:underline"
              onClick={() => setShowTerms(!showTerms)}
              data-testid="button-view-terms"
            >
              {showTerms ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              Ver Termos de Adesao
            </button>
            {showTerms && (
              <div className="bg-muted/30 rounded-lg p-4 max-h-64 overflow-y-auto text-[11px] whitespace-pre-wrap font-mono" data-testid="text-terms-content">
                {(termsQuery.data as any)?.text || "Carregando termos..."}
              </div>
            )}

            <div className="flex items-start gap-2">
              <Checkbox
                id="acceptTerms"
                checked={acceptedTerms}
                onCheckedChange={(v) => setAcceptedTerms(v === true)}
                data-testid="checkbox-accept-terms"
              />
              <label htmlFor="acceptTerms" className="text-[11px] leading-tight cursor-pointer">
                Li e aceito os Termos de Adesao do AuraAudit Pass: US$ 99/mes, franquia ate US$ 10.000 auditados/mes e adicional progressivo sobre o excedente (0,30% ate US$ 100k; 0,28% ate US$ 300k; 0,26% ate US$ 600k; 0,24% ate US$ 800k; 0,22% ate US$ 1M; 0,20% acima de US$ 1M), com CAP de US$ 3.000/mes.
              </label>
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={!companyName || !acceptedTerms || checkoutMutation.isPending}
            onClick={() => checkoutMutation.mutate()}
            data-testid="button-subscribe"
          >
            {checkoutMutation.isPending ? (
              "Processando..."
            ) : (
              <>
                Assinar AuraAudit Pass — US$ 99/mes
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              Pagamento seguro via Stripe
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" />
              Cadeia de custodia digital
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-2.5 h-2.5" />
              Cancelamento a qualquer tempo
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-faq">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div>
            <p className="font-medium">O que e VAM?</p>
            <p className="text-muted-foreground">Valor Auditado Mensal — a soma das transacoes/despesas processadas pela plataforma no mes, com deduplicacao automatica.</p>
          </div>
          <Separator />
          <div>
            <p className="font-medium">Como funciona o CAP?</p>
            <p className="text-muted-foreground">O total mensal (fixo + variavel) nunca ultrapassa US$ 3.000, independente do volume auditado. Sem surpresas.</p>
          </div>
          <Separator />
          <div>
            <p className="font-medium">A taxa e sempre a mesma?</p>
            <p className="text-muted-foreground">Nao. Quanto maior o volume (VAM), menor a aliquota — de 0,30% ate 0,20%. As faixas sao continuas, sem buracos.</p>
          </div>
          <Separator />
          <div>
            <p className="font-medium">Posso cancelar a qualquer momento?</p>
            <p className="text-muted-foreground">Sim. O cancelamento produz efeitos ao final do ciclo vigente. Valores ja faturados nao sao reembolsaveis.</p>
          </div>
          <Separator />
          <div>
            <p className="font-medium">Os dados sao seguros?</p>
            <p className="text-muted-foreground">Sim. Cadeia de custodia com SHA-256, trilhas auditaveis imutaveis, criptografia e LGPD-ready.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

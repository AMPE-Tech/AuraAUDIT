import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function SubscriptionSuccess() {
  const [, navigate] = useLocation();

  return (
    <div className="max-w-lg mx-auto p-6 flex items-center justify-center min-h-[60vh]">
      <Card data-testid="card-subscription-success">
        <CardContent className="p-8 text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-lg font-bold" data-testid="text-success-title">Assinatura Confirmada!</h1>
          <p className="text-sm text-muted-foreground">
            Sua assinatura do AuraAudit Pass foi ativada com sucesso. Voce ja pode acessar a plataforma completa.
          </p>
          <div className="pt-2">
            <Button onClick={() => navigate("/dashboard")} data-testid="button-go-dashboard">
              Acessar Plataforma
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

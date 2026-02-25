import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function SubscriptionCancel() {
  const [, navigate] = useLocation();

  return (
    <div className="max-w-lg mx-auto p-6 flex items-center justify-center min-h-[60vh]">
      <Card data-testid="card-subscription-cancel">
        <CardContent className="p-8 text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 mx-auto">
            <XCircle className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-lg font-bold" data-testid="text-cancel-title">Assinatura Cancelada</h1>
          <p className="text-sm text-muted-foreground">
            O processo de checkout foi cancelado. Voce pode tentar novamente quando quiser.
          </p>
          <div className="pt-2">
            <Button variant="outline" onClick={() => navigate("/subscription")} data-testid="button-try-again">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Assinatura
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

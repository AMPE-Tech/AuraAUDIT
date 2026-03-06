import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AuraTechTopbarProps {
  moduleName?: string;
  moduleTagline?: string;
  onLogoClick?: () => void;
  onLoginClick?: () => void;
  showLogin?: boolean;
}

export function AuraTechTopbar({
  moduleName,
  moduleTagline,
  onLogoClick,
  onLoginClick,
  showLogin = true,
}: AuraTechTopbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-3">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={onLogoClick}
          data-testid="topbar-logo"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-tight">AuraTECH</h1>
              {moduleName && (
                <>
                  <span className="text-muted-foreground text-xs">/</span>
                  <span className="text-sm font-semibold tracking-tight">{moduleName}</span>
                </>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {moduleTagline || "Trust Infrastructure Platform"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            className="hidden sm:inline-flex bg-primary/10 text-primary border-primary/20 text-[10px]"
            data-testid="topbar-badge-ecosystem"
          >
            AuraTECH Ecosystem
          </Badge>
          {showLogin && (
            <Button
              size="sm"
              onClick={onLoginClick}
              data-testid="topbar-button-login"
            >
              Acessar Plataforma
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

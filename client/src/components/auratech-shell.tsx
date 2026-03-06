import { AuraTechTopbar } from "@/components/auratech-topbar";
import { AuraTechFooter } from "@/components/auratech-footer";

interface AuraTechShellProps {
  children: React.ReactNode;
  moduleName?: string;
  moduleTagline?: string;
  onLogoClick?: () => void;
  onLoginClick?: () => void;
  showLogin?: boolean;
}

export function AuraTechShell({
  children,
  moduleName,
  moduleTagline,
  onLogoClick,
  onLoginClick,
  showLogin = true,
}: AuraTechShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AuraTechTopbar
        moduleName={moduleName}
        moduleTagline={moduleTagline}
        onLogoClick={onLogoClick}
        onLoginClick={onLoginClick}
        showLogin={showLogin}
      />
      <main className="flex-1">
        <div className="p-6 space-y-8 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
      <AuraTechFooter />
    </div>
  );
}

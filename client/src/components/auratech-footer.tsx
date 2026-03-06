import { Shield, ShieldCheck, Lock } from "lucide-react";

export function AuraTechFooter() {
  return (
    <footer className="border-t bg-background" data-testid="global-footer">
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-semibold">AuraTECH</p>
              <p className="text-[10px] text-muted-foreground">Trust Infrastructure Platform</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400">SHA-256 Chain of Custody</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
              <Lock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span className="text-[9px] font-medium text-blue-600 dark:text-blue-400">Lei 13.964/2019</span>
            </div>
          </div>
        </div>
        <div className="border-t pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-muted-foreground">
            &copy; {new Date().getFullYear()} AuraTECH — Infraestrutura para Confianca Baseada em Evidencias
          </p>
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            <span>Termos de Uso</span>
            <span>Politica de Privacidade</span>
            <span>LGPD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

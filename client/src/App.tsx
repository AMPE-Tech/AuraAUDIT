import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ClientSidebar } from "@/components/client-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import ClientDashboard from "@/pages/client-dashboard";
import ClientSystems from "@/pages/client-systems";
import ClientExpenseTypes from "@/pages/client-expense-types";
import ClientIntegrations from "@/pages/client-integrations";
import ClientProducts from "@/pages/client-products";
import ClientContract from "@/pages/client-contract";
import ClientLatamScope from "@/pages/client-latam-scope";
import ClientProjectPanel from "@/pages/client-project-panel";
import ClientDocuments from "@/pages/client-documents";
import Expenses from "@/pages/expenses";
import AuditCases from "@/pages/audit-cases";
import Anomalies from "@/pages/anomalies";
import AuditTrailPage from "@/pages/audit-trail";
import Reports from "@/pages/reports";
import Reconciliation from "@/pages/reconciliation";
import Clients from "@/pages/clients";
import Integrations from "@/pages/integrations";
import AiAssistant from "@/pages/ai-assistant";
import Services from "@/pages/services";
import AdminPanel from "@/pages/admin-panel";
import Login from "@/pages/login";
import Subscription from "@/pages/subscription";
import SubscriptionSuccess from "@/pages/subscription-success";
import SubscriptionCancel from "@/pages/subscription-cancel";
import WalletPage from "@/pages/wallet";
import AiDeskPage from "@/pages/ai-desk";
import CompanyProfile from "@/pages/company-profile";
import ClientProfile from "@/pages/client-profile";
import AdminContracts from "@/pages/admin-contracts";
import BillingPage from "@/pages/billing";
import DashboardStudio from "@/pages/dashboard-studio";
import TesteAgora from "@/pages/teste-agora";
import { FloatingAiChat } from "@/components/floating-ai-chat";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn, User, Shield } from "lucide-react";

function AdminRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/expenses" component={Expenses} />
      <Route path="/reconciliation" component={Reconciliation} />
      <Route path="/cases" component={AuditCases} />
      <Route path="/anomalies" component={Anomalies} />
      <Route path="/audit-trail" component={AuditTrailPage} />
      <Route path="/reports" component={Reports} />
      <Route path="/clients" component={Clients} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/services" component={Services} />
      <Route path="/ai-desk" component={AiDeskPage} />
      <Route path="/wallet" component={WalletPage} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/company-profile" component={CompanyProfile} />
      <Route path="/contracts" component={AdminContracts} />
      <Route path="/billing" component={BillingPage} />
      <Route path="/dashboard-studio" component={DashboardStudio} />
      <Route path="/ai-assistant" component={AiAssistant} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ClientRouter() {
  return (
    <Switch>
      <Route path="/" component={ClientDashboard} />
      <Route path="/dashboard" component={ClientDashboard} />
      <Route path="/project-panel" component={ClientProjectPanel} />
      <Route path="/systems" component={ClientSystems} />
      <Route path="/documents" component={ClientDocuments} />
      <Route path="/my-profile" component={ClientProfile} />
      <Route path="/expense-types" component={ClientExpenseTypes} />
      <Route path="/integrations" component={ClientIntegrations} />
      <Route path="/products" component={ClientProducts} />
      <Route path="/contract" component={ClientContract} />
      <Route path="/latam-scope" component={ClientLatamScope} />
      <Route path="/ai-desk" component={AiDeskPage} />
      <Route path="/wallet" component={WalletPage} />
      <Route path="/billing" component={BillingPage} />
      <Route path="/dashboard-studio" component={DashboardStudio} />
      <Route path="/ai-assistant" component={AiAssistant} />
      <Route component={ClientDashboard} />
    </Switch>
  );
}

const sidebarStyle = {
  "--sidebar-width": "16rem",
  "--sidebar-width-icon": "3rem",
};

function AuthenticatedApp() {
  const { user, logout } = useAuth();

  if (user?.role === "client") {
    return (
      <SidebarProvider style={sidebarStyle as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <ClientSidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <header className="flex items-center justify-between gap-2 p-2 border-b sticky top-0 z-50 bg-background">
              <SidebarTrigger data-testid="button-client-sidebar-toggle" />
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span data-testid="text-user-name">{user.fullName}</span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </header>
            <main className="flex-1 overflow-auto">
              <ClientRouter />
            </main>
          </div>
          <FloatingAiChat />
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-2 p-2 border-b sticky top-0 z-50 bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span data-testid="text-user-name">{user?.fullName}</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <AdminRouter />
          </main>
        </div>
        <FloatingAiChat />
      </div>
    </SidebarProvider>
  );
}

function PublicHome() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">AuraAUDIT</h1>
              <p className="text-[10px] text-muted-foreground">Auditoria Forense Independente</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            
            {user ? (
              <Button size="sm" onClick={() => navigate("/dashboard")} data-testid="button-go-dashboard">
                <User className="w-4 h-4 mr-2" />
                Acessar Plataforma
              </Button>
            ) : (
              <Button size="sm" onClick={() => navigate("/login")} data-testid="button-go-login">
                <LogIn className="w-4 h-4 mr-2" />
                Entrar
              </Button>
            )}
          </div>
        </div>
      </header>
      <main>
        <Home />
      </main>
    </div>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const [location, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-3 text-center">
          <Skeleton className="h-10 w-10 rounded-lg mx-auto" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (location === "/" || location === "") {
    return <PublicHome />;
  }

  if (location === "/teste-agora") {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-semibold tracking-tight">AuraAUDIT</h1>
                <p className="text-[10px] text-muted-foreground">Auditoria Forense Independente</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              
              {user ? (
                <Button size="sm" onClick={() => navigate("/dashboard")} data-testid="button-go-dashboard">
                  <User className="w-4 h-4 mr-2" />
                  Plataforma
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => navigate("/login")} data-testid="button-go-login">
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
              )}
            </div>
          </div>
        </header>
        <TesteAgora />
        <FloatingAiChat />
      </div>
    );
  }

  if (location === "/subscription") {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-semibold tracking-tight">AuraAUDIT</h1>
                <p className="text-[10px] text-muted-foreground">Auditoria Forense Independente</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              
              {user ? (
                <Button size="sm" onClick={() => navigate("/dashboard")} data-testid="button-go-dashboard">
                  <User className="w-4 h-4 mr-2" />
                  Plataforma
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => navigate("/login")} data-testid="button-go-login">
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
              )}
            </div>
          </div>
        </header>
        <Subscription />
      </div>
    );
  }

  if (location === "/subscription/success") {
    return (
      <div className="min-h-screen bg-background">
        <SubscriptionSuccess />
      </div>
    );
  }

  if (location === "/subscription/cancel") {
    return (
      <div className="min-h-screen bg-background">
        <SubscriptionCancel />
      </div>
    );
  }

  if (location === "/login") {
    if (user) {
      return <AuthenticatedApp />;
    }
    return <Login />;
  }

  if (!user) {
    return <Login />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

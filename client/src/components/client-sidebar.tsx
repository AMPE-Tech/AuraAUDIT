import {
  LayoutDashboard,
  Monitor,
  Receipt,
  Plug,
  Package,
  FileText,
  Shield,
  Globe,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const projetoItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Painel do Projeto", url: "/project-panel", icon: BarChart3 },
  { title: "Sistemas", url: "/systems", icon: Monitor },
];

const auditoriaItems = [
  { title: "Tipos de Despesas", url: "/expense-types", icon: Receipt },
  { title: "Integracoes", url: "/integrations", icon: Plug },
];

const comercialItems = [
  { title: "Produtos & Servicos", url: "/products", icon: Package },
  { title: "Contrato", url: "/contract", icon: FileText },
  { title: "Ecossistema LATAM", url: "/latam-scope", icon: Globe },
];

const iaItems = [
  { title: "AuraAI Assistente", url: "/ai-assistant", icon: Sparkles },
];

export function ClientSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const renderMenuItems = (items: typeof projetoItems) =>
    items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          asChild
          isActive={location.startsWith(item.url)}
          data-testid={`sidebar-link-${item.url.replace("/", "")}`}
        >
          <Link href={item.url}>
            <item.icon className="w-4 h-4" />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/dashboard">
          <div className="flex items-center gap-3 cursor-pointer" data-testid="sidebar-logo">
            <div className="flex items-center justify-center w-9 h-9 rounded-md bg-primary">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">AuraAUDIT</h1>
              <p className="text-[11px] text-muted-foreground">
                {user?.fullName || "Portal do Cliente"}
              </p>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Projeto</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenuItems(projetoItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Auditoria</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenuItems(auditoriaItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Comercial</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenuItems(comercialItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Inteligencia Artificial</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderMenuItems(iaItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-2" data-testid="footer-lei-badge">
          <Badge variant="outline" className="text-[10px]">
            <Shield className="w-3 h-3 mr-1" />
            Lei 13.964/2019
          </Badge>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

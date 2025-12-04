import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard, 
  BarChart3, 
  ClipboardList, 
  Search, 
  FileText,
  HeartPulse
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NavigationTabsProps {
  defaultValue?: string;
  children: React.ReactNode;
  totalClients?: number;
  pendingCount?: number;
}

export const NavigationTabs = ({ 
  defaultValue = "visao-geral", 
  children,
  totalClients = 0,
  pendingCount = 0
}: NavigationTabsProps) => {
  const tabs = [
    {
      value: "visao-geral",
      label: "Visão Geral",
      icon: LayoutDashboard,
      description: "Dashboard principal"
    },
    {
      value: "analises",
      label: "Análises",
      icon: BarChart3,
      description: "Gráficos e insights"
    },
    {
      value: "check-ins",
      label: "Check-ins",
      icon: ClipboardList,
      description: "Timeline de atualizações"
    },
    {
      value: "clientes",
      label: "Pesquisa",
      icon: Search,
      description: "Busca avançada",
      badge: totalClients
    },
    {
      value: "relatorios",
      label: "Relatórios",
      icon: FileText,
      description: "Exportar dados"
    },
    {
      value: "health-score",
      label: "Health Score",
      icon: HeartPulse,
      description: "Saúde dos clientes"
    }
  ];

  return (
    <Tabs defaultValue={defaultValue} className="space-y-8">
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-xl -z-10" />
        
        <TabsList className="w-full h-auto p-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg grid gap-2 grid-cols-6">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="relative flex-col h-auto py-4 px-3 data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300 rounded-lg group hover:bg-background/50 data-[state=active]:border data-[state=active]:border-primary/20"
            >
              {/* Active indicator */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300 group-data-[state=active]:opacity-100" />
              
              <div className="flex items-center gap-2 mb-1">
                <tab.icon className="h-5 w-5 text-muted-foreground group-data-[state=active]:text-primary transition-colors duration-300" />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="h-5 px-2 text-xs bg-primary/10 text-primary border-primary/20 group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground"
                  >
                    {tab.badge}
                  </Badge>
                )}
              </div>
              
              <span className="text-sm font-semibold text-foreground/70 group-data-[state=active]:text-foreground transition-colors duration-300">
                {tab.label}
              </span>
              
              <span className="text-xs text-muted-foreground mt-1 opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300">
                {tab.description}
              </span>

              {/* Glow effect on active */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent opacity-0 group-data-[state=active]:opacity-100 rounded-lg transition-opacity duration-500 pointer-events-none" />
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {children}
    </Tabs>
  );
};

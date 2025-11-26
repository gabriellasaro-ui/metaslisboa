import { useState, Children, isValidElement, cloneElement } from "react";
import { 
  LayoutDashboard, 
  BarChart3, 
  ClipboardList, 
  Search, 
  FileText 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  const [activeTab, setActiveTab] = useState(defaultValue);
  
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
    }
  ];

  return (
    <div className="space-y-8">
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-xl -z-10" />
        
        <div className="w-full h-auto p-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg grid grid-cols-5 gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <Button
                key={tab.value}
                onClick={() => {
                  console.log('Tab clicked:', tab.value);
                  setActiveTab(tab.value);
                }}
                variant="ghost"
                className={`relative flex-col h-auto py-4 px-3 transition-all duration-300 rounded-lg group hover:bg-background/50 ${
                  isActive ? 'bg-background shadow-lg border border-primary/20' : ''
                }`}
              >
                {/* Active indicator */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full transition-opacity duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`} />
                
                <div className="flex items-center gap-2 mb-1">
                  <tab.icon className={`h-5 w-5 transition-colors duration-300 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <Badge 
                      variant="secondary" 
                      className={`h-5 px-2 text-xs ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-primary/10 text-primary border-primary/20'
                      }`}
                    >
                      {tab.badge}
                    </Badge>
                  )}
                </div>
                
                <span className={`text-sm font-semibold transition-colors duration-300 ${
                  isActive ? 'text-foreground' : 'text-foreground/70'
                }`}>
                  {tab.label}
                </span>
                
                <span className={`text-xs text-muted-foreground mt-1 transition-opacity duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}>
                  {tab.description}
                </span>

                {/* Glow effect on active */}
                <div className={`absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent rounded-lg transition-opacity duration-500 pointer-events-none ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`} />
              </Button>
            );
          })}
        </div>
      </div>

      {Children.map(children, (child) => {
        if (isValidElement(child) && child.props['data-value'] === activeTab) {
          return cloneElement(child as any);
        }
        return null;
      })}
    </div>
  );
};

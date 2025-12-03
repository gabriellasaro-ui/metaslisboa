import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileSpreadsheet, FileText, TrendingUp, TrendingDown, ArrowRight, Loader2, Search, Filter, X, AlertTriangle, AlertCircle } from "lucide-react";
import { HealthScoreBadge, ExtendedHealthStatus, healthStatusLabels, getHealthScoreColor } from "./HealthScoreBadge";
import { analyzeMovement, getHealthScoreValue } from "./HealthScoreTrendsChart";
import { generateExecutiveHealthScorePDF } from "@/utils/healthScoreExecutivePdf";
import * as XLSX from "xlsx";
import { toast } from "sonner";

interface HealthScoreMovementsReportProps {
  squadsData: { id: string; name: string }[];
}

interface MovementEntry {
  id: string;
  client_id: string;
  client_name: string;
  squad_id: string;
  squad_name: string;
  old_status: ExtendedHealthStatus | null;
  new_status: ExtendedHealthStatus | null;
  old_categoria_problema: string | null;
  new_categoria_problema: string | null;
  old_problema_central: string | null;
  new_problema_central: string | null;
  changed_at: string;
  changed_by_name: string | null;
  notes: string | null;
  analysis: ReturnType<typeof analyzeMovement>;
}

type PeriodFilter = "7d" | "15d" | "30d" | "90d" | "all";
type MovementFilter = "all" | "improvement" | "deterioration" | "critical_alert";

export const HealthScoreMovementsReport = ({ squadsData }: HealthScoreMovementsReportProps) => {
  const [period, setPeriod] = useState<PeriodFilter>("30d");
  const [selectedSquad, setSelectedSquad] = useState<string>("all");
  const [movementType, setMovementType] = useState<MovementFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const periodDays: Record<PeriodFilter, number | null> = {
    "7d": 7,
    "15d": 15,
    "30d": 30,
    "90d": 90,
    "all": null,
  };

  const periodLabels: Record<PeriodFilter, string> = {
    "7d": "Últimos 7 dias",
    "15d": "Últimos 15 dias",
    "30d": "Últimos 30 dias",
    "90d": "Últimos 90 dias",
    "all": "Todos os dados",
  };

  const startDate = useMemo(() => {
    const days = periodDays[period];
    return days ? startOfDay(subDays(new Date(), days)) : null;
  }, [period]);

  const { data: movements = [], isLoading } = useQuery({
    queryKey: ["health-score-movements", period],
    queryFn: async () => {
      let query = supabase
        .from("health_score_history")
        .select(`
          id,
          client_id,
          old_status,
          new_status,
          old_categoria_problema,
          new_categoria_problema,
          old_problema_central,
          new_problema_central,
          changed_at,
          changed_by,
          notes,
          clients!inner(name, squad_id, squads!inner(name))
        `)
        .order("changed_at", { ascending: false });

      if (startDate) {
        query = query.gte("changed_at", startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      const userIds = [...new Set((data || []).map((m: any) => m.changed_by).filter(Boolean))];
      let userNames: Record<string, string> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", userIds);
        
        userNames = (profiles || []).reduce((acc: Record<string, string>, p: any) => {
          acc[p.id] = p.name;
          return acc;
        }, {});
      }

      return (data || []).map((m: any) => {
        const oldStatus = m.old_status as ExtendedHealthStatus | null;
        const newStatus = m.new_status as ExtendedHealthStatus | null;
        
        return {
          id: m.id,
          client_id: m.client_id,
          client_name: m.clients?.name || "Cliente",
          squad_id: m.clients?.squad_id || "",
          squad_name: m.clients?.squads?.name || "Squad",
          old_status: oldStatus,
          new_status: newStatus,
          old_categoria_problema: m.old_categoria_problema,
          new_categoria_problema: m.new_categoria_problema,
          old_problema_central: m.old_problema_central,
          new_problema_central: m.new_problema_central,
          changed_at: m.changed_at,
          changed_by_name: m.changed_by ? userNames[m.changed_by] || "Usuário" : null,
          notes: m.notes,
          analysis: analyzeMovement(oldStatus, newStatus),
        };
      }) as MovementEntry[];
    },
  });

  // Get squad summaries for PDF
  const { data: allClients = [] } = useQuery({
    queryKey: ["all-clients-for-pdf"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, health_status, squad_id, squads!inner(name)");
      if (error) throw error;
      return data || [];
    },
  });

  const squadSummaries = useMemo(() => {
    const summaryMap: Record<string, any> = {};
    
    allClients.forEach((client: any) => {
      const squadId = client.squad_id;
      const squadName = client.squads?.name || "Squad";
      
      if (!summaryMap[squadId]) {
        summaryMap[squadId] = {
          name: squadName,
          totalClients: 0,
          scoreSum: 0,
          safeCount: 0,
          careCount: 0,
          dangerCount: 0,
          criticalCount: 0,
        };
      }
      
      const status = (client.health_status || 'safe') as ExtendedHealthStatus;
      summaryMap[squadId].totalClients++;
      summaryMap[squadId].scoreSum += getHealthScoreValue(status);
      
      if (status === 'safe') summaryMap[squadId].safeCount++;
      else if (['care', 'onboarding', 'e_e'].includes(status)) summaryMap[squadId].careCount++;
      else if (status === 'danger') summaryMap[squadId].dangerCount++;
      else summaryMap[squadId].criticalCount++;
    });

    return Object.values(summaryMap).map((s: any) => ({
      ...s,
      avgScore: s.totalClients > 0 ? Math.round(s.scoreSum / s.totalClients) : 0,
    }));
  }, [allClients]);

  // Apply filters
  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      if (selectedSquad !== "all" && m.squad_id !== selectedSquad) return false;
      if (movementType !== "all" && m.analysis.type !== movementType) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesClient = m.client_name.toLowerCase().includes(query);
        const matchesSquad = m.squad_name.toLowerCase().includes(query);
        if (!matchesClient && !matchesSquad) return false;
      }
      
      return true;
    });
  }, [movements, selectedSquad, movementType, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const statusChanges: Record<string, number> = {};
    const categoryReasons: Record<string, number> = {};
    
    let improvements = 0;
    let deteriorations = 0;
    let criticalAlerts = 0;
    let needsAttention = 0;

    filteredMovements.forEach(m => {
      if (m.analysis.type === 'improvement') improvements++;
      else if (m.analysis.type === 'deterioration') deteriorations++;
      else if (m.analysis.type === 'critical_alert') criticalAlerts++;

      if (m.analysis.type === 'improvement' && m.analysis.label.includes('parcial')) {
        needsAttention++;
      }

      if (m.new_status) {
        statusChanges[m.new_status] = (statusChanges[m.new_status] || 0) + 1;
      }
      if (m.new_categoria_problema) {
        categoryReasons[m.new_categoria_problema] = (categoryReasons[m.new_categoria_problema] || 0) + 1;
      }
    });

    return { 
      total: filteredMovements.length, 
      improvements, 
      deteriorations, 
      criticalAlerts,
      needsAttention,
      statusChanges, 
      categoryReasons 
    };
  }, [filteredMovements]);

  const clearFilters = () => {
    setSelectedSquad("all");
    setMovementType("all");
    setSearchQuery("");
  };

  const hasActiveFilters = selectedSquad !== "all" || movementType !== "all" || searchQuery !== "";

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'improvement': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'deterioration': return <TrendingDown className="h-3 w-3 text-orange-500" />;
      case 'critical_alert': return <AlertTriangle className="h-3 w-3 text-red-600" />;
      default: return <AlertCircle className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getMovementBadge = (analysis: ReturnType<typeof analyzeMovement>) => {
    const variants: Record<string, string> = {
      improvement: "bg-green-500/10 text-green-700 border-green-500/20",
      deterioration: "bg-orange-500/10 text-orange-700 border-orange-500/20",
      critical_alert: "bg-red-500/10 text-red-700 border-red-500/20",
      neutral: "bg-muted text-muted-foreground",
    };

    return (
      <Badge variant="outline" className={`text-xs ${variants[analysis.type]}`}>
        {getMovementIcon(analysis.type)}
        <span className="ml-1">{analysis.label}</span>
      </Badge>
    );
  };

  const handleExportExcel = () => {
    try {
      const data = filteredMovements.map(m => ({
        "Data": format(new Date(m.changed_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
        "Cliente": m.client_name,
        "Squad": m.squad_name,
        "Status Anterior": m.old_status ? healthStatusLabels[m.old_status] : "-",
        "Novo Status": m.new_status ? healthStatusLabels[m.new_status] : "-",
        "Tipo": m.analysis.label,
        "Análise": m.analysis.description,
        "Categoria": m.new_categoria_problema || "-",
        "Alterado por": m.changed_by_name || "-",
        "Observações": m.notes || "-",
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Movimentações");

      XLSX.writeFile(wb, `movimentacoes-health-score-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
      toast.success("Excel exportado!");
    } catch (error) {
      toast.error("Erro ao exportar Excel");
    }
  };

  const handleExportPDF = async () => {
    try {
      toast.info("Gerando relatório executivo...");
      
      await generateExecutiveHealthScorePDF(
        filteredMovements.map(m => ({
          client_name: m.client_name,
          squad_name: m.squad_name,
          old_status: m.old_status,
          new_status: m.new_status,
          changed_at: m.changed_at,
          analysis: m.analysis,
          new_categoria_problema: m.new_categoria_problema,
          notes: m.notes,
        })),
        stats,
        squadSummaries,
        periodLabels[period]
      );
      
      toast.success("Relatório executivo exportado!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar PDF");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Movimentações de Health Score</CardTitle>
              <CardDescription>
                Análise inteligente das mudanças de status
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                onClick={handleExportExcel}
                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white border-0"
              >
                <FileSpreadsheet className="h-4 w-4 mr-1" />
                Excel
              </Button>
              <Button 
                size="sm" 
                onClick={handleExportPDF}
                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white border-0"
              >
                <FileText className="h-4 w-4 mr-1" />
                PDF Executivo
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-muted/30">
            <Filter className="h-4 w-4 text-muted-foreground" />
            
            <div className="relative flex-1 min-w-[140px] max-w-[180px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            
            <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
              <SelectTrigger className="w-[110px] h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="15d">15 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="90d">90 dias</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedSquad} onValueChange={setSelectedSquad}>
              <SelectTrigger className="w-[130px] h-8 text-sm">
                <SelectValue placeholder="Squad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos squads</SelectItem>
                {squadsData.map(squad => (
                  <SelectItem key={squad.id} value={squad.id}>{squad.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={movementType} onValueChange={(v) => setMovementType(v as MovementFilter)}>
              <SelectTrigger className="w-[120px] h-8 text-sm">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos tipos</SelectItem>
                <SelectItem value="improvement">Melhorias</SelectItem>
                <SelectItem value="deterioration">Pioras</SelectItem>
                <SelectItem value="critical_alert">Críticos</SelectItem>
              </SelectContent>
            </Select>
            
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Summary Cards - More Compact */}
            <div className="grid grid-cols-5 gap-2">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10 text-center">
                <p className="text-xl font-bold text-green-600">{stats.improvements}</p>
                <p className="text-xs text-muted-foreground">Melhorias</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10 text-center">
                <p className="text-xl font-bold text-orange-500">{stats.deteriorations}</p>
                <p className="text-xs text-muted-foreground">Pioras</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10 text-center">
                <p className="text-xl font-bold text-red-600">{stats.criticalAlerts}</p>
                <p className="text-xs text-muted-foreground">Críticos</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/10 text-center">
                <p className="text-xl font-bold text-yellow-600">{stats.needsAttention}</p>
                <p className="text-xs text-muted-foreground">Atenção</p>
              </div>
            </div>

            {/* Movements List - Clean Design */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Últimas Movimentações</h4>
                <span className="text-xs text-muted-foreground">{filteredMovements.length} registros</span>
              </div>
              
              {filteredMovements.length === 0 ? (
                <p className="text-muted-foreground text-center py-6 text-sm">
                  Nenhuma movimentação encontrada
                </p>
              ) : (
                <div className="space-y-1.5 max-h-[320px] overflow-y-auto">
                  {filteredMovements.slice(0, 50).map((m) => (
                    <div 
                      key={m.id} 
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <div className="text-xs text-muted-foreground w-14 flex-shrink-0">
                        {format(new Date(m.changed_at), "dd/MM", { locale: ptBR })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{m.client_name}</p>
                          <span className="text-xs text-muted-foreground">• {m.squad_name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{m.analysis.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {m.old_status && <HealthScoreBadge status={m.old_status} size="sm" />}
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        {m.new_status && <HealthScoreBadge status={m.new_status} size="sm" />}
                      </div>
                      <div className="flex-shrink-0 hidden sm:block">
                        {getMovementBadge(m.analysis)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

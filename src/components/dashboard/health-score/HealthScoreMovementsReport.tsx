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
import { FileSpreadsheet, FileText, TrendingUp, TrendingDown, ArrowRight, Loader2, Search, Filter, X, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { HealthScoreBadge, ExtendedHealthStatus, healthStatusLabels, getHealthScoreColor } from "./HealthScoreBadge";
import { analyzeMovement, getHealthScoreValue } from "./HealthScoreTrendsChart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
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
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [movementType, setMovementType] = useState<MovementFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const periodDays: Record<PeriodFilter, number | null> = {
    "7d": 7,
    "15d": 15,
    "30d": 30,
    "90d": 90,
    "all": null,
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

  // Apply filters
  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      if (selectedSquad !== "all" && m.squad_id !== selectedSquad) return false;
      if (selectedStatus !== "all" && m.new_status !== selectedStatus) return false;
      if (movementType !== "all" && m.analysis.type !== movementType) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesClient = m.client_name.toLowerCase().includes(query);
        const matchesSquad = m.squad_name.toLowerCase().includes(query);
        const matchesCategory = m.new_categoria_problema?.toLowerCase().includes(query);
        if (!matchesClient && !matchesSquad && !matchesCategory) return false;
      }
      
      return true;
    });
  }, [movements, selectedSquad, selectedStatus, movementType, searchQuery]);

  // Statistics based on filtered data
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

      // Count those that improved but still need attention
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

  const statusChartData = useMemo(() => {
    return Object.entries(stats.statusChanges)
      .map(([status, count]) => ({
        name: healthStatusLabels[status as ExtendedHealthStatus] || status,
        value: count,
        color: getHealthScoreColor(status as ExtendedHealthStatus),
      }))
      .sort((a, b) => b.value - a.value);
  }, [stats.statusChanges]);

  const categoryChartData = useMemo(() => {
    return Object.entries(stats.categoryReasons)
      .map(([category, count]) => ({
        name: category.length > 20 ? category.substring(0, 20) + "..." : category,
        fullName: category,
        value: count,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [stats.categoryReasons]);

  const clearFilters = () => {
    setSelectedSquad("all");
    setSelectedStatus("all");
    setMovementType("all");
    setSearchQuery("");
  };

  const hasActiveFilters = selectedSquad !== "all" || selectedStatus !== "all" || movementType !== "all" || searchQuery !== "";

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
        "Cliente": m.client_name,
        "Squad": m.squad_name,
        "Status Anterior": m.old_status ? healthStatusLabels[m.old_status] : "-",
        "Novo Status": m.new_status ? healthStatusLabels[m.new_status] : "-",
        "Tipo de Movimento": m.analysis.label,
        "Análise": m.analysis.description,
        "Categoria": m.new_categoria_problema || "-",
        "Problema": m.new_problema_central || "-",
        "Alterado por": m.changed_by_name || "-",
        "Data": format(new Date(m.changed_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
        "Observações": m.notes || "-",
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Movimentações");

      const summaryData = [
        { "Métrica": "Total de Movimentações", "Valor": stats.total },
        { "Métrica": "Melhorias", "Valor": stats.improvements },
        { "Métrica": "Pioras", "Valor": stats.deteriorations },
        { "Métrica": "Alertas Críticos", "Valor": stats.criticalAlerts },
        { "Métrica": "Requer Atenção", "Valor": stats.needsAttention },
      ];
      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, "Resumo");

      XLSX.writeFile(wb, `movimentacoes-health-score-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
      toast.success("Excel exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar Excel");
    }
  };

  const handleExportPDF = async () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let y = 20;

      // Header
      doc.setFillColor(220, 38, 38);
      doc.rect(0, 0, pageWidth, 40, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Relatório de Health Score", pageWidth / 2, 18, { align: "center" });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const periodLabel = period === "all" ? "Todos os dados" : `Últimos ${periodDays[period]} dias`;
      doc.text(`${periodLabel} | ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, pageWidth / 2, 30, { align: "center" });
      
      y = 55;
      doc.setTextColor(30, 41, 59);

      // Executive Summary
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(15, y - 5, pageWidth - 30, 50, 3, 3, "F");
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Resumo Executivo", 20, y + 5);
      
      y += 18;
      doc.setFontSize(10);
      
      // Stats in grid
      const statsData = [
        { label: "Total", value: stats.total, color: [30, 41, 59] },
        { label: "Melhorias", value: stats.improvements, color: [34, 197, 94] },
        { label: "Pioras", value: stats.deteriorations, color: [249, 115, 22] },
        { label: "Críticos", value: stats.criticalAlerts, color: [220, 38, 38] },
      ];

      statsData.forEach((stat, i) => {
        const x = 25 + (i * 45);
        doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(stat.value.toString(), x, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(stat.label, x, y + 6);
      });

      y += 35;
      doc.setTextColor(30, 41, 59);

      // Movements by type
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Análise de Movimentações", 20, y);
      y += 10;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");

      // Group by analysis type
      const movementsByType = filteredMovements.reduce((acc, m) => {
        const key = m.analysis.type;
        if (!acc[key]) acc[key] = [];
        acc[key].push(m);
        return acc;
      }, {} as Record<string, MovementEntry[]>);

      const typeLabels: Record<string, string> = {
        improvement: "✅ Melhorias",
        deterioration: "⚠️ Pioras",
        critical_alert: "🚨 Alertas Críticos",
        neutral: "➖ Neutros",
      };

      Object.entries(movementsByType).forEach(([type, entries]) => {
        if (y > pageHeight - 40) {
          doc.addPage();
          y = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.text(`${typeLabels[type]} (${entries.length})`, 20, y);
        y += 6;

        doc.setFont("helvetica", "normal");
        entries.slice(0, 5).forEach(m => {
          if (y > pageHeight - 15) {
            doc.addPage();
            y = 20;
          }
          const date = format(new Date(m.changed_at), "dd/MM", { locale: ptBR });
          doc.text(`  ${date} - ${m.client_name}: ${m.analysis.description}`, 20, y);
          y += 5;
        });
        
        if (entries.length > 5) {
          doc.setTextColor(100, 116, 139);
          doc.text(`  ... e mais ${entries.length - 5} movimentações`, 20, y);
          doc.setTextColor(30, 41, 59);
          y += 5;
        }
        y += 5;
      });

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      }

      doc.save(`relatorio-health-score-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao exportar PDF");
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
                Histórico com análise inteligente das mudanças
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
                PDF
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-muted/30">
            <Filter className="h-4 w-4 text-muted-foreground" />
            
            <div className="relative flex-1 min-w-[150px] max-w-[200px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            
            <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
              <SelectTrigger className="w-[130px] h-9">
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
              <SelectTrigger className="w-[140px] h-9">
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
              <SelectTrigger className="w-[140px] h-9">
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
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10 text-center">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <p className="text-2xl font-bold text-green-600">{stats.improvements}</p>
                </div>
                <p className="text-xs text-muted-foreground">Melhorias</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10 text-center">
                <div className="flex items-center justify-center gap-1">
                  <TrendingDown className="h-4 w-4 text-orange-500" />
                  <p className="text-2xl font-bold text-orange-500">{stats.deteriorations}</p>
                </div>
                <p className="text-xs text-muted-foreground">Pioras</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10 text-center">
                <div className="flex items-center justify-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <p className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</p>
                </div>
                <p className="text-xs text-muted-foreground">Críticos</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/10 text-center">
                <div className="flex items-center justify-center gap-1">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <p className="text-2xl font-bold text-yellow-600">{stats.needsAttention}</p>
                </div>
                <p className="text-xs text-muted-foreground">Requer Atenção</p>
              </div>
            </div>

            {/* Charts */}
            {stats.total > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Mudanças por Status</h4>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusChartData} layout="vertical">
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {statusChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Principais Motivos</h4>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryChartData} layout="vertical">
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 9 }} />
                        <Tooltip 
                          formatter={(value, name, props) => [value, props.payload.fullName]}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Movements List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Movimentações</h4>
                <span className="text-sm text-muted-foreground">{filteredMovements.length} resultados</span>
              </div>
              {filteredMovements.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma movimentação encontrada
                </p>
              ) : (
                <div className="space-y-2 max-h-[350px] overflow-y-auto">
                  {filteredMovements.slice(0, 100).map((m) => (
                    <div 
                      key={m.id} 
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="text-xs text-muted-foreground w-16 flex-shrink-0 pt-0.5">
                        {format(new Date(m.changed_at), "dd/MM HH:mm", { locale: ptBR })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">{m.client_name}</p>
                          {getMovementBadge(m.analysis)}
                        </div>
                        <p className="text-xs text-muted-foreground">{m.squad_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{m.analysis.description}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {m.old_status && <HealthScoreBadge status={m.old_status} size="sm" />}
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        {m.new_status && <HealthScoreBadge status={m.new_status} size="sm" />}
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

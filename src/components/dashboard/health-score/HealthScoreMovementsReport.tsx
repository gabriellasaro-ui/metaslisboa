import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfDay, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileSpreadsheet, FileText, TrendingUp, TrendingDown, ArrowRight, Loader2, Search, Filter, X } from "lucide-react";
import { HealthScoreBadge, ExtendedHealthStatus, healthStatusLabels, getHealthScoreColor } from "./HealthScoreBadge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { toast } from "sonner";
import html2canvas from "html2canvas";

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
}

type PeriodFilter = "7d" | "15d" | "30d" | "90d" | "all";

export const HealthScoreMovementsReport = ({ squadsData }: HealthScoreMovementsReportProps) => {
  const [period, setPeriod] = useState<PeriodFilter>("30d");
  const [selectedSquad, setSelectedSquad] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
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

      return (data || []).map((m: any) => ({
        id: m.id,
        client_id: m.client_id,
        client_name: m.clients?.name || "Cliente",
        squad_id: m.clients?.squad_id || "",
        squad_name: m.clients?.squads?.name || "Squad",
        old_status: m.old_status as ExtendedHealthStatus | null,
        new_status: m.new_status as ExtendedHealthStatus | null,
        old_categoria_problema: m.old_categoria_problema,
        new_categoria_problema: m.new_categoria_problema,
        old_problema_central: m.old_problema_central,
        new_problema_central: m.new_problema_central,
        changed_at: m.changed_at,
        changed_by_name: m.changed_by ? userNames[m.changed_by] || "Usuário" : null,
        notes: m.notes,
      })) as MovementEntry[];
    },
  });

  // Apply filters
  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      // Squad filter
      if (selectedSquad !== "all" && m.squad_id !== selectedSquad) return false;
      
      // Status filter
      if (selectedStatus !== "all" && m.new_status !== selectedStatus) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesClient = m.client_name.toLowerCase().includes(query);
        const matchesSquad = m.squad_name.toLowerCase().includes(query);
        const matchesCategory = m.new_categoria_problema?.toLowerCase().includes(query);
        if (!matchesClient && !matchesSquad && !matchesCategory) return false;
      }
      
      return true;
    });
  }, [movements, selectedSquad, selectedStatus, searchQuery]);

  // Statistics based on filtered data
  const stats = useMemo(() => {
    const statusChanges: Record<string, number> = {};
    const categoryReasons: Record<string, number> = {};
    const order = ['churn', 'aviso_previo', 'danger_critico', 'danger', 'care', 'e_e', 'onboarding', 'safe'];
    
    const improvements = filteredMovements.filter(m => {
      if (!m.old_status || !m.new_status) return false;
      return order.indexOf(m.new_status) > order.indexOf(m.old_status);
    }).length;
    
    const deteriorations = filteredMovements.filter(m => {
      if (!m.old_status || !m.new_status) return false;
      return order.indexOf(m.new_status) < order.indexOf(m.old_status);
    }).length;

    filteredMovements.forEach(m => {
      if (m.new_status) {
        statusChanges[m.new_status] = (statusChanges[m.new_status] || 0) + 1;
      }
      if (m.new_categoria_problema) {
        categoryReasons[m.new_categoria_problema] = (categoryReasons[m.new_categoria_problema] || 0) + 1;
      }
    });

    return { total: filteredMovements.length, improvements, deteriorations, statusChanges, categoryReasons };
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
    setSearchQuery("");
  };

  const hasActiveFilters = selectedSquad !== "all" || selectedStatus !== "all" || searchQuery !== "";

  const handleExportExcel = () => {
    try {
      const data = filteredMovements.map(m => ({
        "Cliente": m.client_name,
        "Squad": m.squad_name,
        "Status Anterior": m.old_status ? healthStatusLabels[m.old_status] : "-",
        "Novo Status": m.new_status ? healthStatusLabels[m.new_status] : "-",
        "Categoria Anterior": m.old_categoria_problema || "-",
        "Nova Categoria": m.new_categoria_problema || "-",
        "Problema Anterior": m.old_problema_central || "-",
        "Novo Problema": m.new_problema_central || "-",
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

      // Header with gradient effect
      doc.setFillColor(220, 38, 38);
      doc.rect(0, 0, pageWidth, 40, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Relatório de Health Score", pageWidth / 2, 18, { align: "center" });
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const periodLabel = period === "all" ? "Todos os dados" : `Últimos ${periodDays[period]} dias`;
      doc.text(`${periodLabel} | Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, pageWidth / 2, 30, { align: "center" });
      
      y = 55;
      doc.setTextColor(30, 41, 59);

      // Executive Summary Box
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(15, y - 5, pageWidth - 30, 45, 3, 3, "F");
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Resumo Executivo", 20, y + 5);
      
      y += 15;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      
      // Stats in columns
      doc.setFont("helvetica", "bold");
      doc.text(stats.total.toString(), 35, y + 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Total", 35, y + 12);
      
      doc.setTextColor(34, 197, 94);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(stats.improvements.toString(), 75, y + 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Melhorias", 75, y + 12);
      
      doc.setTextColor(239, 68, 68);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(stats.deteriorations.toString(), 115, y + 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Pioras", 115, y + 12);
      
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(Object.keys(stats.categoryReasons).length.toString(), 155, y + 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Motivos", 155, y + 12);

      y += 40;
      doc.setTextColor(30, 41, 59);

      // Status Distribution
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Distribuição por Status", 20, y);
      y += 8;

      statusChartData.forEach((item, index) => {
        const color = item.color;
        const rgb = hexToRgb(color) || { r: 100, g: 100, b: 100 };
        doc.setFillColor(rgb.r, rgb.g, rgb.b);
        doc.roundedRect(20, y, 8, 8, 1, 1, "F");
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 41, 59);
        doc.text(`${item.name}: ${item.value} (${((item.value / stats.total) * 100).toFixed(1)}%)`, 32, y + 6);
        y += 12;
        
        if (y > pageHeight - 40) {
          doc.addPage();
          y = 20;
        }
      });

      y += 10;

      // Top Categories
      if (categoryChartData.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Principais Motivos", 20, y);
        y += 8;

        categoryChartData.slice(0, 8).forEach((cat, index) => {
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.text(`${index + 1}. ${cat.fullName}: ${cat.value} ocorrências`, 25, y);
          y += 6;
        });
      }

      // Recent Movements
      doc.addPage();
      y = 20;
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Últimas Movimentações", 20, y);
      y += 10;

      // Table header
      doc.setFillColor(241, 245, 249);
      doc.rect(15, y - 4, pageWidth - 30, 10, "F");
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Data", 18, y + 2);
      doc.text("Cliente", 45, y + 2);
      doc.text("Squad", 90, y + 2);
      doc.text("De", 130, y + 2);
      doc.text("Para", 160, y + 2);
      y += 10;

      doc.setFont("helvetica", "normal");
      filteredMovements.slice(0, 40).forEach((m, index) => {
        if (y > pageHeight - 15) {
          doc.addPage();
          y = 20;
          // Repeat header
          doc.setFillColor(241, 245, 249);
          doc.rect(15, y - 4, pageWidth - 30, 10, "F");
          doc.setFont("helvetica", "bold");
          doc.text("Data", 18, y + 2);
          doc.text("Cliente", 45, y + 2);
          doc.text("Squad", 90, y + 2);
          doc.text("De", 130, y + 2);
          doc.text("Para", 160, y + 2);
          y += 10;
          doc.setFont("helvetica", "normal");
        }

        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.rect(15, y - 4, pageWidth - 30, 8, "F");
        }

        doc.setTextColor(30, 41, 59);
        doc.text(format(new Date(m.changed_at), "dd/MM HH:mm"), 18, y + 1);
        doc.text(m.client_name.substring(0, 20), 45, y + 1);
        doc.text(m.squad_name.substring(0, 15), 90, y + 1);
        doc.text(m.old_status ? healthStatusLabels[m.old_status].substring(0, 12) : "-", 130, y + 1);
        doc.text(m.new_status ? healthStatusLabels[m.new_status].substring(0, 12) : "-", 160, y + 1);
        y += 8;
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
                Histórico de mudanças de status e motivos principais
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
            
            <div className="relative flex-1 min-w-[180px] max-w-[250px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente, squad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            
            <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="15d">Últimos 15 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedSquad} onValueChange={setSelectedSquad}>
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="Squad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os squads</SelectItem>
                {squadsData.map(squad => (
                  <SelectItem key={squad.id} value={squad.id}>{squad.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                {Object.entries(healthStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total de Mudanças</p>
              </div>
              <div className="p-4 rounded-lg bg-green-500/10 text-center">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <p className="text-3xl font-bold text-green-600">{stats.improvements}</p>
                </div>
                <p className="text-sm text-muted-foreground">Melhorias</p>
              </div>
              <div className="p-4 rounded-lg bg-red-500/10 text-center">
                <div className="flex items-center justify-center gap-1">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <p className="text-3xl font-bold text-red-600">{stats.deteriorations}</p>
                </div>
                <p className="text-sm text-muted-foreground">Pioras</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-3xl font-bold">{Object.keys(stats.categoryReasons).length}</p>
                <p className="text-sm text-muted-foreground">Motivos Diferentes</p>
              </div>
            </div>

            {/* Charts */}
            {stats.total > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="charts-container">
                <div>
                  <h4 className="font-semibold mb-3">Mudanças por Status</h4>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusChartData} layout="vertical">
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
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
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryChartData} layout="vertical">
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
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
                <h4 className="font-semibold">Últimas Movimentações</h4>
                <span className="text-sm text-muted-foreground">
                  {filteredMovements.length} resultados
                </span>
              </div>
              {filteredMovements.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma movimentação encontrada com os filtros selecionados
                </p>
              ) : (
                <div className="space-y-2 max-h-[350px] overflow-y-auto">
                  {filteredMovements.slice(0, 100).map((m) => (
                    <div 
                      key={m.id} 
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="text-xs text-muted-foreground w-20 flex-shrink-0">
                        {format(new Date(m.changed_at), "dd/MM HH:mm", { locale: ptBR })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{m.client_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{m.squad_name}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {m.old_status && <HealthScoreBadge status={m.old_status} size="sm" />}
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        {m.new_status && <HealthScoreBadge status={m.new_status} size="sm" />}
                      </div>
                      {m.new_categoria_problema && (
                        <span className="text-xs text-muted-foreground max-w-[150px] truncate hidden md:block">
                          {m.new_categoria_problema}
                        </span>
                      )}
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

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Handle hsl format
  if (hex.startsWith('hsl')) {
    // Return a default color for hsl values
    return { r: 100, g: 100, b: 100 };
  }
  
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

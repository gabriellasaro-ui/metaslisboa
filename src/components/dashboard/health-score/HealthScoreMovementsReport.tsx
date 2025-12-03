import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, subMonths, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Download, FileSpreadsheet, FileText, TrendingUp, TrendingDown, ArrowRight, Loader2 } from "lucide-react";
import { HealthScoreBadge, ExtendedHealthStatus, healthStatusLabels, getHealthScoreColor } from "./HealthScoreBadge";
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

type PeriodFilter = "7d" | "15d" | "30d" | "90d";

export const HealthScoreMovementsReport = ({ squadsData }: HealthScoreMovementsReportProps) => {
  const [period, setPeriod] = useState<PeriodFilter>("30d");

  const periodDays = {
    "7d": 7,
    "15d": 15,
    "30d": 30,
    "90d": 90,
  };

  const startDate = useMemo(() => {
    return startOfDay(subDays(new Date(), periodDays[period]));
  }, [period]);

  const { data: movements = [], isLoading } = useQuery({
    queryKey: ["health-score-movements", period],
    queryFn: async () => {
      const { data, error } = await supabase
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
        .gte("changed_at", startDate.toISOString())
        .order("changed_at", { ascending: false });

      if (error) throw error;

      // Get user names for changed_by
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

  // Statistics
  const stats = useMemo(() => {
    const statusChanges: Record<string, number> = {};
    const categoryReasons: Record<string, number> = {};
    const improvements = movements.filter(m => {
      if (!m.old_status || !m.new_status) return false;
      const order = ['churn', 'aviso_previo', 'danger_critico', 'danger', 'care', 'e_e', 'onboarding', 'safe'];
      return order.indexOf(m.new_status) > order.indexOf(m.old_status);
    }).length;
    const deteriorations = movements.filter(m => {
      if (!m.old_status || !m.new_status) return false;
      const order = ['churn', 'aviso_previo', 'danger_critico', 'danger', 'care', 'e_e', 'onboarding', 'safe'];
      return order.indexOf(m.new_status) < order.indexOf(m.old_status);
    }).length;

    movements.forEach(m => {
      if (m.new_status) {
        statusChanges[m.new_status] = (statusChanges[m.new_status] || 0) + 1;
      }
      if (m.new_categoria_problema) {
        categoryReasons[m.new_categoria_problema] = (categoryReasons[m.new_categoria_problema] || 0) + 1;
      }
    });

    return {
      total: movements.length,
      improvements,
      deteriorations,
      statusChanges,
      categoryReasons,
    };
  }, [movements]);

  // Chart data for status changes
  const statusChartData = useMemo(() => {
    return Object.entries(stats.statusChanges)
      .map(([status, count]) => ({
        name: healthStatusLabels[status as ExtendedHealthStatus] || status,
        value: count,
        color: getHealthScoreColor(status as ExtendedHealthStatus),
      }))
      .sort((a, b) => b.value - a.value);
  }, [stats.statusChanges]);

  // Chart data for categories
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

  const handleExportExcel = () => {
    try {
      const data = movements.map(m => ({
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

      // Summary sheet
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

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      // Title
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Relatório de Movimentações Health Score", pageWidth / 2, y, { align: "center" });
      y += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Período: últimos ${periodDays[period]} dias | Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, pageWidth / 2, y, { align: "center" });
      y += 15;

      // Summary
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Resumo", 20, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Total de Movimentações: ${stats.total}`, 20, y);
      y += 6;
      doc.text(`Melhorias: ${stats.improvements}`, 20, y);
      y += 6;
      doc.text(`Pioras: ${stats.deteriorations}`, 20, y);
      y += 12;

      // Top categories
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Principais Motivos", 20, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      categoryChartData.slice(0, 5).forEach(cat => {
        doc.text(`• ${cat.fullName}: ${cat.value} ocorrências`, 20, y);
        y += 5;
      });
      y += 8;

      // Recent movements
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Últimas Movimentações", 20, y);
      y += 8;

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      movements.slice(0, 20).forEach(m => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const date = format(new Date(m.changed_at), "dd/MM", { locale: ptBR });
        const oldLabel = m.old_status ? healthStatusLabels[m.old_status] : "N/A";
        const newLabel = m.new_status ? healthStatusLabels[m.new_status] : "N/A";
        doc.text(`${date} - ${m.client_name}: ${oldLabel} → ${newLabel}`, 20, y);
        y += 5;
      });

      doc.save(`movimentacoes-health-score-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar PDF");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Movimentações de Health Score</CardTitle>
            <CardDescription>
              Histórico de mudanças de status e motivos principais
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="15d">Últimos 15 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportExcel}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white border-0"
            >
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              Excel
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportPDF}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white border-0"
            >
              <FileText className="h-4 w-4 mr-1" />
              PDF
            </Button>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Changes Chart */}
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

                {/* Category Reasons Chart */}
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

            {/* Recent Movements List */}
            <div>
              <h4 className="font-semibold mb-3">Últimas Movimentações</h4>
              {movements.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma movimentação no período selecionado
                </p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {movements.slice(0, 50).map((m) => (
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

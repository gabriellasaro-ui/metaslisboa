import jsPDF from "jspdf";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MovementEntry {
  client_name: string;
  squad_name: string;
  old_status: string | null;
  new_status: string | null;
  changed_at: string;
  analysis: {
    type: string;
    label: string;
    description: string;
  };
  new_categoria_problema: string | null;
  notes: string | null;
}

interface ExportStats {
  total: number;
  improvements: number;
  deteriorations: number;
  criticalAlerts: number;
  needsAttention: number;
  statusChanges: Record<string, number>;
  categoryReasons: Record<string, number>;
}

interface SquadSummary {
  name: string;
  totalClients: number;
  avgScore: number;
  safeCount: number;
  careCount: number;
  dangerCount: number;
  criticalCount: number;
}

const healthStatusLabels: Record<string, string> = {
  safe: "Safe",
  care: "Care",
  danger: "Danger",
  danger_critico: "Danger Crítico",
  onboarding: "Onboarding",
  e_e: "E.E.",
  aviso_previo: "Aviso Prévio",
  churn: "Churn",
};

export const generateExecutiveHealthScorePDF = async (
  movements: MovementEntry[],
  stats: ExportStats,
  squadSummaries: SquadSummary[],
  periodLabel: string
): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = 0;

  // ===== COVER PAGE =====
  // Header - V4 Red
  doc.setFillColor(180, 40, 40);
  doc.rect(0, 0, pageWidth, 50, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Relatorio Executivo de Health Score", pageWidth / 2, 22, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Analise de Movimentacoes de Clientes", pageWidth / 2, 35, { align: "center" });

  doc.setFontSize(10);
  doc.text(periodLabel, pageWidth / 2, 45, { align: "center" });

  // Company/Date info
  y = 65;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} as ${format(new Date(), "HH:mm")}`, pageWidth / 2, y, { align: "center" });

  // ===== EXECUTIVE SUMMARY BOX =====
  y = 85;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 50, 4, 4, "F");
  doc.setDrawColor(180, 40, 40);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 50, 4, 4, "S");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(180, 40, 40);
  doc.text("RESUMO EXECUTIVO", margin + 10, y + 12);

  // Stats boxes
  const statsBoxWidth = 38;
  const statsStartX = margin + 10;
  const statsY = y + 20;

  // Total
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(statsStartX, statsY, statsBoxWidth, 22, 2, 2, "F");
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(stats.total.toString(), statsStartX + statsBoxWidth / 2, statsY + 10, { align: "center" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Total", statsStartX + statsBoxWidth / 2, statsY + 18, { align: "center" });

  // Improvements
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(statsStartX + 42, statsY, statsBoxWidth, 22, 2, 2, "F");
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 163, 74);
  doc.text(stats.improvements.toString(), statsStartX + 42 + statsBoxWidth / 2, statsY + 10, { align: "center" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Melhorias", statsStartX + 42 + statsBoxWidth / 2, statsY + 18, { align: "center" });

  // Deteriorations
  doc.setFillColor(255, 237, 213);
  doc.roundedRect(statsStartX + 84, statsY, statsBoxWidth, 22, 2, 2, "F");
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(180, 40, 40);
  doc.text(stats.deteriorations.toString(), statsStartX + 84 + statsBoxWidth / 2, statsY + 10, { align: "center" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Pioras", statsStartX + 84 + statsBoxWidth / 2, statsY + 18, { align: "center" });

  // Critical
  doc.setFillColor(254, 226, 226);
  doc.roundedRect(statsStartX + 126, statsY, statsBoxWidth, 22, 2, 2, "F");
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(180, 40, 40);
  doc.text(stats.criticalAlerts.toString(), statsStartX + 126 + statsBoxWidth / 2, statsY + 10, { align: "center" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Criticos", statsStartX + 126 + statsBoxWidth / 2, statsY + 18, { align: "center" });

  // ===== SQUAD RANKING SECTION =====
  y = 150;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(180, 40, 40);
  doc.text("RANKING DE SQUADS POR HEALTH SCORE", margin, y);

  y += 10;
  
  // Sort squads by score
  const sortedSquads = [...squadSummaries].sort((a, b) => b.avgScore - a.avgScore);
  
  sortedSquads.forEach((squad, index) => {
    if (y > pageHeight - 30) {
      doc.addPage();
      y = 20;
    }

    const rankColors = [
      { bg: [255, 251, 235], border: [251, 191, 36] }, // Gold
      { bg: [241, 245, 249], border: [148, 163, 184] }, // Silver
      { bg: [255, 247, 237], border: [251, 146, 60] }, // Bronze
    ];

    const colorSet = rankColors[index] || { bg: [248, 250, 252], border: [226, 232, 240] };
    
    doc.setFillColor(colorSet.bg[0], colorSet.bg[1], colorSet.bg[2]);
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 16, 2, 2, "F");
    
    // Rank number
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text(`${index + 1}`, margin + 6, y + 10);

    // Squad name
    doc.setTextColor(30, 41, 59);
    doc.text(squad.name, margin + 18, y + 10);

    // Score
    const scoreColor = squad.avgScore >= 70 ? [22, 163, 74] : squad.avgScore >= 50 ? [234, 88, 12] : [180, 40, 40];
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(`Pontuacao: ${squad.avgScore}`, margin + 80, y + 10);

    // Client count
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`${squad.totalClients} clientes`, margin + 125, y + 10);

    // Status summary
    doc.setFontSize(7);
    doc.text(`Safe: ${squad.safeCount} | Care: ${squad.careCount} | Danger: ${squad.dangerCount} | Critico: ${squad.criticalCount}`, pageWidth - margin - 5, y + 10, { align: "right" });

    y += 20;
  });

  // ===== MOVEMENTS DETAIL PAGE =====
  doc.addPage();
  y = 20;

  // Header - V4 Red
  doc.setFillColor(180, 40, 40);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("DETALHAMENTO DAS MOVIMENTACOES", margin, 18);

  y = 40;

  // Group movements by type
  const movementsByType = movements.reduce((acc, m) => {
    const key = m.analysis.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {} as Record<string, MovementEntry[]>);

  const typeConfig: Record<string, { title: string; color: number[]; icon: string }> = {
    critical_alert: { title: "ALERTAS CRITICOS", color: [180, 40, 40], icon: "" },
    deterioration: { title: "PIORAS DE STATUS", color: [180, 40, 40], icon: "" },
    improvement: { title: "MELHORIAS DE STATUS", color: [22, 163, 74], icon: "" },
    neutral: { title: "SEM ALTERACAO DE STATUS", color: [100, 116, 139], icon: "" },
    needs_attention: { title: "REQUER ATENCAO", color: [180, 40, 40], icon: "" },
  };

  // Critical alerts first (most important)
  const typeOrder = ['critical_alert', 'deterioration', 'improvement', 'neutral'];

  for (const type of typeOrder) {
    const entries = movementsByType[type];
    if (!entries || entries.length === 0) continue;

    const config = typeConfig[type];

    if (y > pageHeight - 40) {
      doc.addPage();
      y = 20;
    }

    // Section header
    doc.setFillColor(config.color[0], config.color[1], config.color[2]);
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 9, 2, 2, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${config.title} (${entries.length} registros)`, margin + 5, y + 6);
    
    y += 12;

    // Table header
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, pageWidth - 2 * margin, 7, "F");
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("Data", margin + 2, y + 5);
    doc.text("Cliente", margin + 22, y + 5);
    doc.text("Squad", margin + 72, y + 5);
    doc.text("De - Para", margin + 108, y + 5);
    doc.text("Categoria", margin + 155, y + 5);
    
    y += 9;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8);

    entries.slice(0, 20).forEach((m, index) => {
      if (y > pageHeight - 15) {
        doc.addPage();
        y = 20;
        
        // Repeat header
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, pageWidth - 2 * margin, 7, "F");
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text("Data", margin + 2, y + 5);
        doc.text("Cliente", margin + 22, y + 5);
        doc.text("Squad", margin + 72, y + 5);
        doc.text("De - Para", margin + 108, y + 5);
        doc.text("Categoria", margin + 155, y + 5);
        y += 9;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(7);
      }

      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(252, 252, 253);
        doc.rect(margin, y - 3, pageWidth - 2 * margin, 9, "F");
      }

      const date = format(new Date(m.changed_at), "dd/MM/yy", { locale: ptBR });
      const oldLabel = m.old_status ? (healthStatusLabels[m.old_status] || m.old_status) : "Novo";
      const newLabel = m.new_status ? (healthStatusLabels[m.new_status] || m.new_status) : "Novo";
      
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(date, margin + 2, y + 4);
      
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.text(m.client_name.substring(0, 25), margin + 22, y + 4);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(m.squad_name.substring(0, 18), margin + 72, y + 4);
      
      doc.setTextColor(30, 41, 59);
      doc.text(`${oldLabel} para ${newLabel}`, margin + 108, y + 4);
      
      doc.setTextColor(100, 116, 139);
      doc.text((m.new_categoria_problema || "Nao informada").substring(0, 22), margin + 155, y + 4);
      
      y += 9;
    });

    if (entries.length > 20) {
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      doc.setFont("helvetica", "italic");
      doc.text(`Mais ${entries.length - 20} registros nesta categoria`, margin + 5, y + 3);
      y += 8;
    }

    y += 10;
  }

  // ===== CATEGORIES ANALYSIS PAGE =====
  if (Object.keys(stats.categoryReasons).length > 0) {
    doc.addPage();
    y = 20;

    // Header - V4 Red
    doc.setFillColor(180, 40, 40);
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("ANALISE POR CATEGORIA DE PROBLEMA", margin, 18);

    y = 40;

    const sortedCategories = Object.entries(stats.categoryReasons)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const maxValue = Math.max(...sortedCategories.map(([, v]) => v));

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 40, 40);
    doc.text("PRINCIPAIS MOTIVOS DE ALTERACAO", margin, y);
    y += 12;

    sortedCategories.forEach(([category, count], index) => {
      const barWidth = (count / maxValue) * 100;
      
      // Category name
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      doc.text(`${index + 1}. ${category}`, margin, y + 4);
      
      // Bar
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin + 75, y, 80, 6, 1, 1, "F");
      
      // All bars in V4 red
      doc.setFillColor(180, 40, 40);
      doc.roundedRect(margin + 75, y, barWidth * 0.8, 6, 1, 1, "F");
      
      // Count
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`${count} ocorrencias`, margin + 160, y + 4);
      
      y += 12;
    });
  }

  // ===== FOOTER ON ALL PAGES =====
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: "center" });
    doc.text("Documento Confidencial - V4 Company", margin, pageHeight - 8);
    doc.text(format(new Date(), "dd/MM/yyyy"), pageWidth - margin, pageHeight - 8, { align: "right" });
  }

  doc.save(`relatorio-executivo-health-score-${format(new Date(), "yyyy-MM-dd")}.pdf`);
};

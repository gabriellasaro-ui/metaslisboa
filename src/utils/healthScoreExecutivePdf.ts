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
  // Header gradient effect
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 80, "F");
  
  // Red accent line
  doc.setFillColor(220, 38, 38);
  doc.rect(0, 80, pageWidth, 4, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório Executivo", pageWidth / 2, 35, { align: "center" });
  
  doc.setFontSize(18);
  doc.setFont("helvetica", "normal");
  doc.text("Health Score - Analise de Movimentacoes", pageWidth / 2, 50, { align: "center" });

  doc.setFontSize(12);
  doc.text(periodLabel, pageWidth / 2, 65, { align: "center" });

  // Company/Date info
  y = 100;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, pageWidth / 2, y, { align: "center" });

  // ===== EXECUTIVE SUMMARY BOX =====
  y = 130;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 55, 4, 4, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 55, 4, 4, "S");

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("RESUMO EXECUTIVO", margin + 10, y + 15);

  // Stats boxes
  const statsBoxWidth = 40;
  const statsStartX = margin + 10;
  const statsY = y + 25;

  // Total
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(statsStartX, statsY, statsBoxWidth, 22, 2, 2, "F");
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(stats.total.toString(), statsStartX + statsBoxWidth / 2, statsY + 12, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Movimentacoes", statsStartX + statsBoxWidth / 2, statsY + 19, { align: "center" });

  // Improvements
  doc.setFillColor(220, 252, 231);
  doc.roundedRect(statsStartX + 45, statsY, statsBoxWidth, 22, 2, 2, "F");
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 163, 74);
  doc.text(stats.improvements.toString(), statsStartX + 45 + statsBoxWidth / 2, statsY + 12, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Melhorias", statsStartX + 45 + statsBoxWidth / 2, statsY + 19, { align: "center" });

  // Deteriorations
  doc.setFillColor(255, 237, 213);
  doc.roundedRect(statsStartX + 90, statsY, statsBoxWidth, 22, 2, 2, "F");
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(234, 88, 12);
  doc.text(stats.deteriorations.toString(), statsStartX + 90 + statsBoxWidth / 2, statsY + 12, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Pioras", statsStartX + 90 + statsBoxWidth / 2, statsY + 19, { align: "center" });

  // Critical
  doc.setFillColor(254, 226, 226);
  doc.roundedRect(statsStartX + 135, statsY, statsBoxWidth, 22, 2, 2, "F");
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(220, 38, 38);
  doc.text(stats.criticalAlerts.toString(), statsStartX + 135 + statsBoxWidth / 2, statsY + 12, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Alertas Criticos", statsStartX + 135 + statsBoxWidth / 2, statsY + 19, { align: "center" });

  // ===== SQUAD RANKING SECTION =====
  y = 200;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("RANKING DE SQUADS", margin, y);

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
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 18, 2, 2, "F");
    
    // Rank number
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text(`${index + 1}º`, margin + 8, y + 11);

    // Squad name
    doc.setTextColor(30, 41, 59);
    doc.text(squad.name, margin + 25, y + 11);

    // Score
    const scoreColor = squad.avgScore >= 70 ? [22, 163, 74] : squad.avgScore >= 50 ? [234, 88, 12] : [220, 38, 38];
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(`Score: ${squad.avgScore}`, margin + 90, y + 11);

    // Client count
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`${squad.totalClients} clientes`, margin + 130, y + 11);

    // Status summary
    doc.setFontSize(8);
    doc.text(`Safe: ${squad.safeCount} | Care: ${squad.careCount} | Danger: ${squad.dangerCount} | Crítico: ${squad.criticalCount}`, pageWidth - margin - 5, y + 11, { align: "right" });

    y += 22;
  });

  // ===== MOVEMENTS DETAIL PAGE =====
  doc.addPage();
  y = 20;

  // Header
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setFillColor(220, 38, 38);
  doc.rect(0, 35, pageWidth, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("DETALHAMENTO DAS MOVIMENTACOES", margin, 22);

  y = 50;

  // Group movements by type
  const movementsByType = movements.reduce((acc, m) => {
    const key = m.analysis.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {} as Record<string, MovementEntry[]>);

const typeConfig: Record<string, { title: string; color: number[]; icon: string }> = {
    critical_alert: { title: "ALERTAS CRITICOS", color: [220, 38, 38], icon: "!" },
    deterioration: { title: "PIORAS", color: [220, 38, 38], icon: "" },
    improvement: { title: "MELHORIAS", color: [22, 163, 74], icon: "" },
    neutral: { title: "SEM ALTERACAO", color: [100, 116, 139], icon: "" },
    needs_attention: { title: "REQUER ATENCAO", color: [234, 88, 12], icon: "" },
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
    doc.roundedRect(margin, y, pageWidth - 2 * margin, 10, 2, 2, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`${config.title} (${entries.length})`, margin + 5, y + 7);
    
    y += 15;

    // Table header
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, pageWidth - 2 * margin, 8, "F");
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("DATA", margin + 2, y + 5);
    doc.text("CLIENTE", margin + 22, y + 5);
    doc.text("SQUAD", margin + 70, y + 5);
    doc.text("TRANSICAO", margin + 105, y + 5);
    doc.text("CATEGORIA", margin + 148, y + 5);
    
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(8);

    entries.slice(0, 15).forEach((m, index) => {
      if (y > pageHeight - 15) {
        doc.addPage();
        y = 20;
        
        // Repeat header
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, pageWidth - 2 * margin, 8, "F");
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text("DATA", margin + 2, y + 5);
        doc.text("CLIENTE", margin + 22, y + 5);
        doc.text("SQUAD", margin + 70, y + 5);
        doc.text("TRANSICAO", margin + 105, y + 5);
        doc.text("CATEGORIA", margin + 148, y + 5);
        y += 10;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(8);
      }

      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(252, 252, 253);
        doc.rect(margin, y - 3, pageWidth - 2 * margin, 10, "F");
      }

      const date = format(new Date(m.changed_at), "dd/MM HH:mm", { locale: ptBR });
      const oldLabel = m.old_status ? (healthStatusLabels[m.old_status] || m.old_status) : "N/A";
      const newLabel = m.new_status ? (healthStatusLabels[m.new_status] || m.new_status) : "N/A";
      
      doc.setTextColor(100, 116, 139);
      doc.text(date, margin + 2, y + 4);
      
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.text(m.client_name.substring(0, 22), margin + 22, y + 4);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(m.squad_name.substring(0, 15), margin + 70, y + 4);
      
      doc.setTextColor(30, 41, 59);
      doc.text(`${oldLabel.substring(0, 10)} > ${newLabel.substring(0, 10)}`, margin + 105, y + 4);
      
      doc.setTextColor(100, 116, 139);
      doc.text((m.new_categoria_problema || "-").substring(0, 20), margin + 150, y + 4);
      
      y += 10;
    });

    if (entries.length > 15) {
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text(`... e mais ${entries.length - 15} registros`, margin + 5, y + 3);
      y += 8;
    }

    y += 10;
  }

  // ===== CATEGORIES ANALYSIS PAGE =====
  if (Object.keys(stats.categoryReasons).length > 0) {
    doc.addPage();
    y = 20;

    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageWidth, 35, "F");
    doc.setFillColor(220, 38, 38);
    doc.rect(0, 35, pageWidth, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("ANALISE POR CATEGORIA DE PROBLEMA", margin, 22);

    y = 50;

    const sortedCategories = Object.entries(stats.categoryReasons)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const maxValue = Math.max(...sortedCategories.map(([, v]) => v));

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("TOP 10 MOTIVOS DE MUDANCA", margin, y);
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
      doc.roundedRect(margin + 80, y, 80, 6, 1, 1, "F");
      
      const barColor = index < 3 ? [220, 38, 38] : [180, 60, 60];
      doc.setFillColor(barColor[0], barColor[1], barColor[2]);
      doc.roundedRect(margin + 80, y, barWidth * 0.8, 6, 1, 1, "F");
      
      // Count
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(count.toString(), margin + 165, y + 4);
      
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

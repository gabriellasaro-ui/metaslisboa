import jsPDF from "jspdf";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CheckIn {
  created_at: string;
  progress: number;
  status: string;
  comment: string;
}

interface ReportData {
  clientName: string;
  squadName: string;
  checkIns: CheckIn[];
  currentStatus: string;
  averageProgress: number;
  latestProgress: number;
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case "on_track": return "No Caminho";
    case "at_risk": return "Em Risco";
    case "delayed": return "Atrasado";
    case "completed": return "Concluído";
    default: return status;
  }
};

const generateRecommendations = (data: ReportData): string[] => {
  const recommendations: string[] = [];
  const { checkIns, averageProgress, latestProgress } = data;

  // Análise de progresso
  if (latestProgress >= 80) {
    recommendations.push("✓ Excelente progresso! Cliente está próximo de atingir a meta.");
  } else if (latestProgress >= 50) {
    recommendations.push("↗ Progresso satisfatório. Manter o acompanhamento regular.");
  } else if (latestProgress >= 30) {
    recommendations.push("⚠ Progresso moderado. Considerar intensificar o suporte.");
  } else {
    recommendations.push("⚡ Atenção necessária! Agendar reunião para entender bloqueios.");
  }

  // Análise de tendência
  if (checkIns.length >= 2) {
    const lastTwo = checkIns.slice(-2);
    const trend = lastTwo[1].progress - lastTwo[0].progress;
    
    if (trend > 10) {
      recommendations.push("📈 Tendência positiva detectada. Cliente está acelerando.");
    } else if (trend < -10) {
      recommendations.push("📉 Tendência negativa. Investigar causas da desaceleração.");
    }
  }

  // Análise de status recorrente
  const recentStatuses = checkIns.slice(-3).map(c => c.status);
  const delayedCount = recentStatuses.filter(s => s === "delayed").length;
  const atRiskCount = recentStatuses.filter(s => s === "at_risk").length;

  if (delayedCount >= 2) {
    recommendations.push("🔴 Status 'Atrasado' recorrente. Ação urgente recomendada.");
  } else if (atRiskCount >= 2) {
    recommendations.push("🟡 Status 'Em Risco' recorrente. Monitorar de perto.");
  }

  // Análise de frequência
  if (checkIns.length < 4) {
    recommendations.push("📅 Poucos check-ins registrados. Aumentar frequência de acompanhamento.");
  }

  // Recomendação baseada na média
  if (averageProgress < latestProgress) {
    recommendations.push("🎯 Desempenho atual acima da média histórica. Manter estratégia.");
  } else if (averageProgress > latestProgress + 15) {
    recommendations.push("⚠ Desempenho atual abaixo da média. Revisar plano de ação.");
  }

  return recommendations;
};

export const generateClientReportPDF = async (data: ReportData) => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPos = 20;

  // Header
  pdf.setFillColor(79, 70, 229); // primary color
  pdf.rect(0, 0, pageWidth, 25, "F");
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text("Relatório Individual de Progresso", pageWidth / 2, 12, { align: "center" });
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }), pageWidth / 2, 19, { align: "center" });

  yPos = 35;

  // Client Info
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Informações do Cliente", 15, yPos);
  yPos += 8;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Cliente: ${data.clientName}`, 15, yPos);
  yPos += 6;
  pdf.text(`Squad: ${data.squadName}`, 15, yPos);
  yPos += 6;
  pdf.text(`Total de Check-ins: ${data.checkIns.length}`, 15, yPos);
  yPos += 10;

  // Metrics Summary
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("Métricas de Desempenho", 15, yPos);
  yPos += 8;

  // Metrics boxes
  const boxWidth = 55;
  const boxHeight = 18;
  const spacing = 5;

  // Box 1 - Average Progress
  pdf.setFillColor(240, 240, 255);
  pdf.roundedRect(15, yPos, boxWidth, boxHeight, 2, 2, "F");
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text("Progresso Médio", 17, yPos + 5);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(79, 70, 229);
  pdf.text(`${data.averageProgress}%`, 17, yPos + 13);

  // Box 2 - Latest Progress
  pdf.setFillColor(240, 255, 240);
  pdf.roundedRect(15 + boxWidth + spacing, yPos, boxWidth, boxHeight, 2, 2, "F");
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 100, 100);
  pdf.text("Progresso Atual", 17 + boxWidth + spacing, yPos + 5);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(34, 139, 34);
  pdf.text(`${data.latestProgress}%`, 17 + boxWidth + spacing, yPos + 13);

  // Box 3 - Current Status
  pdf.setFillColor(255, 250, 240);
  pdf.roundedRect(15 + (boxWidth + spacing) * 2, yPos, boxWidth, boxHeight, 2, 2, "F");
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 100, 100);
  pdf.text("Status Atual", 17 + (boxWidth + spacing) * 2, yPos + 5);
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(200, 100, 0);
  pdf.text(getStatusLabel(data.currentStatus), 17 + (boxWidth + spacing) * 2, yPos + 13);

  yPos += boxHeight + 12;

  // Check-ins History
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("Histórico de Check-ins", 15, yPos);
  yPos += 8;

  // Table header
  pdf.setFillColor(240, 240, 240);
  pdf.rect(15, yPos, pageWidth - 30, 8, "F");
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text("Data", 17, yPos + 5);
  pdf.text("Progresso", 45, yPos + 5);
  pdf.text("Status", 75, yPos + 5);
  pdf.text("Comentário", 110, yPos + 5);
  yPos += 8;

  // Table rows
  pdf.setFont("helvetica", "normal");
  const maxRows = Math.min(data.checkIns.length, 15); // Limitar para caber na página
  
  for (let i = 0; i < maxRows; i++) {
    const checkIn = data.checkIns[i];
    
    if (yPos > pageHeight - 60) {
      pdf.addPage();
      yPos = 20;
    }

    const rowColor = i % 2 === 0 ? 255 : 250;
    pdf.setFillColor(rowColor, rowColor, rowColor);
    pdf.rect(15, yPos, pageWidth - 30, 7, "F");

    pdf.setFontSize(8);
    pdf.text(format(new Date(checkIn.created_at), "dd/MM/yyyy", { locale: ptBR }), 17, yPos + 5);
    pdf.text(`${checkIn.progress}%`, 45, yPos + 5);
    pdf.text(getStatusLabel(checkIn.status), 75, yPos + 5);
    
    const comment = checkIn.comment.length > 35 ? checkIn.comment.substring(0, 32) + "..." : checkIn.comment;
    pdf.text(comment, 110, yPos + 5);
    
    yPos += 7;
  }

  if (data.checkIns.length > maxRows) {
    yPos += 3;
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`... e mais ${data.checkIns.length - maxRows} check-ins`, 17, yPos);
    yPos += 5;
  }

  yPos += 10;

  // Recommendations
  if (yPos > pageHeight - 80) {
    pdf.addPage();
    yPos = 20;
  }

  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("Recomendações e Insights", 15, yPos);
  yPos += 8;

  const recommendations = generateRecommendations(data);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");

  recommendations.forEach((rec, index) => {
    if (yPos > pageHeight - 20) {
      pdf.addPage();
      yPos = 20;
    }

    const lines = pdf.splitTextToSize(rec, pageWidth - 35);
    lines.forEach((line: string) => {
      pdf.text(line, 20, yPos);
      yPos += 6;
    });
    yPos += 2;
  });

  // Footer
  const footerY = pageHeight - 15;
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text("Gerado automaticamente pelo Sistema de Gestão de Clientes", pageWidth / 2, footerY, { align: "center" });
  pdf.text(`Página 1 de ${pdf.getNumberOfPages()}`, pageWidth / 2, footerY + 5, { align: "center" });

  // Save PDF
  const fileName = `relatorio_${data.clientName.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  pdf.save(fileName);
};

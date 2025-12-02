import jsPDF from "jspdf";
import { Squad } from "@/types";

interface ClientHealthData {
  name: string;
  squadName: string;
  healthStatus: string;
  problemaCentral: string | null;
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

const getStatusColor = (status: string): [number, number, number] => {
  switch (status) {
    case "safe":
      return [34, 197, 94]; // green
    case "care":
      return [245, 158, 11]; // amber
    case "danger":
      return [239, 68, 68]; // red
    case "danger_critico":
      return [185, 28, 28]; // dark red
    case "onboarding":
      return [139, 92, 246]; // violet
    case "e_e":
      return [234, 88, 12]; // orange
    case "aviso_previo":
      return [100, 116, 139]; // slate
    case "churn":
      return [63, 63, 70]; // zinc
    default:
      return [100, 116, 139];
  }
};

export const generateHealthScorePDF = async (squadsData: Squad[]): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Header
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 45, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Health Score", margin, 25);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, margin, 37);

  yPosition = 60;
  doc.setTextColor(30, 41, 59);

  // Collect all clients
  const allClients: ClientHealthData[] = squadsData.flatMap(squad =>
    squad.clients.map(client => ({
      name: client.name,
      squadName: squad.name,
      healthStatus: client.healthStatus || "safe",
      problemaCentral: client.problema_central || null,
    }))
  );

  // Statistics by status
  const statusCounts: Record<string, number> = {};
  allClients.forEach(client => {
    const status = client.healthStatus || "safe";
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  // Summary Section
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo Geral", margin, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Total de Clientes: ${allClients.length}`, margin, yPosition);
  yPosition += 7;
  doc.text(`Total de Squads: ${squadsData.length}`, margin, yPosition);
  yPosition += 12;

  // Status distribution
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Distribuição por Status", margin, yPosition);
  yPosition += 10;

  const statusOrder = ["safe", "care", "danger", "danger_critico", "onboarding", "e_e", "aviso_previo", "churn"];
  
  statusOrder.forEach(status => {
    const count = statusCounts[status] || 0;
    if (count > 0 || status === "safe" || status === "care" || status === "danger") {
      const color = getStatusColor(status);
      doc.setFillColor(color[0], color[1], color[2]);
      doc.circle(margin + 3, yPosition - 2, 3, "F");
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      const percentage = allClients.length > 0 ? ((count / allClients.length) * 100).toFixed(1) : "0";
      doc.text(`${healthStatusLabels[status]}: ${count} clientes (${percentage}%)`, margin + 10, yPosition);
      yPosition += 7;
    }
  });

  yPosition += 10;

  // Per Squad breakdown
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Status por Squad", margin, yPosition);
  yPosition += 10;

  squadsData.forEach(squad => {
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(squad.name, margin, yPosition);
    yPosition += 7;

    const squadCounts: Record<string, number> = {};
    squad.clients.forEach(client => {
      const status = client.healthStatus || "safe";
      squadCounts[status] = (squadCounts[status] || 0) + 1;
    });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    const statuses = statusOrder.filter(s => squadCounts[s] > 0);
    const statusText = statuses.map(s => `${healthStatusLabels[s]}: ${squadCounts[s]}`).join(" | ");
    doc.text(statusText || "Nenhum cliente", margin + 5, yPosition);
    yPosition += 10;
  });

  // Client list
  doc.addPage();
  yPosition = margin;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Lista Completa de Clientes", margin, yPosition);
  yPosition += 12;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 10, "F");
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("Cliente", margin + 2, yPosition);
  doc.text("Squad", margin + 55, yPosition);
  doc.text("Status", margin + 105, yPosition);
  doc.text("Problema Central", margin + 135, yPosition);
  yPosition += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  // Sort clients by status severity
  const statusPriority: Record<string, number> = {
    danger_critico: 0,
    danger: 1,
    churn: 2,
    aviso_previo: 3,
    care: 4,
    e_e: 5,
    onboarding: 6,
    safe: 7,
  };

  const sortedClients = [...allClients].sort((a, b) => {
    const priorityA = statusPriority[a.healthStatus] ?? 99;
    const priorityB = statusPriority[b.healthStatus] ?? 99;
    return priorityA - priorityB;
  });

  sortedClients.forEach((client, index) => {
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = margin;
      
      // Repeat header
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 10, "F");
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Cliente", margin + 2, yPosition);
      doc.text("Squad", margin + 55, yPosition);
      doc.text("Status", margin + 105, yPosition);
      doc.text("Problema Central", margin + 135, yPosition);
      yPosition += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
    }

    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, yPosition - 4, pageWidth - 2 * margin, 7, "F");
    }

    doc.setTextColor(30, 41, 59);
    doc.text(client.name.substring(0, 25), margin + 2, yPosition);
    doc.text(client.squadName.substring(0, 20), margin + 55, yPosition);
    
    const statusColor = getStatusColor(client.healthStatus);
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(healthStatusLabels[client.healthStatus] || client.healthStatus, margin + 105, yPosition);
    
    doc.setTextColor(100, 116, 139);
    const problema = client.problemaCentral?.substring(0, 25) || "-";
    doc.text(problema, margin + 135, yPosition);
    
    yPosition += 7;
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  doc.save(`health-score-report-${new Date().toISOString().split("T")[0]}.pdf`);
};

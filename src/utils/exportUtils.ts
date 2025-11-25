import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Squad, Client } from '@/data/clientsData';

export const exportToExcel = (squadsData: Squad[]) => {
  const workbook = XLSX.utils.book_new();

  // Criar planilha consolidada
  const consolidatedData = squadsData.flatMap(squad =>
    squad.clients.map(client => ({
      'Squad': squad.name,
      'Líder': squad.leader || '-',
      'Cliente': client.name,
      'Status da Meta': client.hasGoal === 'SIM' ? 'Com Meta' : client.hasGoal === 'NAO_DEFINIDO' ? 'A Definir' : 'Sem Meta',
      'Tipo de Meta': client.goalType || '-',
      'Valor da Meta': client.goalValue || '-',
      'Observações': client.notes || '-',
    }))
  );

  const consolidatedSheet = XLSX.utils.json_to_sheet(consolidatedData);
  XLSX.utils.book_append_sheet(workbook, consolidatedSheet, 'Consolidado');

  // Criar planilha para cada squad
  squadsData.forEach(squad => {
    const squadData = squad.clients.map(client => ({
      'Cliente': client.name,
      'Status da Meta': client.hasGoal === 'SIM' ? 'Com Meta' : client.hasGoal === 'NAO_DEFINIDO' ? 'A Definir' : 'Sem Meta',
      'Tipo de Meta': client.goalType || '-',
      'Valor da Meta': client.goalValue || '-',
      'Observações': client.notes || '-',
    }));

    const sheet = XLSX.utils.json_to_sheet(squadData);
    XLSX.utils.book_append_sheet(workbook, sheet, squad.name);
  });

  // Criar planilha de estatísticas
  const statsData = squadsData.map(squad => {
    const withGoals = squad.clients.filter(c => c.hasGoal === 'SIM').length;
    const pending = squad.clients.filter(c => c.hasGoal === 'NAO_DEFINIDO').length;
    const withoutGoals = squad.clients.filter(c => c.hasGoal === 'NAO').length;
    const total = squad.clients.length;
    const coverage = total > 0 ? ((withGoals / total) * 100).toFixed(1) : '0';

    return {
      'Squad': squad.name,
      'Líder': squad.leader || '-',
      'Total de Clientes': total,
      'Com Meta': withGoals,
      'A Definir': pending,
      'Sem Meta': withoutGoals,
      'Cobertura (%)': coverage,
    };
  });

  const statsSheet = XLSX.utils.json_to_sheet(statsData);
  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Estatísticas');

  // Salvar arquivo
  const fileName = `Dashboard_Metas_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

export const exportToPDF = async (squadsData: Squad[]) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Título
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Dashboard de Controle de Clientes', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;

  // Estatísticas gerais
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Estatísticas Gerais', 15, yPosition);
  yPosition += 8;

  const totalClients = squadsData.reduce((sum, squad) => sum + squad.clients.length, 0);
  const withGoals = squadsData.reduce((sum, squad) => 
    sum + squad.clients.filter(c => c.hasGoal === 'SIM').length, 0);
  const pending = squadsData.reduce((sum, squad) => 
    sum + squad.clients.filter(c => c.hasGoal === 'NAO_DEFINIDO').length, 0);
  const withoutGoals = squadsData.reduce((sum, squad) => 
    sum + squad.clients.filter(c => c.hasGoal === 'NAO').length, 0);

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Total de Clientes: ${totalClients}`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Com Metas Definidas: ${withGoals} (${((withGoals/totalClients)*100).toFixed(1)}%)`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Metas A Definir: ${pending} (${((pending/totalClients)*100).toFixed(1)}%)`, 20, yPosition);
  yPosition += 6;
  pdf.text(`Sem Metas: ${withoutGoals} (${((withoutGoals/totalClients)*100).toFixed(1)}%)`, 20, yPosition);
  yPosition += 15;

  // Estatísticas por Squad
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Estatísticas por Squad', 15, yPosition);
  yPosition += 8;

  squadsData.forEach(squad => {
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 20;
    }

    const squadWithGoals = squad.clients.filter(c => c.hasGoal === 'SIM').length;
    const squadPending = squad.clients.filter(c => c.hasGoal === 'NAO_DEFINIDO').length;
    const squadWithoutGoals = squad.clients.filter(c => c.hasGoal === 'NAO').length;
    const squadTotal = squad.clients.length;
    const coverage = squadTotal > 0 ? ((squadWithGoals / squadTotal) * 100).toFixed(1) : '0';

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${squad.name}`, 20, yPosition);
    yPosition += 6;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    if (squad.leader) {
      pdf.text(`Líder: ${squad.leader}`, 20, yPosition);
      yPosition += 5;
    }
    pdf.text(`Total: ${squadTotal} | Com Meta: ${squadWithGoals} | A Definir: ${squadPending} | Sem Meta: ${squadWithoutGoals}`, 20, yPosition);
    yPosition += 5;
    pdf.text(`Cobertura de Metas: ${coverage}%`, 20, yPosition);
    yPosition += 10;
  });

  // Capturar gráficos se existirem
  yPosition += 10;
  if (yPosition > pageHeight - 40) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Gráficos e Visualizações', 15, yPosition);
  yPosition += 8;

  // Tentar capturar os gráficos da página
  const chartElements = document.querySelectorAll('.recharts-wrapper');
  for (let i = 0; i < Math.min(chartElements.length, 3); i++) {
    try {
      const canvas = await html2canvas(chartElements[i] as HTMLElement, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      
      if (yPosition > pageHeight - 120) {
        pdf.addPage();
        yPosition = 20;
      }

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 30;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10;
    } catch (error) {
      console.error('Erro ao capturar gráfico:', error);
    }
  }

  // Salvar PDF
  const fileName = `Dashboard_Metas_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};

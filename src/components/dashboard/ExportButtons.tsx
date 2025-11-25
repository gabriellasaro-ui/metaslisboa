import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Table } from "lucide-react";
import { Squad, Client } from "@/data/clientsData";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";
import * as XLSX from 'xlsx';
import { toast } from "sonner";

interface ExportButtonsProps {
  squadsData: Squad[];
  filteredClients?: Array<Client & { squadName: string; leader: string }>;
  mode?: "full" | "filtered";
}

export const ExportButtons = ({ squadsData, filteredClients, mode = "full" }: ExportButtonsProps) => {
  const handleExportExcel = () => {
    try {
      exportToExcel(squadsData);
      toast.success("Exportado para Excel com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar para Excel:", error);
      toast.error("Erro ao exportar para Excel");
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF(squadsData);
      toast.success("Exportado para PDF com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar para PDF:", error);
      toast.error("Erro ao exportar para PDF");
    }
  };

  const handleExportFilteredCSV = () => {
    if (!filteredClients || filteredClients.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }

    try {
      const csvData = filteredClients.map(client => ({
        'Cliente': client.name,
        'Squad': client.squadName,
        'Líder': client.leader,
        'Status': client.hasGoal === 'SIM' ? 'Com Meta' : client.hasGoal === 'NAO_DEFINIDO' ? 'A Definir' : 'Sem Meta',
        'Tipo': client.goalType || '-',
        'Meta': client.goalValue || '-',
        'Progresso': client.hasGoal === 'SIM' ? `${client.currentProgress || 0}%` : '-',
        'Observações': client.notes || '-',
      }));

      const worksheet = XLSX.utils.json_to_sheet(csvData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes Filtrados');

      const fileName = `Clientes_Filtrados_${new Date().toISOString().split('T')[0]}.csv`;
      XLSX.writeFile(workbook, fileName, { bookType: 'csv' });
      
      toast.success(`${filteredClients.length} clientes exportados para CSV!`);
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
      toast.error("Erro ao exportar para CSV");
    }
  };

  const handleExportFilteredExcel = () => {
    if (!filteredClients || filteredClients.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }

    try {
      const excelData = filteredClients.map(client => ({
        'Cliente': client.name,
        'Squad': client.squadName,
        'Líder': client.leader,
        'Status da Meta': client.hasGoal === 'SIM' ? 'Com Meta' : client.hasGoal === 'NAO_DEFINIDO' ? 'A Definir' : 'Sem Meta',
        'Tipo de Meta': client.goalType || '-',
        'Valor da Meta': client.goalValue || '-',
        'Progresso (%)': client.hasGoal === 'SIM' ? (client.currentProgress || 0) : '-',
        'Observações': client.notes || '-',
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      
      // Ajustar largura das colunas
      const colWidths = [
        { wch: 25 }, // Cliente
        { wch: 15 }, // Squad
        { wch: 20 }, // Líder
        { wch: 15 }, // Status
        { wch: 15 }, // Tipo
        { wch: 30 }, // Meta
        { wch: 12 }, // Progresso
        { wch: 40 }, // Observações
      ];
      worksheet['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes Filtrados');

      const fileName = `Clientes_Filtrados_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast.success(`${filteredClients.length} clientes exportados para Excel!`);
    } catch (error) {
      console.error("Erro ao exportar Excel:", error);
      toast.error("Erro ao exportar para Excel");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 group"
        >
          <Download className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
          Exportar Dados
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 animate-zoom-in">
        <DropdownMenuLabel>Exportar Dashboard Completo</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleExportExcel} className="cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />
          Exportar Excel (Completo)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
          <FileText className="h-4 w-4 mr-2 text-red-600" />
          Exportar PDF (Completo)
        </DropdownMenuItem>

        {mode === "filtered" && filteredClients && filteredClients.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>
              Exportar Filtrados ({filteredClients.length})
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={handleExportFilteredCSV} className="cursor-pointer">
              <Table className="h-4 w-4 mr-2 text-blue-600" />
              Exportar CSV (Filtrados)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportFilteredExcel} className="cursor-pointer">
              <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />
              Exportar Excel (Filtrados)
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

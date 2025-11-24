import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GoalStatus, GoalType } from "@/data/clientsData";
import { Filter } from "lucide-react";

interface FilterBarProps {
  statusFilter: "all" | GoalStatus;
  goalTypeFilter: "all" | GoalType;
  onStatusFilterChange: (value: "all" | GoalStatus) => void;
  onGoalTypeFilterChange: (value: "all" | GoalType) => void;
}

export const FilterBar = ({ 
  statusFilter, 
  goalTypeFilter, 
  onStatusFilterChange, 
  onGoalTypeFilterChange 
}: FilterBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>Filtros:</span>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="SIM">🟢 Com Meta</SelectItem>
            <SelectItem value="NAO_DEFINIDO">🟡 A Definir</SelectItem>
            <SelectItem value="NAO">🔴 Sem Meta</SelectItem>
          </SelectContent>
        </Select>

        <Select value={goalTypeFilter} onValueChange={onGoalTypeFilterChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Tipo de Meta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="Faturamento">Faturamento</SelectItem>
            <SelectItem value="Leads">Leads</SelectItem>
            <SelectItem value="OUTROS">Outros</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

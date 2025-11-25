import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, X, SortAsc, SortDesc } from "lucide-react";
import { GoalStatus, GoalType } from "@/types";

export type SortField = "name" | "status" | "progress" | "goalType";
export type SortOrder = "asc" | "desc";

interface AdvancedFiltersProps {
  statusFilter: "all" | GoalStatus;
  goalTypeFilter: "all" | GoalType;
  leaderFilter: "all" | string;
  squadFilter: "all" | string;
  sortField: SortField;
  sortOrder: SortOrder;
  onStatusFilterChange: (value: "all" | GoalStatus) => void;
  onGoalTypeFilterChange: (value: "all" | GoalType) => void;
  onLeaderFilterChange: (value: "all" | string) => void;
  onSquadFilterChange: (value: "all" | string) => void;
  onSortFieldChange: (value: SortField) => void;
  onSortOrderChange: (value: SortOrder) => void;
  onClearFilters: () => void;
  leaders: string[];
  squads: string[];
}

export const AdvancedFilters = ({
  statusFilter,
  goalTypeFilter,
  leaderFilter,
  squadFilter,
  sortField,
  sortOrder,
  onStatusFilterChange,
  onGoalTypeFilterChange,
  onLeaderFilterChange,
  onSquadFilterChange,
  onSortFieldChange,
  onSortOrderChange,
  onClearFilters,
  leaders,
  squads,
}: AdvancedFiltersProps) => {
  const activeFiltersCount = [
    statusFilter !== "all",
    goalTypeFilter !== "all",
    leaderFilter !== "all",
    squadFilter !== "all",
  ].filter(Boolean).length;

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card via-card to-muted/5 animate-fade-in">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Filtros Avançados</h3>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro ativo' : 'filtros ativos'}
                </Badge>
              )}
            </div>
            {activeFiltersCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onClearFilters()}
                      className="h-8"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Limpar Filtros
                    </Button>
            )}
          </div>

          {/* Filters Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Status da Meta</label>
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="bg-background border-border/50 hover:border-primary/50 transition-all duration-300">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="SIM">🟢 Com Meta</SelectItem>
                  <SelectItem value="NAO_DEFINIDO">🟡 A Definir</SelectItem>
                  <SelectItem value="NAO">🔴 Sem Meta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Goal Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Tipo de Meta</label>
              <Select value={goalTypeFilter} onValueChange={onGoalTypeFilterChange}>
                <SelectTrigger className="bg-background border-border/50 hover:border-primary/50 transition-all duration-300">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="Faturamento">💰 Faturamento</SelectItem>
                  <SelectItem value="Leads">👥 Leads</SelectItem>
                  <SelectItem value="OUTROS">🎯 Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Squad Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Squad</label>
              <Select value={squadFilter} onValueChange={onSquadFilterChange}>
                <SelectTrigger className="bg-background border-border/50 hover:border-primary/50 transition-all duration-300">
                  <SelectValue placeholder="Todos os squads" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os squads</SelectItem>
                  {squads.map((squad) => (
                    <SelectItem key={squad} value={squad}>
                      {squad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Leader Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Líder</label>
              <Select value={leaderFilter} onValueChange={onLeaderFilterChange}>
                <SelectTrigger className="bg-background border-border/50 hover:border-primary/50 transition-all duration-300">
                  <SelectValue placeholder="Todos os líderes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os líderes</SelectItem>
                  {leaders.map((leader) => (
                    <SelectItem key={leader} value={leader}>
                      {leader}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sorting */}
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Ordenar por</label>
                <Select value={sortField} onValueChange={onSortFieldChange}>
                  <SelectTrigger className="bg-background border-border/50 hover:border-primary/50 transition-all duration-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nome do Cliente</SelectItem>
                    <SelectItem value="status">Status da Meta</SelectItem>
                    <SelectItem value="goalType">Tipo de Meta</SelectItem>
                    <SelectItem value="progress">Progresso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Ordem</label>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
                  className="h-10 w-10"
                  title={sortOrder === "asc" ? "Crescente" : "Decrescente"}
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

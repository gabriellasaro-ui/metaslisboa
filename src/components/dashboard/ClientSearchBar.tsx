import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface ClientSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  leaderFilter: string;
  onLeaderFilterChange: (value: string) => void;
  leaders: string[];
}

export function ClientSearchBar({
  searchQuery,
  onSearchChange,
  leaderFilter,
  onLeaderFilterChange,
  leaders,
}: ClientSearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <Label htmlFor="search" className="sr-only">
          Buscar cliente
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Buscar por nome do cliente..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="w-full sm:w-[200px]">
        <Label htmlFor="leader-filter" className="sr-only">
          Filtrar por líder
        </Label>
        <Select value={leaderFilter} onValueChange={onLeaderFilterChange}>
          <SelectTrigger id="leader-filter">
            <SelectValue placeholder="Filtrar por líder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Líderes</SelectItem>
            {leaders.map((leader) => (
              <SelectItem key={leader} value={leader}>
                {leader}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

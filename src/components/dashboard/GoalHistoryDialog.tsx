import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Client } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, History, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GoalHistoryEntry {
  id: string;
  changed_at: string;
  changed_by: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  change_type: string;
  user_name?: string;
}

interface GoalHistoryDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getFieldLabel = (fieldName: string): string => {
  const labels: Record<string, string> = {
    goal_type: "Tipo de Meta",
    goal_value: "Descrição da Meta",
    description: "Descrição Adicional",
    status: "Status",
    progress: "Progresso",
    period: "Período",
    goal_created: "Meta Criada",
  };
  return labels[fieldName] || fieldName;
};

const formatValue = (fieldName: string, value: string | null): string => {
  if (!value) return "N/A";
  
  if (fieldName === "goal_type") {
    const types: Record<string, string> = {
      Faturamento: "💰 Faturamento",
      Leads: "🎯 Leads",
      OUTROS: "📋 Outros",
    };
    return types[value] || value;
  }
  
  if (fieldName === "period") {
    const periods: Record<string, string> = {
      mensal: "📅 Mensal",
      trimestral: "📊 Trimestral",
      semestral: "📈 Semestral",
      anual: "🎯 Anual",
    };
    return periods[value] || value;
  }
  
  if (fieldName === "status") {
    const statuses: Record<string, string> = {
      nao_definida: "🟡 Não Definida",
      em_andamento: "🟢 Em Andamento",
      concluida: "✅ Concluída",
      cancelada: "🔴 Cancelada",
    };
    return statuses[value] || value;
  }
  
  if (fieldName === "progress") {
    return `${value}%`;
  }
  
  return value;
};

export const GoalHistoryDialog = ({ client, open, onOpenChange }: GoalHistoryDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<GoalHistoryEntry[]>([]);

  useEffect(() => {
    if (client && open) {
      fetchHistory();
    }
  }, [client, open]);

  const fetchHistory = async () => {
    if (!client?.id) return;
    
    setLoading(true);
    try {
      // Buscar a meta do cliente
      const { data: goalData, error: goalError } = await supabase
        .from("goals")
        .select("id")
        .eq("client_id", client.id)
        .maybeSingle();

      if (goalError) throw goalError;
      if (!goalData) {
        setHistory([]);
        return;
      }

      // Buscar histórico da meta
      const { data: historyData, error: historyError } = await supabase
        .from("goal_history")
        .select("*")
        .eq("goal_id", goalData.id)
        .order("changed_at", { ascending: false });

      if (historyError) throw historyError;

      // Buscar nomes dos usuários que fizeram as alterações
      const userIds = [...new Set(historyData?.map(h => h.changed_by) || [])];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", userIds);

      const userMap = new Map(profilesData?.map(p => [p.id, p.name]) || []);

      const enrichedHistory = historyData?.map(entry => ({
        ...entry,
        user_name: userMap.get(entry.changed_by) || "Usuário Desconhecido",
      })) || [];

      setHistory(enrichedHistory);
    } catch (error) {
      console.error("Error fetching goal history:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <DialogTitle>Histórico de Alterações</DialogTitle>
          </div>
          <DialogDescription>
            Histórico completo de todas as alterações na meta de <strong>{client?.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhuma alteração registrada para esta meta
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <Card key={entry.id} className="border-l-4 border-l-primary/40 hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={entry.change_type === 'create' ? 'default' : 'secondary'}>
                          {entry.change_type === 'create' ? 'Criação' : 'Atualização'}
                        </Badge>
                        <span className="font-semibold text-sm">
                          {getFieldLabel(entry.field_name)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(entry.changed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </div>
                    </div>

                    {entry.change_type === 'update' && (
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Valor Anterior</p>
                          <p className="text-sm bg-destructive/10 text-destructive px-3 py-2 rounded-md">
                            {formatValue(entry.field_name, entry.old_value)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Novo Valor</p>
                          <p className="text-sm bg-primary/10 text-primary px-3 py-2 rounded-md">
                            {formatValue(entry.field_name, entry.new_value)}
                          </p>
                        </div>
                      </div>
                    )}

                    {entry.change_type === 'create' && (
                      <div className="mb-3">
                        <p className="text-sm bg-primary/10 text-primary px-3 py-2 rounded-md">
                          {entry.new_value}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      <span>Alterado por: <strong>{entry.user_name}</strong></span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
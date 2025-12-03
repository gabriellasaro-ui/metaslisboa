import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHealthScoreHistory } from "@/hooks/useHealthScoreHistory";
import { HealthScoreBadge, ExtendedHealthStatus } from "./HealthScoreBadge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowRight, Calendar, User, MessageSquare, Loader2, History } from "lucide-react";

interface Client {
  id: string;
  name: string;
}

interface HealthScoreHistoryDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HealthScoreHistoryDialog = ({ client, open, onOpenChange }: HealthScoreHistoryDialogProps) => {
  const { data: history, isLoading } = useHealthScoreHistory(open ? client?.id || null : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Health Score
          </DialogTitle>
          <DialogDescription>
            Histórico de alterações do cliente <span className="font-medium">{client?.name}</span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !history || history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-center">Nenhuma alteração registrada ainda.</p>
              <p className="text-sm text-center mt-1">
                O histórico será criado quando o health score for alterado.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div
                  key={entry.id}
                  className="relative border rounded-lg p-4 bg-card hover:bg-muted/30 transition-colors"
                >
                  {/* Timeline connector */}
                  {index < history.length - 1 && (
                    <div className="absolute left-7 top-full w-0.5 h-4 bg-border" />
                  )}

                  {/* Header with date and user */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(entry.changed_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{entry.changed_by_name}</span>
                    </div>
                  </div>

                  {/* Status change */}
                  {(entry.old_status || entry.new_status) && entry.old_status !== entry.new_status && (
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <div className="flex items-center gap-2">
                        {entry.old_status ? (
                          <HealthScoreBadge status={entry.old_status as ExtendedHealthStatus} />
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Não definido</span>
                        )}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        {entry.new_status ? (
                          <HealthScoreBadge status={entry.new_status as ExtendedHealthStatus} />
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Não definido</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Categoria change */}
                  {entry.old_categoria_problema !== entry.new_categoria_problema && (
                    <div className="flex items-start gap-3 mb-3 text-sm">
                      <span className="text-muted-foreground shrink-0">Categoria:</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-muted-foreground">
                          {entry.old_categoria_problema || "Nenhuma"}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {entry.new_categoria_problema || "Nenhuma"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Problema central change */}
                  {entry.old_problema_central !== entry.new_problema_central && (
                    <div className="space-y-2 text-sm">
                      <span className="text-muted-foreground">Problema Central:</span>
                      {entry.old_problema_central && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded p-2 text-xs">
                          <span className="text-destructive/70 line-through">{entry.old_problema_central}</span>
                        </div>
                      )}
                      {entry.new_problema_central && (
                        <div className="bg-primary/10 border border-primary/20 rounded p-2 text-xs">
                          <span className="text-primary">{entry.new_problema_central}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {entry.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-sm italic text-muted-foreground">{entry.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

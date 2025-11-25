import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, MessageSquare, Clock, User, Filter, Trash2, Link as LinkIcon, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CheckIn {
  id: string;
  progress: number;
  status: string;
  comment: string;
  call_summary?: string | null;
  call_link?: string | null;
  created_at: string;
  created_by: string;
  client: {
    name: string;
    squad: {
      name: string;
    };
  };
}

interface WeeklyCheckInsTimelineProps {
  clientId?: string;
  squadFilter?: string;
  limit?: number;
  refreshTrigger?: number;
}

export const WeeklyCheckInsTimeline = ({ 
  clientId, 
  squadFilter = "all",
  limit = 50,
  refreshTrigger = 0
}: WeeklyCheckInsTimelineProps) => {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [squads, setSquads] = useState<string[]>([]);
  const [selectedSquad, setSelectedSquad] = useState<string>(squadFilter);
  const [deleteCheckInId, setDeleteCheckInId] = useState<string | null>(null);

  useEffect(() => {
    fetchSquads();
  }, []);

  useEffect(() => {
    fetchCheckIns();
  }, [clientId, selectedSquad, refreshTrigger]);

  const fetchSquads = async () => {
    try {
      const { data, error } = await supabase
        .from("squads")
        .select("name")
        .order("name");

      if (error) throw error;
      setSquads(data.map(s => s.name));
    } catch (error) {
      console.error("Erro ao buscar squads:", error);
    }
  };

  const fetchCheckIns = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("check_ins")
        .select(`
          id,
          progress,
          status,
          comment,
          call_summary,
          call_link,
          created_at,
          created_by,
          client:clients(
            name,
            squad:squads(name)
          )
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (clientId) {
        query = query.eq("client_id", clientId);
      }

      // Filtrar por squad se selecionado
      if (selectedSquad !== "all") {
        // Buscar IDs de clientes do squad selecionado
        const { data: clientsData } = await supabase
          .from("clients")
          .select("id, squad:squads!inner(name)")
          .eq("squad.name", selectedSquad);

        if (clientsData && clientsData.length > 0) {
          const clientIds = clientsData.map(c => c.id);
          query = query.in("client_id", clientIds);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      setCheckIns(data as any);
    } catch (error) {
      console.error("Erro ao buscar check-ins:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      on_track: { label: "No Prazo", variant: "default" as const, color: "bg-green-500" },
      at_risk: { label: "Em Risco", variant: "secondary" as const, color: "bg-yellow-500" },
      delayed: { label: "Atrasado", variant: "destructive" as const, color: "bg-red-500" },
      completed: { label: "Concluído", variant: "outline" as const, color: "bg-blue-500" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.on_track;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1.5">
        <div className={`h-2 w-2 rounded-full ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  const handleDeleteCheckIn = async (id: string) => {
    try {
      const { error } = await supabase
        .from("check_ins")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Check-in excluído!", {
        description: "O registro foi removido com sucesso.",
      });

      // Atualizar lista
      fetchCheckIns();
    } catch (error: any) {
      console.error("Erro ao excluir check-in:", error);
      toast.error("Erro ao excluir check-in", {
        description: error.message || "Tente novamente",
      });
    } finally {
      setDeleteCheckInId(null);
    }
  };

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="border-b border-border/30 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-1.5 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold">Timeline de Check-ins</CardTitle>
            <CardDescription className="text-base mt-2">
              {clientId ? "Histórico de acompanhamento do cliente" : "Últimos check-ins registrados"}
            </CardDescription>
          </div>
        </div>
        
        {/* Filtro de Squad */}
        {!clientId && squads.length > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedSquad} onValueChange={setSelectedSquad}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por squad" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                <SelectItem value="all">Todos os Squads</SelectItem>
                {squads.map(squad => (
                  <SelectItem key={squad} value={squad}>{squad}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Carregando...</div>
        ) : checkIns.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nenhum check-in registrado ainda</p>
            <p className="text-sm mt-1">Faça o primeiro check-in para começar o acompanhamento</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {checkIns.map((checkIn, index) => (
                <div key={checkIn.id} className="relative">
                  {/* Timeline connector */}
                  {index < checkIns.length - 1 && (
                    <div className="absolute left-[19px] top-12 w-0.5 h-full bg-gradient-to-b from-border to-transparent" />
                  )}

                  <div className="flex gap-4">
                    {/* Timeline icon */}
                    <div className="relative flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-3 pb-6">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-foreground">
                              {checkIn.client?.name || "Cliente"}
                            </h4>
                            {getStatusBadge(checkIn.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {format(new Date(checkIn.created_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5" />
                              {checkIn.created_by}
                            </span>
                            {checkIn.client?.squad?.name && (
                              <Badge variant="outline" className="text-xs">
                                {checkIn.client.squad.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{checkIn.progress}%</div>
                            <div className="text-xs text-muted-foreground">progresso</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteCheckInId(checkIn.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                          style={{ width: `${checkIn.progress}%` }}
                        />
                      </div>

                      {/* Comment */}
                      <div className="bg-muted/30 rounded-lg p-4 border border-border/30">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-foreground leading-relaxed">{checkIn.comment}</p>
                        </div>
                      </div>

                      {/* Call Summary */}
                      {checkIn.call_summary && (
                        <div className="bg-accent/10 rounded-lg p-4 border border-accent/30">
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-accent-foreground mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-accent-foreground mb-1">Resumo da Call</p>
                              <p className="text-sm text-foreground leading-relaxed">{checkIn.call_summary}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Call Link */}
                      {checkIn.call_link && (
                        <a
                          href={checkIn.call_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          <LinkIcon className="h-4 w-4" />
                          <span className="underline">Acessar gravação/documentos</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCheckInId} onOpenChange={() => setDeleteCheckInId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este check-in? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCheckInId && handleDeleteCheckIn(deleteCheckInId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

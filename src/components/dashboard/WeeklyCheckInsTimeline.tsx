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
import { useAuth } from "@/contexts/AuthContext";
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
  showClientFilter?: boolean;
}

export const WeeklyCheckInsTimeline = ({ 
  clientId, 
  squadFilter = "all",
  limit = 50,
  refreshTrigger = 0,
  showClientFilter = true
}: WeeklyCheckInsTimelineProps) => {
  const { user, isCoordenador, isSupervisor } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [squads, setSquads] = useState<string[]>([]);
  const [selectedSquad, setSelectedSquad] = useState<string>(squadFilter);
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [deleteCheckInId, setDeleteCheckInId] = useState<string | null>(null);
  const [clients, setClients] = useState<Array<{id: string, name: string}>>([]);

  const canDeleteCheckIn = (checkInCreatedBy: string) => {
    console.log("🔍 DEBUG - Verificando permissão de exclusão:");
    console.log("  - created_by do check-in:", checkInCreatedBy);
    console.log("  - user?.id atual:", user?.id);
    console.log("  - São iguais?", checkInCreatedBy === user?.id);
    console.log("  - É coordenador?", isCoordenador);
    console.log("  - É supervisor?", isSupervisor);
    
    const canDelete = checkInCreatedBy === user?.id || isCoordenador || isSupervisor;
    console.log("  - Pode deletar?", canDelete);
    
    return canDelete;
  };

  useEffect(() => {
    fetchSquads();
    fetchClients();
  }, []);

  useEffect(() => {
    fetchCheckIns();
  }, [clientId, selectedSquad, selectedClient, selectedStatus, refreshTrigger]);

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

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name")
        .eq("status", "ativo")
        .order("name");

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
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

      // Filtrar por cliente selecionado
      if (selectedClient !== "all") {
        query = query.eq("client_id", selectedClient);
      }

      // Filtrar por status
      if (selectedStatus !== "all") {
        query = query.eq("status", selectedStatus);
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
    console.log("🗑️ Tentando excluir check-in:", id);
    
    try {
      // 1. Buscar o check-in a ser deletado para pegar o goal_id
      const { data: checkInToDelete, error: fetchError } = await supabase
        .from("check_ins")
        .select("goal_id, progress")
        .eq("id", id)
        .single();

      console.log("📋 Check-in a deletar:", checkInToDelete);

      if (fetchError) throw fetchError;

      // 2. Deletar o check-in
      const { error: deleteError } = await supabase
        .from("check_ins")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("❌ Erro ao deletar:", deleteError);
        throw deleteError;
      }

      console.log("✅ Check-in deletado com sucesso");

      // 3. Se tinha uma meta associada, recalcular o progresso baseado no check-in anterior
      if (checkInToDelete.goal_id) {
        console.log("🔄 Recalculando progresso da meta:", checkInToDelete.goal_id);
        
        // Buscar o check-in mais recente desta meta
        const { data: latestCheckIn, error: latestError } = await supabase
          .from("check_ins")
          .select("progress")
          .eq("goal_id", checkInToDelete.goal_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (latestError) {
          console.error("❌ Erro ao buscar último check-in:", latestError);
        }

        // Atualizar progresso da meta
        const newProgress = latestCheckIn?.progress || 0;
        console.log("📊 Novo progresso da meta:", newProgress);

        const { error: updateError } = await supabase
          .from("goals")
          .update({ 
            progress: newProgress,
            status: newProgress === 100 ? "concluida" : "em_andamento" as "concluida" | "em_andamento",
          })
          .eq("id", checkInToDelete.goal_id);

        if (updateError) {
          console.error("❌ Erro ao atualizar progresso:", updateError);
        } else {
          console.log("✅ Progresso da meta atualizado");
        }
      }

      toast.success("Check-in excluído!", {
        description: "O registro foi removido e o progresso foi recalculado.",
      });

      // Atualizar lista
      fetchCheckIns();
    } catch (error: any) {
      console.error("❌ Erro ao excluir check-in:", error);
      toast.error("Erro ao excluir check-in", {
        description: error.message || "Você não tem permissão para excluir este check-in",
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
        
        {/* Filtros */}
        {!clientId && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            
            {/* Filtro de Squad */}
            {squads.length > 0 && (
              <Select value={selectedSquad} onValueChange={setSelectedSquad}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por squad" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50">
                  <SelectItem value="all">Todos os Squads</SelectItem>
                  {squads.map(squad => (
                    <SelectItem key={squad} value={squad}>{squad}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Filtro de Cliente */}
            {showClientFilter && clients.length > 0 && (
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por cliente" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border z-50 max-h-[300px]">
                  <SelectItem value="all">Todos os Clientes</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Filtro de Status */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border z-50">
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="on_track">No Prazo</SelectItem>
                <SelectItem value="at_risk">Em Risco</SelectItem>
                <SelectItem value="delayed">Atrasado</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
              </SelectContent>
            </Select>

            {/* Botão Limpar Filtros */}
            {(selectedSquad !== "all" || selectedClient !== "all" || selectedStatus !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedSquad("all");
                  setSelectedClient("all");
                  setSelectedStatus("all");
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                Limpar filtros
              </Button>
            )}
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
                            onClick={() => canDeleteCheckIn(checkIn.created_by) && setDeleteCheckInId(checkIn.id)}
                            disabled={!canDeleteCheckIn(checkIn.created_by)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 disabled:cursor-not-allowed"
                            title={canDeleteCheckIn(checkIn.created_by) ? "Excluir check-in" : "Você não tem permissão para excluir este check-in"}
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

                      {/* Links de Call Summary e Gravação */}
                      {(checkIn.call_summary || checkIn.call_link) && (
                        <div className="space-y-2 pt-2">
                          {checkIn.call_summary && (
                            <a
                              href={checkIn.call_summary}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors hover:underline"
                            >
                              <FileText className="h-4 w-4" />
                              <span>📄 Documento da Call</span>
                            </a>
                          )}
                          {checkIn.call_link && (
                            <a
                              href={checkIn.call_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors hover:underline"
                            >
                              <LinkIcon className="h-4 w-4" />
                              <span>🎥 Gravação da Call</span>
                            </a>
                          )}
                        </div>
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

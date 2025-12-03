import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Lightbulb, Bug, Sparkles, MessageSquare, Clock, CheckCircle, XCircle, ThumbsUp, Settings, Send } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SuggestionsAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Suggestion {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  squad_name: string | null;
  title: string;
  description: string;
  category: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  votes_count: number;
}

const CATEGORIES = [
  { value: "melhoria", label: "Melhoria", icon: Sparkles },
  { value: "bug", label: "Bug/Erro", icon: Bug },
  { value: "nova_funcionalidade", label: "Nova Funcionalidade", icon: Lightbulb },
  { value: "outro", label: "Outro", icon: MessageSquare },
];

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente", icon: Clock },
  { value: "em_analise", label: "Em Análise", icon: Clock },
  { value: "aprovado", label: "Aprovado", icon: CheckCircle },
  { value: "implementado", label: "Implementado", icon: CheckCircle },
  { value: "rejeitado", label: "Rejeitado", icon: XCircle },
];

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  pendente: { label: "Pendente", variant: "secondary", icon: Clock },
  em_analise: { label: "Em Análise", variant: "default", icon: Clock },
  aprovado: { label: "Aprovado", variant: "default", icon: CheckCircle },
  implementado: { label: "Implementado", variant: "default", icon: CheckCircle },
  rejeitado: { label: "Rejeitado", variant: "destructive", icon: XCircle },
};

export const SuggestionsAdminDialog = ({ open, onOpenChange }: SuggestionsAdminDialogProps) => {
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [response, setResponse] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all suggestions
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ["suggestions-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suggestions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Suggestion[];
    },
    enabled: open,
  });

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
    setNewStatus(suggestion.status);
    setResponse(suggestion.admin_response || "");
  };

  const handleUpdate = async () => {
    if (!selectedSuggestion) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("suggestions")
        .update({
          status: newStatus,
          admin_response: response.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedSuggestion.id);

      if (error) throw error;

      toast.success("Sugestão atualizada!");
      queryClient.invalidateQueries({ queryKey: ["suggestions-admin"] });
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
      setSelectedSuggestion(null);
    } catch (error: any) {
      toast.error("Erro ao atualizar: " + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    const found = CATEGORIES.find(c => c.value === cat);
    return found?.icon || MessageSquare;
  };

  const getCategoryLabel = (cat: string) => {
    const found = CATEGORIES.find(c => c.value === cat);
    return found?.label || cat;
  };

  const getRoleLabel = (r: string) => {
    if (r === "supervisor") return "Supervisor";
    if (r === "coordenador") return "Coordenador";
    return "Investidor";
  };

  const pendingSuggestions = suggestions.filter(s => s.status === "pendente" || s.status === "em_analise");
  const resolvedSuggestions = suggestions.filter(s => s.status !== "pendente" && s.status !== "em_analise");

  const stats = {
    total: suggestions.length,
    pending: suggestions.filter(s => s.status === "pendente").length,
    inAnalysis: suggestions.filter(s => s.status === "em_analise").length,
    approved: suggestions.filter(s => s.status === "aprovado").length,
    implemented: suggestions.filter(s => s.status === "implementado").length,
    rejected: suggestions.filter(s => s.status === "rejeitado").length,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gerenciar Sugestões
          </DialogTitle>
          <DialogDescription>
            Administre as sugestões enviadas pelos usuários
          </DialogDescription>
        </DialogHeader>

        {/* Stats */}
        <div className="grid grid-cols-6 gap-2 text-center">
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="p-2 rounded-lg bg-yellow-500/10">
            <p className="text-lg font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </div>
          <div className="p-2 rounded-lg bg-blue-500/10">
            <p className="text-lg font-bold text-blue-600">{stats.inAnalysis}</p>
            <p className="text-xs text-muted-foreground">Em Análise</p>
          </div>
          <div className="p-2 rounded-lg bg-green-500/10">
            <p className="text-lg font-bold text-green-600">{stats.approved}</p>
            <p className="text-xs text-muted-foreground">Aprovadas</p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <p className="text-lg font-bold text-emerald-600">{stats.implemented}</p>
            <p className="text-xs text-muted-foreground">Implementadas</p>
          </div>
          <div className="p-2 rounded-lg bg-red-500/10">
            <p className="text-lg font-bold text-red-600">{stats.rejected}</p>
            <p className="text-xs text-muted-foreground">Rejeitadas</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          {/* List */}
          <div className="border rounded-lg">
            <Tabs defaultValue="pending" className="h-full flex flex-col">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="pending">Pendentes ({pendingSuggestions.length})</TabsTrigger>
                <TabsTrigger value="resolved">Resolvidas ({resolvedSuggestions.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="flex-1 m-0">
                <ScrollArea className="h-[350px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : pendingSuggestions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Nenhuma sugestão pendente
                    </div>
                  ) : (
                    <div className="p-2 space-y-2">
                      {pendingSuggestions.map((suggestion) => {
                        const CategoryIcon = getCategoryIcon(suggestion.category);
                        const isSelected = selectedSuggestion?.id === suggestion.id;
                        
                        return (
                          <div
                            key={suggestion.id}
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <CategoryIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{suggestion.title}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {suggestion.user_name} • {getRoleLabel(suggestion.user_role)}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <ThumbsUp className="h-3 w-3" />
                                {suggestion.votes_count}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="resolved" className="flex-1 m-0">
                <ScrollArea className="h-[350px]">
                  {resolvedSuggestions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Nenhuma sugestão resolvida
                    </div>
                  ) : (
                    <div className="p-2 space-y-2">
                      {resolvedSuggestions.map((suggestion) => {
                        const CategoryIcon = getCategoryIcon(suggestion.category);
                        const statusConfig = STATUS_CONFIG[suggestion.status];
                        const isSelected = selectedSuggestion?.id === suggestion.id;
                        
                        return (
                          <div
                            key={suggestion.id}
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <CategoryIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{suggestion.title}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {suggestion.user_name}
                                </p>
                              </div>
                              <Badge variant={statusConfig.variant} className="text-xs">
                                {statusConfig.label}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Detail */}
          <div className="border rounded-lg p-4">
            {selectedSuggestion ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {(() => {
                      const CategoryIcon = getCategoryIcon(selectedSuggestion.category);
                      return <CategoryIcon className="h-4 w-4 text-muted-foreground" />;
                    })()}
                    <Badge variant="outline" className="text-xs">
                      {getCategoryLabel(selectedSuggestion.category)}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                      <ThumbsUp className="h-3 w-3" />
                      {selectedSuggestion.votes_count} votos
                    </div>
                  </div>
                  <h3 className="font-semibold">{selectedSuggestion.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-[8px]">
                        {selectedSuggestion.user_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{selectedSuggestion.user_name}</span>
                    <span>•</span>
                    <span>{getRoleLabel(selectedSuggestion.user_role)}</span>
                    {selectedSuggestion.squad_name && (
                      <>
                        <span>•</span>
                        <span>{selectedSuggestion.squad_name}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(selectedSuggestion.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-sm">{selectedSuggestion.description}</p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            <div className="flex items-center gap-2">
                              <status.icon className="h-4 w-4" />
                              {status.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium">Resposta (opcional)</label>
                    <Textarea
                      placeholder="Escreva uma resposta para o usuário..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleUpdate} disabled={isUpdating} className="w-full">
                    {isUpdating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Atualizar Sugestão
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Selecione uma sugestão para gerenciar
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
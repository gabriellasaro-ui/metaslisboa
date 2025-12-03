import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Lightbulb, Bug, Sparkles, MessageSquare, Clock, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SuggestionsDialogProps {
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
}

const CATEGORIES = [
  { value: "melhoria", label: "Melhoria", icon: Sparkles },
  { value: "bug", label: "Bug/Erro", icon: Bug },
  { value: "nova_funcionalidade", label: "Nova Funcionalidade", icon: Lightbulb },
  { value: "outro", label: "Outro", icon: MessageSquare },
];

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  pendente: { label: "Pendente", variant: "secondary", icon: Clock },
  em_analise: { label: "Em Análise", variant: "default", icon: Clock },
  aprovado: { label: "Aprovado", variant: "default", icon: CheckCircle },
  implementado: { label: "Implementado", variant: "default", icon: CheckCircle },
  rejeitado: { label: "Rejeitado", variant: "destructive", icon: XCircle },
};

export const SuggestionsDialog = ({ open, onOpenChange }: SuggestionsDialogProps) => {
  const { user, profile, role, squadId } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("melhoria");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch squad name
  const { data: squadData } = useQuery({
    queryKey: ["user-squad", squadId],
    queryFn: async () => {
      if (!squadId) return null;
      const { data } = await supabase
        .from("squads")
        .select("name")
        .eq("id", squadId)
        .single();
      return data;
    },
    enabled: !!squadId,
  });

  // Fetch all suggestions
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ["suggestions"],
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

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("suggestions").insert({
        user_id: user?.id,
        user_name: profile?.name || "Usuário",
        user_role: role || "investidor",
        squad_name: squadData?.name || null,
        title: title.trim(),
        description: description.trim(),
        category,
      });

      if (error) throw error;

      toast.success("Sugestão enviada com sucesso!");
      setTitle("");
      setDescription("");
      setCategory("melhoria");
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
    } catch (error: any) {
      console.error("Error submitting suggestion:", error);
      toast.error("Erro ao enviar sugestão: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (suggestionId: string) => {
    try {
      const { error } = await supabase
        .from("suggestions")
        .delete()
        .eq("id", suggestionId);
      
      if (error) throw error;
      toast.success("Sugestão removida");
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
    } catch (error: any) {
      toast.error("Erro ao remover: " + error.message);
    }
  };

  const mySuggestions = suggestions.filter(s => s.user_id === user?.id);
  const allSuggestions = suggestions;

  const getCategoryIcon = (cat: string) => {
    const found = CATEGORIES.find(c => c.value === cat);
    return found?.icon || MessageSquare;
  };

  const getRoleLabel = (r: string) => {
    if (r === "supervisor") return "Supervisor";
    if (r === "coordenador") return "Coordenador";
    return "Investidor";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Sugestões e Melhorias
          </DialogTitle>
          <DialogDescription>
            Compartilhe suas ideias para melhorar a plataforma
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="nova" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nova">Nova Sugestão</TabsTrigger>
            <TabsTrigger value="minhas">Minhas ({mySuggestions.length})</TabsTrigger>
            <TabsTrigger value="todas">Todas ({allSuggestions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="nova" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Resumo da sua sugestão"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <cat.icon className="h-4 w-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                placeholder="Descreva sua sugestão em detalhes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enviar Sugestão
            </Button>
          </TabsContent>

          <TabsContent value="minhas" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : mySuggestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Você ainda não enviou nenhuma sugestão
                </div>
              ) : (
                <div className="space-y-3">
                  {mySuggestions.map((suggestion) => {
                    const CategoryIcon = getCategoryIcon(suggestion.category);
                    const statusConfig = STATUS_CONFIG[suggestion.status] || STATUS_CONFIG.pendente;
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <Card key={suggestion.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                              <CardTitle className="text-base">{suggestion.title}</CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={statusConfig.variant} className="text-xs">
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                              {suggestion.status === "pendente" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleDelete(suggestion.id)}
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <CardDescription className="text-xs">
                            {format(new Date(suggestion.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                          {suggestion.admin_response && (
                            <div className="mt-3 p-3 rounded-lg bg-primary/5 border-l-2 border-primary">
                              <p className="text-xs font-medium text-primary mb-1">Resposta:</p>
                              <p className="text-sm">{suggestion.admin_response}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="todas" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : allSuggestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma sugestão foi enviada ainda
                </div>
              ) : (
                <div className="space-y-3">
                  {allSuggestions.map((suggestion) => {
                    const CategoryIcon = getCategoryIcon(suggestion.category);
                    const statusConfig = STATUS_CONFIG[suggestion.status] || STATUS_CONFIG.pendente;
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <Card key={suggestion.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                              <CardTitle className="text-base">{suggestion.title}</CardTitle>
                            </div>
                            <Badge variant={statusConfig.variant} className="text-xs">
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs flex items-center gap-2">
                            <Avatar className="h-4 w-4">
                              <AvatarFallback className="text-[8px]">
                                {suggestion.user_name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{suggestion.user_name}</span>
                            <span>•</span>
                            <span>{getRoleLabel(suggestion.user_role)}</span>
                            {suggestion.squad_name && (
                              <>
                                <span>•</span>
                                <span>{suggestion.squad_name}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{format(new Date(suggestion.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                          {suggestion.admin_response && (
                            <div className="mt-3 p-3 rounded-lg bg-primary/5 border-l-2 border-primary">
                              <p className="text-xs font-medium text-primary mb-1">Resposta:</p>
                              <p className="text-sm">{suggestion.admin_response}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
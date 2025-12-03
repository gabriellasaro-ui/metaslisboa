import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
import { Loader2, Lightbulb, Bug, Sparkles, MessageSquare, Clock, CheckCircle, XCircle, Trash2, ThumbsUp, TrendingUp } from "lucide-react";
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
  votes_count: number;
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
        .order("votes_count", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Suggestion[];
    },
    enabled: open,
  });

  // Fetch user votes
  const { data: userVotes = [] } = useQuery({
    queryKey: ["user-votes", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("suggestion_votes")
        .select("suggestion_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data.map(v => v.suggestion_id);
    },
    enabled: open && !!user?.id,
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

  const handleVote = async (suggestionId: string) => {
    if (!user?.id) return;
    
    const hasVoted = userVotes.includes(suggestionId);
    
    try {
      if (hasVoted) {
        await supabase
          .from("suggestion_votes")
          .delete()
          .eq("suggestion_id", suggestionId)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("suggestion_votes")
          .insert({ suggestion_id: suggestionId, user_id: user.id });
      }
      
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
      queryClient.invalidateQueries({ queryKey: ["user-votes"] });
    } catch (error: any) {
      toast.error("Erro ao votar: " + error.message);
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
  const topSuggestions = [...suggestions].sort((a, b) => b.votes_count - a.votes_count);

  const getCategoryIcon = (cat: string) => {
    const found = CATEGORIES.find(c => c.value === cat);
    return found?.icon || MessageSquare;
  };

  const getRoleLabel = (r: string) => {
    if (r === "supervisor") return "Supervisor";
    if (r === "coordenador") return "Coordenador";
    return "Investidor";
  };

  const SuggestionCard = ({ suggestion, showAuthor = false, showDelete = false }: { suggestion: Suggestion; showAuthor?: boolean; showDelete?: boolean }) => {
    const CategoryIcon = getCategoryIcon(suggestion.category);
    const statusConfig = STATUS_CONFIG[suggestion.status] || STATUS_CONFIG.pendente;
    const StatusIcon = statusConfig.icon;
    const hasVoted = userVotes.includes(suggestion.id);
    
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <CategoryIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <CardTitle className="text-base truncate">{suggestion.title}</CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant={hasVoted ? "default" : "outline"}
                size="sm"
                className="h-7 gap-1"
                onClick={() => handleVote(suggestion.id)}
              >
                <ThumbsUp className={`h-3 w-3 ${hasVoted ? 'fill-current' : ''}`} />
                <span className="text-xs">{suggestion.votes_count || 0}</span>
              </Button>
              <Badge variant={statusConfig.variant} className="text-xs">
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
              {showDelete && suggestion.status === "pendente" && (
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
          <CardDescription className="text-xs flex items-center gap-2 flex-wrap">
            {showAuthor && (
              <>
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
              </>
            )}
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
            Compartilhe suas ideias e vote nas melhores sugestões
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="top" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="top" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              Top
            </TabsTrigger>
            <TabsTrigger value="nova">Nova</TabsTrigger>
            <TabsTrigger value="minhas">Minhas ({mySuggestions.length})</TabsTrigger>
            <TabsTrigger value="todas">Todas ({suggestions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="top" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : topSuggestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma sugestão ainda. Seja o primeiro!
                </div>
              ) : (
                <div className="space-y-3">
                  {topSuggestions.slice(0, 10).map((suggestion, index) => (
                    <div key={suggestion.id} className="relative">
                      {index < 3 && (
                        <div className={`absolute -left-2 top-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-amber-400 text-amber-950' :
                          index === 1 ? 'bg-slate-300 text-slate-800' :
                          'bg-orange-300 text-orange-900'
                        }`}>
                          {index + 1}
                        </div>
                      )}
                      <div className={index < 3 ? 'ml-6' : ''}>
                        <SuggestionCard suggestion={suggestion} showAuthor />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

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
                  {mySuggestions.map((suggestion) => (
                    <SuggestionCard key={suggestion.id} suggestion={suggestion} showDelete />
                  ))}
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
              ) : suggestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma sugestão foi enviada ainda
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestions.map((suggestion) => (
                    <SuggestionCard key={suggestion.id} suggestion={suggestion} showAuthor />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
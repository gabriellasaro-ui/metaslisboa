import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Leader {
  id: string;
  name: string;
}

interface Squad {
  id: string;
  name: string;
  slug: string;
  leader_id: string | null;
}

interface EditSquadDialogProps {
  squad: Squad | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditSquadDialog = ({ squad, open, onOpenChange, onSuccess }: EditSquadDialogProps) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [leaderId, setLeaderId] = useState<string>("");
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLeaders, setLoadingLeaders] = useState(true);

  useEffect(() => {
    if (open && squad) {
      setName(squad.name);
      setSlug(squad.slug);
      setLeaderId(squad.leader_id || "");
      fetchLeaders();
    }
  }, [open, squad]);

  const fetchLeaders = async () => {
    try {
      const { data, error } = await supabase
        .from("leaders")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setLeaders(data || []);
    } catch (error) {
      console.error("Error fetching leaders:", error);
      toast.error("Erro ao carregar líderes");
    } finally {
      setLoadingLeaders(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!squad || !name || !slug) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("squads")
        .update({
          name,
          slug,
          leader_id: leaderId === "none" || !leaderId ? null : leaderId,
        })
        .eq("id", squad.id);

      if (error) throw error;

      toast.success("Squad atualizado com sucesso!");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating squad:", error);
      toast.error("Erro ao atualizar squad");
    } finally {
      setLoading(false);
    }
  };

  if (!squad) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Squad</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Squad *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leader">Líder</Label>
            <Select value={leaderId || "none"} onValueChange={(value) => setLeaderId(value === "none" ? "" : value)}>
              <SelectTrigger id="leader">
                <SelectValue placeholder="Selecione um líder" />
              </SelectTrigger>
              <SelectContent>
                {loadingLeaders ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {leaders.map((leader) => (
                      <SelectItem key={leader.id} value={leader.id}>
                        {leader.name}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
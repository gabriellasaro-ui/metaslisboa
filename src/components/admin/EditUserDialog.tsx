import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Squad {
  id: string;
  name: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  squad_id: string | null;
  role: string;
}

interface EditUserDialogProps {
  user: UserData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditUserDialog = ({ user, open, onOpenChange, onSuccess }: EditUserDialogProps) => {
  const [name, setName] = useState("");
  const [squadId, setSquadId] = useState<string>("");
  const [role, setRole] = useState<"investidor" | "coordenador" | "supervisor">("investidor");
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSquads, setLoadingSquads] = useState(true);

  useEffect(() => {
    if (open && user) {
      setName(user.name);
      setSquadId(user.squad_id || "none");
      setRole(user.role as "investidor" | "coordenador" | "supervisor");
      fetchSquads();
    }
  }, [open, user]);

  const fetchSquads = async () => {
    try {
      const { data, error } = await supabase
        .from("squads")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setSquads(data || []);
    } catch (error) {
      console.error("Error fetching squads:", error);
      toast.error("Erro ao carregar squads");
    } finally {
      setLoadingSquads(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      // Atualizar perfil
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name,
          squad_id: squadId === "none" || !squadId ? null : squadId,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Atualizar role - verificar se existe primeiro
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id, role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingRole) {
        // Se existe, fazer UPDATE
        const { error: updateError } = await supabase
          .from("user_roles")
          .update({ role })
          .eq("user_id", user.id);

        if (updateError) throw updateError;
      } else {
        // Se não existe, fazer INSERT
        const { error: insertError } = await supabase
          .from("user_roles")
          .insert({ user_id: user.id, role });

        if (insertError) throw insertError;
      }

      toast.success("Usuário atualizado com sucesso!");
      onSuccess();
      onOpenChange(false);
      
      // Forçar atualização visual imediata
      window.location.reload();
    } catch (error: any) {
      console.error("Error updating user:", error);
      const errorMessage = error.message || error.details || "Erro ao atualizar usuário";
      toast.error(`Erro: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="squad">Squad</Label>
            <Select value={squadId || "none"} onValueChange={(value) => setSquadId(value === "none" ? "" : value)}>
              <SelectTrigger id="squad">
                <SelectValue placeholder="Selecione um squad" />
              </SelectTrigger>
              <SelectContent>
                {loadingSquads ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {squads.map((squad) => (
                      <SelectItem key={squad.id} value={squad.id}>
                        {squad.name}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Cargo *</Label>
            <Select value={role} onValueChange={(value) => setRole(value as "investidor" | "coordenador" | "supervisor")}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecione um cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="investidor">Investidor</SelectItem>
                <SelectItem value="coordenador">Coordenador</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
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
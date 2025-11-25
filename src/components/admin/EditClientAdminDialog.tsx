import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SquadOption {
  id: string;
  name: string;
}

interface Client {
  id: string;
  name: string;
  status: string;
  health_status: string | null;
  notes: string | null;
  squad_id: string;
}

interface EditClientAdminDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditClientAdminDialog = ({ client, open, onOpenChange, onSuccess }: EditClientAdminDialogProps) => {
  const [name, setName] = useState("");
  const [squadId, setSquadId] = useState("");
  const [status, setStatus] = useState<"ativo" | "aviso_previo" | "churned">("ativo");
  const [healthStatus, setHealthStatus] = useState<"safe" | "care" | "danger">("safe");
  const [squads, setSquads] = useState<SquadOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSquads, setLoadingSquads] = useState(true);

  useEffect(() => {
    if (open && client) {
      setName(client.name);
      setSquadId(client.squad_id);
      setStatus(client.status as any);
      setHealthStatus((client.health_status || "safe") as any);
      fetchSquads();
    }
  }, [open, client]);

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
    if (!client || !name || !squadId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("clients")
        .update({
          name,
          squad_id: squadId,
          status,
          health_status: healthStatus,
        })
        .eq("id", client.id);

      if (error) throw error;

      toast.success("Cliente atualizado com sucesso!");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Erro ao atualizar cliente");
    } finally {
      setLoading(false);
    }
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Cliente *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="squad">Squad *</Label>
            <Select value={squadId} onValueChange={setSquadId} required>
              <SelectTrigger id="squad">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {loadingSquads ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  squads.map((squad) => (
                    <SelectItem key={squad.id} value={squad.id}>
                      {squad.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="aviso_previo">Aviso Prévio</SelectItem>
                <SelectItem value="churned">Churn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="health">Health</Label>
            <Select value={healthStatus} onValueChange={(v: any) => setHealthStatus(v)}>
              <SelectTrigger id="health">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="safe">Saudável</SelectItem>
                <SelectItem value="care">Atenção</SelectItem>
                <SelectItem value="danger">Perigo</SelectItem>
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
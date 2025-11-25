import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SquadOption {
  id: string;
  name: string;
}

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddClientDialog = ({ open, onOpenChange, onSuccess }: AddClientDialogProps) => {
  const [name, setName] = useState("");
  const [squadId, setSquadId] = useState("");
  const [status, setStatus] = useState<"ativo" | "aviso_previo" | "churned">("ativo");
  const [healthStatus, setHealthStatus] = useState<"safe" | "care" | "danger">("safe");
  const [notes, setNotes] = useState("");
  const [squads, setSquads] = useState<SquadOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSquads, setLoadingSquads] = useState(true);

  useEffect(() => {
    if (open) {
      fetchSquads();
    }
  }, [open]);

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
    if (!name || !squadId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("clients").insert({
        name,
        squad_id: squadId,
        status,
        health_status: healthStatus,
        notes: notes || null,
      });

      if (error) throw error;

      toast.success("Cliente adicionado com sucesso!");
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error adding client:", error);
      toast.error("Erro ao adicionar cliente");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setSquadId("");
    setStatus("ativo");
    setHealthStatus("safe");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Cliente *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Groupwork"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="squad">Squad *</Label>
            <Select value={squadId} onValueChange={setSquadId} required>
              <SelectTrigger id="squad">
                <SelectValue placeholder="Selecione um squad" />
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
                <SelectItem value="churned">Churned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="health">Saúde</Label>
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

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informações adicionais..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
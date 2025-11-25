import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Fish, Sparkles, Cat, Target, Trophy, Shield, Users } from "lucide-react";

interface Leader {
  id: string;
  name: string;
}

interface AddSquadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const iconOptions = [
  { value: 'flag', icon: '🇺🇸', label: 'Bandeira EUA' },
  { value: 'fish', icon: Fish, label: 'Tubarão' },
  { value: 'sparkles', icon: Sparkles, label: 'Midas' },
  { value: 'cat', icon: Cat, label: 'Tigre' },
  { value: 'target', icon: Target, label: 'Alvo' },
  { value: 'trophy', icon: Trophy, label: 'Troféu' },
  { value: 'shield', icon: Shield, label: 'Escudo' },
  { value: 'users', icon: Users, label: 'Pessoas' },
];

export const AddSquadDialog = ({ open, onOpenChange, onSuccess }: AddSquadDialogProps) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [leaderId, setLeaderId] = useState<string>("");
  const [icon, setIcon] = useState<string>("users");
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLeaders, setLoadingLeaders] = useState(true);

  useEffect(() => {
    if (open) {
      fetchLeaders();
    }
  }, [open]);

  useEffect(() => {
    // Auto-generate slug from name
    if (name) {
      setSlug(name.toLowerCase().replace(/\s+/g, "-"));
    }
  }, [name]);

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
    if (!name || !slug) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("squads").insert({
        name,
        slug,
        icon,
        leader_id: leaderId === "none" || !leaderId ? null : leaderId,
      });

      if (error) throw error;

      toast.success("Squad criado com sucesso!");
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error adding squad:", error);
      toast.error("Erro ao criar squad");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setSlug("");
    setLeaderId("");
    setIcon("users");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Squad</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Squad *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: SHARK"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Ex: shark"
              required
            />
            <p className="text-xs text-muted-foreground">
              Gerado automaticamente do nome, mas pode ser editado
            </p>
          </div>

          <div className="space-y-2">
            <Label>Ícone do Squad</Label>
            <div className="grid grid-cols-4 gap-2">
              {iconOptions.map((option) => {
                const IconComponent = option.icon;
                const isSelected = icon === option.value;
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setIcon(option.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                      isSelected 
                        ? 'border-primary bg-primary/10 shadow-lg' 
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-primary/20' : 'bg-muted'
                    }`}>
                      {typeof IconComponent === 'string' ? (
                        <span className="text-xl">{IconComponent}</span>
                      ) : (
                        <IconComponent className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      )}
                    </div>
                    <span className={`text-xs text-center ${isSelected ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="leader">Líder (opcional)</Label>
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
              Criar Squad
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
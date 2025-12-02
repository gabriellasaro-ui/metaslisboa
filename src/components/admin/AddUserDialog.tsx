import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import { z } from "zod";

interface Squad {
  id: string;
  name: string;
}

const userSchema = z.object({
  name: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(100, "Nome muito longo"),
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(100, "Senha muito longa"),
});

interface AddUserDialogProps {
  onSuccess: () => void;
  coordenadorMode?: boolean;
  squadId?: string | null;
}

export const AddUserDialog = ({ onSuccess, coordenadorMode = false, squadId: fixedSquadId }: AddUserDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [squadId, setSquadId] = useState<string>("");
  const [role, setRole] = useState<"investidor" | "coordenador" | "supervisor">("investidor");
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSquads, setLoadingSquads] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (open) {
      fetchSquads();
      // Se for modo coordenador, já define o squad fixo
      if (coordenadorMode && fixedSquadId) {
        setSquadId(fixedSquadId);
        setRole("investidor"); // Coordenadores só podem criar investidores
      }
    }
  }, [open, coordenadorMode, fixedSquadId]);

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
    setErrors({});

    // Validar dados
    try {
      userSchema.parse({ name, email, password });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    // Coordenador deve ter squad definido
    const finalSquadId = coordenadorMode && fixedSquadId ? fixedSquadId : squadId;

    setLoading(true);
    try {
      // Criar usuário via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            role: coordenadorMode ? "investidor" : role,
            squad_id: finalSquadId || null,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar usuário");

      toast.success("Usuário criado com sucesso!");
      setOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setSquadId("");
      setRole("investidor");
      onSuccess();
    } catch (error: any) {
      console.error("Error creating user:", error);
      const errorMessage = error.message || "Erro ao criar usuário";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          {coordenadorMode ? "Adicionar Investidor" : "Adicionar Usuário"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {coordenadorMode ? "Adicionar Investidor ao Squad" : "Adicionar Novo Usuário"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
              required
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@v4company.com"
              required
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>

          {!coordenadorMode && (
            <>
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
            </>
          )}

          {coordenadorMode && (
            <p className="text-sm text-muted-foreground">
              O usuário será criado como <strong>Investidor</strong> no seu squad.
            </p>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Usuário
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

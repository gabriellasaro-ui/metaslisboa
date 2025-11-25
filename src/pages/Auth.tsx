import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { BackgroundParticles } from "@/components/BackgroundParticles";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email("Email inválido").refine((email) => email.endsWith("@v4company.com"), {
    message: "Use um email @v4company.com",
  }),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  role: z.enum(["investidor", "coordenador", "supervisor"]),
  squad_id: z.string().optional(),
}).refine((data) => {
  // Squad is required for investidor and coordenador, but optional for supervisor
  if (data.role !== "supervisor" && !data.squad_id) {
    return false;
  }
  return true;
}, {
  message: "Selecione uma squad",
  path: ["squad_id"],
});

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [squads, setSquads] = useState<Array<{ id: string; name: string }>>([]);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    squad_id: "",
    role: "investidor" as "investidor" | "coordenador" | "supervisor",
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();

    // Fetch squads for signup
    fetchSquads();
  }, [navigate]);

  const fetchSquads = async () => {
    const { data, error } = await supabase
      .from("squads")
      .select("id, name")
      .order("name");
    
    if (!error && data) {
      setSquads(data);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = loginSchema.parse({
        email: formData.email,
        password: formData.password,
      });

      const { error } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
      });

      if (error) throw error;

      toast.success("Login realizado com sucesso!");
      navigate("/");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Erro ao fazer login", {
          description: error.message || "Verifique suas credenciais",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = signupSchema.parse(formData);

      const { error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          data: {
            name: validated.name,
            squad_id: validated.squad_id || null,
            role: validated.role,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast.success("Cadastro realizado!", {
        description: "Você já pode fazer login",
      });
      setIsLogin(true);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Erro ao criar conta", {
          description: error.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/5 to-background relative overflow-hidden p-4">
      <BackgroundParticles />
      
      <Card className="w-full max-w-md relative z-10 border-border/50 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            {isLogin ? "Login" : "Criar Conta"}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin 
              ? "Entre com suas credenciais V4 Company" 
              : "Cadastre-se com seu email corporativo"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="João Silva"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@v4company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="role">Cargo</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investidor">Investidor</SelectItem>
                      <SelectItem value="coordenador">Coordenador</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.role !== "supervisor" && (
                  <div className="space-y-2">
                    <Label htmlFor="squad">Squad</Label>
                    <Select
                      value={formData.squad_id}
                      onValueChange={(value) => setFormData({ ...formData, squad_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione sua squad" />
                      </SelectTrigger>
                      <SelectContent>
                        {squads.map((squad) => (
                          <SelectItem key={squad.id} value={squad.id}>
                            {squad.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Carregando..." : isLogin ? "Entrar" : "Criar Conta"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
            >
              {isLogin 
                ? "Não tem conta? Cadastre-se" 
                : "Já tem conta? Faça login"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

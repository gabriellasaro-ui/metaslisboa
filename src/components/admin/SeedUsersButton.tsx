import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const SeedUsersButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSeedUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-users', {
        method: 'POST',
      });

      if (error) throw error;

      console.log('Seed result:', data);

      if (data.success > 0) {
        toast.success(
          `${data.success} usuários criados com sucesso!`,
          {
            description: data.errors > 0 
              ? `${data.errors} usuário(s) tiveram erros. Verifique o console para detalhes.`
              : 'Todos os usuários foram criados com senhas padrão e devem alterá-las no primeiro login.',
          }
        );
      }

      if (data.errors > 0) {
        console.error('Erros:', data.details.errors);
        toast.error(`${data.errors} usuário(s) não foram criados`, {
          description: 'Verifique o console para mais detalhes',
        });
      }
    } catch (error) {
      console.error('Error seeding users:', error);
      toast.error('Erro ao criar usuários', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Criar 31 Usuários
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Criar Usuários em Massa</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Esta ação irá criar <strong>31 contas de usuário</strong>:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>29 usuários do Excel (senha: 12345678v4)</li>
              <li>2 admins (adm1@, adm2@) (senha: adm123)</li>
            </ul>
            <p className="text-destructive font-medium mt-3">
              ⚠️ Todos os usuários deverão alterar suas senhas no primeiro login.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Esta ação só deve ser executada uma vez. Executar novamente pode causar erros se as contas já existirem.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleSeedUsers} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Usuários'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
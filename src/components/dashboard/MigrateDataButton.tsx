import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const MigrateDataButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [stats, setStats] = useState<any>(null);

  const handleMigration = async () => {
    setIsLoading(true);
    setMigrationStatus('idle');
    
    try {
      const { data, error } = await supabase.functions.invoke('migrate-data');
      
      if (error) throw error;
      
      if (data.success) {
        setMigrationStatus('success');
        setStats(data.stats);
        toast.success("Migração concluída com sucesso!", {
          description: `${data.stats.clients} clientes e ${data.stats.goals} metas importados`,
          duration: 5000,
        });
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      setMigrationStatus('error');
      console.error('Erro na migração:', error);
      toast.error("Erro na migração", {
        description: error.message || "Não foi possível migrar os dados",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Migração de Dados</CardTitle>
            <CardDescription className="text-base">
              Importar todos os clientes, squads e metas para o banco de dados
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="premium"
            size="lg"
            onClick={handleMigration}
            disabled={isLoading || migrationStatus === 'success'}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Migrando dados...
              </>
            ) : migrationStatus === 'success' ? (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Dados Migrados!
              </>
            ) : (
              <>
                <Database className="mr-2 h-5 w-5" />
                Executar Migração
              </>
            )}
          </Button>
        </div>

        {migrationStatus === 'success' && stats && (
          <div className="rounded-lg bg-primary/5 p-4 border border-primary/20">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-2 flex-1">
                <p className="font-semibold text-foreground">Migração Concluída</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Líderes:</span>
                    <span className="ml-2 font-semibold">{stats.leaders}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Squads:</span>
                    <span className="ml-2 font-semibold">{stats.squads}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Clientes:</span>
                    <span className="ml-2 font-semibold">{stats.clients}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Metas:</span>
                    <span className="ml-2 font-semibold">{stats.goals}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {migrationStatus === 'error' && (
          <div className="rounded-lg bg-destructive/5 p-4 border border-destructive/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">Erro na Migração</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Verifique os logs no console para mais detalhes
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground border-t border-border/50 pt-4">
          <p className="font-medium mb-2">⚠️ Importante:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Esta ação migra todos os 80+ clientes para o banco de dados</li>
            <li>Dados duplicados serão atualizados automaticamente</li>
            <li>Execute apenas uma vez para evitar dados duplicados</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Database, 
  Download, 
  Upload, 
  Bell,
  Shield,
  Info,
  Trash2,
  RefreshCw,
  Save
} from "lucide-react";
import { toast } from "sonner";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [compactView, setCompactView] = useState(false);

  const handleExportData = () => {
    toast.success("Exportação iniciada", {
      description: "Seus dados estão sendo preparados para download...",
    });
    // TODO: Implementar exportação real
  };

  const handleImportData = () => {
    toast.info("Importação", {
      description: "Selecione um arquivo para importar...",
    });
    // TODO: Implementar importação real
  };

  const handleClearCache = () => {
    localStorage.clear();
    toast.success("Cache limpo", {
      description: "Todos os dados temporários foram removidos.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Configurações</DialogTitle>
              <DialogDescription className="text-base mt-1">
                Gerencie preferências e configurações do sistema
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Database className="h-4 w-4" />
              Dados
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-2">
              <Info className="h-4 w-4" />
              Sobre
            </TabsTrigger>
          </TabsList>

          {/* Tab: Geral */}
          <TabsContent value="general" className="space-y-4 mt-4 max-h-[450px] overflow-y-auto pr-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  Notificações
                </CardTitle>
                <CardDescription>Configure alertas e avisos do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-semibold">Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba alertas sobre check-ins e metas
                    </p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-semibold">Auto-salvar</Label>
                    <p className="text-sm text-muted-foreground">
                      Salvar alterações automaticamente
                    </p>
                  </div>
                  <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="font-semibold">Visualização Compacta</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduzir espaçamento entre elementos
                    </p>
                  </div>
                  <Switch checked={compactView} onCheckedChange={setCompactView} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Dados */}
          <TabsContent value="data" className="space-y-4 mt-4 max-h-[450px] overflow-y-auto pr-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  Gerenciamento de Dados
                </CardTitle>
                <CardDescription>Exportar, importar e gerenciar seus dados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={handleExportData}
                >
                  <Download className="h-4 w-4" />
                  Exportar Todos os Dados
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={handleImportData}
                >
                  <Upload className="h-4 w-4" />
                  Importar Dados
                </Button>
                <Separator />
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-amber-600 hover:text-amber-700"
                  onClick={handleClearCache}
                >
                  <RefreshCw className="h-4 w-4" />
                  Limpar Cache Local
                </Button>
              </CardContent>
            </Card>

            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Zona de Perigo
                </CardTitle>
                <CardDescription>Ações irreversíveis - use com cautela</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    toast.error("Funcionalidade desabilitada", {
                      description: "Entre em contato com o administrador",
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir Todos os Dados
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Segurança */}
          <TabsContent value="security" className="space-y-4 mt-4 max-h-[450px] overflow-y-auto pr-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Segurança e Privacidade
                </CardTitle>
                <CardDescription>Configurações de segurança do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-semibold">Status de Segurança</Label>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      Protegido
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Conexão segura estabelecida
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="font-semibold">Últimas Atividades</Label>
                  <div className="bg-muted/30 rounded-lg p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Último login:</span>
                      <span className="font-medium">Hoje às 14:30</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-ins registrados:</span>
                      <span className="font-medium">156 este mês</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Sobre */}
          <TabsContent value="about" className="space-y-4 mt-4 max-h-[450px] overflow-y-auto pr-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  Informações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Versão:</span>
                    <Badge variant="outline">1.0.0</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Última atualização:</span>
                    <span className="text-sm font-medium">25/11/2025</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ambiente:</span>
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      Produção
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-semibold">Dashboard de Metas</p>
                  <p className="text-xs text-muted-foreground">
                    Sistema de acompanhamento estratégico de objetivos e resultados desenvolvido para otimizar a gestão de metas de clientes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button 
            variant="default"
            onClick={() => {
              toast.success("Configurações salvas!", {
                description: "Suas preferências foram atualizadas.",
              });
              onOpenChange(false);
            }}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

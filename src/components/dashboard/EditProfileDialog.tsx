import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, User, Mail, Save, Users, Upload, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProfileDialog = ({ open, onOpenChange }: EditProfileDialogProps) => {
  const { profile, role, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [squadName, setSquadName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>(profile?.avatar_url || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (profile && open) {
      setName(profile.name || "");
      setAvatarUrl(profile.avatar_url || "");
      fetchSquadName();
    }
  }, [profile, open]);

  const fetchSquadName = async () => {
    if (!profile?.squad_id) {
      setSquadName("Nenhum squad atribuído");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("squads")
        .select("name")
        .eq("id", profile.squad_id)
        .maybeSingle();

      if (error) throw error;
      setSquadName(data?.name || "Squad não encontrado");
    } catch (error) {
      console.error("Error fetching squad:", error);
      setSquadName("Erro ao carregar squad");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      // Deletar avatar antigo se existir
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      // Upload novo avatar
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success("Avatar atualizado!");
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error("Erro ao fazer upload da imagem");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!avatarUrl || !user?.id) return;

    setUploadingAvatar(true);
    try {
      const oldPath = avatarUrl.split('/').slice(-2).join('/');
      await supabase.storage.from('avatars').remove([oldPath]);

      setAvatarUrl("");
      toast.success("Avatar removido!");
    } catch (error) {
      console.error('Erro ao remover avatar:', error);
      toast.error("Erro ao remover avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    if (!name.trim()) {
      toast.error("Por favor, preencha o nome");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          name: name.trim(),
          avatar_url: avatarUrl || null
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Perfil atualizado com sucesso!");
      onOpenChange(false);
      
      // Recarregar página para atualizar o contexto
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error("Erro ao atualizar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleName = () => {
    switch (role) {
      case 'investidor': return 'Investidor';
      case 'coordenador': return 'Coordenador';
      case 'supervisor': return 'Supervisor';
      default: return 'Usuário';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            Editar Perfil
          </DialogTitle>
          <DialogDescription>
            Atualize suas informações pessoais
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4 p-4 bg-muted/30 rounded-lg border">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={profile?.name || 'Avatar'} />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {profile?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('avatar-upload')?.click()}
                disabled={uploadingAvatar}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {avatarUrl ? 'Alterar Foto' : 'Adicionar Foto'}
              </Button>
              {avatarUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                  Remover
                </Button>
              )}
            </div>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground text-center">
              Formatos aceitos: JPG, PNG, WEBP • Tamanho máximo: 2MB
            </p>
            <Badge variant="outline" className="mt-2">
              {getRoleName()}
            </Badge>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Nome Completo
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome completo"
              className="text-base"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              value={profile?.email || user?.email || ""}
              disabled
              className="text-base bg-muted/50"
            />
            <p className="text-xs text-muted-foreground">
              O email não pode ser alterado
            </p>
          </div>

          {/* Role (read-only) */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Função no Sistema</Label>
            <div className="p-3 bg-muted/50 rounded-md border">
              <Badge variant="secondary" className="text-sm">
                {getRoleName()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Sua função é definida pelo administrador do sistema
            </p>
          </div>

          {/* Squad (read-only) */}
          <div className="space-y-2">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Squad
            </Label>
            <div className="p-3 bg-muted/50 rounded-md border">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{squadName || "Carregando..."}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Seu squad é atribuído pelo administrador do sistema
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

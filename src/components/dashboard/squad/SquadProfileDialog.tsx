import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Camera, Users, UserCircle, Building2 } from "lucide-react";

interface SquadMember {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: string;
}

interface Squad {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  logo_url: string | null;
  description: string | null;
  leader_id: string | null;
}

interface SquadProfileDialogProps {
  squad: Squad | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canEdit?: boolean;
}

export const SquadProfileDialog = ({ squad, open, onOpenChange, canEdit = false }: SquadProfileDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [members, setMembers] = useState<SquadMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (squad && open) {
      setName(squad.name);
      setDescription(squad.description || '');
      setLogoUrl(squad.logo_url);
      fetchMembers();
    }
  }, [squad, open]);

  const fetchMembers = async () => {
    if (!squad?.id) return;
    setLoadingMembers(true);
    try {
      // Use security definer function to get members with roles
      const { data, error } = await supabase
        .rpc('get_squad_members_with_roles', { _squad_id: squad.id });

      if (error) throw error;

      setMembers((data || []).map(m => ({
        id: m.id,
        name: m.name,
        email: m.email,
        avatar_url: m.avatar_url,
        role: m.role || 'investidor'
      })));
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !squad?.id) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${squad.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('squad-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('squad-logos')
        .getPublicUrl(fileName);

      setLogoUrl(publicUrl);
      toast.success("Logo carregada com sucesso!");
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast.error("Erro ao fazer upload: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!squad?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('squads')
        .update({
          name,
          description: description || null,
          logo_url: logoUrl,
        })
        .eq('id', squad.id);

      if (error) throw error;

      toast.success("Squad atualizada com sucesso!");
      await queryClient.invalidateQueries({ queryKey: ["squads-with-clients"] });
      await queryClient.invalidateQueries({ queryKey: ["squads"] });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating squad:", error);
      toast.error("Erro ao atualizar: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'supervisor': return 'destructive';
      case 'coordenador': return 'default';
      default: return 'secondary';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'supervisor': return 'Supervisor';
      case 'coordenador': return 'Coordenador';
      default: return 'Investidor';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Perfil da Squad
          </DialogTitle>
          <DialogDescription>
            {canEdit ? "Edite as informações da squad." : "Visualize as informações da squad."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Squad Avatar and Basic Info */}
          <div className="flex items-start gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={logoUrl || undefined} alt={squad?.name} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {squad?.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {canEdit && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>

            <div className="flex-1 space-y-3">
              {canEdit ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="squad-name">Nome da Squad</Label>
                    <Input
                      id="squad-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome da squad"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="squad-description">Descrição</Label>
                    <Textarea
                      id="squad-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descreva a squad, objetivos, etc."
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold">{squad?.name}</h3>
                  {description && (
                    <p className="text-muted-foreground text-sm">{description}</p>
                  )}
                  <Badge variant="outline">@{squad?.slug}</Badge>
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Squad Members */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h4 className="font-semibold">Membros da Squad</h4>
              <Badge variant="secondary">{members.length}</Badge>
            </div>

            {loadingMembers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : members.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Nenhum membro encontrado
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {members.map((member) => (
                  <Card key={member.id} className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {member.name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                        </div>
                        <Badge variant={getRoleBadgeVariant(member.role)} className="text-xs">
                          {getRoleLabel(member.role)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {canEdit ? 'Cancelar' : 'Fechar'}
          </Button>
          {canEdit && (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
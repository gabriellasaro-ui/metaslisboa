import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Loader2, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { EditUserDialog } from "./EditUserDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserData {
  id: string;
  name: string;
  email: string;
  squad_id: string | null;
  squad_name?: string;
  role: string;
}

interface AdminUsersListProps {
  onUpdate: () => void;
}

export const AdminUsersList = ({ onUpdate }: AdminUsersListProps) => {
  const { isSupervisor } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
    
    // Setup realtime subscription
    const channel = supabase
      .channel('admin-users-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('✅ Profile changed:', payload);
          fetchUsers();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles'
        },
        (payload) => {
          console.log('✅ User role changed:', payload);
          fetchUsers();
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
      });

    return () => {
      console.log('🔌 Disconnecting realtime channel');
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('🔄 Fetching users...');
      // Buscar todos os perfis com suas roles e squads
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          name,
          email,
          squad_id,
          squads!profiles_squad_id_fkey(name)
        `)
        .order("name");

      if (profilesError) throw profilesError;

      // Buscar roles de cada usuário
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      console.log('📊 Profiles:', profiles);
      console.log('👥 Roles:', roles);

      // Mapear roles por user_id (pegar a primeira role encontrada)
      const rolesMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      // Combinar dados
      const usersData: UserData[] = profiles?.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        squad_id: profile.squad_id,
        squad_name: (profile.squads as any)?.name || undefined,
        role: rolesMap.get(profile.id) || "investidor",
      })) || [];

      console.log('✅ Users data loaded:', usersData);
      setUsers(usersData);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    try {
      // Primeiro deletar o registro em user_roles
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", deletingUser.id);

      if (roleError) throw roleError;

      // Depois deletar o perfil (isso também deletará o usuário de auth devido ao cascade)
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", deletingUser.id);

      if (profileError) throw profileError;

      toast.success("Usuário excluído com sucesso!");
      fetchUsers();
      onUpdate();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Erro ao excluir usuário");
    } finally {
      setDeletingUser(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      supervisor: { label: "Supervisor", variant: "destructive" },
      coordenador: { label: "Coordenador", variant: "default" },
      investidor: { label: "Investidor", variant: "secondary" },
    };

    const config = roleConfig[role] || { label: role, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.squad_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou squad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Squad</TableHead>
              <TableHead>Cargo</TableHead>
              {isSupervisor && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  {user.squad_name ? (
                    <Badge variant="outline">{user.squad_name}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">Sem squad</span>
                  )}
                </TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                {isSupervisor && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingUser(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingUser(user)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {isSupervisor && (
        <>
          <EditUserDialog
            user={editingUser}
            open={!!editingUser}
            onOpenChange={(open) => !open && setEditingUser(null)}
            onSuccess={() => {
              fetchUsers();
              onUpdate();
            }}
          />

          <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o usuário <strong>{deletingUser?.name}</strong>?
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </>
  );
};
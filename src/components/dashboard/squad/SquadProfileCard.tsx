import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, Edit2, Users } from "lucide-react";
import { Squad } from "@/types";
import { SquadProfileDialog } from "./SquadProfileDialog";
import { useAuth } from "@/contexts/AuthContext";

interface SquadProfileCardProps {
  squad: Squad;
}

export const SquadProfileCard = ({ squad }: SquadProfileCardProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { role } = useAuth();
  const canEdit = role === 'coordenador' || role === 'supervisor';

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-4 border-background shadow-lg">
                <AvatarImage src={squad.logoUrl || undefined} alt={squad.name} />
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {squad.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {squad.name}
                </CardTitle>
                <CardDescription>
                  {squad.description || "Clique em editar para adicionar uma descrição"}
                </CardDescription>
              </div>
            </div>
            {canEdit && (
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
                <Edit2 className="h-4 w-4 mr-1" />
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{squad.clients.length} clientes</span>
            </div>
            {squad.slug && (
              <Badge variant="outline">@{squad.slug}</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <SquadProfileDialog
        squad={{
          id: squad.id,
          name: squad.name,
          slug: squad.slug || squad.name.toLowerCase().replace(/\s+/g, '-'),
          icon: null,
          logo_url: squad.logoUrl || null,
          description: squad.description || null,
          leader_id: null
        }}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        canEdit={canEdit}
      />
    </>
  );
};
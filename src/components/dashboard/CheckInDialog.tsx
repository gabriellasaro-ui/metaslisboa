import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Client } from "@/types";

// Type for progress status
export type ProgressStatus = "on_track" | "at_risk" | "delayed" | "completed";

// Type for check-in
export interface CheckIn {
  id?: string;
  date: Date;
  comment: string;
  progress: number;
  status: ProgressStatus;
  callLink?: string;
  callSummary?: string;
}
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CheckInDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedClient: Client) => void;
  leaderName: string;
}

export function CheckInDialog({ client, open, onOpenChange, onSave, leaderName }: CheckInDialogProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [progress, setProgress] = useState<number>(client?.currentProgress || 0);
  const [status, setStatus] = useState<ProgressStatus>("on_track");
  const [comment, setComment] = useState("");

  if (!client) return null;

  const handleSave = () => {
    const newCheckIn: CheckIn = {
      id: Date.now().toString(),
      date,
      progress,
      status,
      comment,
      updatedBy: leaderName,
    };

    const updatedClient: Client = {
      ...client,
      currentProgress: progress,
      checkIns: [...(client.checkIns || []), newCheckIn],
    };

    onSave(updatedClient);
    setComment("");
    setProgress(0);
    setStatus("on_track");
    setDate(new Date());
  };

  const statusOptions = [
    { value: "on_track", label: "No Prazo", color: "text-green-500" },
    { value: "at_risk", label: "Em Risco", color: "text-yellow-500" },
    { value: "delayed", label: "Atrasado", color: "text-red-500" },
    { value: "completed", label: "Concluído", color: "text-blue-500" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Check-in Semanal</DialogTitle>
          <DialogDescription>
            Cliente: {client.name} - {client.goalValue}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="date">Data do Check-in</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="progress">Progresso da Meta</Label>
            <Select value={progress.toString()} onValueChange={(value) => setProgress(Number(value) as ProgressStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o progresso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0% - Não iniciado</SelectItem>
                <SelectItem value="25">25% - Iniciado</SelectItem>
                <SelectItem value="50">50% - Em desenvolvimento</SelectItem>
                <SelectItem value="75">75% - Quase concluído</SelectItem>
                <SelectItem value="100">100% - Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status da Meta</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className={option.color}>{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comentários e Observações</Label>
            <Textarea
              id="comment"
              placeholder="Descreva o andamento da meta, desafios encontrados, próximos passos..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="premium" onClick={handleSave} disabled={!comment.trim()}>
            Registrar Check-in
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

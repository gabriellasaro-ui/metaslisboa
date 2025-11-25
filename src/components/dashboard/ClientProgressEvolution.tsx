import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Client {
  id: string;
  name: string;
  squad_id: string;
  squads: {
    name: string;
  };
}

interface CheckInData {
  date: string;
  progress: number;
  status: string;
  comment: string;
}

export const ClientProgressEvolution = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [chartData, setChartData] = useState<CheckInData[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState("");
  const [squadName, setSquadName] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      fetchClientProgress();
    }
  }, [selectedClientId]);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select(`
        id,
        name,
        squad_id,
        squads (
          name
        )
      `)
      .eq("status", "ativo")
      .order("name");

    if (error) {
      console.error("Erro ao buscar clientes:", error);
      return;
    }

    setClients(data || []);
    if (data && data.length > 0) {
      setSelectedClientId(data[0].id);
    }
  };

  const fetchClientProgress = async () => {
    setLoading(true);
    
    const { data: checkIns, error } = await supabase
      .from("check_ins")
      .select("created_at, progress, status, comment")
      .eq("client_id", selectedClientId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erro ao buscar check-ins:", error);
      setLoading(false);
      return;
    }

    const formattedData: CheckInData[] = (checkIns || []).map((checkIn) => ({
      date: format(new Date(checkIn.created_at), "dd/MM", { locale: ptBR }),
      progress: checkIn.progress,
      status: checkIn.status,
      comment: checkIn.comment,
    }));

    setChartData(formattedData);

    // Atualizar nome do cliente e squad
    const client = clients.find(c => c.id === selectedClientId);
    if (client) {
      setClientName(client.name);
      setSquadName(client.squads?.name || "");
    }

    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on_track": return "text-green-500";
      case "at_risk": return "text-yellow-500";
      case "delayed": return "text-red-500";
      case "completed": return "text-blue-500";
      default: return "text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "on_track": return "No Caminho";
      case "at_risk": return "Em Risco";
      case "delayed": return "Atrasado";
      case "completed": return "Concluído";
      default: return status;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-1">{data.date}</p>
          <p className="text-sm">
            Progresso: <span className="font-bold text-primary">{data.progress}%</span>
          </p>
          <p className="text-sm flex items-center gap-1 mt-1">
            Status: 
            <span className={`font-semibold ${getStatusColor(data.status)}`}>
              {getStatusLabel(data.status)}
            </span>
          </p>
          {data.comment && (
            <p className="text-xs text-muted-foreground mt-2 max-w-xs">
              {data.comment}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const averageProgress = chartData.length > 0
    ? Math.round(chartData.reduce((sum, item) => sum + item.progress, 0) / chartData.length)
    : 0;

  const latestProgress = chartData.length > 0 ? chartData[chartData.length - 1].progress : 0;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Evolução Temporal por Cliente</CardTitle>
            </div>
            <CardDescription>
              Acompanhe o progresso histórico de cada cliente ao longo das semanas
            </CardDescription>
          </div>
          
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger className="w-full md:w-[280px]">
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name} - {client.squads?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedClientId && (
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline" className="text-sm">
              Cliente: {clientName}
            </Badge>
            <Badge variant="outline" className="text-sm">
              Squad: {squadName}
            </Badge>
            <Badge variant="outline" className="text-sm">
              Check-ins: {chartData.length}
            </Badge>
            <Badge variant="outline" className="text-sm">
              Progresso Médio: {averageProgress}%
            </Badge>
            <Badge variant="outline" className="text-sm">
              Progresso Atual: {latestProgress}%
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">Nenhum check-in registrado ainda</p>
              <p className="text-sm text-muted-foreground">
                Os dados aparecerão assim que check-ins forem criados
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--foreground))' }}
              />
              <YAxis 
                domain={[0, 100]}
                className="text-xs"
                tick={{ fill: 'hsl(var(--foreground))' }}
                label={{ 
                  value: 'Progresso (%)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: 'hsl(var(--foreground))' }
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="progress" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                activeDot={{ r: 7 }}
                name="Progresso (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

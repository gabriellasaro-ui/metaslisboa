import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface Client {
  id: string;
  name: string;
  categoria_problema?: string;
  problema_central?: string;
}

interface ProblemaCategoryChartsProps {
  clients: Client[];
}

const CATEGORY_COLORS: Record<string, string> = {
  "Falta de alinhamento estrategico": "hsl(0, 72%, 51%)",
  "Expectativa vs Realidade": "hsl(0, 65%, 45%)",
  "Comunicacao deficiente": "hsl(0, 0%, 25%)",
  "Resultados abaixo do esperado": "hsl(0, 60%, 55%)",
  "Problemas financeiros do cliente": "hsl(0, 0%, 50%)",
  "Mudanca de gestao/equipe": "hsl(0, 55%, 40%)",
  "Falta de engajamento": "hsl(0, 50%, 35%)",
  "Escopo mal definido": "hsl(0, 0%, 35%)",
  "Prazo inadequado": "hsl(0, 45%, 50%)",
  "Qualidade das entregas": "hsl(0, 40%, 45%)",
  "Atendimento/Suporte": "hsl(0, 35%, 55%)",
  "Concorrencia": "hsl(0, 0%, 40%)",
  "Reestruturacao interna": "hsl(0, 30%, 50%)",
  "Outro": "hsl(0, 0%, 70%)",
};

const DEFAULT_CATEGORIES = [
  "Falta de alinhamento estrategico",
  "Expectativa vs Realidade",
  "Comunicacao deficiente",
  "Resultados abaixo do esperado",
  "Problemas financeiros do cliente",
  "Mudanca de gestao/equipe",
  "Falta de engajamento",
  "Escopo mal definido",
  "Prazo inadequado",
  "Qualidade das entregas",
  "Atendimento/Suporte",
  "Concorrencia",
  "Reestruturacao interna",
  "Outro",
];

export const ProblemaCategoryCharts = ({ clients }: ProblemaCategoryChartsProps) => {
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    
    clients.forEach(client => {
      const category = client.categoria_problema || "Outro";
      counts[category] = (counts[category] || 0) + 1;
    });

    return DEFAULT_CATEGORIES
      .map(category => ({
        name: category,
        value: counts[category] || 0,
        color: CATEGORY_COLORS[category] || "hsl(0, 0%, 60%)",
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [clients]);

  const pieData = useMemo(() => {
    const total = categoryData.reduce((sum, item) => sum + item.value, 0);
    return categoryData.map(item => ({
      ...item,
      percentage: total > 0 ? ((item.value / total) * 100).toFixed(0) : 0,
    }));
  }, [categoryData]);

  if (categoryData.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart - Ofensores por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Ofensores por Categoria</CardTitle>
          <CardDescription>Principais problemas identificados nos projetos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value} clientes`, 'Quantidade']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[0, 4, 4, 0]}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pie Chart - Distribuição por Motivo */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Motivo</CardTitle>
          <CardDescription>Porcentagem de cada ofensor identificado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  labelLine={true}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value} clientes`, name]}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend 
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, ResponsiveContainer, Cell } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { TrendingUp, Users, Repeat, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const monthlyRevenueData = [
  { month: "Ene", revenue: 1860 }, { month: "Feb", revenue: 3050 }, { month: "Mar", revenue: 2370 },
  { month: "Abr", revenue: 1730 }, { month: "May", revenue: 2090 }, { month: "Jun", revenue: 2500 },
  { month: "Jul", revenue: 2800 }, { month: "Ago", revenue: 3100 }, { month: "Sep", revenue: 2900 },
  { month: "Oct", revenue: 3200 }, { month: "Nov", revenue: 3500 }, { month: "Dic", revenue: 4000 },
];

const revenueByTypeData = [
  { type: "Básico", value: 4500, fill: "hsl(var(--chart-1))" },
  { type: "Premium", value: 12500, fill: "hsl(var(--chart-2))" },
  { type: "Anual", value: 8000, fill: "hsl(var(--chart-3))" },
  { type: "Clases Sueltas", value: 1500, fill: "hsl(var(--chart-4))" },
];

const chartConfig: ChartConfig = {
  revenue: { label: "Ingresos", color: "hsl(var(--primary))" },
  basico: { label: "Básico", color: "hsl(var(--chart-1))" },
  premium: { label: "Premium", color: "hsl(var(--chart-2))" },
  anual: { label: "Anual", color: "hsl(var(--chart-3))" },
  clases: { label: "Clases Sueltas", color: "hsl(var(--chart-4))" },
};

const transactionHistory = [
  { id: "t1", date: new Date(2024, 6, 28), description: "Pago Membresía - Ana Pérez", amount: 50, type: "Ingreso" },
  { id: "t2", date: new Date(2024, 6, 27), description: "Compra Agua - Caja", amount: -2, type: "Egreso" },
  { id: "t3", date: new Date(2024, 6, 25), description: "Pago Membresía - Luis García", amount: 30, type: "Ingreso" },
  { id: "t4", date: new Date(2024, 6, 22), description: "Pago Proveedor Limpieza", amount: -100, type: "Egreso" },
];

export default function FinanzasPage() {
  return (
    <div className="flex flex-col gap-6">
      <CardHeader className="p-0 mb-2"> {/* Adjusted padding */}
        <CardTitle className="text-2xl">Panel Financiero Avanzado</CardTitle>
        <CardDescription>Análisis detallado del rendimiento económico de tu gimnasio.</CardDescription>
      </CardHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$150.00</div>
            <p className="text-xs text-muted-foreground">3 transacciones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Semana</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$850.50</div>
            <p className="text-xs text-muted-foreground">+8% vs semana pasada</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos Clientes (Mes)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Objetivo: 20</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retención (Mes)</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Renovaciones / Total Activos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Tendencia de Ingresos Mensuales</CardTitle>
            <CardDescription>Evolución de los ingresos a lo largo del año.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] p-2">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenueData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ingresos por Tipo de Membresía</CardTitle>
            <CardDescription>Distribución de ingresos actual.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center p-2">
            <ChartContainer config={chartConfig} className="w-full h-full aspect-square">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="value" hideLabel />} />
                  <Pie data={revenueByTypeData} dataKey="value" nameKey="type" cx="50%" cy="50%" outerRadius={"80%"} labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return ( (percent * 100) > 5 ? // Only show label if percent is > 5%
                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10}>
                          {`${(percent * 100).toFixed(0)}%`}
                        </text> : null
                      );
                    }}
                  >
                    {revenueByTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="type" />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Transacciones</CardTitle>
          <CardDescription>Últimos movimientos financieros registrados.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionHistory.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{format(transaction.date, "dd/MM/yyyy", { locale: es })}</TableCell>
                    <TableCell className="font-medium">{transaction.description}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === "Ingreso" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {transaction.type}
                      </span>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

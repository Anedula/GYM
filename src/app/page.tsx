
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Users, TrendingUp, Clock, DollarSign, PlusCircle, Info } from "lucide-react";
import Link from "next/link";
import type { ChartConfig } from "@/components/ui/chart";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const chartData = [
  { month: "Enero", revenue: 1860 },
  { month: "Febrero", revenue: 3050 },
  { month: "Marzo", revenue: 2370 },
  { month: "Abril", revenue: 1730 },
  { month: "Mayo", revenue: 2090 },
  { month: "Junio", revenue: 2500 },
];

const chartConfig = {
  revenue: {
    label: "Ingresos",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

interface ExpiringMember {
  id: string;
  name: string;
  expiryDate: string;
  plan: string;
}

const expiringMembers: ExpiringMember[] = [
  { id: "1", name: "Ana Pérez", expiryDate: "2024-08-05", plan: "Premium" },
  { id: "2", name: "Luis García", expiryDate: "2024-08-10", plan: "Básico" },
  { id: "3", name: "Sofía López", expiryDate: "2024-08-12", plan: "Premium" },
];

export default function DashboardPage() {
  const [selectedMember, setSelectedMember] = useState<ExpiringMember | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const handleViewDetails = (member: ExpiringMember) => {
    setSelectedMember(member);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125</div>
            <p className="text-xs text-muted-foreground">+5.2% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planes por Vencer</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">En los próximos 7 días</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,500</div>
            <p className="text-xs text-muted-foreground">+10.1% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">$450 acumulados</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2 md:flex-col">
           <Button asChild className="w-full md:w-auto">
            <Link href="/clientes/nuevo">
              <PlusCircle className="mr-2 h-4 w-4" /> Registrar Cliente
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full md:w-auto">
            <Link href="/planes?action=add_payment">
              <DollarSign className="mr-2 h-4 w-4" /> Registrar Pago
            </Link>
          </Button>
        </div>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Tendencia de Ingresos</CardTitle>
            <CardDescription>Ingresos mensuales durante los últimos 6 meses.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] p-2">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={true} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planes Próximos a Expirar</CardTitle>
          <CardDescription>Clientes cuyos planes expiran pronto.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Fecha de Vencimiento</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expiringMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.plan}</TableCell>
                  <TableCell>{member.expiryDate}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(member)}>
                      Ver Detalles <Info className="ml-2 h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedMember && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Detalles del Miembro</DialogTitle>
              <DialogDescription>
                Información detallada del miembro seleccionado.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="detail-name" className="text-right col-span-1">Nombre</Label>
                <p id="detail-name" className="col-span-3 font-medium">{selectedMember.name}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="detail-plan" className="text-right col-span-1">Plan</Label>
                <p id="detail-plan" className="col-span-3">{selectedMember.plan}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="detail-expiry" className="text-right col-span-1">Vence</Label>
                <p id="detail-expiry" className="col-span-3">{selectedMember.expiryDate}</p>
              </div>
            </div>
            {/* You can add DialogFooter with a close button if needed, but the X icon is usually enough */}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}


"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { PlusCircle, Search, Filter, UserX, UserCheck, Hourglass } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link"; // Importar Link


interface Client {
  id: string;
  name: string;
  email: string;
  membershipStatus: "activo" | "expirado" | "pendiente";
  expiryDate: string;
  lastPayment: string;
  plan: string;
}

const mockClients: Client[] = [
  { id: "1", name: "Carlos Santana", email: "carlos@example.com", membershipStatus: "activo", expiryDate: "2024-12-31", lastPayment: "2024-07-01", plan: "Premium" },
  { id: "2", name: "Laura Méndez", email: "laura@example.com", membershipStatus: "expirado", expiryDate: "2024-06-15", lastPayment: "2023-06-15", plan: "Básico" },
  { id: "3", name: "Pedro Pascal", email: "pedro@example.com", membershipStatus: "pendiente", expiryDate: "2024-07-31", lastPayment: "N/A", plan: "Mensual" },
  { id: "4", name: "Isabel Allende", email: "isabel@example.com", membershipStatus: "activo", expiryDate: "2025-03-10", lastPayment: "2024-03-10", plan: "Anual" },
  { id: "5", name: "Juan Pérez", email: "juan.perez@example.com", membershipStatus: "activo", expiryDate: "2024-09-15", lastPayment: "2024-06-15", plan: "Premium" },
  { id: "6", name: "Ana López", email: "ana.lopez@example.com", membershipStatus: "expirado", expiryDate: "2024-05-01", lastPayment: "2023-05-01", plan: "Básico" },
];

const statusIcons: Record<Client["membershipStatus"], LucideIcon> = {
  activo: UserCheck,
  expirado: UserX,
  pendiente: Hourglass,
};

const statusColors: Record<Client["membershipStatus"], string> = {
  activo: "text-green-600",
  expirado: "text-red-600",
  pendiente: "text-yellow-600",
};


export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Record<Client["membershipStatus"], boolean>>({
    activo: true,
    expirado: true,
    pendiente: true,
  });

  const filteredClients = useMemo(() => {
    return mockClients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      statusFilter[client.membershipStatus]
    );
  }, [searchTerm, statusFilter]);

  const handleStatusFilterChange = (status: Client["membershipStatus"]) => {
    setStatusFilter(prev => ({ ...prev, [status]: !prev[status] }));
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Clientes</CardTitle>
          <CardDescription>Administra tu base de datos de clientes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar cliente por nombre..."
                className="pl-8 sm:w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="shrink-0">
                  <Filter className="mr-2 h-4 w-4" /> Filtrar por Estado
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.keys(statusFilter).map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilter[status as Client["membershipStatus"]]}
                    onCheckedChange={() => handleStatusFilterChange(status as Client["membershipStatus"])}
                    className="capitalize"
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button asChild>
              <Link href="/clientes/nuevo">
                <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Cliente
              </Link>
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Último Pago</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => {
                    const StatusIcon = statusIcons[client.membershipStatus];
                    return (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>
                          <span className={`flex items-center ${statusColors[client.membershipStatus]}`}>
                            <StatusIcon className="mr-1.5 h-4 w-4" />
                            <span className="capitalize">{client.membershipStatus}</span>
                          </span>
                        </TableCell>
                        <TableCell>{client.plan}</TableCell>
                        <TableCell>{client.expiryDate}</TableCell>
                        <TableCell>{client.lastPayment}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No se encontraron clientes que coincidan con tu búsqueda o filtros.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

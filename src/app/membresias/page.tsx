"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PlusCircle, Edit, Trash2, DollarSign, CalendarIcon, Mail } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: string; // e.g., "1 mes", "1 año"
  description: string;
}

interface PaymentRecord {
  id: string;
  clientName: string;
  clientId: string;
  planName: string;
  planId: string;
  paymentDate: Date;
  expiryDate: Date;
  amount: number;
}

const mockPlans: MembershipPlan[] = [
  { id: "1", name: "Básico Mensual", price: 30, duration: "1 mes", description: "Acceso a todas las áreas, sin clases." },
  { id: "2", name: "Premium Mensual", price: 50, duration: "1 mes", description: "Acceso total, incluye clases grupales." },
  { id: "3", name: "Anual Premium", price: 500, duration: "1 año", description: "Acceso total, clases, y 10% de descuento." },
];

const mockPayments: PaymentRecord[] = [
  { id: "p1", clientName: "Carlos Santana", clientId: "1", planName: "Premium Mensual", planId: "2", paymentDate: new Date(2024, 6, 1), expiryDate: new Date(2024, 7, 1), amount: 50 },
  { id: "p2", clientName: "Isabel Allende", clientId: "4", planName: "Anual Premium", planId: "3", paymentDate: new Date(2024, 2, 10), expiryDate: new Date(2025, 2, 10), amount: 500 },
];

// Mock clients for payment registration dropdown
const mockClientsForPayment = [
  { id: "1", name: "Carlos Santana" },
  { id: "2", name: "Laura Méndez" },
  { id: "3", name: "Pedro Pascal" },
  { id: "4", name: "Isabel Allende" },
  { id: "5", name: "Juan Pérez" },
];


export default function MembresiasPage() {
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const handleEditPlan = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setIsPlanDialogOpen(true);
  };

  const handleAddNewPlan = () => {
    setSelectedPlan(null);
    setIsPlanDialogOpen(true);
  };
  
  const handlePlanFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // In a real app, handle form submission (create/update plan)
    const formData = new FormData(event.currentTarget);
    const planData = {
      name: formData.get('name'),
      price: formData.get('price'),
      duration: formData.get('duration'),
      description: formData.get('description'),
    };
    console.log("Plan data:", planData, "Selected Plan:", selectedPlan);
    toast({ title: selectedPlan ? "Plan Actualizado" : "Plan Creado", description: `El plan "${planData.name}" ha sido ${selectedPlan ? 'actualizado' : 'creado'} exitosamente.` });
    setIsPlanDialogOpen(false);
  };

  const handlePaymentFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // In a real app, handle form submission (register payment)
    const formData = new FormData(event.currentTarget);
    const paymentData = {
      clientId: formData.get('client'),
      planId: formData.get('plan'),
      paymentDate: paymentDate,
    };
    console.log("Payment data:", paymentData);
    toast({ title: "Pago Registrado", description: `El pago ha sido registrado exitosamente.` });
    setIsPaymentDialogOpen(false);
  };

  const sendReminder = (payment: PaymentRecord) => {
    toast({
      title: "Recordatorio Enviado",
      description: `Se ha enviado un recordatorio de pago a ${payment.clientName}.`,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle>Planes de Membresía</CardTitle>
            <CardDescription>Define y administra los planes que ofreces.</CardDescription>
          </div>
          <Button onClick={handleAddNewPlan}>
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Plan
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockPlans.map(plan => (
            <Card key={plan.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.duration}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-2xl font-bold">${plan.price}</p>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditPlan(plan)}>
                  <Edit className="mr-2 h-3 w-3" /> Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => alert(`Eliminar plan ${plan.name}? (Función no implementada)`)}>
                  <Trash2 className="mr-2 h-3 w-3" /> Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedPlan ? "Editar Plan" : "Añadir Nuevo Plan"}</DialogTitle>
            <DialogDescription>
              {selectedPlan ? "Modifica los detalles del plan." : "Completa los detalles para un nuevo plan."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePlanFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plan-name" className="text-right">Nombre</Label>
                <Input id="plan-name" name="name" defaultValue={selectedPlan?.name} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plan-price" className="text-right">Precio ($)</Label>
                <Input id="plan-price" name="price" type="number" defaultValue={selectedPlan?.price} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plan-duration" className="text-right">Duración</Label>
                <Input id="plan-duration" name="duration" defaultValue={selectedPlan?.duration} placeholder="Ej: 1 mes, 3 meses, 1 año" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plan-description" className="text-right">Descripción</Label>
                <Input id="plan-description" name="description" defaultValue={selectedPlan?.description} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPlanDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">{selectedPlan ? "Guardar Cambios" : "Crear Plan"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle>Control de Pagos</CardTitle>
            <CardDescription>Registra pagos y visualiza vencimientos.</CardDescription>
          </div>
          <Button onClick={() => setIsPaymentDialogOpen(true)}>
            <DollarSign className="mr-2 h-4 w-4" /> Registrar Pago
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Fecha de Pago</TableHead>
                  <TableHead>Fecha de Vencimiento</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPayments.map(payment => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.clientName}</TableCell>
                    <TableCell>{payment.planName}</TableCell>
                    <TableCell>{format(payment.paymentDate, "PPP", { locale: es })}</TableCell>
                    <TableCell>{format(payment.expiryDate, "PPP", { locale: es })}</TableCell>
                    <TableCell>${payment.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => sendReminder(payment)}>
                        <Mail className="mr-2 h-4 w-4" /> Recordatorio
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                 {mockPayments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">No hay pagos registrados.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>
              Selecciona el cliente, el plan y la fecha del pago.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePaymentFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment-client" className="text-right">Cliente</Label>
                <Select name="client" required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClientsForPayment.map(client => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment-plan" className="text-right">Plan</Label>
                <Select name="plan" required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona un plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPlans.map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>{plan.name} (${plan.price})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment-date" className="text-right">Fecha de Pago</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="col-span-3 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {paymentDate ? format(paymentDate, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={paymentDate}
                      onSelect={setPaymentDate}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">Registrar Pago</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

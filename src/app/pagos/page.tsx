
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DollarSign, CalendarIcon, Mail } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: string; 
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

interface ClientStub {
  id: string;
  name: string;
}

// mockPlans is defined here but not directly used in this version of the form.
// It might be used for displaying plan details or if plan selection is re-introduced.
const mockPlans: MembershipPlan[] = [
  { id: "1", name: "Básico Mensual", price: 30, duration: "1 mes", description: "Acceso a todas las áreas, sin clases." },
  { id: "2", name: "Premium Mensual", price: 50, duration: "1 mes", description: "Acceso total, incluye clases grupales." },
  { id: "3", name: "Anual Premium", price: 500, duration: "1 año", description: "Acceso total, clases, y 10% de descuento." },
];

const mockPayments: PaymentRecord[] = [
  { id: "p1", clientName: "Carlos Santana", clientId: "1", planName: "Premium Mensual", planId: "2", paymentDate: new Date(2024, 6, 1), expiryDate: new Date(2024, 7, 1), amount: 50 },
  { id: "p2", clientName: "Isabel Allende", clientId: "4", planName: "Anual Premium", planId: "3", paymentDate: new Date(2024, 2, 10), expiryDate: new Date(2025, 2, 10), amount: 500 },
];

const mockClientsForPayment: ClientStub[] = [
  { id: "1", name: "Carlos Santana" },
  { id: "2", name: "Laura Méndez" },
  { id: "3", name: "Pedro Pascal" },
  { id: "4", name: "Isabel Allende" },
  { id: "5", name: "Juan Pérez" },
];

export default function PagosPage() {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const handlePaymentFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const selectedClient = mockClientsForPayment.find(c => c.id === formData.get('client'));
    
    const paymentData = {
      clientId: formData.get('client'),
      clientName: selectedClient?.name, // For the toast message
      paymentDate: paymentDate,
      // Plan is no longer selected in this form.
      // In a real app, you would determine the plan based on the client or other logic.
    };
    console.log("Payment data (Plan not selected in form):", paymentData);
    
    toast({ 
      title: "Pago Registrado", 
      description: `El pago para ${paymentData.clientName || 'el cliente seleccionado'} ha sido registrado con fecha ${paymentDate ? format(paymentDate, "PPP", {locale: es}) : 'N/A'}.` 
    });
    setIsPaymentDialogOpen(false);
    // Reset date for next entry
    setPaymentDate(new Date()); 
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
            <CardTitle>Control de Pagos</CardTitle>
            <CardDescription>Registra pagos y visualiza vencimientos.</CardDescription>
          </div>
          <Button onClick={() => {
            setPaymentDate(new Date()); // Reset date when opening dialog
            setIsPaymentDialogOpen(true);
            }}
          >
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
              Selecciona el cliente y la fecha del pago.
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
              {/* Plan selection removed from here */}
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
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
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

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: string; // e.g., "1 mes", "1 año"
  description: string;
}

const mockPlans: MembershipPlan[] = [
  { id: "1", name: "Básico Mensual", price: 30, duration: "1 mes", description: "Acceso a todas las áreas, sin clases." },
  { id: "2", name: "Premium Mensual", price: 50, duration: "1 mes", description: "Acceso total, incluye clases grupales." },
  { id: "3", name: "Anual Premium", price: 500, duration: "1 año", description: "Acceso total, clases, y 10% de descuento." },
];

export default function MembresiasPage() {
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
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
    </div>
  );
}

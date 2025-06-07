
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  classLimit: number; 
  renewalType: "Mensual" | "Semanal";
  allowedClasses?: string[]; 
  description: string;
}

const availableClassTypesForPlans = ["Funcional", "Zumba", "Yoga", "Spinning", "Boxeo", "Pilates"];

const mockPlans: MembershipPlan[] = [
  { id: "1", name: "Básico Mensual", price: 3000, classLimit: 8, renewalType: "Mensual", description: "Acceso a 8 clases al mes.", allowedClasses: ["Yoga", "Pilates"] },
  { id: "2", name: "Premium Mensual", price: 5000, classLimit: 12, renewalType: "Mensual", description: "Acceso a 12 clases al mes, cualquiera.", },
  { id: "p_funcional", name: "PLAN FUNCIONAL", price: 10000, classLimit: 3, renewalType: "Semanal", allowedClasses: ["Funcional"], description: "3 Clases de funcional por semana." },
  { id: "p_libre", name: "PLAN LIBRE", price: 35000, classLimit: 12, renewalType: "Mensual", description: "12 Clases cualesquiera por mes." },
  { id: "p_zumba_funcional", name: "PLAN ZUMBA & FUNCIONAL", price: 35000, classLimit: 12, renewalType: "Mensual", allowedClasses: ["Zumba", "Funcional"], description: "12 Clases (Zumba o Funcional) por mes." },
];


export default function PlanesPage() {
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [currentAllowedClasses, setCurrentAllowedClasses] = useState<string[]>([]);
  const { toast } = useToast();

  const handleEditPlan = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setCurrentAllowedClasses(plan.allowedClasses || []);
    setIsPlanDialogOpen(true);
  };

  const handleAddNewPlan = () => {
    setSelectedPlan(null);
    setCurrentAllowedClasses([]);
    setIsPlanDialogOpen(true);
  };
  
  const handlePlanFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const planData = {
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      classLimit: parseInt(formData.get('classLimit') as string),
      renewalType: formData.get('renewalType') as "Mensual" | "Semanal",
      description: formData.get('description') as string,
      allowedClasses: currentAllowedClasses,
    };

    // Basic validation example
    if (!planData.name || isNaN(planData.price) || isNaN(planData.classLimit) || !planData.renewalType) {
        toast({ title: "Error", description: "Por favor, completa todos los campos obligatorios.", variant: "destructive" });
        return;
    }

    console.log("Plan data:", planData, "Selected Plan ID:", selectedPlan?.id);
    toast({ title: selectedPlan ? "Plan Actualizado" : "Plan Creado", description: `El plan "${planData.name}" ha sido ${selectedPlan ? 'actualizado' : 'creado'} exitosamente.` });
    setIsPlanDialogOpen(false);
    // Here you would typically update your mockPlans array or send data to a backend
    // For now, let's just log it and reset.
    if (selectedPlan) {
        // Update existing plan (simplified)
        const index = mockPlans.findIndex(p => p.id === selectedPlan.id);
        if (index !== -1) {
            // mockPlans[index] = { ...selectedPlan, ...planData }; // This needs careful handling for id
        }
    } else {
        // Add new plan (simplified)
        // mockPlans.push({ id: String(mockPlans.length + 100), ...planData }); // This needs a proper ID generation
    }
  };

  const handleAllowedClassChange = (className: string, checked: boolean) => {
    setCurrentAllowedClasses(prev => {
      if (checked) {
        return [...prev, className];
      } else {
        return prev.filter(c => c !== className);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle>Planes y Precios</CardTitle>
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
                <CardDescription>Renovación: {plan.renewalType}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <p className="text-2xl font-bold">${plan.price}</p>
                <p className="text-sm">Límite de clases: {plan.classLimit}</p>
                {plan.allowedClasses && plan.allowedClasses.length > 0 && (
                  <p className="text-sm text-muted-foreground">Clases permitidas: {plan.allowedClasses.join(", ")}</p>
                )}
                {(!plan.allowedClasses || plan.allowedClasses.length === 0) && (
                    <p className="text-sm text-muted-foreground">Permite cualquier clase.</p>
                )}
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
        <DialogContent className="sm:max-w-md">
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
                <Input id="plan-price" name="price" type="number" step="0.01" defaultValue={selectedPlan?.price} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plan-classLimit" className="text-right">Cant. Clases</Label>
                <Input id="plan-classLimit" name="classLimit" type="number" defaultValue={selectedPlan?.classLimit} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plan-renewalType" className="text-right">Renovación</Label>
                <Select name="renewalType" defaultValue={selectedPlan?.renewalType} required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Tipo de renovación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mensual">Mensual</SelectItem>
                    <SelectItem value="Semanal">Semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Clases Permitidas (Opcional)</Label>
                <div className="col-span-3 space-y-2">
                  <p className="text-xs text-muted-foreground">Si no se selecciona ninguna, el plan permite cualquier clase hasta el límite definido.</p>
                  {availableClassTypesForPlans.map(classType => (
                    <div key={classType} className="flex items-center space-x-2">
                      <Checkbox
                        id={`class-${classType}`}
                        checked={currentAllowedClasses.includes(classType)}
                        onCheckedChange={(checked) => handleAllowedClassChange(classType, !!checked)}
                      />
                      <Label htmlFor={`class-${classType}`} className="font-normal">{classType}</Label>
                    </div>
                  ))}
                </div>
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
 

"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, type FieldPath } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel, // This is the ShadCN FormLabel for main field labels
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Info, ChevronsRight, Check } from "lucide-react";
import { format, addMonths, addWeeks } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label"; // Basic Label for radio/checkbox items

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  classLimit: number;
  renewalType: "Mensual" | "Semanal";
  allowedClasses?: string[];
  description: string;
}

const mockPlans: MembershipPlan[] = [
    { id: "1", name: "Básico Mensual", price: 3000, classLimit: 8, renewalType: "Mensual", description: "Acceso a 8 clases al mes.", allowedClasses: ["Yoga", "Pilates"] },
    { id: "2", name: "Premium Mensual", price: 5000, classLimit: 12, renewalType: "Mensual", description: "Acceso a 12 clases al mes, cualquiera.", },
    { id: "p_funcional", name: "PLAN FUNCIONAL", price: 10000, classLimit: 3, renewalType: "Semanal", allowedClasses: ["Funcional"], description: "3 Clases de funcional por semana." },
    { id: "p_libre", name: "PLAN LIBRE", price: 35000, classLimit: 12, renewalType: "Mensual", description: "12 Clases cualesquiera por mes." },
    { id: "p_zumba_funcional", name: "PLAN ZUMBA & FUNCIONAL", price: 35000, classLimit: 12, renewalType: "Mensual", allowedClasses: ["Zumba", "Funcional"], description: "12 Clases (Zumba o Funcional) por mes." },
];

const objectivesList = [
  { id: "perderPeso", label: "Perder peso" },
  { id: "ganarMusculo", label: "Ganar masa muscular" },
  { id: "mejorarResistencia", label: "Mejorar resistencia" },
  { id: "mantenerseActivo", label: "Mantenerse activo/a" },
  { id: "rehabilitacion", label: "Rehabilitación" },
  { id: "reducirEstres", label: "Reducir estrés"},
];

const formSchema = z.object({
  // Datos Personales
  nombreCompleto: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  fechaNacimiento: z.date({ required_error: "La fecha de nacimiento es obligatoria." }),
  telefono: z.string().regex(/^\+54\s?(?:(?:11\s?)?(?:\d{4}|\d{2}\d{2})[- ]?\d{4}|(?:2\d{2,3}|3\d{2,3})[- ]?\d{6})$/, { message: "Número de teléfono inválido para Argentina (+54 XX XXXXXXXX)." }),
  email: z.string().email({ message: "Correo electrónico inválido." }),
  direccion: z.string().optional(),
  contactoEmergenciaNombre: z.string().min(3, { message: "Nombre del contacto de emergencia es requerido." }),
  contactoEmergenciaRelacion: z.string().min(2, { message: "Relación del contacto es requerida."}),
  contactoEmergenciaTelefono: z.string().regex(/^[0-9\s+-]+$/, { message: "Teléfono de emergencia inválido."}),

  // Plan y Pagos
  fechaInicioMembresia: z.date({ required_error: "Fecha de inicio es obligatoria." }),
  tipoMembresiaId: z.string({ required_error: "Debe seleccionar un plan." }),
  metodoPagoPreferido: z.string({ required_error: "Debe seleccionar un método de pago." }),

  // Cuestionario de Salud
  condicionMedicaPreexistente: z.enum(["si", "no"], { required_error: "Seleccione una opción." }),
  condicionMedicaDescripcion: z.string().optional(),
  alergias: z.enum(["si", "no"], { required_error: "Seleccione una opción." }),
  alergiasDescripcion: z.string().optional(),
  medicamentosActuales: z.enum(["si", "no"], { required_error: "Seleccione una opción." }),
  medicamentosLista: z.string().optional(),
  nivelActividadFisica: z.enum(["principiante", "intermedio", "avanzado", "ninguno"], { required_error: "Seleccione su nivel." }),
  objetivosGimnasio: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Debes seleccionar al menos un objetivo.",
  }),
  objetivosOtros: z.string().optional(),
}).refine(data => !(data.condicionMedicaPreexistente === "si" && !data.condicionMedicaDescripcion?.trim()), {
  message: "Debe describir la condición médica si seleccionó 'Sí'.",
  path: ["condicionMedicaDescripcion"],
}).refine(data => !(data.alergias === "si" && !data.alergiasDescripcion?.trim()), {
  message: "Debe especificar las alergias si seleccionó 'Sí'.",
  path: ["alergiasDescripcion"],
}).refine(data => !(data.medicamentosActuales === "si" && !data.medicamentosLista?.trim()), {
  message: "Debe enumerar los medicamentos si seleccionó 'Sí'.",
  path: ["medicamentosLista"],
});

export type NuevoClienteFormValues = z.infer<typeof formSchema>;

const STEPS_CONFIG = [
  {
    id: 1,
    name: "Datos Personales",
    fields: [
      "nombreCompleto", "fechaNacimiento", "telefono", "email", "direccion",
      "contactoEmergenciaNombre", "contactoEmergenciaRelacion", "contactoEmergenciaTelefono"
    ] as FieldPath<NuevoClienteFormValues>[]
  },
  {
    id: 2,
    name: "Plan y Pagos",
    fields: [
      "fechaInicioMembresia", "tipoMembresiaId", "metodoPagoPreferido"
    ] as FieldPath<NuevoClienteFormValues>[]
  },
  {
    id: 3,
    name: "Cuestionario de Salud",
    fields: [
      "condicionMedicaPreexistente", "condicionMedicaDescripcion", "alergias", "alergiasDescripcion",
      "medicamentosActuales", "medicamentosLista", "nivelActividadFisica", "objetivosGimnasio", "objetivosOtros"
    ] as FieldPath<NuevoClienteFormValues>[]
  },
  {
    id: 4,
    name: "Resumen y Confirmación",
    fields: []
  },
];

export default function NuevoClientePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [calculatedExpiryDate, setCalculatedExpiryDate] = useState<Date | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<NuevoClienteFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      nombreCompleto: "",
      telefono: "+54 ",
      email: "",
      direccion: "",
      contactoEmergenciaNombre: "",
      contactoEmergenciaRelacion: "",
      contactoEmergenciaTelefono: "",
      fechaInicioMembresia: new Date(),
      tipoMembresiaId: undefined,
      metodoPagoPreferido: undefined,
      condicionMedicaPreexistente: undefined,
      condicionMedicaDescripcion: "",
      alergias: undefined,
      alergiasDescripcion: "",
      medicamentosActuales: undefined,
      medicamentosLista: "",
      nivelActividadFisica: undefined,
      objetivosGimnasio: [],
      objetivosOtros: "",
    },
  });

  const watchCondicionMedica = form.watch("condicionMedicaPreexistente");
  const watchAlergias = form.watch("alergias");
  const watchMedicamentos = form.watch("medicamentosActuales");
  const watchTipoMembresiaId = form.watch("tipoMembresiaId");
  const watchFechaInicioMembresia = form.watch("fechaInicioMembresia");

  useEffect(() => {
    if (watchTipoMembresiaId && watchFechaInicioMembresia) {
      const plan = mockPlans.find(p => p.id === watchTipoMembresiaId);
      setSelectedPlan(plan || null);
      if (plan) {
        let expiryDate;
        if (plan.renewalType === "Mensual") {
          expiryDate = addMonths(watchFechaInicioMembresia, 1);
        } else if (plan.renewalType === "Semanal") {
          expiryDate = addWeeks(watchFechaInicioMembresia, 1);
        }
        setCalculatedExpiryDate(expiryDate || null);
      } else {
        setCalculatedExpiryDate(null);
      }
    } else {
      setSelectedPlan(null);
      setCalculatedExpiryDate(null);
    }
  }, [watchTipoMembresiaId, watchFechaInicioMembresia]);

  const handleNext = async () => {
    const fieldsToValidate = STEPS_CONFIG.find(s => s.id === currentStep)?.fields;
    let isValid = true;
    if (fieldsToValidate && fieldsToValidate.length > 0) {
      isValid = await form.trigger(fieldsToValidate);
    }

    if (isValid) {
      if (currentStep < STEPS_CONFIG.length) {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      toast({
        title: "Campos incompletos o inválidos",
        description: "Por favor, revisa los campos marcados en rojo en el paso actual.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  function onSubmit(data: NuevoClienteFormValues) {
    const finalSelectedPlan = mockPlans.find(p => p.id === data.tipoMembresiaId);
    let finalCalculatedExpiryDate = null;
    if (finalSelectedPlan && data.fechaInicioMembresia) {
        if (finalSelectedPlan.renewalType === "Mensual") {
            finalCalculatedExpiryDate = addMonths(data.fechaInicioMembresia, 1);
        } else if (finalSelectedPlan.renewalType === "Semanal") {
            finalCalculatedExpiryDate = addWeeks(data.fechaInicioMembresia, 1);
        }
    }

    console.log("Datos del formulario:", {
      ...data,
      fechaNacimiento: data.fechaNacimiento ? format(data.fechaNacimiento, "yyyy-MM-dd") : null,
      fechaInicioPlan: data.fechaInicioMembresia ? format(data.fechaInicioMembresia, "yyyy-MM-dd") : null,
      fechaVencimientoPlan: finalCalculatedExpiryDate ? format(finalCalculatedExpiryDate, "yyyy-MM-dd") : null,
      montoCuota: finalSelectedPlan?.price,
      planInfo: finalSelectedPlan
    });
    toast({
      title: "Cliente Registrado",
      description: `El cliente ${data.nombreCompleto} ha sido registrado exitosamente (simulación).`,
    });
    // router.push("/clientes");
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Datos Personales
        return (
          <Card>
            <CardHeader>
              <CardTitle>Datos Personales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="nombreCompleto" render={({ field }) => ( <FormItem> <FormLabel>Nombre Completo</FormLabel> <FormControl> <Input placeholder="Ej: Juan Pérez" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="fechaNacimiento" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel>Fecha de Nacimiento</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant={"outline"} className={cn( "w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground" )}> {field.value ? format(field.value, "PPP", { locale: es }) : <span>Selecciona una fecha</span>} <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /> </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0" align="start"> <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus locale={es}/> </PopoverContent> </Popover> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="telefono" render={({ field }) => ( <FormItem> <FormLabel>Número de Teléfono (Celular)</FormLabel> <FormControl> <Input placeholder="+54 11 12345678" {...field} /> </FormControl> <FormDescription>Incluir código de área. Formato: +54 XX XXXXXXXX</FormDescription> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Correo Electrónico</FormLabel> <FormControl> <Input type="email" placeholder="ejemplo@correo.com" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="direccion" render={({ field }) => ( <FormItem> <FormLabel>Dirección (Opcional)</FormLabel> <FormControl> <Input placeholder="Ej: Calle Falsa 123, Ciudad" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
              <Separator className="my-6" />
              <h3 className="text-lg font-medium">Contacto de Emergencia</h3>
              <FormField control={form.control} name="contactoEmergenciaNombre" render={({ field }) => ( <FormItem> <FormLabel>Nombre del Contacto</FormLabel> <FormControl> <Input placeholder="Nombre completo del contacto" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="contactoEmergenciaRelacion" render={({ field }) => ( <FormItem> <FormLabel>Relación</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Selecciona la relación" /> </SelectTrigger> </FormControl> <SelectContent> <SelectItem value="padre_madre">Padre/Madre</SelectItem> <SelectItem value="hermano_hermana">Hermano/a</SelectItem> <SelectItem value="conyuge_pareja">Cónyuge/Pareja</SelectItem> <SelectItem value="hijo_hija">Hijo/a</SelectItem> <SelectItem value="amigo_amiga">Amigo/a</SelectItem> <SelectItem value="otro">Otro</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="contactoEmergenciaTelefono" render={({ field }) => ( <FormItem> <FormLabel>Teléfono del Contacto</FormLabel> <FormControl> <Input placeholder="Número de teléfono del contacto" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
            </CardContent>
          </Card>
        );
      case 2: // Plan y Pagos
        return (
          <Card>
            <CardHeader> <CardTitle>Plan y Pagos</CardTitle> </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="fechaInicioMembresia" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel>Fecha de Inicio del Plan</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant={"outline"} className={cn( "w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground" )}> {field.value ? format(field.value, "PPP", { locale: es }) : <span>Selecciona una fecha</span>} <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /> </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0" align="start"> <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={es}/> </PopoverContent> </Popover> <FormDescription>Por defecto es hoy, pero puedes cambiarla.</FormDescription> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="tipoMembresiaId" render={({ field }) => ( <FormItem> <FormLabel>Plan</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Selecciona un plan" /> </SelectTrigger> </FormControl> <SelectContent> {mockPlans.map(plan => ( <SelectItem key={plan.id} value={plan.id}> {plan.name} (${plan.price} - {plan.renewalType}, {plan.classLimit} clases) </SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
              <FormItem> <FormLabel>Monto de la Cuota</FormLabel> <FormControl> <Input value={selectedPlan ? `$${selectedPlan.price.toFixed(2)}` : "N/A"} readOnly className="bg-muted/50" /> </FormControl> </FormItem>
              <FormItem> <FormLabel>Fecha de Vencimiento del Plan</FormLabel> <FormControl> <Input value={calculatedExpiryDate ? format(calculatedExpiryDate, "PPP", { locale: es }) : "N/A"} readOnly className="bg-muted/50" /> </FormControl> </FormItem>
              <FormField control={form.control} name="metodoPagoPreferido" render={({ field }) => ( <FormItem> <FormLabel>Método de Pago Preferido</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Selecciona un método de pago" /> </SelectTrigger> </FormControl> <SelectContent> <SelectItem value="efectivo">Efectivo</SelectItem> <SelectItem value="tarjeta_debito_credito">Tarjeta de Débito/Crédito</SelectItem> <SelectItem value="transferencia_bancaria">Transferencia Bancaria</SelectItem> <SelectItem value="mercado_pago">Mercado Pago</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
            </CardContent>
          </Card>
        );
      case 3: // Cuestionario de Salud
        return (
          <Card>
            <CardHeader> <CardTitle>Cuestionario de Salud</CardTitle> <CardDescription className="text-sm text-muted-foreground"> Esta información es confidencial y se utiliza para garantizar tu seguridad y bienestar. Por favor, responde con sinceridad. </CardDescription> </CardHeader>
            <CardContent className="space-y-6">
               <FormField control={form.control} name="condicionMedicaPreexistente" render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                     <FormLabel htmlFor={`${field.name}-group`}>¿Padece alguna condición médica preexistente?</FormLabel>
                    <Tooltip>
                      <TooltipTrigger type="button" aria-label="Información sobre condiciones médicas preexistentes">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ej: diabetes, hipertensión, problemas cardíacos, asma, lesiones previas.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <FormControl>
                    <div>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1" id={`${field.name}-group`}>
                        <div className="flex items-center space-x-3 space-y-0">
                          <RadioGroupItem value="si" id={`${field.name}-si`} />
                          <Label htmlFor={`${field.name}-si`} className="font-normal">Sí</Label>
                        </div>
                        <div className="flex items-center space-x-3 space-y-0">
                          <RadioGroupItem value="no" id={`${field.name}-no`} />
                          <Label htmlFor={`${field.name}-no`} className="font-normal">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              {watchCondicionMedica === "si" && ( <FormField control={form.control} name="condicionMedicaDescripcion" render={({ field }) => ( <FormItem> <FormLabel>Describa la/s condición/es</FormLabel> <FormControl> <Textarea placeholder="Por favor, detalla tus condiciones médicas..." {...field} /> </FormControl> <FormMessage /> </FormItem> )}/> )}

              <FormField control={form.control} name="alergias" render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={`${field.name}-group`}>¿Es alérgico/a a algún medicamento o alimento?</FormLabel>
                  <FormControl>
                    <div>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1" id={`${field.name}-group`}>
                        <div className="flex items-center space-x-3 space-y-0">
                          <RadioGroupItem value="si" id={`${field.name}-alergias-si`} />
                          <Label htmlFor={`${field.name}-alergias-si`} className="font-normal">Sí</Label>
                        </div>
                        <div className="flex items-center space-x-3 space-y-0">
                          <RadioGroupItem value="no" id={`${field.name}-alergias-no`} />
                          <Label htmlFor={`${field.name}-alergias-no`} className="font-normal">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              {watchAlergias === "si" && ( <FormField control={form.control} name="alergiasDescripcion" render={({ field }) => ( <FormItem> <FormLabel>Especifique la/s alergia/s</FormLabel> <FormControl> <Textarea placeholder="Indica a qué eres alérgico/a..." {...field} /> </FormControl> <FormMessage /> </FormItem> )}/> )}

              <FormField control={form.control} name="medicamentosActuales" render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={`${field.name}-group`}>¿Está tomando algún medicamento actualmente?</FormLabel>
                  <FormControl>
                    <div>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1" id={`${field.name}-group`}>
                        <div className="flex items-center space-x-3 space-y-0">
                           <RadioGroupItem value="si" id={`${field.name}-medicamentos-si`} />
                          <Label htmlFor={`${field.name}-medicamentos-si`} className="font-normal">Sí</Label>
                        </div>
                        <div className="flex items-center space-x-3 space-y-0">
                          <RadioGroupItem value="no" id={`${field.name}-medicamentos-no`} />
                          <Label htmlFor={`${field.name}-medicamentos-no`} className="font-normal">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              {watchMedicamentos === "si" && ( <FormField control={form.control} name="medicamentosLista" render={({ field }) => ( <FormItem> <FormLabel>Enumere los medicamentos</FormLabel> <FormControl> <Textarea placeholder="Lista los medicamentos que estás tomando..." {...field} /> </FormControl> <FormMessage /> </FormItem> )}/> )}

              <FormField control={form.control} name="nivelActividadFisica" render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={`${field.name}-group`}>Nivel de Actividad Física Previo</FormLabel>
                  <FormControl>
                    <div>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1 md:flex-row md:space-x-4 md:space-y-0" id={`${field.name}-group`}>
                        <div className="flex items-center space-x-3 space-y-0">
                          <RadioGroupItem value="ninguno" id={`${field.name}-ninguno`} />
                          <Label htmlFor={`${field.name}-ninguno`} className="font-normal">Ninguno</Label>
                        </div>
                        <div className="flex items-center space-x-3 space-y-0">
                           <RadioGroupItem value="principiante" id={`${field.name}-principiante`} />
                          <Label htmlFor={`${field.name}-principiante`} className="font-normal">Principiante</Label>
                        </div>
                        <div className="flex items-center space-x-3 space-y-0">
                          <RadioGroupItem value="intermedio" id={`${field.name}-intermedio`} />
                          <Label htmlFor={`${field.name}-intermedio`} className="font-normal">Intermedio</Label>
                        </div>
                        <div className="flex items-center space-x-3 space-y-0">
                          <RadioGroupItem value="avanzado" id={`${field.name}-avanzado`} />
                          <Label htmlFor={`${field.name}-avanzado`} className="font-normal">Avanzado</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField
                control={form.control}
                name="objetivosGimnasio"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Objetivos Principales en el Gimnasio</FormLabel>
                      <FormDescription>Selecciona uno o más objetivos.</FormDescription>
                    </div>
                    <FormControl>
                       <div className="space-y-2">
                        {objectivesList.map((item) => (
                          <div key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                const newValue = checked
                                  ? [...(field.value || []), item.id]
                                  : (field.value || []).filter(
                                      (value) => value !== item.id
                                    );
                                field.onChange(newValue);
                              }}
                              id={`objetivo-${item.id}`}
                            />
                            <Label
                              htmlFor={`objetivo-${item.id}`}
                              className="font-normal"
                            >
                              {item.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="objetivosOtros" render={({ field }) => ( <FormItem> <FormLabel>Otros Objetivos (Opcional)</FormLabel> <FormControl> <Textarea placeholder="Si tienes otros objetivos, especifícalos aquí..." {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
            </CardContent>
          </Card>
        );
      case 4: // Resumen y Confirmación
        const formData = form.getValues();
        const currentSelectedPlan = mockPlans.find(p => p.id === formData.tipoMembresiaId);
        let currentCalculatedExpiryDate = null;
        if (watchFechaInicioMembresia && currentSelectedPlan) {
            if (currentSelectedPlan.renewalType === "Mensual") {
                currentCalculatedExpiryDate = addMonths(watchFechaInicioMembresia, 1);
            } else if (currentSelectedPlan.renewalType === "Semanal") {
                 currentCalculatedExpiryDate = addWeeks(watchFechaInicioMembresia, 1);
            }
        }

        return (
          <Card>
            <CardHeader> <CardTitle>Resumen y Confirmación</CardTitle> <CardDescription>Por favor, revisa que toda la información sea correcta antes de guardar.</CardDescription> </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2"> <h3 className="font-semibold text-lg">Datos Personales</h3>
                <p><strong>Nombre Completo:</strong> {formData.nombreCompleto}</p>
                <p><strong>Fecha de Nacimiento:</strong> {formData.fechaNacimiento ? format(formData.fechaNacimiento, "PPP", { locale: es }) : "N/A"}</p>
                <p><strong>Teléfono:</strong> {formData.telefono}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                {formData.direccion && <p><strong>Dirección:</strong> {formData.direccion}</p>}
                <Separator className="my-3" />
                <h4 className="font-medium">Contacto de Emergencia</h4>
                <p><strong>Nombre:</strong> {formData.contactoEmergenciaNombre}</p>
                <p><strong>Relación:</strong> {formData.contactoEmergenciaRelacion}</p>
                <p><strong>Teléfono:</strong> {formData.contactoEmergenciaTelefono}</p>
              </div>
              <Separator />
              <div className="space-y-2"> <h3 className="font-semibold text-lg">Plan y Pagos</h3>
                <p><strong>Fecha de Inicio del Plan:</strong> {formData.fechaInicioMembresia ? format(formData.fechaInicioMembresia, "PPP", { locale: es }) : "N/A"}</p>
                <p><strong>Plan:</strong> {currentSelectedPlan?.name || "N/A"} ({currentSelectedPlan?.renewalType}, {currentSelectedPlan?.classLimit} clases)</p>
                <p><strong>Monto Cuota:</strong> {currentSelectedPlan ? `$${currentSelectedPlan.price.toFixed(2)}` : "N/A"}</p>
                <p><strong>Fecha de Vencimiento del Plan:</strong> {currentCalculatedExpiryDate ? format(currentCalculatedExpiryDate, "PPP", { locale: es }) : "N/A"}</p>
                <p><strong>Método de Pago:</strong> {formData.metodoPagoPreferido}</p>
                {currentSelectedPlan?.allowedClasses && currentSelectedPlan.allowedClasses.length > 0 && (
                  <p><strong>Clases Permitidas:</strong> {currentSelectedPlan.allowedClasses.join(", ")}</p>
                )}
                {(!currentSelectedPlan?.allowedClasses || currentSelectedPlan.allowedClasses.length === 0) && (
                    <p><strong>Clases Permitidas:</strong> Cualquiera</p>
                )}
              </div>
              <Separator />
              <div className="space-y-2"> <h3 className="font-semibold text-lg">Cuestionario de Salud</h3>
                <p><strong>Condición Médica Preexistente:</strong> {formData.condicionMedicaPreexistente} {formData.condicionMedicaPreexistente === "si" ? `- ${formData.condicionMedicaDescripcion}` : ""}</p>
                <p><strong>Alergias:</strong> {formData.alergias} {formData.alergias === "si" ? `- ${formData.alergiasDescripcion}` : ""}</p>
                <p><strong>Medicamentos Actuales:</strong> {formData.medicamentosActuales} {formData.medicamentosActuales === "si" ? `- ${formData.medicamentosLista}` : ""}</p>
                <p><strong>Nivel Actividad Física:</strong> {formData.nivelActividadFisica}</p>
                <p><strong>Objetivos:</strong> {formData.objetivosGimnasio.map(id => objectivesList.find(obj => obj.id === id)?.label).join(', ')}</p>
                {formData.objetivosOtros && <p><strong>Otros Objetivos:</strong> {formData.objetivosOtros}</p>}
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

   const pageContent = (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 max-w-4xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Registrar Nuevo Cliente</CardTitle>
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 my-4">
            {STEPS_CONFIG.map((step, index) => (
              <div key={step.id} className="flex items-center gap-2 sm:gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "rounded-full h-8 w-8 flex items-center justify-center border-2",
                      currentStep > step.id || currentStep === STEPS_CONFIG.length ? "bg-primary border-primary text-primary-foreground" :
                      currentStep === step.id ? "border-primary text-primary" : "border-muted-foreground text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id || (currentStep === STEPS_CONFIG.length && step.id !== STEPS_CONFIG.length) ? <Check className="h-5 w-5" /> : step.id}
                  </div>
                  <p className={
                      `text-xs mt-1 text-center ${currentStep === step.id ? "text-primary" : "text-muted-foreground"}`
                    }
                  >
                    {step.name}
                  </p>
                </div>
                {index < STEPS_CONFIG.length - 1 && (
                  <ChevronsRight className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
           <CardDescription>
            Paso {currentStep} de {STEPS_CONFIG.length}: {STEPS_CONFIG.find(s => s.id === currentStep)?.name}
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="min-h-[300px]">
              {renderStepContent()}
            </CardContent>
            <CardFooter className="flex justify-between pt-6">
               <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <div className="flex space-x-2">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Atrás
                  </Button>
                )}
                {currentStep < STEPS_CONFIG.length && (
                  <Button type="button" onClick={handleNext}>
                    Siguiente
                  </Button>
                )}
                {currentStep === STEPS_CONFIG.length && (
                  <Button type="submit">
                    Guardar Cliente
                  </Button>
                )}
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );


  if (!isClient) {
    // Simplified loading state to avoid TooltipProvider on SSR
    return (
        <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 max-w-4xl">
            <Card>
                <CardHeader><CardTitle>Cargando...</CardTitle></CardHeader>
                <CardContent><div className="min-h-[300px]"></div></CardContent>
            </Card>
        </div>
    );
  }

  return (
    <TooltipProvider>
      {pageContent}
    </TooltipProvider>
  );
}


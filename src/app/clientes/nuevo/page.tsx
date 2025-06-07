
"use client";

import React from "react"; // Added React import
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
  FormLabel,
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
import { CalendarIcon, Info, ChevronsRight, Check } from "lucide-react"; // Added Check icon
import { format, addMonths, addYears } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
}
const mockPlans: MembershipPlan[] = [
  { id: "1", name: "Básico Mensual", price: 30, duration: "1 mes", description: "Acceso a todas las áreas, sin clases." },
  { id: "2", name: "Premium Mensual", price: 50, duration: "1 mes", description: "Acceso total, incluye clases grupales." },
  { id: "3", name: "Anual Básico", price: 300, duration: "12 meses", description: "Acceso básico por un año." },
  { id: "4", name: "Anual Premium", price: 500, duration: "12 meses", description: "Acceso total, clases, y 10% de descuento." },
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

  // Plan de Membresía y Pagos
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
    name: "Membresía y Pagos",
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
    fields: [] // No fields to validate in summary step
  },
];

export default function NuevoClientePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [calculatedExpiryDate, setCalculatedExpiryDate] = useState<Date | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<NuevoClienteFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched", // Validate on blur/change after first touch
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
        const durationParts = plan.duration.split(" ");
        const amount = parseInt(durationParts[0]);
        const unit = durationParts[1];
        let expiryDate;
        if (unit.startsWith("mes")) {
          expiryDate = addMonths(watchFechaInicioMembresia, amount);
        } else if (unit.startsWith("año") || unit.startsWith("ano")) { // Handle "año" and "ano"
          expiryDate = addYears(watchFechaInicioMembresia, amount);
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
    console.log("Datos del formulario:", {
      ...data,
      fechaNacimiento: data.fechaNacimiento ? format(data.fechaNacimiento, "yyyy-MM-dd") : null,
      fechaInicioMembresia: data.fechaInicioMembresia ? format(data.fechaInicioMembresia, "yyyy-MM-dd") : null,
      fechaVencimientoMembresia: calculatedExpiryDate ? format(calculatedExpiryDate, "yyyy-MM-dd") : null,
      montoCuota: selectedPlan?.price,
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
      case 2: // Plan de Membresía y Pagos
        return (
          <Card>
            <CardHeader> <CardTitle>Plan de Membresía y Pagos</CardTitle> </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="fechaInicioMembresia" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel>Fecha de Inicio de Membresía</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant={"outline"} className={cn( "w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground" )}> {field.value ? format(field.value, "PPP", { locale: es }) : <span>Selecciona una fecha</span>} <CalendarIcon className="ml-auto h-4 w-4 opacity-50" /> </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0" align="start"> <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={es}/> </PopoverContent> </Popover> <FormDescription>Por defecto es hoy, pero puedes cambiarla.</FormDescription> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="tipoMembresiaId" render={({ field }) => ( <FormItem> <FormLabel>Tipo de Membresía/Plan</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Selecciona un plan" /> </SelectTrigger> </FormControl> <SelectContent> {mockPlans.map(plan => ( <SelectItem key={plan.id} value={plan.id}> {plan.name} (${plan.price} - {plan.duration}) </SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
              <FormItem> <FormLabel>Monto de la Cuota</FormLabel> <FormControl> <Input value={selectedPlan ? `$${selectedPlan.price.toFixed(2)}` : "N/A"} readOnly className="bg-muted/50" /> </FormControl> </FormItem>
              <FormItem> <FormLabel>Fecha de Vencimiento de Membresía</FormLabel> <FormControl> <Input value={calculatedExpiryDate ? format(calculatedExpiryDate, "PPP", { locale: es }) : "N/A"} readOnly className="bg-muted/50" /> </FormControl> </FormItem>
              <FormField control={form.control} name="metodoPagoPreferido" render={({ field }) => ( <FormItem> <FormLabel>Método de Pago Preferido</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Selecciona un método de pago" /> </SelectTrigger> </FormControl> <SelectContent> <SelectItem value="efectivo">Efectivo</SelectItem> <SelectItem value="tarjeta_debito_credito">Tarjeta de Débito/Crédito</SelectItem> <SelectItem value="transferencia_bancaria">Transferencia Bancaria</SelectItem> <SelectItem value="mercado_pago">Mercado Pago</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
            </CardContent>
          </Card>
        );
      case 3: // Cuestionario de Salud
        return (
          <Card>
            <CardHeader> <CardTitle>Cuestionario de Salud</CardTitle> <CardDescription className="text-sm text-muted-foreground"> Esta información es confidencial y se utiliza para garantizar tu seguridad y bienestar. Por favor, responde con sinceridad. </CardDescription> </CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="condicionMedicaPreexistente" render={({ field }) => ( <FormItem className="space-y-3"> <FormLabel className="flex items-center gap-2"> ¿Padece alguna condición médica preexistente? <Tooltip> <TooltipTrigger type="button"><Info className="h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger> <TooltipContent><p>Ej: diabetes, hipertensión, problemas cardíacos, asma, lesiones previas.</p></TooltipContent> </Tooltip> </FormLabel> <FormControl> <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1"> <FormItem className="flex items-center space-x-3 space-y-0"> <FormControl> <RadioGroupItem value="si" /> </FormControl> <FormLabel className="font-normal">Sí</FormLabel> </FormItem> <FormItem className="flex items-center space-x-3 space-y-0"> <FormControl> <RadioGroupItem value="no" /> </FormControl> <FormLabel className="font-normal">No</FormLabel> </FormItem> </RadioGroup> </FormControl> <FormMessage /> </FormItem> )}/>
              {watchCondicionMedica === "si" && ( <FormField control={form.control} name="condicionMedicaDescripcion" render={({ field }) => ( <FormItem> <FormLabel>Describa la/s condición/es</FormLabel> <FormControl> <Textarea placeholder="Por favor, detalla tus condiciones médicas..." {...field} /> </FormControl> <FormMessage /> </FormItem> )}/> )}
              <FormField control={form.control} name="alergias" render={({ field }) => ( <FormItem className="space-y-3"> <FormLabel>¿Es alérgico/a a algún medicamento o alimento?</FormLabel> <FormControl> <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1"> <FormItem className="flex items-center space-x-3 space-y-0"> <FormControl> <RadioGroupItem value="si" /> </FormControl> <FormLabel className="font-normal">Sí</FormLabel> </FormItem> <FormItem className="flex items-center space-x-3 space-y-0"> <FormControl> <RadioGroupItem value="no" /> </FormControl> <FormLabel className="font-normal">No</FormLabel> </FormItem> </RadioGroup> </FormControl> <FormMessage /> </FormItem> )}/>
              {watchAlergias === "si" && ( <FormField control={form.control} name="alergiasDescripcion" render={({ field }) => ( <FormItem> <FormLabel>Especifique la/s alergia/s</FormLabel> <FormControl> <Textarea placeholder="Indica a qué eres alérgico/a..." {...field} /> </FormControl> <FormMessage /> </FormItem> )}/> )}
              <FormField control={form.control} name="medicamentosActuales" render={({ field }) => ( <FormItem className="space-y-3"> <FormLabel>¿Está tomando algún medicamento actualmente?</FormLabel> <FormControl> <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1"> <FormItem className="flex items-center space-x-3 space-y-0"> <FormControl> <RadioGroupItem value="si" /> </FormControl> <FormLabel className="font-normal">Sí</FormLabel> </FormItem> <FormItem className="flex items-center space-x-3 space-y-0"> <FormControl> <RadioGroupItem value="no" /> </FormControl> <FormLabel className="font-normal">No</FormLabel> </FormItem> </RadioGroup> </FormControl> <FormMessage /> </FormItem> )}/>
              {watchMedicamentos === "si" && ( <FormField control={form.control} name="medicamentosLista" render={({ field }) => ( <FormItem> <FormLabel>Enumere los medicamentos</FormLabel> <FormControl> <Textarea placeholder="Lista los medicamentos que estás tomando..." {...field} /> </FormControl> <FormMessage /> </FormItem> )}/> )}
              <FormField control={form.control} name="nivelActividadFisica" render={({ field }) => ( <FormItem className="space-y-3"> <FormLabel>Nivel de Actividad Física Previo</FormLabel> <FormControl> <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1 md:flex-row md:space-x-4 md:space-y-0"> <FormItem className="flex items-center space-x-3 space-y-0"> <FormControl><RadioGroupItem value="ninguno" /></FormControl> <FormLabel className="font-normal">Ninguno</FormLabel> </FormItem> <FormItem className="flex items-center space-x-3 space-y-0"> <FormControl><RadioGroupItem value="principiante" /></FormControl> <FormLabel className="font-normal">Principiante</FormLabel> </FormItem> <FormItem className="flex items-center space-x-3 space-y-0"> <FormControl><RadioGroupItem value="intermedio" /></FormControl> <FormLabel className="font-normal">Intermedio</FormLabel> </FormItem> <FormItem className="flex items-center space-x-3 space-y-0"> <FormControl><RadioGroupItem value="avanzado" /></FormControl> <FormLabel className="font-normal">Avanzado</FormLabel> </FormItem> </RadioGroup> </FormControl> <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="objetivosGimnasio" render={() => ( <FormItem> <div className="mb-4"> <FormLabel className="text-base">Objetivos Principales en el Gimnasio</FormLabel> <FormDescription> Selecciona uno o más objetivos. </FormDescription> </div> {objectivesList.map((item) => ( <FormField key={item.id} control={form.control} name="objetivosGimnasio" render={({ field }) => { return ( <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0"> <FormControl> <Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange( (field.value || []).filter( (value) => value !== item.id ) ) }} /> </FormControl> <FormLabel className="font-normal"> {item.label} </FormLabel> </FormItem> ) }} /> ))} <FormMessage /> </FormItem> )}/>
              <FormField control={form.control} name="objetivosOtros" render={({ field }) => ( <FormItem> <FormLabel>Otros Objetivos (Opcional)</FormLabel> <FormControl> <Textarea placeholder="Si tienes otros objetivos, especifícalos aquí..." {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
            </CardContent>
          </Card>
        );
      case 4: // Resumen y Confirmación
        const formData = form.getValues();
        const currentSelectedPlan = mockPlans.find(p => p.id === formData.tipoMembresiaId);
        const currentCalculatedExpiryDate = watchFechaInicioMembresia && currentSelectedPlan ?
            (currentSelectedPlan.duration.includes("mes") ?
            addMonths(watchFechaInicioMembresia, parseInt(currentSelectedPlan.duration)) :
            addYears(watchFechaInicioMembresia, parseInt(currentSelectedPlan.duration)))
            : null;

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
              <div className="space-y-2"> <h3 className="font-semibold text-lg">Plan de Membresía y Pagos</h3>
                <p><strong>Fecha de Inicio:</strong> {formData.fechaInicioMembresia ? format(formData.fechaInicioMembresia, "PPP", { locale: es }) : "N/A"}</p>
                <p><strong>Plan:</strong> {currentSelectedPlan?.name || "N/A"}</p>
                <p><strong>Monto Cuota:</strong> {currentSelectedPlan ? `$${currentSelectedPlan.price.toFixed(2)}` : "N/A"}</p>
                <p><strong>Fecha de Vencimiento:</strong> {currentCalculatedExpiryDate ? format(currentCalculatedExpiryDate, "PPP", { locale: es }) : "N/A"}</p>
                <p><strong>Método de Pago:</strong> {formData.metodoPagoPreferido}</p>
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

  return (
    <TooltipProvider>
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 max-w-4xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Registrar Nuevo Cliente</CardTitle>
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 my-4">
            {STEPS_CONFIG.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full border-2",
                      currentStep > step.id ? "bg-primary border-primary text-primary-foreground" :
                      currentStep === step.id ? "border-primary text-primary animate-pulse" : "border-muted-foreground text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <p className={cn(
                      "text-xs mt-1 text-center",
                      currentStep === step.id ? "text-primary font-semibold" : "text-muted-foreground"
                    )}
                  >
                    {step.name}
                  </p>
                </div>
                {index < STEPS_CONFIG.length - 1 && (
                  <ChevronsRight className={cn(
                      "w-5 h-5 sm:w-6 sm:h-6 mt-[-1.25rem]", // Adjust vertical alignment
                      currentStep > step.id +1 ? "text-primary" : "text-muted-foreground/50" // Check if current step is beyond the next step to color arrow
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
           <CardDescription>
            Paso {currentStep} de {STEPS_CONFIG.length}: {STEPS_CONFIG.find(s => s.id === currentStep)?.name}
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="min-h-[300px]"> {/* Ensure content area has some height */}
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
    </TooltipProvider>
  );
}


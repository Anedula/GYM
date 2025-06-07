
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Info } from "lucide-react";
import { format, addMonths, addYears } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Mock data for membership plans (ideally fetched from DB or context)
interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  duration: string; // e.g., "1 mes", "12 meses"
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
  // fechaVencimientoMembresia and montoCuota are derived, not direct inputs

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

export default function NuevoClientePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [calculatedExpiryDate, setCalculatedExpiryDate] = useState<Date | null>(null);

  const form = useForm<NuevoClienteFormValues>({
    resolver: zodResolver(formSchema),
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
        } else if (unit.startsWith("año")) {
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


  function onSubmit(data: NuevoClienteFormValues) {
    // En una aplicación real, aquí se enviarán los datos a la API/base de datos
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
    // Opcional: resetear el formulario o redirigir
    // form.reset();
    // router.push("/clientes");
  }

  return (
    <TooltipProvider>
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 max-w-4xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Registrar Nuevo Cliente</CardTitle>
          <CardDescription>Completa la información esencial para la gestión del nuevo miembro.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Sección Datos Personales */}
              <Card>
                <CardHeader>
                  <CardTitle>Datos Personales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nombreCompleto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Juan Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fechaNacimiento"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Nacimiento</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: es })
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                              locale={es}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="telefono"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Teléfono (Celular)</FormLabel>
                        <FormControl>
                          <Input placeholder="+54 11 12345678" {...field} />
                        </FormControl>
                        <FormDescription>Incluir código de área. Formato: +54 XX XXXXXXXX</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="ejemplo@correo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="direccion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección (Opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Calle Falsa 123, Ciudad" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Separator className="my-6" />
                  <h3 className="text-lg font-medium">Contacto de Emergencia</h3>
                  <FormField
                    control={form.control}
                    name="contactoEmergenciaNombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Contacto</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre completo del contacto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactoEmergenciaRelacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relación</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona la relación" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="padre_madre">Padre/Madre</SelectItem>
                            <SelectItem value="hermano_hermana">Hermano/a</SelectItem>
                            <SelectItem value="conyuge_pareja">Cónyuge/Pareja</SelectItem>
                            <SelectItem value="hijo_hija">Hijo/a</SelectItem>
                            <SelectItem value="amigo_amiga">Amigo/a</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactoEmergenciaTelefono"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono del Contacto</FormLabel>
                        <FormControl>
                          <Input placeholder="Número de teléfono del contacto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Sección Plan de Membresía y Pagos */}
              <Card>
                <CardHeader>
                  <CardTitle>Plan de Membresía y Pagos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fechaInicioMembresia"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Inicio de Membresía</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: es })
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              locale={es}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>Por defecto es hoy, pero puedes cambiarla.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tipoMembresiaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Membresía/Plan</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un plan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockPlans.map(plan => (
                              <SelectItem key={plan.id} value={plan.id}>
                                {plan.name} (${plan.price} - {plan.duration})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem>
                    <FormLabel>Monto de la Cuota</FormLabel>
                    <FormControl>
                      <Input value={selectedPlan ? `$${selectedPlan.price.toFixed(2)}` : "N/A"} readOnly className="bg-muted/50" />
                    </FormControl>
                  </FormItem>
                  <FormItem>
                    <FormLabel>Fecha de Vencimiento de Membresía</FormLabel>
                    <FormControl>
                       <Input value={calculatedExpiryDate ? format(calculatedExpiryDate, "PPP", { locale: es }) : "N/A"} readOnly className="bg-muted/50" />
                    </FormControl>
                  </FormItem>
                   <FormField
                    control={form.control}
                    name="metodoPagoPreferido"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método de Pago Preferido</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un método de pago" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {/* Estas opciones deberían venir de la configuración en un futuro */}
                            <SelectItem value="efectivo">Efectivo</SelectItem>
                            <SelectItem value="tarjeta_debito_credito">Tarjeta de Débito/Crédito</SelectItem>
                            <SelectItem value="transferencia_bancaria">Transferencia Bancaria</SelectItem>
                            <SelectItem value="mercado_pago">Mercado Pago</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Sección Cuestionario de Salud */}
              <Card>
                <CardHeader>
                  <CardTitle>Cuestionario de Salud</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Esta información es confidencial y se utiliza para garantizar tu seguridad y bienestar.
                    Por favor, responde con sinceridad.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="condicionMedicaPreexistente"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="flex items-center gap-2">
                          ¿Padece alguna condición médica preexistente? 
                          <Tooltip>
                            <TooltipTrigger type="button"><Info className="h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                            <TooltipContent><p>Ej: diabetes, hipertensión, problemas cardíacos, asma, lesiones previas.</p></TooltipContent>
                          </Tooltip>
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="si" />
                              </FormControl>
                              <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="no" />
                              </FormControl>
                              <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {watchCondicionMedica === "si" && (
                    <FormField
                      control={form.control}
                      name="condicionMedicaDescripcion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Describa la/s condición/es</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Por favor, detalla tus condiciones médicas..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="alergias"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>¿Es alérgico/a a algún medicamento o alimento?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="si" />
                              </FormControl>
                              <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="no" />
                              </FormControl>
                              <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {watchAlergias === "si" && (
                    <FormField
                      control={form.control}
                      name="alergiasDescripcion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Especifique la/s alergia/s</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Indica a qué eres alérgico/a..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <FormField
                    control={form.control}
                    name="medicamentosActuales"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>¿Está tomando algún medicamento actualmente?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="si" />
                              </FormControl>
                              <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="no" />
                              </FormControl>
                              <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {watchMedicamentos === "si" && (
                    <FormField
                      control={form.control}
                      name="medicamentosLista"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Enumere los medicamentos</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Lista los medicamentos que estás tomando..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="nivelActividadFisica"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Nivel de Actividad Física Previo</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1 md:flex-row md:space-x-4 md:space-y-0"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl><RadioGroupItem value="ninguno" /></FormControl>
                              <FormLabel className="font-normal">Ninguno</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl><RadioGroupItem value="principiante" /></FormControl>
                              <FormLabel className="font-normal">Principiante</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl><RadioGroupItem value="intermedio" /></FormControl>
                              <FormLabel className="font-normal">Intermedio</FormLabel>
                            </FormItem>
                             <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl><RadioGroupItem value="avanzado" /></FormControl>
                              <FormLabel className="font-normal">Avanzado</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="objetivosGimnasio"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Objetivos Principales en el Gimnasio</FormLabel>
                          <FormDescription>
                            Selecciona uno o más objetivos.
                          </FormDescription>
                        </div>
                        {objectivesList.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="objetivosGimnasio"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), item.id])
                                          : field.onChange(
                                              (field.value || []).filter(
                                                (value) => value !== item.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                      control={form.control}
                      name="objetivosOtros"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Otros Objetivos (Opcional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Si tienes otros objetivos, especifícalos aquí..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </CardContent>
              </Card>
              
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar Cliente</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
}

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function ConfiguracionPage() {
  const { toast } = useToast();

  const handleGymDetailsSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle gym details submission
    toast({ title: "Configuración Guardada", description: "Los detalles del gimnasio han sido actualizados." });
  };
  
  const handlePaymentSettingsSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle payment settings submission
    toast({ title: "Configuración Guardada", description: "Los métodos de pago han sido actualizados." });
  };

  const handleNotificationSettingsSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle notification settings submission
    toast({ title: "Configuración Guardada", description: "Las preferencias de notificación han sido actualizadas." });
  };


  return (
    <div className="flex flex-col gap-6">
      <CardHeader className="p-0 mb-2">
        <CardTitle className="text-2xl">Configuración Personalizada</CardTitle>
        <CardDescription>Adapta la aplicación a las necesidades de tu gimnasio.</CardDescription>
      </CardHeader>

      <Tabs defaultValue="gym-details">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="gym-details">Detalles del Gimnasio</TabsTrigger>
          <TabsTrigger value="users">Usuarios y Permisos</TabsTrigger>
          <TabsTrigger value="payments">Métodos de Pago</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="gym-details">
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Gimnasio</CardTitle>
              <CardDescription>Información general de tu negocio.</CardDescription>
            </CardHeader>
            <form onSubmit={handleGymDetailsSubmit}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="gym-name">Nombre del Gimnasio</Label>
                    <Input id="gym-name" defaultValue="Mi Gimnasio FitnessPro" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gym-address">Dirección</Label>
                    <Input id="gym-address" defaultValue="Calle Falsa 123, Ciudad" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gym-logo">Logo del Gimnasio</Label>
                  <div className="flex items-center gap-4">
                    <Image 
                      src="https://placehold.co/100x100.png" 
                      alt="Logo actual" 
                      width={80} 
                      height={80} 
                      className="rounded border"
                      data-ai-hint="gym logo" 
                    />
                    <Input id="gym-logo" type="file" className="max-w-xs" />
                  </div>
                   <p className="text-xs text-muted-foreground">Sube una imagen para el logo de tu gimnasio (PNG, JPG, max 2MB).</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gym-hours">Horarios de Apertura</Label>
                  <Textarea id="gym-hours" placeholder="Ej: Lunes a Viernes: 6 AM - 10 PM..." rows={3} defaultValue="Lunes a Viernes: 6 AM - 10 PM\nSábados: 8 AM - 6 PM\nDomingos: Cerrado" />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Guardar Detalles</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios y Permisos</CardTitle>
              <CardDescription>Gestiona quién tiene acceso y qué puede hacer. (Función no implementada)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">Esta sección permitirá añadir administradores, entrenadores y asignarles roles específicos. Por ahora, es un marcador de posición.</p>
              <Button disabled>Añadir Usuario (Próximamente)</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pago</CardTitle>
              <CardDescription>Configura las opciones de pago que aceptas.</CardDescription>
            </CardHeader>
            <form onSubmit={handlePaymentSettingsSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Moneda Principal</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Selecciona moneda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="mxn">MXN ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <h3 className="text-lg font-medium">Pasarelas de Pago Online (Ejemplos)</h3>
                 <div className="flex items-center space-x-2">
                    <Switch id="paypal-enabled" defaultChecked />
                    <Label htmlFor="paypal-enabled">PayPal</Label>
                  </div>
                  <div className="space-y-1 pl-8">
                     <Label htmlFor="paypal-email" className="text-sm">Email de PayPal</Label>
                     <Input id="paypal-email" placeholder="tuemail@paypal.com" className="max-w-sm" />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="stripe-enabled" />
                    <Label htmlFor="stripe-enabled">Stripe</Label>
                  </div>
                   <div className="space-y-1 pl-8">
                     <Label htmlFor="stripe-key" className="text-sm">Clave Publicable de Stripe</Label>
                     <Input id="stripe-key" placeholder="pk_test_..." className="max-w-sm" disabled />
                     <p className="text-xs text-muted-foreground">Integración con Stripe (Función no implementada).</p>
                  </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Guardar Configuración de Pagos</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>Configura cómo y cuándo se envían las notificaciones.</CardDescription>
            </CardHeader>
            <form onSubmit={handleNotificationSettingsSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Recordatorios de Pago a Clientes</h3>
                  <div className="flex items-center space-x-2">
                    <Switch id="payment-reminder-email" defaultChecked />
                    <Label htmlFor="payment-reminder-email">Enviar por Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="payment-reminder-days" />
                    <Label htmlFor="payment-reminder-days" className="flex items-center gap-2">
                      Enviar <Input type="number" defaultValue="3" className="w-16 mx-1 text-center" /> días antes del vencimiento
                    </Label>
                  </div>
                </div>
                <Separator />
                 <div className="space-y-2">
                  <h3 className="text-lg font-medium">Notificaciones Administrativas</h3>
                   <div className="flex items-center space-x-2">
                    <Switch id="admin-new-member" defaultChecked />
                    <Label htmlFor="admin-new-member">Notificar nuevo miembro registrado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="admin-expiring-soon" defaultChecked />
                    <Label htmlFor="admin-expiring-soon">Resumen diario de membresías por vencer</Label>
                  </div>
                 </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Guardar Preferencias de Notificación</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

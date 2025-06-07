
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ScheduledClass {
  id: string;
  date: Date;
  time: string;
  className: string;
  instructorId: string; // Changed from instructor name to ID
  capacity: number;
  booked: number;
}

interface Instructor {
  id: string;
  name: string;
}

const mockInstructors: Instructor[] = [
  { id: "i1", name: "Elena Paz" },
  { id: "i2", name: "Ricardo Sol" },
  { id: "i3", name: "Ana Rivas" },
  { id: "i4", name: "Luis Roca" },
  { id: "i5", name: "Carlos Gómez" }, // Added another instructor
];

const mockScheduledClasses: ScheduledClass[] = [
  { id: "c1", date: new Date(2024, 7, 5), time: "09:00 AM", className: "Yoga Matutino", instructorId: "i1", capacity: 20, booked: 15 },
  { id: "c2", date: new Date(2024, 7, 5), time: "06:00 PM", className: "Zumba Fitness", instructorId: "i2", capacity: 25, booked: 22 },
  { id: "c3", date: new Date(2024, 7, 6), time: "10:00 AM", className: "Spinning Pro", instructorId: "i3", capacity: 15, booked: 15 },
  { id: "c4", date: new Date(2024, 7, 6), time: "07:00 PM", className: "Boxeo Fit", instructorId: "i4", capacity: 18, booked: 10 },
  { id: "c5", date: new Date(2024, 7, 7), time: "08:00 AM", className: "Funcional", instructorId: "i5", capacity: 20, booked: 5 },
];


export default function ClasesPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ScheduledClass | null>(null);

  const classesForSelectedDate = selectedDate
    ? mockScheduledClasses.filter(c => format(c.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"))
    : [];

  const getInstructorNameById = (id: string) => {
    return mockInstructors.find(inst => inst.id === id)?.name || "Desconocido";
  }

  const handleCreateNewClass = () => {
    setEditingClass(null);
    setIsClassDialogOpen(true);
  };

  const handleEditClass = (cls: ScheduledClass) => {
    setEditingClass(cls);
    setIsClassDialogOpen(true);
  };

  const handleClassFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // In a real app, handle form submission
    const formData = new FormData(event.currentTarget);
    const classData = {
        className: formData.get('className'),
        instructorId: formData.get('instructorId'), // Now instructorId
        time: formData.get('time'),
        capacity: Number(formData.get('capacity')),
        // date would be selectedDate
    };
    console.log("Class Data:", classData, "Editing Class:", editingClass, "Selected Date:", selectedDate);
    alert(`Clase ${editingClass ? 'actualizada' : 'creada'}: ${classData.className}`);
    setIsClassDialogOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <Card className="lg:w-1/3 h-fit">
        <CardHeader>
          <CardTitle>Calendario de Clases</CardTitle>
          <CardDescription>Selecciona una fecha para ver las clases.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            locale={es}
          />
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle>
              Clases para {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Ninguna Fecha Seleccionada"}
            </CardTitle>
            <CardDescription>Detalles de las clases programadas.</CardDescription>
          </div>
          <Button onClick={handleCreateNewClass} disabled={!selectedDate}>
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Nueva Clase
          </Button>
        </CardHeader>
        <CardContent>
          {selectedDate ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hora</TableHead>
                    <TableHead>Clase</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Capacidad</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classesForSelectedDate.length > 0 ? (
                    classesForSelectedDate.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell>{cls.time}</TableCell>
                        <TableCell className="font-medium">{cls.className}</TableCell>
                        <TableCell>{getInstructorNameById(cls.instructorId)}</TableCell>
                        <TableCell>{cls.booked}/{cls.capacity}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="outline" size="icon" onClick={() => handleEditClass(cls)}>
                            <Edit className="h-4 w-4" />
                             <span className="sr-only">Editar</span>
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => alert(`Eliminar clase ${cls.className}? (Función no implementada)`)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No hay clases programadas para esta fecha.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
             <p className="text-center text-muted-foreground py-10">Por favor, selecciona una fecha en el calendario.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingClass ? "Editar Clase" : "Crear Nueva Clase"}</DialogTitle>
            <DialogDescription>
              {editingClass ? "Modifica los detalles de la clase." : "Completa los detalles para la nueva clase."}
              {selectedDate && ` Para el ${format(selectedDate, "PPP", { locale: es })}.`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleClassFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="class-name" className="text-right">Nombre Clase</Label>
                <Input id="class-name" name="className" defaultValue={editingClass?.className} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="class-instructor" className="text-right">Instructor</Label>
                <Select name="instructorId" defaultValue={editingClass?.instructorId} required> {/* Changed to instructorId */}
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona instructor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockInstructors.map(instructor => (
                      <SelectItem key={instructor.id} value={instructor.id}>{instructor.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="class-time" className="text-right">Hora</Label>
                <Input id="class-time" name="time" type="time" defaultValue={editingClass?.time} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="class-capacity" className="text-right">Capacidad</Label>
                <Input id="class-capacity" name="capacity" type="number" defaultValue={editingClass?.capacity} className="col-span-3" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsClassDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">{editingClass ? "Guardar Cambios" : "Crear Clase"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
 
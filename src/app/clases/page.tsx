
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { format, setDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface ScheduledClass {
  id: string;
  date: Date;
  time: string;
  className: string;
  instructorId: string;
  capacity: number;
  booked: number;
}

interface Instructor {
  id: string;
  name: string;
}

interface ScheduleSlot {
  dayName: string;
  dayIndex: number; // 0 for Sunday (used by date-fns setDay), 1 for Monday, etc.
  time: string;
  enabled: boolean;
}

const mockInstructors: Instructor[] = [
  { id: "i1", name: "Elena Paz" },
  { id: "i2", name: "Ricardo Sol" },
  { id: "i3", name: "Ana Rivas" },
  { id: "i4", name: "Luis Roca" },
  { id: "i5", name: "Carlos Gómez" },
];

const initialMockScheduledClasses: ScheduledClass[] = [
  { id: "c1", date: new Date(2024, 7, 5), time: "09:00", className: "Yoga Matutino", instructorId: "i1", capacity: 20, booked: 15 },
  { id: "c2", date: new Date(2024, 7, 5), time: "18:00", className: "Zumba Fitness", instructorId: "i2", capacity: 25, booked: 22 },
  { id: "c3", date: new Date(2024, 7, 6), time: "10:00", className: "Spinning Pro", instructorId: "i3", capacity: 15, booked: 15 },
  { id: "c4", date: new Date(2024, 7, 6), time: "19:00", className: "Boxeo Fit", instructorId: "i4", capacity: 18, booked: 10 },
  { id: "c5", date: new Date(2024, 7, 7), time: "08:00", className: "Funcional", instructorId: "i5", capacity: 20, booked: 5 },
];

const initialDaysFramework: ScheduleSlot[] = [
  { dayName: "Lunes", dayIndex: 1, time: "", enabled: false },
  { dayName: "Martes", dayIndex: 2, time: "", enabled: false },
  { dayName: "Miércoles", dayIndex: 3, time: "", enabled: false },
  { dayName: "Jueves", dayIndex: 4, time: "", enabled: false },
  { dayName: "Viernes", dayIndex: 5, time: "", enabled: false },
  { dayName: "Sábado", dayIndex: 6, time: "", enabled: false },
  { dayName: "Domingo", dayIndex: 0, time: "", enabled: false },
];


export default function ClasesPage() {
  const [scheduledClasses, setScheduledClasses] = useState<ScheduledClass[]>(initialMockScheduledClasses);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ScheduledClass | null>(null);
  const { toast } = useToast();

  // State for the new class form (dialog)
  const [newClassName, setNewClassName] = useState("");
  const [newInstructorId, setNewInstructorId] = useState("");
  const [newCapacity, setNewCapacity] = useState<number | string>("");
  const [newClassTime, setNewClassTime] = useState(""); // For editing single instance
  const [newClassScheduleSlots, setNewClassScheduleSlots] = useState<ScheduleSlot[]>(
    JSON.parse(JSON.stringify(initialDaysFramework)) // Deep copy
  );

  useEffect(() => {
    if (isClassDialogOpen) {
      if (editingClass) {
        setNewClassName(editingClass.className);
        setNewInstructorId(editingClass.instructorId);
        setNewCapacity(editingClass.capacity);
        setNewClassTime(editingClass.time); // For editing mode
        setNewClassScheduleSlots(JSON.parse(JSON.stringify(initialDaysFramework))); // Reset days for editing mode
      } else {
        // Reset for new class creation
        setNewClassName("");
        setNewInstructorId("");
        setNewCapacity("");
        setNewClassTime("");
        setNewClassScheduleSlots(JSON.parse(JSON.stringify(initialDaysFramework)));
      }
    }
  }, [isClassDialogOpen, editingClass]);


  const classesForSelectedDate = selectedDate
    ? scheduledClasses.filter(c => format(c.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd"))
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
    
    const capacityNum = Number(newCapacity);
    if (isNaN(capacityNum) || capacityNum <= 0) {
      toast({ title: "Error", description: "La capacidad debe ser un número positivo.", variant: "destructive" });
      return;
    }

    if (editingClass) { // Editing existing single class
      if (!newClassTime) {
        toast({ title: "Error", description: "La hora es obligatoria para editar.", variant: "destructive" });
        return;
      }
      setScheduledClasses(prevClasses => 
        prevClasses.map(cls => 
          cls.id === editingClass.id 
            ? { ...cls, className: newClassName, instructorId: newInstructorId, capacity: capacityNum, time: newClassTime }
            : cls
        )
      );
      toast({ title: "Clase Actualizada", description: `La clase "${newClassName}" ha sido actualizada.` });
    } else { // Creating new class(es) based on schedule slots
      if (!selectedDate) {
        toast({ title: "Error", description: "Por favor, selecciona una fecha base en el calendario.", variant: "destructive" });
        return;
      }
      const newClassesToAdd: ScheduledClass[] = [];
      let createdCount = 0;

      newClassScheduleSlots.forEach(slot => {
        if (slot.enabled && slot.time) {
          const classDate = setDay(selectedDate, slot.dayIndex, { locale: es });
          const newClassInstance: ScheduledClass = {
            id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // Simple unique ID
            date: classDate,
            time: slot.time,
            className: newClassName,
            instructorId: newInstructorId,
            capacity: capacityNum,
            booked: 0,
          };
          newClassesToAdd.push(newClassInstance);
          createdCount++;
        }
      });

      if (createdCount === 0) {
        toast({ title: "Información Faltante", description: "Debes seleccionar al menos un día y especificar la hora para crear clases.", variant: "destructive" });
        return;
      }

      setScheduledClasses(prevClasses => [...prevClasses, ...newClassesToAdd]);
      toast({ title: "Clases Creadas", description: `${createdCount} instancia(s) de "${newClassName}" creadas para la semana del ${format(selectedDate, "PPP", { locale: es })}.` });
    }

    setIsClassDialogOpen(false);
  };
  
  const handleSlotChange = (index: number, field: keyof ScheduleSlot, value: string | boolean) => {
    const updatedSlots = [...newClassScheduleSlots];
    if (field === 'enabled') {
        updatedSlots[index].enabled = value as boolean;
    } else if (field === 'time') {
        updatedSlots[index].time = value as string;
    }
    setNewClassScheduleSlots(updatedSlots);
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
                          <Button variant="destructive" size="icon" onClick={() => {
                              setScheduledClasses(prev => prev.filter(c => c.id !== cls.id));
                              toast({title: "Clase Eliminada", description: `Clase "${cls.className}" eliminada.`});
                            }}>
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingClass ? "Editar Clase" : "Crear Nuevas Clases Semanales"}</DialogTitle>
            <DialogDescription>
              {editingClass ? "Modifica los detalles de la clase." : 
              `Define los horarios para "${newClassName || "nueva clase"}" en la semana del ${selectedDate ? format(selectedDate, "PPP", { locale: es }) : 'fecha seleccionada'}.`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleClassFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="class-name" className="text-right">Nombre Clase</Label>
                <Input id="class-name" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="class-instructor" className="text-right">Instructor</Label>
                <Select value={newInstructorId} onValueChange={setNewInstructorId} required>
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
                <Label htmlFor="class-capacity" className="text-right">Capacidad</Label>
                <Input id="class-capacity" type="number" value={newCapacity} onChange={(e) => setNewCapacity(e.target.value)} className="col-span-3" required />
              </div>

              {editingClass ? ( // Mode for editing a single class instance
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="class-time-edit" className="text-right">Hora</Label>
                  <Input id="class-time-edit" type="time" value={newClassTime} onChange={(e) => setNewClassTime(e.target.value)} className="col-span-3" required />
                </div>
              ) : ( // Mode for creating new classes with weekly schedule
                <div className="col-span-4 space-y-3 rounded-md border p-4">
                  <Label className="text-base font-medium">Horarios Semanales</Label>
                  <p className="text-sm text-muted-foreground">
                    Selecciona los días y establece la hora para cada clase. Se crearán instancias para la semana de la fecha seleccionada en el calendario.
                  </p>
                  {newClassScheduleSlots.map((slot, index) => (
                    <div key={slot.dayName} className="grid grid-cols-3 items-center gap-x-3 gap-y-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${slot.dayName}`}
                          checked={slot.enabled}
                          onCheckedChange={(checked) => handleSlotChange(index, 'enabled', !!checked)}
                        />
                        <Label htmlFor={`day-${slot.dayName}`} className="font-normal whitespace-nowrap">
                          {slot.dayName}
                        </Label>
                      </div>
                      {slot.enabled && (
                        <Input
                          type="time"
                          value={slot.time}
                          onChange={(e) => handleSlotChange(index, 'time', e.target.value)}
                          className="col-span-2"
                        />
                      )}
                       {!slot.enabled && <div className="col-span-2" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsClassDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">{editingClass ? "Guardar Cambios" : "Crear Clases"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    
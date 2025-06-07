
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { format, setDay, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, addDays, subDays, isEqual, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
  dayIndex: number; 
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
  { id: "c1", date: new Date(2024, 7, 5), time: "09:00", className: "Yoga Matutino", instructorId: "i1", capacity: 20, booked: 15 }, // Lunes
  { id: "c2", date: new Date(2024, 7, 5), time: "18:00", className: "Zumba Fitness", instructorId: "i2", capacity: 25, booked: 22 }, // Lunes
  { id: "c3", date: new Date(2024, 7, 6), time: "10:00", className: "Spinning Pro", instructorId: "i3", capacity: 15, booked: 15 }, // Martes
  { id: "c4", date: new Date(2024, 7, 6), time: "19:00", className: "Boxeo Fit", instructorId: "i4", capacity: 18, booked: 10 }, // Martes
  { id: "c5", date: new Date(2024, 7, 7), time: "08:00", className: "Funcional", instructorId: "i5", capacity: 20, booked: 5 },   // Miércoles
  { id: "c6", date: new Date(2024, 7, 8), time: "17:00", className: "Yoga Matutino", instructorId: "i1", capacity: 20, booked: 18 }, // Jueves
  { id: "c7", date: new Date(2024, 7, 9), time: "09:30", className: "Spinning Pro", instructorId: "i3", capacity: 15, booked: 12 }, // Viernes
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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Default to today
  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ScheduledClass | null>(null);
  const { toast } = useToast();

  const [newClassName, setNewClassName] = useState("");
  const [newInstructorId, setNewInstructorId] = useState("");
  const [newCapacity, setNewCapacity] = useState<number | string>("");
  const [newClassTime, setNewClassTime] = useState(""); 
  const [newClassScheduleSlots, setNewClassScheduleSlots] = useState<ScheduleSlot[]>(
    JSON.parse(JSON.stringify(initialDaysFramework))
  );

  useEffect(() => {
    if (isClassDialogOpen) {
      if (editingClass) {
        setNewClassName(editingClass.className);
        setNewInstructorId(editingClass.instructorId);
        setNewCapacity(editingClass.capacity);
        setNewClassTime(editingClass.time); 
        setNewClassScheduleSlots(JSON.parse(JSON.stringify(initialDaysFramework))); 
      } else {
        setNewClassName("");
        setNewInstructorId("");
        setNewCapacity("");
        setNewClassTime("");
        setNewClassScheduleSlots(JSON.parse(JSON.stringify(initialDaysFramework)));
      }
    }
  }, [isClassDialogOpen, editingClass]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1, locale: es }); // weekStartsOn: 1 for Monday
    const end = endOfWeek(selectedDate, { weekStartsOn: 1, locale: es });
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  const getClassesForDay = (date: Date): ScheduledClass[] => {
    return scheduledClasses
      .filter(c => isSameDay(c.date, date))
      .sort((a, b) => a.time.localeCompare(b.time));
  };

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
    if (!newClassName.trim()) {
      toast({ title: "Error", description: "El nombre de la clase es obligatorio.", variant: "destructive" });
      return;
    }
     if (!newInstructorId) {
      toast({ title: "Error", description: "Debe seleccionar un instructor.", variant: "destructive" });
      return;
    }


    if (editingClass) { 
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
    } else { 
      const newClassesToAdd: ScheduledClass[] = [];
      let createdCount = 0;

      newClassScheduleSlots.forEach(slot => {
        if (slot.enabled && slot.time) {
          // Use startOfWeek to ensure we are setting the day within the *selected* week.
          const baseDateForWeek = startOfWeek(selectedDate, { weekStartsOn: 1, locale: es });
          const classDate = setDay(baseDateForWeek, slot.dayIndex, { locale: es });
          
          const newClassInstance: ScheduledClass = {
            id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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
      toast({ title: "Clases Creadas", description: `${createdCount} instancia(s) de "${newClassName}" creadas para la semana del ${format(startOfWeek(selectedDate, {weekStartsOn:1, locale:es}), "PPP", { locale: es })}.` });
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

  const handlePreviousWeek = () => {
    setSelectedDate(prevDate => subDays(prevDate, 7));
  };

  const handleNextWeek = () => {
    setSelectedDate(prevDate => addDays(prevDate, 7));
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="md:w-1/3 lg:w-1/4 h-fit">
          <CardHeader>
            <CardTitle>Seleccionar Semana</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border"
              locale={es}
              ISOWeek={true} 
            />
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>
                Horario Semanal: {format(startOfWeek(selectedDate, {weekStartsOn:1, locale:es}), "dd MMM", { locale: es })} - {format(endOfWeek(selectedDate, {weekStartsOn:1, locale:es}), "dd MMM, yyyy", { locale: es })}
              </CardTitle>
              <CardDescription>Clases programadas para la semana seleccionada.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
                 <span className="sr-only">Semana Anterior</span>
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextWeek}>
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Semana Siguiente</span>
              </Button>
              <Button onClick={handleCreateNewClass}>
                <PlusCircle className="mr-2 h-4 w-4" /> Crear Clases
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full whitespace-nowrap rounded-md border">
              <div className="flex w-max space-x-0"> {/* Ensure no space for border continuity */}
                {weekDays.map((day, index) => {
                  const classesForDay = getClassesForDay(day);
                  return (
                    <div key={day.toISOString()} className={`flex-none w-64 border-r ${index === weekDays.length - 1 ? 'border-r-0' : ''}`}>
                      <div className="p-3 bg-muted/50 border-b">
                        <p className="font-semibold capitalize">{format(day, "eeee", { locale: es })}</p>
                        <p className="text-sm text-muted-foreground">{format(day, "dd/MM", { locale: es })}</p>
                      </div>
                      <ScrollArea className="h-[400px]"> {/* Max height for scroll */}
                        <div className="p-3 space-y-2">
                          {classesForDay.length > 0 ? (
                            classesForDay.map(cls => (
                              <Card key={cls.id} className="p-2 shadow-sm">
                                <p className="font-semibold text-sm">{cls.className}</p>
                                <p className="text-xs text-muted-foreground">{cls.time}</p>
                                <p className="text-xs text-muted-foreground">Prof: {getInstructorNameById(cls.instructorId)}</p>
                                <p className="text-xs text-muted-foreground">Cupo: {cls.booked}/{cls.capacity}</p>
                                <div className="mt-1.5 flex justify-end space-x-1">
                                  <Button variant="outline" size="icon-sm" onClick={() => handleEditClass(cls)}>
                                    <Edit className="h-3.5 w-3.5" />
                                    <span className="sr-only">Editar</span>
                                  </Button>
                                  <Button variant="destructive" size="icon-sm" onClick={() => {
                                      setScheduledClasses(prev => prev.filter(c => c.id !== cls.id));
                                      toast({title: "Clase Eliminada", description: `Clase "${cls.className}" eliminada.`});
                                    }}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span className="sr-only">Eliminar</span>
                                  </Button>
                                </div>
                              </Card>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground text-center py-4">No hay clases.</p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isClassDialogOpen} onOpenChange={setIsClassDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingClass ? "Editar Clase" : "Crear Nuevas Clases Semanales"}</DialogTitle>
            <DialogDescription>
              {editingClass ? "Modifica los detalles de la clase." : 
              `Define los horarios para "${newClassName || "nueva clase"}" en la semana del ${format(startOfWeek(selectedDate, { weekStartsOn:1, locale:es }), "PPP", { locale: es })}.`}
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

              {editingClass ? ( 
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="class-time-edit" className="text-right">Hora</Label>
                  <Input id="class-time-edit" type="time" value={newClassTime} onChange={(e) => setNewClassTime(e.target.value)} className="col-span-3" required />
                </div>
              ) : ( 
                <div className="col-span-4 space-y-3 rounded-md border p-4">
                  <Label className="text-base font-medium">Horarios Semanales</Label>
                  <p className="text-sm text-muted-foreground">
                    Selecciona los días y establece la hora para cada clase. Se crearán instancias para la semana de la fecha seleccionada en el selector de semana.
                  </p>
                  {newClassScheduleSlots.map((slot, index) => (
                    <div key={slot.dayName} className="grid grid-cols-3 items-center gap-x-3 gap-y-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${slot.dayName}`}
                          checked={slot.enabled}
                          onCheckedChange={(checked) => handleSlotChange(index, 'enabled', !!checked)}
                        />
                        <Label htmlFor={`day-${slot.dayName}`} className="font-normal whitespace-nowrap capitalize">
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

    

    
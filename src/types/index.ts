export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  membershipStatus: "activo" | "expirado" | "pendiente";
  membershipId?: string;
  joinDate: string; // ISO Date string
  expiryDate?: string; // ISO Date string
  lastPaymentDate?: string; // ISO Date string
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  durationMonths: number; // Duration in months
  description?: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  instructor: string;
  schedule: {
    dayOfWeek: "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado" | "Domingo";
    time: string; // e.g., "10:00 AM"
  };
  capacity: number;
  enrolledCount: number;
}

export interface Payment {
  id: string;
  clientId: string;
  planId: string;
  amount: number;
  paymentDate: string; // ISO Date string
  paymentMethod: "efectivo" | "tarjeta" | "transferencia" | "online";
  transactionId?: string;
}

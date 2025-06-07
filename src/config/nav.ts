
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Users, CreditCard, CalendarDays, BarChart3, Settings, ReceiptText } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Clientes',
    href: '/clientes',
    icon: Users,
  },
  {
    title: 'Pagos',
    href: '/pagos',
    icon: ReceiptText,
  },
  {
    title: 'Planes',
    href: '/planes',
    icon: CreditCard,
  },
  {
    title: 'Clases',
    href: '/clases',
    icon: CalendarDays,
  },
  {
    title: 'Finanzas',
    href: '/finanzas',
    icon: BarChart3,
  },
  {
    title: 'Configuración',
    href: '/configuracion',
    icon: Settings,
  },
];

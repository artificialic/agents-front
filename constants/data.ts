import { NavItem } from '@/types';

const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

export const navItems: NavItem[] = [
  {
    title: 'Panel',
    url: '/dashboard/',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['p', 'a'],
    items: [],
    role: [ROLES.ADMIN, ROLES.USER]
  },
  {
    title: 'Llamada en Lote',
    url: '/dashboard/batch-call',
    icon: 'users',
    isActive: true,
    shortcut: ['c', 'l'],
    items: [],
    role: [ROLES.USER]
  },
  {
    title: 'Campañas',
    url: '/dashboard/campaign',
    icon: 'users',
    isActive: true,
    shortcut: ['c', 'l'],
    items: [],
    role: [ROLES.USER]
  },
  {
    title: 'Historial de Llamadas',
    url: '/dashboard/call-history',
    icon: 'users',
    isActive: true,
    shortcut: ['c', 'l'],
    items: [],
    role: [ROLES.USER]
  },
  {
    title: 'Llamadas Entrantes',
    url: '/dashboard/incoming-calls',
    icon: 'users',
    isActive: true,
    shortcut: ['c', 'l'],
    items: [],
    role: [ROLES.USER]
  },
  {
    title: 'Clientes',
    url: '/dashboard/clients',
    icon: 'users',
    isActive: true,
    shortcut: ['c', 'l'],
    items: [],
    role: [ROLES.ADMIN]
  },
  {
    title: 'Facturación',
    url: '/dashboard/billing',
    icon: 'users',
    isActive: true,
    shortcut: ['c', 'l'],
    items: [],
    role: [ROLES.USER]
  }
];

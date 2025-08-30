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
    role: [ROLES.USER]
  },
  {
    title: 'Historial de Campañas',
    url: '/dashboard/campaign',
    icon: 'campaigns',
    isActive: true,
    shortcut: ['c', 'l'],
    items: [],
    role: [ROLES.USER]
  },
  {
    title: 'Historial de Llamadas',
    url: '/dashboard/call-history',
    icon: 'callHistory',
    isActive: true,
    shortcut: ['c', 'l'],
    items: [],
    role: [ROLES.USER]
  },
  {
    title: 'Llamadas Entrantes',
    url: '/dashboard/incoming-calls',
    icon: 'incomingCalls',
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
    icon: 'billingAlt',
    isActive: true,
    shortcut: ['c', 'l'],
    items: [],
    role: [ROLES.USER]
  },
  {
    title: 'Plantillas',
    url: '/dashboard/templates',
    icon: 'templates',
    isActive: true,
    shortcut: ['c', 'l'],
    items: [],
    role: [ROLES.ADMIN]
  }
];

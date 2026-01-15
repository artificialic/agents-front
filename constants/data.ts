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
    title: 'Campañas',
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
    title: 'Agentes',
    url: '/dashboard/agents',
    icon: 'user2',
    isActive: true,
    shortcut: ['c', 'l'],
    items: [],
    role: [ROLES.USER]
  },
  {
    title: 'Probar agentes',
    url: '/dashboard/demos',
    icon: 'playCircle',
    isActive: true,
    shortcut: ['d', 'e'],
    items: [],
    role: [ROLES.USER]
  },
  {
    title: 'Base de Conocimientos',
    url: '/dashboard/knowledge-bases',
    icon: 'fileStack',
    isActive: true,
    shortcut: ['c', 'l'],
    items: [],
    role: [ROLES.USER]
  },
  {
    title: 'Números de teléfonos',
    url: '/dashboard/phone-numbers',
    icon: 'phoneNumbers',
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

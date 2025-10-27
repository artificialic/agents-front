'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type BreadcrumbItem = {
  title: string;
  link: string;
};

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ title: 'Dashboard', link: '/dashboard' }],
  '/dashboard/': [{ title: 'Panel', link: '/dashboard/' }],
  '/dashboard/clients': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Clientes', link: '/dashboard/clients' }
  ],
  '/dashboard/overview': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Overview', link: '/dashboard/overview' }
  ],
  '/dashboard/create-campaign': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Crear Campaña', link: '/dashboard/create-campaign' }
  ],
  '/dashboard/agents': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Agentes', link: '/dashboard/agents' }
  ],
  '/dashboard/knowledge-bases': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Bases de Conocimiento', link: '/dashboard/knowledge-bases' }
  ],
  '/dashboard/phone-numbers': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Teléfonos', link: '/dashboard/phone-numbers' }
  ]
};

export function useBreadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Check if we have a custom mapping for this exact path
    if (routeMapping[pathname]) {
      return routeMapping[pathname];
    }

    // If no exact match, fall back to generating breadcrumbs from the path
    const segments = pathname.split('/').filter(Boolean);
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      return {
        title: segment.charAt(0).toUpperCase() + segment.slice(1),
        link: path
      };
    });
  }, [pathname]);

  return breadcrumbs;
}

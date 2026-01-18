'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type BreadcrumbItem = {
  title: string;
  link: string;
};

const segmentTranslations: Record<string, string> = {
  dashboard: 'Dashboard',
  agents: 'Agentes',
  clients: 'Clientes',
  overview: 'Overview',
  'create-campaign': 'Crear Campaña',
  'knowledge-bases': 'Bases de Conocimiento',
  'phone-numbers': 'Teléfonos',
  demos: 'Probar Agentes',
  billing: 'Facturación',
  settings: 'Configuración'
};

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
  ],
  '/dashboard/demos': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Probar Agentes', link: '/dashboard/demos' }
  ]
};

export function useBreadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    if (routeMapping[pathname]) {
      return routeMapping[pathname];
    }

    const segments = pathname.split('/').filter(Boolean);

    if (segments.length > 2) {
      const crumbs: BreadcrumbItem[] = [];

      segments.forEach((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join('/')}`;

        if (segment.startsWith('agent_') || segment.startsWith('llm_') || /^[0-9a-f-]+$/i.test(segment)) {
          crumbs.push({
            title: segment,
            link: path
          });
          return;
        }

        const title = segmentTranslations[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

        crumbs.push({
          title,
          link: path
        });
      });

      return crumbs;
    }

    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      const title = segmentTranslations[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

      return {
        title,
        link: path
      };
    });
  }, [pathname]);

  return breadcrumbs;
}

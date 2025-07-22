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
  '/dashboard/companies': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Compañías', link: '/dashboard/companies' }
  ],
  '/dashboard/plans': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Planes', link: '/dashboard/plans' }
  ],
  '/dashboard/clients': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Clientes', link: '/dashboard/clients' }
  ],
  '/dashboard/comparisons': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Comparaciones', link: '/dashboard/comparisons' }
  ],
  '/dashboard/overview': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Overview', link: '/dashboard/overview' }
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

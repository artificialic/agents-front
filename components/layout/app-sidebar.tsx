// @ts-nocheck
'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';
import { navItems } from '@/constants/data';
import { ChevronRight, ChevronsUpDown, GalleryVerticalEnd, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarInfoCard } from '@/components/layout/sidebar-info-card';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/stores/useUserStore';
import { apiService } from '@/services';

export const company = {
  name: 'Desarrollando Agentes',
  logo: GalleryVerticalEnd
};

export default function AppSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { open, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const roleUser = session?.user?.role || 'user';
  const isUser = roleUser === 'user';
  const newMenuItems = navItems.filter((item) =>
    Array.isArray(item.role) ? item.role.includes(roleUser) : item.role === roleUser
  );

  const onCloseSidebar = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const { fetchUser } = useUserStore();

  const [concurrency, setConcurrency] = useState<any | null>(null);
  const [loadingConcurrency, setLoadingConcurrency] = useState(true);
  const [errorConcurrency, setErrorConcurrency] = useState<string | null>(null);

  useEffect(() => {
    console.log('Fetching user profile...');
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchConcurrency = async () => {
      try {
        setLoadingConcurrency(true);
        const response = await apiService.getConcurrency();

        if (response) {
          setConcurrency(response);
        } else {
          setErrorConcurrency('No se pudieron cargar los datos de concurrencia.');
        }
      } catch (err) {
        console.error('Error al obtener la concurrencia:', err);
        setErrorConcurrency('Error al cargar los datos de concurrencia.');
      } finally {
        setLoadingConcurrency(false);
      }
    };

    fetchConcurrency();
  }, []);

  return (
    <Sidebar collapsible="icon" className="bg-gray-50">
      <SidebarHeader>
        <div className="flex gap-2 py-2 text-sidebar-accent-foreground ">
          <div className="flex aspect-square size-12 items-center justify-center rounded-lg bg-sidebar-primary pl-0 text-sidebar-primary-foreground">
            <img src="/logo-small.png" className="h-8 w-8" alt="Desarrollando" />
          </div>
          <div className="grid flex-1 items-center text-left text-sm leading-tight">
            <span className="truncate font-semibold">{company.name}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            {newMenuItems.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              return item?.items && item?.items?.length > 0 ? (
                <Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} isActive={pathname === item.url}>
                        {item.icon && <Icon />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url}>
                    <Link href={item.url} onClick={onCloseSidebar}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {isUser && open && (
          <SidebarInfoCard concurrency={concurrency} loading={loadingConcurrency} error={errorConcurrency} />
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                    <AvatarFallback className="rounded-lg">
                      {session?.user?.name?.slice(0, 2)?.toUpperCase() || 'CN'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{session?.user?.name || ''}</span>
                    <span className="truncate text-xs">{session?.user?.email || ''}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                      <AvatarFallback className="rounded-lg">
                        {session?.user?.name?.slice(0, 2)?.toUpperCase() || 'CN'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{session?.user?.name || ''}</span>
                      <span className="truncate text-xs"> {session?.user?.email || ''}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
                  <LogOut className="mr-1" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

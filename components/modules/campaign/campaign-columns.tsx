import { ColumnDef, FilterFn} from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {Filter, ArrowUp, ArrowDown } from 'lucide-react'; 
import { Campaign } from '@/services/api.d';
import { formatDate } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DateRangePicker from '@/components/date-range-picker';
import { DateRange } from 'react-day-picker';
import * as React from 'react';


declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends object, TValue> {
    filterVariant?: 'text' | 'select' | 'dateRange';
    options?: { value: string; label: string }[];
  }
}


export const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemValue = String(row.getValue(columnId)).toLowerCase();
  const filterValue = String(value).toLowerCase();
  return itemValue.includes(filterValue);
};

// Función de filtro para rango de fechas
export const dateRangeFilterFn: FilterFn<any> = (row, columnId, filterValue: DateRange) => {
  const date = new Date(row.getValue(columnId));
  const from = filterValue?.from;
  const to = filterValue?.to;

  if (!from && !to) return true;
  if (from && !to) return date >= from;
  if (!from && to) return date <= to;
  if (from && to) return date >= from && date <= to;
  return true;
};

interface CampaignColumnsProps {
  onViewCampaign: (campaignId: string) => void;
}

export const createCampaignColumns = ({ onViewCampaign }: CampaignColumnsProps): ColumnDef<Campaign>[] => {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        const filterValue = (column.getFilterValue() ?? '') as string;
        const isFiltered = column.getIsFiltered();
        return (
          <div className="flex items-center">
            <span className="mr-2">Nombre</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Filter className={`h-4 w-4 ${isFiltered ? 'text-blue-600' : 'text-gray-400'}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuLabel>Opciones de Nombre</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                  Ascendente <ArrowUp className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                  Descendente <ArrowDown className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filtrar nombre</DropdownMenuLabel>
                <div className="p-2">
                  <Input
                    placeholder="Filtrar nombre..."
                    value={filterValue}
                    onChange={(event) => column.setFilterValue(event.target.value)}
                    className="max-w-sm"
                  />
                  {filterValue && (
                    <Button variant="ghost" onClick={() => column.setFilterValue('')} className="mt-2 w-full">
                      Borrar filtro
                    </Button>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      cell: ({ row }) => {
        const campaign = row.original;
        return (
          <button
            className="text-sm text-blue-600"
            onClick={() => onViewCampaign(campaign._id)}
            type="button"
          >
            {campaign.name}
          </button>
        );
      },
      meta: {
        filterVariant: 'text',
      },
      filterFn: fuzzyFilter,
    },
    {
      accessorKey: 'agentName',
      header: ({ column }) => {
        const filterValue = (column.getFilterValue() ?? '') as string;
        const isFiltered = column.getIsFiltered();
        return (
          <div className="flex items-center">
            <span className="mr-2">Agente</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Filter className={`h-4 w-4 ${isFiltered ? 'text-blue-600' : 'text-gray-400'}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuLabel>Opciones de Agente</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                  Ascendente <ArrowUp className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                  Descendente <ArrowDown className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filtrar agente</DropdownMenuLabel>
                <div className="p-2">
                  <Input
                    placeholder="Filtrar agente..."
                    value={filterValue}
                    onChange={(event) => column.setFilterValue(event.target.value)}
                    className="max-w-sm"
                  />
                  {filterValue && (
                    <Button variant="ghost" onClick={() => column.setFilterValue('')} className="mt-2 w-full">
                      Borrar filtro
                    </Button>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      cell: ({ row }) => {
        const campaign = row.original;
        return <span className="text-sm text-gray-900">{campaign.agentName ?? campaign.agentId}</span>;
      },
      meta: {
        filterVariant: 'text',
      },
      filterFn: fuzzyFilter,
    },
    {
      accessorKey: 'fromNumber',
      header: ({ column }) => {
        const filterValue = (column.getFilterValue() ?? '') as string;
        const isFiltered = column.getIsFiltered();
        return (
          <div className="flex items-center">
            <span className="mr-2">Número de teléfono</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Filter className={`h-4 w-4 ${isFiltered ? 'text-blue-600' : 'text-gray-400'}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuLabel>Opciones de Número</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                  Ascendente <ArrowUp className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                  Descendente <ArrowDown className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filtrar número</DropdownMenuLabel>
                <div className="p-2">
                  <Input
                    placeholder="Filtrar número..."
                    value={filterValue}
                    onChange={(event) => column.setFilterValue(event.target.value)}
                    className="max-w-sm"
                  />
                  {filterValue && (
                    <Button variant="ghost" onClick={() => column.setFilterValue('')} className="mt-2 w-full">
                      Borrar filtro
                    </Button>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      cell: ({ row }) => <span className="text-sm text-gray-900">{row.original.fromNumber}</span>,
      meta: {
        filterVariant: 'text',
      },
      filterFn: fuzzyFilter,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => {
        const statuses = [
          { value: 'draft', label: 'Borrador' },
          { value: 'active', label: 'Activa' },
          { value: 'completed', label: 'Completada' },
          { value: 'paused', label: 'Pausada' },
        ];
        const filterValue = (column.getFilterValue() ?? '') as string;
        const isFiltered = column.getIsFiltered();

        return (
          <div className="flex items-center">
            <span className="mr-2">Estado</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Filter className={`h-4 w-4 ${isFiltered ? 'text-blue-600' : 'text-gray-400'}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuLabel>Opciones de Estado</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                  Ascendente <ArrowUp className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                  Descendente <ArrowDown className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filtrar estado</DropdownMenuLabel>
                <div className="p-2">
                  <Select
                    value={filterValue}
                    onValueChange={(value) => column.setFilterValue(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filtrar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filterValue && filterValue !== 'all' && (
                    <Button variant="ghost" onClick={() => column.setFilterValue('')} className="mt-2 w-full">
                      Borrar filtro
                    </Button>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      cell: ({ row }) => {
        const status = row.original.status;
        const getStatusBadge = (status: string) => {
          switch (status) {
            case 'active':
              return 'bg-green-100 text-green-800';
            case 'draft':
              return 'bg-gray-100 text-gray-800';
            case 'completed':
              return 'bg-blue-100 text-blue-800';
            case 'paused':
              return 'bg-yellow-100 text-yellow-800';
            default:
              return 'bg-gray-100 text-gray-800';
          }
        };

        const getStatusText = (status: string) => {
          switch (status) {
            case 'active':
              return 'Activa';
            case 'draft':
              return 'Borrador';
            case 'completed':
              return 'Completada';
            case 'paused':
              return 'Pausada';
            default:
              return status;
          }
        };
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(
              status
            )}`}
          >
            {getStatusText(status)}
          </span>
        );
      },
      meta: {
        filterVariant: 'select',
        options: [
          { value: 'draft', label: 'Borrador' },
          { value: 'active', label: 'Activa' },
          { value: 'completed', label: 'Completada' },
          { value: 'paused', label: 'Pausada' },
        ],
      },
      filterFn: (row, columnId, value) => {
        if (value === 'all' || !value) return true;
        return row.getValue(columnId) === value;
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        const filterValue = (column.getFilterValue() as DateRange) ?? undefined;
        const [date, setDate] = React.useState<DateRange | undefined>(filterValue);
        const isFiltered = column.getIsFiltered();

        React.useEffect(() => {
          column.setFilterValue(date);
        }, [date, column]);

        return (
          <div className="flex items-center">
            <span className="mr-2">Fecha de Creación</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Filter className={`h-4 w-4 ${isFiltered ? 'text-blue-600' : 'text-gray-400'}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[250px]" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuLabel>Opciones de Fecha de Creación</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                  Ascendente <ArrowUp className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                  Descendente <ArrowDown className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filtrar por fecha</DropdownMenuLabel>
                <div className="p-2">
                  <DateRangePicker
                    value={date}
                    onChange={setDate}
                    align="end"
                  />
                  {(date?.from || date?.to) && (
                    <Button variant="ghost" onClick={() => setDate(undefined)} className="mt-2 w-full">
                      Borrar filtro
                    </Button>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      cell: ({ row }) => <span className="text-sm text-gray-900">{formatDate(row.original.createdAt)}</span>,
      meta: {
        filterVariant: 'dateRange',
      },
      filterFn: dateRangeFilterFn,
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => {
        const filterValue = (column.getFilterValue() as DateRange) ?? undefined;
        const [date, setDate] = React.useState<DateRange | undefined>(filterValue);
        const isFiltered = column.getIsFiltered();

        React.useEffect(() => {
          column.setFilterValue(date);
        }, [date, column]);

        return (
          <div className="flex items-center">
            <span className="mr-2">Última Actualización</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Filter className={`h-4 w-4 ${isFiltered ? 'text-blue-600' : 'text-gray-400'}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[250px]" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuLabel>Opciones de Última Actualización</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                  Ascendente <ArrowUp className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                  Descendente <ArrowDown className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filtrar por fecha</DropdownMenuLabel>
                <div className="p-2">
                  <DateRangePicker
                    value={date}
                    onChange={setDate}
                    align="end"
                  />
                  {(date?.from || date?.to) && (
                    <Button variant="ghost" onClick={() => setDate(undefined)} className="mt-2 w-full">
                      Borrar filtro
                    </Button>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      cell: ({ row }) => <span className="text-sm text-gray-900">{formatDate(row.original.updatedAt)}</span>,
      meta: {
        filterVariant: 'dateRange',
      },
      filterFn: dateRangeFilterFn,
    },
  ];
};
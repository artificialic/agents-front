import { ColumnDef, FilterFn, Row } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, MoreHorizontal, Filter, Eye, Loader2, ArrowUp, ArrowDown } from 'lucide-react'; 
import { ContactByCampaign } from '@/services/api.d';
import { formatDate } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DateRangePicker from '@/components/date-range-picker';
import { DateRange } from 'react-day-picker';
import * as React from 'react';
import { applyCostMultiplier } from '@/utils';
import { useUserStore } from '@/stores/useUserStore';

export const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemValue = String(row.getValue(columnId)).toLowerCase();
  const filterValue = String(value).toLowerCase();
  return itemValue.includes(filterValue);
};

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

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'done':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'working':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'done':
      return 'Completado';
    case 'pending':
      return 'Pendiente';
    case 'failed':
      return 'Fallido';
    case 'processing':
      return 'Procesando';
    case 'working':
      return 'Trabajando';
    default:
      return status;
  }
};

const getCallStatusBadge = (callStatus: string) => {
  switch (callStatus) {
    case 'registered':
      return 'bg-purple-100 text-purple-800';
    case 'not_connected':
      return 'bg-orange-100 text-orange-800';
    case 'ongoing':
      return 'bg-blue-100 text-blue-800';
    case 'ended':
      return 'bg-green-100 text-green-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'working':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getCallStatusText = (callStatus: string) => {
  switch (callStatus) {
    case 'registered':
      return 'Registrada';
    case 'not_connected':
      return 'No Conectada';
    case 'ongoing':
      return 'En Curso';
    case 'ended':
      return 'Finalizada';
    case 'error':
      return 'Error';
    case 'pending':
      return 'Pendiente';
    case 'working':
      return 'Trabajando';
    default:
      return callStatus;
  }
};

interface CampaignContactsColumnsProps {
  dynamicFields: string[];
  handleViewContact: (contact: ContactByCampaign) => Promise<void>;
  loadingCall: boolean;
}

export const createCampaignContactsColumns = ({ dynamicFields, handleViewContact, loadingCall }: CampaignContactsColumnsProps): ColumnDef<ContactByCampaign>[] => {
  const getMultiplier = useUserStore.getState().getMultiplier;

  const columns: ColumnDef<ContactByCampaign>[] = [
    {
      accessorKey: 'toNumber',
      header: ({ column }) => {
        const filterValue = (column.getFilterValue() ?? '') as string;
        const isFiltered = column.getIsFiltered();
        return (
          <div className="flex items-center">
            <span className="mr-2">Número de Teléfono</span>
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
      cell: ({ row }) => (
        <span className="font-mono text-sm text-gray-900">{row.original.toNumber}</span>
      ),
      meta: {
        filterVariant: 'text',
      },
      filterFn: fuzzyFilter,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => {
        const statuses = [
          { value: 'registered', label: 'Registrada' },
          { value: 'not_connected', label: 'No Conectada' },
          { value: 'ongoing', label: 'En Curso' },
          { value: 'ended', label: 'Finalizada' },
          { value: 'error', label: 'Error' },
          { value: 'pending', label: 'Pendiente' },
          { value: 'working', label: 'Trabajando' },
          { value: 'done', label: 'Completado' },
          { value: 'failed', label: 'Fallido' },
          { value: 'processing', label: 'Procesando' },
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
        const status = row.original.callStatus || row.original.status;
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              row.original.callStatus ? getCallStatusBadge(status) : getStatusBadge(status)
            }`}
          >
            {row.original.callStatus ? getCallStatusText(status) : getStatusText(status)}
          </span>
        );
      },
      meta: {
        filterVariant: 'select',
        options: [
          { value: 'registered', label: 'Registrada' },
          { value: 'not_connected', label: 'No Conectada' },
          { value: 'ongoing', label: 'En Curso' },
          { value: 'ended', label: 'Finalizada' },
          { value: 'error', label: 'Error' },
          { value: 'pending', label: 'Pendiente' },
          { value: 'working', label: 'Trabajando' },
          { value: 'done', label: 'Completado' },
          { value: 'failed', label: 'Fallido' },
          { value: 'processing', label: 'Procesando' },
        ],
      },
      filterFn: (row, columnId, value) => {
        if (value === 'all' || !value) return true;
        const status = row.original.callStatus || row.original.status;
        return status === value;
      },
    },
    {
      accessorKey: 'callId',
      header: ({ column }) => {
        const filterValue = (column.getFilterValue() ?? '') as string;
        const isFiltered = column.getIsFiltered();
        return (
          <div className="flex items-center">
            <span className="mr-2">ID de Llamada</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Filter className={`h-4 w-4 ${isFiltered ? 'text-blue-600' : 'text-gray-400'}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuLabel>Opciones de ID de Llamada</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                  Ascendente <ArrowUp className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                  Descendente <ArrowDown className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filtrar ID</DropdownMenuLabel>
                <div className="p-2">
                  <Input
                    placeholder="Filtrar ID..."
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
      cell: ({ row }) => (
        row.original.callId ? (
          <span className="font-mono text-sm text-gray-900">{row.original.callId}</span>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )
      ),
      meta: {
        filterVariant: 'text',
      },
      filterFn: fuzzyFilter,
    },
    {
      accessorKey: 'cost',
      header: ({ column }) => {
        const isFiltered = column.getIsFiltered(); 
        return (
          <div className="flex items-center">
            <span className="mr-2">Coste</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Filter className={`h-4 w-4 ${isFiltered ? 'text-blue-600' : 'text-gray-400'}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuLabel>Opciones de Coste</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                  Ascendente <ArrowUp className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                  Descendente <ArrowDown className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">
          ${applyCostMultiplier(row.original.cost, getMultiplier()).toFixed(4)}
        </span>
      ),
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
      accessorKey: 'processedAt',
      header: ({ column }) => {
        const filterValue = (column.getFilterValue() as DateRange) ?? undefined;
        const [date, setDate] = React.useState<DateRange | undefined>(filterValue);
        const isFiltered = column.getIsFiltered();

        React.useEffect(() => {
          column.setFilterValue(date);
        }, [date, column]);

        return (
          <div className="flex items-center">
            <span className="mr-2">Procesado</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Filter className={`h-4 w-4 ${isFiltered ? 'text-blue-600' : 'text-gray-400'}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[250px]" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuLabel>Opciones de Procesado</DropdownMenuLabel>
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
      cell: ({ row }) => (
        row.original.processedAt ? (
          <span className="text-sm text-gray-900">{formatDate(row.original.processedAt)}</span>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )
      ),
      meta: {
        filterVariant: 'dateRange',
      },
      filterFn: dateRangeFilterFn,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const contact = row.original;
        return (
          contact.callId ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleViewContact(contact)}
              disabled={loadingCall}
            >
              {loadingCall ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              <span className="sr-only">Ver contacto</span>
            </Button>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )
        );
      },
    },
  ];

  // Añadir columnas dinámicas
  dynamicFields.forEach((fieldName) => {
    columns.splice(columns.length - 1, 0, {
      accessorKey: `callAnalysis.custom_analysis_data.${fieldName}`,
      header: ({ column }) => {
        const filterValue = (column.getFilterValue() ?? '') as string;
        const isFiltered = column.getIsFiltered();
        return (
          <div className="flex items-center">
            <span className="mr-2">{fieldName}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Filter className={`h-4 w-4 ${isFiltered ? 'text-blue-600' : 'text-gray-400'}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuLabel>Opciones de {fieldName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                  Ascendente <ArrowUp className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                  Descendente <ArrowDown className="ml-2 h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filtrar {fieldName}</DropdownMenuLabel>
                <div className="p-2">
                  <Input
                    placeholder={`Filtrar ${fieldName}...`}
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
        const value = row.original.callAnalysis?.custom_analysis_data?.[fieldName];
        return (
          <span className="text-sm text-gray-900">{value || '-'}</span>
        );
      },
      meta: {
        filterVariant: 'text',
      },
      filterFn: fuzzyFilter,
    });
  });

  return columns;
};

import { ColumnDef, FilterFn } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Eye, Loader2 } from 'lucide-react';
import { ContactByCampaign } from '@/services/api.d';
import { formatDate } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import * as React from 'react';
import { applyCostMultiplier } from '@/utils';
import { useUserStore } from '@/stores/useUserStore';
import { DataTableColumnHeader } from '@/components/data-table-column-header';

export const fuzzyFilter: FilterFn<any> = (row, columnId, value) => {
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
  const statusClasses: { [key: string]: string } = {
    done: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    processing: 'bg-blue-100 text-blue-800',
    working: 'bg-blue-100 text-blue-800',
  };
  return statusClasses[status] || 'bg-gray-100 text-gray-800';
};

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    done: 'Completado',
    pending: 'Pendiente',
    failed: 'Fallido',
    processing: 'Procesando',
    working: 'Trabajando',
  };
  return statusMap[status] ?? status;
};

const getCallStatusBadge = (callStatus: string) => {
  const statusClasses: { [key: string]: string } = {
    registered: 'bg-purple-100 text-purple-800',
    not_connected: 'bg-orange-100 text-orange-800',
    ongoing: 'bg-blue-100 text-blue-800',
    ended: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    working: 'bg-blue-100 text-blue-800',
  };
  return statusClasses[callStatus] || 'bg-gray-100 text-gray-800';
};

const getCallStatusText = (callStatus: string) => {
  const statusMap: { [key: string]: string } = {
    registered: 'Registrada',
    not_connected: 'No Conectada',
    ongoing: 'En Curso',
    ended: 'Finalizada',
    error: 'Error',
    pending: 'Pendiente',
    working: 'Trabajando',
  };
  return statusMap[callStatus] ?? callStatus;
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
      header: ({ column }) => <DataTableColumnHeader column={column} title="Número de Teléfono" />,
      cell: ({ row }) => <span className="font-mono text-sm text-gray-900">{row.original.toNumber}</span>,
      meta: { filterVariant: 'text' },
      filterFn: fuzzyFilter,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
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
        if (!value) return true;
        const status = row.original.callStatus || row.original.status;
        return status === value;
      },
    },
    {
      accessorKey: 'disposition',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tipificacion" />,
      cell: ({ row }) => row.original.disposition ? <span className="text-sm text-gray-900">{row.original.disposition}</span> : <span className="text-sm text-gray-400">-</span>,
      meta: { filterVariant: 'text' },
      filterFn: fuzzyFilter,
    },
    {
      accessorKey: 'callId',
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID de Llamada" />,
      cell: ({ row }) => row.original.callId ? <span className="font-mono text-sm text-gray-900">{row.original.callId}</span> : <span className="text-sm text-gray-400">-</span>,
      meta: { filterVariant: 'text' },
      filterFn: fuzzyFilter,
    },
    {
      accessorKey: 'cost',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Coste" />,
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">
          ${applyCostMultiplier(row.original.cost, getMultiplier()).toFixed(4)}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de Creación" />,
      cell: ({ row }) => <span className="text-sm text-gray-900">{formatDate(row.original.createdAt)}</span>,
      meta: { filterVariant: 'dateRange' },
      filterFn: dateRangeFilterFn,
    },
    {
      accessorKey: 'processedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Procesado" />,
      cell: ({ row }) => row.original.processedAt ? <span className="text-sm text-gray-900">{formatDate(row.original.processedAt)}</span> : <span className="text-sm text-gray-400">-</span>,
      meta: { filterVariant: 'dateRange' },
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

  dynamicFields.forEach((fieldName) => {
    columns.splice(columns.length - 1, 0, {
      accessorKey: `callAnalysis.custom_analysis_data.${fieldName}`,
      header: ({ column }) => <DataTableColumnHeader column={column} title={fieldName} />,
      cell: ({ row }) => {
        const value = row.original.callAnalysis?.custom_analysis_data?.[fieldName];
        return <span className="text-sm text-gray-900">{String(value) || '-'}</span>;
      },
      meta: { filterVariant: 'text' },
      filterFn: fuzzyFilter,
    });
  });

  return columns;
};
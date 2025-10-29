import { ColumnDef, FilterFn } from '@tanstack/react-table';
import { Campaign } from '@/services/api.d';
import { formatDate } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Button } from '@/components/ui/button';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends object, TValue> {
    filterVariant?: 'text' | 'select' | 'dateRange';
    options?: { value: string; label: string }[];
  }
}

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

interface CampaignColumnsProps {
  onViewCampaign: (campaignId: string) => void;
}

export const createCampaignColumns = ({ onViewCampaign }: CampaignColumnsProps): ColumnDef<Campaign>[] => {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
      cell: ({ row }) => (
        <Button
          variant="link"
          className="p-0"
          onClick={() => onViewCampaign(row.original._id)}
        >
          {row.original.name}
        </Button>
      ),
      meta: {
        filterVariant: 'text',
      },
      filterFn: fuzzyFilter,
    },
    {
      accessorKey: 'agentName',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Agente" />,
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
      header: ({ column }) => <DataTableColumnHeader column={column} title="Número de teléfono" />,
      cell: ({ row }) => <span className="text-sm text-gray-900">{row.original.fromNumber}</span>,
      meta: {
        filterVariant: 'text',
      },
      filterFn: fuzzyFilter,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
      cell: ({ row }) => {
        const status = row.original.status;
        const getStatusBadge = (status: string) => {
          switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            case 'paused': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
          }
        };
        const getStatusText = (status: string) => {
          const statusMap: { [key: string]: string } = {
            active: 'Activa',
            draft: 'Borrador',
            completed: 'Completada',
            paused: 'Pausada',
          };
          return statusMap[status] ?? status;
        };
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(status)}`}
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
        if (!value) return true;
        return row.getValue(columnId) === value;
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de Creación" />,
      cell: ({ row }) => <span className="text-sm text-gray-900">{formatDate(row.original.createdAt)}</span>,
      meta: {
        filterVariant: 'dateRange',
      },
      filterFn: dateRangeFilterFn,
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Última Actualización" />,
      cell: ({ row }) => <span className="text-sm text-gray-900">{formatDate(row.original.updatedAt)}</span>,
      meta: {
        filterVariant: 'dateRange',
      },
      filterFn: dateRangeFilterFn,
    },
  ];
};

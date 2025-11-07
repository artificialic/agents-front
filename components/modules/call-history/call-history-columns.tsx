import type { ColumnDef, FilterFn } from '@tanstack/react-table';
import { Copy } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { callStatusColorMap, disconnectionReasonColorMap, sentimentColorMap, translatedStatus } from '@/utils';

export type CallLog = Call;

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

export const durationRangeFilterFn: FilterFn<any> = (row, columnId, filterValue: { type: string; value?: number; min?: number; max?: number }) => {
  const duration = row.getValue(columnId) as number;

  if (!filterValue || !filterValue.type) {
    return true;
  }

  switch (filterValue.type) {
    case 'greaterThan':
      return duration > (filterValue.value || 0);
    case 'greaterThanOrEqualTo':
      return duration >= (filterValue.value || 0);
    case 'lessThan':
      return duration < (filterValue.value || 0);
    case 'lessThanOrEqualTo':
      return duration <= (filterValue.value || 0);
    case 'equalTo':
      return duration === (filterValue.value || 0);
    case 'between':
      const min = filterValue.min || 0;
      const max = filterValue.max || 0;
      return duration >= min && duration <= max;
    default:
      return true;
  }
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('es-ES', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const formatDuration = (durationMs: number | null) => {
  if (durationMs === null || durationMs === 0) return '0:00';
  const seconds = Math.floor(durationMs / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString()?.padStart(2, '0')}`;
};

const formatCost = (cost: number) => {
  return `$${(cost / 100).toFixed(3)}`;
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

const StatusIndicator = ({ status }: { status: string }) => {
  const colorClass = sentimentColorMap[status] || disconnectionReasonColorMap[status] || callStatusColorMap[status];
  const bgColorClass = colorClass ? `bg-[${colorClass}]` : 'bg-gray-400';

  return (
    <div className="flex items-center">
      <div className={`mr-2 h-2 w-2 rounded-full ${bgColorClass}`}></div>
      <span className="text-sm text-gray-900">{translatedStatus(status)}</span>
    </div>
  );
};

const callTypeOptions = [
  { value: 'phone_call', label: 'Llamada telefónica' },
  { value: 'web_call', label: 'Llamada web' }
];

const disconnectionReasonOptions = Object.keys(disconnectionReasonColorMap).map(reason => ({ value: reason, label: translatedStatus(reason) }));
const callStatusOptions = Object.keys(callStatusColorMap).map(status => ({ value: status, label: translatedStatus(status) }));
const userSentimentOptions = Object.keys(sentimentColorMap).map(sentiment => ({ value: sentiment, label: translatedStatus(sentiment) }));

const sessionOutcomeOptions = [
  { value: 'Successful', label: 'Exitoso' },
  { value: 'Unsuccessful', label: 'No exitoso' }
];

export const columns: ColumnDef<CallLog>[] = [
  {
    accessorKey: 'start_timestamp',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Hora" />,
    size: 180,
    minSize: 180,
    enableResizing: false,
    cell: ({ row }) => (
      <div className="min-w-32 whitespace-nowrap text-sm text-gray-900">
        {formatTime(row.getValue('start_timestamp'))}
      </div>
    ),
    meta: {
      filterVariant: 'dateRange'
    },
    filterFn: dateRangeFilterFn,
  },
  {
    accessorKey: 'duration_ms',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Duración" />,
    size: 100,
    minSize: 100,
    enableResizing: false,
    cell: ({ row }) => (
      <div className="min-w-32 whitespace-nowrap text-sm text-gray-900">
        {formatDuration(row.getValue('duration_ms'))}
      </div>
    ),
    meta: {
      filterVariant: 'durationRange' as any
    },
    filterFn: durationRangeFilterFn,
  },
  {
    accessorKey: 'call_type',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo de Canal" />,
    size: 150,
    minSize: 150,
    enableResizing: false,
    cell: ({ row }) => {
      const callType = row.getValue('call_type') as string;
      return (
        <div className="min-w-32 whitespace-nowrap text-sm text-gray-900">
          {callType === 'phone_call' ? 'Llamada telefónica' : 'Llamada web'}
        </div>
      );
    },
    meta: {
      filterVariant: 'select',
      options: callTypeOptions
    },
    filterFn: (row, columnId, value) => !value || row.getValue(columnId) === value,
  },
  {
    accessorKey: 'call_cost',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Costo" />,
    size: 100,
    minSize: 100,
    enableResizing: false,
    cell: ({ row }) => {
      const cost = row.original.call_cost;
      let costValue = 0;
      if (typeof cost === 'number') {
        costValue = cost;
      } else if (cost?.combined_cost !== undefined) {
        costValue = cost.combined_cost;
      }
      return <div className="min-w-32 whitespace-nowrap text-sm text-gray-900">{formatCost(costValue)}</div>;
    },
  },
  {
    accessorKey: 'call_id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID de Sesión" />,
    size: 250,
    minSize: 250,
    enableResizing: false,
    cell: ({ row }) => {
      const callId = row.getValue('call_id') as string;
      return (
        <div className="group flex min-w-32 items-center whitespace-nowrap font-mono text-sm text-xs text-gray-900">
          <span className="mr-1">{callId}</span>
          <button
            className="cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => { e.stopPropagation(); copyToClipboard(callId); }}
            title="Copiar ID"
          >
            <Copy className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      );
    },
    meta: { filterVariant: 'text' },
    filterFn: fuzzyFilter,
  },
  {
    accessorKey: 'disconnection_reason',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Razón de Finalización" />,
    size: 180,
    minSize: 180,
    enableResizing: false,
    cell: ({ row }) => (
      <div className="min-w-32 whitespace-nowrap">
        <StatusIndicator status={row.getValue('disconnection_reason') || 'dial_no_answer'} />
      </div>
    ),
    meta: {
      filterVariant: 'select',
      options: disconnectionReasonOptions
    },
    filterFn: (row, columnId, value) => !value || row.getValue(columnId) === value,
  },
  {
    accessorKey: 'call_status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado de Sesión" />,
    size: 150,
    minSize: 150,
    enableResizing: false,
    cell: ({ row }) => (
      <div className="min-w-32 whitespace-nowrap">
        <StatusIndicator status={row.getValue('call_status') || 'error'} />
      </div>
    ),
    meta: {
      filterVariant: 'select',
      options: callStatusOptions
    },
    filterFn: (row, columnId, value) => !value || row.getValue(columnId) === value,
  },
  {
    accessorKey: 'call_analysis.user_sentiment',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Sentimiento del Usuario" />,
    size: 180,
    minSize: 180,
    enableResizing: false,
    cell: ({ row }) => (
      <div className="min-w-32 whitespace-nowrap">
        <StatusIndicator status={row.original.call_analysis?.user_sentiment || 'Unknown'} />
      </div>
    ),
    meta: {
      filterVariant: 'select',
      options: userSentimentOptions
    },
    filterFn: (row, columnId, value) => !value || row.original.call_analysis?.user_sentiment === value,
  },
  {
    accessorKey: 'from_number',
    header: ({ column }) => <DataTableColumnHeader column={column} title="De" />,
    size: 130,
    minSize: 130,
    enableResizing: false,
    cell: ({ row }) => (
      <div className="min-w-32 whitespace-nowrap text-sm text-gray-900">
        {row.getValue('from_number') || 'Desconocido'}
      </div>
    ),
    meta: { filterVariant: 'text' },
    filterFn: fuzzyFilter,
  },
  {
    accessorKey: 'to_number',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Para" />,
    size: 130,
    minSize: 130,
    enableResizing: false,
    cell: ({ row }) => (
      <div className="min-w-32 whitespace-nowrap text-sm text-gray-900">
        {row.getValue('to_number') || 'Desconocido'}
      </div>
    ),
    meta: { filterVariant: 'text' },
    filterFn: fuzzyFilter,
  },
  {
    id: 'session_outcome',
    accessorKey: 'call_analysis.call_successful',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Resultado de Sesión" />,
    size: 180,
    minSize: 180,
    enableResizing: false,
    cell: ({ row }) => (
      <div className="min-w-32 whitespace-nowrap">
        <StatusIndicator status={row.original.call_analysis?.call_successful ? 'Successful' : 'Unsuccessful'} />
      </div>
    ),
    meta: {
      filterVariant: 'select',
      options: sessionOutcomeOptions
    },
    filterFn: (row, columnId, value) => {
      if (value === null || value === undefined) return true;
      const outcome = row.original.call_analysis?.call_successful ? 'Successful' : 'Unsuccessful';
      return outcome === value;
    },
  },
  {
    id: 'disposition',
    accessorKey: 'call_analysis.custom_analysis_data.tipificaciones',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tipificación" />,
    size: 180,
    minSize: 180,
    enableResizing: false,
    cell: ({ row }) => {
      const disposition = row.original.call_analysis?.custom_analysis_data?.tipificaciones;
      return (
        <div className="min-w-32 whitespace-nowrap text-sm text-gray-900">
          {disposition as string || '-'}
        </div>
      );
    },
    meta: {
      filterVariant: 'select',
      options: []
    },
    filterFn: (row, columnId, value) => !value || row.original.call_analysis?.custom_analysis_data?.tipificaciones === value,
  },
  {
    id: 'latency',
    accessorKey: 'latency.e2e.p50',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Latencia de Extremo a Extremo" />,
    size: 200,
    minSize: 200,
    enableResizing: false,
    cell: ({ row }) => {
      const latencyValue = row.original?.latency as CallLatency;
      return (
        <div className="min-w-32 whitespace-nowrap text-sm text-gray-900">
          {latencyValue ? `${latencyValue?.e2e?.p50}ms` : '-'}
        </div>
      );
    },
  }
];
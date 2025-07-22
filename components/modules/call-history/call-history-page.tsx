// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, X, ChevronLeft } from 'lucide-react';
import DateRangePicker from '@/components/date-range-picker';
import { DataTable } from '@/components/data-table';
import { columns, type CallLog } from './call-history-columns';
import CallDetailSheet from './call-detail-sheet';
import CallHistoryFilters from './call-history-filters';
import { MetricsDashboard } from '@/components/metrics-dashboard';
import { apiService } from '@/services';

interface CallHistoryPageProps {
  batchId?: string;
  onBack?: () => void;
  incomingCallsFilter?: boolean;
}

export default function CallHistoryPage({ batchId, onBack, incomingCallsFilter }: CallHistoryPageProps) {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null
  });
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'metrics'>('logs');

  useEffect(() => {
    if (batchId) {
      fetchCallLogs();
    } else {
      fetchAllCallLogs();
    }
  }, [batchId]);

  const fetchCallLogs = async (filterCriteria?: any) => {
    if (!batchId) return;

    try {
      setLoading(true);
      setError(null);

      const requestBody: any = {
        filter_criteria: {
          batch_call_id: [batchId],
          ...(incomingCallsFilter ? { direction: ['inbound'] } : {}),
          ...filterCriteria?.filter_criteria
        },
        sort_order: 'descending',
        limit: 50
      };

      if (dateRange.from || dateRange.to) {
        const startTimestampFilter: any = {};

        if (dateRange.from) {
          const fromDate = new Date(dateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          startTimestampFilter.lower_threshold = fromDate.getTime();
        }

        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          startTimestampFilter.upper_threshold = toDate.getTime();
        } else if (dateRange.from) {
          const toDate = new Date(dateRange.from);
          toDate.setHours(23, 59, 59, 999);
          startTimestampFilter.upper_threshold = toDate.getTime();
        }

        requestBody.filter_criteria.start_timestamp = startTimestampFilter;
      }

      const response = await apiService.getCalls(requestBody);
      console.log('API Response (fetchCallLogs):', response);
      const data = Array.isArray(response) ? response : response?.data ?? [];
      setCallLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching call logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCallLogs = async (filterCriteria?: any) => {
    try {
      setLoading(true);
      setError(null);

      const requestBody: any = {
        filter_criteria: {
          ...(incomingCallsFilter ? { direction: ['inbound'] } : {}),
          ...(filterCriteria?.filter_criteria || {})
        },
        limit: 51,
        sort_order: 'descending'
      };

      if (dateRange.from || dateRange.to) {
        const startTimestampFilter: any = {};

        if (dateRange.from) {
          const fromDate = new Date(dateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          startTimestampFilter.lower_threshold = fromDate.getTime();
        }

        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          startTimestampFilter.upper_threshold = toDate.getTime();
        } else if (dateRange.from) {
          const toDate = new Date(dateRange.from);
          toDate.setHours(23, 59, 59, 999);
          startTimestampFilter.upper_threshold = toDate.getTime();
        }

        requestBody.filter_criteria.start_timestamp = startTimestampFilter;
      }

      const response = await apiService.getCalls(requestBody);
      console.log('API Response (fetchAllCallLogs):', response);
      const data = Array.isArray(response) ? response : response?.data ?? [];
      setCallLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching all call logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeBatchFilter = () => {};

  const handleExport = () => {
    console.log('Exportando registros de llamadas...');
  };

  const handleDateRangeChange = (range: { from: Date | null; to: Date | null }) => {
    setDateRange(range);

    if (batchId) {
      fetchCallLogs();
    } else {
      fetchAllCallLogs();
    }
  };

  const handleFilterSelect = (filterCriteria: any) => {
    console.log('Criterios de filtro recibidos:', filterCriteria);

    if (batchId) {
      fetchCallLogs(filterCriteria);
    } else {
      fetchAllCallLogs(filterCriteria);
    }
  };

  const handleRowClick = (call: CallLog) => {
    setSelectedCall(call);
    setSheetOpen(true);
  };

  const enhancedColumns = columns.map((column) => ({
    ...column,
    cell: (props: any) => {
      const originalCell = column.cell ? column.cell(props) : null;
      return (
        <div className="cursor-pointer" onClick={() => handleRowClick(props.row.original)}>
          {originalCell}
        </div>
      );
    }
  }));

  const SkeletonRow = () => (
    <div className="border-b border-gray-200 hover:bg-gray-50">
      <div className="grid grid-cols-12 gap-4 px-6 py-4">
        <div className="col-span-2">
          <div className="h-4 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="col-span-1">
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="col-span-1">
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="col-span-1">
          <div className="h-4 w-12 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="col-span-2">
          <div className="h-4 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="col-span-2">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="col-span-1">
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="col-span-1">
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="col-span-1">
          <div className="h-4 w-14 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen w-full bg-white">
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {onBack && (
                <Button variant="ghost" size="icon" className="mr-3" onClick={onBack}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-gray-600" />
                <h1 className="text-lg font-medium text-gray-900">
                  {incomingCallsFilter ? 'Llamadas Entrantes' : 'Historial de Llamadas'}
                </h1>
              </div>
            </div>
          </div>
        </div>
        <div className="py-12 text-center">
          <div className="mb-4 text-red-600">{error}</div>
          <Button onClick={batchId ? fetchCallLogs : fetchAllCallLogs} variant="outline">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {onBack && (
              <Button variant="ghost" size="icon" className="mr-3" onClick={onBack}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-gray-600" />
              <h1 className="text-lg font-medium text-gray-900">
                {incomingCallsFilter ? 'Llamadas Entrantes' : 'Historial de Llamadas'}
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-3"></div>
        </div>
      </div>

      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex flex-wrap items-center space-x-4">
          <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />

          {batchId && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">ID de Llamada en Lote</span>
              <div className="flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                <span className="max-w-48 truncate">{batchId}</span>
                <Button variant="ghost" size="sm" className="ml-2 h-4 w-4 p-0" onClick={removeBatchFilter}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          <CallHistoryFilters onFilterSelect={handleFilterSelect} hideTypeFilter={incomingCallsFilter} />
        </div>
      </div>

      {batchId && (
        <div className="border-b border-gray-200 bg-white px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('logs')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Registros de Llamadas
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === 'metrics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Panel de Métricas
            </button>
          </div>
        </div>
      )}

      <div className="p-6">
        {batchId && activeTab === 'metrics' ? (
          <MetricsDashboard callLogs={callLogs} />
        ) : (
          <>
            {loading ? (
              <div className="rounded-md border">
                <div className="border-b border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                    <div className="col-span-2">Hora</div>
                    <div className="col-span-1">Duración</div>
                    <div className="col-span-1">Tipo de Canal</div>
                    <div className="col-span-1">Costo</div>
                    <div className="col-span-2">ID de Sesión</div>
                    <div className="col-span-2">Razón de Finalización</div>
                    <div className="col-span-1">Estado de Sesión</div>
                    <div className="col-span-1">Sentimiento del Usuario</div>
                    <div className="col-span-1">De</div>
                  </div>
                </div>
                <div className="bg-white">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <SkeletonRow key={index} />
                  ))}
                </div>
              </div>
            ) : callLogs.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                {batchId
                  ? 'No se encontraron registros de llamadas para este lote'
                  : 'No hay registros de llamadas disponibles'}
              </div>
            ) : (
              <DataTable columns={enhancedColumns} data={callLogs} />
            )}
          </>
        )}
      </div>

      <CallDetailSheet call={selectedCall} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}

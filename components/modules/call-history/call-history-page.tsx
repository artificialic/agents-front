// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, X, ChevronLeft } from 'lucide-react';
import { DateRangePicker } from '@/components/date-range-picker';
import { DataTable } from '@/components/data-table';
import { columns, type CallLog } from './call-history-columns';
import CallDetailSheet from './call-detail-sheet';
import CallHistoryFilters from './call-history-filters';
import { MetricsDashboard } from '@/components/metrics-dashboard';
import { apiService } from '@/services';
import { applyCostMultiplier } from '@/utils';

interface CallHistoryPageProps {
  batchId?: string;
  multiplier: number;
  onBack?: () => void;
  incomingCallsFilter?: boolean;
}

interface Agent {
  agent_id: string;
  agent_name: string;
  version: number;
  is_published: boolean;
  language: string;
  voice_id: string;
}

export default function CallHistoryPage({ batchId, multiplier, onBack, incomingCallsFilter }: CallHistoryPageProps) {
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
  const [dynamicColumns, setDynamicColumns] = useState<any[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    pageSize: number;
    totalRows: number;
    pagination_key: string | undefined;
    hasNextPage: boolean;
    paginationHistory: string[];
  }>({
    page: 1,
    pageSize: 50,
    totalRows: 0,
    pagination_key: undefined,
    hasNextPage: false,
    paginationHistory: []
  });

  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [agentsError, setAgentsError] = useState<string | null>(null);
  const [dispositionsOptions, setDispositionsOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (batchId) {
      fetchCallLogs();
    } else {
      fetchAllCallLogs();
    }
  }, [batchId]);

  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);
      setAgentsError(null);

      const response = await apiService.getAgents();
      const agents = Array.isArray(response) ? response : response?.data ?? [];

      const agentMap = new Map<string, Agent>();

      agents.forEach((agent: Agent) => {
        const existingAgent = agentMap.get(agent.agent_id);
        if (!existingAgent || agent.version > existingAgent.version) {
          agentMap.set(agent.agent_id, agent);
        }
      });

      const latestVersionAgents = Array.from(agentMap.values());
      setAvailableAgents(latestVersionAgents);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgentsError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoadingAgents(false);
    }
  };

  const createDynamicColumns = (data: CallLog[]) => {
    const customFieldsSet = new Set<string>();
    const dispositionSet = new Set<string>();

    data.forEach((call) => {
      if (call.call_analysis?.custom_analysis_data) {
        Object.keys(call.call_analysis.custom_analysis_data).forEach((key) => {
          if (key !== 'tipificaciones') {
            customFieldsSet.add(key);
          }
        });

        const disposition = call.call_analysis.custom_analysis_data.tipificaciones;
        if (disposition && typeof disposition === 'string') {
          dispositionSet.add(disposition);
        }
      }
    });

    const newDynamicColumns = Array.from(customFieldsSet).map((fieldName) => ({
      accessorKey: `custom_${fieldName}`,
      header: fieldName,
      cell: ({ row }: any) => {
        const customData = row.original.call_analysis?.custom_analysis_data;
        const value = customData?.[fieldName];
        return <div className="text-sm text-gray-900">{value || '-'}</div>;
      }
    }));

    const dispositionOptionsArray = Array.from(dispositionSet)
      .sort()
      .map((disp) => ({ value: disp, label: disp }));

    setDynamicColumns(newDynamicColumns);
    setDispositionsOptions(dispositionOptionsArray);
  };

  const fetchCallLogs = async (filterCriteria?: any, paginationKey?: string) => {
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
        limit: pagination.pageSize
      };

      if (paginationKey) {
        requestBody.pagination_key = paginationKey;
      }

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
      const data = Array.isArray(response) ? response : response?.data ?? [];

      const mappedData = data.map((call) => {
        return {
          ...call,
          call_cost: call.call_cost
            ? {
                ...call.call_cost,
                combined_cost: applyCostMultiplier(call.call_cost.combined_cost, multiplier)
              }
            : call.call_cost
        };
      });

      setCallLogs(mappedData);
      createDynamicColumns(mappedData);

      const hasNextPage = data.length === pagination.pageSize;

      setPagination((prev) => ({
        ...prev,
        hasNextPage,
        totalRows: data.length
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching call logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCallLogs = async (filterCriteria?: any, paginationKey?: string) => {
    try {
      setLoading(true);
      setError(null);

      const requestBody: any = {
        filter_criteria: {
          ...(incomingCallsFilter ? { direction: ['inbound'] } : {}),
          ...(filterCriteria?.filter_criteria || {})
        },
        limit: pagination.pageSize,
        sort_order: 'descending'
      };

      if (paginationKey) {
        requestBody.pagination_key = paginationKey;
      }

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
      const data = Array.isArray(response) ? response : response?.data ?? [];

      const mappedData = data.map((call) => {
        const originalCost = call.call_cost?.combined_cost;
        const validCost = Number.isFinite(originalCost) ? originalCost : 0;
        const validMultiplier = Number.isFinite(multiplier) ? multiplier : 1;

        return {
          ...call,
          call_cost: call.call_cost
            ? {
                ...call.call_cost,
                combined_cost: validCost * validMultiplier
              }
            : call.call_cost
        };
      });

      setCallLogs(mappedData);
      createDynamicColumns(mappedData);

      const hasNextPage = data.length === pagination.pageSize;

      setPagination((prev) => ({
        ...prev,
        hasNextPage,
        totalRows: data.length
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching all call logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeBatchFilter = () => {};

  const handleDateRangeChange = (range: { from: Date | null; to: Date | null }) => {
    setDateRange(range);

    setPagination((prev) => ({
      ...prev,
      page: 1,
      pagination_key: undefined,
      paginationHistory: []
    }));

    if (batchId) {
      fetchCallLogs();
    } else {
      fetchAllCallLogs();
    }
  };

  const handleFilterSelect = (filterCriteria: any) => {
    setPagination((prev) => ({
      ...prev,
      page: 1,
      pagination_key: undefined,
      paginationHistory: []
    }));

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

  const handlePaginationChange = (page: number, pageSize: number) => {
    if (pageSize !== pagination.pageSize) {
      setPagination((prev) => ({
        ...prev,
        page: 1,
        pageSize,
        pagination_key: undefined,
        paginationHistory: []
      }));

      if (batchId) {
        fetchCallLogs();
      } else {
        fetchAllCallLogs();
      }
      return;
    }

    const isNextPage = page > pagination.page;
    const isPrevPage = page < pagination.page;

    if (isNextPage && callLogs.length > 0) {
      const lastCall = callLogs[callLogs.length - 1];
      const newPaginationKey = lastCall.call_id;

      const newHistory = [...pagination.paginationHistory];
      if (pagination.pagination_key) {
        newHistory.push(pagination.pagination_key);
      }

      setPagination((prev) => ({
        ...prev,
        page: page,
        pagination_key: newPaginationKey,
        paginationHistory: newHistory
      }));

      if (batchId) {
        fetchCallLogs(undefined, newPaginationKey);
      } else {
        fetchAllCallLogs(undefined, newPaginationKey);
      }
    } else if (isPrevPage && pagination.paginationHistory.length > 0) {
      const newHistory = [...pagination.paginationHistory];
      const prevPaginationKey = newHistory.pop();

      setPagination((prev) => ({
        ...prev,
        page: page,
        pagination_key: prevPaginationKey,
        paginationHistory: newHistory
      }));

      if (batchId) {
        fetchCallLogs(undefined, prevPaginationKey);
      } else {
        fetchAllCallLogs(undefined, prevPaginationKey);
      }
    } else if (isPrevPage && pagination.page === 2) {
      setPagination((prev) => ({
        ...prev,
        page: 1,
        pagination_key: undefined,
        paginationHistory: []
      }));

      if (batchId) {
        fetchCallLogs();
      } else {
        fetchAllCallLogs();
      }
    }
  };

  const enhancedColumns = [...columns, ...dynamicColumns].map((column) => {
    if (column.id === 'disposition' && dispositionsOptions.length > 0) {
      return {
        ...column,
        meta: {
          ...column.meta,
          options: dispositionsOptions
        },
        cell: (props: any) => {
          const originalCell = column.cell ? column.cell(props) : null;
          return (
            <div className="cursor-pointer" onClick={() => handleRowClick(props.row.original)}>
              {originalCell}
            </div>
          );
        }
      };
    }

    return {
      ...column,
      cell: (props: any) => {
        const originalCell = column.cell ? column.cell(props) : null;
        return (
          <div className="cursor-pointer" onClick={() => handleRowClick(props.row.original)}>
            {originalCell}
          </div>
        );
      }
    };
  });

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
    <div className="min-h-screen flex flex-col w-full bg-white">
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

      <div className="bg-bg-white-0 z-10 h-full rounded-md p-4 md:px-4 md:py-4">
        {batchId && activeTab === 'metrics' ? (
          <MetricsDashboard callLogs={callLogs} />
        ) : (
          <>
            {loading ? (
              <div className="overflow-x-auto">
                <div className="min-w-max rounded-md border">
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
              </div>
            ) : callLogs.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                {batchId
                  ? 'No se encontraron registros de llamadas para este lote'
                  : 'No hay registros de llamadas disponibles'}
              </div>
            ) : (
              <div className="h-full">
                <DataTable
                  serverPagination
                  sequentialPagination
                  showPagination
                  columns={enhancedColumns}
                  data={callLogs}
                  paginationInfo={{
                    page: pagination.page,
                    pageSize: pagination.pageSize,
                    totalRows: pagination.totalRows,
                    totalPages: pagination.hasNextPage ? pagination.page + 1 : pagination.page
                  }}
                  onPaginationChange={handlePaginationChange}
                  loading={loading}
                />
              </div>
            )}
          </>
        )}
      </div>

      <CallDetailSheet call={selectedCall} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}

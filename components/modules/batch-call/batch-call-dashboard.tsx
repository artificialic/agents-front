'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Phone, FileText, Trash2 } from 'lucide-react';
import { apiService } from '@/services';
import DeleteBatchCallDialog from './delete-batch-call-dialog';
import { DotsHorizontalIcon, PlusIcon, ReloadIcon } from '@radix-ui/react-icons';

interface BatchCall {
  id: string;
  name: string;
  status: 'Enviado' | 'Pendiente' | 'Fallido' | 'Programado';
  recipients: number;
  sent: number;
  pickedUp: number;
  successful: number;
  lastSentBy: string;
}

interface BatchCallDashboardProps {
  onCreateBatchCall: () => void;
  onViewCallHistory: (batchId: string) => void;
}

export default function BatchCallDashboard({ onCreateBatchCall, onViewCallHistory }: BatchCallDashboardProps) {
  const [batchCalls, setBatchCalls] = useState<BatchCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [batchCallToDelete, setBatchCallToDelete] = useState<BatchCall | null>(null);

  const fetchBatchCalls = async () => {
    try {
      setLoading(true);

      const response = await apiService.getBatchCalls();
      const rawData = Array.isArray(response) ? response : response?.data ?? [];

      const transformedData = rawData.map((call: any) => ({
        id: call.batch_call_id,
        name: call.name || '',
        status:
          call.status === 'sent'
            ? 'Enviado'
            : call.status === 'pending'
            ? 'Pendiente'
            : call.status === 'planned'
            ? 'Programado'
            : 'Fallido',
        recipients: call.total || 0,
        sent: call.sent || 0,
        pickedUp: call.picked_up || 0,
        successful: call.completed || 0,
        lastSentBy: call.last_sent_timestamp
          ? new Date(call.last_sent_timestamp)
              .toLocaleString('es-ES', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })
              .replace(',', '')
          : ''
      }));

      setBatchCalls(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      // eslint-disable-next-line no-console
      console.error('Error fetching batch calls:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchCalls();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Enviado':
        return 'bg-green-100 text-green-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Fallido':
        return 'bg-red-100 text-red-800';
      case 'Programado':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = (batchCall: BatchCall) => {
    setBatchCallToDelete(batchCall);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!batchCallToDelete) return;

    try {
      // eslint-disable-next-line no-console
      console.log('Deleting batch call:', batchCallToDelete.id);

      setBatchCalls((prev) => prev.filter((call) => call.id !== batchCallToDelete.id));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting batch call:', error);
    } finally {
      setDeleteDialogOpen(false);
      setBatchCallToDelete(null);
    }
  };

  return (
    <div className="w-full p-6">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div className="flex items-center">
            <Phone className="mr-2 h-5 w-5 text-gray-600" />
            <h1 className="text-lg font-medium text-gray-900">Llamada en Lote</h1>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={onCreateBatchCall}
              className="bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
              disabled={loading}
            >
              Crear una llamada en lote
            </Button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <ReloadIcon className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Cargando llamadas en lote...</span>
          </div>
        )}

        {error && !loading && (
          <div className="py-12 text-center">
            <div className="mb-4 text-red-600">{error}</div>
            <Button onClick={fetchBatchCalls} variant="outline">
              Reintentar
            </Button>
          </div>
        )}

        {!loading && !error && batchCalls.length === 0 && (
          <div className="py-12 text-center">
            <Phone className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">Aún no hay llamadas en lote</h3>
            <p className="mb-6 text-gray-500">Empieza creando tu primera llamada en lote</p>
            <Button onClick={onCreateBatchCall} className="bg-gray-900 text-white hover:bg-gray-800">
              <PlusIcon className="mr-2 h-4 w-4" />
              Crea tu primera llamada en lote
            </Button>
          </div>
        )}

        {!loading && !error && batchCalls.length > 0 && (
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 text-sm font-medium text-gray-700">
                  <div className="col-span-2">Nombre de Llamada en Lote</div>
                  <div className="col-span-1">Estado</div>
                  <div className="col-span-1">Destinatarios</div>
                  <div className="col-span-1">Enviadas</div>
                  <div className="col-span-1">Contestadas</div>
                  <div className="col-span-1">Exitosas</div>
                  <div className="col-span-3">Último envío</div>
                  <div className="col-span-2 text-right">Acciones</div>
                </div>
              </div>

              <div className="divide-y divide-gray-100 bg-white">
                {batchCalls.map((batchCall, index) => (
                  <div
                    key={batchCall.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="col-span-2 flex items-center">
                      <span className="text-sm text-gray-900">{batchCall.name || `Lote sin título ${index + 1}`}</span>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(
                          batchCall.status
                        )}`}
                      >
                        {batchCall.status}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <span className="text-sm text-gray-900">{batchCall.recipients}</span>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <span className="text-sm text-gray-900">{batchCall.sent}</span>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <span className={`text-sm ${batchCall.pickedUp > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                        {batchCall.pickedUp}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <span className={`text-sm ${batchCall.successful > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                        {batchCall.successful}
                      </span>
                    </div>
                    <div className="col-span-3 flex items-center">
                      <span className="text-sm text-gray-900">{batchCall.lastSentBy}</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50"
                        onClick={() => onViewCallHistory(batchCall.id)}
                      >
                        <FileText className="mr-1 h-4 w-4" />
                        Registros de Llamadas
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                            <DotsHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleDelete(batchCall)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <DeleteBatchCallDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          batchCall={batchCallToDelete}
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
}

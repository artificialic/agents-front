'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, RefreshCw, Phone, Clock } from 'lucide-react';
import { apiService } from '@/services';
import { ChevronLeftIcon, ReloadIcon } from '@radix-ui/react-icons';

interface CampaignContactsDashboardProps {
  campaignId: string;
  campaignName: string;
  onBack?: () => void;
}

interface ContactByCampaign {
  _id: string;
  campaignId: string;
  toNumber: string;
  fullName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  callId: string;
  processedAt: string;
}

export default function CampaignContactsDashboard({
  campaignId,
  campaignName,
  onBack
}: CampaignContactsDashboardProps) {
  const [contacts, setContacts] = useState<ContactByCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getContactsByCampaign(campaignId);
      const contactsData = Array.isArray(response) ? response : response?.data ?? [];

      setContacts(contactsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching campaign contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [campaignId]);

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
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getStatusStats = () => {
    const stats = contacts.reduce(
      (acc, contact) => {
        acc.total++;
        switch (contact.status) {
          case 'done':
            acc.completed++;
            break;
          case 'pending':
            acc.pending++;
            break;
          case 'failed':
            acc.failed++;
            break;
          case 'processing':
            acc.processing++;
            break;
        }
        return acc;
      },
      { total: 0, completed: 0, pending: 0, failed: 0, processing: 0 }
    );

    return stats;
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {onBack && (
              <Button variant="ghost" size="icon" className="mr-3" onClick={onBack}>
                <ChevronLeftIcon className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-gray-600" />
              <div>
                <h1 className="text-lg font-medium text-gray-900">Contactos de Campaña</h1>
                <p className="text-sm text-gray-500">{campaignName}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={fetchContacts} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="border-b border-gray-200 bg-gray-50 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Total</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Phone className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Completados</dt>
                    <dd className="text-lg font-medium text-green-600">{stats.completed}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Pendientes</dt>
                    <dd className="text-lg font-medium text-yellow-600">{stats.pending}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ReloadIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Procesando</dt>
                    <dd className="text-lg font-medium text-blue-600">{stats.processing}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-400">
                    <span className="text-xs font-bold text-white">!</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Fallidos</dt>
                    <dd className="text-lg font-medium text-red-600">{stats.failed}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <ReloadIcon className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Cargando contactos...</span>
          </div>
        )}

        {error && !loading && (
          <div className="py-12 text-center">
            <div className="mb-4 text-red-600">{error}</div>
            <Button onClick={fetchContacts} variant="outline">
              Reintentar
            </Button>
          </div>
        )}

        {!loading && !error && contacts.length === 0 && (
          <div className="py-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No hay contactos</h3>
            <p className="mb-6 text-gray-500">Esta campaña aún no tiene contactos agregados</p>
          </div>
        )}

        {!loading && !error && contacts.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Nombre Completo
                  </TableHead>
                  <TableHead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Número de Teléfono
                  </TableHead>
                  <TableHead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Estado
                  </TableHead>
                  <TableHead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                    ID de Llamada
                  </TableHead>
                  <TableHead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Fecha de Creación
                  </TableHead>
                  <TableHead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Procesado
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact._id} className="hover:bg-gray-50">
                    <TableCell className="py-4">
                      <span className="text-sm font-medium text-gray-900">{contact.fullName}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="font-mono text-sm text-gray-900">{contact.toNumber}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(
                          contact.status
                        )}`}
                      >
                        {getStatusText(contact.status)}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      {contact.callId ? (
                        <span className="font-mono text-sm text-xs text-gray-900">{contact.callId}</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-sm text-gray-900">{formatDate(contact.createdAt)}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      {contact.processedAt ? (
                        <span className="text-sm text-gray-900">{formatDate(contact.processedAt)}</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

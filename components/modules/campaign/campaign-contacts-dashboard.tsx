'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  Users,
  Loader2,
  RefreshCw,
  Phone,
  Clock,
  Eye,
  Download,
  Pencil,
  PlusIcon,
  Filter
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReloadIcon } from '@radix-ui/react-icons';
import { apiService } from '@/services';
import CallDetailSheet from '@/components/modules/call-history/call-detail-sheet';
import { useUserStore } from '@/stores/useUserStore';
import { applyCostMultiplier } from '@/utils';
import { formatDate } from '@/lib/utils';
import { DataTable } from '@/components/data-table';
import { createCampaignContactsColumns } from '@/components/modules/campaign/campaign-contacts-columns';
import CampaignReportDashboard from '@/components/modules/campaign/campaign-report-dashboard';

interface CampaignContactsDashboardProps {
  campaign: Campaign | null;
  contacts: ContactByCampaign[];
  loading: boolean;
  error: string | null;
  exportingCSV: boolean;
  callStatusFilter?: string;
  onBack?: () => void;
  onRefresh: () => void;
  onUpdateCampaign: (data: { name: string; status: Campaign['status'] }) => Promise<void>;
  onExportCSV: () => void;
  onCallStatusFilterChange?: (status: string) => void; 
}

interface ContactByCampaign {
  _id: string;
  campaignId: string;
  toNumber: string;
  status: string;
  callStatus?: string;
  disposition?: string;
  cost?: number;
  createdAt: string;
  updatedAt: string;
  callId: string;
  processedAt: string;
  callAnalysis?: {
    custom_analysis_data?: Record<string, any>;
    [key: string]: any;
  };
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  valueColor?: string;
}

function StatCard({ icon, label, value, valueColor = 'text-gray-900' }: StatCardProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">{icon}</div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="truncate text-sm font-medium text-gray-500">{label}</dt>
              <dd className={`text-lg font-medium ${valueColor}`}>{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CampaignContactsDashboard({
  campaign,
  contacts,
  loading,
  error,
  exportingCSV,
  callStatusFilter = 'all',
  onBack,
  onRefresh,
  onUpdateCampaign,
  onExportCSV,
  onCallStatusFilterChange 
}: CampaignContactsDashboardProps) {
  const router = useRouter();
  const getMultiplier = useUserStore((state) => state.getMultiplier);
  const [selectedCall, setSelectedCall] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loadingCall, setLoadingCall] = useState(false);
  const [dynamicFields, setDynamicFields] = useState<string[]>([]);

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', status: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const createDynamicColumnsData = (data: ContactByCampaign[]) => {
    const customFieldsSet = new Set<string>();
    data.forEach((contact) => {
      if (contact.callAnalysis?.custom_analysis_data) {
        Object.keys(contact.callAnalysis.custom_analysis_data).forEach((key) => {
          customFieldsSet.add(key);
        });
      }
    });
    setDynamicFields(Array.from(customFieldsSet));
  };

  useEffect(() => {
    if (contacts) {
      createDynamicColumnsData(contacts);
    }
  }, [contacts]);

  const handleViewContact = async (contact: ContactByCampaign) => {
    if (!contact.callId) return;
    try {
      setLoadingCall(true);
      const callData = await apiService.getCallById(contact.callId);
      setSelectedCall(callData);
      setIsSheetOpen(true);
    } catch (err) {
      console.error('Error fetching call details:', err);
    } finally {
      setLoadingCall(false);
    }
  };

  const handleEditCampaign = () => {
    if (!campaign) return;
    setEditForm({ name: campaign.name, status: campaign.status });
    setShowEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
  };

  const handleUpdateCampaign = async () => {
    try {
      setIsUpdating(true);
      await onUpdateCampaign(editForm as { name: string; status: Campaign['status'] });
      handleCloseEditDialog();
    } catch (err) {
      console.error('Error updating campaign:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusStats = () => {
    return (contacts || []).reduce(
      (acc, contact) => {
        acc.total++;

        const effectiveStatus = contact.callStatus || contact.status;

        switch (effectiveStatus) {
          case 'ended':
            acc.completed++;
            break;
          case 'registered':
          case 'pending':
            acc.pending++;
            break;
          case 'not_connected':
          case 'error':
            acc.failed++;
            break;
          case 'ongoing':
          case 'working':
          case 'processing':
            acc.processing++;
            break;
          case 'done':
            acc.completed++;
            break;
          case 'failed':
            acc.failed++;
            break;
        }
        return acc;
      },
      { total: 0, completed: 0, pending: 0, failed: 0, processing: 0 }
    );
  };

  const stats = getStatusStats();

  if (!campaign) {
    return null;
  }


  const columns = createCampaignContactsColumns({ dynamicFields, handleViewContact, loadingCall, contacts: contacts || [] });

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
              <Users className="mr-2 h-5 w-5 text-gray-600" />
              <div>
                <h1 className="text-lg font-medium text-gray-900">Contactos de Campaña</h1>
                <p className="text-sm text-gray-500">{campaign.name}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CampaignReportDashboard contacts={contacts || []} campaignName={campaign?.name || 'Campaña'} />
            <Button onClick={handleEditCampaign} variant="outline" size="sm" disabled={!campaign}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar Campaña
            </Button>
            <Button
              onClick={() => router.push(`/dashboard/campaign/${campaign._id}/contacts`)}
              variant="outline"
              size="sm"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Agregar Contactos
            </Button>
            <Button
              onClick={onExportCSV}
              variant="outline"
              size="sm"
              disabled={exportingCSV || (contacts || []).length === 0}
            >
              <Download className={`mr-2 h-4 w-4 ${exportingCSV ? 'animate-pulse' : ''}`} />
              Exportar CSV
            </Button>
            <Button onClick={onRefresh} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 bg-gray-50 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard icon={<Users className="h-6 w-6 text-gray-400" />} label="Total" value={stats.total} />
          <StatCard
            icon={<Phone className="h-6 w-6 text-green-400" />}
            label="Completados"
            value={stats.completed}
            valueColor="text-green-600"
          />
          <StatCard
            icon={<Clock className="h-6 w-6 text-yellow-400" />}
            label="Pendientes"
            value={stats.pending}
            valueColor="text-yellow-600"
          />
          <StatCard
            icon={<Loader2 className="h-6 w-6 text-blue-400" />}
            label="Procesando"
            value={stats.processing}
            valueColor="text-blue-600"
          />
          <StatCard
            icon={
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-400">
                <span className="text-xs font-bold text-white">!</span>
              </div>
            }
            label="Fallidos"
            value={stats.failed}
            valueColor="text-red-600"
          />
        </div>
      </div>

      <div className="px-6 pt-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Actualizando...</span>
          </div>
        )}

        {error && !loading && (
          <div className="py-12 text-center">
            <div className="mb-4 text-red-600">{error}</div>
            <Button onClick={onRefresh} variant="outline">
              Reintentar
            </Button>
          </div>
        )}

        {!loading && !error && (contacts || []).length === 0 && (
          <div className="py-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No hay contactos</h3>
            <p className="mb-6 text-gray-500">
              {callStatusFilter !== 'all'
                ? 'No se encontraron contactos con este estado de llamada'
                : 'Esta campaña aún no tiene contactos agregados'}
            </p>
            {callStatusFilter !== 'all' && (
              <Button onClick={() => onCallStatusFilterChange && onCallStatusFilterChange('all')} variant="outline">
                Ver todos los contactos
              </Button>
            )}
          </div>
        )}
      </div>

      {!loading && !error && (contacts || []).length > 0 && (
        <div className="px-6">
          <DataTable columns={columns} data={contacts} loading={loading} />
        </div>
      )}

      <CallDetailSheet call={selectedCall} open={isSheetOpen} onOpenChange={setIsSheetOpen} />

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Campaña</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Nombre
              </label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="status" className="text-right text-sm font-medium">
                Estado
              </label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="active">Activa</SelectItem>
                  <SelectItem value="paused">Pausada</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditDialog}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateCampaign} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
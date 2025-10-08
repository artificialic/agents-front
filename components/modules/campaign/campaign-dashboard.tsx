// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Pencil } from 'lucide-react';
import { apiService } from '@/services';
import { useRouter } from 'next/navigation';
import { DotsHorizontalIcon, PlusIcon, ReloadIcon } from '@radix-ui/react-icons';

interface Campaign {
  _id: string;
  name: string;
  owner: string;
  agentId: string;
  status: 'draft' | 'active' | 'completed' | 'paused';
  agentName?: string;
  createdAt: string;
  updatedAt: string;
}

interface CampaignDashboardProps {
  onCreateCampaign?: () => void;
}

export default function CampaignDashboard({ onCreateCampaign }: CampaignDashboardProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [editForm, setEditForm] = useState({ name: '', status: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getCampaignsByUser();
      const campaignsData = Array.isArray(response) ? response : response?.data ?? [];

      setCampaigns(campaignsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setEditForm({ name: campaign.name, status: campaign.status });
    setShowEditDialog(true);
  };

  const handleUpdateCampaign = async () => {
    if (!editingCampaign) return;

    try {
      setIsUpdating(true);
      await apiService.updateCampaign(editingCampaign._id, {
        name: editForm.name,
        status: editForm.status as Campaign['status']
      });

      await fetchCampaigns();
      handleCloseEditDialog();
    } catch (err) {
      console.error('Error updating campaign:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setEditingCampaign(null);
    setEditForm({ name: '', status: '' });
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

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

  return (
    <div className="w-full p-6">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-gray-600" />
            <h1 className="text-lg font-medium text-gray-900">Campañas</h1>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={onCreateCampaign}
              className="bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
              disabled={loading}
            >
              Crear campaña
            </Button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <ReloadIcon className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Cargando campañas...</span>
          </div>
        )}

        {error && !loading && (
          <div className="py-12 text-center">
            <div className="mb-4 text-red-600">{error}</div>
            <Button onClick={fetchCampaigns} variant="outline">
              Reintentar
            </Button>
          </div>
        )}

        {!loading && !error && campaigns.length === 0 && (
          <div className="py-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">Aún no hay campañas</h3>
            <p className="mb-6 text-gray-500">Empieza creando tu primera campaña</p>
            <Button onClick={onCreateCampaign} className="bg-gray-900 text-white hover:bg-gray-800">
              <PlusIcon className="mr-2 h-4 w-4" />
              Crea tu primera campaña
            </Button>
          </div>
        )}

        {!loading && !error && campaigns.length > 0 && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Nombre
                  </TableHead>
                  <TableHead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Agente
                  </TableHead>
                  <TableHead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Estado
                  </TableHead>
                  <TableHead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Fecha de Creación
                  </TableHead>
                  <TableHead className="bg-gray-50 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Última Actualización
                  </TableHead>
                  <TableHead className="bg-gray-50 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign._id} className="hover:bg-gray-50">
                    <TableCell className="py-4">
                      <span className="text-sm text-gray-900">{campaign.name}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-sm text-gray-900">{campaign.agentName ?? campaign.agentId}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(
                          campaign.status
                        )}`}
                      >
                        {getStatusText(campaign.status)}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-sm text-gray-900">{formatDate(campaign.createdAt)}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-sm text-gray-900">{formatDate(campaign.updatedAt)}</span>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                            <DotsHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => router.push(`/dashboard/campaign/${campaign._id}`)}
                            className="text-blue-600 focus:text-blue-600"
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Ver Contactos
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditCampaign(campaign)}
                            className="text-gray-600 focus:text-gray-600"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar Campaña
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/dashboard/campaign/${campaign._id}/contacts`)}
                            className="text-green-600 focus:text-green-600"
                          >
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Agregar Contactos
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

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

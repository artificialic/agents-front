'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { ReloadIcon } from '@radix-ui/react-icons';
import { apiService } from '@/services';
import { useUserStore } from '@/stores/useUserStore';
import { DataTable } from '@/components/data-table';
import { createCampaignColumns } from '@/components/modules/campaign/campaign-columns';

export default function CampaignPage() {
  const router = useRouter();
  const { user, loading: loadingProfile } = useUserStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleCreateCampaign = () => {
    router.push('/dashboard/create-campaign');
  };

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

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleViewCampaign = (campaignId: string) => {
    router.push(`/dashboard/campaign/${campaignId}`);
  };

  const columns = createCampaignColumns({ onViewCampaign: handleViewCampaign });

  return (
    <>
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {!loadingProfile && (!user?.paymentSource || user?.balance <= 0) && (
              <div className="mt-3 rounded-md border border-orange-200 bg-orange-50 p-3">
                <p className="text-sm text-orange-800">
                  <span className="font-semibold">Importante:</span> Puedes crear campañas y subir contactos, pero las
                  llamadas no se ejecutarán hasta que agregues un método de pago y tengas saldo disponible en la sección
                  de Facturación.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-full p-6">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <div className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-gray-600" />
              <h1 className="text-lg font-medium text-gray-900">Campañas</h1>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={handleCreateCampaign}
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
              <Button onClick={handleCreateCampaign} className="bg-gray-900 text-white hover:bg-gray-800">
                Crea tu primera campaña
              </Button>
            </div>
          )}

          {!loading && !error && campaigns.length > 0 && (
            <div className="p-4">
              <DataTable columns={columns} data={campaigns} loading={loading} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

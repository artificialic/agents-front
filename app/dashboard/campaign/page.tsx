'use client';

import { useRouter } from 'next/navigation';
import CampaignDashboard from '@/components/modules/campaign/campaign-dashboard';
import { useUserStore } from '@/stores/useUserStore';

export default function CampaignPage() {
  const router = useRouter();
  const { user, loading: loadingProfile } = useUserStore();

  const handleCreateCampaign = () => {
    router.push('/dashboard/create-campaign');
  };

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

      <CampaignDashboard onCreateCampaign={handleCreateCampaign} />
    </>
  );
}

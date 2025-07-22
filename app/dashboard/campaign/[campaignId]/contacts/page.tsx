'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CampaignContactsForm from '@/components/modules/campaign/campaign-contacts-form';
import { apiService } from '@/services';

export default function CampaignContactsPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.campaignId as string;
  const [campaignName, setCampaignName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaignDetails();
  }, [campaignId]);

  const fetchCampaignDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCampaignsByUser();
      const campaigns = Array.isArray(response) ? response : response?.data ?? [];
      const campaign = campaigns.find((c: any) => c._id === campaignId);

      if (campaign) {
        setCampaignName(campaign.name);
      } else {
        setCampaignName('Campaña no encontrada');
      }
    } catch (error) {
      console.error('Error fetching campaign details:', error);
      setCampaignName('Error al cargar campaña');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard/campaign');
  };

  const handleFormSubmit = () => {
    router.push('/dashboard/campaign');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center p-6">
      <CampaignContactsForm
        campaignId={campaignId}
        campaignName={campaignName}
        onBack={handleBack}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}

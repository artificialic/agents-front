'use client';

import CampaignForm from '@/components/modules/campaign/campaign-form';
import { useRouter } from 'next/navigation';
import { apiService } from '@/services';

export default function CreateCampaignPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/dashboard/campaign');
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      await apiService.createCampaign(formData);
      router.push('/dashboard/campaign');
    } catch (err) {
      console.error('Error creating campaign:', err);
      throw err;
    }
  };

  return (
    <div className="flex justify-center p-6">
      <CampaignForm onBack={handleBack} onSubmit={handleFormSubmit} />
    </div>
  );
}

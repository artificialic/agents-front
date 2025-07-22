'use client';

import { useRouter } from 'next/navigation';
import CampaignDashboard from '@/components/modules/campaign/campaign-dashboard';

export default function CampaignPage() {
  const router = useRouter();

  const handleCreateCampaign = () => {
    router.push('/dashboard/create-campaign');
  };

  return <CampaignDashboard onCreateCampaign={handleCreateCampaign} />;
}

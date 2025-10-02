'use client';

import { useEffect, useState } from 'react';
import CallHistoryPage from '@/components/modules/call-history/call-history-page';
import { apiService } from '@/services';

export default function IncomingCallsPageRoute() {
  const [multiplier, setMultiplier] = useState(1);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const response = await apiService.getProfile();
      const profileData = response?.data || response;
      if (profileData?.billingConfig?.multiplier) {
        setMultiplier(profileData.billingConfig.multiplier);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (loadingProfile) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }

  return <CallHistoryPage incomingCallsFilter={true} multiplier={multiplier} onBack={undefined} />;
}

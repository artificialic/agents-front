'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import CallHistoryPage from '@/components/modules/call-history/call-history-page';
import { useUserStore } from '@/stores/useUserStore';

export default function CallHistoryPageRoute() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const batchCallId = searchParams.get('batchCallId');
  const getMultiplier = useUserStore((state) => state.getMultiplier);

  const handleBack = () => {
    router.push('/dashboard/batch-call');
  };

  return (
    <CallHistoryPage
      batchId={batchCallId || undefined}
      multiplier={getMultiplier()}
      onBack={batchCallId ? handleBack : undefined}
    />
  );
}

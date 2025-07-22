'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import CallHistoryPage from '@/components/modules/call-history/call-history-page';

export default function CallHistoryPageRoute() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const batchCallId = searchParams.get('batchCallId');

  const handleBack = () => {
    router.push('/dashboard/batch-call');
  };

  return <CallHistoryPage batchId={batchCallId || undefined} onBack={batchCallId ? handleBack : undefined} />;
}

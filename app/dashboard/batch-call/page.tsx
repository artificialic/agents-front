'use client';

import { useRouter } from 'next/navigation';
import BatchCallDashboard from '@/components/modules/batch-call/batch-call-dashboard';

export default function HomePage() {
  const router = useRouter();

  const handleCreateBatchCall = () => {
    router.push('/dashboard/create-batch-call');
  };

  const handleViewCallHistory = (batchId: string) => {
    router.push(`/dashboard/call-history?batchCallId=${batchId}`);
  };

  return <BatchCallDashboard onCreateBatchCall={handleCreateBatchCall} onViewCallHistory={handleViewCallHistory} />;
}
